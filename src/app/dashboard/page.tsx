import { Users, UserCheck, CalendarPlus, Activity, Bot } from "lucide-react"
import { createClient, getUserRole } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import Link from "next/link"
import { redirect } from "next/navigation"

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getClinicId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: clinicUser } = await supabaseAdmin
    .from('clinic_users')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  return clinicUser?.clinic_id ?? null
}

export default async function DashboardPage() {
  const role = await getUserRole()
  
  if (role !== 'admin') {
    redirect('/dashboard/inbox')
  }

  const clinicId = await getClinicId()

  if (!clinicId) {
    return <p className="text-slate-500">Clínica não encontrada.</p>
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [
    { count: totalLeads },
    { count: leadsAgendados },
    { count: agendamentosHoje },
    { count: pacientesAtivos },
    { count: conversasBot },
    { count: conversasHumano },
    { data: atencaoNecessaria },
  ] = await Promise.all([
    supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId),

    supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('funnel_stage', 'Agendado'),

    supabaseAdmin
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString()),

    supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .neq('funnel_stage', 'Novo'),

    supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .eq('status', 'bot_handling'),

    supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .in('status', ['human_handled', 'human_waiting']),

    supabaseAdmin
      .from('conversations')
      .select('id, last_message_at, leads(name)')
      .eq('clinic_id', clinicId)
      .eq('status', 'human_waiting')
      .order('last_message_at', { ascending: false })
      .limit(5),
  ])

  const taxaConversao = totalLeads && totalLeads > 0
    ? ((leadsAgendados ?? 0) / totalLeads * 100).toFixed(1)
    : '0.0'

  const totalConversas = (conversasBot ?? 0) + (conversasHumano ?? 0)
  const pctBot = totalConversas > 0 ? Math.round((conversasBot ?? 0) / totalConversas * 100) : 0
  const pctHumano = 100 - pctBot

  const isBotAtivo = conversasBot && conversasBot > 0

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h2>
        <div className="flex items-center space-x-2">
          <span className={`flex h-3 w-3 rounded-full ${isBotAtivo ? 'bg-green-500' : 'bg-slate-300'}`}></span>
          <span className="text-sm font-medium text-slate-600">Bot {isBotAtivo ? 'Ativo' : 'Inativo'} (Sofia)</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total de Leads</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{(totalLeads ?? 0).toLocaleString('pt-BR')}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Cadastrados na clínica</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Taxa de Conversão</h3>
            <Activity className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{taxaConversao}%</p>
          <p className="text-xs text-slate-500 font-medium mt-1">{leadsAgendados ?? 0} leads agendados</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Agendamentos Hoje</h3>
            <CalendarPlus className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{agendamentosHoje ?? 0}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">{today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pacientes Ativos</h3>
            <UserCheck className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{(pacientesAtivos ?? 0).toLocaleString('pt-BR')}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Qualificados ou acima</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Desempenho da Inteligência Artificial</h3>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Bot className="h-5 w-5 text-blue-500 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                  <span>Bot (Sofia)</span>
                  <span>{pctBot}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${pctBot}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <UserCheck className="h-5 w-5 text-green-500 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                  <span>Atendimento Humano</span>
                  <span>{pctHumano}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${pctHumano}%` }}></div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-extrabold text-blue-600">{conversasBot ?? 0}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Conversas com bot</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-green-600">{conversasHumano ?? 0}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Atendidas por humano</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Atenção Necessária</h3>
            {atencaoNecessaria && atencaoNecessaria.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {atencaoNecessaria.length} pendente{atencaoNecessaria.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="space-y-4 flex-1 overflow-auto">
            {atencaoNecessaria && atencaoNecessaria.length > 0 ? (
              atencaoNecessaria.map((conv: any) => {
                const lead = conv.leads
                const name = lead?.name ?? 'Lead'
                const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
                const time = new Date(conv.last_message_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={conv.id} className="flex gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{name}</p>
                      <p className="text-sm text-slate-500 mt-0.5">Aguardando atendimento humano</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 shrink-0">{time}</span>
                  </div>
                )
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium py-8">
                Nenhuma conversa pendente
              </div>
            )}
          </div>

          <Link
            href="/dashboard/inbox"
            className="w-full mt-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-lg border border-slate-200 transition-colors text-center block text-sm"
          >
            Ir para Caixa de Entrada
          </Link>
        </div>
      </div>
    </div>
  )
}
