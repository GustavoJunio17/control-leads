'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { Bot, CalendarCheck, Handshake, MessageCircle, ArrowRight, CheckCircle2, Building, LineChart } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const WHATSAPP_LINK = "https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20a%20OdontoAI"

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (typeof window === 'undefined') return

    // Pre-animation setup
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)

    // Hero Animations - with a tiny delay to ensure scroll to top is processed
    const tl = gsap.timeline({ delay: 0.1 })
    
    tl.from('.hero-content > *', {
      y: 30,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power4.out',
    })

    // Float animation for mockup
    gsap.to('.mockup-animation', {
      y: -15,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    // Stats counter animation - NO autoAlpha
    gsap.from('.stat-number', {
      scrollTrigger: {
        trigger: '.stats-grid',
        start: 'top 95%',
      },
      textContent: 0,
      duration: 1.5,
      snap: { textContent: 1 },
      ease: 'power1.out'
    })

    // Feature cards - only movement, NO opacity hiding
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '.features-grid',
        start: 'top 95%',
        once: true,
      },
      y: 15,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
    })

    // Manual refresh to ensure everything is visible
    ScrollTrigger.refresh()
  }, { scope: container })

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div ref={container} className="min-h-screen bg-[#fafbff] flex flex-col font-sans overflow-x-hidden selection:bg-blue-100 selection:text-blue-600 scroll-smooth">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-100/40 to-indigo-100/20 blur-[140px] mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-indigo-100/40 to-blue-100/20 blur-[140px] mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-50/30 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b bg-white/70 backdrop-blur-xl top-0 z-50 sticky border-slate-100">
        <div className="flex-1">
          <div className="flex items-center gap-2 font-black text-2xl text-blue-600 tracking-tighter">
            Odonto<span className="text-slate-900">AI</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <a 
            href="#features" 
            onClick={(e) => scrollToSection(e, 'features')}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            Recursos
          </a>
          <a 
            href="#how-it-works" 
            onClick={(e) => scrollToSection(e, 'how-it-works')}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            Como Funciona
          </a>
          <a 
            href="#pricing" 
            onClick={(e) => scrollToSection(e, 'pricing')}
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            Planos
          </a>
        </nav>

        <div className="flex items-center gap-6 flex-1 justify-end">
          <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors hidden lg:block">
            Já sou cliente
          </Link>
          <a 
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] transition-all hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5"
          >
            Falar com Consultor
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-12 md:py-20 flex flex-col items-center text-center max-w-5xl mx-auto relative z-10 hero-content">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-sm font-bold border border-blue-200 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
          Nova IA baseada no GPT-4o Liberada
        </div>
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-6 decoration-clone">
          A secretária <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">perfeita</span> <br className="hidden md:block" /> para sua clínica.
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium">
          Dobre a conversão de pacientes pelo WhatsApp com uma Inteligência Artificial acolhedora que qualifica leads e agenda procedimentos 24h por dia.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <a 
            href={WHATSAPP_LINK} 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full text-lg font-bold shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] transition-all hover:shadow-[0_20px_30px_-10px_rgba(37,99,235,0.3)] hover:-translate-y-1 active:scale-95"
          >
            Falar com Consultor <ArrowRight className="w-5 h-5" />
          </a>
        </div>
        <p className="text-xs text-slate-400 mt-6 font-medium uppercase tracking-widest">Atendimento 24/7 • Setup em 5 minutos • Resultados Imediatos</p>
      </section>

      {/* Social Proof / Interfaces Mockup */}
      <section className="px-6 pb-12 flex justify-center w-full overflow-hidden relative z-10 reveal-section">
        <div className="w-full max-w-5xl bg-white/40 backdrop-blur-md p-3 rounded-3xl border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative mockup-animation">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-400/20 blur-3xl rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-400/20 blur-3xl rounded-full"></div>
          
          {/* Mockup fake do Painel Kanban da Clínica */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden shadow-inner">
            <div className="h-10 bg-slate-100/50 border-b flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/60"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400/60"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/60"></div>
            </div>
            <div className="p-10 grid grid-cols-3 gap-8 opacity-90">
              <div className="h-96 bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 space-y-5">
                <div className="h-4 w-20 bg-blue-100 rounded-full"></div>
                <div className="h-28 w-full bg-slate-50 rounded-lg border border-slate-100/50 shadow-sm"></div>
                <div className="h-28 w-full bg-slate-50 rounded-lg border border-slate-100/50 shadow-sm"></div>
              </div>
              <div className="h-96 bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 space-y-5">
                <div className="h-4 w-28 bg-purple-100 rounded-full"></div>
                <div className="h-28 w-full bg-slate-50 rounded-lg border border-slate-100/50 shadow-sm"></div>
              </div>
              <div className="h-96 bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 space-y-5">
                <div className="h-4 w-20 bg-green-100 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/40 backdrop-blur-sm border-y border-slate-100 px-6 reveal-section stats-grid">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-4xl md:text-6xl font-black text-blue-600 mb-2 stat-number">50</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">+ Clínicas Ativas</p>
          </div>
          <div>
            <p className="text-4xl md:text-6xl font-black text-blue-600 mb-2 stat-number">150</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Mil Mensagens/Mês</p>
          </div>
          <div>
            <p className="text-4xl md:text-6xl font-black text-blue-600 mb-2 stat-number">85</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">% Redução de Vácuo</p>
          </div>
          <div>
            <p className="text-4xl md:text-6xl font-black text-blue-600 mb-2 stat-number">24</p>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Horas de Operação</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 bg-white border-y border-slate-200 px-6 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Tudo que uma clínica moderna precisa em um só lugar.
            </h2>
            <p className="text-lg text-slate-500 font-medium">Esqueça assinar 3 ferramentas diferentes. Nós unimos o melhor CRM com a Inteligência Artificial mais avançada do mercado odontológico.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 features-grid">
            <FeatureCard 
              icon={<Bot />} 
              title="IA Conversacional" 
              desc="A 'Sofia' entende áudios, textos quebrados e emoções. Ela conduz o paciente até fechar o agendamento de forma natural."
              className="feature-card"
            />
            <FeatureCard 
              icon={<MessageCircle />} 
              title="Inbox Omnichannel" 
              desc="Intervenha no WhatsApp sempre que quiser. A IA pausa automaticamente quando a secretária humana entra na conversa."
              className="feature-card"
            />
            <FeatureCard 
              icon={<LineChart />} 
              title="Funil Kanban (CRM)" 
              desc="Visualize de onde vêm os leads do Instagram e Facebook, quais marcaram avaliação e quais fecharam contrato."
              className="feature-card"
            />
            <FeatureCard 
              icon={<CalendarCheck />} 
              title="Agenda Inteligente" 
              desc="O robô checa blocos livres diretamente no calendário cruzando dias dos seus dentistas para oferecer as melhores datas."
              className="feature-card"
            />
            <FeatureCard 
              icon={<Handshake />} 
              title="Acelerador de Fechamento" 
              desc="Alertas e gatilhos de follow-up que impedem a sua equipe de esquecer leads quentes aguardando retorno de orçamento."
              className="feature-card"
            />
            <FeatureCard 
              icon={<Building />} 
              title="Isolamento Total (Tenants)" 
              desc="Seus dados não cruzam com os da concorrência. Arquitetura robusta de segurança garantindo 100% de privacidade HIPAA-like."
              className="feature-card"
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-white/60 backdrop-blur-sm px-6 overflow-hidden relative scroll-mt-24">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Como funciona?</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Em apenas 3 passos sua clínica começa a faturar mais com a Sofia.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="absolute top-[3.5rem] left-0 w-full h-0.5 bg-blue-100 hidden md:block z-0"></div>
            
            <StepItem 
              number="01"
              title="Conecte seu WhatsApp"
              desc="Leia o QR Code e integre seu número oficial ou de atendimento em segundos."
            />
            <StepItem 
              number="02"
              title="Personalize a IA"
              desc="Diga os horários da clínica, procedimentos realizados e o tom de voz da Sofia."
            />
            <StepItem 
              number="03"
              title="Deixe o Lucro Entrar"
              desc="A Sofia começa a atender, qualificar e agendar avaliações 24h por dia automaticamente."
            />
          </div>
        </div>
      </section>

      {/* Comparison Section: Sofia vs. Human */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">O fim do vácuo no WhatsApp.</h2>
            <p className="text-lg text-slate-600 font-medium max-w-xl mx-auto">Compare como a Sofia transforma o atendimento da sua clínica em relação a um processo 100% humano.</p>
          </div>
          
          <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-2xl bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 font-bold text-slate-400 uppercase tracking-widest text-xs">Atributo</th>
                  <th className="p-6 font-bold text-slate-400 uppercase tracking-widest text-xs">Atendente Humano</th>
                  <th className="p-6 font-bold text-blue-600 uppercase tracking-widest text-xs bg-blue-50/30">Inteligência Sofia</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 font-medium">
                <tr className="border-t border-slate-100">
                  <td className="p-6">Tempo de Resposta</td>
                  <td className="p-6 text-slate-400">10 min a 2 horas</td>
                  <td className="p-6 font-bold text-blue-600 bg-blue-50/10">Imediato (3 segundos)</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="p-6">Disponibilidade</td>
                  <td className="p-6 text-slate-400">Horário comercial</td>
                  <td className="p-6 font-bold text-blue-600 bg-blue-50/10">24h por dia, 7 dias/semana</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="p-6">Erro Humano/Esquecimento</td>
                  <td className="p-6 text-slate-400">Frequente em picos</td>
                  <td className="p-6 font-bold text-blue-600 bg-blue-50/10">Zero esquecimento</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="p-6">Custo Estimado</td>
                  <td className="p-6 text-slate-400">R$ 2.500+ /mês</td>
                  <td className="p-6 font-bold text-blue-600 bg-blue-50/10">A partir de R$ 347/mês</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white/40 backdrop-blur-sm px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Quem usa, aprova.</h2>
              <p className="text-lg text-slate-600 font-medium">Clínicas que saíram do caos analógico para a automação lucrativa.</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Dr. Ricardo Santos"
              clinic="Oral Design"
              quote="A Sofia atende meus pacientes às 23h de domingo. Minha secretária chega segunda e já tem 5 avaliações confirmadas."
              image="RS"
            />
            <TestimonialCard 
              name="Dra. Aline Mendes"
              clinic="Sorriso & Arte"
              quote="Antes eu perdia leads do Instagram por demora. Agora o robô qualifica e eu só entro para fechar o orçamento."
              image="AM"
            />
            <TestimonialCard 
              name="Marcos Oliveira"
              clinic="Odonto Prime"
              quote="O melhor investimento que fiz este ano. O ROI foi imediato logo no primeiro mês de uso da plataforma."
              image="MO"
            />
          </div>
        </div>
      </section>
      <section id="pricing" className="py-20 bg-slate-900 px-6 text-white relative overflow-hidden scroll-mt-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Escolha crescer sem atritos.</h2>
          <p className="text-lg text-slate-400 mb-16 font-medium">Planos transparentes baseados no tamanho da sua operação.</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan 1 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-left hover:border-blue-500/50 transition-all hover:-translate-y-1">
              <h3 className="text-2xl font-bold mb-2">Clínica Star</h3>
              <p className="text-slate-400 mb-6 font-medium">Perfeito para quem está escalando os primeiros leads.</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold text-blue-400">R$ 347</span>
                <span className="text-slate-500">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="text-blue-400 w-5 h-5"/> Até 3 Usuários</li>
                <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="text-blue-400 w-5 h-5"/> 1.000 Leads por Mês</li>
                <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="text-blue-400 w-5 h-5"/> IA com regras base</li>
                <li className="flex items-center gap-3 text-slate-300 font-medium"><CheckCircle2 className="text-blue-400 w-5 h-5"/> Suporte Email</li>
              </ul>
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-xl font-bold text-center bg-white text-slate-900 hover:bg-blue-50 transition-colors shadow-lg"
              >
                Consultar Preços
              </a>
            </div>
            
            {/* Plan 2 */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 border border-white/20 text-left shadow-2xl relative transform scale-105 z-10">
              <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                O Mais Usado
              </div>
              <h3 className="text-2xl font-bold mb-2">Sua Própria Franquia</h3>
              <p className="text-blue-100 mb-6 font-medium">Potência máxima do motor GPT-4o para conversão massiva.</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold text-white">R$ 997</span>
                <span className="text-blue-200">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-white font-medium"><CheckCircle2 className="text-blue-300 w-5 h-5"/> Usuários Ilimitados</li>
                <li className="flex items-center gap-3 text-white font-medium"><CheckCircle2 className="text-blue-300 w-5 h-5"/> Leads Ilimitados</li>
                <li className="flex items-center gap-3 text-white font-medium"><CheckCircle2 className="text-blue-300 w-5 h-5"/> Engenharia de Prompts VIP</li>
                <li className="flex items-center gap-3 text-white font-medium"><CheckCircle2 className="text-blue-300 w-5 h-5"/> Reunião de Setup</li>
              </ul>
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-xl font-bold text-center bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Falar com consultor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-12 md:p-24 overflow-hidden relative shadow-2xl shadow-blue-500/20 text-center text-white">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
              Sua clínica no piloto <br /> automático em 10 minutos.
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-12 font-medium">
              Não perca mais nenhum lead por demora no WhatsApp. Recupere o seu tempo e foque no que importa: seus pacientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-600 px-12 py-6 rounded-full text-xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Ativar Sofia Agora <ArrowRight className="w-6 h-6" />
              </a>
            </div>
            <p className="mt-10 text-blue-200 font-bold text-sm uppercase tracking-widest opacity-80">Setup Grátis • Sem Mensalidade de Implantação • IA Pura</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Dúvidas comuns.</h2>
            <p className="text-lg text-slate-600 font-medium">Tudo o que você precisa saber para começar hoje mesmo.</p>
          </div>
          
          <div className="space-y-4">
            <FaqItem 
              question="Preciso de um número de WhatsApp novo?"
              answer="Não. Você pode usar o seu número atual da clínica. A Sofia trabalha em paralelo com a sua equipe humana sem conflitos."
            />
            <FaqItem 
              question="A Sofia entende áudio dos pacientes?"
              answer="Sim! Ela transcreve e entende o contexto de áudios perfeitamente, respondendo em texto de forma natural."
            />
            <FaqItem 
              question="É difícil configurar?"
              answer="Leva menos de 10 minutos. Nós guiamos você no primeiro acesso e a Sofia já sai falando com seus leads no mesmo dia."
            />
            <FaqItem 
              question="Posso pausar a IA a qualquer momento?"
              answer="Com certeza. No seu painel de controle você tem um interruptor 'mestre' e também pode intervir em conversas específicas."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 pt-24 pb-12 px-6 relative z-10 text-white overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="font-black text-3xl text-blue-500 tracking-tighter mb-6">
                Odonto<span className="text-white">AI</span>
              </div>
              <p className="text-slate-400 font-medium max-w-sm mb-8">
                A primeira plataforma de CRM com Inteligência Artificial Generativa exclusiva para o mercado odontológico brasileiro.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer text-slate-400 hover:text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer text-slate-400 hover:text-white">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6 uppercase tracking-widest text-xs text-slate-500">Produto</h4>
              <ul className="space-y-4 text-slate-400 font-bold text-sm">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Sofia IA</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">CRM Kanban</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Agenda Inteligente</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">WhatsApp Inbox</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6 uppercase tracking-widest text-xs text-slate-500">Suporte</h4>
              <ul className="space-y-4 text-slate-400 font-bold text-sm">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Central de Ajuda</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Termos de Uso</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacidade (LGPD)</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Falar com Consultor</li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 opacity-50">
            <p className="text-slate-500 font-medium text-xs tracking-wide">© {new Date().getFullYear()} OdontoAI Labs. Todos os direitos reservados.</p>
            <div className="flex gap-8 text-xs font-bold text-slate-500">
              <span className="hover:text-white transition-colors cursor-pointer">Brasil</span>
              <span className="hover:text-white transition-colors cursor-pointer">English</span>
              <span className="hover:text-white transition-colors cursor-pointer">Español</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc, className }: { icon: React.ReactNode, title: string, desc: string, className?: string }) {
  return (
    <div className={`flex flex-col text-left p-8 rounded-3xl bg-white transition-all border border-slate-100 hover:border-blue-200 hover:shadow-[0_20px_50px_-12px_rgba(37,99,235,0.1)] group ${className}`}>
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  )
}

function TestimonialCard({ name, clinic, quote, image }: { name: string, clinic: string, quote: string, image: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
      <div className="flex gap-1 text-amber-400">
        {[...Array(5)].map((_, i) => <CheckCircle2 key={i} className="w-4 h-4 fill-current" />)}
      </div>
      <p className="text-slate-700 font-medium leading-relaxed italic text-lg">"{quote}"</p>
      <div className="flex items-center gap-4 mt-auto">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-black text-sm border-2 border-white shadow-md">
          {image}
        </div>
        <div>
          <p className="font-black text-slate-900 text-sm leading-none mb-1">{name}</p>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{clinic}</p>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <details className="group rounded-2xl border border-slate-100 bg-white/50 backdrop-blur-sm overflow-hidden transition-all hover:border-blue-200">
      <summary className="flex items-center justify-between p-6 cursor-pointer font-black text-slate-900 list-none">
        {question}
        <span className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-open:rotate-180 transition-transform">
          <ArrowRight className="w-4 h-4 rotate-90" />
        </span>
      </summary>
      <div className="px-6 pb-6 text-slate-600 font-medium leading-relaxed">
        {answer}
      </div>
    </details>
  )
}

function StepItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center relative z-10 group">
      <div className="w-28 h-28 rounded-full bg-white border-4 border-blue-50 flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500 relative">
        <span className="text-4xl font-black text-blue-600">{number}</span>
        <div className="absolute -inset-2 bg-blue-400/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  )
}
