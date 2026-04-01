'use client'

import { Bot, Check, CheckCheck } from "lucide-react"

interface Message {
  id: string
  content: string
  direction: 'inbound' | 'outbound'
  sent_by?: string
  created_at: string
}

export function MessageBubble({ message, searchQuery }: { message: Message, searchQuery?: string }) {
  const isOutbound = message.direction === 'outbound'
  const isBot = message.sent_by === 'bot'
  const time = new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const renderContent = () => {
    if (!searchQuery?.trim()) return message.content
    
    const parts = message.content.split(new RegExp(`(${searchQuery})`, 'gi'))
    return (
      <>
        {parts.map((part, i) => (
          <span 
            key={i} 
            className={part.toLowerCase() === searchQuery.toLowerCase() ? 'bg-yellow-300 text-slate-900 rounded-sm' : ''}
          >
            {part}
          </span>
        ))}
      </>
    )
  }

  return (
    <div id={`msg-${message.id}`} className={`flex w-full ${isOutbound ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`
        max-w-[70%] group relative px-4 py-3 rounded-[1.25rem] shadow-sm transition-all
        ${isOutbound 
          ? 'bg-blue-600 text-white rounded-tr-none hover:shadow-blue-500/20' 
          : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 hover:shadow-md'
        }
      `}>
        {isBot && (
          <div className="flex items-center gap-1 mb-1 text-[10px] font-black uppercase tracking-widest opacity-70">
            <Bot className="w-3 h-3" />
            S.O.F.I.A (IA)
          </div>
        )}
        
        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{renderContent()}</p>
        
        <div className={`flex items-center justify-end gap-1 mt-1.5 opacity-60`}>
          <span className="text-[10px] font-bold">{time}</span>
          {isOutbound && (
            <CheckCheck className="w-3 h-3" />
          )}
        </div>

        {/* Decorative elements */}
        <div className={`
          absolute top-0 w-3 h-3 transition-transform
          ${isOutbound 
            ? '-right-2 bg-blue-600 rounded-bl-full group-hover:scale-110' 
            : '-left-2 bg-white border-l border-t border-slate-100 rounded-br-full group-hover:scale-110'
          }
        `} />
      </div>
    </div>
  )
}
