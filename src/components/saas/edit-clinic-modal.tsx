'use client'

import { useState } from 'react'
import { X, Building, Save, Loader2, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react'
import { updateClinic } from '@/app/dashboard/saas/actions'

interface EditClinicModalProps {
  clinic: any
  plans: any[]
}

export function EditClinicModal({ clinic, plans }: EditClinicModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-end gap-2 text-blue-600 font-black text-xs uppercase tracking-widest cursor-pointer hover:underline underline-offset-4"
      >
        <ShieldCheck className="w-4 h-4" />
        Configurar
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300 text-left">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg text-white">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Configurar Clínica</h2>
              <p className="text-slate-500 font-medium text-sm">Ajuste parâmetros de acesso e identidade do tenant.</p>
            </div>
          </div>

          <form action={async (formData) => {
            setLoading(true)
            try {
              await updateClinic(formData)
              setIsOpen(false)
            } catch (err: any) {
              alert(err.message)
            } finally {
              setLoading(false)
            }
          }} className="grid gap-6">
            
            <input type="hidden" name="id" value={clinic.id} />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome da Empresa</label>
                <input 
                  name="name" 
                  defaultValue={clinic.name} 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Documento (CNPJ)</label>
                <input 
                  name="document" 
                  defaultValue={clinic.document} 
                  className="w-full px-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all" 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Telefone Principal</label>
                <input 
                  name="phone" 
                  defaultValue={clinic.phone} 
                  className="w-full px-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Plano Atual</label>
                <div className="relative">
                   <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                   <select 
                     name="plan_id" 
                     defaultValue={clinic.plan_id || ''} 
                     className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                   >
                     <option value="">Experimental (Default)</option>
                     {plans.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                     ))}
                   </select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${clinic.active ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Status Ativo</p>
                    <p className="text-[10px] text-slate-500 font-medium">Define se a clínica pode usar o sistema.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="active" defaultChecked={clinic.active} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95 text-lg"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
