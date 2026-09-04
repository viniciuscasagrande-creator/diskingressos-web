import fs from 'node:fs'

const checks = [
  [
    'src/pages/eventos/EventProducerExecutivePage.tsx',
    [
      'executive-dashboard-container',
      'executive-header',
      'executive-title',
      'badge-live',
      'badge-health',
      'period-selector',
      'btn-presentation-mode',
      'btn-open-comparison',
      'btn-export-pdf',
      'btn-export-excel',
      'kpi-gross-revenue',
      'kpi-net-revenue',
      'kpi-tickets-sold',
      'kpi-average-ticket',
      'kpi-occupancy',
      'kpi-forecast-revenue',
      'kpi-soldout-probability',
      'kpi-health-score',
      'card-revenue-progress',
      'card-conversion-funnel',
      'card-channels-performance',
      'card-attendance-sectors',
      'card-finance-consolidated',
      'card-liveops-support',
      'card-risk-incidents',
      'card-executive-insights'
    ]
  ],
  [
    'server/src/routes/events.ts',
    [
      '26.16.12-executive-dashboard-operacional-2026-09-04',
      '/:id/executive-dashboard',
      'producerId !== req.auth!.producerId'
    ]
  ],
  [
    'src/pages/EventContextPage.tsx',
    [
      "import EventProducerExecutivePage from './eventos/EventProducerExecutivePage'",
      "if(page==='event-producer-executive') return <EventProducerExecutivePage"
    ]
  ],
  [
    'src/services/api.ts',
    [
      'getExecutiveDashboard',
      'ExecutiveDashboardData'
    ]
  ],
  [
    'src/pages/eventos/event-producer-executive.css',
    [
      'epe-container',
      'is-presentation',
      'epe-kpi-grid'
    ]
  ]
]

let hasError = false
for (const [filePath, tokens] of checks) {
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] Arquivo não encontrado: ${filePath}`)
    hasError = true
    continue
  }
  const content = fs.readFileSync(filePath, 'utf8')
  for (const token of tokens) {
    if (!content.includes(token)) {
      console.error(`[FAIL] Token obrigatório ausente em ${filePath}: "${token}"`)
      hasError = true
    }
  }
}

if (hasError) {
  console.error('\n[GATE FAILED] Falha na verificação da Fase 26.16.12 — Executive Dashboard Operacional.')
  process.exit(1)
}

console.log('[GATE PASSED] Fase 26.16.12 — Executive Dashboard Operacional verificada com sucesso!')
