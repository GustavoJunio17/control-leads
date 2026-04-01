'use client'

import { useState } from 'react'
import { Link2, X, User, ShieldCheck, UserPlus, Fingerprint, Mail, Lock, Plus, Send } from 'lucide-react'
import { linkUserToClinic, createAndLinkUser, inviteUser } from '@/app/dashboard/saas/actions'

interface UserAccessModalProps {
  clinics: any[]
}

export function UserAccessModal({ clinics }: UserAccessModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'link' | 'invite'>('create')

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-violet-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-xl shadow-violet-500/30 hover:bg-violet-700 transition-all active:scale-95"
      >
        <UserPlus className="w-5 h-5" />
        Novo Colaborador
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg text-white">
              {mode === 'create' ? <UserPlus className="w-7 h-7" /> : mode === 'invite' ? <Send className="w-7 h-7" /> : <Link2 className="w-7 h-7" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === 'create' ? 'Cadastrar Direto' : mode === 'invite' ? 'Enviar Convite' : 'Vincular Existente'}
              </h2>
              <p className="text-slate-500 font-medium text-sm">
                {mode === 'create' ? 'Crie uma conta e senha agora.' : mode === 'invite' ? 'A pessoa cria a própria conta via e-mail.' : 'Conecte um UUID já existente.'}
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button 
              onClick={() => setMode('create')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'create' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Criar
            </button>
            <button 
              onClick={() => setMode('invite')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'invite' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Convidar
            </button>
            <button 
              onClick={() => setMode('link')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'link' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Link UUID
            </button>
          </div>

          <form action={async (formData) => {
            if (mode === 'create') {
              await createAndLinkUser(formData)
            } else if (mode === 'invite') {
              await inviteUser(formData)
            } else {
              await linkUserToClinic(formData)
            }
            setIsOpen(false)
          }} className="grid gap-6">
            
            {mode === 'create' || mode === 'invite' ? (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">E-mail de Acesso</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      name="email" 
                      type="email"
                      required 
                      placeholder="email@clinica.com.br" 
                      className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-violet-500 transition-all outline-none font-bold text-slate-700" 
                    />
                  </div>
                </div>
                {mode === 'create' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Senha Provisória</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        name="password" 
                        type="password"
                        required 
                        placeholder="••••••••" 
                        className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-violet-500 transition-all outline-none font-bold text-slate-700" 
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Identificador do Usuário (UUID)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    name="user_id" 
                    required 
                    placeholder="Cole o UUID do usuário aqui..." 
                    className="w-full pl-11 pr-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-violet-500 transition-all outline-none font-bold text-slate-700" 
                  />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Unidade Destino</label>
                <select name="clinic_id" required className="w-full px-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none font-bold text-slate-700 appearance-none">
                  <option value="">Escolher Unidade</option>
                  {clinics.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Função</label>
                <select name="role" required className="w-full px-5 py-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none font-bold text-slate-700 appearance-none">
                  <option value="user">Usuário (Padrão)</option>
                  <option value="admin">Administrador (Unidade)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full bg-violet-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-violet-500/20 hover:bg-violet-700 transition-all flex items-center justify-center gap-3 mt-4 active:scale-95 text-lg">
              {mode === 'create' ? <Plus className="w-6 h-6" /> : mode === 'invite' ? <Send className="w-6 h-6" /> : <Link2 className="w-6 h-6" />}
              {mode === 'create' ? 'Finalizar Cadastro' : mode === 'invite' ? 'Enviar Convite por E-mail' : 'Efetivar Vínculo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
