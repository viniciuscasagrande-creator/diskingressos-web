import { useState } from 'react'
import {
  ShieldCheck, Sliders, Key, CreditCard, QrCode, Barcode,
  Calculator, ShieldAlert, Webhook, Scale, RotateCcw, Terminal,
  BarChart3, Plus, Edit, Save, X, Trash2, Search, RefreshCw,
  Upload, Download, History, HelpCircle, CheckCircle2, ChevronRight, ArrowLeft
} from 'lucide-react'

type GatewayTab =
  | 'config'
  | 'credentials'
  | 'cards'
  | 'pix'
  | 'boletos'
  | 'installment'
  | 'antifraud'
  | 'webhooks'
  | 'conciliation'
  | 'refunds'
  | 'logs'
  | 'reports'

const formatMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export default function FinanceOperatorsGatewaysPage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  const [activeTab, setActiveTab] = useState<GatewayTab>('config')
  const [env, setEnv] = useState<'production' | 'sandbox'>('production')
  const [activeProvider, setActiveProvider] = useState('Pagar.me v5')

  // Form states
  const [captureMode, setCaptureMode] = useState('auto')
  const [timeoutSec, setTimeoutSec] = useState('30')
  const [retries, setRetries] = useState('3')

  const [apiKey, setApiKey] = useState('demo_api_key_pagarme_v5')
  const [secretKey, setSecretKey] = useState('demo_secret_key_prod_mock')
  const [publicKey, setPublicKey] = useState('demo_public_key_client')
  const [merchantId, setMerchantId] = useState('merch_dk_884920194')

  const [acceptVisa, setAcceptVisa] = useState(true)
  const [acceptMaster, setAcceptMaster] = useState(true)
  const [acceptElo, setAcceptElo] = useState(true)
  const [acceptAmex, setAcceptAmex] = useState(true)
  const [acceptHiper, setAcceptHiper] = useState(false)

  const [pixKey, setPixKey] = useState('financeiro@diskingressos.com.br')
  const [pixExpiryMin, setPixExpiryMin] = useState('15')

  const [boletoBank, setBoletoBank] = useState('Santander')
  const [boletoDays, setBoletoDays] = useState('3')
  const [boletoFee, setBoletoFee] = useState('1.50')

  const [antifraudProvider, setAntifraudProvider] = useState('ClearSale Total')
  const [minScore, setMinScore] = useState('85')

  const [webhookUrl, setWebhookUrl] = useState('https://api.diskingressos.com.br/v1/webhooks/payments')

  const handleGlobalAction = (action: string) => {
    switch (action) {
      case 'novo':
        notify?.('Abrindo assistente de novo gateway / credencial...')
        break
      case 'editar':
        notify?.('Modo de edição habilitado para todos os parâmetros!')
        break
      case 'salvar':
        notify?.('Todas as configurações do Gateway foram salvas com sucesso!')
        break
      case 'cancelar':
        notify?.('Alterações canceladas e restauradas do servidor.')
        break
      case 'excluir':
        if (confirm('Deseja realmente remover as configurações deste gateway?')) {
          notify?.('Gateway desativado.')
        }
        break
      case 'pesquisar':
        notify?.('Filtro de busca ativado.')
        break
      case 'atualizar':
        notify?.('Sincronização com o Gateway realizada em tempo real!')
        break
      case 'importar':
        notify?.('Selecione o arquivo JSON com o layout de taxas.')
        break
      case 'exportar':
        notify?.('Exportando relatório de configuração e logs...')
        break
      case 'historico':
        notify?.('Carregando histórico de alterações de credenciais...')
        break
      case 'ajuda':
        notify?.('Consulte a documentação técnica da API DiskIngressos Gateway.')
        break
      default:
        break
    }
  }

  const handleTestConnection = () => {
    notify?.(`Testando conexão com ${activeProvider} em ambiente ${env.toUpperCase()}... Conexão OK (Latência 42ms)!`)
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => (onBack ? onBack() : onNavigate ? onNavigate('finance-dashboard') : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Global Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-wrap items-center gap-2 shadow-sm">
        <button onClick={() => handleGlobalAction('novo')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition">
          <Plus size={13} className="text-emerald-400" /> Novo
        </button>
        <button onClick={() => handleGlobalAction('editar')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition">
          <Edit size={13} className="text-sky-400" /> Editar
        </button>
        <button onClick={() => handleGlobalAction('salvar')} className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition shadow-xs">
          <Save size={13} /> Salvar
        </button>
        <button onClick={() => handleGlobalAction('cancelar')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition">
          <X size={13} /> Cancelar
        </button>
        <button onClick={() => handleGlobalAction('excluir')} className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-rose-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition border border-rose-900/40">
          <Trash2 size={13} /> Excluir
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden md:block" />

        <button onClick={() => handleGlobalAction('pesquisar')} className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition">
          <Search size={13} /> Pesquisar
        </button>
        <button onClick={() => handleGlobalAction('atualizar')} className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition">
          <RefreshCw size={13} /> Atualizar
        </button>
        <button onClick={() => handleGlobalAction('importar')} className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition">
          <Upload size={13} /> Importar
        </button>
        <button onClick={() => handleGlobalAction('exportar')} className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition">
          <Download size={13} /> Exportar
        </button>
        <button onClick={() => handleGlobalAction('historico')} className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition">
          <History size={13} /> Histórico
        </button>

        <button onClick={() => handleGlobalAction('ajuda')} className="ml-auto px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition">
          <HelpCircle size={13} /> Ajuda
        </button>
      </div>

      {/* Top Dashboard KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-xs">
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Pagamentos Hoje</span>
          <h4 className="text-sm font-black text-white mt-0.5 font-mono">R$ 152.320,00</h4>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Aprovados</span>
          <h4 className="text-sm font-black text-emerald-400 mt-0.5 font-mono">1.245</h4>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Negados</span>
          <h4 className="text-sm font-black text-rose-400 mt-0.5 font-mono">23</h4>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Chargebacks</span>
          <h4 className="text-sm font-black text-amber-400 mt-0.5 font-mono">2</h4>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">PIX</span>
          <h4 className="text-sm font-black text-amber-400 mt-0.5 font-mono">430</h4>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Cartão</span>
          <h4 className="text-sm font-black text-indigo-400 mt-0.5 font-mono">815</h4>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">Taxa Aprovação</span>
          <h4 className="text-sm font-black text-emerald-400 mt-0.5 font-mono">98,12%</h4>
        </div>
      </div>

      {/* Main Header with Env Toggle */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sliders size={18} className="text-sky-400" />
              Gateway de Pagamentos & Operadoras
            </h3>
            <span className="text-[11px] text-slate-400">
              Financeiro &gt; Configurações &gt; Gateway de Pagamentos
            </span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800/50 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Ambiente:</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="env"
                checked={env === 'production'}
                onChange={() => setEnv('production')}
                className="accent-sky-500"
              />
              <span className="font-semibold text-white">Produção</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="env"
                checked={env === 'sandbox'}
                onChange={() => setEnv('sandbox')}
                className="accent-sky-500"
              />
              <span className="font-semibold text-slate-300">Sandbox</span>
            </label>
          </div>

          <button
            onClick={handleTestConnection}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition"
          >
            Testar Conexão
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Menu & Content Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sub-menu Sidebar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <nav className="divide-y divide-slate-800/60 text-xs">
            {(
              [
                ['config', 'Configurações', Sliders],
                ['credentials', 'Credenciais', Key],
                ['cards', 'Cartões Aceitos', CreditCard],
                ['pix', 'PIX', QrCode],
                ['boletos', 'Boletos', Barcode],
                ['installment', 'Parcelamento', Calculator],
                ['antifraud', 'Antifraude', ShieldAlert],
                ['webhooks', 'Webhooks', Webhook],
                ['conciliation', 'Conciliação', Scale],
                ['refunds', 'Estornos', RotateCcw],
                ['logs', 'Logs', Terminal],
                ['reports', 'Relatórios', BarChart3]
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center justify-between px-4 py-3 font-semibold transition ${
                  activeTab === key
                    ? 'bg-sky-600/20 text-sky-400 font-bold border-l-4 border-sky-500'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  <span>{label}</span>
                </div>
                <ChevronRight size={13} className="text-slate-500" />
              </button>
            ))}
          </nav>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow-sm text-xs space-y-4">
          {/* TAB: CONFIGURAÇÕES */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Configurações Gerais do Gateway
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Provider Principal</label>
                  <select
                    value={activeProvider}
                    onChange={e => setActiveProvider(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  >
                    <option value="Pagar.me v5">Pagar.me v5 (StoneCo)</option>
                    <option value="Cielo E-Commerce 3.0">Cielo E-Commerce 3.0</option>
                    <option value="Rede e.Rede API">Rede e.Rede API</option>
                    <option value="Asaas Payments">Asaas Payments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Modo de Captura</label>
                  <select
                    value={captureMode}
                    onChange={e => setCaptureMode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="auto">Captura Automática (Imediata)</option>
                    <option value="auth">Pré-autorização e Captura Posterior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Timeout de Requisição (segundos)</label>
                  <input
                    type="number"
                    value={timeoutSec}
                    onChange={e => setTimeoutSec(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Retentativas Automáticas</label>
                  <input
                    type="number"
                    value={retries}
                    onChange={e => setRetries(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: CREDENCIAIS */}
          {activeTab === 'credentials' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Chaves de Acesso e Credenciais de Produção
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">API Key / Token Público</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Secret Key / Chave Privada</label>
                  <input
                    type="password"
                    value={secretKey}
                    onChange={e => setSecretKey(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Public Encryption Key</label>
                  <input
                    type="text"
                    value={publicKey}
                    onChange={e => setPublicKey(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Merchant ID / Conta</label>
                  <input
                    type="text"
                    value={merchantId}
                    onChange={e => setMerchantId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: CARTÕES ACEITOS */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Bandeiras de Cartão Habilitadas
              </h4>

              <div className="space-y-2.5">
                {[
                  ['Visa', acceptVisa, setAcceptVisa],
                  ['Mastercard', acceptMaster, setAcceptMaster],
                  ['Elo', acceptElo, setAcceptElo],
                  ['American Express', acceptAmex, setAcceptAmex],
                  ['Hipercard', acceptHiper, setAcceptHiper]
                ].map(([brand, val, setter]: any) => (
                  <div key={brand} className="flex justify-between items-center p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
                    <span className="font-bold text-white">{brand}</span>
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={e => setter(e.target.checked)}
                      className="accent-emerald-500 h-4 w-4"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PIX */}
          {activeTab === 'pix' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Configuração PIX Dinâmico
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Chave PIX Recebedora</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={e => setPixKey(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tempo de Expiração do QR Code (minutos)</label>
                  <input
                    type="number"
                    value={pixExpiryMin}
                    onChange={e => setPixExpiryMin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: BOLETOS */}
          {activeTab === 'boletos' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Emissão e Registro de Boletos Bancários
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Banco Emissor</label>
                  <input
                    type="text"
                    value={boletoBank}
                    onChange={e => setBoletoBank(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dias p/ Vencimento</label>
                  <input
                    type="number"
                    value={boletoDays}
                    onChange={e => setBoletoDays(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tarifa Fixa (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={boletoFee}
                    onChange={e => setBoletoFee(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: PARCELAMENTO */}
          {activeTab === 'installment' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Tabela de Parcelamento e Juros
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-400 font-semibold">
                      <th className="py-2 px-3">Parcelas</th>
                      <th className="py-2 px-3 text-center">Taxa MDR</th>
                      <th className="py-2 px-3 text-center">Juros Comprador</th>
                      <th className="py-2 px-3 text-right">Repasse Líquido Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-2 px-3 text-white font-bold">1x (À vista)</td>
                      <td className="py-2 px-3 text-center text-sky-400">2,35%</td>
                      <td className="py-2 px-3 text-center text-emerald-400">0,00%</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-bold">97,65%</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-2 px-3 text-white font-bold">2x a 6x</td>
                      <td className="py-2 px-3 text-center text-sky-400">3,10%</td>
                      <td className="py-2 px-3 text-center text-emerald-400">0,00%</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-bold">96,90%</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="py-2 px-3 text-white font-bold">7x a 12x</td>
                      <td className="py-2 px-3 text-center text-sky-400">3,85%</td>
                      <td className="py-2 px-3 text-center text-amber-400">1,99% a.m.</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-bold">96,15%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ANTIFRAUDE */}
          {activeTab === 'antifraud' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Motor Antifraude & Score
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Provider Antifraude</label>
                  <input
                    type="text"
                    value={antifraudProvider}
                    onChange={e => setAntifraudProvider(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Score Mínimo para Aprovação Automática</label>
                  <input
                    type="number"
                    value={minScore}
                    onChange={e => setMinScore(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: WEBHOOKS */}
          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                URLs de Notificação (Webhooks)
              </h4>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Webhook Endpoint</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-white">Eventos Inscritos:</div>
                <div>● transaction.paid (Venda Aprovada)</div>
                <div>● transaction.refused (Venda Recusada)</div>
                <div>● transaction.refunded (Estorno Efetuado)</div>
                <div>● transaction.chargeback (Notificação de Chargeback)</div>
              </div>
            </div>
          )}

          {/* TAB: CONCILIAÇÃO & OUTROS */}
          {['conciliation', 'refunds', 'logs', 'reports'].includes(activeTab) && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2 capitalize">
                Auditoria & {activeTab}
              </h4>
              <p className="text-slate-400">
                Lotes e telemetria sincronizados em tempo real com o adquirente ativo.
              </p>
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400">
                [2026-09-01 15:20:00] Webhook HTTP 200 OK — Lote #89452 reconciliado sem divergências.
              </div>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              onClick={() => handleGlobalAction('salvar')}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Save size={14} /> Salvar Parâmetros
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
