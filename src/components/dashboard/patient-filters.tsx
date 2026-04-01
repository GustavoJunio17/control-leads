'use client'

import { Search, X, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface PatientFiltersProps {
  initialQuery?: string
}

export function PatientFilters({ initialQuery = '' }: PatientFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateSearch = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) params.set('q', query)
    else params.delete('q')

    startTransition(() => {
      router.push(`/dashboard/pacientes?${params.toString()}`)
    })
  }, [router, searchParams])

  return (
    <div className="relative max-w-md w-full">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? 'text-blue-500' : 'text-slate-400'}`} />
      <input 
        type="text" 
        placeholder="Buscar por nome ou telefone..." 
        defaultValue={initialQuery}
        onChange={(e) => updateSearch(e.target.value)}
        className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
      />
      {isPending && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
        </div>
      )}
      {!isPending && initialQuery && (
        <button 
          onClick={() => router.push('/dashboard/pacientes')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      )}
    </div>
  )
}
