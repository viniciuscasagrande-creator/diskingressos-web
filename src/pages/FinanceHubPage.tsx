import type { ComponentType } from 'react'
import { useMemo, useState } from 'react'
import {
  Search, WalletCards, HandCoins, TrendingUp, ReceiptText, Undo2, ChartNoAxesCombined, Scale, Percent, Brain,
  ShieldCheck, Calculator, Split, CreditCard, Settings, TrendingDown, PenTool, Building2, ServerCog, Landmark,
  FileSpreadsheet, BookOpenCheck, Boxes, FileText, LockKeyhole, FileSignature, Store, RefreshCw
} from 'lucide-react'
import type { PageKey } from '../components/ModuleSidebar'

type Card = {
  title: string
  desc: string
  icon: ComponentType<{ size?: number }>
  tone: 'blue' | 'orange' | 'green' | 'purple'
  page: PageKey
  badge?: string
}

type Props = { onNavigate: (p: PageKey) => void }

const cash: Card[] = [
  { title: 'Dashboard Financeiro', desc: 'Saldo consolidado, disponível, bloqueado e faturamento por evento.', icon: WalletCards, tone: 'blue', page: 'finance' },
  { title: 'Solicitar Repasse', desc: 'Solicitações de saque, PIX bancário, prazos e comprovantes.', icon: HandCoins, tone: 'blue', page: 'finance-payouts' },
  { title: 'Antecipações', desc: 'Simulação instantânea e liberação de recebíveis futuros.', icon: TrendingUp, tone: 'blue', page: 'finance-advance' },
  { title: 'Extrato Detalhado', desc: 'Histórico completo de entradas, tarifas, saídas e liquidações.', icon: ReceiptText, tone: 'blue', page: 'finance-statement' },
  { title: 'Pontos de Venda (PDV)', desc: 'Monitor de bilheterias físicas, caixas CX-001..006 e operadores.', icon: Store, tone: 'blue', page: 'finance-pdv', badge: 'Físico & Web' },
  { title: 'Devoluções / Estornos', desc: 'Central de CDC, estornos no gateway e geração de vouchers.', icon: Undo2, tone: 'blue', page: 'finance-refunds', badge: 'Operacional' },
]

const advanced: Card[] = [
  { title: 'Financeiro Advanced', desc: 'Fluxo previsto x realizado, contas a pagar, a receber e liquidez.', icon: ChartNoAxesCombined, tone: 'orange', page: 'finance-advanced' },
  { title: 'Conciliação Bancária', desc: 'Cruzamento com Itaú, Santander, BB, Bradesco e IA assistida.', icon: Scale, tone: 'orange', page: 'finance-reconciliation' },
  { title: 'Financeiro Spread', desc: 'Análise de margens de lucro por bandeira e adquirente.', icon: Percent, tone: 'orange', page: 'finance-spread' },
  { title: 'Simulador de Spread', desc: 'Cálculo dinâmico de MDR, antecipação, comissão Disk e lucro.', icon: Calculator, tone: 'orange', page: 'finance-spread-simulator', badge: 'Simulador' },
  { title: 'Inteligência Financeira', desc: 'EBITDA, ROI, margem por evento e insights preditivos por IA.', icon: Brain, tone: 'orange', page: 'finance-intelligence', badge: 'IA' },
]

const payments: Card[] = [
  { title: 'Split Financeiro', desc: 'Partilha automatizada entre organizador, afiliado e produtores.', icon: Split, tone: 'green', page: 'finance-split' },
  { title: 'Operadoras & Gateways', desc: 'Credenciais, 12 sub-abas, PIX, boletos, sandbox e testes.', icon: ShieldCheck, tone: 'green', page: 'finance-operators', badge: '12 Módulos' },
  { title: 'Métodos de Pagamento', desc: 'Tarifas MDR, prazos D+0/D+1/D+30 e share de vendas.', icon: CreditCard, tone: 'green', page: 'finance-methods' },
  { title: 'Pagamentos Customizados', desc: 'Regras comerciais especiais, cortesias e acordos VIP.', icon: Settings, tone: 'green', page: 'finance-custom' },
  { title: 'Negociações Financeiras', desc: 'Receita por método, despesas, patrocínio, advanced e DRE.', icon: Building2, tone: 'green', page: 'finance-negotiations', badge: '5 Abas' },
  { title: 'Despesas Operacionais', desc: 'Controle de custos por fornecedor, categoria e vencimento.', icon: TrendingDown, tone: 'green', page: 'finance-expenses' },
  { title: 'Contas Bancárias', desc: 'Contas cadastradas, chaves PIX e contas padrão de liquidação.', icon: Landmark, tone: 'green', page: 'finance-bank-accounts' },
  { title: 'Borderô & Assinaturas', desc: 'Demonstrativo oficial do evento, Autentique e programação.', icon: PenTool, tone: 'green', page: 'finance-bordero' },
]

export default function FinanceHubPage({ onNavigate }: Props) {
  const [q, setQ] = useState('')
  const filter = (cards: Card[]) => cards.filter(c => (c.title + ' ' + c.desc).toLowerCase().includes(q.toLowerCase()))

  const groups = useMemo(() => [
    { title: 'OPERAÇÕES DE CAIXA', subtitle: 'Rotinas financeiras, bilheterias físicas e saldos diários', cards: filter(cash) },
    { title: 'ADVANCED & INTELIGÊNCIA', subtitle: 'Fluxo previsto x realizado, conciliação, spread e IA preditiva', cards: filter(advanced) },
    { title: 'MÉTODOS, GATEWAYS & LIQUIDAÇÕES', subtitle: 'Infraestrutura de cartões, splits, negociações e borderô', cards: filter(payments) },
  ], [q])

  return (
    <div className="finance-hub finance-hub-video-model">
      <div className="finance-video-heading">
        <div>
          <span>DISKINGRESSOS · GESTÃO FINANCEIRA 360°</span>
          <h1>Hub Financeiro Consolidado</h1>
          <p>Acesse rapidamente todas as ferramentas financeiras, conciliações, simulações e relatórios executivos.</p>
        </div>
      </div>

      <div className="module-search">
        <Search size={22} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar módulo financeiro (ex: PDV, Negociações, Split, Spread, Gateways)..." />
      </div>

      {groups.map(g => g.cards.length > 0 && (
        <section className="hub-section" key={g.title}>
          <div className="hub-section-title">
            <h2>{g.title}</h2>
            <small>{g.subtitle}</small>
          </div>
          <div className="hub-card-grid">
            {g.cards.map(c => (
              <HubCard key={c.title} card={c} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function HubCard({ card, onNavigate }: { card: Card; onNavigate: (p: PageKey) => void }) {
  const Icon = card.icon
  return (
    <button className="hub-card finance-video-card" onClick={() => onNavigate(card.page)}>
      <span className={`hub-icon ${card.tone}`}><Icon size={25} /></span>
      <span className="hub-card-copy">
        <span className="hub-card-title">
          <strong>{card.title}</strong>
          {card.badge && <em>{card.badge}</em>}
        </span>
        <span className="hub-card-desc">{card.desc}</span>
      </span>
    </button>
  )
}
