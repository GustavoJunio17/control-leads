'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Clock, ChevronDown, ChevronUp, Loader2, Check } from 'lucide-react'
import { saveProfessional, deleteProfessional, saveSchedules } from './actions'

const DAYS = [
  { label: 'Domingo',    short: 'Dom', value: 0 },
  { label: 'Segunda',    short: 'Seg', value: 1 },
  { label: 'Terça',      short: 'Ter', value: 2 },
  { label: 'Quarta',     short: 'Qua', value: 3 },
  { label: 'Quinta',     short: 'Qui', value: 4 },
  { label: 'Sexta',      short: 'Sex', value: 5 },
  { label: 'Sábado',     short: 'Sáb', value: 6 },
]

const DEFAULT_START = '08:00'
const DEFAULT_END   = '18:00'

function buildScheduleState(existing: any[]) {
  return DAYS.map(d => {
    const found = existing?.find((s: any) => s.day_of_week === d.value)
    return {
      day_of_week: d.value,
      active: found ? found.active : (d.value >= 1 && d.value <= 5), // seg-sex ativo por padrão
      start_time: found?.start_time?.slice(0, 5) ?? DEFAULT_START,
      end_time: found?.end_time?.slice(0, 5) ?? DEFAULT_END,
    }
  })
}

function ScheduleEditor({ professional, onClose }: { professional: any; onClose: () => void }) {
  const [schedules, setSchedules] = useState(() => buildScheduleState(professional.professional_schedules ?? []))
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function toggle(dayValue: number) {
    setSchedules(s => s.map(d => d.day_of_week === dayValue ? { ...d, active: !d.active } : d))
  }

  function setTime(dayValue: number, field: 'start_time' | 'end_time', value: string) {
    setSchedules(s => s.map(d => d.day_of_week === dayValue ? { ...d, [field]: value } : d))
  }

  function handleSave() {
    startTransition(async () => {
      await saveSchedules(professional.id, schedules)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-500" /> Horários de Atendimento
      </h4>

      <div className="space-y-2">
        {DAYS.map(day => {
          const s = schedules.find(x => x.day_of_week === day.value)!
          return (
            <div key={day.value} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${s.active ? 'bg-blue-50' : 'bg-slate-50'}`}>
              <button
                onClick={() => toggle(day.value)}
                className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${s.active ? 'bg-blue-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${s.active ? 'left-5' : 'left-1'}`} />
              </button>

              <span className={`w-8 text-xs font-bold ${s.active ? 'text-slate-700' : 'text-slate-400'}`}>
                {day.short}
              </span>

              {s.active ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={s.start_time}
                    onChange={e => setTime(day.value, 'start_time', e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-400 font-medium">até</span>
                  <input
                    type="time"
                    value={s.end_time}
                    onChange={e => setTime(day.value, 'end_time', e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-medium flex-1">Não atende</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          {saved ? 'Salvo!' : 'Salvar Horários'}
        </button>
        <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
          Fechar
        </button>
      </div>
    </div>
  )
}

function ProfessionalForm({ initial, onDone }: { initial?: any; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await saveProfessional(fd)
      onDone()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end flex-wrap bg-blue-50 border border-blue-200 rounded-xl p-4">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="flex flex-col gap-1 flex-1 min-w-40">
        <label className="text-xs font-bold text-slate-600">Nome</label>
        <input name="name" required defaultValue={initial?.name ?? ''} placeholder="Dr. Nome Sobrenome"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-40">
        <label className="text-xs font-bold text-slate-600">Especialidade</label>
        <input name="role" required defaultValue={initial?.role ?? ''} placeholder="Ex: Clínico Geral"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button type="submit" disabled={isPending}
        className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors h-[38px]">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {initial?.id ? 'Atualizar' : 'Adicionar'}
      </button>
      <button type="button" onClick={onDone}
        className="text-sm font-medium text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors h-[38px]">
        Cancelar
      </button>
    </form>
  )
}

export default function ProfissionaisClient({ professionals: initial }: { professionals: any[] }) {
  const [professionals, setProfessionals] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [scheduleOpenId, setScheduleOpenId] = useState<string | null>(null)
  const [deletingId, startDeleting] = useTransition()

  function handleDone() {
    setShowForm(false)
    setEditingId(null)
    window.location.reload()
  }

  const COLORS = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700']

  return (
    <div className="flex flex-col space-y-6 max-w-3xl">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Profissionais</h2>
          <p className="text-slate-500 mt-1">Gerencie os profissionais e seus horários de atendimento.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Novo Profissional
          </button>
        )}
      </div>

      {showForm && <ProfessionalForm onDone={handleDone} />}

      <div className="space-y-3">
        {professionals.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm font-medium">
            Nenhum profissional cadastrado. Clique em "Novo Profissional" para começar.
          </div>
        )}

        {professionals.map((prof, i) => {
          const color = COLORS[i % COLORS.length]
          const schedules = prof.professional_schedules ?? []
          const activeDays = schedules.filter((s: any) => s.active).map((s: any) =>
            DAYS.find(d => d.value === s.day_of_week)?.short
          ).filter(Boolean)
          const isOpen = scheduleOpenId === prof.id
          const isEditing = editingId === prof.id

          return (
            <div key={prof.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5">
                {isEditing ? (
                  <ProfessionalForm initial={prof} onDone={handleDone} />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${color}`}>
                        {prof.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{prof.name}</p>
                        <p className="text-sm text-slate-500">{prof.role}</p>
                        {activeDays.length > 0 ? (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Atende: {activeDays.join(', ')}
                          </p>
                        ) : (
                          <p className="text-xs text-orange-400 mt-0.5">Sem horários configurados</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setScheduleOpenId(isOpen ? null : prof.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors
                          ${isOpen ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Horários
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => setEditingId(prof.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startDeleting(async () => {
                          if (!confirm(`Remover ${prof.name}?`)) return
                          await deleteProfessional(prof.id)
                          window.location.reload()
                        })}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isOpen && !isEditing && (
                <div className="px-5 pb-5">
                  <ScheduleEditor professional={prof} onClose={() => setScheduleOpenId(null)} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
