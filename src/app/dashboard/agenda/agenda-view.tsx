'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react"
import { fetchAgendaData, fetchMonthAppointmentDays } from "./actions"

const HOUR_START = 7
const HOUR_END = 19
const HOUR_HEIGHT = 80 // px por hora

const PROF_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'border-l-blue-500', text: 'text-blue-900', sub: 'text-blue-700', dot: 'bg-blue-500' },
  { bg: 'bg-purple-50', border: 'border-purple-200', accent: 'border-l-purple-500', text: 'text-purple-900', sub: 'text-purple-700', dot: 'bg-purple-500' },
  { bg: 'bg-green-50', border: 'border-green-200', accent: 'border-l-green-500', text: 'text-green-900', sub: 'text-green-700', dot: 'bg-green-500' },
  { bg: 'bg-orange-50', border: 'border-orange-200', accent: 'border-l-orange-500', text: 'text-orange-900', sub: 'text-orange-700', dot: 'bg-orange-500' },
  { bg: 'bg-pink-50', border: 'border-pink-200', accent: 'border-l-pink-500', text: 'text-pink-900', sub: 'text-pink-700', dot: 'bg-pink-500' },
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

  const loadDay = useCallback(async (date: Date) => {
    setLoading(true)
    const { appointments, professionals } = await fetchAgendaData(toDateStr(date))
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

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  const isSelected = (d: number) =>
    d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()

  function selectDay(d: number) {
    const date = new Date(year, month, d)
    setSelectedDate(date)
    if (month !== viewMonth.getMonth()) setViewMonth(date)
  }

  const selectedLabel = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
  const capitalizedLabel = selectedLabel.charAt(0).toUpperCase() + selectedLabel.slice(1)

  // Linha da hora atual
  const nowTop = timeToTop(new Date().toISOString())
  const showNowLine =
    toDateStr(selectedDate) === toDateStr(today) &&
    new Date().getHours() >= HOUR_START &&
    new Date().getHours() < HOUR_END

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Agenda da Clínica</h2>
          <p className="text-slate-500 mt-1">Gerencie os horários dos doutores e disponibilidade para a Inteligência Artificial.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/dashboard/profissionais')}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <User className="h-4 w-4" />
            Profissionais
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      <div className="flex gap-6" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-6">
          {/* Mini calendário */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">{MONTH_NAMES[month]} {year}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMonth(new Date(year, month - 1, 1))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMonth(new Date(year, month + 1, 1))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 mb-2">
              {['D','S','T','Q','Q','S','S'].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* Dias do mês anterior */}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`prev-${i}`} className="p-1 text-slate-300 font-medium">
                  {prevMonthDays - firstDay + i + 1}
                </div>
              ))}
              {/* Dias do mês atual */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1
                const hasAppt = daysWithAppts.includes(d)
                return (
                  <button
                    key={d}
                    onClick={() => selectDay(d)}
                    className={`relative p-1 rounded font-semibold transition-colors
                      ${isSelected(d) ? 'bg-blue-600 text-white' : isToday(d) ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-700'}
                    `}
                  >
                    {d}
                    {hasAppt && !isSelected(d) && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filtro de profissionais */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-sm">Filtro de Profissionais</h3>
            {professionals.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium">Nenhum profissional cadastrado</p>
            ) : (
              <div className="space-y-3">
                {professionals.map((p, i) => {
                  const color = PROF_COLORS[i % PROF_COLORS.length]
                  return (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!hiddenProfs.has(p.id)}
                        onChange={() => toggleProf(p.id)}
                        className="rounded border-slate-300"
                      />
                      <div className={`w-3 h-3 rounded-full ${color.dot}`}></div>
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {p.name}{p.role ? ` (${p.role})` : ''}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Grade diária */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b p-4 bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); setViewMonth(d) }} className="p-1 hover:bg-slate-200 rounded">
                <ChevronLeft className="h-4 w-4 text-slate-500" />
              </button>
              <h3 className="text-lg font-bold text-slate-800">{capitalizedLabel}</h3>
              <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); setViewMonth(d) }} className="p-1 hover:bg-slate-200 rounded">
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
              <button onClick={() => { setSelectedDate(today); setViewMonth(today) }} className="text-xs font-bold text-blue-600 hover:underline ml-1">
                Hoje
              </button>
            </div>
            <span className="text-sm font-semibold text-slate-500">
              {visibleAppts.length} agendamento{visibleAppts.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto relative">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
                Carregando agenda...
              </div>
            ) : (
              <div className="relative" style={{ height: `${(HOUR_END - HOUR_START) * HOUR_HEIGHT}px` }}>
                {/* Linhas de hora */}
                {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => {
                  const hour = HOUR_START + i
                  return (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 flex items-start"
                      style={{ top: i * HOUR_HEIGHT }}
                    >
                      <span className="w-16 shrink-0 text-right pr-3 text-xs font-bold text-slate-400 -mt-2">
                        {String(hour).padStart(2, '0')}:00
                      </span>
                      <div className="flex-1 border-t border-slate-100 mt-0"></div>
                    </div>
                  )
                })}

                {/* Linha da hora atual */}
                {showNowLine && (
                  <div
                    className="absolute left-16 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                    style={{ top: nowTop }}
                  >
                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                )}

                {/* Agendamentos */}
                <div className="absolute left-16 right-4 top-0">
                  {visibleAppts.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-slate-400 text-sm font-medium">
                      Nenhum agendamento para este dia
                    </div>
                  ) : (
                    visibleAppts.map(appt => {
                      const color = profColorMap[appt.professionals?.id] ?? PROF_COLORS[0]
                      const top = timeToTop(appt.start_time)
                      const height = durationToHeight(appt.start_time, appt.end_time)
                      const leadName = appt.leads?.name?.split('@')[0] ?? 'Lead'
                      const procName = appt.procedures?.name ?? 'Procedimento'
                      const profName = appt.professionals?.name ?? ''

                      return (
                        <div
                          key={appt.id}
                          className={`absolute left-0 right-0 ${color.bg} border ${color.border} border-l-4 ${color.accent} rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}
                          style={{ top, height: Math.max(height, 48) }}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`font-bold ${color.text} text-sm leading-tight truncate`}>
                              {procName} — {leadName}
                            </h4>
                            <span className={`text-xs font-bold ${color.sub} shrink-0`}>
                              {appt.status === 'pending' ? 'Pendente' : appt.status === 'confirmed' ? 'Confirmado' : appt.status}
                            </span>
                          </div>
                          {height > 50 && (
                            <>
                              <p className={`text-xs font-medium ${color.sub} flex items-center gap-1 mt-1`}>
                                <Clock className="w-3 h-3" />
                                {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
                              </p>
                              {profName && (
                                <p className="text-xs text-slate-500 mt-1 font-medium">{profName}</p>
                              )}
                            </>
                          )}
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
    </div>
  )
}
