import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

fs.mkdirSync('test-results', { recursive: true })

const env = {
  ...process.env,
  PLAYWRIGHT_JSON_OUTPUT_NAME: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || 'test-results/playwright-results.json',
  PLAYWRIGHT_JSON_REPORT: process.env.PLAYWRIGHT_JSON_REPORT || 'test-results/playwright-results.json'
}

const runner = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['playwright', 'test', 'tests/master', 'tests/regression', 'tests/quality', 'tests/responsive', 'tests/deploy-guard', '--project=chromium', '--reporter=list,json'],
  { stdio: 'inherit', env, shell: false }
)

const report = spawnSync(process.execPath, ['scripts/generate-playwright-executive-report.mjs'], { stdio: 'inherit', env })
const certificate = spawnSync(process.execPath, ['scripts/certify-playwright-release.mjs'], { stdio: 'inherit', env })

if ((runner.status ?? 1) !== 0) process.exit(runner.status ?? 1)
if ((report.status ?? 1) !== 0) process.exit(report.status ?? 1)
process.exit(certificate.status ?? 1)
