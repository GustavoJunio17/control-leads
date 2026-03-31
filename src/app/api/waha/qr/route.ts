import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sessionName = searchParams.get('session_name')
  if (!sessionName) {
    return new NextResponse('Session missing', { status: 400 })
  }

  const wahaUrl = process.env.WAHA_API_URL || 'http://127.0.0.1:3002'
  const apiKey = process.env.WAHA_API_KEY || '30e724584f1a4382ac9a23f5e1262ed3'

  try {
    // 1. Aguardar um pouco antes da primeira tentativa para o motor respirar
    console.log(`[QR Proxy] Iniciando busca para ${sessionName}. Aguardando 3s iniciais...`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    let attempts = 0;
    const maxAttempts = 30; // ~60 segundos total
    
    while (attempts < maxAttempts) {
      try {
        // 1. Verificar o status da sessão (Caminho com /sessions/ conforme validado no curl)
        const statusRes = await fetch(`${wahaUrl}/api/sessions/${sessionName}`, {
          headers: { 'X-Api-Key': apiKey }
        });
        
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const status = statusData.status || '';
          
          if (status === 'WORKING' || status === 'AUTHENTICATED') {
            console.log(`[QR Proxy] Sessão ${sessionName} já está ativa!`);
            return new NextResponse('Sessão Conectada', { status: 200 });
          }

          // 2. Tentar obter o QR Code (Caminho final conforme teste do usuário)
          const qrRes = await fetch(`${wahaUrl}/api/${sessionName}/auth/qr`, {
            headers: { 'X-Api-Key': apiKey }
          });
          
          if (qrRes.ok) {
            const contentType = qrRes.headers.get('content-type');
            
            // Se retornar uma imagem direta (PNG), repassamos ela
            if (contentType && contentType.includes('image')) {
              console.log(`[QR Proxy] QR Image recebida diretamente!`);
              const arrayBuffer = await qrRes.arrayBuffer();
              return new NextResponse(arrayBuffer, {
                headers: {
                  'Content-Type': contentType,
                  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                }
              });
            }

            // Se retornar JSON (fallback), a documentação diz que o campo é 'value'
            const qrData = await qrRes.json().catch(() => ({}));
            const qrValue = qrData.value || qrData.qr; // Aceita ambos por segurança
            
            if (qrValue) {
               console.log(`[QR Proxy] QR String encontrada ('${qrValue.substring(0, 10)}...')`);
               const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrValue)}`;
               const imageRes = await fetch(qrImageUrl);
               if (imageRes.ok) {
                 const arrayBuffer = await imageRes.arrayBuffer();
                 return new NextResponse(arrayBuffer, {
                   headers: {
                     'Content-Type': 'image/png',
                     'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                   }
                 });
               }
            }
          } else if (qrRes.status === 404) {
            console.log(`[QR Proxy] QR ainda não disponível (404), tentando novamente...`);
          }
        }
      } catch (e) {
        console.error(`[QR Proxy] Erro na tentativa ${attempts + 1}:`, e);
      }
      
      attempts++;
      console.log(`[QR Proxy] Aguardando QR Real da sessão ${sessionName}... (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.error(`[QR Proxy] Tempo esgotado (60s) sem sinal de QR ou Autenticação.`);
    return new NextResponse('QR Code ainda não disponível.', { status: 404 });
  } catch (error) {
    return new NextResponse('Failed to fetch QR', { status: 500 })
  }
}
