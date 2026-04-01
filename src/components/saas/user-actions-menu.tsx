'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, Settings, UserMinus, X, Loader2 } from 'lucide-react'
import { unlinkUser } from '@/app/dashboard/saas/actions'
import { UserEditModal } from './user-edit-modal'

interface UserActionsMenuProps {
  associationId: string
  currentRole: string
  userEmail: string
  userId: string
  clinicId: string | null
  clinics: any[]
}

export function UserActionsMenu({ 
  associationId, 
  currentRole, 
  userEmail, 
  userId, 
  clinicId,
  clinics 
}: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.right - 240 + window.scrollX
      })
    }
  }, [isOpen])

  const handleAction = async (action: () => Promise<any>) => {
    setLoading(true)
    try {
      await action()
      setIsOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const dropdown = (
    <>
      <div 
        className="fixed inset-0 z-[9998] bg-black/5 md:bg-transparent" 
        onClick={() => setIsOpen(false)} 
      />
      <div 
        style={{ 
          position: 'absolute', 
          top: coords.top + 8, 
          left: coords.left,
          width: '240px'
        }}
        className="z-[9999] bg-white rounded-[2rem] border border-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.18)] py-3 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-5 py-2 border-b border-slate-50 mb-2 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações de Controle</p>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-50 rounded-full">
            <X className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
        
        <button 
          onClick={() => {
            setIsOpen(false)
            setIsEditModalOpen(true)
          }}
          className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-slate-700 hover:bg-violet-50 hover:text-violet-600 transition-colors group/item"
        >
          <div className="p-2 rounded-xl bg-violet-50 text-violet-600 group-hover/item:scale-110 transition-transform">
            <Settings className="w-4 h-4" />
          </div>
          Configurar Usuário
        </button>

        <div className="h-px bg-slate-50 my-1 mx-5" />

        <button 
          onClick={() => {
            if (confirm('Deseja realmente remover este acesso?')) {
              handleAction(() => unlinkUser(associationId))
            }
          }}
          className="w-full flex items-center gap-3 px-5 py-4 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors group/item"
        >
          <div className="p-2 rounded-xl bg-red-50 text-red-600 group-hover/item:scale-110 transition-transform">
            <UserMinus className="w-4 h-4" />
          </div>
          Remover Acesso
        </button>
      </div>
    </>
  )

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 shadow-sm border border-transparent hover:border-slate-200 bg-white"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreHorizontal className="w-5 h-5" />}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(dropdown, document.body)}

      <UserEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={{
          id: userId,
          associationId,
          email: userEmail,
          role: currentRole,
          clinicId: clinicId
        }}
        clinics={clinics}
      />
    </div>
  )
}
