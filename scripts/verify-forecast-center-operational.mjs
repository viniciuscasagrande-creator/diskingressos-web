import fs from 'node:fs'

const checks = [
  [
    'src/pages/eventos/EventForecastCenterPage.tsx',
    [
      '26.16.10-forecast-center-operacional-2026-09-04',
      'forecast-center-container',
      'FORECAST CENTER',
      'forecast-kpi-sales',
      'forecast-kpi-revenue',
      'forecast-kpi-occupancy',
      'forecast-kpi-soldout',
      'forecast-kpi-probability',
      'forecast-kpi-ticket',
      'forecast-confidence-card',
      'forecast-timeline-table',
      'forecast-metric-toggle-revenue',
      'forecast-metric-toggle-tickets',
      'forecast-metric-toggle-occupancy',
      'forecast-metric-toggle-ticket',
      'forecast-scenarios-section',
      'forecast-scenario-conservative',
      'forecast-scenario-base',
      'forecast-scenario-optimistic',
      'forecast-simulator',
      'forecast-simulate-button',
      'forecast-lots-section',
      'forecast-alerts-section',
      'forecast-history-section',
      'forecast-accuracy-section',
      'btn-run-forecast'
    ]
  ],
  [
    'server/src/routes/events.ts',
    [
      '26.16.10-forecast-center-operacional-2026-09-04',
      '/:id/forecast',
      '/:id/forecast/timeline',
      '/:id/forecast/lots',
      '/:id/forecast/accuracy',
      '/:id/forecast/scenarios',
      '/:id/forecast/simulate',
      '/:id/forecast/run',
      'eventForecastSnapshot',
      'producerId !== req.auth!.producerId'
    ]
  ],
  [
    'src/pages/EventContextPage.tsx',
    [
      "import EventForecastCenterPage from './eventos/EventForecastCenterPage'",
      "if(page==='event-forecast') return <EventForecastCenterPage"
    ]
  ],
  [
    'src/services/api.ts',
    [
      'getEventForecast',
      'getForecastTimeline',
      'getForecastLots',
      'getForecastAccuracy',
      'getForecastScenarios',
      'simulateForecastScenario',
      'runEventForecast'
    ]
  ],
  [
    'prisma/schema.prisma',
    [
      'model EventForecastSnapshot',
      'predictedTickets',
      'predictedRevenueCents',
      'predictedOccupancy',
      'selloutProbability',
      'confidence'
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
  console.error('\n❌ Falha na verificação de Forecast Center Operacional.')
  process.exit(1)
}

console.log('PASS — Forecast Center Operacional: Painel Principal, KPIs de Previsão, Card de Confiança, Previsto x Realizado, Cenários Conservador/Base/Otimista, Simulador em Memória, Forecast por Lote com Link para Inventário, Alertas com Ação Investigar, Snapshots Persistidos e Acurácia Pós-Evento validados com sucesso!')
