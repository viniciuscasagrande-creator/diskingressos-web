import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.1 · Auditoria Automática: Blank Screen & Crash Detector', () => {
  const targetRoutes = [
    '/eventos',
    '/app/finance-dashboard',
    '/app/finance-refunds',
    '/app/marketing-dashboard',
    '/app/sac-hub'
  ]

  for (const route of targetRoutes) {
    test(`garante ausência de tela branca na rota ${route}`, async ({ page }) => {
      const pageErrors: string[] = []
      page.on('pageerror', err => pageErrors.push(err.message))

      await login(page)
      await page.goto(route)

      // Valida que root e body estão renderizados com conteúdo
      const root = page.locator('#root')
      await expect(root).toBeVisible({ timeout: 15_000 })
      const text = await root.innerText()
      expect(text.trim().length).toBeGreaterThan(20)

      // Garante que não há tela de erro fatal ou crash
      await expect(page.getByText('Something went wrong')).not.toBeVisible()
      await expect(page.getByText('ChunkLoadError')).not.toBeVisible()

      // Filtrando ResizeObserver benigno de browsers
      const fatalErrors = pageErrors.filter(e => !e.includes('ResizeObserver'))
      expect(fatalErrors).toHaveLength(0)
    })
  }
})
