import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { UserSquare2, Phone, MessageSquareText, CalendarCheck } from "lucide-react"
import Link from "next/link"

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

const STAGE_COLORS: Record<string, string> = {
  'Novo':        'bg-slate-100 text-slate-600',
  'Qualificado': 'bg-blue-100 text-blue-700',
  'Negociação':  'bg-orange-100 text-orange-700',
  'Agendado':    'bg-green-100 text-green-700',
}

export default async function PacientesPage() {
  const clinicId = await getClinicId()
  if (!clinicId) return <p className="text-slate-500">Clínica não encontrada.</p>

  const { data: leads } = await supabaseAdmin
    .from('leads')
    .select(`
      id, name, phone, email, funnel_stage, created_at,
      conversations ( id, status, last_message_at ),
      appointments ( id, start_time, status )
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  const patients = leads ?? []

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Pacientes</h2>
          <p className="text-slate-500 mt-1">Todos os contatos e pacientes cadastrados na clínica.</p>
        </div>
        <span className="bg-slate-100 text-slate-600 text-sm font-bold px-3 py-1.5 rounded-full">
          {patients.length} paciente{patients.length !== 1 ? 's' : ''}
        </span>
      </div>

      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <UserSquare2 className="w-12 h-12" />
          <p className="font-semibold">Nenhum paciente cadastrado ainda.</p>
          <p className="text-sm">Os pacientes aparecem aqui quando enviam mensagem pelo WhatsApp.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Paciente</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Estágio</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Conversa</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Agendamentos</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cadastrado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p: any) => {
                const phone = p.phone?.split('@')[0] ?? '—'
                const stage = p.funnel_stage ?? 'Novo'
                const stageColor = STAGE_COLORS[stage] ?? 'bg-slate-100 text-slate-600'
                const activeConv = p.conversations?.find((c: any) => c.status !== 'closed')
                const totalAppts = p.appointments?.length ?? 0
                const createdAt = new Date(p.created_at).toLocaleDateString('pt-BR')
                const initials = p.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{p.name}</p>
                          {p.email && <p className="text-xs text-slate-400">{p.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${stageColor}`}>
                        {stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {activeConv ? (
                        <Link
                          href="/dashboard/inbox"
                          className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium"
                        >
                          <MessageSquareText className="w-3.5 h-3.5" />
                          {activeConv.status === 'bot_handling' ? 'Bot ativo' :
                           activeConv.status === 'human_waiting' ? 'Aguardando' :
                           activeConv.status === 'human_handled' ? 'Com humano' : activeConv.status}
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">Sem conversa ativa</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                        {totalAppts > 0 ? `${totalAppts} agendamento${totalAppts > 1 ? 's' : ''}` : <span className="text-slate-400 text-xs">Nenhum</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                      {createdAt}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
