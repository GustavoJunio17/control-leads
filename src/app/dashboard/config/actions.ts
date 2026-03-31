'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function generateWahaTicket() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const supabaseAdmin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: clinicUser } = await supabaseAdmin
    .from('clinic_users')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!clinicUser) throw new Error("Sua conta não tem uma clínica associada.")
  // O WAHA Core (Versão Grátis) não aceita sessões customizadas, então para o MVP precisamos enviar a string mágica 'default'
  const sessionName = 'default'

  const wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3002'
  
  const apiKey = process.env.WAHA_API_KEY || '30e724584f1a4382ac9a23f5e1262ed3'
  
  try {
    // 1. Configurar e Iniciar a sessão (Endpoint Unificado WAHA Core 2025)
    // Este endpoint cria a sessão se não existir e a inicia se estiver parada.
    // Detectar a porta atual do servidor para o webhook (essencial para dev local)
    const host = (await headers()).get('host') || 'localhost:3000'
    const currentPort = host.split(':')[1] || '3000'
    const webhookUrl = `http://host.docker.internal:${currentPort}/api/waha/webhook`

    console.log(`[WAHA] Configurando webhook para: ${webhookUrl}`)
    
    const startRes = await fetch(`${wahaUrl}/api/sessions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      },
      body: JSON.stringify({
        name: sessionName,
        start: true,
        config: {
          webhooks: [
            {
              url: webhookUrl,
              events: ['message.any', 'session.status']
            }
          ]
        }
      })
    })

    if (!startRes.ok) {
      const errorText = await startRes.text()
      console.warn(`[WAHA] Erro ao iniciar sessão: ${startRes.status} - ${errorText}`)
    } else {
      console.log(`[WAHA] Comando 'start' enviado com sucesso para ${sessionName}.`)
    }
  } catch (e) {
    console.warn("WAHA offline ou erro na configuração da sessão.", e)
  }

  const { data: existingSession } = await supabaseAdmin
    .from('whatsapp_sessions')
    .select('id')
    .eq('clinic_id', clinicUser.clinic_id)
    .maybeSingle()

  let error;
  if (existingSession) {
    const res = await supabaseAdmin
      .from('whatsapp_sessions')
      .update({ session_name: sessionName, status: 'CONNECTED' })
      .eq('id', existingSession.id)
    error = res.error
  } else {
    const res = await supabaseAdmin
      .from('whatsapp_sessions')
      .insert([{ clinic_id: clinicUser.clinic_id, session_name: sessionName, status: 'CONNECTED' }])
    error = res.error
  }

  if (error) {
    console.error(error)
    throw new Error("Erro ao conectar no banco de dados.")
  }

  revalidatePath('/dashboard/config')
  return { success: true, sessionName }
}

export async function saveAiSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const supabaseAdmin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: clinicUser } = await supabaseAdmin
    .from('clinic_users')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!clinicUser) throw new Error("Sua conta não tem uma clínica associada.")

  const assistant_name = formData.get('assistant_name') as string
  const base_prompt = formData.get('base_prompt') as string
  const tone = formData.get('tone') as string

  const { error } = await supabaseAdmin
    .from('ai_settings')
    .upsert({
      clinic_id: clinicUser.clinic_id,
      assistant_name,
      base_prompt,
      tone,
      active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'clinic_id' })

  if (error) {
    console.error(error)
    throw new Error("Erro ao salvar o cérebro da IA.")
  }

  revalidatePath('/dashboard/config')
  return { success: true }
}

export async function getInitialSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const supabaseAdmin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: clinicUser } = await supabaseAdmin
    .from('clinic_users')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!clinicUser) return null

  const { data: session } = await supabaseAdmin
    .from('whatsapp_sessions')
    .select('session_name, status')
    .eq('clinic_id', clinicUser.clinic_id)
    .maybeSingle()

  return session
}

export async function disconnectWahaSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const supabaseAdmin = createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: clinicUser } = await supabaseAdmin
    .from('clinic_users')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!clinicUser) throw new Error("Sua conta não tem uma clínica associada.")

  const wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3002'
  const apiKey = process.env.WAHA_API_KEY || '30e724584f1a4382ac9a23f5e1262ed3'

  // 1. Logout do WhatsApp (desvincula o número)
  try {
    await fetch(`${wahaUrl}/api/sessions/default/logout`, {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey }
    })
  } catch (e) {
    console.warn("[WAHA] Logout falhou (pode já estar deslogado):", e)
  }

  // 2. Para a sessão
  const stopRes = await fetch(`${wahaUrl}/api/sessions/default/stop`, {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey }
  })
  if (!stopRes.ok) {
    console.warn(`[WAHA] Stop retornou ${stopRes.status}: ${await stopRes.text()}`)
  }

  // 3. Deleta a sessão
  const deleteRes = await fetch(`${wahaUrl}/api/sessions/default`, {
    method: 'DELETE',
    headers: { 'X-Api-Key': apiKey }
  })
  if (!deleteRes.ok) {
    const errText = await deleteRes.text()
    console.error(`[WAHA] Falha ao deletar sessão: ${deleteRes.status} - ${errText}`)
    throw new Error(`Falha ao deletar sessão no WAHA: ${deleteRes.status}`)
  }

  // Atualiza status no banco
  await supabaseAdmin
    .from('whatsapp_sessions')
    .update({ status: 'DISCONNECTED' })
    .eq('clinic_id', clinicUser.clinic_id)

  revalidatePath('/dashboard/config')
  return { success: true }
}

export async function getWahaStatus(sessionName: string) {
  const wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3002'
  const apiKey = process.env.WAHA_API_KEY || '30e724584f1a4382ac9a23f5e1262ed3'

  try {
    const res = await fetch(`${wahaUrl}/api/sessions/${sessionName}`, {
      headers: { 'X-Api-Key': apiKey },
      next: { revalidate: 0 } // Desabilitar cache para status
    })

    if (res.ok) {
      const data = await res.json()
      return data.status // ex: 'WORKING', 'SCAN_QR_CODE', 'STOPPED'
    }
  } catch (e) {
    console.warn("Erro ao buscar status no WAHA:", e)
  }
  return 'OFFLINE'
}
