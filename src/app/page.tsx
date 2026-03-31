import Link from 'next/link'
import { Bot, CalendarCheck, Handshake, MessageCircle, ArrowRight, CheckCircle2, Building, LineChart } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white top-0 z-50 sticky">
        <div className="flex items-center gap-2 font-black text-2xl text-blue-600 tracking-tighter">
          Odonto<span className="text-slate-900">AI</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
          <Link href="#features" className="hover:text-blue-600 transition-colors">Recursos</Link>
          <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">Como Funciona</Link>
          <Link href="#pricing" className="hover:text-blue-600 transition-colors">Planos</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors hidden sm:block">
            Já sou cliente
          </Link>
          <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5">
            Testar Grátis
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-sm font-bold border border-blue-200 mb-8 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
          Nova IA baseada no GPT-4o Liberada
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
          A secretária <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">perfeita</span> para sua clínica.
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium">
          Dobre a conversão de pacientes pelo WhatsApp com uma Inteligência Artificial acolhedora que qualifica leads e agenda procedimentos 24h por dia, sem você mexer um dedo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5">
            Criar conta da Clínica <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-8 py-4 rounded-full text-lg font-bold transition-all">
            Falar com Consultor
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-4 font-medium uppercase tracking-widest">Sem necessidade de cartão de crédito • Setup em 5 minutos</p>
      </section>

      {/* Social Proof / Interfaces Mockup */}
      <section className="px-6 pb-24 flex justify-center w-full overflow-hidden">
        <div className="w-full max-w-5xl bg-white p-3 rounded-2xl border border-slate-200 shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent z-10 flex items-end justify-center pb-12"></div>
          {/* Mockup fake do Painel Kanban da Clínica */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
            <div className="h-10 bg-slate-100 border-b flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-6 opacity-75">
              <div className="h-80 bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-4">
                <div className="h-8 w-24 bg-blue-100 rounded"></div>
                <div className="h-24 w-full bg-slate-50 rounded border border-slate-100"></div>
                <div className="h-24 w-full bg-slate-50 rounded border border-slate-100"></div>
              </div>
              <div className="h-80 bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-4">
                <div className="h-8 w-32 bg-purple-100 rounded"></div>
                <div className="h-24 w-full bg-slate-50 rounded border border-slate-100"></div>
              </div>
              <div className="h-80 bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-4">
                <div className="h-8 w-24 bg-green-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white border-y border-slate-200 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Tudo que uma clínica moderna precisa em um só lugar.
            </h2>
            <p className="text-lg text-slate-500 font-medium">Esqueça assinar 3 ferramentas diferentes. Nós unimos o melhor CRM com a Inteligência Artificial mais avançada do mercado odontológico.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Bot />} 
              title="IA Conversacional" 
              desc="A 'Sofia' entende áudios, textos quebrados e emoções. Ela conduz o paciente até fechar o agendamento de forma natural."
            />
            <FeatureCard 
              icon={<MessageCircle />} 
              title="Inbox Omnichannel" 
              desc="Intervenha no WhatsApp sempre que quiser. A IA pausa automaticamente quando a secretária humana entra na conversa."
            />
            <FeatureCard 
              icon={<LineChart />} 
              title="Funil Kanban (CRM)" 
              desc="Visualize de onde vêm os leads do Instagram e Facebook, quais marcaram avaliação e quais fecharam contrato."
            />
             <FeatureCard 
              icon={<CalendarCheck />} 
              title="Agenda Inteligente" 
              desc="O robô checa blocos livres diretamente no calendário cruzando dias dos seus dentistas para oferecer as melhores datas."
            />
            <FeatureCard 
              icon={<Handshake />} 
              title="Acelerador de Fechamento" 
              desc="Alertas e gatilhos de follow-up que impedem a sua equipe de esquecer leads quentes aguardando retorno de orçamento."
            />
            <FeatureCard 
              icon={<Building />} 
              title="Isolamento Total (Tenants)" 
              desc="Seus dados não cruzam com os da concorrência. Arquitetura robusta de segurança garantindo 100% de privacidade HIPAA-like."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-900 px-6 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Escolha crescer sem atritos.</h2>
          <p className="text-lg text-slate-400 mb-16 font-medium">Planos transparentes baseados no tamanho da sua operação.</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan 1 */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-left hover:border-slate-500 transition-colors">
              <h3 className="text-2xl font-bold mb-2">Clínica Star</h3>
              <p className="text-slate-400 mb-6 font-medium">Perfeito para quem está escalando os primeiros leads.</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold">R$ 347</span>
                <span className="text-slate-400">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="text-indigo-400 w-5 h-5"/> Até 3 Usuários</li>
                <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="text-indigo-400 w-5 h-5"/> 1.000 Leads por Mês</li>
                <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="text-indigo-400 w-5 h-5"/> IA com regras base</li>
                <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="text-indigo-400 w-5 h-5"/> Suporte Email</li>
              </ul>
              <Link href="/register" className="block w-full py-4 rounded-xl font-bold text-center bg-white text-slate-900 hover:bg-slate-200 transition-colors">
                Começar Basic
              </Link>
            </div>
            
            {/* Plan 2 */}
            <div className="bg-indigo-600 rounded-2xl p-8 border border-indigo-500 text-left shadow-2xl shadow-indigo-500/20 relative transform scale-105 z-10">
              <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                O Mais Usado
              </div>
              <h3 className="text-2xl font-bold mb-2">Sua Própria Franquia</h3>
              <p className="text-indigo-200 mb-6 font-medium">Potência máxima do motor GPT-4o para conversão massiva.</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold">R$ 997</span>
                <span className="text-indigo-200">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-indigo-100 font-medium"><CheckCircle2 className="text-white w-5 h-5"/> Usuários Ilimitados</li>
                <li className="flex items-center gap-3 text-indigo-100 font-medium"><CheckCircle2 className="text-white w-5 h-5"/> Leads Ilimitados</li>
                <li className="flex items-center gap-3 text-indigo-100 font-medium"><CheckCircle2 className="text-white w-5 h-5"/> Engenharia de Prompts VIP</li>
                <li className="flex items-center gap-3 text-indigo-100 font-medium"><CheckCircle2 className="text-white w-5 h-5"/> Reunião de Setup</li>
              </ul>
              <Link href="/register" className="block w-full py-4 rounded-xl font-bold text-center bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-lg">
                Agendar Onboarding Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-black text-2xl text-blue-600 tracking-tighter">
            Odonto<span className="text-slate-900">AI</span>
          </div>
          <p className="text-slate-500 font-medium text-sm">© {new Date().getFullYear()} OdontoAI Labs. Desenvolvido para transformar clínicas.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col text-left p-6 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  )
}
