import Link from 'next/link'
import { LayoutGrid, Building2, CreditCard, Activity, ShieldAlert, LogOut } from 'lucide-react'

export default function SuperAdminPage() {
  return (
    <div className="flex bg-slate-100 min-h-screen">
      {/* Sidebar Super Admin */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            OdontoAI <span className="text-indigo-400">Admin</span>
          </h1>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2">
          <Link href="#overview" className="flex items-center gap-3 bg-slate-800 text-white px-3 py-2 rounded-lg font-medium">
            <LayoutGrid className="w-5 h-5 text-indigo-400" /> Visão Geral
          </Link>
          <Link href="#clinics" className="flex items-center gap-3 hover:bg-slate-800 hover:text-white px-3 py-2 rounded-lg transition-colors font-medium">
            <Building2 className="w-5 h-5 text-slate-400" /> Tenants (Clínicas)
          </Link>
          <Link href="#plans" className="flex items-center gap-3 hover:bg-slate-800 hover:text-white px-3 py-2 rounded-lg transition-colors font-medium">
            <CreditCard className="w-5 h-5 text-slate-400" /> Planos SaaS
          </Link>
          <Link href="#system" className="flex items-center gap-3 hover:bg-slate-800 hover:text-white px-3 py-2 rounded-lg transition-colors font-medium">
            <Activity className="w-5 h-5 text-slate-400" /> Monitoramento WAHA
          </Link>
        </div>
        <div className="p-4 border-t border-slate-800">
           <button className="flex w-full items-center gap-3 hover:bg-red-900/50 hover:text-red-400 px-3 py-2 rounded-lg transition-colors text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="h-16 bg-white border-b px-8 flex items-center justify-between shadow-sm shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Painel Matriz (MRR e Métricas)</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200 shadow-sm">
              Sistemas Online
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-200 shadow-sm">
              AD
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Métricas Topo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">MRR (Mensal)</p>
              <p className="text-3xl font-extrabold text-slate-900">R$ 14.500</p>
              <p className="text-sm text-green-600 font-bold mt-2">+12% vs mês anterior</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Clínicas Ativas</p>
              <p className="text-3xl font-extrabold text-slate-900">42</p>
              <p className="text-sm text-green-600 font-bold mt-2">3 novas esta semana</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Mensagens Processadas</p>
              <p className="text-3xl font-extrabold text-slate-900">128k</p>
              <p className="text-sm text-slate-500 font-medium mt-2">Neste mês pelo motor WAHA</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Custo OpenAI Estimado</p>
              <p className="text-3xl font-extrabold text-slate-900">~$45.20</p>
              <p className="text-sm text-orange-600 font-bold mt-2">Atenção ao Rate Limit</p>
            </div>
          </div>

          {/* Tabela de Tenants */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
            <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Tenants (Contas Criadas)</h3>
              <input 
                type="text" 
                placeholder="Buscar clínica..." 
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b text-sm font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Clínica</th>
                    <th className="px-6 py-4 font-semibold">Plano</th>
                    <th className="px-6 py-4 font-semibold">Leads (Mês)</th>
                    <th className="px-6 py-4 font-semibold">Status Sessão WAHA</th>
                    <th className="px-6 py-4 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">Odonto Prime SP</p>
                      <p className="text-sm text-slate-500">ID: 4f9e...2a1b</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        Pro
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">842</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <span className="text-sm font-bold text-green-700">Conectado</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-900 font-bold text-sm bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                  
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">Clínica Sorriso Feliz</p>
                      <p className="text-sm text-slate-500">ID: 8d2c...1f4e</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        Básico
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">15</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <span className="text-sm font-bold text-red-700">Desconectado</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-900 font-bold text-sm bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t text-sm font-medium text-slate-500 flex justify-between">
              <span>Mostrando 2 de 42 clínicas</span>
              <div className="flex gap-4">
                <button className="hover:text-slate-900 disabled:opacity-50">Anterior</button>
                <button className="hover:text-slate-900 text-indigo-600 font-bold">1</button>
                <button className="hover:text-slate-900 font-bold">2</button>
                <button className="hover:text-slate-900">Próxima</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
