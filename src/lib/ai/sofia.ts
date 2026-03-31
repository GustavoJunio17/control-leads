import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const WAHA_URL = process.env.WAHA_API_URL || 'http://localhost:3002'

async function sendWhatsApp(phone: string, text: string, session = 'default') {
  const chatId = phone.includes('@') ? phone : `${phone}@c.us`
  const res = await fetch(`${WAHA_URL}/api/sendText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': process.env.WAHA_API_KEY || '30e724584f1a4382ac9a23f5e1262ed3'
    },
    body: JSON.stringify({ chatId, text, session })
  })
  if (!res.ok) console.error(`[Sofia] Erro WAHA: ${await res.text()}`)
}

async function saveMessage(conversationId: string, content: string) {
  await supabase.from('messages').insert([{
    conversation_id: conversationId,
    direction: 'outbound',
    content,
    sent_by: 'bot'
  }])
}

async function send(conversationId: string, phone: string, text: string) {
  await sendWhatsApp(phone, text)
  await saveMessage(conversationId, text)
}

async function updateLead(leadId: string, data: Record<string, any>) {
  const { error } = await supabase.from('leads').update(data).eq('id', leadId)
  if (error) console.error('[Sofia] Erro ao atualizar lead:', error.message)
}

async function fetchCep(cep: string) {
  try {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return null
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.erro) return null
    return { city: data.localidade, state: data.uf, country: 'Brasil', street: data.logradouro || '' }
  } catch { return null }
}

function isValidCpf(cpf: string) { return cpf.replace(/\D/g, '').length === 11 }
function isValidDate(date: string) { return /^\d{2}\/\d{2}\/\d{4}$/.test(date.trim()) }
function isValidCep(cep: string) { return /^\d{5}-?\d{3}$/.test(cep.trim()) }

async function handleRegistration(
  conversationId: string,
  leadId: string,
  leadPhone: string,
  step: number,
  userMessage: string
) {
  const input = userMessage.trim()

  if (step === 0) {
    await updateLead(leadId, { registration_step: 1 })
    await send(conversationId, leadPhone,
      `Olá! 👋 Seja bem-vindo(a)!\n\nSou a assistente virtual da clínica. Para te atender, preciso fazer um breve cadastro.\n\n📝 *Qual é o seu nome completo?*`)
    return
  }
  if (step === 1) {
    await updateLead(leadId, { name: input, registration_step: 2 })
    await send(conversationId, leadPhone,
      `Obrigado, *${input.split(' ')[0]}*! 😊\n\n🪪 *Qual é o seu CPF?*\n_(somente números ou com pontos e traço)_`)
    return
  }
  if (step === 2) {
    if (!isValidCpf(input)) {
      await send(conversationId, leadPhone, `⚠️ CPF inválido. Informe um CPF com 11 dígitos.\n\nExemplo: *123.456.789-00*`)
      return
    }
    await updateLead(leadId, { cpf: input.replace(/\D/g, ''), registration_step: 3 })
    await send(conversationId, leadPhone, `📅 *Qual é a sua data de nascimento?*\n\nFormato: *dd/mm/aaaa*`)
    return
  }
  if (step === 3) {
    if (!isValidDate(input)) {
      await send(conversationId, leadPhone, `⚠️ Data inválida. Use o formato *dd/mm/aaaa*.\n\nExemplo: *15/03/1990*`)
      return
    }
    await updateLead(leadId, { birth_date: input.trim(), registration_step: 4 })
    await send(conversationId, leadPhone, `📮 *Qual é o seu CEP?*`)
    return
  }
  if (step === 4) {
    if (!isValidCep(input)) {
      await send(conversationId, leadPhone, `⚠️ CEP inválido.\n\nExemplo: *01310-100*`)
      return
    }
    const cepData = await fetchCep(input)
    if (!cepData) {
      await send(conversationId, leadPhone, `⚠️ Não encontrei esse CEP. Verifique e tente novamente.`)
      return
    }
    await updateLead(leadId, { cep: input.replace(/\D/g, ''), city: cepData.city, state: cepData.state, country: cepData.country, registration_step: 5 })
    const streetHint = cepData.street ? ` (${cepData.street})` : ''
    await send(conversationId, leadPhone, `📍 *${cepData.city} - ${cepData.state}*\n\n🏠 *Informe seu endereço completo*${streetHint}:\n_(Rua, número e complemento)_`)
    return
  }
  if (step === 5) {
    await updateLead(leadId, { address: input, registered: true, registration_step: 6 })
    const { data: updated } = await supabase.from('leads').select('name, city, state').eq('id', leadId).single()
    const firstName = (updated?.name ?? 'paciente').split(' ')[0]
    await send(conversationId, leadPhone,
      `✅ *Cadastro concluído!*\n\nBem-vindo(a), *${firstName}*! 🎉\n📍 *${updated?.city} - ${updated?.state}*\n\nAgora posso te ajudar. O que você precisa hoje?`)
    return
  }
}

// Tenta salvar agendamento a partir do marcador [AGENDAR:...]
async function tryCreateAppointment(clinicId: string, leadId: string, marker: string) {
  try {
    // Formato: [AGENDAR:procedure_id=X|date=YYYY-MM-DD|time=HH:MM]
    const inner = marker.replace('[AGENDAR:', '').replace(']', '')
    const parts = Object.fromEntries(inner.split('|').map(p => p.split('=')))
    const { procedure_id, date, time } = parts

    if (!procedure_id || !date || !time) return

    const { data: procedure } = await supabase
      .from('procedures')
      .select('id, duration_minutes')
      .eq('id', procedure_id)
      .single()

    if (!procedure) return

    // Encontrar profissional disponível para este procedimento no horário
    // Por ora, usar o primeiro profissional ativo da clínica
    const { data: professional } = await supabase
      .from('professionals')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (!professional) return

    const startTime = new Date(`${date}T${time}:00`)
    const endTime = new Date(startTime.getTime() + (procedure.duration_minutes ?? 60) * 60000)

    const { error } = await supabase.from('appointments').insert([{
      clinic_id: clinicId,
      lead_id: leadId,
      professional_id: professional.id,
      procedure_id: procedure.id,
      status: 'confirmed',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    }])

    if (error) console.error('[Sofia] Erro ao criar agendamento:', error.message)
    else console.log(`[Sofia] Agendamento criado: ${date} ${time}`)
  } catch (e) {
    console.error('[Sofia] Erro ao processar marcador de agendamento:', e)
  }
}

export async function processSofiaResponse(
  clinicId: string,
  conversationId: string,
  leadId: string,
  leadPhone: string,
  userMessage: string
) {
  try {
    console.log(`[Sofia] Iniciando para conversa ${conversationId}, lead ${leadPhone}`)

    const { data: lead } = await supabase
      .from('leads')
      .select('id, name, registered, registration_step, cpf, birth_date, cep, address, city, state')
      .eq('id', leadId)
      .single()

    if (!lead) { console.error('[Sofia] Lead não encontrado:', leadId); return }

    if (!lead.registered) {
      await handleRegistration(conversationId, leadId, leadPhone, lead.registration_step ?? 0, userMessage)
      return
    }

    if (!process.env.GEMINI_API_KEY) { console.error('[Sofia] GEMINI_API_KEY não configurada!'); return }

    const { data: settings } = await supabase.from('ai_settings').select('*').eq('clinic_id', clinicId).single()
    if (!settings?.active) { console.log('[Sofia] IA inativa'); return }

    // Buscar procedimentos disponíveis para incluir no contexto
    const { data: procedures } = await supabase
      .from('procedures')
      .select('id, name, duration_minutes, price')
      .eq('clinic_id', clinicId)

    const proceduresList = procedures?.map(p =>
      `- ID: ${p.id} | ${p.name} | ${p.duration_minutes}min | R$${p.price}`
    ).join('\n') ?? 'Nenhum procedimento cadastrado'

    // Buscar próximos dias disponíveis por profissional
    const { data: schedules } = await supabase
      .from('professional_schedules')
      .select('*, professionals(name, role)')
      .eq('active', true)

    const availabilityText = schedules && schedules.length > 0
      ? schedules.map((s: any) => {
          const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
          return `- ${s.professionals?.name} (${s.professionals?.role}): ${days[s.day_of_week]} das ${s.start_time} às ${s.end_time}`
        }).join('\n')
      : 'Horários a definir com a clínica'

    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    const { data: history } = await supabase
      .from('messages')
      .select('content, direction')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10)

    const chatHistory = history?.reverse().map(m => ({
      role: m.direction === 'inbound' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })) || []

    const systemPrompt = `Você é ${settings.assistant_name}, assistente virtual de uma clínica odontológica.
Instruções: ${settings.base_prompt}
Tom de voz: ${settings.tone}.
Data de hoje: ${today}

DADOS DO PACIENTE (não peça novamente):
- Nome: ${lead.name}
- Telefone: já registrado via WhatsApp
- CPF: ${lead.cpf ?? 'registrado'}
- Nascimento: ${lead.birth_date ?? 'registrado'}
- Endereço: ${lead.address ?? 'registrado'}, ${lead.city ?? ''} - ${lead.state ?? ''}

PROCEDIMENTOS DISPONÍVEIS:
${proceduresList}

DISPONIBILIDADE DOS PROFISSIONAIS:
${availabilityText}

REGRA IMPORTANTE PARA AGENDAMENTOS:
Quando o paciente CONFIRMAR um agendamento, adicione EXATAMENTE ao final da sua mensagem (sem mostrar ao paciente visualmente como código):
[AGENDAR:procedure_id=ID_DO_PROCEDIMENTO|date=AAAA-MM-DD|time=HH:MM]

Use o ID exato do procedimento da lista acima. Use a data no formato AAAA-MM-DD e hora no formato HH:MM.
Não mencione esse marcador na conversa — ele é invisível para o paciente.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [
            ...chatHistory,
            { role: 'user', parts: [{ text: userMessage }] }
          ],
          generationConfig: { temperature: 0.7 }
        })
      }
    )

    if (!response.ok) throw new Error(`Gemini API Error ${response.status}: ${await response.text()}`)

    const aiData = await response.json()
    let aiMessage = aiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiMessage) { console.error('[Sofia] Gemini sem resposta:', JSON.stringify(aiData)); return }

    // Extrair e processar marcador de agendamento antes de enviar
    const appointmentMatch = aiMessage.match(/\[AGENDAR:[^\]]+\]/)
    if (appointmentMatch) {
      await tryCreateAppointment(clinicId, leadId, appointmentMatch[0])
      aiMessage = aiMessage.replace(appointmentMatch[0], '').trim()
    }

    await send(conversationId, leadPhone, aiMessage)
    console.log(`[Sofia] Resposta enviada: ${aiMessage.substring(0, 60)}...`)

  } catch (error) {
    console.error('[Sofia Error]', error)
  }
}
