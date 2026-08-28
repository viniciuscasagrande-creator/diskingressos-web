import {
  ArrowUpRight, Clock3, Mail, MessageCircle, Repeat2, ShoppingCart,
  Target, TrendingUp, Users, Sparkles, Zap, BarChart3, UserCheck
} from 'lucide-react'
import type { EventItem } from '../data/events'
import RecoveryCenterPage from './RecoveryCenterPage'

type Mode = 'hub' | 'dashboard' | 'carts' | 'audiences' | 'segments' | 'flows' | 'whatsapp' | 'email' | 'payments' | 'inactive' | 'postevent' | 'automation' | 'reports'

type Props = {
  events: EventItem[]
  producerName: string
  producerId: number | null
  mode: Mode
  notify: (m: string) => void
  onNavigate?: (page: any) => void
}

const remarketingModules = [
  { id: 'remarketing-dashboard', title: 'Dashboard', description: 'Recuperação, receita e conversão.', icon: BarChart3 },
  { id: 'remarketing-carts', title: 'Carrinhos Abandonados', description: 'Sessões interrompidas e recuperação.', icon: ShoppingCart },
  { id: 'remarketing-audiences', title: 'Públicos', description: 'Audiências prontas para ativação.', icon: Users },
  { id: 'remarketing-segments', title: 'Segmentações', description: 'Regras e grupos inteligentes.', icon: Target },
  { id: 'remarketing-flows', title: 'Fluxos de Recuperação', description: 'Jornadas automatizadas multicanal.', icon: Repeat2 },
  { id: 'remarketing-whatsapp', title: 'WhatsApp Remarketing', description: 'Mensagens de recuperação.', icon: MessageCircle },
  { id: 'remarketing-email', title: 'E-mail Remarketing', description: 'Jornadas e campanhas de retorno.', icon: Mail },
  { id: 'remarketing-payments', title: 'Recuperação de Pagamento', description: 'PIX, cartão e pagamentos pendentes.', icon: Clock3 },
  { id: 'remarketing-inactive', title: 'Clientes Inativos', description: 'Reativação e recorrência.', icon: UserCheck },
  { id: 'remarketing-postevent', title: 'Pós-Evento', description: 'Relacionamento depois do evento.', icon: Sparkles },
  { id: 'remarketing-automation', title: 'Remarketing Automático', description: 'Gatilhos e regras contínuas.', icon: Zap },
  { id: 'remarketing-reports', title: 'Relatórios', description: 'Performance e receita recuperada.', icon: TrendingUp }
]

export default function RemarketingPage({ events, producerName, producerId, mode, notify, onNavigate }: Props) {
  if (mode === 'hub') {
    return (
      <section className="growth-page">
        <div className="growth-intro">
          <div>
            <p className="eyebrow remarketing">REMARKETING</p>
            <h2>Hub Remarketing</h2>
            <p>Recupere oportunidades e reengaje participantes com fluxos automatizados.</p>
          </div>
        </div>
        <div className="module-card-grid">
          {remarketingModules.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                className="finance-module-card remarketing-card interactive-hub-card"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(item.id)
                  } else {
                    notify(`Abrindo ${item.title}...`)
                  }
                }}
              >
                <span className="module-card-icon">
                  <Icon size={24} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <ArrowUpRight size={18} className="card-arrow-icon" />
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  if (['carts', 'flows', 'whatsapp', 'email', 'payments', 'inactive', 'postevent', 'automation', 'audiences', 'segments'].includes(mode)) {
    const targetMode = mode === 'audiences' || mode === 'segments' ? 'flows' : mode
    return <RecoveryCenterPage producerId={producerId} events={events} mode={targetMode as any} notify={notify} />
  }

  return (
    <section className="growth-page">
      <div className="growth-intro">
        <div>
          <p className="eyebrow remarketing">REMARKETING</p>
          <h2>Dashboard Remarketing</h2>
          <p>Visão consolidada das oportunidades de recuperação e reengajamento.</p>
        </div>
      </div>
      <div className="growth-kpis">
        <Kpi icon={ShoppingCart} label="Carrinhos abandonados" value="1.248" sub="R$ 86.420 em potencial" />
        <Kpi icon={TrendingUp} label="Receita recuperada" value="R$ 31.580" sub="↑ 21,6% no período" />
        <Kpi icon={Target} label="Taxa de recuperação" value="18,7%" sub="234 vendas recuperadas" />
        <Kpi icon={Users} label="Públicos ativos" value="12" sub="8 automações em execução" />
      </div>
      <div className="growth-grid">
        <article className="growth-panel">
          <div className="panel-head">
            <div>
              <h3>Recuperação por canal</h3>
              <p>Participação na receita recuperada</p>
            </div>
          </div>
          <div className="remarketing-channel">
            <Channel icon={MessageCircle} name="WhatsApp" value="R$ 17.420" pct="55%" />
            <Channel icon={Mail} name="E-mail" value="R$ 8.840" pct="28%" />
            <Channel icon={Clock3} name="Recuperação de pagamento" value="R$ 5.320" pct="17%" />
          </div>
        </article>
        <article className="growth-panel">
          <div className="panel-head">
            <div>
              <h3>Fluxos ativos</h3>
              <p>Automações com melhor desempenho</p>
            </div>
          </div>
          <div className="flow-list">
            {[
              ['Carrinho 30 min', '124 recuperações', 'Ativo'],
              ['PIX pendente 15 min', '68 recuperações', 'Ativo'],
              ['Último lote', '42 recuperações', 'Ativo'],
              ['Pós-evento +30 dias', '1.480 contatos', 'Ativo']
            ].map(r => (
              <div className="flow-row" key={r[0]}>
                <span>
                  <b>{r[0]}</b>
                  <small>{r[1]}</small>
                </span>
                <i>{r[2]}</i>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

function Kpi({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <article className="growth-kpi">
      <div className="kpi-top">
        <span>{label}</span>
        <Icon size={19} />
      </div>
      <strong>{value}</strong>
      <small>{sub}</small>
    </article>
  )
}

function Channel({ icon: Icon, name, value, pct }: { icon: any; name: string; value: string; pct: string }) {
  return (
    <div className="remarketing-channel-row">
      <span className="channel-icon">
        <Icon size={20} />
      </span>
      <div>
        <b>{name}</b>
        <small>{value}</small>
      </div>
      <strong>{pct}</strong>
    </div>
  )
}

function title(mode: Mode) {
  return (
    {
      hub: 'Hub Remarketing',
      dashboard: 'Dashboard Remarketing',
      carts: 'Carrinhos Abandonados',
      audiences: 'Públicos',
      segments: 'Segmentações',
      flows: 'Fluxos de Recuperação',
      whatsapp: 'WhatsApp Remarketing',
      email: 'E-mail Remarketing',
      payments: 'Recuperação de Pagamento',
      inactive: 'Clientes Inativos',
      postevent: 'Pós-Evento',
      automation: 'Remarketing Automático',
      reports: 'Relatórios'
    } as Record<string, string>
  )[mode] || 'Remarketing'
}

