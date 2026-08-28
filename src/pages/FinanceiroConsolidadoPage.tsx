import {
  CheckCircle2, ArrowRight, Sparkles, Landmark, Layers, FileSpreadsheet,
  Zap, Scale, Building, ReceiptText, FileSignature, Wallet, DollarSign
} from 'lucide-react'
import type { EventItem } from '../data/events'
import { financeChecklistSeed } from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const iconsMap: Record<string, any> = {
  'finance-dashboard': DollarSign,
  'finance': Wallet,
  'finance-statement': FileSpreadsheet,
  'finance-cashflow': Layers,
  'finance-receivables': DollarSign,
  'finance-payables': ReceiptText,
  'finance-payouts': Landmark,
  'finance-advance': Zap,
  'finance-reconciliation': Scale,
  'finance-bank-accounts': Building,
  'finance-expenses': ReceiptText,
  'finance-bordero': FileSignature,
}

export default function FinanceiroConsolidadoPage({ events, notify, onNavigate }: Props) {
  return (
    <div className="finance-dashboard-wrapper">
      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">ENCERRAMENTO DE CICLO</span>
          <div className="finance-title-row">
            <h1>Financeiro Consolidado (12 Módulos Ativos)</h1>
            <span className="pipeline-status-badge" style={{ background: '#ECFDF5', color: '#059669', borderColor: '#A7F3D0' }}>
              <CheckCircle2 size={13} /> Fase 17 Concluída com Sucesso
            </span>
          </div>
          <p className="page-subtitle">
            Visão de encerramento da Fase 17 com todos os módulos financeiros implantados, integrados e operacionais.
          </p>
        </div>
      </section>

      {/* Hero Success Banner */}
      <div
        className="card-surface"
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
          color: '#FFFFFF',
          padding: '28px',
          borderRadius: '12px',
          border: '1px solid #059669',
          boxShadow: '0 10px 25px -5px rgba(6, 95, 70, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A7F3D0' }}>
          <Sparkles size={16} /> Fase 17 Concluída com Sucesso
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', margin: '8px 0' }}>
          Módulo Financeiro 100% Funcional e Integrado
        </h2>
        <p style={{ maxWidth: '800px', fontSize: '14px', lineHeight: '1.6', color: '#D1FAE5', margin: 0 }}>
          O sistema DiskIngressos agora conta com o ciclo financeiro completo: Dashboard Analítico, Saldos, Extrato Geral, Fluxo de Caixa (DFC), Contas a Receber, Contas a Pagar, Repasses PIX/TED, Antecipação de Recebíveis, Conciliação Bancária OFX/CNAB, Contas Bancárias Cadastradas, Despesas Operacionais e Borderô Oficial de Fechamento.
        </p>
      </div>

      {/* Checklist Grid */}
      <section style={{ marginTop: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {financeChecklistSeed.map((item, index) => {
            const Icon = iconsMap[item.page] || CheckCircle2
            return (
              <article
                key={item.label}
                className="card-surface"
                style={{
                  padding: '20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s'
                }}
                onClick={() => onNavigate?.(item.page)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '16px', marginBottom: '6px' }}>
                  {item.label}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> {item.status}
                  </span>
                  <span style={{ fontSize: '11px', color: '#1C79EF', fontWeight: 700 }}>
                    Acessar →
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Next Step / Phase 18 Banner */}
      <section
        className="card-surface"
        style={{
          marginTop: '24px',
          padding: '24px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Próxima Etapa: Fase 18 — Contabilidade Integrada
          </h2>
          <p style={{ color: '#64748B', fontSize: '13px', margin: '4px 0 0 0' }}>
            Migração da Contabilidade para o padrão corporativo, conectando vendas, taxas, repasses e despesas diretamente aos lançamentos de partidas dobradas, Livro Diário, Livro Razão, DRE e Balancete.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => onNavigate?.('accounting-dashboard')}
          style={{ height: '44px', padding: '0 20px', fontSize: '13px' }}
        >
          Ir para Contabilidade <ArrowRight size={16} />
        </button>
      </section>
    </div>
  )
}
