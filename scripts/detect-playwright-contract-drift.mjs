import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const registry = JSON.parse(fs.readFileSync(process.env.PLAYWRIGHT_CONTRACT_REGISTRY || 'playwright-contract-registry.json', 'utf8'))
const outDir = process.env.PLAYWRIGHT_CONTRACT_DIR || 'test-results/contracts'
fs.mkdirSync(outDir, { recursive: true })

const tracked = new Set()
for (const contract of registry.contracts || []) for (const file of Object.keys(contract.files || {})) tracked.add(file)
const changed = new Set()

const envFiles = process.env.PLAYWRIGHT_CHANGED_FILES
if (envFiles) {
  for (const file of envFiles.split(/[\n,;]/).map(x => x.trim().replaceAll('\\', '/')).filter(Boolean)) changed.add(file)
} else {
  for (const args of [['diff','--name-only','HEAD~1...HEAD'], ['status','--porcelain']]) {
    const r = spawnSync('git', args, { encoding: 'utf8' })
    if (r.status !== 0) continue
    const lines = r.stdout.split(/\r?\n/).filter(Boolean)
    for (const line of lines) changed.add((args[0] === 'status' ? line.slice(3) : line).trim().replaceAll('\\', '/'))
    if (changed.size) break
  }
}

const affected = [...changed].filter(file => tracked.has(file))
const contracts = (registry.contracts || []).filter(c => Object.keys(c.files || {}).some(file => affected.includes(file))).map(c => ({ id: c.id, severity: c.severity }))
const blocker = contracts.some(c => c.severity === 'BLOCKER')
const status = !changed.size ? 'NO_CHANGES_DETECTED' : !affected.length ? 'NO_CONTRACT_DRIFT' : blocker ? 'BLOCKER_CONTRACT_TOUCHED' : 'CONTRACT_TOUCHED'
const payload = { release: registry.release, generatedAt: new Date().toISOString(), status, changedFiles: [...changed], protectedFilesChanged: affected, impactedContracts: contracts }
fs.writeFileSync(path.join(outDir, 'CONTRACT_DRIFT.json'), JSON.stringify(payload, null, 2))
fs.writeFileSync(path.join(outDir, 'CONTRACT_DRIFT.md'), `# SafeSaff — Contract Drift\n\n**Status:** **${status}**\n\n## Arquivos protegidos alterados\n\n${affected.length ? affected.map(x => `- \`${x}\``).join('\n') : '- Nenhum'}\n\n## Contratos impactados\n\n${contracts.length ? contracts.map(x => `- **${x.id}** — ${x.severity}`).join('\n') : '- Nenhum'}\n\n> Alterar um arquivo protegido não significa erro por si só, mas exige execução do Contract Registry e regressão Playwright correspondente.\n`)
console.log(JSON.stringify(payload, null, 2))
