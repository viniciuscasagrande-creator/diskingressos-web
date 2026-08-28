import { useState } from 'react'
import {
  BookOpen, Calculator, Download, CheckCircle2, Scale,
  Layers, ArrowUpRight, ArrowDownLeft, FileSpreadsheet,
  Building2, Sparkles, Filter, RefreshCw, ShieldCheck, ArrowRight
} from 'lucide-react'
import type { EventItem } from '../data/events'
import { financeSummary, type SystemTier } from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function AccountingDashboardPage({ events, notify, onNavigate }: Props) {
  const [tier, setTier] = useState<SystemTier>('advanced')
  const [period, setPeriod] = useState('08/2026')

  // Demonstration Accounting Data
  const totalAssets = 1840250.00
  const totalLiabilities = 519120.40
  const totalEquity = 1321129.60
  const netRevenue = financeSummary.netRevenue
  const netProfit = 218400.00

  // Journal Entries (Partidas Dobradas)
  const journalEntries = [
    {
      id: 'LCT-8891',
      date: '28/08/2026',
      description: 'Venda de Ingressos #DI-98240 — Iron Maiden Symphonic',
      debitAccount: '1.1.1.02 — Bancos Conta Movimento (Itaú)',
      creditAccount: '2.1.3.01 — Adiantamento de Clientes (Passivo)',
      amount: 1250.00,
      status: 'Escriturado'
    },
    {
      id: 'LCT-8892',
      date: '28/08/2026',
      description: 'Apropriação de Taxa de Serviço DiskIngressos',
      debitAccount: '2.1.3.01 — Adiantamento de Clientes (Passivo)',
      creditAccount: '3.1.1.01 — Receita de Intermediação de Ingressos',
      amount: 85.00,
      status: 'Escriturado'
    },
    {
      id: 'LCT-8893',
      date: '28/08/2026',
      description: 'Repasse Liquidado — Produtora Rua da Música',
      debitAccount: '2.1.4.01 — Contas a Pagar / Repasses a Produtores',
      creditAccount: '1.1.1.02 — Bancos Conta Movimento (Itaú)',
      amount: 8420.00,
      status: 'Escriturado'
    },
    {
      id: 'LCT-8894',
      date: '27/08/2026',
      description: 'Tarifas de Gateway Adquirente Cielo Mês 08',
      debitAccount: '4.1.2.03 — Despesas Financeiras e Taxas de Cartão',
      creditAccount: '2.1.2.01 — Fornecedores / Gateways a Pagar',
      amount: 184.90,
      status: 'Escriturado'
    },
    {
      id: 'LCT-8895',
      date: '26/08/2026',
      description: 'Serviços de Infraestrutura Cloud AWS Brasil',
      debitAccount: '4.1.1.05 — Custos de Tecnologia e Servidores',
      creditAccount: '1.1.1.02 — Bancos Conta Movimento (Itaú)',
      amount: 7420.00,
      status: 'Escriturado'
    }
  ]

  // DRE Sintética
  const dreItems = [
    { label: '1. RECEITA BRUTA DE SERVIÇOS E BILHETERIA', value: 1284320.00, isBold: true, isNegative: false },
    { label: '(-) Deduções da Receita Bruta e Impostos (ISS/PIS/COFINS)', value: -102059.10, isBold: false, isNegative: true },
    { label: '(=) RECEITA OPERACIONAL LÍQUIDA', value: 1182260.90, isBold: true, isNegative: false },
    { label: '(-) Custos Diretos de Intermediação e Repasses', value: -783960.00, isBold: false, isNegative: true },
    { label: '(=) LUCRO BRUTO OPERACIONAL', value: 398300.90, isBold: true, isNegative: false },
    { label: '(-) Despesas Administrativas e Infraestrutura Cloud', value: -84200.00, isBold: false, isNegative: true },
    { label: '(-) Despesas com Marketing e Atribuição UTM', value: -42800.00, isBold: false, isNegative: true },
    { label: '(=) EBITDA / LAJIDA', value: 271300.90, isBold: true, isNegative: false },
    { label: '(-) Depreciação e Despesas Financeiras Líquidas', value: -18400.00, isBold: false, isNegative: true },
    { label: '(=) RESULTADO LÍQUIDO DO EXERCÍCIO (LUCRO)', value: 252900.90, isBold: true, isHighlight: true, isNegative: false }
  ]

  const exportSpedECD = () => {
    notify('Arquivo SPED Contábil (ECD / FCONT) gerado e validado com sucesso!')
  }

  return (
    <div className="finance-dashboard-wrapper">
      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">CONTABILIDADE SOCIETÁRIA & FISCAL</span>
          <div className="finance-title-row">
            <h1>Dashboard Contábil Integrado</h1>
            <span className="pipeline-status-badge" style={{ background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}>
              <Sparkles size={13} /> Partidas Dobradas Automáticas
            </span>
          </div>
          <p className="page-subtitle">
            Escrituração contábil em tempo real conectada diretamente às vendas do e-commerce, deduções de taxas, liquidações de repasses e fechamento de competência.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-select-group">
            <span>Nível do Módulo</span>
            <select value={tier} onChange={e => setTier(e.target.value as any)}>
              <option value="standard">Standard (Básico)</option>
              <option value="advanced">Advanced (DRE + Diário)</option>
              <option value="expert">Expert (SPED + Auditoria)</option>
            </select>
          </div>

          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportSpedECD} title="Gerar SPED">
              <Download size={15} /> Exportar SPED ECD
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <Building2 size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Ativo Total</span>
            <strong className="kpi-value">{brl(totalAssets)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">Circulante + Permanente</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <Scale size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Passivo Circulante</span>
            <strong className="kpi-value">{brl(totalLiabilities)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag warning">Repasses a Pagar</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <ShieldCheck size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Patrimônio Líquido</span>
            <strong className="kpi-value">{brl(totalEquity)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">Capital Social + Reservas</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <Calculator size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Lucro Líquido Exercício</span>
            <strong className="kpi-value">{brl(252900.90)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">Margem de 21.4%</span>
            </div>
          </div>
        </article>
      </section>

      {/* DRE & Journal Two Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', marginTop: '4px' }}>
        {/* DRE Sintética */}
        <section className="card-surface" style={{ padding: '24px', borderRadius: '12px' }}>
          <div className="card-heading">
            <div>
              <h3>Demonstração do Resultado (DRE)</h3>
              <p>Apuração de competência do mês 08/2026</p>
            </div>
            <span className="kpi-tag positive">Auditado</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            {dreItems.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: item.isHighlight ? '#ECFDF5' : item.isBold ? '#F8FAFC' : 'transparent',
                  border: item.isHighlight ? '1px solid #A7F3D0' : 'none',
                  fontSize: item.isHighlight ? '14px' : '13px',
                  fontWeight: item.isBold ? 700 : 500,
                  color: item.isHighlight ? '#065F46' : '#0F172A'
                }}
              >
                <span>{item.label}</span>
                <strong style={{ color: item.isHighlight ? '#059669' : item.isNegative ? '#EF4444' : '#0F172A' }}>
                  {item.isNegative ? `- ${brl(Math.abs(item.value))}` : brl(item.value)}
                </strong>
              </div>
            ))}
          </div>
        </section>

        {/* Livro Diário & Partidas Dobradas */}
        <section className="card-surface" style={{ padding: '24px', borderRadius: '12px' }}>
          <div className="card-heading">
            <div>
              <h3>Livro Diário — Últimos Lançamentos</h3>
              <p>Escrituração automática por Partidas Dobradas</p>
            </div>
            <button
              className="text-action"
              onClick={() => onNavigate?.('accounting-journal')}
              style={{ fontSize: '12px', fontWeight: 700 }}
            >
              Ver Diário Completo →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {journalEntries.map(lct => (
              <div
                key={lct.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#1C79EF' }}>{lct.id}</span>
                    <small style={{ color: '#64748B' }}>{lct.date}</small>
                  </div>
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>{brl(lct.amount)}</strong>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                  {lct.description}
                </div>

                <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div><span style={{ color: '#059669', fontWeight: 700 }}>[D]</span> {lct.debitAccount}</div>
                  <div><span style={{ color: '#DC2626', fontWeight: 700 }}>[C]</span> {lct.creditAccount}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Accounting Quick Navigation Strip */}
      <section
        className="card-surface"
        style={{
          marginTop: '20px',
          padding: '20px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
            Módulos da Fase 18 — Contabilidade em Operação
          </h4>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
            Acesse rapidamente o Plano de Contas, Livro Diário, Livro Razão, Balancete e Fechamento.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="tool-btn" onClick={() => onNavigate?.('accounting-chart')}>Plano de Contas</button>
          <button className="tool-btn" onClick={() => onNavigate?.('accounting-journal')}>Livro Diário</button>
          <button className="tool-btn" onClick={() => onNavigate?.('accounting-ledger')}>Livro Razão</button>
          <button className="tool-btn" onClick={() => onNavigate?.('accounting-trial-balance')}>Balancete</button>
          <button className="tool-btn" onClick={() => onNavigate?.('accounting-closing')}>Fechamento Fiscal</button>
        </div>
      </section>
    </div>
  )
}
