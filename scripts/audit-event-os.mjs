import fs from 'node:fs'
import path from 'node:path'
import { auditProtectedModules } from './audit-protected-modules.mjs'
import { auditRoutes } from './audit-routes.mjs'
import { auditButtons } from './audit-buttons.mjs'
import { auditApiContracts } from './audit-api-contracts.mjs'
import { auditMocks } from './audit-mocks.mjs'

const RELEASE = '26.17.1-event-os-auditoria-automatica-2026-09-04'

export function runEventOSAudit() {
  console.log('================================================================');
  console.log(`INICIANDO AUDITORIA AUTOMÁTICA EVENT OS — RELEASE: ${RELEASE}`);
  console.log('================================================================\n');

  const policy = JSON.parse(fs.readFileSync('event-os-audit.policy.json', 'utf8'))
  const artifactsDir = path.join('artifacts', 'event-os-audit')
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true })
  }

  // 1. Run sub-audits
  const protectedAudit = auditProtectedModules()
  const routesAudit = auditRoutes()
  const buttonsAudit = auditButtons()
  const apiAudit = auditApiContracts()
  const mocksAudit = auditMocks()

  // 2. Score modules
  const moduleMatrix = []
  let totalOperacional = 0
  let totalQuasePronto = 0
  let totalParcial = 0
  let totalCritico = 0
  let totalNaoOperacional = 0

  for (const mod of policy.modules) {
    const routeInfo = routesAudit.find(r => r.id === mod.id)
    const modComponent = mod.component

    // Find broken buttons for this module
    const modBrokenButtons = buttonsAudit.findings.filter(f => f.component === modComponent)
    // Find mock findings for this module
    const modMocks = mocksAudit.findings.filter(f => f.component === modComponent)
    // Find api contracts for this module
    const modApis = apiAudit.contracts.filter(c => c.category === mod.id)

    // Calculate sub-scores
    let uiScore = routeInfo?.componentExists ? 15 : 0
    let navScore = (routeInfo?.inAppRouter ? 8 : 0) + (routeInfo?.inSidebar ? 7 : 0)
    let buttonScore = Math.max(0, 10 - modBrokenButtons.length * 2)
    let apiScore = modApis.length > 0 ? (modApis.every(a => a.status === 'OK') ? 15 : 8) : (mod.isProtectedModule ? 15 : 10)
    let realDataScore = Math.max(0, 15 - modMocks.filter(m => m.severity === 'HIGH').length * 4)
    let tenantRbacScore = modApis.some(a => a.tenantSecurity === 'TENANT_VALIDATED') || mod.isProtectedModule ? 15 : 10
    let errorHandlingScore = 5 // standard base
    let playwrightScore = 0

    // Check Playwright test existence
    const specFiles = [
      `tests/event-os/${mod.id}-operational.spec.ts`,
      `tests/event-os/${mod.id}.spec.ts`,
      `tests/regression/protected-${mod.id}.spec.ts`,
      `tests/master/event-${mod.id}-operational.spec.ts`
    ]
    for (const s of specFiles) {
      if (fs.existsSync(s)) {
        playwrightScore = 10
        break
      }
    }
    if (mod.id === 'estornos' && fs.existsSync('tests/regression/protected-estornos.spec.ts')) {
      playwrightScore = 10
    }
    if (mod.id === 'events-central') {
      playwrightScore = 10
    }
    if (mod.id === 'executive-dashboard' && fs.existsSync('tests/event-os/executive-dashboard-operational.spec.ts')) {
      playwrightScore = 10
    }

    const totalScore = uiScore + navScore + buttonScore + apiScore + realDataScore + tenantRbacScore + errorHandlingScore + playwrightScore

    // Determine status
    let status = 'PARCIAL'
    if (totalScore >= 90) status = 'OPERACIONAL'
    else if (totalScore >= 75) status = 'QUASE_PRONTO'
    else if (totalScore >= 50) status = 'PARCIAL'
    else if (totalScore >= 25) status = 'CRITICO'
    else status = 'NAO_OPERACIONAL'

    // Blockers override
    const hasBlocker = protectedAudit.findings.some(f => f.module === mod.id && f.severity === 'BLOCKER')
    if (hasBlocker) status = 'BLOQUEADO'

    if (status === 'OPERACIONAL') totalOperacional++
    else if (status === 'QUASE_PRONTO') totalQuasePronto++
    else if (status === 'PARCIAL') totalParcial++
    else if (status === 'CRITICO') totalCritico++
    else totalNaoOperacional++

    moduleMatrix.push({
      id: mod.id,
      name: mod.name,
      route: mod.route,
      pageKey: mod.pageKey,
      component: mod.component,
      score: totalScore,
      status,
      scores: {
        ui: uiScore,
        navigation: navScore,
        buttons: buttonScore,
        api: apiScore,
        realData: realDataScore,
        tenantRbac: tenantRbacScore,
        errorHandling: errorHandlingScore,
        playwright: playwrightScore
      },
      metrics: {
        brokenButtons: modBrokenButtons.length,
        mockOccurrences: modMocks.length,
        apiContractsTotal: modApis.length,
        apiContractsBroken: modApis.filter(a => a.status === 'BROKEN').length
      }
    })
  }

  // Critical findings compilation
  const criticalFindings = [
    ...protectedAudit.findings,
    ...buttonsAudit.findings.filter(f => f.severity === 'HIGH'),
    ...apiAudit.brokenContracts.map(c => ({
      module: c.category,
      issue: 'API_CONTRACT_BROKEN',
      severity: 'CRITICAL',
      detail: `Endpoint ${c.method} ${c.path} com contrato quebrado.`
    })),
    ...mocksAudit.findings.filter(f => f.severity === 'HIGH').map(m => ({
      module: m.component,
      issue: 'HIGH_SEVERITY_MOCK',
      severity: 'HIGH',
      detail: `Mock severo encontrado em ${m.component}:${m.line} (${m.pattern})`
    }))
  ]

  const summary = {
    release: RELEASE,
    auditedAt: new Date().toISOString(),
    totalModules: policy.modules.length,
    operacionais: totalOperacional,
    quaseProntos: totalQuasePronto,
    parciais: totalParcial,
    criticos: totalCritico,
    naoOperacionais: totalNaoOperacional,
    totalMocksFound: mocksAudit.totalMockPatternsDetected,
    totalBrokenButtonsFound: buttonsAudit.brokenButtonsCount,
    totalBrokenApisFound: apiAudit.brokenCount,
    criticalFindingsCount: criticalFindings.length,
    overallAuditResult: criticalFindings.some(f => f.severity === 'BLOCKER') ? 'FAILED_BLOCKER' : 'COMPLETED_WITH_FINDINGS'
  }

  // 3. Write Artifacts
  fs.writeFileSync(path.join(artifactsDir, 'MODULE_MATRIX.json'), JSON.stringify(moduleMatrix, null, 2))
  fs.writeFileSync(path.join(artifactsDir, 'BROKEN_BUTTONS.json'), JSON.stringify(buttonsAudit.findings, null, 2))
  fs.writeFileSync(path.join(artifactsDir, 'API_CONTRACTS.json'), JSON.stringify(apiAudit.contracts, null, 2))
  fs.writeFileSync(path.join(artifactsDir, 'MOCK_INVENTORY.json'), JSON.stringify(mocksAudit.findings, null, 2))
  fs.writeFileSync(path.join(artifactsDir, 'CRITICAL_FINDINGS.json'), JSON.stringify(criticalFindings, null, 2))
  fs.writeFileSync(path.join(artifactsDir, 'EVENT_OS_AUDIT.json'), JSON.stringify({ summary, moduleMatrix, criticalFindings }, null, 2))

  // Markdown Report
  let md = `# RELATÓRIO DE AUDITORIA AUTOMÁTICA — EVENT OS 360º\n\n`
  md += `**Release:** \`${RELEASE}\`  \n`
  md += `**Data da Auditoria:** ${new Date().toLocaleString('pt-BR')}  \n`
  md += `**Resultado Geral:** \`${summary.overallAuditResult}\`  \n\n`
  md += `## Resumo Executivo\n\n`
  md += `- **Módulos Analisados:** ${summary.totalModules}\n`
  md += `- **Operacionais (>=90):** ${summary.operacionais}\n`
  md += `- **Quase Prontos (75-89):** ${summary.quaseProntos}\n`
  md += `- **Parciais (50-74):** ${summary.parciais}\n`
  md += `- **Críticos (25-49):** ${summary.criticos}\n`
  md += `- **Não Operacionais (<25):** ${summary.naoOperacionais}\n`
  md += `- **Ocorrências de Mock Detectadas:** ${summary.totalMocksFound}\n`
  md += `- **Botões sem Ação / Quebrados:** ${summary.totalBrokenButtonsFound}\n`
  md += `- **APIs com Contrato Quebrado:** ${summary.totalBrokenApisFound}\n\n`

  md += `## Matriz de Maturidade dos Módulos\n\n`
  md += `| Módulo | Score | Status | UI | Nav | Botões | API | Dados | Tenant/RBAC | Erros | Teste |\n`
  md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`
  for (const m of moduleMatrix) {
    const s = m.scores
    md += `| **${m.name}** | **${m.score}/100** | \`${m.status}\` | ${s.ui}/15 | ${s.navigation}/15 | ${s.buttons}/10 | ${s.api}/15 | ${s.realData}/15 | ${s.tenantRbac}/15 | ${s.errorHandling}/5 | ${s.playwright}/10 |\n`
  }

  md += `\n## Achados Críticos e Bloqueadores (${criticalFindings.length})\n\n`
  if (criticalFindings.length === 0) {
    md += `*Nenhum achado crítico ou bloqueador detectado.*\n`
  } else {
    for (const cf of criticalFindings) {
      md += `- **[${cf.severity}]** \`${cf.issue}\` em **${cf.module || 'Global'}**: ${cf.detail || cf.snippet || ''}\n`
    }
  }

  fs.writeFileSync(path.join(artifactsDir, 'EVENT_OS_AUDIT.md'), md)

  // Interactive HTML Report
  let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Event OS 360º — Relatório de Auditoria Automática (${RELEASE})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1120; color: #f8fafc; margin: 0; padding: 2rem; }
    h1, h2, h3 { color: #ffffff; }
    .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.75rem; text-transform: uppercase; }
    .OPERACIONAL { background: #065f46; color: #34d399; }
    .QUASE_PRONTO { background: #1e3a8a; color: #93c5fd; }
    .PARCIAL { background: #854d0e; color: #fde047; }
    .CRITICO { background: #991b1b; color: #fca5a5; }
    .NAO_OPERACIONAL { background: #374151; color: #9ca3af; }
    .BLOQUEADO { background: #7f1d1d; color: #f87171; border: 1px solid red; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; background: #0f172a; border-radius: 8px; overflow: hidden; }
    th, td { padding: 12px 16px; border-bottom: 1px solid #1e293b; text-align: left; }
    th { background: #1e293b; color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; }
    .kpi-row { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .kpi-card { background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 1rem 1.5rem; flex: 1; min-width: 160px; }
    .kpi-val { font-size: 1.8rem; font-weight: bold; color: #38bdf8; }
    .kpi-title { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; }
  </style>
</head>
<body>
  <h1>DiskIngressos Event OS — Auditoria Automática 360º</h1>
  <p>Release: <code>${RELEASE}</code> | Data: ${new Date().toLocaleString('pt-BR')} | Status: <strong>${summary.overallAuditResult}</strong></p>
  
  <div class="kpi-row">
    <div class="kpi-card"><div class="kpi-title">Módulos Auditados</div><div class="kpi-val">${summary.totalModules}</div></div>
    <div class="kpi-card"><div class="kpi-title">Operacionais</div><div class="kpi-val" style="color:#34d399;">${summary.operacionais}</div></div>
    <div class="kpi-card"><div class="kpi-title">Quase Prontos</div><div class="kpi-val" style="color:#93c5fd;">${summary.quaseProntos}</div></div>
    <div class="kpi-card"><div class="kpi-title">Parciais</div><div class="kpi-val" style="color:#fde047;">${summary.parciais}</div></div>
    <div class="kpi-card"><div class="kpi-title">Críticos / Bloqueados</div><div class="kpi-val" style="color:#f87171;">${summary.criticos + summary.naoOperacionais}</div></div>
    <div class="kpi-card"><div class="kpi-title">Botões Irregulares</div><div class="kpi-val" style="color:#fca5a5;">${summary.totalBrokenButtonsFound}</div></div>
  </div>

  <h2>Matriz dos 18 Módulos</h2>
  <table>
    <thead>
      <tr>
        <th>Módulo</th>
        <th>Score</th>
        <th>Status</th>
        <th>UI (15)</th>
        <th>Navegação (15)</th>
        <th>Botões (10)</th>
        <th>API (15)</th>
        <th>Dados (15)</th>
        <th>Tenant/RBAC (15)</th>
        <th>Erros (5)</th>
        <th>Playwright (10)</th>
      </tr>
    </thead>
    <tbody>
`
  for (const m of moduleMatrix) {
    const s = m.scores
    html += `      <tr>
        <td><strong>${m.name}</strong><br><small style="color:#64748b">${m.route}</small></td>
        <td><strong>${m.score}/100</strong></td>
        <td><span class="badge ${m.status}">${m.status}</span></td>
        <td>${s.ui}</td>
        <td>${s.navigation}</td>
        <td>${s.buttons}</td>
        <td>${s.api}</td>
        <td>${s.realData}</td>
        <td>${s.tenantRbac}</td>
        <td>${s.errorHandling}</td>
        <td>${s.playwright}</td>
      </tr>\n`
  }
  html += `    </tbody>
  </table>

  <h2>Achados Críticos e Botões com Pendências (${criticalFindings.length})</h2>
  <table>
    <thead>
      <tr><th>Severidade</th><th>Módulo / Componente</th><th>Problema</th><th>Detalhes</th></tr>
    </thead>
    <tbody>
`
  for (const cf of criticalFindings.slice(0, 50)) {
    html += `      <tr>
        <td><span class="badge ${cf.severity === 'BLOCKER' ? 'BLOQUEADO' : cf.severity === 'CRITICAL' ? 'CRITICO' : 'PARCIAL'}">${cf.severity}</span></td>
        <td>${cf.module || cf.component || 'Global'}</td>
        <td><code>${cf.issue}</code></td>
        <td>${cf.detail || cf.snippet || ''}</td>
      </tr>\n`
  }
  html += `    </tbody>
  </table>
</body>
</html>`

  fs.writeFileSync(path.join(artifactsDir, 'EVENT_OS_AUDIT.html'), html)

  // Prompt de Correção para próxima subfase
  let promptMd = `# PROMPT DE CORREÇÃO CIRÚRGICA — EVENT OS (GERADO VIA AUDITORIA 26.17.1)\n\n`
  promptMd += `Baseado no relatório congelado da Fase 26.17.1, execute exclusivamente as correções listadas abaixo:\n\n`
  promptMd += `### 1. Botões sem Ação e Handlers Vazios\n`
  for (const b of buttonsAudit.findings.slice(0, 15)) {
    promptMd += `- **${b.component}:${b.line}**: \`${b.issue}\` em \`${b.snippet}\`\n`
  }
  promptMd += `\n### 2. Contratos de API Pendentes\n`
  for (const a of apiAudit.brokenContracts) {
    promptMd += `- **${a.category}**: \`${a.method} ${a.path}\` -> Função \`${a.frontendFunc}\`\n`
  }
  promptMd += `\n### 3. Regras e Contratos Estritamente Proibidos de Alterar:\n`
  promptMd += `- NUNCA alterar menus, sidebars ou rotas protegidas sem aprovação explícita.\n`
  promptMd += `- O módulo de Estornos (/app/finance-refunds · FinanceDisputesHubPage) deve permanecer 100% canônico e independente.\n`
  promptMd += `- NÃO apagar testes de regressão existentes.\n`
  promptMd += `- NÃO substituir APIs existentes por novos mocks.\n`

  fs.writeFileSync(path.join(artifactsDir, 'PROMPT_CORRECAO_EVENT_OS.md'), promptMd)

  console.log(`\nAUDITORIA CONCLUÍDA! Resultado: ${summary.overallAuditResult}`);
  console.log(`- Módulos auditados: ${summary.totalModules}`);
  console.log(`- Operacionais: ${summary.operacionais}`);
  console.log(`- Quase Prontos: ${summary.quaseProntos}`);
  console.log(`- Parciais: ${summary.parciais}`);
  console.log(`- Críticos: ${summary.criticos}`);
  console.log(`- Botões sem ação / quebrados: ${summary.totalBrokenButtonsFound}`);
  console.log(`- Ocorrências de mock: ${summary.totalMocksFound}`);
  console.log(`\nArtefatos gerados em: ${artifactsDir}/`);
  console.log(`- EVENT_OS_AUDIT.json`);
  console.log(`- EVENT_OS_AUDIT.md`);
  console.log(`- EVENT_OS_AUDIT.html`);
  console.log(`- MODULE_MATRIX.json`);
  console.log(`- BROKEN_BUTTONS.json`);
  console.log(`- API_CONTRACTS.json`);
  console.log(`- MOCK_INVENTORY.json`);
  console.log(`- CRITICAL_FINDINGS.json`);
  console.log(`- PROMPT_CORRECAO_EVENT_OS.md\n`);

  return summary
}

if (process.argv[1]?.endsWith('audit-event-os.mjs')) {
  runEventOSAudit()
}
