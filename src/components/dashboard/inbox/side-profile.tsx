'use client'

import { X, User, Phone, Mail, MapPin, Calendar, Fingerprint, ExternalLink, Zap, Loader2, Info } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchLeadById } from "@/app/dashboard/inbox/actions"

interface SideProfileProps {
  patient: any
  isOpen: boolean
  onClose: () => void
}

export function SideProfile({ patient, isOpen, onClose }: SideProfileProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(patient)

  useEffect(() => {
    if (patient) setData(patient)
  }, [patient])

  useEffect(() => {
    if (isOpen && patient?.id) {
       setLoading(true)
       fetchLeadById(patient.id).then(res => {
          if (res) setData((prev: any) => ({ ...prev, ...res }))
          setLoading(false)
       })
    }
  }, [isOpen, patient?.id])

  if (!isOpen || !patient) return null

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full animate-in slide-in-from-right duration-300 shadow-2xl relative z-30">
      <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="font-black text-slate-900 tracking-tight">Perfil do Paciente</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Dados Sincronizados</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-[10px] font-black uppercase tracking-widest">Atualizando Dados...</p>
           </div>
        ) : (
          <>
            {/* Basic Header */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-blue-500/20">
                {data.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg leading-tight">{data.name}</h4>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                   <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none">Status: {data.funnel_stage || 'Lead'}</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-6 pt-4">
              <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-blue-500 ml-1">Contatos Oficiais</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Phone className="w-4 h-4" /></div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">WhatsApp</span>
                          <span className="text-sm font-bold text-slate-700">+{data.phone?.split('@')[0]}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Mail className="w-4 h-4" /></div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">E-mail</span>
                          <span className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{data.email || 'Não informado'}</span>
                        </div>
                    </div>
                  </div>
              </div>

              <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-amber-500 ml-1">Documentação</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Fingerprint className="w-4 h-4" /></div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">CPF / ID</span>
                          <span className="text-sm font-bold text-slate-700">{data.cpf || 'Pendente'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400"><Calendar className="w-4 h-4" /></div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Data de Nasc.</span>
                          <span className="text-sm font-bold text-slate-700">{data.birth_date || 'Não informado'}</span>
                        </div>
                    </div>
                  </div>
              </div>

              <div className="space-y-4 pb-12">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-emerald-500 ml-1">Endereço</p>
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 mt-0.5"><MapPin className="w-4 h-4" /></div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-slate-700 leading-tight">
                          {data.address || 'Não cadastrado'}
                        </span>
                        <span className="text-xs font-bold text-slate-400 mt-1">
                          {data.city ? `${data.city} - ${data.state}` : ''} {data.cep}
                        </span>
                    </div>
                  </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
