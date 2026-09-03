import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const registryPath = process.env.PLAYWRIGHT_CONTRACT_REGISTRY || 'playwright-contract-registry.json'
const outDir = process.env.PLAYWRIGHT_CONTRACT_DIR || 'test-results/contracts'
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
fs.mkdirSync(outDir, { recursive: true })

const results = []
const normalized = value => String(value).replace(/\s+/g, ' ').trim()

for (const contract of registry.contracts || []) {
  const failures = []
  const files = []
  for (const [file, anchors] of Object.entries(contract.files || {})) {
    const exists = fs.existsSync(file)
    const item = { file, exists, sha256: null, anchors: [] }
    if (!exists) {
      failures.push({ file, reason: 'FILE_MISSING' })
      files.push(item)
      continue
    }
    const stat = fs.statSync(file)
    if (!stat.isFile()) {
      failures.push({ file, reason: 'NOT_A_FILE' })
      files.push(item)
      continue
    }
    const raw = fs.readFileSync(file)
    item.sha256 = crypto.createHash('sha256').update(raw).digest('hex')
    if (anchors.length) {
      const text = normalized(raw.toString('utf8'))
      for (const anchor of anchors) {
        const ok = text.includes(normalized(anchor))
        item.anchors.push({ anchor, ok })
        if (!ok) failures.push({ file, reason: 'ANCHOR_MISSING', anchor })
      }
    }
    files.push(item)
  }
  results.push({
    id: contract.id,
    severity: contract.severity || 'ERROR',
    status: failures.length ? 'FAIL' : 'PASS',
    failures,
    files
  })
}

const blockers = results.filter(x => x.status === 'FAIL' && x.severity === 'BLOCKER')
const failed = results.filter(x => x.status === 'FAIL')
const status = blockers.length ? 'BLOCKED' : failed.length ? 'ATTENTION' : 'PASS'
const payload = {
  release: registry.release,
  generatedAt: new Date().toISOString(),
  status,
  summary: { total: results.length, passed: results.filter(x => x.status === 'PASS').length, failed: failed.length, blockers: blockers.length },
  rules: registry.rules,
  results
}

fs.writeFileSync(path.join(outDir, 'CONTRACT_REGISTRY_REPORT.json'), JSON.stringify(payload, null, 2))
const md = `# SafeSaff — Playwright Contract Registry\n\n**Release:** ${registry.release}  \n**Status:** **${status}**\n\n## Resumo\n\n- Contratos: ${payload.summary.total}\n- PASS: ${payload.summary.passed}\n- FAIL: ${payload.summary.failed}\n- BLOCKER: ${payload.summary.blockers}\n\n## Contratos\n\n${results.map(r => `### ${r.status === 'PASS' ? '✅' : '❌'} ${r.id}\n\nSeveridade: **${r.severity}**  \nStatus: **${r.status}**${r.failures.length ? `\n\n${r.failures.map(f => `- ${f.reason}: \`${f.file}\`${f.anchor ? ` → \`${f.anchor}\`` : ''}`).join('\n')}` : ''}`).join('\n\n')}\n\n## Regra de governança\n\nEste registro não deve ser atualizado automaticamente para fazer um teste passar. Alterações em contratos BLOCKER exigem aprovação funcional/visual explícita.\n`
fs.writeFileSync(path.join(outDir, 'CONTRACT_REGISTRY_REPORT.md'), md)

console.log(`[contract-registry] ${status} — ${payload.summary.passed}/${payload.summary.total} contratos aprovados.`)
if (blockers.length) process.exit(2)
if (failed.length) process.exit(1)
