'use client'

import { useState } from 'react'
import { X, Shield, User, Mail, Building2, Save, Loader2 } from 'lucide-react'
import { updateUserAssociation, updateUserDetails } from '@/app/dashboard/saas/actions'

interface UserEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    associationId: string
    email: string
    role: string
    clinicId: string | null
  }
  clinics: any[]
}

export function UserEditModal({ isOpen, onClose, user, clinics }: UserEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState(user.email)
  const [role, setRole] = useState(user.role)
  const [clinicId, setClinicId] = useState(user.clinicId || '')

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Update Email if changed
      if (email !== user.email) {
        await updateUserDetails(user.id, email)
      }
      
      // 2. Update Association
      await updateUserAssociation(user.associationId, clinicId || null, role)
      
      onClose()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg text-white">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Configurar Usuário</h2>
              <p className="text-slate-500 font-medium text-sm">Gerencie acessos e informações de identidade.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required 
                  className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-violet-500 transition-all outline-none font-bold text-slate-700" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Unidade</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <select 
                    value={clinicId}
                    onChange={(e) => setClinicId(e.target.value)}
                    className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                  >
                    <option value="">Sem Unidade (Global)</option>
                    {clinics.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Função</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                  >
                    <option value="user">Usuário Padrão</option>
                    <option value="admin">Administrador</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-violet-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-violet-500/30 hover:bg-violet-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95 text-lg"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
