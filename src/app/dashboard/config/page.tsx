'use client'

import { QrCode, SmartphoneNfc, Bot, Save, CheckCircle2, Loader2 } from "lucide-react"
import { useState, useTransition, useEffect } from "react"
import { generateWahaTicket, saveAiSettings, getInitialSession, getWahaStatus, disconnectWahaSession } from "./actions"

export default function ConfigAIPage() {
  const [isGenerating, startGenerating] = useTransition()
  const [isSaving, startSaving] = useTransition()
  const [isDisconnecting, startDisconnecting] = useTransition()
  const [wahaStatus, setWahaStatus] = useState<'DISCONNECTED' | 'CONNECTED'>('DISCONNECTED')
  const [wahaSessionName, setWahaSessionName] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [qrRefreshKey, setQrRefreshKey] = useState(0)

  // 1. Carregar sessão inicial e iniciar polling se necessário
  useEffect(() => {
    async function loadInitial() {
      const session = await getInitialSession()
      if (session) {
        setWahaSessionName(session.session_name)
        // Se já temos o nome, vamos ver se já está conectado no WAHA
        const currentStatus = await getWahaStatus(session.session_name)
        if (currentStatus === 'WORKING') {
          setWahaStatus('CONNECTED')
        }
      }
    }
    loadInitial()
  }, [])

  // 2. Polling de status quando temos uma sessão mas não estamos conectados
  useEffect(() => {
    if (!wahaSessionName || wahaStatus === 'CONNECTED') return

    const interval = setInterval(async () => {
      const currentStatus = await getWahaStatus(wahaSessionName)
      console.log(`[WAHA Polling] Status de ${wahaSessionName}: ${currentStatus}`)
      
      if (currentStatus === 'WORKING') {
        setWahaStatus('CONNECTED')
        clearInterval(interval)
      } else if (currentStatus === 'SCAN_QR_CODE') {
        // Se o status é SCAN_QR_CODE, o QR pode ter expirado. 
        // Vamos forçar um refresh da imagem a cada 20s
        setQrRefreshKey(prev => prev + 1)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [wahaSessionName, wahaStatus])

  const handleGenerateWaha = () => {
    startGenerating(async () => {
      try {
        const res = await generateWahaTicket()
        if (res.success) {
          setWahaSessionName(res.sessionName)
          setWahaStatus('DISCONNECTED') // Reset status para iniciar polling
        }
      } catch (e: any) {
        alert(e.message)
      }
    })
  }

  const handleSaveAi = (formData: FormData) => {
    startSaving(async () => {
      try {
        const res = await saveAiSettings(formData)
        if (res.success) {
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        }
      } catch (e: any) {
        alert(e.message)
      }
    })
  }

  return (
    <div className="flex flex-col space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Ajustes da Clínica e Integração</h2>
          <p className="text-slate-500 mt-1">Gerencie a conexão do seu WhatsApp e como seu robô se comporta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Painel Esquerdo - Conexão WAHA */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center transition-all">
            
            {wahaStatus === 'DISCONNECTED' ? (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <SmartphoneNfc className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Conexão WhatsApp</h3>
                <p className="text-sm text-slate-500 mt-2 mb-6 text-balance">
                  Escaneie o QR Code abaixo para vincular o número WhatsApp da sua clínica ao módulo de CRM.
                </p>
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center w-full aspect-square relative overflow-hidden">
                  {isGenerating ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-3" />
                      <p className="text-sm font-bold text-green-700 animate-pulse text-center">Iniciando motor WhatsApp...</p>
                    </div>
                  ) : wahaSessionName ? (
                    <div className="flex flex-col items-center w-full text-center">
                      <img 
                        src={`/api/waha/qr?session_name=${wahaSessionName}&t=${qrRefreshKey}`} 
                        alt="WhatsApp QR Code" 
                        className="w-full h-auto max-w-[200px] mix-blend-multiply mb-2"
                        onError={(e) => {
                          e.currentTarget.src = ''
                          console.error("Erro ao carregar QR Image")
                        }}
                      />
                      <p className="text-xs font-semibold text-slate-500">Escaneie o código acima agora</p>
                    </div>
                  ) : (
                    <>
                      <QrCode className="w-32 h-32 text-slate-400" />
                      <p className="text-sm font-semibold text-slate-500 mt-4">Aguardando geração...</p>
                    </>
                  )}
                </div>
                
                <button 
                  onClick={handleGenerateWaha}
                  disabled={isGenerating}
                  className="mt-6 w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isGenerating ? 'Iniciando Motor...' : wahaSessionName ? 'Reiniciar Sessão' : 'Gerar Ticket WAHA'}
                </button>

                {wahaSessionName && !isGenerating && (
                  <button 
                    onClick={() => setQrRefreshKey(prev => prev + 1)} 
                    className="mt-2 text-xs font-bold text-slate-500 hover:text-blue-600 underline underline-offset-4"
                  >
                    Não apareceu? Tentar carregar imagem novamente
                  </button>
                )}

                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-400">
                  <div className={`w-2.5 h-2.5 rounded-full ${wahaSessionName ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`}></div> 
                  Status: {wahaSessionName ? 'Aguardando QR Code' : 'Desconectado'}
                </div>
              </>
            ) : (
               <>
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Dispositivo Conectado</h3>
                <p className="text-sm text-slate-500 mt-2 mb-6 text-balance">
                  Sessão ativa e escutada pelo Webhook WAHA. A IA está pronta para responder leads desta clínica.
                </p>
                
                <button
                  onClick={() => startDisconnecting(async () => {
                    try {
                      await disconnectWahaSession()
                      setWahaStatus('DISCONNECTED')
                      setWahaSessionName(null)
                    } catch (e: any) {
                      alert(e.message)
                    }
                  })}
                  disabled={isDisconnecting}
                  className="mt-6 w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDisconnecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Desconectando...</> : 'Desconectar Sessão WAHA'}
                </button>
                <div className="mt-4 flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div> Status: Operacional
                </div>
              </>
            )}

          </div>
        </div>

        {/* Painel Direito - Configuração IA */}
        <div className="md:col-span-2 space-y-6">
          <form action={handleSaveAi} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b bg-slate-50/50 p-6 flex items-center gap-3">
              <Bot className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-lg text-slate-900">Cérebro da Assistente Virtual</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid gap-2">
                <label className="text-sm font-bold text-slate-700">Nome da Assistente</label>
                <input 
                  type="text" 
                  name="assistant_name"
                  defaultValue="Sofia" 
                  required
                  className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Prompt Mestre Base (Instruções Principais)</label>
                  <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded uppercase">Prompt Engineer</span>
                </div>
                <textarea 
                  name="base_prompt"
                  rows={6}
                  required
                  defaultValue="Você é Sofia, a assistente virtual da Odonto Prime. Seja sempre extremamente gentil, clara e prestativa. O seu foco é converter o paciente, sanar dúvidas iniciais e engatilhar agendamentos de acordo com nossa grade de disponibilidade. Não dê diagnósticos complexos de forma alguma."
                  className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
                <p className="text-xs text-slate-500 font-medium">Esse é o cerne do comportamento da IA em todas as mensagens.</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-bold text-slate-700">Tom de Voz</label>
                <select name="tone" className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Profissional e Empático</option>
                  <option>Descontraído e Moderno</option>
                  <option>Estritamente Clínico e Direto</option>
                </select>
              </div>

              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700">Regras de Fallback (Repasse Humano)</label>
                </div>
                <textarea 
                  name="fallback_rules"
                  rows={3}
                  defaultValue="Se o paciente perguntar sobre convênios que não atendemos, ou parecer insatisfeito com um valor, acione imediatamente o repasse humano na função Tool Calling."
                  className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {saveSuccess ? (
                  <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Configurações salvas no Supabase!
                  </p>
                ) : (
                  <div></div>
                )}
                 <button 
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Parâmetros da IA
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
