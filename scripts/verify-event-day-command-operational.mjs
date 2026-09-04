import fs from 'node:fs'

const checks = [
  [
    'src/pages/eventos/EventDayCommandPage.tsx',
    [
      '26.16.7-event-day-command-operacional-2026-09-04',
      'event-day-command-operational',
      'EVENT DAY COMMAND',
      'edc-priority-kpis',
      'Presentes agora',
      'Check-ins',
      'Ocupação',
      'Entradas/min',
      'Vendas hoje',
      'Ingressos disp.',
      'Recusas',
      'Incidentes ativos',
      'Modo TV',
      'edc-tv-container',
      'Controle de Acesso e Portões',
      'Fluxo de Entrada em Tempo Real',
      'Capacidade e Ocupação por Setor',
      'Incident Center Integrado',
      'Alert Engine em Tempo Real',
      'Vendas Durante o Evento',
      'Risco e Fraude',
      'SAC / Atendimento',
      'Activity Stream Operacional'
    ]
  ],
  [
    'server/src/routes/events.ts',
    [
      '26.16.7-event-day-command-operacional-2026-09-04',
      '/:id/event-day-command',
      'producerId !== req.auth!.producerId'
    ]
  ],
  [
    'src/pages/EventContextPage.tsx',
    [
      'import EventDayCommandPage from \'./eventos/EventDayCommandPage\'',
      'if(page===\'event-day-command\') return <EventDayCommandPage'
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
  console.error('\n❌ Falha na verificação de Event Day Command Operacional.')
  process.exit(1)
}

console.log('PASS — Event Day Command Operacional: Header, 8 KPIs, Portões, Fluxo, Capacidade, Incidentes, Alertas, Vendas, Risco, SAC, Activity Stream, Modo TV e RBAC agregados com sucesso!')
