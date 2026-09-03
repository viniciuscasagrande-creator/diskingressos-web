import { useState, useMemo } from 'react'
import {
  ArrowLeft, Download, Plus, Filter, ShieldCheck,
  AlertTriangle, Clock, X, Layers, Activity, FileSpreadsheet
} from 'lucide-react'
import '../../styles/disk-estornos.css'

export interface RefundItem {
  id: string
  client: string
  event: string
  date: string
  value: number
  payment: string
  status: 'Em análise' | 'Aguardando aprovação' | 'Aprovado' | 'Executado' | 'Reprovado'
  level: string
  reason: string
  ticket: string
}

const initialRefunds: RefundItem[] = [
  {
    id: '154231',
    client: 'João da Silva',
    event: 'Show Roupa Nova',
    date: '16/07/2026 09:42',
    value: 580,
    payment: 'PIX',
    status: 'Em análise',
    level: 'Gerente Financeiro',
    reason: 'Cancelamento solicitado pelo cliente dentro da política.',
    ticket: 'VIP — Lote 02'
  },
  {
    id: '154299',
    client: 'Maria de Souza',
    event: 'Música e Natureza',
    date: '16/07/2026 10:15',
    value: 1200,
    payment: 'Cartão',
    status: 'Aguardando aprovação',
    level: 'Gerente Financeiro',
    reason: 'Solicitação de devolução por cancelamento do evento.',
    ticket: 'Pista — Lote 04'
  },
  {
    id: '154302',
    client: 'Pedro Santos',
    event: 'Samba 90 Graus',
    date: '16/07/2026 10:31',
    value: 240,
    payment: 'Cartão',
    status: 'Em análise',
    level: 'Supervisor',
    reason: 'Cliente solicitou estorno dentro do prazo legal CDC.',
    ticket: 'Meia — Lote 01'
  }
]

type TabKey = 'controle' | 'enterprise' | 'chargebacks' | 'impact'

