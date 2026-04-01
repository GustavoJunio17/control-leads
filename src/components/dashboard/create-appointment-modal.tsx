'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock, User, Briefcase, Search, Plus, Loader2, CheckCircle2, Save } from 'lucide-react'
import { fetchInitialData, createAppointment } from '@/app/dashboard/agenda/actions'

interface CreateAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  selectedDate?: Date
}

export function CreateAppointmentModal({ isOpen, onClose, onSuccess, selectedDate }: CreateAppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(true)
  const [data, setData] = useState<any>({ professionals: [], procedures: [], leads: [] })
  
  const [formData, setFormData] = useState({
    lead_id: '',
    professional_id: '',
    procedure_id: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '09:00'
  })

  useEffect(() => {
    if (isOpen) {
      setInitLoading(true)
      fetchInitialData().then(res => {
        setData(res)
        setInitLoading(false)
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const startTime = new Date(`${formData.date}T${formData.time}:00`)
      const proc = data.procedures.find((p: any) => p.id === formData.procedure_id)
      const duration = proc?.duration_minutes || 30
      const endTime = new Date(startTime.getTime() + duration * 60000)

      await createAppointment({
        lead_id: formData.lead_id,
        professional_id: formData.professional_id,
        procedure_id: formData.procedure_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

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
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg text-white">
              <Plus className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Novo Agendamento</h2>
              <p className="text-slate-500 font-medium text-sm">Preencha os dados da consulta abaixo.</p>
            </div>
          </div>

          {initLoading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="font-bold text-sm tracking-widest uppercase">Carregando dados...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Paciente</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <select 
                    required
                    value={formData.lead_id}
                    onChange={(e) => setFormData({...formData, lead_id: e.target.value})}
                    className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                  >
                    <option value="">Selecionar Paciente</option>
                    {data.leads.map((l: any) => (
                      <option key={l.id} value={l.id}>{l.name} ({l.phone?.split('@')[0]})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Profissional</label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <select 
                      required
                      value={formData.professional_id}
                      onChange={(e) => setFormData({...formData, professional_id: e.target.value})}
                      className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                    >
                      <option value="">Médico/Dentista</option>
                      {data.professionals.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Procedimento</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <select 
                      required
                      value={formData.procedure_id}
                      onChange={(e) => setFormData({...formData, procedure_id: e.target.value})}
                      className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                    >
                      <option value="">Tratamento</option>
                      {data.procedures.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Horário</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95 text-lg"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
