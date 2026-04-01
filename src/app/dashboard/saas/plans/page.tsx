import { createClient as createBaseClient } from '@supabase/supabase-js'
import { Zap, Rocket, Check, Sparkles, Gem } from 'lucide-react'
import { CreatePlanModal } from '@/components/saas/create-plan-modal'

export default async function PlansManagement() {
  const supabaseAdmin = createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data: plans } = await supabaseAdmin
    .from('plans')
    .select('*')
    .order('price', { ascending: true })

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Estratégia de Monetização
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">Modelos de Assinatura</h1>
          <p className="text-lg text-slate-500 font-medium">Configure as tiers, limites operacionais e precificação global do SaaS.</p>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans?.map((plan) => (
          <div key={plan.id} className={`group relative bg-white rounded-[2.5rem] border-2 p-8 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 ${plan.active ? 'border-amber-100 hover:border-amber-400' : 'border-slate-100 opacity-60'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${plan.price > 500 ? 'bg-black text-white' : plan.price > 200 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                {plan.price > 500 ? <Gem className="w-8 h-8" /> : plan.price > 200 ? <Rocket className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
              </div>
            </div>
            
            <div className="space-y-2 mb-8">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-widest">{plan.name}</h3>
               <p className="text-slate-400 text-sm font-medium">Ideal para clínicas em {plan.max_users > 10 ? 'alta escala' : 'crescimento'}.</p>
            </div>

            <div className="mb-8">
               <span className="text-4xl font-black text-slate-900 tracking-tighter">R$ {plan.price}</span>
               <span className="text-slate-400 font-bold text-sm ml-1">/ mensal</span>
            </div>

            <div className="space-y-4 mb-10 border-t border-slate-50 pt-8">
               <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  Até <strong>{plan.max_users} Operadores</strong>
               </div>
               <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  Até <strong>{plan.max_leads} Leads</strong> Mensais
               </div>
               <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  Sofia AI Full Access
               </div>
            </div>

            <button className="w-full py-4 bg-slate-950 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95">
              Editar Configurações
            </button>
          </div>
        ))}

        <CreatePlanModal />
      </div>
    </div>
  )
}
