'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus, Clock, User, CheckCircle2, MoreHorizontal, Calendar, Briefcase, Loader2, Zap } from "lucide-react"
import { fetchAgendaData, fetchMonthAppointmentDays } from "./actions"
import { CreateAppointmentModal } from "@/components/dashboard/create-appointment-modal"
import { EditAppointmentModal } from "@/components/dashboard/edit-appointment-modal"

const HOUR_START = 7
const HOUR_END = 19
const HOUR_HEIGHT = 100 // Aumentado para mais espaço

const PROF_COLORS = [
  { bg: 'bg-blue-50/80', border: 'border-blue-100', accent: 'bg-blue-500', text: 'text-blue-900', sub: 'text-blue-700/70', dot: 'bg-blue-500', ring: 'ring-blue-100' },
  { bg: 'bg-purple-50/80', border: 'border-purple-100', accent: 'bg-purple-500', text: 'text-purple-900', sub: 'text-purple-700/70', dot: 'bg-purple-500', ring: 'ring-purple-100' },
  { bg: 'bg-emerald-50/80', border: 'border-emerald-100', accent: 'bg-emerald-500', text: 'text-emerald-900', sub: 'text-emerald-700/70', dot: 'bg-emerald-500', ring: 'ring-emerald-100' },
  { bg: 'bg-amber-50/80', border: 'border-amber-100', accent: 'bg-amber-500', text: 'text-amber-900', sub: 'text-amber-700/70', dot: 'bg-amber-500', ring: 'ring-amber-100' },
  { bg: 'bg-rose-50/80', border: 'border-rose-100', accent: 'bg-rose-500', text: 'text-rose-900', sub: 'text-rose-700/70', dot: 'bg-rose-500', ring: 'ring-rose-100' },
]

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

function timeToTop(dateStr: string) {
  const d = new Date(dateStr)
  const hours = d.getHours() + d.getMinutes() / 60
  return (hours - HOUR_START) * HOUR_HEIGHT
}

