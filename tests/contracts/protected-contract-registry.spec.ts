import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

test.describe('26.x.3.9 @contract @critical', () => {
  test('registro de contratos críticos permanece íntegro', async () => {
    const result = spawnSync(process.execPath, ['scripts/verify-playwright-contract-registry.mjs'], { encoding: 'utf8' })
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0)
    const report = JSON.parse(fs.readFileSync('test-results/contracts/CONTRACT_REGISTRY_REPORT.json', 'utf8'))
    expect(report.status).toBe('PASS')
    expect(report.summary.blockers).toBe(0)
  })

  test('contratos essenciais não podem ser removidos do registry', async () => {
    const registry = JSON.parse(fs.readFileSync('playwright-contract-registry.json', 'utf8'))
    const ids = registry.contracts.map((c: { id: string }) => c.id)
    for (const id of ['estornos-independent-module','central-eventos-approved-contract','event-os-navigation','event-os-api-contract','tenant-isolation','playwright-release-safety']) {
      expect(ids).toContain(id)
    }
    expect(registry.rules.neverAutoUpdate).toBe(true)
  })
})
