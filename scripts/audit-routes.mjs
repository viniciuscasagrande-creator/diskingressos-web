import fs from 'node:fs'

export function auditRoutes() {
  const policy = JSON.parse(fs.readFileSync('event-os-audit.policy.json', 'utf8'))
  const appContent = fs.readFileSync('src/App.tsx', 'utf8')
  const eventContextContent = fs.readFileSync('src/pages/EventContextPage.tsx', 'utf8')
  const moduleSidebarContent = fs.readFileSync('src/components/ModuleSidebar.tsx', 'utf8')
  const eventSidebarContent = fs.readFileSync('src/components/EventContextSidebar.tsx', 'utf8')

  const results = []

  for (const mod of policy.modules) {
    const routeAudit = {
      id: mod.id,
      name: mod.name,
      pageKey: mod.pageKey,
      route: mod.route,
      component: mod.component,
      componentExists: false,
      inAppRouter: false,
      inEventContext: false,
      inSidebar: false,
      status: 'OK',
      issues: []
    }

    // Check component file existence
    const directPath = `src/pages/${mod.component}`
    const subPath = `src/pages/eventos/${mod.component}`
    if (fs.existsSync(directPath) || fs.existsSync(subPath)) {
      routeAudit.componentExists = true
    } else {
      routeAudit.issues.push({
        issue: 'COMPONENT_FILE_NOT_FOUND',
        severity: 'HIGH',
        detail: `Arquivo ${mod.component} não encontrado em src/pages ou src/pages/eventos`
      })
    }

    // Check App router
    if (appContent.includes(mod.pageKey) || appContent.includes(mod.route)) {
      routeAudit.inAppRouter = true
    } else {
      routeAudit.issues.push({
        issue: 'ROUTE_NOT_REGISTERED_IN_APP',
        severity: 'MEDIUM',
        detail: `PageKey ${mod.pageKey} ou rota ${mod.route} ausente em App.tsx`
      })
    }

    // Check Event Context router if required
    if (mod.requiresEventContext) {
      if (eventContextContent.includes(mod.pageKey)) {
        routeAudit.inEventContext = true
      } else {
        routeAudit.issues.push({
          issue: 'PAGEKEY_MISSING_FROM_EVENT_CONTEXT',
          severity: 'HIGH',
          detail: `PageKey ${mod.pageKey} não tratada no despachador de EventContextPage.tsx`
        })
      }
    }

    // Check Sidebar
    if (moduleSidebarContent.includes(mod.pageKey) || eventSidebarContent.includes(mod.pageKey)) {
      routeAudit.inSidebar = true
    } else {
      routeAudit.issues.push({
        issue: 'MISSING_FROM_SIDEBAR',
        severity: 'LOW',
        detail: `PageKey ${mod.pageKey} não listada em ModuleSidebar nem EventContextSidebar`
      })
    }

    if (routeAudit.issues.some(i => i.severity === 'BLOCKER')) {
      routeAudit.status = 'BLOCKER'
    } else if (routeAudit.issues.some(i => i.severity === 'HIGH')) {
      routeAudit.status = 'BROKEN'
    } else if (routeAudit.issues.some(i => i.severity === 'MEDIUM')) {
      routeAudit.status = 'WARNING'
    }

    results.push(routeAudit)
  }

  return results
}

if (process.argv[1]?.endsWith('audit-routes.mjs')) {
  const res = auditRoutes()
  console.log(JSON.stringify(res, null, 2))
}
