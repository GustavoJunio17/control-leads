'use client'

import { Paperclip, Send, Loader2, Smile } from "lucide-react"
import { useState } from "react"

interface ChatInputProps {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || loading || disabled) return

    setLoading(true)
    try {
      await onSend(content)
      setContent('')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white/80 backdrop-blur-xl px-8 py-5 flex items-center gap-5 shrink-0 border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] relative z-20"
    >
      <div className="flex gap-2">
        <button type="button" className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all border border-transparent hover:border-slate-100 active:scale-95 shadow-sm">
          <Paperclip className="w-5 h-5" />
        </button>
        <button type="button" className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all border border-transparent hover:border-slate-100 active:scale-95 shadow-sm">
          <Smile className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative group">
        <input 
          type="text" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={disabled ? "S.O.F.I.A está no controle. Assuma o chat para digitar." : (placeholder || "Escreva sua mensagem aqui...")} 
          disabled={disabled || loading}
          className={`w-full rounded-2xl border-none px-6 py-4 text-sm font-bold focus:outline-none transition-all shadow-inner border border-transparent ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-100/50 hover:bg-white focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-100 text-slate-700'}`}
        />
      </div>

      <button 
        type="submit"
        disabled={loading || disabled || !content.trim()}
        className={`
          p-4 rounded-2xl text-white transition-all shadow-xl active:scale-90 flex items-center justify-center gap-2 group
          ${loading || disabled || !content.trim() 
            ? 'bg-slate-200 shadow-none' 
            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
          }
        `}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Send className={`w-6 h-6 ml-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} />
        )}
      </button>
    </form>
  )
}
