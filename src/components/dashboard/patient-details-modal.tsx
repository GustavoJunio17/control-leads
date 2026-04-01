'use client'

import { useState } from 'react'
import { X, User, Mail, Fingerprint, Calendar, MapPin, Save, Loader2, FileText, CheckCircle2 } from 'lucide-react'
import { updatePatientData } from '@/app/dashboard/pacientes/actions'

interface PatientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  patient: {
    id: string
    name: string
    phone: string
    email?: string
    cpf?: string
    birth_date?: string
    address?: string
    city?: string
    state?: string
    cep?: string
  }
}

export function PatientDetailsModal({ isOpen, onClose, patient }: PatientDetailsModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: patient.email || '',
    cpf: patient.cpf || '',
    birth_date: patient.birth_date || '',
    address: patient.address || '',
    city: patient.city || '',
    state: patient.state || '',
    cep: patient.cep || ''
  })

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updatePatientData(patient.id, formData)
      onClose()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative text-left">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg text-white">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Perfil do Paciente</h2>
              <p className="text-slate-500 font-medium text-sm">Dados detalhados e informações cadastrais.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Seção Identidade */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-blue-500 rounded-full" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identidade & Contato</h3>
               </div>
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none ring-1 ring-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all text-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">CPF</label>
                    <div className="relative">
                      <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        value={formData.cpf}
                        onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                        placeholder="000.000.000-00"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none ring-1 ring-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all text-sm" 
                      />
                    </div>
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 ml-1">Data de Nascimento</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      value={formData.birth_date}
                      onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                      placeholder="DD/MM/AAAA"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none ring-1 ring-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all text-sm" 
                    />
                  </div>
               </div>
            </div>

            {/* Seção Endereço */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-1 bg-blue-500 rounded-full" />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Localização</h3>
               </div>
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">CEP</label>
                    <input 
                      value={formData.cep}
                      onChange={(e) => setFormData({...formData, cep: e.target.value})}
                      placeholder="00000-000"
                      className="w-full px-4 py-3 bg-slate-50 border-none ring-1 ring-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all text-sm" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">Estado</label>
                    <input 
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      placeholder="Ex: SP"
                      className="w-full px-4 py-3 bg-slate-50 border-none ring-1 ring-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all text-sm" 
                    />
                  </div>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 ml-1">Cidade</label>
                  <input 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-none ring-1 ring-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all text-sm" 
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 ml-1">Endereço</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none ring-1 ring-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 transition-all text-sm" 
                    />
                  </div>
               </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95 text-lg"
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
