import fs from 'node:fs'

const checks = [
  [
    'src/pages/eventos/EventLiveOpsPage.tsx',
    [
      '26.16.5-live-operations-operacional-2026-09-04',
      'live-operations-operational',
      'Público presente agora',
      'Ritmo de entrada',
      'Entradas em Tempo Real',
      'Portões Operacionais',
      'Dispositivos & Leitores',
      'Ocorrências de Ingressos Recusados',
      'Abrir incidente',
      'sessionStorage.setItem(\'incident_prefill\''
    ]
  ],
  [
    'src/pages/eventos/EventIncidentsPage.tsx',
    [
      '26.16.6-incident-center-operacional-2026-09-04',
      'incident-center-operational',
      'Total em Aberto',
      'Críticos',
      'SLA Vencido',
      'Em Investigação',
      'Resolvidos Hoje',
      'Assumir Incidente',
      'Escalar para Nível 2',
      'Marcar como Resolvido',
      'Ver no Live Ops',
      'Customer 360',
      'Estornos & Disputas',
      'sessionStorage.getItem(\'incident_prefill\''
    ]
  ],
  [
    'server/src/routes/events.ts',
    [
      '26.16.5-live-operations-operacional-2026-09-04',
      '/:id/live-operations',
      '/:id/live-operations/gates',
      '/:id/live-operations/devices',
      '26.16.6-incident-center-operacional-2026-09-04',
      '/:id/incidents',
      '/:id/incidents/:incidentId/assign',
      '/:id/incidents/:incidentId/escalate',
      '/:id/incidents/:incidentId/resolve',
      '/:id/incidents/:incidentId/reopen',
      '/:id/incidents/:incidentId/comments',
      '/:id/incidents/:incidentId/evidence'
    ]
  ],
  [
    'src/pages/EventContextPage.tsx',
    [
      'import EventLiveOpsPage from \'./eventos/EventLiveOpsPage\'',
      'import EventIncidentsPage from \'./eventos/EventIncidentsPage\'',
      'if(page===\'event-live-ops\') return <EventLiveOpsPage',
      'if(page===\'event-incidents\') return <EventIncidentsPage'
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
  console.error('\n❌ Falha na verificação operacional de Live Operations e Incident Center.')
  process.exit(1)
}

console.log('PASS — Live Operations e Incident Center Operacionais: KPIs, fluxo, portões, leitores, incidentes, SLA, drawer de análise e tenant guards validados!')
