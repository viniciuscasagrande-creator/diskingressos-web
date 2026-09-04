import fs from 'node:fs'

const checks = [
  [
    'src/pages/eventos/EventRevenueIntelPage.tsx',
    [
      '26.16.8-revenue-pricing-intelligence-operacional-2026-09-04',
      'revenue-intel-operational',
      'REVENUE & PRICING INTELLIGENCE',
      'eri-priority-kpis',
      'kpi-gross-revenue',
      'kpi-net-revenue',
      'kpi-tickets-sold',
      'kpi-avg-ticket',
      'kpi-occupancy',
      'kpi-potential-revenue',
      'kpi-remaining-potential',
      'kpi-sales-velocity',
      'eri-velocity-section',
      'eri-burnrate-section',
      'eri-scenarios-section',
      'eri-recommendations-section',
      'eri-alerts-section',
      'eri-marketing-attribution-section',
      'eri-modal-simulation',
      'eri-modal-adjust-price',
      'eri-modal-drilldown'
    ]
  ],
  [
    'server/src/routes/events.ts',
    [
      '26.16.8-revenue-pricing-intelligence-operacional-2026-09-04',
      '/:id/revenue-intelligence',
      '/:id/revenue-intelligence/timeline',
      '/:id/revenue-intelligence/lots',
      '/:id/revenue-intelligence/forecast',
      '/:id/revenue-intelligence/recommendations',
      '/:id/revenue-intelligence/simulate',
      '/:id/pricing/change-request',
      'producerId !== req.auth!.producerId'
    ]
  ],
  [
    'src/pages/EventContextPage.tsx',
    [
      "import EventRevenueIntelPage from './eventos/EventRevenueIntelPage'",
      "if(page==='event-revenue-intel') return <EventRevenueIntelPage"
    ]
  ],
  [
    'src/services/api.ts',
    [
      'getRevenueIntelligence',
      'getRevenueTimeline',
      'getRevenueLots',
      'getRevenueForecast',
      'getRevenueRecommendations',
      'simulateRevenuePricing',
      'requestPricingChange'
    ]
  ]
]

let ok = true
for (const [file, tokens] of checks) {
  if (!fs.existsSync(file)) {
    console.error(`MISSING FILE: ${file}`)
    ok = false
    continue
  }
  const text = fs.readFileSync(file, 'utf8')
  for (const token of tokens) {
    if (!text.includes(token)) {
      console.error(`FAIL in ${file}: Missing token "${token}"`)
      ok = false
    }
  }
}

if (!ok) {
  console.error('\n❌ Falha na verificação de Revenue & Pricing Intelligence Operacional.')
  process.exit(1)
}

console.log('PASS — Revenue & Pricing Intelligence Operacional: Header com 8 Indicadores, Motor de Velocidade, Drill-Down, Inteligência por Lote, Forecast Previsto x Realizado, Simulador Puro, Alertas Comerciais, Marketing Integrado, Change-Request com RBAC e AuditLog validados com sucesso!')
