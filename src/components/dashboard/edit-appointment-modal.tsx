'use client'

import { useState } from 'react'
import { X, Calendar, Clock, User, Briefcase, Trash2, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react'
import { updateAppointmentStatus, deleteAppointment } from '@/app/dashboard/agenda/actions'

interface EditAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  appointment: any
}

export function EditAppointmentModal({ isOpen, onClose, onSuccess, appointment }: EditAppointmentModalProps) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen || !appointment) return null

  const handleStatusUpdate = async (status: string) => {
    setLoading(status)
    try {
      await updateAppointmentStatus(appointment.id, status)
      onSuccess()
      onClose()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return
    setLoading('delete')
    try {
      await deleteAppointment(appointment.id)
      onSuccess()
      onClose()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(null)
    }
  }

  const startTime = new Date(appointment.start_time)
  const endTime = new Date(appointment.end_time)

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative text-left">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-white ${
              appointment.status === 'confirmed' ? 'bg-emerald-500' : 
              appointment.status === 'cancelled' ? 'bg-rose-500' : 'bg-amber-500'
            }`}>
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Detalhes do Agendamento</h2>
              <p className="text-slate-500 font-medium text-sm">Gerencie o status e informações da consulta.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-[1.5rem] space-y-4 ring-1 ring-slate-100">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Paciente</p>
                  <p className="font-bold text-slate-700">{appointment.leads?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Procedimento</p>
                  <p className="font-bold text-slate-700">{appointment.procedures?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-purple-500" />
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Profissional</p>
                    <p className="font-bold text-slate-700">{appointment.professionals?.name}</p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 p-4 rounded-2xl ring-1 ring-slate-100 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data</p>
                    <p className="font-bold text-slate-700 text-sm">{startTime.toLocaleDateString('pt-BR')}</p>
                  </div>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl ring-1 ring-slate-100 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Horário</p>
                    <p className="font-bold text-slate-700 text-sm">
                      {startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - 
                      {endTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
               </div>
            </div>

            <div className="pt-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={loading !== null || appointment.status === 'confirmed'}
                  className="bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
                >
                  {loading === 'confirmed' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirmar
                </button>
                <button 
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={loading !== null || appointment.status === 'cancelled'}
                  className="bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
                >
                  {loading === 'cancelled' ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                  Cancelar
                </button>
              </div>
              <button 
                onClick={handleDelete}
                disabled={loading !== null}
                className="w-full bg-rose-50 text-rose-500 font-black py-4 rounded-2xl hover:bg-rose-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
              >
                {loading === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Excluir Agendamento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
