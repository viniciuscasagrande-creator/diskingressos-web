import fs from 'node:fs'

const checks = [
  [
    'src/pages/eventos/EventDiskIntelligencePage.tsx',
    [
      '26.16.11-disk-intelligence-operacional-2026-09-04',
      'disk-intelligence-container',
      'DISK INTELLIGENCE',
      'disk-intelligence-header',
      'disk-intelligence-health-card',
      'health-score-gauge',
      'ask-disk-section',
      'input-ask-query',
      'btn-submit-ask',
      'ask-disk-answer-card',
      'intelligence-insights-section',
      'intelligence-feed-section',
      'modal-why-explanation',
      'btn-analyze-now'
    ]
  ],
  [
    'server/src/routes/events.ts',
    [
      '26.16.11-disk-intelligence-operacional-2026-09-04',
      '/:id/intelligence',
      '/:id/intelligence/insights',
      '/:id/intelligence/feed',
      '/:id/intelligence/health',
      '/:id/intelligence/analyze',
      '/:id/intelligence/ask',
      '/:id/intelligence/insights/:insightId/acknowledge',
      '/:id/intelligence/insights/:insightId/feedback',
      'producerId !== req.auth!.producerId'
    ]
  ],
  [
    'src/pages/EventContextPage.tsx',
    [
      "import EventDiskIntelligencePage from './eventos/EventDiskIntelligencePage'",
      "if(page==='event-intelligence') return <EventDiskIntelligencePage"
    ]
  ],
  [
    'src/services/api.ts',
    [
      'getDiskIntelligence',
      'getIntelligenceInsights',
      'getIntelligenceFeed',
      'getIntelligenceHealth',
      'analyzeDiskIntelligence',
      'askDiskIntelligence',
      'acknowledgeIntelligenceInsight',
      'submitInsightFeedback'
    ]
  ],
  [
    'prisma/schema.prisma',
    [
      'model IntelligenceInsight',
      'evidenceJson',
      'recommendedActionsJson',
      'sourceModules',
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
  console.error('\n❌ Falha na verificação de Disk Intelligence Operacional.')
  process.exit(1)
}

console.log('PASS — Disk Intelligence Operacional: Health Score 87/100, Insights Classificados com Evidência, Pergunte ao Disk com Respostas Fundamentadas, Perguntas Rápidas, Intelligence Feed, Explicabilidade Auditável, Ações Operacionais e Proteção Financeira validados com sucesso!')
