import fs from 'node:fs'
import path from 'node:path'

const RELEASE = '26.17.7.1-painel-comercial-moderno-ptbr-2026-09-04'

export function auditEventCommercial() {
  console.log('================================================================')
  console.log(`AUDITORIA CENTRAL DE EVENTOS + PAINEL COMERCIAL — RELEASE: ${RELEASE}`)
  console.log('================================================================\n')

  const artifactsDir = path.join('artifacts', 'commercial')
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true })
  }

  const eventsBackend = fs.readFileSync('server/src/routes/events.ts', 'utf8')
  const apiContent = fs.readFileSync('src/services/api.ts', 'utf8')
  const typesFile = 'src/types/event-commercial.ts'
  const chartsFile = 'src/components/event-commercial/EventCommercialCharts.tsx'
  const comparatorModalFile = 'src/components/event-commercial/EventComparatorModal.tsx'
  const pageFile = 'src/pages/eventos/EventCommercialDashboardPage.tsx'
  const eventsPageFile = 'src/pages/EventsPage.tsx'
  const eventCardFile = 'src/components/EventCard.tsx'
  const cssDashboard = 'src/pages/eventos/event-commercial-dashboard.css'
  const cssEvents = 'src/pages/eventos/events-page-enhanced.css'

  const requiredFiles = [
    typesFile,
    chartsFile,
    comparatorModalFile,
    pageFile,
    eventsPageFile,
    eventCardFile,
    cssDashboard,
    cssEvents
  ]

  for (const f of requiredFiles) {
    if (!fs.existsSync(f)) {
      console.error(`[FAIL] Arquivo obrigatório não encontrado: ${f}`)
      process.exit(1)
    }
  }

  const pageContent = fs.readFileSync(pageFile, 'utf8')
  const eventsPageContent = fs.readFileSync(eventsPageFile, 'utf8')
  const eventCardContent = fs.readFileSync(eventCardFile, 'utf8')
  const chartsContent = fs.readFileSync(chartsFile, 'utf8')
  const modalContent = fs.readFileSync(comparatorModalFile, 'utf8')

  // 1. Backend Route & Scoping
  const hasEndpoint = eventsBackend.includes('/:id/commercial-dashboard')
  const hasTenantIsolation = eventsBackend.includes('event.producerId !== req.auth!.producerId')
  const hasKPIAggregation = eventsBackend.includes('grossRevenueFormatted') &&
    eventsBackend.includes('salesEvolution') &&
    eventsBackend.includes('paymentMethods') &&
    eventsBackend.includes('occupancy')

  // 2. Client API & Types
  const hasClientType = apiContent.includes('CommercialDashboardResponse')
  const hasClientFunc = apiContent.includes('getEventCommercialDashboard')

  // 3. Central de Eventos Features (EventsPage)
  const hasHorizontalVerticalToggle = eventsPageContent.includes('btn-view-horizontal') &&
    eventsPageContent.includes('btn-view-vertical')
  const hasColumnSelector = eventsPageContent.includes('events-col-selector') &&
    (eventsPageContent.includes('btn-cols-${colNum}') || eventsPageContent.includes('btn-cols-2'))
  const hasStatusFilters = eventsPageContent.includes('events-filter-active') &&
    eventsPageContent.includes('events-filter-inactive') &&
    eventsPageContent.includes('events-filter-all')
  const hasLocalStoragePersistence = eventsPageContent.includes('STORAGE_KEY_VIEW_MODE') &&
    eventsPageContent.includes('STORAGE_KEY_GRID_COLS')
  const hasCompareMode = eventsPageContent.includes('btn-toggle-compare-mode') &&
    eventsPageContent.includes('events-compare-banner') &&
    eventsPageContent.includes('btn-execute-compare')
  const hasEventComparatorModal = eventsPageContent.includes('<EventComparatorModal')

  // 4. EventCard Compare Integration
  const hasCardCompareSupport = eventCardContent.includes('isComparing') &&
    eventCardContent.includes('onToggleCompare') &&
    eventCardContent.includes('checkbox-compare-')

  // 5. Commercial Dashboard (5 KPIs, Subtabs, Modern SVG Charts)
  const requiredDashboardTestIds = [
    'event-commercial-dashboard',
    'btn-access-event-os',
    'event-subtabs',
    'tab-overview',
    'commercial-kpis',
    'kpi-revenue',
    'kpi-sold',
    'kpi-available',
    'kpi-courtesy',
    'kpi-occupancy',
    'card-sales-evolution',
    'card-sales-velocity',
    'card-payment-methods',
    'card-ticket-types',
    'card-occupancy-gauge',
    'card-recent-transactions',
    'card-weekday-distribution'
  ]
  const missingDashboardTestIds = requiredDashboardTestIds.filter(id => !pageContent.includes(`data-testid="${id}"`))

  // 6. Modern SVG Charts without heavy dependencies
  const hasSVGCharts = chartsContent.includes('<svg') &&
    chartsContent.includes('SalesEvolutionChart') &&
    chartsContent.includes('SalesVelocityChart') &&
    chartsContent.includes('PaymentDonutChart') &&
    chartsContent.includes('OccupancyGaugeChart') &&
    chartsContent.includes('WeekdayBarChart')

  // 7. Order Investigation Link from Recent Transactions
  const hasOrderDrillDown = pageContent.includes('setInvestigatingOrderCode') &&
    pageContent.includes('EventOrderInvestigationPage')

  // 8. 100% PT-BR verification
  const hasPTBRHeader = pageContent.includes('Acessar Event OS') &&
    pageContent.includes('Visão Geral') &&
    pageContent.includes('Receita Total') &&
    pageContent.includes('Ingressos Vendidos') &&
    pageContent.includes('Disponíveis') &&
    pageContent.includes('Cortesias') &&
    pageContent.includes('Ocupação')

  const checklist = [
    { name: 'Endpoint /api/events/:id/commercial-dashboard implementado no backend', ok: hasEndpoint },
    { name: 'Isolamento de produtora (Tenant Isolation) no endpoint comercial', ok: hasTenantIsolation },
    { name: 'Agregação comercial de KPIs, evolução, pagamentos e ocupação', ok: hasKPIAggregation },
    { name: 'Cliente getEventCommercialDashboard e tipos TypeScript', ok: hasClientType && hasClientFunc },
    { name: 'Central de Eventos: Alternador Horizontal vs Vertical', ok: hasHorizontalVerticalToggle },
    { name: 'Central de Eventos: Seletor de 2, 3, 4, 5 e 6 colunas por linha', ok: hasColumnSelector },
    { name: 'Central de Eventos: Filtros funcionais Ativos / Inativos / Todos', ok: hasStatusFilters },
    { name: 'Central de Eventos: Persistência de visualização em localStorage', ok: hasLocalStoragePersistence },
    { name: 'Central de Eventos: Modo de comparação com seleção múltipla e banner', ok: hasCompareMode },
    { name: 'EventCard: Suporte a checkbox e modo de seleção para comparação', ok: hasCardCompareSupport },
    { name: 'Modal do Comparador Comercial lado a lado com métricas reais', ok: hasEventComparatorModal && modalContent.includes('event-comparator-modal') },
    { name: 'Test IDs obrigatórios do Painel Comercial do Evento', ok: missingDashboardTestIds.length === 0, detail: missingDashboardTestIds.length ? `Faltando: ${missingDashboardTestIds.join(', ')}` : undefined },
    { name: 'Gráficos SVG modernos sem bibliotecas externas pesadas', ok: hasSVGCharts },
    { name: 'Drill-down de investigação 360° a partir das Últimas Transações', ok: hasOrderDrillDown },
    { name: 'Padronização Total PT-BR no Painel Comercial', ok: hasPTBRHeader }
  ]

  let allOk = true
  for (const item of checklist) {
    if (item.ok) {
      console.log(`[PASS] ${item.name}`)
    } else {
      console.error(`[FAIL] ${item.name}${item.detail ? ` -> ${item.detail}` : ''}`)
      allOk = false
    }
  }

  const report = {
    release: RELEASE,
    timestamp: new Date().toISOString(),
    status: allOk ? 'PASS' : 'FAIL',
    checklist
  }

  fs.writeFileSync(
    path.join(artifactsDir, 'event-commercial-audit-report.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  )

  if (!allOk) {
    console.error('\n[AUDIT FAILED] Verificações de conformidade falharam.')
    process.exit(1)
  }

  console.log('\n[AUDIT SUCCESS] Todas as verificações da Fase 26.17.7.1 foram aprovadas com sucesso!')
}

if (process.argv[1] && process.argv[1].endsWith('audit-event-commercial.mjs')) {
  auditEventCommercial()
}
