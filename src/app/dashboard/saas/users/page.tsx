import { createClient as createBaseClient } from '@supabase/supabase-js'
import { User, ShieldCheck, Building, Fingerprint, Clock, X } from 'lucide-react'
import { UserAccessModal } from '@/components/saas/user-access-modal'
import { UserActionsMenu } from '@/components/saas/user-actions-menu'
import { UserFilters } from '@/components/saas/user-filters'

interface PageProps {
  searchParams: Promise<{
    clinic?: string
    query?: string
  }>
}

export default async function UsersManagement({ searchParams }: PageProps) {
  // Await searchParams for Next.js 15+
  const filters = await searchParams
  
  const supabaseAdmin = createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const [
    { data: allAssociations }, 
    { data: clinics },
    { data: { users: authUsers } }
  ] = await Promise.all([
    supabaseAdmin
      .from('clinic_users')
      .select(`
        *,
        clinics (name)
      `)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('clinics')
      .select('id, name'),
    supabaseAdmin.auth.admin.listUsers()
  ])

  // Create email map
  const emailMap = new Map(authUsers.map(u => [u.id, u.email]))

  // Apply filters
  let filteredAssociations = allAssociations || []
  
  if (filters.clinic) {
    filteredAssociations = filteredAssociations.filter(a => a.clinic_id === filters.clinic)
  }

  if (filters.query) {
    const q = filters.query.toLowerCase()
    filteredAssociations = filteredAssociations.filter(a => {
      const email = emailMap.get(a.user_id)?.toLowerCase() || ''
      return email.includes(q) || a.role.toLowerCase().includes(q)
    })
  }

  const totalUsers = allAssociations?.length || 0
  const totalAdmins = allAssociations?.filter((a: any) => a.role === 'admin' || a.role === 'super_admin').length || 0

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-violet-600 font-bold text-sm uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Controle de Identidade
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Usuários Globais</h1>
          <p className="text-lg text-slate-500 font-medium">Gerencie permissões e associações entre diferentes unidades.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <UserAccessModal clinics={clinics || []} />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Acessos Registrados', value: totalUsers, icon: User, color: 'blue' },
          { label: 'Administradores', value: totalAdmins, icon: ShieldCheck, color: 'violet' },
          { label: 'Média por Unidade', value: clinics?.length ? (totalUsers / clinics.length).toFixed(1) : 0, icon: Fingerprint, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="relative z-10">
               <div className={`w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                 <stat.icon className="w-6 h-6" />
               </div>
               <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
               <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
             </div>
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-20 h-20 -mr-6 -mt-6" />
             </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        {/* Client Side Filters */}
        <UserFilters 
          clinics={clinics || []} 
          initialQuery={filters.query} 
          initialClinic={filters.clinic} 
        />
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário & Identidade</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade Vinculada</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Função</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Data Vínculo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssociations?.map((assoc: any) => {
                const userEmail = emailMap.get(assoc.user_id) || 'E-mail não encontrado'
                return (
                  <tr key={assoc.id} className="hover:bg-violet-50/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                             {userEmail}
                             {assoc.role === 'super_admin' && <ShieldCheck className="w-4 h-4 text-blue-600" />}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                             <Fingerprint className="w-3 h-3" />
                             ID: {assoc.user_id.split('-')[0]}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                         <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-slate-600 transition-all">
                           <Building className="w-4.5 h-4.5" />
                         </div>
                         <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-700">{assoc.clinics?.name || 'Vínculo Global'}</span>
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Unidade Atribuída</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className={`inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                        assoc.role === 'super_admin' 
                          ? 'bg-slate-900 text-white border-slate-900' 
                          : assoc.role === 'admin' 
                            ? 'bg-blue-50 text-blue-700 border-blue-100' 
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {assoc.role}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <span className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(assoc.created_at).toLocaleDateString('pt-BR')}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <UserActionsMenu 
                        associationId={assoc.id} 
                        currentRole={assoc.role} 
                        userEmail={userEmail}
                        userId={assoc.user_id}
                        clinicId={assoc.clinic_id}
                        clinics={clinics || []}
                      />
                    </td>
                  </tr>
                )
              })}
              {filteredAssociations.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <p className="text-slate-400 font-bold italic">Nenhum resultado encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
