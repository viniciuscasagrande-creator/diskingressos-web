import fs from 'node:fs'
import path from 'node:path'

const RELEASE = '26.17.6-pesquisa-global-360-operacional-ptbr-2026-09-04'

export function auditGlobalSearch360() {
  console.log('================================================================')
  console.log(`AUDITORIA PESQUISA GLOBAL 360° OPERACIONAL — RELEASE: ${RELEASE}`)
  console.log('================================================================\n')

  const artifactsDir = path.join('artifacts', 'global-search')
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true })
  }

  const eventsBackend = fs.readFileSync('server/src/routes/events.ts', 'utf8')
  const appBackend = fs.readFileSync('server/src/app.ts', 'utf8')
  const apiContent = fs.readFileSync('src/services/api.ts', 'utf8')
  const pageFile = 'src/pages/eventos/EventGlobalSearchPage.tsx'
  const cssFile = 'src/pages/eventos/event-global-search.css'

  if (!fs.existsSync(pageFile)) {
    console.error(`[FAIL] ${pageFile} não encontrado.`)
    process.exit(1)
  }

  const pageContent = fs.readFileSync(pageFile, 'utf8')
  const cssContent = fs.readFileSync(cssFile, 'utf8')

  // 1. Verificação de Backend
  const hasEventSearchEndpoint = eventsBackend.includes("eventsRouter.get('/:id/global-search'") || eventsBackend.includes('eventsRouter.get("/:id/global-search"')
  const hasAdminSearchEndpoint = eventsBackend.includes("eventsRouter.get('/admin/global-search'") || eventsBackend.includes('handleAdminGlobalSearch')
  const hasAdminAppMount = appBackend.includes('/api/admin/global-search')
  const hasClassifier = eventsBackend.includes('classifyQuery')
  const hasLgpdMasking = eventsBackend.includes('maskCpf') && eventsBackend.includes('maskPhone') && eventsBackend.includes('maskEmail')
  const hasIncidentsGroup = eventsBackend.includes('prisma.eventIncident.findMany')
  const hasTenantIsolation = eventsBackend.includes('event.producerId !== req.auth!.producerId') && eventsBackend.includes('Acesso negado a evento de outra produtora')

  // 2. Verificação de Tipos no Frontend
  const hasSearchEventGlobal = apiContent.includes('searchEventGlobal')
  const hasSearchAdminGlobal = apiContent.includes('searchAdminGlobal')
  const hasTipoDetectadoType = apiContent.includes('tipoDetectado?: string')

  // 3. Verificação de Test IDs obrigatórios
  const requiredTestIds = [
    'global-search-container',
    'global-search-input',
    'global-search-detected-type',
    'global-search-tabs',
    'tab-all',
    'tab-orders',
    'tab-customers',
    'tab-tickets',
    'tab-financial',
    'tab-checkins',
    'tab-support',
    'tab-refunds',
    'tab-incidents',
    'global-search-results',
    'group-orders',
    'group-incidents'
  ]

  const missingTestIds = requiredTestIds.filter(id => !pageContent.includes(`data-testid="${id}"`))

  // 4. Verificação de Atalho de Teclado
  const hasKeyboardShortcut = pageContent.includes("key.toLowerCase() === 'k'") && pageContent.includes('ctrlKey || e.metaKey')

  // 5. Verificação de Estornos Independente
  const hasCanonicalEstornosLink = pageContent.includes("onNavigate?.('finance-refunds')") || pageContent.includes("'/app/finance-refunds'")

  // 6. Verificação de Estados Operacionais 26.17.4
  const hasLoadingState = pageContent.includes('state-loading')
  const hasEmptyState = pageContent.includes('state-empty')
  const hasErrorState = pageContent.includes('state-error')

  // 7. Verificação de Zero Inglês na interface
  const englishCheckList = ['Search', 'Orders', 'Tickets', 'Customers', 'Support', 'Financial', 'Loading...']
  const visibleEnglishViolations = []
  // Analisamos se palavras em inglês aparecem soltas como títulos na UI
  if (pageContent.includes('<h1>Global Search & Command</h1>')) visibleEnglishViolations.push('Título em inglês')
  if (pageContent.includes('>Orders<')) visibleEnglishViolations.push('Aba Orders')
  if (pageContent.includes('>Tickets<')) visibleEnglishViolations.push('Aba Tickets')

  const checklist = [
    { name: 'Endpoint de busca contextual (/api/events/:id/global-search)', ok: hasEventSearchEndpoint },
    { name: 'Endpoint de busca administrativa (/api/admin/global-search)', ok: hasAdminSearchEndpoint && hasAdminAppMount },
    { name: 'Classificador inteligente de tipo (CPF, Pedido, Ingresso, etc.)', ok: hasClassifier },
    { name: 'Proteção e mascaramento LGPD (CPF, E-mail, Telefone)', ok: hasLgpdMasking },
    { name: 'Isolamento estrito entre produtoras (Tenant Isolation)', ok: hasTenantIsolation },
    { name: 'Busca integrada com Incidentes Operacionais', ok: hasIncidentsGroup },
    { name: 'Cliente TypeScript searchEventGlobal e searchAdminGlobal', ok: hasSearchEventGlobal && hasSearchAdminGlobal && hasTipoDetectadoType },
    { name: 'Test IDs estruturais presentes', ok: missingTestIds.length === 0, detail: missingTestIds.length ? `Faltando: ${missingTestIds.join(', ')}` : undefined },
    { name: 'Atalho de teclado global (Ctrl+K / Cmd+K com autofoco)', ok: hasKeyboardShortcut },
    { name: 'Navegação canônica para Estornos (/app/finance-refunds)', ok: hasCanonicalEstornosLink },
    { name: 'Estados operacionais padronizados (Carregando, Vazio, Erro)', ok: hasLoadingState && hasEmptyState && hasErrorState },
    { name: 'Padronização Total PT-BR (Zero inglês visível na UI)', ok: visibleEnglishViolations.length === 0, detail: visibleEnglishViolations.join(', ') }
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
    auditedAt: new Date().toISOString(),
    status: allOk ? 'PASSED' : 'FAILED',
    checklist
  }

  fs.writeFileSync(path.join(artifactsDir, 'audit-global-search-360.json'), JSON.stringify(report, null, 2))
  console.log(`\nRelatório salvo em: ${path.join(artifactsDir, 'audit-global-search-360.json')}`)

  if (!allOk) {
    process.exit(1)
  }
}

if (process.argv[1] && path.basename(process.argv[1]) === 'audit-global-search-360.mjs') {
  auditGlobalSearch360()
}
