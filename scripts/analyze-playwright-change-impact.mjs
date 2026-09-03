import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const release = '26.x.3.8-playwright-change-impact-smart-regression-2026-09-03'
const policyPath = process.env.PLAYWRIGHT_CHANGE_IMPACT_POLICY || 'playwright-change-impact.policy.json'
const outDir = process.env.PLAYWRIGHT_CHANGE_IMPACT_DIR || 'test-results/change-impact'
fs.mkdirSync(outDir, { recursive: true })

const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'))
const normalize = p => p.replaceAll('\\', '/').replace(/^\.\//, '')
const globRe = pattern => {
  const src = normalize(pattern)
  let out = '^'
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (ch === '*') {
      if (src[i + 1] === '*') { out += '.*'; i++ }
      else out += '[^/]*'
    } else if (ch === '?') out += '[^/]'
    else out += ch.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
  }
  out += '$'
  return new RegExp(out, 'i')
}
const matches = (file, pattern) => globRe(pattern).test(normalize(file))

function getChangedFiles() {
  if (process.env.PLAYWRIGHT_CHANGED_FILES) {
    return [...new Set(process.env.PLAYWRIGHT_CHANGED_FILES.split(/[\n,;]/).map(x => normalize(x.trim())).filter(Boolean))]
  }
  const bases = [process.env.CHANGE_BASE, 'HEAD~1']
  for (const base of bases) {
    if (!base) continue
    const r = spawnSync('git', ['diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' })
    if (r.status === 0) {
      const files = r.stdout.split(/\r?\n/).map(x => normalize(x.trim())).filter(Boolean)
      if (files.length) return [...new Set(files)]
    }
  }
  const r = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
  if (r.status === 0) {
    const files = r.stdout.split(/\r?\n/).map(line => normalize(line.slice(3).trim())).filter(Boolean)
    if (files.length) return [...new Set(files)]
  }
  return []
}

const files = getChangedFiles()
const impacted = new Set()
const reasons = {}
let critical = false

for (const file of files) {
  for (const criticalFile of policy.criticalFiles || []) {
    if (matches(file, criticalFile)) critical = true
  }
  for (const [moduleId, entry] of Object.entries(policy.modules || {})) {
    for (const pattern of entry.patterns || []) {
      if (matches(file, pattern)) {
        impacted.add(moduleId)
        ;(reasons[moduleId] ||= []).push({ file, pattern })
        break
      }
    }
  }
}

const tests = [...(policy.alwaysRun || [])]
for (const id of impacted) {
  for (const t of policy.modules?.[id]?.tests || []) if (!tests.includes(t)) tests.push(t)
}
if (critical) {
  for (const t of ['tests/master/estornos-critical.spec.ts', 'tests/master/central-eventos-contract.spec.ts', 'tests/security/tenant-isolation.spec.ts']) {
    if (!tests.includes(t)) tests.push(t)
  }
}

const status = files.length === 0 ? 'NO_CHANGES_DETECTED' : impacted.size ? (critical ? 'CRITICAL_IMPACT' : 'IMPACT_DETECTED') : 'LOW_RISK_CHANGE'
const payload = {
  release,
  generatedAt: new Date().toISOString(),
  status,
  critical,
  changedFiles: files,
  impactedModules: [...impacted],
  selectedTests: tests,
  reasons,
  source: process.env.PLAYWRIGHT_CHANGED_FILES ? 'PLAYWRIGHT_CHANGED_FILES' : 'git'
}
fs.writeFileSync(path.join(outDir, 'CHANGE_IMPACT.json'), JSON.stringify(payload, null, 2))
const md = `# SafeSaff — Playwright Change Impact\n\n**Release:** ${release}  \n**Status:** **${status}**  \n**Impacto crítico:** ${critical ? 'SIM' : 'NÃO'}\n\n## Arquivos alterados\n\n${files.length ? files.map(x => `- \`${x}\``).join('\n') : '- Nenhum arquivo detectado'}\n\n## Módulos impactados\n\n${impacted.size ? [...impacted].map(x => `- **${x}**`).join('\n') : '- Nenhum módulo classificado'}\n\n## Testes selecionados\n\n${tests.map(x => `- \`${x}\``).join('\n')}\n\n## Regra\n\nO analisador nunca remove testes de proteção. Arquivos críticos elevam a regressão para Estornos, Central de Eventos e segurança multi-tenant.\n`
fs.writeFileSync(path.join(outDir, 'CHANGE_IMPACT.md'), md)
console.log(JSON.stringify(payload, null, 2))
