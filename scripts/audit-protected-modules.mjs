import fs from 'node:fs'

export function auditProtectedModules() {
  const findings = []
  let isBlocker = false

  const estornosFile = 'src/pages/finance/FinanceDisputesHubPage.tsx'
  if (!fs.existsSync(estornosFile)) {
    findings.push({
      module: 'estornos',
      issue: 'CANONICAL_COMPONENT_MISSING',
      severity: 'BLOCKER',
      detail: `O componente oficial de Estornos (${estornosFile}) foi apagado ou movido.`
    })
    isBlocker = true
  } else {
    const content = fs.readFileSync(estornosFile, 'utf8')
    if (!content.includes('Central de Estornos, Reembolsos & Chargebacks') && !content.includes('data-protected-module="estornos"')) {
      findings.push({
        module: 'estornos',
        issue: 'ESTORNOS_CONTENT_TAMPERED',
        severity: 'BLOCKER',
        detail: 'Assinatura oficial de Estornos ausente em FinanceDisputesHubPage.tsx'
      })
      isBlocker = true
    }
  }

  const appFile = 'src/App.tsx'
  const sidebarFile = 'src/components/ModuleSidebar.tsx'

  if (fs.existsSync(appFile) && fs.existsSync(sidebarFile)) {
    const appContent = fs.readFileSync(appFile, 'utf8')
    const sidebarContent = fs.readFileSync(sidebarFile, 'utf8')

    const protectedKeys = [
      { id: 'events-central', key: 'events', label: 'Todos os Eventos' },
      { id: 'financeiro', key: 'finance-dashboard', label: 'Dashboard Financeiro' },
      { id: 'estornos', key: 'finance-refunds', label: 'Estornos' },
      { id: 'marketing', key: 'marketing-dashboard', label: 'Dashboard Marketing' },
      { id: 'sac', key: 'sac-hub', label: 'Atendimento / SAC' }
    ]

    for (const item of protectedKeys) {
      if (!appContent.includes(`'${item.key}'`)) {
        findings.push({
          module: item.id,
          issue: 'APP_PAGEKEY_MISSING',
          severity: 'BLOCKER',
          detail: `PageKey ${item.key} não encontrada em App.tsx.`
        })
        isBlocker = true
      }
      if (!sidebarContent.includes(`'${item.key}'`)) {
        findings.push({
          module: item.id,
          issue: 'SIDEBAR_PAGEKEY_MISSING',
          severity: 'BLOCKER',
          detail: `PageKey ${item.key} não encontrada em ModuleSidebar.tsx.`
        })
        isBlocker = true
      }
    }
  }

  return {
    status: isBlocker ? 'FAILED' : 'PASSED',
    isBlocker,
    findings
  }
}

if (process.argv[1]?.endsWith('audit-protected-modules.mjs')) {
  const res = auditProtectedModules()
  console.log(JSON.stringify(res, null, 2))
  if (res.isBlocker) process.exit(1)
}
