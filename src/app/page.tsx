export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-blue-600">
          Odonto<span className="text-gray-900">AI</span>
        </h1>
      </div>
      
      <p className="text-gray-600 max-w-lg text-center mt-6 text-lg">
        CRM e Motor de Automação de WhatsApp para clínicas odontológicas. Plataforma Multi-Tenant baseada em Next.js e Supabase em ambiente escalável.
      </p>

      <div className="mt-12 flex space-x-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          Cadastrar Clínica
        </button>
        <button className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-3 px-6 rounded-lg transition-colors border border-blue-200">
          Acessar Painel
        </button>
      </div>
    </main>
  )
}
