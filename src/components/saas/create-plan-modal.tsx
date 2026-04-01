'use client'

import { useState } from 'react'
import { Rocket, X, ArrowUpRight, Check, Zap } from 'lucide-react'
import { createPlan } from '@/app/dashboard/saas/actions'

export function CreatePlanModal() {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center group overflow-hidden relative min-h-[500px] cursor-pointer"
      >
        <div className="relative z-10 space-y-6 text-center">
          <div className="w-20 h-20 rounded-[2rem] bg-white text-slate-400 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 group-hover:text-amber-500 transition-all">
            <Rocket className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Novo Modelo</h3>
            <p className="text-slate-400 font-medium text-sm max-w-[200px] mt-2">Crie uma nova tier de precificação para o SaaS.</p>
          </div>
          <div className="inline-block px-8 py-3 bg-white text-slate-900 font-black rounded-xl border-2 border-slate-200 hover:border-slate-900 transition-all text-sm uppercase tracking-widest">
            Começar
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative group">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/10 text-slate-400 transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12 relative overflow-hidden">
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="w-16 h-16 rounded-3xl bg-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/50">
                <Rocket className="w-8 h-8 text-slate-900" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white tracking-tight leading-tight">Novo Plano SaaS</h2>
                <p className="text-slate-400 text-lg font-medium">Defina métricas de escala e o valor de mercado para este serviço.</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold text-slate-300">Quota de operacionais</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-bold text-slate-300">Limites de leads mensais</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] p-6 md:p-8 border border-white/10">
              <form action={async (formData) => {
                await createPlan(formData)
                setIsOpen(false)
              }} className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Identificador do Plano</label>
                  <input name="name" required placeholder="Ex: Growth, VIP..." className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:bg-white/10 focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Preço Mensal (R$)</label>
                  <input name="price" type="number" step="0.01" required placeholder="0.00" className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:bg-white/10 focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Max Usuários</label>
                    <input name="max_users" type="number" required placeholder="Qtd" className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:bg-white/10 focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Max Leads</label>
                    <input name="max_leads" type="number" required placeholder="Volume" className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:bg-white/10 focus:ring-2 focus:ring-amber-500 outline-none transition-all" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-xl shadow-2xl shadow-amber-500/20 hover:bg-amber-400 transition-all flex items-center justify-center gap-3 mt-4 active:scale-95">
                  Lançar Novo Plano
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-amber-600 blur-[150px] rounded-full opacity-10 -mr-60 -mt-60 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        </div>
      </div>
    </div>
  )
}
