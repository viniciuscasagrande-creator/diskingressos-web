import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Resiliência e Degradação Graciosa — Falha Parcial de API (Fase 26.17.3)', () => {
  test('Falha 500 em inteligência não causa tela branca no Cockpit do evento', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', err => pageErrors.push(err.message))

    // Simula falha 500 na rota de inteligência
    await page.route('**/api/events/*/intelligence**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Erro temporário de serviço de inteligência.' })
      })
    })

    await login(page)
    await page.goto('/eventos')

    // Localiza o primeiro evento e acessa
    const eventCard = page.locator('.events-hub-grid .event-row-card, .event-card, table tr').first()
    await expect(eventCard).toBeVisible({ timeout: 15_000 })
    await eventCard.click()

    // O Cockpit ou tela do evento deve renderizar sem crash fatal
    const root = page.locator('#root')
    await expect(root).toBeVisible({ timeout: 15_000 })
    const text = await root.innerText()
    expect(text.trim().length).toBeGreaterThan(30)

    // Filtra erros benignos de browser
    const fatalErrors = pageErrors.filter(e => !e.includes('ResizeObserver'))
    expect(fatalErrors).toHaveLength(0)
  })

  test('Falha 500 na rota de previsões não quebra a interface geral', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', err => pageErrors.push(err.message))

    // Simula falha 500 na rota de forecast
    await page.route('**/api/events/*/forecast**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Falha interna no motor de previsões.' })
      })
    })

    await login(page)
    await page.goto('/eventos')

    const root = page.locator('#root')
    await expect(root).toBeVisible({ timeout: 15_000 })
    const text = await root.innerText()
    expect(text.trim().length).toBeGreaterThan(20)

    const fatalErrors = pageErrors.filter(e => !e.includes('ResizeObserver'))
    expect(fatalErrors).toHaveLength(0)
  })
})
