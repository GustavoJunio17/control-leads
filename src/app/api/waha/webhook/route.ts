import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processSofiaResponse } from '@/lib/ai/sofia'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const eventType = payload.event
    const sessionName = payload.session || 'default'

    if (eventType !== 'message.any') {
      return NextResponse.json({ success: true })
    }

    const { payload: messageData } = payload

    // Ignorar mensagens enviadas por nós
    if (messageData.fromMe) {
      return NextResponse.json({ success: true })
    }

    const wahaMessageId = messageData.id
    const phone = messageData.from
    const content = messageData.body
    const phoneClean = phone.split('@')[0]

    // --- DEDUPLICAÇÃO: ignorar se já processamos esta mensagem ---
    if (wahaMessageId) {
      const { data: existing } = await supabase
        .from('messages')
        .select('id')
        .eq('waha_message_id', wahaMessageId)
        .maybeSingle()

      if (existing) {
        console.log(`[Webhook] Mensagem ${wahaMessageId} já processada, ignorando.`)
        return NextResponse.json({ success: true })
      }
    }

    console.log(`[Webhook] Processando mensagem ${wahaMessageId} de ${phoneClean}`)

    // --- CLINIC ---
    let { data: session } = await supabase
      .from('whatsapp_sessions')
      .select('clinic_id')
      .eq('session_name', sessionName)
      .maybeSingle()

    let clinicId = session?.clinic_id

    if (!clinicId) {
      const { data: firstClinic } = await supabase
        .from('clinics').select('id').limit(1).single()
      if (!firstClinic) {
        return NextResponse.json({ success: false, error: 'No clinic' }, { status: 400 })
      }
      clinicId = firstClinic.id
    }

    // --- LEAD: buscar por telefone limpo, criar se não existir (com upsert para evitar race condition) ---
    let realPhone = phoneClean
    try {
      const wahaUrl = process.env.WAHA_API_URL || 'http://localhost:3002'
      const apiKey = process.env.WAHA_API_KEY || '30e724584f1a4382ac9a23f5e1262ed3'
      const contactRes = await fetch(
        `${wahaUrl}/api/contacts?session=${sessionName}&contactId=${encodeURIComponent(phone)}`,
        { headers: { 'X-Api-Key': apiKey } }
      )
      if (contactRes.ok) {
        const contact = await contactRes.json()
        if (contact.number) realPhone = contact.number
      }
    } catch (e) {
      console.warn('[Webhook] Falha ao resolver contato WAHA:', e)
    }

    // Upsert: cria se não existir, não faz nada se já existir (graças ao unique constraint)
    await supabase
      .from('leads')
      .upsert(
        [{ clinic_id: clinicId, phone: realPhone, name: 'Paciente Novo', registered: false, registration_step: 0 }],
        { onConflict: 'clinic_id,phone', ignoreDuplicates: true }
      )

    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('phone', realPhone)
      .single()

    if (!lead) {
      console.error('[Webhook] Não foi possível encontrar/criar lead para', realPhone)
      return NextResponse.json({ success: false, error: 'Lead error' }, { status: 500 })
    }

    // --- CONVERSA ---
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', lead.id)
      .neq('status', 'closed')
      .maybeSingle()

    if (!conversation) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert([{ clinic_id: clinicId, lead_id: lead.id, status: 'bot_handling' }])
        .select()
        .single()
      conversation = newConv
    }

    // --- MENSAGEM (com waha_message_id para garantir idempotência) ---
    const { error: msgError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversation.id,
        direction: 'inbound',
        content,
        sent_by: 'lead',
        waha_message_id: wahaMessageId ?? null
      }])

    // Se deu unique violation, já foi processado por outro request simultâneo
    if (msgError) {
      if (msgError.code === '23505') {
        console.log(`[Webhook] Race condition detectada para ${wahaMessageId}, ignorando.`)
        return NextResponse.json({ success: true })
      }
      console.error('[Webhook] Erro ao inserir mensagem:', msgError.message)
    }

    // --- SOFIA ---
    if (conversation.status === 'bot_handling') {
      console.log(`[Webhook] Disparando Sofia para Lead ${lead.phone}`)
      processSofiaResponse(clinicId, conversation.id, lead.id, realPhone, content)
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[Webhook Error]', err)
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 })
  }
}
