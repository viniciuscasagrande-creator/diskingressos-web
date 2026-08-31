import type { ComponentType } from 'react'
import { useMemo, useState } from 'react'
import {
  Search, WalletCards, HandCoins, TrendingUp, ReceiptText, Undo2, ChartNoAxesCombined, Scale, Percent, Brain,
  ShieldCheck, Calculator, Split, CreditCard, Settings, TrendingDown, PenTool, Building2, ServerCog, Landmark,
  FileSpreadsheet, BookOpenCheck, Boxes, FileText, LockKeyhole, FileSignature
} from 'lucide-react'
import type { PageKey } from '../components/ModuleSidebar'

type Card = { title: string; desc: string; icon: ComponentType<{ size?: number }>; tone: 'blue' | 'orange' | 'green' | 'purple'; page: PageKey; badge?: string }
type Props = { onNavigate: (p: PageKey) => void }

const cash: Card[] = [
  { title: 'Saldo', desc: 'Saldo consolidado, disponível, bloqueado e previsto.', icon: WalletCards, tone: 'blue', page: 'finance' },
  { title: 'Solicitar Repasse', desc: 'Solicitação, aprovação, programação e comprovante.', icon: HandCoins, tone: 'blue', page: 'finance-payouts' },
  { title: 'Antecipações', desc: 'Simule e acompanhe antecipações de recebíveis.', icon: TrendingUp, tone: 'blue', page: 'finance-advance' },
  { title: 'Extrato Financeiro', desc: 'Todos os lançamentos, taxas, entradas e saídas.', icon: ReceiptText, tone: 'blue', page: 'finance-statement' },
  { title: 'Devoluções / Estornos', desc: 'Total, parcial, aprovação e envio ao gateway.', icon: Undo2, tone: 'blue', page: 'finance-refunds', badge: 'Operacional' },
]

const advanced: Card[] = [
  { title: 'Financeiro Advanced', desc: 'Visão gerencial de caixa, recebíveis, obrigações e resultado.', icon: ChartNoAxesCombined, tone: 'orange', page: 'finance-advanced' },
  { title: 'Conciliação Bancária', desc: 'Banco, PIX, cartão, gateway, POS, split e divergências.', icon: Scale, tone: 'orange', page: 'finance-reconciliation' },
  { title: 'Financeiro Spread', desc: 'Margem por meio de pagamento, adquirente e evento.', icon: Percent, tone: 'orange', page: 'finance-spread' },
  { title: 'Inteligência Financeira', desc: 'Indicadores de resultado, margem, ROI e alertas.', icon: Brain, tone: 'orange', page: 'finance-intelligence' },
  { title: 'Operadoras de Cartão', desc: 'MDR, liquidação, antecipação e disponibilidade.', icon: ShieldCheck, tone: 'orange', page: 'finance-operators', badge: 'Novo' },
]

const payments: Card[] = [
  { title: 'Simulador de Spread', desc: 'Simule preço, gateway, MDR, parcelamento e margem.', icon: Calculator, tone: 'green', page: 'finance-spread' },
  { title: 'Split Financeiro', desc: 'Partilha de receitas, comissões e beneficiários.', icon: Split, tone: 'green', page: 'finance-split' },
  { title: 'Métodos de Pagamento', desc: 'PIX, crédito, débito, boleto e parcelamento.', icon: CreditCard, tone: 'green', page: 'finance-methods', badge: 'Novo' },
  { title: 'Gateway de Pagamentos', desc: 'Provedores, credenciais, webhook, ambiente e prioridade.', icon: ServerCog, tone: 'green', page: 'finance-gateways', badge: 'Novo' },
  { title: 'Pagamentos Customizados', desc: 'Regras comerciais e formas especiais por produtor/evento.', icon: Settings, tone: 'green', page: 'finance-custom' },
  { title: 'Despesas', desc: 'Custos, documentos, fornecedor e centro de custo.', icon: TrendingDown, tone: 'green', page: 'finance-expenses' },
  { title: 'Contas Bancárias', desc: 'Contas de liquidação, repasse e conciliação.', icon: Landmark, tone: 'green', page: 'finance-bank-accounts' },
  { title: 'Borderô', desc: 'Geração, revisão, aprovação, assinatura e histórico.', icon: PenTool, tone: 'green', page: 'finance-borderos' },
  { title: 'Negociações Financeiras', desc: 'Condições comerciais, contratos e regras especiais.', icon: Building2, tone: 'green', page: 'finance-negotiations' },
]

const accounting: Card[] = [
  { title: 'Contabilidade Disk', desc: 'Hub contábil integrado ao ciclo financeiro.', icon: WalletCards, tone: 'purple', page: 'finance-accounting', badge: 'ERP' },
  { title: 'Centro de Custos', desc: 'Resultado e despesas por evento, área e operação.', icon: Boxes, tone: 'purple', page: 'finance-cost-centers' },
  { title: 'Plano de Contas', desc: 'Estrutura contábil sintética e analítica.', icon: BookOpenCheck, tone: 'purple', page: 'finance-chart-accounts' },
  { title: 'Lançamentos Contábeis', desc: 'Débito, crédito, competência, provisão e estorno.', icon: FileText, tone: 'purple', page: 'finance-accounting-entries' },
  { title: 'DRE & Orçamento', desc: 'DRE por evento/produtor e orçado x realizado.', icon: FileSpreadsheet, tone: 'purple', page: 'finance-dre' },
  { title: 'Documentos & Assinaturas', desc: 'Versionamento, aprovação e assinatura digital.', icon: FileSignature, tone: 'purple', page: 'finance-signatures' },
  { title: 'Fechamento', desc: 'Checklist, bloqueio de competência e auditoria.', icon: LockKeyhole, tone: 'purple', page: 'finance-closing' },
]

export default function FinanceHubPage({ onNavigate }: Props) {
  const [q, setQ] = useState('')
  const filter = (cards: Card[]) => cards.filter(c => (c.title + ' ' + c.desc).toLowerCase().includes(q.toLowerCase()))
  const groups = useMemo(() => [
    { title: 'OPERAÇÕES DE CAIXA', subtitle: 'Rotinas financeiras do dia a dia', cards: filter(cash) },
    { title: 'ADVANCED & INTELIGÊNCIA', subtitle: 'Análise, conciliação, spread e performance', cards: filter(advanced) },
    { title: 'MÉTODOS, GATEWAYS & LIQUIDAÇÕES', subtitle: 'Infraestrutura de pagamentos e processamento', cards: filter(payments) },
    { title: 'CONTABILIDADE DISK', subtitle: 'Contabilidade integrada ao financeiro', cards: filter(accounting) },
  ], [q])

  return (
    <div className="finance-hub finance-hub-video-model">
      <div className="finance-video-heading">
        <div>
          <span>FINANCEIRO 360°</span>
          <h1>Hub Financeiro</h1>
          <p>Estrutura reorganizada conforme o modelo funcional apresentado no vídeo.</p>
        </div>
      </div>
      <div className="module-search">
        <Search size={22} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar módulo financeiro..." />
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
        <small>{card.desc}</small>
      </span>
    </button>
  )
}
