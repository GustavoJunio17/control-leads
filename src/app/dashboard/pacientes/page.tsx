import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { Users, Zap, CalendarCheck, MessageCircle } from "lucide-react"
import { PatientFilters } from "@/components/dashboard/patient-filters"
import { PatientTable } from "@/components/dashboard/patient-table"

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

interface PageProps {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function PacientesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const clinicId = await getClinicId()
  if (!clinicId) return <p className="text-slate-500 p-10">Clínica não encontrada.</p>

  const { data: leads } = await supabaseAdmin
    .from('leads')
    .select(`
      id, name, phone, email, funnel_stage, created_at,
      cpf, birth_date, address, city, state, cep,
      conversations ( id, status, last_message_at ),
      appointments ( id, start_time, status )
    `)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  const allPatients = leads ?? []
  
  // Filtering
  let filteredPatients = allPatients
  if (params.q) {
    const q = params.q.toLowerCase()
    filteredPatients = allPatients.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.phone && p.phone.includes(q))
    )
  }

  // Stats
  const totalPatients = allPatients.length
  const activeChat = allPatients.filter(p => p.conversations?.some((c: any) => c.status !== 'closed')).length
  const newThisMonth = allPatients.filter(p => {
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    return new Date(p.created_at) > monthAgo
  }).length
  const totalAppts = allPatients.reduce((acc, p) => acc + (p.appointments?.length || 0), 0)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
            <Users className="w-4 h-4" />
            Base de Pacientes
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Gestão de Contatos</h1>
          <p className="text-lg text-slate-500 font-medium">Histórico completo de leads e pacientes cadastrados.</p>
        </div>
        
        <PatientFilters initialQuery={params.q} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Base', value: totalPatients, icon: Users, color: 'blue', desc: 'Pacientes rastreados' },
          { label: 'Em Atendimento', value: activeChat, icon: MessageCircle, color: 'violet', desc: 'Bot ou Human ativo' },
          { label: 'Novos Leads', value: `+${newThisMonth}`, icon: Zap, color: 'amber', desc: 'Últimos 30 dias' },
          { label: 'Agendamentos', value: totalAppts, icon: CalendarCheck, color: 'emerald', desc: 'Total histórico' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden text-left">
             <div className="relative z-10">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-3 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform text-slate-600 font-bold">
                   <stat.icon className="w-6 h-6" />
                 </div>
               </div>
               <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
               <p className="text-[10px] text-slate-400 mt-2 font-medium italic">{stat.desc}</p>
             </div>
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-16 h-16 -mr-4 -mt-4 rotate-12" />
             </div>
          </div>
        ))}
      </div>

      {/* Main Table Area */}
      <PatientTable patients={filteredPatients} />
    </div>
  )
}
