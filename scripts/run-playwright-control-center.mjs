import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

fs.mkdirSync('test-results', { recursive: true })
const env = {
  ...process.env,
  PLAYWRIGHT_JSON_OUTPUT_NAME: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || 'test-results/playwright-results.json',
}
const args = ['playwright','test','tests/master','tests/regression','tests/quality','tests/responsive','tests/deploy-guard','--project=chromium','--reporter=list,json']
const test = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, { stdio:'inherit', env, shell:false })
const report = spawnSync(process.execPath, ['scripts/generate-playwright-executive-report.mjs'], { stdio:'inherit', env })
const diagnosis = spawnSync(process.execPath, ['scripts/diagnose-playwright-failures.mjs'], { stdio:'inherit', env })
const code = test.status ?? 1
process.exit(code !== 0 ? code : ((report.status ?? 0) !== 0 ? (report.status ?? 1) : (diagnosis.status ?? 0)))
