import { submitOnboarding } from './actions'

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50/50 p-4">
      <div className="mx-auto flex w-full max-w-lg flex-col justify-center space-y-8 bg-white p-8 border border-slate-200 shadow-sm rounded-xl">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-900">
            Configure sua Clínica
          </h1>
          <p className="text-sm text-slate-500">
            Falta pouco! Precisamos de alguns dados para inicializar o seu ambiente isolado e configurar a sua Assistente de Inteligência Artificial.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            <strong>Falha: </strong> {error}
          </div>
        )}
        
        <form action={submitOnboarding} className="grid gap-6">
          <div className="space-y-4">
            
            <div className="grid gap-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="name">
                Nome da Clínica
              </label>
              <input
                id="name"
                name="name"
                placeholder="Ex: Odonto Premium"
                className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="document">
                  CNPJ / CPF
                </label>
                <input
                  id="document"
                  name="document"
                  placeholder="00.000.000/0000-00"
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-slate-700" htmlFor="phone">
                  WhatsApp Oficial
                </label>
                <input
                  id="phone"
                  name="phone"
                  placeholder="(11) 99999-9999"
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <hr className="my-6 border-slate-200" />
            
            <div className="flex flex-col space-y-2">
              <h2 className="text-lg font-bold text-slate-800">Sua Assistente Virtual</h2>
              <p className="text-xs text-slate-500">Escolha como a Inteligência Artificial vai se apresentar ao falar com seus pacientes no WhatsApp.</p>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="ai_name">
                Nome da Assistente IA
              </label>
              <input
                id="ai_name"
                name="ai_name"
                placeholder="Ex: Sofia, Amanda, Doutor Lucas..."
                defaultValue="Sofia"
                className="flex h-11 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

          </div>
          
          <button 
            type="submit"
            className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Finalizar e Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  )
}
