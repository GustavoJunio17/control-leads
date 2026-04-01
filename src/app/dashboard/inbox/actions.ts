'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createSupabaseAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const WAHA_URL = process.env.WAHA_API_URL || 'http://localhost:3002'
const WAHA_API_KEY = process.env.WAHA_API_KEY || '30e724584f1a4382ac9a23f5e1262ed3'

export async function fetchConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Buscar clínica do usuário
  const { data: clinicUser } = await supabaseAdmin
    .from('clinic_users')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  if (!clinicUser || !clinicUser.clinic_id) return []

  // Buscar conversas com os dados do lead e a última mensagem
  const { data: conversations, error } = await supabaseAdmin
    .from('conversations')
    .select(`
      *,
      leads (
        id,
        name,
        phone,
        email,
        cpf,
        birth_date,
        address,
        city,
        state,
        cep
      ),
      messages (
        content,
        created_at,
        direction
      )
    `)
    .eq('clinic_id', clinicUser.clinic_id)
    .order('last_message_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }

  // Pegar apenas a última mensagem de cada conversa para a lista
  return conversations.map((conv: any) => ({
    ...conv,
    lastMessage: conv.messages[conv.messages.length - 1] || null
  }))
}

export async function fetchMessages(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: messages, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return messages
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Buscar a conversa e o telefone do lead
  const { data: conversation } = await supabaseAdmin
    .from('conversations')
    .select('*, leads(phone)')
    .eq('id', conversationId)
    .single()

  if (!conversation) throw new Error('Conversation not found')

  const leadPhone = (conversation.leads as any).phone

  // Determinar o chatId correto
  // Se já tem @, usar direto; senão, tentar @lid primeiro (formato LID confirmado)
  const chatId = leadPhone.includes('@') ? leadPhone : `${leadPhone}@lid`

  // 2. Enviar via WAHA
  try {
    console.log(`[SendMessage] Enviando para chatId=${chatId} via WAHA...`)
    
    let wahaRes = await fetch(`${WAHA_URL}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': WAHA_API_KEY
      },
      body: JSON.stringify({
        chatId,
        text: content,
        session: 'default'
      })
    })

    // Se falhou com @lid, tentar com @c.us
    if (!wahaRes.ok && !leadPhone.includes('@')) {
      const fallbackChatId = `${leadPhone}@c.us`
      console.log(`[SendMessage] @lid falhou (${wahaRes.status}), tentando ${fallbackChatId}...`)
      wahaRes = await fetch(`${WAHA_URL}/api/sendText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': WAHA_API_KEY
        },
        body: JSON.stringify({
          chatId: fallbackChatId,
          text: content,
          session: 'default'
        })
      })
    }

    if (!wahaRes.ok) {
        const err = await wahaRes.text()
        console.error(`[WAHA Error] Status: ${wahaRes.status}, Body:`, err)
        throw new Error('Falha ao enviar mensagem via WhatsApp.')
    }

    // Tratar resposta (pode ser vazia ou JSON)
    const responseText = await wahaRes.text()
    console.log('[SendMessage] WAHA respondeu OK:', responseText.substring(0, 100) || '(vazio)')

    // 3. Salvar no banco
    await supabaseAdmin
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        direction: 'outbound',
        content,
        sent_by: user.id
      }])

    // 4. Atualizar o timestamp da conversa
    await supabaseAdmin
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    revalidatePath('/dashboard/inbox')
    return { success: true }
  } catch (e: any) {
    console.error(e)
    throw new Error(e.message || 'Erro interno ao enviar.')
  }
}

export async function toggleAiStatus(conversationId: string, newStatus: 'bot_handling' | 'human_handled') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabaseAdmin
    .from('conversations')
    .update({ status: newStatus })
    .eq('id', conversationId)

  revalidatePath('/dashboard/inbox')
  return { success: true }
}

export async function fetchLeadById(leadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (error) {
    console.error('Error fetching lead:', error)
    return null
  }

  return lead
}
