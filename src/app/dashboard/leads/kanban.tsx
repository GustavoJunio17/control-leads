'use client'

import { Search, Plus, Filter } from "lucide-react"
import { useState } from "react"

const STAGES = [
  { key: 'Novo',        label: '🟢 Novo (Lead)',   empty: 'Nenhum lead novo' },
  { key: 'Qualificado', label: '🔵 Qualificado',   empty: 'Nenhum lead qualificado' },
  { key: 'Negociação',  label: '🟠 Negociação',    empty: 'Nenhum lead em negociação' },
  { key: 'Agendado',    label: '🎉 Agendado',      empty: 'Nenhum agendamento' },
]

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Agora'
  if (mins < 60) return `Há ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}

function convStatus(conversations: any[]) {
  if (!conversations || conversations.length === 0) return null
  const active = conversations.find(c => c.status !== 'closed')
  return active?.status ?? null
}

export default function LeadsKanban({ leads }: { leads: any[] }) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search)
      )
    : leads

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">CRM de Leads</h2>
          <p className="text-slate-500 mt-1">Gerencie seu funil de vendas e oportunidades de pacientes.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar lead, fone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors cursor-pointer">
            <Filter className="h-4 w-4" />
            Filtros
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors cursor-pointer">
            <Plus className="h-4 w-4" />
            Novo Lead
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageLeads = filtered.filter(l => (l.funnel_stage ?? 'Novo') === stage.key)
          return (
            <div key={stage.key} className="w-80 shrink-0 flex flex-col pt-1">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{stage.label}</h3>
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>

              <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2 pb-10">
                {stageLeads.length === 0 ? (
                  <div className="flex items-center justify-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-300 text-sm text-slate-400 font-bold">
                    {stage.empty}
                  </div>
                ) : (
                  stageLeads.map(lead => {
                    const status = convStatus(lead.conversations)
                    const isBot = status === 'bot_handling'
                    const isHuman = status === 'human_waiting' || status === 'human_handled'

                    return (
                      <div
                        key={lead.id}
                        className="bg-white p-5 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                            {stage.key}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {relativeTime(lead.created_at)}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 leading-snug text-lg">{lead.name}</p>
                        <p className="text-sm text-slate-500 font-medium">{lead.phone.split('@')[0]}</p>
                        <div className="mt-4">
                          {isBot && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                              Bot Trabalhando
                            </div>
                          )}
                          {isHuman && (
                            <div className="flex items-center gap-2 text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-100 w-fit">
                              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                              Escalonou p/ Humano
                            </div>
                          )}
                          {!status && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded w-fit">
                              Sem conversa ativa
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
