import fs from 'node:fs'
import path from 'node:path'

const input = process.env.PLAYWRIGHT_JSON_REPORT || 'test-results/playwright-results.json'
const outDir = process.env.PLAYWRIGHT_EXEC_REPORT_DIR || 'test-results/executive'
fs.mkdirSync(outDir, { recursive: true })

const now = new Date().toISOString()
let data = null
try {
  data = JSON.parse(fs.readFileSync(input, 'utf8'))
} catch (err) {
  const md = `# Homologação Playwright — SafeSaff\n\nGerado em: ${now}\n\n**STATUS: BLOCKED**\n\nO arquivo de resultados não foi encontrado em \`${input}\`. Execute a suíte Playwright com o reporter JSON habilitado antes de gerar este relatório.\n`
  fs.writeFileSync(path.join(outDir, 'RELATORIO_HOMOLOGACAO_PLAYWRIGHT.md'), md)
  console.error(`[playwright-report] resultados ausentes: ${input}`)
  process.exitCode = 2
  process.exit()
}

const rows = []
function walkSuites(suites = [], parents = []) {
  for (const suite of suites) {
    const current = [...parents, suite.title].filter(Boolean)
    for (const spec of suite.specs || []) {
      for (const t of spec.tests || []) {
        const results = t.results || []
        const final = results.at(-1)
        const status = final?.status || t.status || 'unknown'
        rows.push({
          title: [...current, spec.title].filter(Boolean).join(' > '),
          status,
          project: t.projectName || '',
          duration: results.reduce((s, r) => s + (r.duration || 0), 0),
          retries: Math.max(0, results.length - 1),
          error: final?.error?.message || '',
        })
      }
    }
    walkSuites(suite.suites || [], current)
  }
}
walkSuites(data.suites || [])

const pass = rows.filter(r => r.status === 'passed').length
const fail = rows.filter(r => ['failed','timedOut','interrupted'].includes(r.status)).length
const skip = rows.filter(r => ['skipped'].includes(r.status)).length
const other = rows.length - pass - fail - skip
const status = fail > 0 ? 'FAIL' : rows.length === 0 ? 'BLOCKED' : 'PASS'

const critical = rows.filter(r => /critical|estornos|central de eventos|protected/i.test(r.title))
const eventOs = rows.filter(r => /event os|cockpit|invent[aá]rio|customer 360|live operations|incident|revenue|readiness|event day/i.test(r.title))

const esc = s => String(s ?? '').replaceAll('|','\\|').replaceAll('\n',' ')
const table = (items) => items.length ? [
  '| Teste | Projeto | Status | Duração | Tentativas |',
  '|---|---|---:|---:|---:|',
  ...items.map(r => `| ${esc(r.title)} | ${esc(r.project)} | ${r.status} | ${(r.duration/1000).toFixed(2)}s | ${r.retries + 1} |`)
].join('\n') : '_Nenhum teste correspondente._'

const md = `# SafeSaff — Relatório Executivo Playwright\n\n**Release:** 26.x.3.2-playwright-control-center-2026-09-03  \n**Gerado em:** ${now}  \n**Status geral:** **${status}**\n\n## Resumo\n\n| Indicador | Total |\n|---|---:|\n| Testes | ${rows.length} |\n| PASS | ${pass} |\n| FAIL | ${fail} |\n| SKIPPED | ${skip} |\n| Outros | ${other} |\n\n## Testes críticos / módulos protegidos\n\n${table(critical)}\n\n## Event OS\n\n${table(eventOs)}\n\n## Todos os testes\n\n${table(rows)}\n\n## Critério de homologação\n\nO deploy só deve ser homologado quando **FAIL = 0**, os testes críticos de **Estornos**, **Central de Eventos** e módulos protegidos estiverem em PASS e a suíte Event OS não apresentar regressões bloqueantes.\n`
fs.writeFileSync(path.join(outDir, 'RELATORIO_HOMOLOGACAO_PLAYWRIGHT.md'), md)

const htmlRows = rows.map(r => `<tr><td>${esc(r.title)}</td><td>${esc(r.project)}</td><td><strong>${r.status}</strong></td><td>${(r.duration/1000).toFixed(2)}s</td><td>${r.retries+1}</td></tr>`).join('')
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SafeSaff Playwright — Homologação</title><style>body{font-family:Inter,Arial,sans-serif;background:#f6f7f9;color:#15171a;margin:0;padding:32px}.wrap{max-width:1280px;margin:auto}.hero,.card{background:#fff;border:1px solid #e4e7ec;border-radius:16px;padding:24px;margin-bottom:18px}.kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.kpi{background:#fff;border:1px solid #e4e7ec;border-radius:12px;padding:16px}.kpi b{font-size:26px;display:block;margin-top:6px}.status{font-size:36px;margin:0}.pass{color:#11845b}.fail{color:#c92a2a}.blocked{color:#b7791f}table{width:100%;border-collapse:collapse;font-size:13px}th,td{text-align:left;border-bottom:1px solid #eceff3;padding:10px}th{background:#fafbfc}@media(max-width:800px){.kpis{grid-template-columns:1fr 1fr}body{padding:14px}}</style></head><body><div class="wrap"><section class="hero"><div>DiskIngressos PDT • Event OS</div><h1>Homologação Playwright</h1><p class="status ${status.toLowerCase()}">${status}</p><p>Release 26.x.3.2 • ${now}</p></section><section class="kpis"><div class="kpi">Testes<b>${rows.length}</b></div><div class="kpi">PASS<b>${pass}</b></div><div class="kpi">FAIL<b>${fail}</b></div><div class="kpi">SKIPPED<b>${skip}</b></div><div class="kpi">Outros<b>${other}</b></div></section><section class="card"><h2>Resultados</h2><table><thead><tr><th>Teste</th><th>Projeto</th><th>Status</th><th>Duração</th><th>Tentativas</th></tr></thead><tbody>${htmlRows}</tbody></table></section></div></body></html>`
fs.writeFileSync(path.join(outDir, 'RELATORIO_HOMOLOGACAO_PLAYWRIGHT.html'), html)
fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify({release:'26.x.3.2-playwright-control-center-2026-09-03', generatedAt:now, status, totals:{tests:rows.length,pass,fail,skip,other}}, null, 2))
console.log(`[playwright-report] ${status}: ${pass} pass / ${fail} fail / ${rows.length} total`)
if (fail > 0) process.exitCode = 1
