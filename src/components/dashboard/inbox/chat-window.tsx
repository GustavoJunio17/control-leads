'use client'

import { Bot, Hand, User, Clock, Search, MoreVertical, Loader2, MessageSquare, X, Trash2, CheckCircle2, UserCircle, ChevronUp, ChevronDown } from "lucide-react"
import { MessageBubble } from "./message-bubble"
import { SideProfile } from "./side-profile"
import { useEffect, useRef, useState, useMemo } from "react"

interface ChatWindowProps {
  chat: any
  messages: any[]
  onToggleAi: () => void
  onVerNoCrm: () => void
  loading?: boolean
}

export function ChatWindow({ chat, messages, onToggleAi, onVerNoCrm, loading }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [searchIndex, setSearchIndex] = useState(0)

  // Find all matching message indices
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return messages
      .map((m, index) => m.content.toLowerCase().includes(searchQuery.toLowerCase()) ? m.id : null)
      .filter(id => id !== null) as string[]
  }, [messages, searchQuery])

  useEffect(() => {
    if (searchResults.length > 0) {
      setSearchIndex(0)
      scrollToMessage(searchResults[0])
    }
  }, [searchResults])

  const scrollToMessage = (id: string) => {
    const el = document.getElementById(`msg-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleNextSearch = () => {
    const next = (searchIndex + 1) % searchResults.length
    setSearchIndex(next)
    scrollToMessage(searchResults[next])
  }

  const handlePrevSearch = () => {
    const prev = (searchIndex - 1 + searchResults.length) % searchResults.length
    setSearchIndex(prev)
    scrollToMessage(searchResults[prev])
  }

  useEffect(() => {
    if (!isSearching) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, isSearching])

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] p-12 text-center animate-in fade-in duration-700">
         <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-8 relative group cursor-default">
            <Bot className="w-16 h-16 text-blue-600 transition-transform group-hover:scale-110 duration-500" />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-[#f0f2f5] flex items-center justify-center shadow-lg">
               <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            </div>
         </div>
         <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Seu Atendimento Online</h3>
         <p className="text-slate-500 font-medium max-w-sm leading-relaxed">Selecione uma conversa ao lado para começar a gerenciar seus leads e interagir em tempo real.</p>
      </div>
    )
  }

  const isBot = chat.status === 'bot_handling'

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <div className="flex-1 flex flex-col bg-[#efeae2] relative z-0 overflow-hidden animate-in fade-in slide-in-from-right duration-500 shadow-[-10px_0_20px_rgba(0,0,0,0.02)]">
        
        {/* Premium Header */}
        <div className="h-20 bg-white/80 backdrop-blur-xl border-b px-8 flex items-center justify-between shadow-sm z-20 shrink-0">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => setIsProfileOpen(true)}>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                {chat.leads?.name?.substring(0, 2).toUpperCase()}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-md transition-colors ${isBot ? 'bg-emerald-500' : 'bg-orange-500'}`} />
            </div>
            <div className="cursor-pointer group" onClick={() => setIsProfileOpen(true)}>
              <h2 className="font-black text-slate-900 tracking-tight text-lg group-hover:text-blue-600 transition-colors">{chat.leads?.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">WhatsApp:</span>
                <p className="text-xs text-blue-600 font-black">+{chat.leads?.phone.split('@')[0]}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isSearching ? (
              <div className="flex items-center bg-slate-100 rounded-2xl px-3 py-1.5 animate-in slide-in-from-right duration-300 ring-1 ring-slate-200 shadow-inner">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input 
                  autoFocus
                  placeholder="Buscar na conversa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-48"
                />
                
                {searchResults.length > 0 && (
                   <div className="flex items-center gap-1 border-l border-slate-200 ml-2 pl-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase mr-1">{searchIndex + 1}/{searchResults.length}</span>
                      <button onClick={handlePrevSearch} className="p-1 hover:bg-slate-200 rounded text-slate-600"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <button onClick={handleNextSearch} className="p-1 hover:bg-slate-200 rounded text-slate-600"><ChevronDown className="w-3.5 h-3.5" /></button>
                   </div>
                )}

                <button onClick={() => { setIsSearching(false); setSearchQuery('') }} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSearching(true)}
                className="p-3 bg-slate-50 hover:bg-white rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm border border-transparent hover:border-slate-100 active:scale-95"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`p-3 rounded-2xl transition-all shadow-sm border active:scale-95 ${showMenu ? 'bg-white text-blue-600 border-slate-100 shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-white hover:border-slate-100'}`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showMenu && (
                <div 
                   onMouseLeave={() => setShowMenu(false)}
                   className="absolute right-0 mt-3 w-60 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 p-2 z-[100] animate-in zoom-in-95 duration-200 origin-top-right overflow-hidden"
                >
                   <button onClick={() => { setIsProfileOpen(true); setShowMenu(false) }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 rounded-xl transition-colors text-left text-slate-600 group">
                      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                         <UserCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest leading-none group-hover:text-blue-900">Ver Perfil Completo</span>
                   </button>
                   <div className="h-px bg-slate-100 my-2" />
                   <button onClick={() => setShowMenu(false)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 rounded-xl transition-colors text-left text-red-500 group">
                      <div className="p-2 bg-red-100/50 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
                         <Trash2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest leading-none">Limpar Histórico</span>
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Indicator Strip */}
        <div className={`px-8 py-3 flex items-center justify-between shrink-0 border-b relative z-10 backdrop-blur-md transition-colors duration-500 shadow-sm ${isBot ? 'bg-emerald-50/80 border-emerald-100' : 'bg-orange-50/80 border-orange-100'}`}>
          <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] ${isBot ? 'text-emerald-700' : 'text-orange-700'}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isBot ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500'}`} />
            {isBot ? 'S.O.F.I.A está conduzindo este paciente' : 'Atendimento pausado. Você assumiu o chat.'}
          </div>
          <button 
            onClick={onToggleAi}
            className={`
              px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 active:scale-95
              ${isBot 
                ? 'bg-orange-600 text-white shadow-orange-500/20 hover:bg-orange-700' 
                : 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700'
              }
            `}
          >
            {isBot ? <Hand className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            {isBot ? 'Intervir / Assumir' : 'Devolver para S.O.F.I.A'}
          </button>
        </div>

        {/* Messages Feed */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#efeae2] flex flex-col no-scrollbar relative"
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shadow-inner" />
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Decriptando conversa...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
              <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-500">
                Novos tempos começam com um Olá.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} searchQuery={searchQuery} />
            ))
          )}
        </div>
      </div>

      <SideProfile 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        patient={chat.leads}
      />
    </div>
  )
}
