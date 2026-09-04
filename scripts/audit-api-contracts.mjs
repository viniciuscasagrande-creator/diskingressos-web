import fs from 'node:fs'

export function auditApiContracts() {
  const apiFile = 'src/services/api.ts'
  const eventsBackendFile = 'server/src/routes/events.ts'
  const refundsBackendFile = 'server/src/routes/refunds.ts'

  const apiContent = fs.readFileSync(apiFile, 'utf8')
  const eventsBackend = fs.existsSync(eventsBackendFile) ? fs.readFileSync(eventsBackendFile, 'utf8') : ''
  const refundsBackend = fs.existsSync(refundsBackendFile) ? fs.readFileSync(refundsBackendFile, 'utf8') : ''

  // Known endpoint contracts to check
  const contracts = [
    {
      id: 'inventory-lots',
      path: '/events/:id/inventory-lots',
      method: 'POST',
      frontendFunc: 'createInventoryLot',
      category: 'inventory'
    },
    {
      id: 'inventory-lot-update',
      path: '/events/:id/inventory-lots/:lotId',
      method: 'PATCH',
      frontendFunc: 'updateInventoryLot',
      category: 'inventory'
    },
    {
      id: 'customer360-profile',
      path: '/events/:id/customer-360/profile',
      method: 'GET',
      frontendFunc: 'getEventCustomer360Profile',
      category: 'customer-360'
    },
    {
      id: 'liveops-overview',
      path: '/events/:id/live-ops/overview',
      method: 'GET',
      frontendFunc: 'getEventLiveOpsOverview',
      category: 'live-operations'
    },
    {
      id: 'incidents-list',
      path: '/events/:id/incidents',
      method: 'GET',
      frontendFunc: 'getEventIncidents',
      category: 'incident-center'
    },
    {
      id: 'incidents-create',
      path: '/events/:id/incidents',
      method: 'POST',
      frontendFunc: 'createEventIncident',
      category: 'incident-center'
    },
    {
      id: 'day-command-overview',
      path: '/events/:id/day-command/overview',
      method: 'GET',
      frontendFunc: 'getEventDayCommandOverview',
      category: 'event-day-command'
    },
    {
      id: 'revenue-intelligence',
      path: '/events/:id/revenue-intelligence',
      method: 'GET',
      frontendFunc: 'getRevenueIntelligence',
      category: 'revenue-pricing'
    },
    {
      id: 'forecast-summary',
      path: '/events/:id/forecast',
      method: 'GET',
      frontendFunc: 'getForecastSummary',
      category: 'forecast-center'
    },
    {
      id: 'forecast-simulate',
      path: '/events/:id/forecast/simulate',
      method: 'POST',
      frontendFunc: 'simulateForecastScenario',
      category: 'forecast-center'
    },
    {
      id: 'disk-intelligence',
      path: '/events/:id/intelligence',
      method: 'GET',
      frontendFunc: 'getDiskIntelligence',
      category: 'disk-intelligence'
    },
    {
      id: 'disk-intelligence-ask',
      path: '/events/:id/intelligence/ask',
      method: 'POST',
      frontendFunc: 'askDiskIntelligence',
      category: 'disk-intelligence'
    },
    {
      id: 'executive-dashboard',
      path: '/events/:id/executive-dashboard',
      method: 'GET',
      frontendFunc: 'getExecutiveDashboard',
      category: 'executive-dashboard'
    },
    {
      id: 'finance-refunds-list',
      path: '/refunds',
      method: 'GET',
      frontendFunc: 'getRefundRequests',
      category: 'estornos'
    }
  ]

  const results = []
  const brokenContracts = []

  for (const c of contracts) {
    const item = {
      ...c,
      frontendExists: false,
      backendRouteExists: false,
      tenantSecurity: 'UNKNOWN',
      rbacSecurity: 'NONE',
      status: 'OK',
      issues: []
    }

    // 1. Frontend check
    if (apiContent.includes(c.frontendFunc)) {
      item.frontendExists = true
    } else {
      item.issues.push({
        issue: 'FRONTEND_FUNCTION_MISSING',
        severity: 'HIGH',
        detail: `Função ${c.frontendFunc} não encontrada em src/services/api.ts`
      })
    }

    // 2. Backend route check
    const normalizedPath = c.path.replace('/events', '').replace('/refunds', '')
    const targetBackend = c.category === 'estornos' ? refundsBackend : eventsBackend

    // check path substring in backend
    const routePattern = new RegExp(`(router|eventsRouter)\\.${c.method.toLowerCase()}\\(['"\`](${c.path}|${normalizedPath})`)
    if (routePattern.test(targetBackend) || targetBackend.includes(normalizedPath) || targetBackend.includes(c.path)) {
      item.backendRouteExists = true
    } else {
      item.issues.push({
        issue: 'API_CONTRACT_BROKEN',
        severity: 'CRITICAL',
        detail: `Rota ${c.method} ${c.path} não encontrada no backend correspondente`
      })
    }

    // 3. Tenant check in backend
    if (targetBackend.includes('producerId !== req.auth!.producerId') || targetBackend.includes('ownsProducer') || targetBackend.includes('producerId: req.auth!.producerId')) {
      item.tenantSecurity = 'TENANT_VALIDATED'
    } else {
      item.tenantSecurity = 'UNPROTECTED'
      item.issues.push({
        issue: 'TENANT_FILTER_INCOMPLETE',
        severity: 'CRITICAL',
        detail: `Endpoint ${c.path} não possui validação explícita de tenant do produtor.`
      })
    }

    // 4. RBAC check
    if (targetBackend.includes('globalAdmin') || targetBackend.includes('role ===') || targetBackend.includes('req.auth!.role')) {
      item.rbacSecurity = 'RBAC_VALIDATED'
    }

    if (item.issues.some(i => i.severity === 'CRITICAL' || i.severity === 'BLOCKER')) {
      item.status = 'BROKEN'
      brokenContracts.push(item)
    } else if (item.issues.some(i => i.severity === 'HIGH')) {
      item.status = 'WARNING'
    }

    results.push(item)
  }

  return {
    totalChecked: contracts.length,
    brokenCount: brokenContracts.length,
    contracts: results,
    brokenContracts
  }
}

if (process.argv[1]?.endsWith('audit-api-contracts.mjs')) {
  const res = auditApiContracts()
  console.log(JSON.stringify(res, null, 2))
}
