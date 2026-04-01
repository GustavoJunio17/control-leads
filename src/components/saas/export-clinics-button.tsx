'use client'

import { Download } from 'lucide-react'

interface ExportClinicsButtonProps {
  clinics: any[]
}

export function ExportClinicsButton({ clinics }: ExportClinicsButtonProps) {
  const exportToCSV = () => {
    if (!clinics || clinics.length === 0) return

    // CSV Headers
    const headers = ['ID', 'Nome', 'Documento', 'Telefone', 'Plano', 'Status', 'Criado em']
    
    // CSV Rows
    const rows = clinics.map(c => [
      c.id,
      c.name,
      c.document || 'N/A',
      c.phone || 'N/A',
      c.plans?.name || 'Experimental',
      c.active ? 'Ativo' : 'Inativo',
      new Date(c.created_at).toLocaleDateString('pt-BR')
    ])

    // Build CSV Content
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${field}"`).join(','))
    ].join('\n')

    // Download Logic
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `clinicas_odontoai_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button 
      onClick={exportToCSV}
      className="bg-white text-slate-600 px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-slate-50 transition-all border border-slate-200 shadow-sm active:scale-95"
    >
      <Download className="w-4 h-4" />
      Exportar CSV
    </button>
  )
}