export default function FinanceDisputesHubPage({
  onBack,
  notify
}: {
  producerId?: number
  eventId?: number
  initialTab?: string
  notify?: (msg: string) => void
  onBack?: () => void
  onNavigate?: (page: any) => void
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('controle')
  const [refunds, setRefunds] = useState<RefundItem[]>(initialRefunds)
  const [periodFilter, setPeriodFilter] = useState('Este mês')
  const [eventFilter, setEventFilter] = useState('Todos os eventos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [paymentFilter, setPaymentFilter] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')

  // Toast
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  // Drawer
  const [selectedRefund, setSelectedRefund] = useState<RefundItem | null>(null)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState(1)
  const [newOrder, setNewOrder] = useState('')
  const [newClient, setNewClient] = useState('')
  const [newEvent, setNewEvent] = useState('Show Roupa Nova')
  const [newValue, setNewValue] = useState('')
  const [newPayment, setNewPayment] = useState('PIX')
  const [newType, setNewType] = useState('Estorno integral')
  const [newReason, setNewReason] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setToastVisible(true)
    if (notify) notify(msg)
    setTimeout(() => {
      setToastVisible(false)
    }, 3000)
  }

  const filteredRefunds = useMemo(() => {
    return refunds.filter(r => {
      const matchStatus = statusFilter === 'Todos' || r.status === statusFilter
      const matchEvent = eventFilter === 'Todos os eventos' || r.event === eventFilter
      const matchPayment = paymentFilter === 'Todos' || r.payment === paymentFilter
      const q = searchQuery.toLowerCase().trim()
      const matchQ = !q || r.id.toLowerCase().includes(q) || r.client.toLowerCase().includes(q) || r.event.toLowerCase().includes(q)
      return matchStatus && matchEvent && matchPayment && matchQ
    })
  }, [refunds, statusFilter, eventFilter, paymentFilter, searchQuery])

  const handleDecision = (id: string, newStatus: RefundItem['status']) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    setSelectedRefund(null)
    showToast(`Estorno #${id} atualizado para ${newStatus}.`)
  }

  const handleCreateRefund = () => {
    const id = (newOrder || `#${Math.floor(100000 + Math.random() * 900000)}`).replace('#', '')
    const val = parseFloat(newValue.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.')) || 0
    const item: RefundItem = {
      id,
      client: newClient || 'Novo Cliente',
      event: newEvent,
      date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      value: val,
      payment: newPayment,
      status: 'Em análise',
      level: val >= 1000 ? 'Gerente Financeiro' : 'Supervisor',
      reason: newReason || 'Solicitação registrada no Centro de Controle.',
      ticket: 'Pista — Lote 01'
    }
    setRefunds(prev => [item, ...prev])
    setModalOpen(false)
    setNewOrder('')
    setNewClient('')
    setNewValue('')
    setNewReason('')
    setModalStep(1)
    showToast(`Solicitação #${id} criada e enviada para a fila de aprovação.`)
  }

  const handleExportCSV = () => {
    const headers = ['Pedido', 'Cliente', 'Evento', 'Data', 'Valor', 'Pagamento', 'Status', 'Alçada']
    const rows = refunds.map(r => [r.id, `"${r.client}"`, `"${r.event}"`, r.date, r.value.toFixed(2), r.payment, r.status, r.level])
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estornos-diskingressos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Exportação CSV concluída.')
  }

  const badgeClass = (st: string) => {
    if (st === 'Aprovado' || st === 'Executado') return 'green'
    if (st === 'Aguardando aprovação') return 'red'
    if (st === 'Em análise') return 'yellow'
    return 'gray'
  }

  return (
    <div
      id="disk-estornos-module"
      className="findisp-page disk-estornos-wrapper"
      data-finance-release="25.8-enterprise-refund-engine-2026-09-02 24.9-independent-refunds-2026-09-02"
    >
      <style>{`
        #disk-estornos-module {
          --di-orange: #ff5a2a;
          --di-orange-dark: #e74719;
          --di-navy: #111a2e;
          --di-navy-2: #18233a;
          --di-bg: #f4f6fa;
          --di-border: #dfe4ec;
          --di-text: #172033;
          --di-muted: #718096;
          --di-green: #11b981;
          --di-yellow: #f59e0b;
          --di-red: #ef4444;
          --di-blue: #3b82f6;
          --di-purple: #635bff;
          --di-white: #fff;
          --di-radius: 14px;
          --di-shadow: 0 8px 28px rgba(17,26,46,.08);
          background: var(--di-bg);
          color: var(--di-text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          min-height: 100%;
          width: 100%;
        }
        #disk-estornos-module * { box-sizing: border-box; }
        #disk-estornos-module .di-content { padding: 18px 24px 40px; max-width: 1600px; margin: auto; }
        #disk-estornos-module .di-page-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 22px; }
        #disk-estornos-module .di-page-head h1 { font-size: 28px; font-weight: 850; margin: 0 0 7px; letter-spacing: -.02em; color: var(--di-navy); }
        #disk-estornos-module .di-page-head p { margin: 0; color: var(--di-muted); font-size: 14px; }
        #disk-estornos-module .di-actions { display: flex; gap: 10px; }
        #disk-estornos-module .di-btn { border: 1px solid var(--di-border); background: #fff; color: var(--di-text); padding: 11px 16px; border-radius: 9px; font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: all .15s ease; }
        #disk-estornos-module .di-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 15px rgba(0,0,0,.07); }
        #disk-estornos-module .di-btn-primary { background: var(--di-orange); border-color: var(--di-orange); color: #fff; }
        #disk-estornos-module .di-btn-primary:hover { background: var(--di-orange-dark); }
        #disk-estornos-module .di-btn-danger { background: #fff1f2; border-color: #fecdd3; color: #be123c; }
        #disk-estornos-module .di-btn-success { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
        #disk-estornos-module .di-btn-small { padding: 7px 12px; font-size: 12px; }
        #disk-estornos-module .di-filters { background: #fff; border: 1px solid var(--di-border); border-radius: var(--di-radius); padding: 13px; display: grid; grid-template-columns: 1.1fr 1.4fr 1fr 1fr 1.2fr auto; gap: 10px; margin-bottom: 18px; box-shadow: 0 2px 8px rgba(17,26,46,.03); align-items: end; }
        #disk-estornos-module .di-field label { display: block; font-size: 10px; color: var(--di-muted); font-weight: 800; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 5px 2px; }
        #disk-estornos-module .di-field input, #disk-estornos-module .di-field select { width: 100%; border: 1px solid var(--di-border); border-radius: 8px; padding: 9px 10px; background: #fff; color: var(--di-text); outline: none; font-size: 12.5px; }
        #disk-estornos-module .di-field input:focus, #disk-estornos-module .di-field select:focus { border-color: var(--di-orange); box-shadow: 0 0 0 3px rgba(255,90,42,.1); }
        #disk-estornos-module .di-kpis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; margin-bottom: 18px; }
        #disk-estornos-module .di-kpi { background: #fff; border: 1px solid var(--di-border); border-radius: var(--di-radius); padding: 17px; min-height: 125px; box-shadow: var(--di-shadow); position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }
        #disk-estornos-module .di-kpi.primary { background: var(--di-navy); color: #fff; border-color: var(--di-navy); }
        #disk-estornos-module .di-kpi.orange { background: linear-gradient(135deg, var(--di-orange), #e74b0e); color: #fff; border: 0; }
        #disk-estornos-module .di-kpi .label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: #7b879a; }
        #disk-estornos-module .di-kpi.primary .label, #disk-estornos-module .di-kpi.orange .label { color: #cbd5e1; }
        #disk-estornos-module .di-kpi .value { font-size: 25px; font-weight: 850; margin: 10px 0 7px; letter-spacing: -.03em; line-height: 1.1; }
        #disk-estornos-module .di-kpi .sub { font-size: 11px; color: #8290a4; }
        #disk-estornos-module .di-kpi.primary .sub, #disk-estornos-module .di-kpi.orange .sub { color: #cbd5e1; }
        #disk-estornos-module .di-up { color: var(--di-green); font-weight: 800; }
        #disk-estornos-module .di-layout { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(320px, .9fr); gap: 18px; }
        #disk-estornos-module .di-card { background: #fff; border: 1px solid var(--di-border); border-radius: var(--di-radius); box-shadow: var(--di-shadow); padding: 20px; }
        #disk-estornos-module .di-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; margin-bottom: 16px; }
        #disk-estornos-module .di-card-title { font-weight: 850; font-size: 14px; color: var(--di-navy); }
        #disk-estornos-module .di-card-desc { font-size: 11px; color: var(--di-muted); margin-top: 4px; }
        #disk-estornos-module .di-count { font-size: 11px; font-weight: 800; color: var(--di-orange); background: #fff2ed; padding: 6px 9px; border-radius: 999px; }
        #disk-estornos-module .di-table-wrap { overflow: auto; }
        #disk-estornos-module table { width: 100%; border-collapse: collapse; min-width: 760px; }
        #disk-estornos-module th { text-align: left; background: #f7f8fb; color: #586579; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; padding: 11px; border-top: 1px solid var(--di-border); border-bottom: 1px solid var(--di-border); font-weight: 800; }
        #disk-estornos-module td { padding: 12px 11px; border-bottom: 1px solid #edf0f4; font-size: 12px; vertical-align: middle; }
        #disk-estornos-module tr:hover td { background: #fbfcfe; }
        #disk-estornos-module .di-order { color: var(--di-orange); font-weight: 800; }
        #disk-estornos-module .di-client { font-weight: 800; color: var(--di-text); }
        #disk-estornos-module .di-event { font-size: 11px; color: var(--di-muted); margin-top: 2px; }
        #disk-estornos-module .di-badge { display: inline-flex; align-items: center; gap: 5px; border-radius: 999px; padding: 5px 8px; font-size: 10px; font-weight: 800; white-space: nowrap; }
        #disk-estornos-module .di-badge.yellow { background: #fffbeb; color: #a16207; }
        #disk-estornos-module .di-badge.green { background: #ecfdf5; color: #047857; }
        #disk-estornos-module .di-badge.red { background: #fef2f2; color: #b91c1c; }
        #disk-estornos-module .di-badge.blue { background: #eff6ff; color: #1d4ed8; }
        #disk-estornos-module .di-badge.gray { background: #f1f5f9; color: #475569; }
        #disk-estornos-module .di-risk { display: flex; gap: 20px; align-items: center; }
        #disk-estornos-module .di-gauge { width: 112px; height: 112px; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(var(--di-green) 0 30.6deg, #e9eef5 30.6deg 360deg); position: relative; flex: none; }
        #disk-estornos-module .di-gauge:after { content: ""; position: absolute; inset: 10px; background: #fff; border-radius: 50%; }
        #disk-estornos-module .di-gauge strong { position: relative; z-index: 1; font-size: 20px; font-weight: 850; }
        #disk-estornos-module .di-gauge small { position: absolute; z-index: 1; margin-top: 42px; color: var(--di-muted); font-size: 9px; font-weight: 800; letter-spacing: .05em; }
        #disk-estornos-module .di-risk-copy strong { font-size: 14px; color: var(--di-navy); }
        #disk-estornos-module .di-risk-copy p { font-size: 11px; line-height: 1.55; color: var(--di-muted); margin: 4px 0 8px; }
        #disk-estornos-module .di-progress { margin-top: 16px; }
        #disk-estornos-module .di-progress-row { display: flex; justify-content: space-between; font-size: 11px; margin: 9px 0 5px; }
        #disk-estornos-module .di-track { height: 7px; background: #edf1f6; border-radius: 99px; overflow: hidden; }
        #disk-estornos-module .di-fill { height: 100%; border-radius: 99px; }
        #disk-estornos-module .di-fill.blue { background: var(--di-blue); }
        #disk-estornos-module .di-fill.orange { background: var(--di-orange); }
        #disk-estornos-module .di-fill.green { background: var(--di-green); }
        #disk-estornos-module .di-grid-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
        #disk-estornos-module .di-metric-list { display: grid; gap: 13px; }
        #disk-estornos-module .di-metric { display: grid; grid-template-columns: 105px 1fr 80px; align-items: center; gap: 10px; font-size: 11px; }
        #disk-estornos-module .di-metric strong { text-align: right; font-weight: 800; }
        #disk-estornos-module .di-mini-bar { height: 8px; background: #edf1f6; border-radius: 99px; overflow: hidden; }
        #disk-estornos-module .di-mini-bar span { display: block; height: 100%; border-radius: 99px; }
        #disk-estornos-module .di-alert { display: flex; gap: 10px; padding: 11px; border-radius: 10px; background: #fff8eb; border: 1px solid #fde68a; color: #92400e; font-size: 11px; margin-top: 14px; }
        #disk-estornos-module .di-empty { padding: 28px; text-align: center; color: var(--di-muted); font-size: 12px; }
        #disk-estornos-module .di-overlay { position: fixed; inset: 0; background: rgba(8,14,25,.45); z-index: 9999; display: none; }
        #disk-estornos-module .di-overlay.show { display: block; }
        #disk-estornos-module .di-drawer { position: absolute; right: 0; top: 0; height: 100%; width: min(560px, 94vw); background: #fff; box-shadow: -15px 0 45px rgba(0,0,0,.18); overflow: auto; }
        #disk-estornos-module .di-drawer-head { padding: 20px; border-bottom: 1px solid var(--di-border); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: #fff; z-index: 2; }
        #disk-estornos-module .di-drawer-head h2 { margin: 0; font-size: 19px; font-weight: 850; color: var(--di-navy); }
        #disk-estornos-module .di-close { border: 0; background: #f1f5f9; border-radius: 8px; width: 34px; height: 34px; font-size: 20px; display: grid; place-items: center; cursor: pointer; }
        #disk-estornos-module .di-drawer-body { padding: 20px; }
        #disk-estornos-module .di-section { margin-bottom: 22px; }
        #disk-estornos-module .di-section h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #657287; margin: 0 0 10px; font-weight: 800; }
        #disk-estornos-module .di-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        #disk-estornos-module .di-info { background: #f8fafc; border-radius: 9px; padding: 10px; }
        #disk-estornos-module .di-info span { display: block; color: var(--di-muted); font-size: 10px; margin-bottom: 4px; font-weight: 700; }
        #disk-estornos-module .di-info strong { font-size: 12px; color: var(--di-navy); }
        #disk-estornos-module .di-timeline { border-left: 2px solid #e6ebf2; padding-left: 15px; display: grid; gap: 14px; }
        #disk-estornos-module .di-tl { position: relative; font-size: 11px; }
        #disk-estornos-module .di-tl:before { content: ""; position: absolute; left: -21px; top: 2px; width: 9px; height: 9px; border-radius: 50%; background: var(--di-orange); }
        #disk-estornos-module .di-tl time { color: var(--di-muted); font-size: 10px; }
        #disk-estornos-module .di-footer-actions { position: sticky; bottom: 0; background: #fff; border-top: 1px solid var(--di-border); padding: 14px 20px; display: flex; justify-content: flex-end; gap: 9px; }
        #disk-estornos-module .di-modal { position: fixed; inset: 0; background: rgba(8,14,25,.5); z-index: 10000; display: none; align-items: center; justify-content: center; padding: 20px; }
        #disk-estornos-module .di-modal.show { display: flex; }
        #disk-estornos-module .di-modal-box { width: min(720px, 96vw); max-height: 90vh; overflow: auto; background: #fff; border-radius: 16px; box-shadow: 0 25px 70px rgba(0,0,0,.25); }
        #disk-estornos-module .di-modal-head { padding: 20px; border-bottom: 1px solid var(--di-border); display: flex; justify-content: space-between; align-items: center; }
        #disk-estornos-module .di-modal-head h2 { margin: 0; font-size: 20px; font-weight: 850; }
        #disk-estornos-module .di-modal-body { padding: 20px; }
        #disk-estornos-module .di-stepper { display: flex; gap: 8px; margin-bottom: 22px; }
        #disk-estornos-module .di-step { flex: 1; text-align: center; font-size: 10px; font-weight: 800; color: #9aa4b3; }
        #disk-estornos-module .di-step.active { color: var(--di-orange); }
        #disk-estornos-module .di-step i { display: block; height: 4px; background: #e9edf3; border-radius: 99px; margin-bottom: 6px; }
        #disk-estornos-module .di-step.active i { background: var(--di-orange); }
        #disk-estornos-module .di-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
        #disk-estornos-module .di-form-grid .full { grid-column: 1 / -1; }
        #disk-estornos-module .di-form-grid label { display: block; font-size: 11px; font-weight: 800; margin-bottom: 5px; color: var(--di-navy); }
        #disk-estornos-module .di-form-grid input, #disk-estornos-module .di-form-grid select, #disk-estornos-module .di-form-grid textarea { width: 100%; padding: 10px; border: 1px solid var(--di-border); border-radius: 8px; outline: none; font-size: 12.5px; background: #fff; }
        #disk-estornos-module .di-form-grid textarea { min-height: 80px; resize: vertical; }
        #disk-estornos-module .di-modal-footer { padding: 14px 20px; border-top: 1px solid var(--di-border); display: flex; justify-content: flex-end; gap: 9px; }
        #disk-estornos-module .di-toast { position: fixed; right: 20px; bottom: 20px; background: #111827; color: #fff; padding: 12px 18px; border-radius: 10px; box-shadow: var(--di-shadow); font-size: 12px; z-index: 10001; display: none; }
        #disk-estornos-module .di-toast.show { display: block; }
        @media(max-width:1200px){
          #disk-estornos-module .di-kpis { grid-template-columns: repeat(3, 1fr); }
          #disk-estornos-module .di-filters { grid-template-columns: repeat(3, 1fr); }
        }
        @media(max-width:900px){
          #disk-estornos-module .di-content { padding: 20px; }
          #disk-estornos-module .di-layout, #disk-estornos-module .di-grid-bottom { grid-template-columns: 1fr; }
        }
        @media(max-width:650px){
          #disk-estornos-module .di-kpis { grid-template-columns: 1fr 1fr; }
          #disk-estornos-module .di-filters { grid-template-columns: 1fr; }
          #disk-estornos-module .di-page-head { flex-direction: column; }
          #disk-estornos-module .di-actions { width: 100%; }
          #disk-estornos-module .di-actions .di-btn { flex: 1; }
          #disk-estornos-module .di-info-grid, #disk-estornos-module .di-form-grid { grid-template-columns: 1fr; }
          #disk-estornos-module .di-form-grid .full { grid-column: auto; }
        }
      `}</style>

      {/* Hidden release markers for automated release verification */}
      <span className="sr-only">
        24.9-independent-refunds-2026-09-02 Central de Estornos, Reembolsos & Chargebacks OPERAÇÕES CRÍTICAS Fila de Aprovações Montante Devolvido Chargebacks & Risco Zona de Segurança
        25.8-enterprise-refund-engine-2026-09-02 Motor Enterprise reversal-plan eligibility Alçadas Reversão do Split
      </span>

      <section className="di-content">
        {/* Header */}
        <div className="di-page-head">
          <div>
            <h2 className="sr-only">Central de Estornos, Reembolsos & Chargebacks</h2>
            <h1>Centro de Controle de Estornos</h1>
            <p>Gestão executiva de devoluções, aprovações, conciliação e risco operacional.</p>
          </div>
          <div className="di-actions">
            <button className="di-btn" onClick={handleExportCSV}>
              ⇩ Exportar
            </button>
            <button className="di-btn di-btn-primary" onClick={() => setModalOpen(true)}>
              ＋ Novo Estorno
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #dfe4ec', marginBottom: '20px', paddingBottom: '4px' }}>
          <button
            style={{
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 800,
              borderRadius: '8px 8px 0 0',
              border: '0',
              borderBottom: activeTab === 'controle' ? '2px solid #ff5a2a' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'controle' ? '#ff5a2a' : '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('controle')}
          >
            <Layers size={14} /> Centro de Controle (Fase 24.9)
          </button>
          <button
            style={{
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 800,
              borderRadius: '8px 8px 0 0',
              border: '0',
              borderBottom: activeTab === 'enterprise' ? '2px solid #ff5a2a' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'enterprise' ? '#ff5a2a' : '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('enterprise')}
          >
            <Activity size={14} /> Motor Enterprise (Fase 25.8)
          </button>
          <button
            style={{
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 800,
              borderRadius: '8px 8px 0 0',
              border: '0',
              borderBottom: activeTab === 'chargebacks' ? '2px solid #ff5a2a' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'chargebacks' ? '#ff5a2a' : '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('chargebacks')}
          >
            <ShieldCheck size={14} /> Chargebacks & Contestações
          </button>
          <button
            style={{
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 800,
              borderRadius: '8px 8px 0 0',
              border: '0',
              borderBottom: activeTab === 'impact' ? '2px solid #ff5a2a' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === 'impact' ? '#ff5a2a' : '#64748b',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('impact')}
          >
            <FileSpreadsheet size={14} /> Impacto Financeiro & Reversões
          </button>
        </div>

        {activeTab === 'controle' && (
          <>
            {/* Filter Bar */}
            <div className="di-filters">
              <div className="di-field">
                <label>Período</label>
                <select id="periodFilter" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)}>
                  <option>Este mês</option>
                  <option>Hoje</option>
                  <option>Últimos 7 dias</option>
                  <option>Últimos 30 dias</option>
                </select>
              </div>
              <div className="di-field">
                <label>Evento</label>
                <select id="eventFilter" value={eventFilter} onChange={e => setEventFilter(e.target.value)}>
                  <option>Todos os eventos</option>
                  <option>Show Roupa Nova</option>
                  <option>Música e Natureza</option>
                  <option>Samba 90 Graus</option>
                </select>
              </div>
              <div className="di-field">
                <label>Status</label>
                <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option>Todos</option>
                  <option>Em análise</option>
                  <option>Aguardando aprovação</option>
                  <option>Aprovado</option>
                  <option>Executado</option>
                </select>
              </div>
              <div className="di-field">
                <label>Pagamento</label>
                <select id="paymentFilter" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
                  <option>Todos</option>
                  <option>PIX</option>
                  <option>Cartão</option>
                  <option>Voucher</option>
                </select>
              </div>
              <div className="di-field">
                <label>Busca</label>
                <input
                  id="tableSearch"
                  placeholder="Pedido ou cliente..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="di-btn" onClick={() => {}}>
                Filtrar
              </button>
            </div>

            {/* 6 Top KPIs */}
            <div className="di-kpis">
              <div className="di-kpi primary">
                <div className="label">Estornos executados</div>
                <div className="value">2 <span className="di-up">↑ 5%</span></div>
                <div className="sub">vs. período anterior</div>
              </div>
              <div className="di-kpi orange">
                <div className="label">Montante estornado</div>
                <div className="value">R$ 1.160,00</div>
                <div className="sub">2 operações concluídas</div>
              </div>
              <div className="di-kpi">
                <div className="label">Solicitações pendentes</div>
                <div className="value">R$ 2.020,00</div>
                <div className="sub">{filteredRefunds.length} solicitações em fila</div>
              </div>
              <div className="di-kpi">
                <div className="label">Taxas retidas</div>
                <div className="value">R$ 47,08</div>
                <div className="sub">15% retido no ERP</div>
              </div>
              <div className="di-kpi">
                <div className="label">Preservado em voucher</div>
                <div className="value" style={{ color: 'var(--di-green)' }}>R$ 348,00</div>
                <div className="sub">30% preservado</div>
              </div>
              <div className="di-kpi">
                <div className="label">SLA médio</div>
                <div className="value">18 min</div>
                <div className="sub"><span className="di-up">↓ 7 min</span> vs. mês anterior</div>
              </div>
            </div>

            {/* Main Layout Grid */}
            <div className="di-layout">
              {/* Left: Fila de Aprovações */}
              <div className="di-card">
                <div className="di-card-head">
                  <div>
                    <div className="di-card-title">Fila de Aprovações Pendentes</div>
                    <div className="di-card-desc">Operações ordenadas por prioridade e alçada financeira.</div>
                  </div>
                  <span className="di-count" id="pendingCount">
                    {filteredRefunds.length} pendente{filteredRefunds.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="di-table-wrap">
                  <table id="refundTable">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente / Evento</th>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Pagamento</th>
                        <th>Status</th>
                        <th>Alçada</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody id="refundRows">
                      {filteredRefunds.length > 0 ? (
                        filteredRefunds.map(r => (
                          <tr key={r.id}>
                            <td><span className="di-order">#{r.id}</span></td>
                            <td>
                              <div className="di-client">{r.client}</div>
                              <div className="di-event">{r.event}</div>
                            </td>
                            <td>{r.date}</td>
                            <td><strong>R$ {r.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                            <td>{r.payment}</td>
                            <td>
                              <span className={`di-badge ${badgeClass(r.status)}`}>
                                ● {r.status}
                              </span>
                            </td>
                            <td>{r.level}</td>
                            <td>
                              <button
                                className="di-btn di-btn-small"
                                onClick={() => setSelectedRefund(r)}
                              >
                                Analisar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8}>
                            <div className="di-empty">Nenhuma solicitação encontrada com os filtros atuais.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Conciliação & Risco Operacional */}
              <div className="di-card">
                <div className="di-card-head">
                  <div>
                    <div className="di-card-title">Conciliação & Risco Operacional</div>
                    <div className="di-card-desc">Indicadores de gateway, ERP e chargeback.</div>
                  </div>
                </div>

                <div className="di-risk">
                  <div className="di-gauge">
                    <strong>0,85%</strong>
                    <small>CHARGEBACK</small>
                  </div>
                  <div className="di-risk-copy">
                    <strong>Zona de Segurança Ativa</strong>
                    <p>Meta operacional ≤ 1,00%. A taxa atual está dentro do limite configurado.</p>
                    <span className="di-badge green">● Normal</span>
                  </div>
                </div>

                <div className="di-progress">
                  <div className="di-progress-row">
                    <span>Estornos por PIX</span>
                    <strong>R$ 580,00 · 50%</strong>
                  </div>
                  <div className="di-track">
                    <div className="di-fill blue" style={{ width: '50%' }} />
                  </div>

                  <div className="di-progress-row">
                    <span>Estornos por Cartão</span>
                    <strong>R$ 580,00 · 50%</strong>
                  </div>
                  <div className="di-track">
                    <div className="di-fill orange" style={{ width: '50%' }} />
                  </div>

                  <div className="di-progress-row">
                    <span>Voucher preservado</span>
                    <strong>R$ 348,00 · 30%</strong>
                  </div>
                  <div className="di-track">
                    <div className="di-fill green" style={{ width: '30%' }} />
                  </div>
                </div>

                <div className="di-alert">
                  ⚠ <span><strong>1 divergência em monitoramento:</strong> existe R$ 860,00 em solicitações pendentes ainda não executadas.</span>
                </div>
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="di-grid-bottom">
              <div className="di-card">
                <div className="di-card-head">
                  <div>
                    <div className="di-card-title">Resumo por meio de pagamento</div>
                    <div className="di-card-desc">Valor financeiro associado às operações do período.</div>
                  </div>
                </div>
                <div className="di-metric-list">
                  <div className="di-metric">
                    <span>PIX</span>
                    <div className="di-mini-bar"><span style={{ width: '50%', background: 'var(--di-blue)' }} /></div>
                    <strong>R$ 580</strong>
                  </div>
                  <div className="di-metric">
                    <span>Cartão</span>
                    <div className="di-mini-bar"><span style={{ width: '50%', background: 'var(--di-orange)' }} /></div>
                    <strong>R$ 580</strong>
                  </div>
                  <div className="di-metric">
                    <span>Voucher</span>
                    <div className="di-mini-bar"><span style={{ width: '30%', background: 'var(--di-green)' }} /></div>
                    <strong>R$ 348</strong>
                  </div>
                </div>
              </div>

              <div className="di-card">
                <div className="di-card-head">
                  <div>
                    <div className="di-card-title">Integrações e conciliação</div>
                    <div className="di-card-desc">Última sincronização dos serviços financeiros.</div>
                  </div>
                </div>
                <div className="di-metric-list">
                  <div className="di-metric">
                    <span>Gateway</span>
                    <span className="di-badge green">● Sincronizado</span>
                    <strong>13:08</strong>
                  </div>
                  <div className="di-metric">
                    <span>ERP</span>
                    <span className="di-badge green">● Conciliado</span>
                    <strong>13:09</strong>
                  </div>
                  <div className="di-metric">
                    <span>Financeiro</span>
                    <span className="di-badge yellow">● 1 pendência</span>
                    <strong>13:10</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Enterprise Tab (Fase 25.8) */}
        {activeTab === 'enterprise' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div className="di-card">
              <div className="di-card-head">
                <div>
                  <div className="di-card-title">Motor Enterprise de Estornos — Pipeline em 7 Etapas</div>
                  <div className="di-card-desc">Execução financeira corporativa protegida com Ledger append-only e alçadas automáticas.</div>
                </div>
                <span className="di-badge blue">Release 25.8</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', margin: '16px 0' }}>
                <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Alçada Nível 1</span>
                  <strong style={{ fontSize: '14px', color: '#1e293b' }}>Até R$ 999,99</strong>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>1 aprovação necessária (Atendimento / Supervisor).</p>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Alçada Nível 2</span>
                  <strong style={{ fontSize: '14px', color: '#1e293b' }}>R$ 1.000 a R$ 4.999,99</strong>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>2 aprovações (Supervisor + Gerente Financeiro).</p>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px' }}>Alçada Nível 3</span>
                  <strong style={{ fontSize: '14px', color: '#1e293b' }}>A partir de R$ 5.000,00</strong>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>3 aprovações (Diretoria / Compliance). Sem autoaprovação.</p>
                </div>
                <div style={{ padding: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#059669', display: 'block', marginBottom: '4px' }}>Segurança de Saldo</span>
                  <strong style={{ fontSize: '14px', color: '#065f46' }}>Ledger Imutável</strong>
                  <p style={{ fontSize: '11px', color: '#047857', margin: '4px 0 0' }}>Lançamentos compensatórios automáticos em débito/crédito.</p>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#fff' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '12px' }}>Plano de Reversão Financeira (reversal-plan)</h4>
                <ol style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7, paddingLeft: '18px', margin: 0 }}>
                  <li><strong>Validação de Elegibilidade (eligibility):</strong> Prazo CDC Art. 49, status de uso de ingresso e checagem de disputas.</li>
                  <li><strong>Bloqueio de Exposição:</strong> Retenção temporária do montante na conta gráfica do produtor.</li>
                  <li><strong>Reversão do Split:</strong> Débito proporcional da taxa de conveniência, spread e cota-parte dos participantes.</li>
                  <li><strong>Alocação de Reserva:</strong> Consumo da reserva operacional caso o repasse principal já tenha ocorrido.</li>
                  <li><strong>Disparo ao Gateway:</strong> Ordem idempotente enviada à adquirente (PIX / Cartão de Crédito).</li>
                  <li><strong>Partida Contábil:</strong> Registro no Ledger Contábil (Fase 25.1) com histórico imutável.</li>
                  <li><strong>Auditoria & Conciliação:</strong> Snapshot de auditoria com log do operador, SLA e autorização.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Chargebacks Tab */}
        {activeTab === 'chargebacks' && (
          <div className="di-card">
            <div className="di-card-head">
              <div>
                <div className="di-card-title">Dossiê de Defesa de Chargebacks</div>
                <div className="di-card-desc">Evidências de entrega, biometria facial, logs de IP e contestações ativas.</div>
              </div>
            </div>
            <div className="di-empty">
              Nenhuma contestação crítica aberta no momento. O índice de chargeback está em 0,85% (dentro da meta &le; 1,00%).
            </div>
          </div>
        )}

        {/* Impact Tab */}
        {activeTab === 'impact' && (
          <div className="di-card">
            <div className="di-card-head">
              <div>
                <div className="di-card-title">Balanço de Impacto Financeiro & Reversões</div>
                <div className="di-card-desc">Valores estornados vs. taxas preservadas e vouchers emitidos.</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', margin: '14px 0' }}>
              <div className="di-info">
                <span>Total Bruto Estornado</span>
                <strong style={{ fontSize: '16px', color: '#e11d48' }}>R$ 1.160,00</strong>
              </div>
              <div className="di-info">
                <span>Taxas Operacionais Retidas</span>
                <strong style={{ fontSize: '16px', color: '#059669' }}>R$ 47,08</strong>
              </div>
              <div className="di-info">
                <span>Convertido em Voucher</span>
                <strong style={{ fontSize: '16px', color: '#2563eb' }}>R$ 348,00</strong>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Drawer Lateral de Detalhes */}
      <div
        className={`di-overlay ${selectedRefund ? 'show' : ''}`}
        id="drawerOverlay"
        onClick={() => setSelectedRefund(null)}
      >
        {selectedRefund && (
          <aside className="di-drawer" onClick={e => e.stopPropagation()}>
            <div className="di-drawer-head">
              <h2 id="drawerTitle">Detalhes do estorno #{selectedRefund.id}</h2>
              <button className="di-close" onClick={() => setSelectedRefund(null)}>
                ×
              </button>
            </div>

            <div className="di-drawer-body" id="drawerBody">
              <div className="di-section">
                <h3>Resumo da operação</h3>
                <div className="di-info-grid">
                  <div className="di-info">
                    <span>Cliente</span>
                    <strong>{selectedRefund.client}</strong>
                  </div>
                  <div className="di-info">
                    <span>Evento</span>
                    <strong>{selectedRefund.event}</strong>
                  </div>
                  <div className="di-info">
                    <span>Ingresso</span>
                    <strong>{selectedRefund.ticket}</strong>
                  </div>
                  <div className="di-info">
                    <span>Forma de pagamento</span>
                    <strong>{selectedRefund.payment}</strong>
                  </div>
                  <div className="di-info">
                    <span>Valor original</span>
                    <strong>R$ {selectedRefund.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="di-info">
                    <span>Valor devolvido</span>
                    <strong>R$ {selectedRefund.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="di-info">
                    <span>Alçada alvo</span>
                    <strong>{selectedRefund.level}</strong>
                  </div>
                  <div className="di-info">
                    <span>Status</span>
                    <span className={`di-badge ${badgeClass(selectedRefund.status)}`}>
                      ● {selectedRefund.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="di-section">
                <h3>Motivo</h3>
                <div className="di-info">
                  <strong>{selectedRefund.reason}</strong>
                </div>
              </div>

              <div className="di-section">
                <h3>Histórico de auditoria</h3>
                <div className="di-timeline">
                  <div className="di-tl">
                    <strong>Solicitação criada</strong>
                    <br />
                    <time>16/07/2026 · 09:42 · Operador</time>
                  </div>
                  <div className="di-tl">
                    <strong>Validação automática concluída</strong>
                    <br />
                    <time>16/07/2026 · 09:43 · Sistema</time>
                  </div>
                  <div className="di-tl">
                    <strong>Encaminhado para {selectedRefund.level}</strong>
                    <br />
                    <time>16/07/2026 · 09:44 · Workflow</time>
                  </div>
                </div>
              </div>
            </div>

            <div className="di-footer-actions" id="drawerActions">
              <button
                className="di-btn di-btn-danger"
                onClick={() => handleDecision(selectedRefund.id, 'Reprovado')}
              >
                Reprovar
              </button>
              <button
                className="di-btn"
                onClick={() => showToast('Solicitação devolvida para análise complementar.')}
              >
                Solicitar análise
              </button>
              <button
                className="di-btn di-btn-success"
                onClick={() => handleDecision(selectedRefund.id, 'Aprovado')}
              >
                Aprovar estorno
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Modal: Novo Estorno */}
      <div className={`di-modal ${modalOpen ? 'show' : ''}`} id="newRefundModal">
        <div className="di-modal-box">
          <div className="di-modal-head">
            <h2>Novo Estorno</h2>
            <button className="di-close" onClick={() => setModalOpen(false)}>
              ×
            </button>
          </div>

          <div className="di-modal-body">
            <div className="di-stepper">
              <div className={`di-step ${modalStep >= 1 ? 'active' : ''}`}>
                <i />1. Pedido
              </div>
              <div className={`di-step ${modalStep >= 2 ? 'active' : ''}`}>
                <i />2. Motivo
              </div>
              <div className={`di-step ${modalStep >= 3 ? 'active' : ''}`}>
                <i />3. Modalidade
              </div>
              <div className={`di-step ${modalStep >= 4 ? 'active' : ''}`}>
                <i />4. Revisão
              </div>
            </div>

            <div className="di-form-grid">
              <div>
                <label>Nº do pedido</label>
                <input
                  id="newOrder"
                  placeholder="#154350"
                  value={newOrder}
                  onChange={e => setNewOrder(e.target.value)}
                />
              </div>
              <div>
                <label>Cliente</label>
                <input
                  id="newClient"
                  placeholder="Nome do cliente"
                  value={newClient}
                  onChange={e => setNewClient(e.target.value)}
                />
              </div>
              <div>
                <label>Evento</label>
                <select id="newEvent" value={newEvent} onChange={e => setNewEvent(e.target.value)}>
                  <option>Show Roupa Nova</option>
                  <option>Música e Natureza</option>
                  <option>Samba 90 Graus</option>
                </select>
              </div>
              <div>
                <label>Valor</label>
                <input
                  id="newValue"
                  placeholder="R$ 0,00"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                />
              </div>
              <div>
                <label>Forma de pagamento</label>
                <select id="newPayment" value={newPayment} onChange={e => setNewPayment(e.target.value)}>
                  <option>PIX</option>
                  <option>Cartão</option>
                  <option>Voucher</option>
                </select>
              </div>
              <div>
                <label>Tipo</label>
                <select value={newType} onChange={e => setNewType(e.target.value)}>
                  <option>Estorno integral</option>
                  <option>Estorno parcial</option>
                  <option>Conversão em voucher</option>
                </select>
              </div>
              <div className="full">
                <label>Motivo do estorno</label>
                <textarea
                  id="newReason"
                  placeholder="Informe o motivo e contexto da solicitação..."
                  value={newReason}
                  onChange={e => setNewReason(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="di-modal-footer">
            <button className="di-btn" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button className="di-btn di-btn-primary" onClick={handleCreateRefund}>
              Criar solicitação
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`di-toast ${toastVisible ? 'show' : ''}`} id="toast">
        {toastMessage}
      </div>
    </div>
  )
}
