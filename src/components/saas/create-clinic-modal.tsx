'use client'

import { useState } from 'react'
import { Plus, X, Building, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { createClinic } from '@/app/dashboard/saas/actions'

interface CreateClinicModalProps {
  plans: any[]
}

export function CreateClinicModal({ plans }: CreateClinicModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
      >
        <Plus className="w-5 h-5" />
        Nova Empresa
      </button>
    )
  }

  return (
    <>
      {/* Trigger Button (Visible when closed, but we already handled that above) */}
      
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
        
        {/* Modal Content */}
        <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
          
          {/* Left Side Info */}
          <div className="md:w-1/3 bg-slate-900 p-8 text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">Novo Tenant</h3>
                <p className="text-slate-400 mt-2 text-sm font-medium">Provisionamento imediato de infraestrutura OdontoAI.</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">Banco de dados isolado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">Ativação instantânea</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 blur-[80px] rounded-full opacity-10 -mr-16 -mt-16" />
          </div>

          {/* Right Side Form */}
          <div className="flex-1 p-8 md:p-10 relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-widest">Informações Cadastrais</h2>
            
            <form action={async (formData) => {
              const res = await createClinic(formData)
              setIsOpen(false)
            }} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome da Clínica</label>
                <input name="name" required placeholder="Ex: Oral Design" className="w-full px-5 py-3.5 border-none ring-1 ring-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Documento (CNPJ)</label>
                <input name="document" placeholder="00.000.000/0001-00" className="w-full px-5 py-3.5 border-none ring-1 ring-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Telefone Principal</label>
                <input name="phone" placeholder="(11) 99999-9999" className="w-full px-5 py-3.5 border-none ring-1 ring-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Plano de Serviço</label>
                <select name="plan_id" required className="w-full px-5 py-3.5 border-none ring-1 ring-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 appearance-none">
                  <option value="">Configurações de Quota</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — R$ {p.price}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                  Confirmar e Ativar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