function durationToHeight(start: string, end: string) {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / 3600000
  return Math.max(diff * HOUR_HEIGHT, HOUR_HEIGHT * 0.5)
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function AgendaView() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMonth, setViewMonth] = useState(new Date())
  const [appointments, setAppointments] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [hiddenProfs, setHiddenProfs] = useState<Set<string>>(new Set())
  const [daysWithAppts, setDaysWithAppts] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<any>(null)

  const loadDay = useCallback(async (date: Date) => {
    setLoading(true)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { appointments, professionals } = await fetchAgendaData(
      startOfDay.toISOString(),
      endOfDay.toISOString()
    )
    setAppointments(appointments)
    setProfessionals(professionals)
    setLoading(false)
  }, [])

  const loadMonthDots = useCallback(async (date: Date) => {
    const days = await fetchMonthAppointmentDays(date.getFullYear(), date.getMonth())
    setDaysWithAppts(days)
  }, [])

  useEffect(() => { loadDay(selectedDate) }, [selectedDate, loadDay])
  useEffect(() => { loadMonthDots(viewMonth) }, [viewMonth, loadMonthDots])

  const profColorMap = Object.fromEntries(
    professionals.map((p, i) => [p.id, PROF_COLORS[i % PROF_COLORS.length]])
  )

  function toggleProf(id: string) {
    setHiddenProfs(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const visibleAppts = appointments.filter(a =>
    !hiddenProfs.has(a.professionals?.id)
  )

  // Mini calendar
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const today = new Date()

  const isSelected = (d: number) =>
    d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  function selectDay(d: number) {
    const date = new Date(year, month, d)
    setSelectedDate(date)
    if (month !== viewMonth.getMonth()) setViewMonth(date)
  }

  const selectedLabel = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
  const capitalizedLabel = selectedLabel.charAt(0).toUpperCase() + selectedLabel.slice(1)

  const showNowLine =
    toDateStr(selectedDate) === toDateStr(today) &&
    new Date().getHours() >= HOUR_START &&
    new Date().getHours() < HOUR_END
  const nowTop = timeToTop(new Date().toISOString())

  return (
    <div className="flex h-full flex-col space-y-8 p-1 animate-in fade-in duration-500">
      
      {/* Premium Header */}
      <div className="flex items-end justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Calendar className="w-4 h-4" />
            Fluxo da Clínica
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Agenda da Clínica</h2>
          <p className="text-slate-500 font-medium">Controle de horários e disponibilidade em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Novo Agendamento
          </button>
        </div>
      </div>

      <div className="flex gap-8" style={{ height: 'calc(100vh - 240px)' }}>
        
        {/* Modern Sidebar */}
        <div className="w-[18rem] shrink-0 flex flex-col gap-6">
          
          {/* Style Mini Calendar */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">{MONTH_NAMES[month]} {year}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMonth(new Date(year, month - 1, 1))}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMonth(new Date(year, month + 1, 1))}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-300 mb-2 uppercase tracking-tighter">
              {['D','S','T','Q','Q','S','S'].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`prev-${i}`} className="p-2 text-slate-200 text-xs font-bold">
                  {prevMonthDays - firstDay + i + 1}
                </div>
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1
                const hasAppt = daysWithAppts.includes(d)
                const selected = isSelected(d)
                const current = isToday(d)
                
                return (
                  <button
                    key={d}
                    onClick={() => selectDay(d)}
                    className={`relative w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all group
                      ${selected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110' : 
                        current ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-100' : 'hover:bg-slate-50 text-slate-600'}
                    `}
                  >
                    {d}
                    {hasAppt && !selected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Professional Filters */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex-1 overflow-y-auto">
            <h3 className="font-black text-slate-900 mb-6 text-[10px] uppercase tracking-[0.2em] pl-1">Profissionais</h3>
            {professionals.length === 0 ? (
              <div className="text-center py-10 opacity-40">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sem equipe</p>
              </div>
            ) : (
              <div className="space-y-4">
                {professionals.map((p, i) => {
                  const color = PROF_COLORS[i % PROF_COLORS.length]
                  const hidden = hiddenProfs.has(p.id)
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => toggleProf(p.id)}
                      className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border
                        ${hidden ? 'opacity-40 border-transparent bg-slate-50' : `bg-white ${color.border} shadow-sm`}
                      `}
                    >
                      <div className={`w-8 h-8 rounded-xl ${color.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                         <div className={`w-2.5 h-2.5 rounded-full ${color.dot} ${!hidden && 'animate-pulse'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-black truncate ${hidden ? 'text-slate-400' : 'text-slate-800'}`}>{p.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${hidden ? 'text-slate-300' : 'text-slate-400'}`}>{p.role || 'Especialista'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Premium Daily Dashboard */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col overflow-hidden">
          
          <div className="flex items-center justify-between border-b p-6 bg-slate-50/30 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); setViewMonth(d) }} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <ChevronLeft className="h-4 w-4 text-slate-500" />
                </button>
                <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); setViewMonth(d) }} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">{capitalizedLabel}</h3>
                 <button onClick={() => { setSelectedDate(today); setViewMonth(today) }} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                    Visualizar Hoje
                 </button>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
               <Zap className="w-3.5 h-3.5 text-blue-500" />
               <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                  {visibleAppts.length} Consulta{visibleAppts.length !== 1 ? 's' : ''}
               </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto relative no-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="font-black text-xs uppercase tracking-widest text-slate-400">Carregando Agenda...</p>
              </div>
            ) : (
              <div className="relative" style={{ height: `${(HOUR_END - HOUR_START) * HOUR_HEIGHT}px` }}>
                
                {/* Modern Grid Lines */}
                {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => {
                  const hour = HOUR_START + i
                  return (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 flex items-start group"
                      style={{ top: i * HOUR_HEIGHT }}
                    >
                      <div className="w-20 shrink-0 text-right pr-6 pt-1">
                        <span className="text-xs font-black text-slate-300 group-hover:text-slate-500 transition-colors">
                          {String(hour).padStart(2, '0')}:00
                        </span>
                      </div>
                      <div className="flex-1 border-t border-slate-50 mt-4 group-hover:border-slate-100 transition-colors"></div>
                    </div>
                  )
                })}

                {/* Vertical Separator Line */}
                <div className="absolute left-20 top-0 bottom-0 border-l border-slate-50" />

                {/* Now Indicator */}
                {showNowLine && (
                  <div
                    className="absolute left-20 right-0 z-20 pointer-events-none flex items-center"
                    style={{ top: nowTop }}
                  >
                    <div className="w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-xl -ml-1.5" />
                    <div className="flex-1 border-t-2 border-rose-500 opacity-50" />
                    <div className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg mr-4">AGORA</div>
                  </div>
                )}

                {/* Appointment Cards */}
                <div className="absolute left-[5.5rem] right-8 top-0 h-full">
                  {visibleAppts.length === 0 ? (
                    <div className="flex flex-col items-center h-64 justify-center gap-4 opacity-20 mt-20">
                      <Briefcase className="w-16 h-16 text-slate-300" />
                      <p className="font-black text-lg uppercase tracking-tighter text-slate-400">Sem Compromissos</p>
                    </div>
                  ) : (
                    visibleAppts.map(appt => {
                      const color = profColorMap[appt.professionals?.id] ?? PROF_COLORS[0]
                      const top = timeToTop(appt.start_time)
                      const height = durationToHeight(appt.start_time, appt.end_time)
                      const isConfirmed = appt.status === 'confirmed'
                      const isCancelled = appt.status === 'cancelled'

                      return (
                        <div
                          key={appt.id}
                          onClick={() => { setSelectedAppt(appt); setIsEditOpen(true) }}
                          className={`absolute left-0 right-0 ${color.bg} border ${color.border} border-l-[6px] ${color.accent} rounded-[1.25rem] p-3 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group backdrop-blur-sm ring-1 ${color.ring} flex flex-col justify-center`}
                          style={{ top: top + 4, height: Math.max(height - 8, 80) }}
                        >
                          <div className="flex items-center justify-between gap-2 overflow-hidden mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${color.sub} opacity-70 truncate shrink-0`}>
                              {appt.procedures?.name || 'Consulta'}
                            </span>
                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm shrink-0 
                              ${isConfirmed ? 'bg-emerald-500 text-white' : 
                                isCancelled ? 'bg-rose-500 text-white' : 'bg-amber-400 text-white'}
                            `}>
                               {isConfirmed ? 'Confirmado' : isCancelled ? 'Cancelado' : 'Pendente'}
                            </div>
                          </div>
                          
                          <h4 className={`font-black text-sm md:text-base tracking-tight ${color.text} truncate`}>
                            {appt.leads?.name}
                          </h4>

                          <div className="flex items-center gap-3 mt-1.5 opacity-80 overflow-hidden">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Clock className={`w-3.5 h-3.5 ${color.sub}`} />
                              <span className={`text-[11px] font-black ${color.sub}`}>
                                {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate border-l border-slate-200/30 pl-3">
                              <User className={`w-3.5 h-3.5 ${color.sub}`} />
                              <span className={`text-[11px] font-black ${color.sub} truncate`}>
                                {appt.professionals?.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Functionality Modals */}
      <CreateAppointmentModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={() => { loadDay(selectedDate); loadMonthDots(viewMonth) }}
        selectedDate={selectedDate}
      />

      <EditAppointmentModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => { loadDay(selectedDate); loadMonthDots(viewMonth) }}
        appointment={selectedAppt}
      />

    </div>
  )
}
