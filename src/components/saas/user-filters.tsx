'use client'

import { Search, Filter, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface UserFiltersProps {
  clinics: any[]
  initialQuery?: string
  initialClinic?: string
}

export function UserFilters({ clinics, initialQuery = '', initialClinic = '' }: UserFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateFilters = useCallback((query: string, clinic: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) params.set('query', query)
    else params.delete('query')
    
    if (clinic) params.set('clinic', clinic)
    else params.delete('clinic')

    startTransition(() => {
      router.push(`/dashboard/saas/users?${params.toString()}`)
    })
  }, [router, searchParams])

  return (
    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/20">
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? 'text-violet-500' : 'text-slate-400'}`} />
          <input 
            type="text" 
            placeholder="Buscar por e-mail ou função..." 
            defaultValue={initialQuery}
            onChange={(e) => updateFilters(e.target.value, initialClinic)}
            className="w-full pl-11 pr-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Clinic Filter */}
        <div className="relative max-w-xs w-full">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select 
            value={initialClinic}
            onChange={(e) => updateFilters(initialQuery, e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:ring-2 focus:ring-violet-500 outline-none appearance-none transition-all cursor-pointer shadow-sm"
          >
            <option value="">Todas as Empresas</option>
            {clinics.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {(initialClinic || initialQuery) && (
          <button 
            onClick={() => router.push('/dashboard/saas/users')}
            className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase hover:text-red-600 transition-colors tracking-widest pl-2"
          >
            <X className="w-3.5 h-3.5" />
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  )
}
