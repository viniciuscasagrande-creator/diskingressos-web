import fs from 'node:fs'
import path from 'node:path'

const resultsFile = process.env.PLAYWRIGHT_JSON_REPORT || 'test-results/playwright-results.json'
const policyFile = process.env.PLAYWRIGHT_RELEASE_POLICY || 'release-gate.policy.json'
const outDir = process.env.PLAYWRIGHT_CERT_DIR || 'test-results/release-certificate'

fs.mkdirSync(outDir, { recursive: true })

const readJson = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch { return null }
}

const policy = readJson(policyFile)
const data = readJson(resultsFile)
const generatedAt = new Date().toISOString()

if (!policy) {
  console.error(`[release-cert] política ausente/inválida: ${policyFile}`)
  process.exit(2)
}

const rows = []
function walkSuites(suites = [], parents = []) {
  for (const suite of suites) {
    const current = [...parents, suite.title].filter(Boolean)
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const results = test.results || []
        const final = results.at(-1)
        rows.push({
          title: [...current, spec.title].filter(Boolean).join(' > '),
          status: final?.status || test.status || 'unknown',
          project: test.projectName || '',
          durationMs: results.reduce((sum, result) => sum + (result.duration || 0), 0),
          retries: Math.max(0, results.length - 1),
          error: final?.error?.message || ''
        })
      }
    }
    walkSuites(suite.suites || [], current)
  }
}

if (data) walkSuites(data.suites || [])

const isPass = row => row.status === 'passed'
const isFailure = row => ['failed', 'timedOut', 'interrupted'].includes(row.status)
const totalFailures = rows.filter(isFailure).length

const groupResults = (policy.requiredGroups || []).map(group => {
  const re = new RegExp(group.match, 'i')
  const matched = rows.filter(row => re.test(row.title))
  const passed = matched.filter(isPass).length
  const failed = matched.filter(isFailure).length
  const minimum = Number(group.minimumPassed || 1)
  const status = passed >= minimum && failed === 0 ? 'PASS' : matched.length === 0 ? 'NOT_FOUND' : 'FAIL'
  return { ...group, matched: matched.length, passed, failed, minimumPassed: minimum, status }
})

const blockingProblems = groupResults.filter(group => group.blocking && group.status !== 'PASS')
const emptyBlocked = policy.requireNonEmptySuite && rows.length === 0
const failureBlocked = policy.requireZeroFailures && totalFailures > 0
const certified = !emptyBlocked && !failureBlocked && blockingProblems.length === 0
const status = certified ? 'CERTIFIED' : data ? 'REJECTED' : 'BLOCKED'

const certificate = {
  release: policy.release,
  generatedAt,
  baseUrl: process.env.PLAYWRIGHT_BASE_URL || policy.baseUrl || '',
  status,
  certified,
  policy: {
    requireZeroFailures: Boolean(policy.requireZeroFailures),
    requireNonEmptySuite: Boolean(policy.requireNonEmptySuite)
  },
  totals: {
    tests: rows.length,
    passed: rows.filter(isPass).length,
    failed: totalFailures,
    skipped: rows.filter(row => row.status === 'skipped').length
  },
  groups: groupResults,
  blockingProblems: blockingProblems.map(group => ({ id: group.id, label: group.label, status: group.status }))
}

const escMd = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ')
const escHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const groupTableMd = [
  '| Grupo | Bloqueante | Encontrados | PASS | FAIL | Mínimo | Status |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...groupResults.map(g => `| ${escMd(g.label)} | ${g.blocking ? 'SIM' : 'NÃO'} | ${g.matched} | ${g.passed} | ${g.failed} | ${g.minimumPassed} | **${g.status}** |`)
].join('\n')

const md = `# SafeSaff — Certificado de Release Playwright\n\n**Release:** ${policy.release}  \n**Gerado em:** ${generatedAt}  \n**URL homologada:** ${certificate.baseUrl || 'não informada'}  \n**Status:** **${status}**\n\n## Resultado\n\n${certified ? '✅ O deploy atende aos critérios bloqueantes e está certificado para homologação técnica.' : '❌ O deploy NÃO está certificado. Corrija os itens bloqueantes antes de aprovar a versão.'}\n\n## Grupos obrigatórios\n\n${groupTableMd}\n\n## Totais\n\n- Testes: ${certificate.totals.tests}\n- PASS: ${certificate.totals.passed}\n- FAIL: ${certificate.totals.failed}\n- SKIPPED: ${certificate.totals.skipped}\n\n## Regra de liberação\n\nEstornos, Central de Eventos, módulos Core, Event OS e Runtime são bloqueantes. Uma falha em qualquer um desses grupos rejeita a certificação. Responsividade é monitorada separadamente e pode ser elevada a bloqueante quando a baseline estiver estabilizada.\n`

const rowsHtml = groupResults.map(g => `<tr><td>${escHtml(g.label)}</td><td>${g.blocking ? 'SIM' : 'NÃO'}</td><td>${g.matched}</td><td>${g.passed}</td><td>${g.failed}</td><td>${g.minimumPassed}</td><td><strong>${g.status}</strong></td></tr>`).join('')
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SafeSaff — Certificado de Release</title><style>body{font-family:Inter,Arial,sans-serif;background:#f5f6f8;color:#17191c;margin:0;padding:32px}.wrap{max-width:1180px;margin:auto}.hero,.card{background:#fff;border:1px solid #e4e7ec;border-radius:18px;padding:24px;margin-bottom:18px}.badge{display:inline-block;padding:7px 12px;border-radius:999px;font-weight:800;background:${certified ? '#e8f7ef' : '#fff0f0'};color:${certified ? '#087443' : '#b42318'}}.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.kpi{background:#fff;border:1px solid #e4e7ec;border-radius:14px;padding:18px}.kpi b{display:block;font-size:28px;margin-top:5px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:11px;border-bottom:1px solid #eceff3;text-align:left}th{background:#fafbfc}@media(max-width:760px){body{padding:14px}.kpis{grid-template-columns:1fr 1fr}.card{overflow:auto}}</style></head><body><div class="wrap"><section class="hero"><div>DiskIngressos PDT • Release Gate</div><h1>Certificação Playwright</h1><span class="badge">${status}</span><p>${escHtml(policy.release)} • ${escHtml(generatedAt)}</p><p>${escHtml(certificate.baseUrl || 'URL não informada')}</p></section><section class="kpis"><div class="kpi">Testes<b>${certificate.totals.tests}</b></div><div class="kpi">PASS<b>${certificate.totals.passed}</b></div><div class="kpi">FAIL<b>${certificate.totals.failed}</b></div><div class="kpi">Bloqueios<b>${blockingProblems.length}</b></div></section><section class="card"><h2>Grupos de homologação</h2><table><thead><tr><th>Grupo</th><th>Bloqueante</th><th>Encontrados</th><th>PASS</th><th>FAIL</th><th>Mínimo</th><th>Status</th></tr></thead><tbody>${rowsHtml}</tbody></table></section></div></body></html>`

fs.writeFileSync(path.join(outDir, 'RELEASE_CERTIFICATE.json'), JSON.stringify(certificate, null, 2))
fs.writeFileSync(path.join(outDir, 'CERTIFICADO_RELEASE_PLAYWRIGHT.md'), md)
fs.writeFileSync(path.join(outDir, 'CERTIFICADO_RELEASE_PLAYWRIGHT.html'), html)

console.log(`[release-cert] ${status}: ${certificate.totals.passed} pass / ${certificate.totals.failed} fail / ${blockingProblems.length} bloqueios`)
process.exitCode = certified ? 0 : 1
