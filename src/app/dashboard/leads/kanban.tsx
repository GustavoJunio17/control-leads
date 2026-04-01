'use client'

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Filter, Clock, MessageCircle, User, Zap, MoreHorizontal, CheckCircle2, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { updateLeadStage } from "./actions"
import { CreateLeadModal } from "@/components/dashboard/create-lead-modal"
import { PatientDetailsModal } from "@/components/dashboard/patient-details-modal"

const STAGES = [
  { key: 'Novo',        label: '🚀 Novo Lead',      color: 'bg-blue-500',   light: 'bg-blue-50',    text: 'text-blue-600' },
  { key: 'Qualificado', label: '💎 Qualificado',   color: 'bg-violet-500', light: 'bg-violet-50',  text: 'text-violet-600' },
  { key: 'Negociação',  label: '🤝 Negociação',    color: 'bg-amber-500',  light: 'bg-amber-50',   text: 'text-amber-600' },
  { key: 'Agendado',    label: '📅 Agendado',      color: 'bg-emerald-500',light: 'bg-emerald-50', text: 'text-emerald-600' },
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

export default function LeadsKanban({ leads: initialLeads }: { leads: any[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  const filtered = useMemo(() => {
    if (!search.trim()) return leads
    const q = search.toLowerCase()
    return leads.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.phone.includes(q)
    )
  }, [leads, search])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("leadId", id)
    setDraggingId(id)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, stageKey: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData("leadId")
    setDraggingId(null)

    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.funnel_stage === stageKey) return

    // Optimistic Update
    const oldLeads = [...leads]
    setLeads(leads.map(l => l.id === leadId ? { ...l, funnel_stage: stageKey } : l))

    try {
      await updateLeadStage(leadId, stageKey)
    } catch (err) {
      setLeads(oldLeads)
      alert("Erro ao mover lead")
    }
  }

  return (
    <div className="flex h-full flex-col space-y-8 animate-in fade-in duration-500">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">
            <Zap className="w-4 h-4" />
            CRM & Pipeline
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Funil de Vendas</h2>
          <p className="text-lg text-slate-500 font-medium">Acompanhe e mova seus leads através do funil comercial.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Buscar lead, fone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-11 pr-5 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-72 shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-8 no-scrollbar">
        {STAGES.map(stage => {
          const stageLeads = filtered.filter(l => (l.funnel_stage ?? 'Novo') === stage.key)
          
          return (
            <div 
              key={stage.key} 
              className="w-80 shrink-0 flex flex-col pt-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-5 px-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${stage.color} shadow-[0_0_8px_rgba(0,0,0,0.15)]`} />
                  <h3 className="font-black text-slate-700 text-xs uppercase tracking-[0.1em]">{stage.label}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-lg ${stage.light} ${stage.text} text-[10px] font-black shadow-sm`}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Column Body */}
              <div className={`flex-1 flex flex-col gap-4 p-2 rounded-[2rem] transition-colors duration-300 ${draggingId ? 'bg-slate-50/50 ring-2 ring-dashed ring-slate-200' : 'bg-transparent'}`}>
                {stageLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-white/40 backdrop-blur-sm rounded-[1.5rem] border border-dashed border-slate-200 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-3 text-slate-300">
                       <Filter className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Limpo</p>
                  </div>
                ) : (
                  stageLeads.map(lead => {
                    const activeConv = lead.conversations?.find((c: any) => c.status !== 'closed')
                    const status = activeConv?.status ?? null
                    const isBot = status === 'bot_handling'
                    const isHuman = status && status !== 'bot_handling'
                    const isDragging = draggingId === lead.id

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedLead(lead)}
                        className={`
                          bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm
                          hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 
                          transition-all cursor-pointer group relative
                          ${isDragging ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}
                          ${isBot ? 'ring-1 ring-emerald-100' : isHuman ? 'ring-1 ring-orange-100' : ''}
                        `}
                      >
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${isBot ? 'bg-emerald-500 animate-pulse' : isHuman ? 'bg-orange-500' : 'bg-slate-300'}`} />
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                                {isBot ? 'S.O.F.I.A Ativa' : isHuman ? 'Atenção Humana' : 'Sem Interação'}
                              </span>
                           </div>
                           <span className="text-[10px] font-bold text-slate-300 group-hover:text-slate-400 transition-colors">
                              {relativeTime(lead.created_at)}
                           </span>
                        </div>

                        <h4 className="font-black text-slate-900 leading-tight mb-1 text-base tracking-tight group-hover:text-blue-600 transition-colors">
                          {lead.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                           <Phone className="w-3 h-3" />
                           {lead.phone.split('@')[0]}
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4">
                           <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-lg bg-slate-50 border border-white flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                 {lead.name[0]}
                              </div>
                           </div>
                           <div className="p-1 px-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                              <MoreHorizontal className="w-4 h-4" />
                           </div>
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

      {/* Modals */}
      <CreateLeadModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={() => router.refresh()} 
      />

      {selectedLead && (
        <PatientDetailsModal 
          isOpen={!!selectedLead} 
          onClose={() => setSelectedLead(null)} 
          patient={selectedLead} 
        />
      )}

    </div>
  )
}
