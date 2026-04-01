'use client'

import { useState } from 'react'
import { Phone, CalendarCheck, Clock, ArrowUpRight, UserSquare2, Eye } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PatientDetailsModal } from './patient-details-modal'

const STAGE_STYLES: Record<string, string> = {
  'Novo':        'bg-slate-50 text-slate-500 border-slate-100',
  'Qualificado': 'bg-blue-50 text-blue-600 border-blue-100',
  'Negociação':  'bg-amber-50 text-amber-600 border-amber-100',
  'Agendado':    'bg-emerald-50 text-emerald-600 border-emerald-100',
}

interface PatientTableProps {
  patients: any[]
}

export function PatientTable({ patients }: PatientTableProps) {
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente & Perfil</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato Direto</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fase Funil</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Último Contato</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Agendamentos</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {patients.map((p: any) => {
              const phone = p.phone?.split('@')[0] ?? '—'
              const stage = p.funnel_stage ?? 'Novo'
              const style = STAGE_STYLES[stage] || STAGE_STYLES['Novo']
              const activeConv = p.conversations?.find((c: any) => c.status !== 'closed')
              const totalApptsCount = p.appointments?.length ?? 0
              const initials = p.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
              const lastMsg = activeConv?.last_message_at ? formatDistanceToNow(new Date(activeConv.last_message_at), { addSuffix: true, locale: ptBR }) : '—'

              return (
                <tr key={p.id} className="hover:bg-blue-50/10 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black shadow-sm group-hover:scale-105 transition-transform">
                        {initials}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 tracking-tight text-lg">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                           <Clock className="w-3 h-3" />
                           Desde {new Date(p.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 cursor-pointer" onClick={() => setSelectedPatient(p)}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                         <Phone className="w-3.5 h-3.5 text-blue-500" />
                         {phone}
                      </div>
                      {p.email && <p className="text-[11px] text-slate-400 font-medium">{p.email}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${style}`}>
                      {stage}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                     <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-600">{lastMsg}</span>
                        <div className={`flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-tighter ${activeConv ? 'text-blue-500' : 'text-slate-300'}`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${activeConv ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                           {activeConv ? (activeConv.status === 'bot_handling' ? 'Sofia Ativa' : 'Humano') : 'Inativo'}
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                         <CalendarCheck className={`w-4 h-4 ${totalApptsCount > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
                         <span className={`text-sm font-black ${totalApptsCount > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{totalApptsCount}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Agendados</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-right w-full">
                       <button 
                        onClick={() => setSelectedPatient(p)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all active:scale-95 shadow-sm"
                        title="Ver Perfil Completo"
                       >
                         <Eye className="w-5 h-5" />
                       </button>
                       <Link 
                        href="/dashboard/inbox"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                       >
                         Chat
                         <ArrowUpRight className="w-3.5 h-3.5" />
                       </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
            {patients.length === 0 && (
              <tr>
                <td colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                     <UserSquare2 className="w-16 h-16 text-slate-100" />
                     <div className="space-y-1">
                       <p className="text-slate-500 font-black text-lg">Nenhum paciente encontrado</p>
                       <p className="text-slate-400 text-sm font-medium">Tente ajustar sua busca ou filtros.</p>
                     </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPatient && (
        <PatientDetailsModal 
          isOpen={!!selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
          patient={selectedPatient} 
        />
      )}
    </div>
  )
}
