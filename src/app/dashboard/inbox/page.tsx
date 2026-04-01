'use client'

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchConversations, fetchMessages, sendMessage, toggleAiStatus } from "./actions"
import { ChatList } from "@/components/dashboard/inbox/chat-list"
import { ChatWindow } from "@/components/dashboard/inbox/chat-window"
import { ChatInput } from "@/components/dashboard/inbox/chat-input"
import { PatientDetailsModal } from "@/components/dashboard/patient-details-modal"
import { Loader2 } from "lucide-react"

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const supabase = createClient()

  // 1. Get Clinic ID & Initial Load
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: clinicUser } = await supabase
        .from('clinic_users')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single()
      
      if (clinicUser) {
        setClinicId(clinicUser.clinic_id)
        const initialConvs = await fetchConversations()
        setConversations(initialConvs)
        if (initialConvs.length > 0) setSelectedChat(initialConvs[0])
      }
      setIsLoading(false)
    }
    init()
  }, [])

  // 2. Real-time Subscription for Conversations
  useEffect(() => {
    if (!clinicId) return

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `clinic_id=eq.${clinicId}` },
        async (payload) => {
          // 1. Immediate local update from payload if it matches selected chat
          if (payload.new && (payload.new as any).id === selectedChat?.id) {
            setSelectedChat((prev: any) => prev ? { ...prev, ...(payload.new as any) } : null)
          }

          // 2. Refresh full list to get joined data (leads, last message)
          const updated = await fetchConversations()
          setConversations(updated)
          
          // 3. Ensure selectedChat is current with fresh joined data
          if (selectedChat) {
             const fresh = updated.find(c => c.id === selectedChat.id)
             if (fresh) setSelectedChat(fresh)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [clinicId, selectedChat])

  // 3. Real-time Subscription for Messages
  useEffect(() => {
    if (!selectedChat) return

    // Load initial messages
    fetchMessages(selectedChat.id).then(setMessages)

    const channel = supabase
      .channel(`chat-${selectedChat.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedChat.id}` },
        (payload) => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedChat?.id])

  const handleSend = async (content: string) => {
    if (!selectedChat) return
    await sendMessage(selectedChat.id, content)
  }

  const handleToggleAi = async () => {
    if (!selectedChat) return
    const nextStatus = selectedChat.status === 'bot_handling' ? 'human_handled' : 'bot_handling'
    
    // 1. Optimistic Update
    const prevStatus = selectedChat.status
    const updatedChat = { ...selectedChat, status: nextStatus }
    setSelectedChat(updatedChat)
    setConversations(prev => prev.map(c => c.id === selectedChat.id ? updatedChat : c))

    // 2. Server Action
    try {
      const res = await toggleAiStatus(selectedChat.id, nextStatus)
      if (res && (res as any).error) {
        throw new Error((res as any).error)
      }
    } catch (err: any) {
      // 3. Rollback on failure
      setSelectedChat({ ...selectedChat, status: prevStatus })
      setConversations(prev => prev.map(c => c.id === selectedChat.id ? { ...c, status: prevStatus } : c))
      alert('Falha ao alterar controle do chat: ' + err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Autenticando Conexão...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-104px)] overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl -m-2 relative animate-in zoom-in-95 duration-700">
      
      <ChatList 
        conversations={conversations} 
        selectedChatId={selectedChat?.id} 
        onSelect={setSelectedChat} 
      />

      <div className="flex-1 flex flex-col relative">
        <ChatWindow 
          chat={selectedChat} 
          messages={messages}
          onToggleAi={handleToggleAi}
          onVerNoCrm={() => setIsDetailsOpen(true)}
        />
        
        {selectedChat && (
          <ChatInput 
            onSend={handleSend} 
            placeholder={selectedChat.status === 'bot_handling' ? "S.O.F.I.A está no controle. Deseja intervir?" : "Digite sua mensagem..."}
          />
        )}
      </div>

      {selectedChat && (
        <PatientDetailsModal 
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          patient={selectedChat.leads}
        />
      )}
    </div>
  )
}
