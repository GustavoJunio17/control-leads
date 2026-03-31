'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Calendar, MessageSquareText, Settings, UserSquare2, User, LogOut } from 'lucide-react'
import { logout } from '@/app/login/actions'

interface SidebarProps {
  role?: string | null
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Gestão', adminOnly: true },
  { href: '/dashboard/inbox', icon: MessageSquareText, label: 'WhatsApp Inbox', attendantOnly: true },
  { href: '/dashboard/leads', icon: Users, label: 'CRM & Funil' },
  { href: '/dashboard/agenda', icon: Calendar, label: 'Agenda', attendantOnly: true },
  { href: '/dashboard/pacientes', icon: UserSquare2, label: 'Pacientes' },
  { href: '/dashboard/profissionais', icon: User, label: 'Profissionais', adminOnly: true },
]

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = role === 'admin'

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    if (item.attendantOnly && isAdmin) return false
    return true
  })

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-slate-50">
      <div className="flex h-16 items-center border-b px-6">
        <Link 
          href={isAdmin ? "/dashboard" : "/dashboard/inbox"} 
          className="flex items-center gap-2 font-bold text-blue-600 text-xl"
        >
          Odonto<span className="text-slate-900">AI</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                  isActive
                    ? 'bg-blue-100 text-blue-900 font-bold'
                    : 'text-slate-600 font-medium hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
          
          {isAdmin && (
            <>
              <div className="my-4 border-b border-slate-200"></div>
              
              <Link
                href="/dashboard/config"
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                  pathname === '/dashboard/config'
                    ? 'bg-blue-100 text-blue-900 font-bold'
                    : 'text-slate-600 font-medium hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Settings className="h-5 w-5" />
                Ajustes e IA
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="border-t p-4">
        <button 
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 text-left"
        >
          <LogOut className="h-5 w-5" />
          Sair do Sistema
        </button>
      </div>
    </div>
  )
}
