import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test('@quality páginas principais sem erro JS crítico ou resposta 5xx', async ({ page }) => {
  const errors: string[] = []
  const serverErrors: string[] = []

  page.on('pageerror', err => errors.push(err.message))
  page.on('response', response => {
    if (response.status() >= 500) serverErrors.push(`${response.status()} ${response.url()}`)
  })

  await login(page)
  for (const path of ['/eventos', '/app/finance-dashboard', '/app/finance-refunds', '/app/marketing-dashboard', '/app/sac-hub']) {
    await page.goto(path)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)
  }

  expect(serverErrors, `Respostas 5xx detectadas:\n${serverErrors.join('\n')}`).toEqual([])
  expect(errors, `Erros JavaScript detectados:\n${errors.join('\n')}`).toEqual([])
})
