'use client'

import { Search, MoreVertical, Paperclip, Send, Bot, User, Check, Hand, Clock, Loader2, Filter } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { fetchConversations, fetchMessages, sendMessage, toggleAiStatus } from "./actions"
import { createClient } from "@/lib/supabase/client"

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // 1. Carregar conversas iniciais
  useEffect(() => {
    async function load() {
      const data = await fetchConversations()
      setConversations(data)
      setIsLoading(false)
      
      // Se tiver conversas e nenhuma selecionada, seleciona a primeira
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0])
      }
    }
    load()
  }, [])

  // 2. Carregar mensagens quando mudar o chat
  useEffect(() => {
    if (!selectedChat) return
    
    async function loadMsgs() {
      const msgs = await fetchMessages(selectedChat.id)
      setMessages(msgs)
    }
    loadMsgs()

    // Polling de mensagens a cada 3 segundos (fallback para Realtime)
    const interval = setInterval(loadMsgs, 3000)
    return () => clearInterval(interval)
  }, [selectedChat])

  // 3. Polling da lista de conversas a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchConversations()
      setConversations(data)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Scroll automático para o fim das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newMessage.trim() || !selectedChat || isSending) return

    setIsSending(true)
    try {
      await sendMessage(selectedChat.id, newMessage)
      setNewMessage("")
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsSending(false)
    }
  }

  const handleToggleAi = async () => {
    if (!selectedChat) return
    const nextStatus = selectedChat.status === 'bot_handling' ? 'human_handled' : 'bot_handling'
    
    try {
      await toggleAiStatus(selectedChat.id, nextStatus)
      setSelectedChat({ ...selectedChat, status: nextStatus })
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm -m-2 mt-0 relative">
      
      {/* Lista de Conversas (Esquerda) */}
      <div className="w-80 shrink-0 border-r flex flex-col bg-slate-50 relative z-10">
        <div className="p-4 border-b bg-white flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Mensagens</h2>
            <div className="flex gap-1 text-slate-500">
              <button className="p-1 hover:bg-slate-100 rounded text-slate-500"><Filter className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button className="flex-1 px-3 py-1 text-xs font-bold bg-white text-slate-800 rounded shadow-sm text-center">Todos</button>
            <button className="flex-1 px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 text-center">IA</button>
            <button className="flex-1 px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 text-center">Humano</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-400">Nenhuma conversa encontrada.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`flex px-4 py-3 cursor-pointer border-b transition-colors ${selectedChat?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-100 border-transparent'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 mr-3 ${conv.status === 'bot_handling' ? 'bg-green-100 text-green-600' : 'bg-blue-200 text-blue-700'}`}>
                  {conv.status === 'bot_handling' ? <Bot className="w-6 h-6" /> : conv.leads?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-semibold truncate ${selectedChat?.id === conv.id ? 'text-blue-900' : 'text-slate-900'}`}>
                      {conv.leads?.name || 'Paciente'}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {conv.last_message_at ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(conv.last_message_at)) : ''}
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    {conv.lastMessage?.direction === 'outbound' && <Check className="w-3 h-3 text-blue-500 shrink-0" />}
                    <p className="text-xs text-slate-500 truncate">{conv.lastMessage?.content || 'Iniciando conversa...'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área da Conversa (Centro) */}
      <div className="flex-1 flex flex-col bg-[#efeae2] relative z-0">
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
             <Bot className="w-20 h-20 mb-4 opacity-20" />
             <p className="text-lg font-medium">Selecione uma conversa para começar</p>
          </div>
        ) : (
          <>
            {/* Header Chat */}
            <div className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">
                   {selectedChat.leads?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">{selectedChat.leads?.name}</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-xs text-slate-500 font-medium">+{selectedChat.leads?.phone}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
                  <Clock className="w-4 h-4" />
                  Ver no CRM
                </button>
                <div className="h-6 w-px bg-slate-200"></div>
                <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><Search className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Status Strip */}
            <div className={`px-6 py-2 flex items-center justify-between shrink-0 border-b ${selectedChat.status === 'bot_handling' ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
              <div className={`flex items-center gap-2 text-sm font-semibold ${selectedChat.status === 'bot_handling' ? 'text-green-700' : 'text-orange-700'}`}>
                {selectedChat.status === 'bot_handling' ? <Bot className="w-4 h-4" /> : <Hand className="w-4 h-4" />}
                {selectedChat.status === 'bot_handling' ? 'A Sofia está atendendo este paciente' : 'Atendimento assumido por Humano'}
              </div>
              <button 
                onClick={handleToggleAi}
                className={`bg-white border px-3 py-1 rounded text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 ${selectedChat.status === 'bot_handling' ? 'text-orange-700 border-orange-200 hover:bg-orange-50' : 'text-green-700 border-green-200 hover:bg-green-50'}`}
              >
                {selectedChat.status === 'bot_handling' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                {selectedChat.status === 'bot_handling' ? 'Assumir Chat' : 'Devolver para IA'}
              </button>
            </div>

            {/* Histórico Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#efeae2] flex flex-col">
              {messages.map((msg, idx) => (
                <div 
                  key={msg.id || idx}
                  className={`max-w-[75%] p-3 rounded-xl shadow-sm relative ${msg.direction === 'inbound' ? 'self-start bg-white rounded-tl-sm' : 'self-end bg-[#dcf8c6] rounded-tr-sm'}`}
                >
                  <p className="text-slate-800 text-sm">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 text-[10px] font-medium ${msg.direction === 'inbound' ? 'text-slate-400' : 'text-green-700'}`}>
                    {msg.sent_by === 'bot' && <Bot className="w-3 h-3" />}
                    {msg.sent_by === 'bot' ? 'Sofia (IA)' : ''} {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(msg.created_at))}
                    {msg.direction === 'outbound' && <Check className="w-3 h-3 ml-1" />}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Área */}
            <form onSubmit={handleSend} className="bg-slate-100 px-4 py-3 flex items-center gap-3 shrink-0">
              <button type="button" className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={selectedChat.status === 'bot_handling' ? "Asuma o chat para digitar..." : "Digite uma mensagem..."} 
                disabled={selectedChat.status === 'bot_handling' && false} // Permitir digitar mesmo quando bot está ativo, mas avisar talvez?
                className="flex-1 rounded-xl border-none px-4 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <button 
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-full text-white transition-colors shadow-sm"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
              </button>
            </form>
          </>
        )}
      </div>
      
    </div>
  )
}
