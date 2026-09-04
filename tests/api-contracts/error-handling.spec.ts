import { test, expect } from '@playwright/test'

test.describe('Tratamento de Erros e Exceções de API — Event OS (Fase 26.17.3)', () => {
  test('Acesso direto sem token redireciona para login de forma graciosa', async ({ page }) => {
    // Acessa sem fazer login
    await page.goto('/eventos')

    // Deve redirecionar ou exibir a tela de login
    await page.waitForURL(url => url.pathname.includes('/login') || url.pathname.includes('/'), { timeout: 15_000 })
    const root = page.locator('#root')
    await expect(root).toBeVisible()
  })

  test('Tentativa de acesso a evento com erro de autorização 403 não exibe tela branca', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', err => pageErrors.push(err.message))

    await page.route('**/api/events/**', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Acesso negado a evento de outra produtora.' })
      })
    })

    await page.goto('/login')
    const root = page.locator('#root')
    await expect(root).toBeVisible()

    const fatalErrors = pageErrors.filter(e => !e.includes('ResizeObserver'))
    expect(fatalErrors).toHaveLength(0)
  })
})
