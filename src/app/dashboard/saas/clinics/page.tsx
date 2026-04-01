import { createClient as createBaseClient } from '@supabase/supabase-js'
import { Building, Search, Activity, CheckCircle2, ArrowUpRight, Settings, MoreHorizontal, Filter, Download, CreditCard } from 'lucide-react'
import { CreateClinicModal } from '@/components/saas/create-clinic-modal'
import { EditClinicModal } from '@/components/saas/edit-clinic-modal'
import { ExportClinicsButton } from '@/components/saas/export-clinics-button'

export default async function ClinicsManagement() {
  const supabaseAdmin = createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const [{ data: clinics }, { data: plans }] = await Promise.all([
    supabaseAdmin
      .from('clinics')
      .select(`
        *,
        plans (name)
      `)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('plans')
      .select('*')
  ])

  const totalClinics = clinics?.length || 0
  const activeClinics = clinics?.filter(c => c.active).length || 0
  const conversionRate = totalClinics > 0 ? Math.round((activeClinics / totalClinics) * 100) : 0

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            Ecossistema OdontoAI
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Gestão de Empresas</h1>
          <p className="text-lg text-slate-500 font-medium">Controle central de clínicas, faturamento e ativação de tenants.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <ExportClinicsButton clinics={clinics || []} />
          <CreateClinicModal plans={plans || []} />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total de Tenants', value: totalClinics, icon: Building, color: 'blue', desc: 'Clínicas registradas' },
          { label: 'Unidades Ativas', value: activeClinics, icon: CheckCircle2, color: 'green', desc: 'Em operação real' },
          { label: 'Taxa de Ativação', value: `${conversionRate}%`, icon: Activity, color: 'violet', desc: 'Conversão de leads' },
          { label: 'Plano Pro/VIP', value: clinics?.filter(c => c.plans?.name === 'Pro').length || 0, icon: ArrowUpRight, color: 'orange', desc: 'Tickets de alto valor' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
             <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform`}>
                 <stat.icon className="w-6 h-6" />
               </div>
               <span className="text-[10px] font-bold text-slate-400 uppercase">Resumo Mensal</span>
             </div>
             <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
             <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tighter">{stat.label}</p>
             <p className="text-[10px] text-slate-400 mt-2">{stat.desc}</p>
             <div className={`absolute -bottom-6 -right-6 w-20 h-20 bg-blue-50/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, CNPJ ou ID..." 
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl border-none ring-1 ring-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
              Mostrando <strong>{totalClinics}</strong> resultados
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-20">#</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Estrutura da Empresa</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Identificação Digital</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Configurações</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status Global</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clinics?.map((clinic, idx) => (
                <tr key={clinic.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6 text-sm font-bold text-slate-300 text-center">
                    {(idx + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <Building className="w-6 h-6" />
                      </div>
                      <div className="min-w-[180px]">
                        <p className="font-black text-slate-900 tracking-tight text-lg">{clinic.name}</p>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          ID: {clinic.id.split('-')[0]}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">{clinic.document || 'NÃO INFORMADO'}</p>
                      <p className="text-[11px] text-slate-400 font-medium uppercase">{clinic.phone || 'Sem Telefone'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                      clinic.plans?.name === 'Pro' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-blue-50 border-blue-100 text-blue-700'
                    }`}>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="text-xs font-black uppercase tracking-tight">{clinic.plans?.name || 'Experimental'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-tighter ${
                      clinic.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${clinic.active ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                      {clinic.active ? 'Atendido' : 'Inativo'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <EditClinicModal clinic={clinic} plans={plans || []} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
