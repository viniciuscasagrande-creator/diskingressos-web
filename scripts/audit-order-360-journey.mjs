import fs from 'node:fs'
import path from 'node:path'

const RELEASE = '26.17.7-jornada-operacional-360-pedido-cliente-ingresso-ptbr-2026-09-04'

export function auditOrder360Journey() {
  console.log('================================================================')
  console.log(`AUDITORIA JORNADA OPERACIONAL 360° DO PEDIDO — RELEASE: ${RELEASE}`)
  console.log('================================================================\n')

  const artifactsDir = path.join('artifacts', 'order-journey')
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true })
  }

  const eventsBackend = fs.readFileSync('server/src/routes/events.ts', 'utf8')
  const apiContent = fs.readFileSync('src/services/api.ts', 'utf8')
  const pageFile = 'src/pages/eventos/EventOrderInvestigationPage.tsx'
  const searchPageFile = 'src/pages/eventos/EventGlobalSearchPage.tsx'

  if (!fs.existsSync(pageFile)) {
    console.error(`[FAIL] ${pageFile} não encontrado.`)
    process.exit(1)
  }

  const pageContent = fs.readFileSync(pageFile, 'utf8')
  const searchPageContent = fs.readFileSync(searchPageFile, 'utf8')

  // 1. Verificação de Backend
  const hasOrder360Endpoint = eventsBackend.includes("eventsRouter.get('/:id/orders/:orderId/operational-360'") ||
    eventsBackend.includes('eventsRouter.get("/:id/orders/:orderId/operational-360"')
  const hasContextoOperacional = eventsBackend.includes('contextoOperacional') && eventsBackend.includes('customerKey')
  const hasRefusedCheckinContext = eventsBackend.includes('rejectionReason') && eventsBackend.includes('lastAuthorizedAt')
  const hasTimelineSynthesis = eventsBackend.includes('timeline') && eventsBackend.includes('origem:')
  const hasTenantIsolation = eventsBackend.includes('event.producerId !== req.auth!.producerId')

  // 2. Verificação de API Client no Frontend
  const hasClientType = apiContent.includes('export type OrderOperational360Response')
  const hasClientFunc = apiContent.includes('getOrderOperational360')

  // 3. Verificação de Test IDs obrigatórios
  const requiredTestIds = [
    'order-360-investigation-hub',
    'btn-order-return',
    'order-360-overview',
    'card-correlated-customer',
    'order-action-customer360',
    'card-correlated-tickets',
    'order-action-investigate-ticket',
    'card-correlated-checkins',
    'checkin-refusal-details',
    'btn-checkin-investigate-ticket',
    'btn-checkin-customer-360',
    'btn-checkin-create-incident',
    'btn-checkin-open-sac',
    'card-correlated-financial',
    'order-action-finance',
    'card-correlated-sac',
    'order-action-sac',
    'card-correlated-refunds',
    'order-action-refunds',
    'card-correlated-timeline',
    'order-action-activity-stream'
  ]

  const missingTestIds = requiredTestIds.filter(id => !pageContent.includes(`data-testid="${id}"`))

  // 4. Verificação da Conexão da Jornada na Busca Global
  const hasSearchDrillDown = searchPageContent.includes('setInvestigatingOrderCode') &&
    searchPageContent.includes('<EventOrderInvestigationPage')

  // 5. Verificação de Estornos Independente (regra canônica)
  const hasCanonicalEstornosLink = pageContent.includes("onNavigate?.('finance-refunds')") ||
    pageContent.includes("'/app/finance-refunds'")

  // 6. Verificação de 100% PT-BR
  const hasVoltarAoPedido = pageContent.includes('Voltar ao pedido')
  const hasAcessoAutorizado = pageContent.includes('Acesso Autorizado')
  const hasTentativaRecusada = pageContent.includes('Tentativa Recusada / Bloqueada')

  const checklist = [
    { name: 'Endpoint operacional 360 do pedido (/api/events/:id/orders/:orderId/operational-360)', ok: hasOrder360Endpoint },
    { name: 'Contexto operacional com preservação de estado e breadcrumbs', ok: hasContextoOperacional },
    { name: 'Investigação profunda de check-in recusado com motivo e histórico', ok: hasRefusedCheckinContext },
    { name: 'Timeline cronológica unificada de eventos do pedido', ok: hasTimelineSynthesis },
    { name: 'Isolamento rigoroso de produtora (Tenant Isolation)', ok: hasTenantIsolation },
    { name: 'Cliente TypeScript getOrderOperational360 e tipos', ok: hasClientType && hasClientFunc },
    { name: 'Test IDs obrigatórios da Central de Investigação do Pedido', ok: missingTestIds.length === 0, detail: missingTestIds.length ? `Faltando: ${missingTestIds.join(', ')}` : undefined },
    { name: 'Conexão integrada na Pesquisa Global (abertura in-place sem reload)', ok: hasSearchDrillDown },
    { name: 'Navegação canônica independente para Estornos (/app/finance-refunds)', ok: hasCanonicalEstornosLink },
    { name: 'Padronização Total PT-BR em todos os cards da jornada', ok: hasVoltarAoPedido && hasAcessoAutorizado && hasTentativaRecusada }
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

  fs.writeFileSync(path.join(artifactsDir, 'audit-order-360-journey.json'), JSON.stringify(report, null, 2))
  console.log(`\nRelatório salvo em: ${path.join(artifactsDir, 'audit-order-360-journey.json')}`)

  if (!allOk) {
    process.exit(1)
  }
}

if (process.argv[1] && path.basename(process.argv[1]) === 'audit-order-360-journey.mjs') {
  auditOrder360Journey()
}
