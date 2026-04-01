'use client'

import { Search, Filter, Bot, User, Check, Hand, Loader2 } from "lucide-react"
import { useState } from "react"

interface ChatListProps {
  conversations: any[]
  selectedChatId?: string
  onSelect: (chat: any) => void
  loading?: boolean
}

export function ChatList({ conversations, selectedChatId, onSelect, loading }: ChatListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'ai' | 'human'>('all')

  const filtered = conversations.filter(conv => {
    const matchesSearch = conv.leads?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          conv.leads?.phone?.includes(search) ||
                          conv.lastMessage?.content?.toLowerCase().includes(search.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    if (filter === 'ai') return matchesSearch && conv.status === 'bot_handling'
    if (filter === 'human') return matchesSearch && conv.status !== 'bot_handling'
    return matchesSearch
  })

  return (
    <div className="w-85 shrink-0 border-r flex flex-col bg-slate-50/50 backdrop-blur-md relative z-10 animate-in slide-in-from-left duration-500">
      <div className="p-6 border-b bg-white/80 backdrop-blur-xl flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Mensagens</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Inbox Colaborativa</p>
          </div>
          <button className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all border border-slate-100 active:scale-95 shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar paciente ou msg..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-5 py-4 bg-slate-100/50 border-none rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all group-hover:bg-white border border-transparent group-hover:border-slate-100 shadow-inner"
          />
        </div>
        
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-100 backdrop-blur-sm">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'ai', label: 'S.O.F.I.A' },
            { id: 'human', label: 'Humano' }
          ].map((t) => (
            <button 
              key={t.id}
              onClick={() => setFilter(t.id as any)}
              className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${filter === t.id ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 opacity-40">
             <Loader2 className="w-8 h-8 animate-spin" />
             <p className="text-[10px] font-bold uppercase tracking-widest">Sincronizando</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2 opacity-50">
             <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Silêncio Total</p>
             <p className="text-[10px] font-medium text-slate-400">Nenhuma conversa por aqui.</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = selectedChatId === conv.id
            const isBot = conv.status === 'bot_handling'
            const time = conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
            
            return (
              <div 
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`
                  mx-4 my-2 p-4 cursor-pointer rounded-2xl transition-all relative group
                  ${isActive 
                    ? 'bg-white shadow-xl shadow-blue-500/5 ring-1 ring-blue-50 border-none translate-x-1' 
                    : 'hover:bg-white hover:shadow-md border-transparent hover:scale-[1.01]'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 relative transition-transform group-hover:scale-110
                    ${isBot ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}
                  `}>
                    {isBot ? <Bot className="w-6 h-6" /> : conv.leads?.name?.substring(0, 2).toUpperCase()}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors ${isBot ? 'bg-emerald-400' : 'bg-orange-400'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-black text-sm tracking-tight truncate ${isActive ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600 transition-colors'}`}>
                        {conv.leads?.name || 'Inominado'}
                      </span>
                      <span className="text-[9px] font-black text-slate-300 group-hover:text-slate-400">
                        {time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-70">
                      {conv.lastMessage?.direction === 'outbound' && <Check className="w-3 h-3 text-blue-500 shrink-0" />}
                      <p className={`text-[11px] font-bold truncate ${isActive ? 'text-blue-900/60' : 'text-slate-400 group-hover:text-slate-500'}`}>
                        {conv.lastMessage?.content || 'Aguardando interação...'}
                      </p>
                    </div>
                  </div>
                </div>

                {isActive && <div className="absolute left-[-1rem] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
