import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

const eventModules = [
  ['Cockpit 360', /Event Cockpit 360|Centro de Comando/i],
  ['Inventário', /Inventário|Inventory Engine/i],
  ['Customer 360', /Customer 360/i],
  ['Live Operations', /Live Event Operations|Live Operations/i],
  ['Incident Center', /Incident Center/i],
  ['Revenue Intelligence', /Revenue & Pricing Intelligence|Revenue Intelligence/i],
  ['Busca Global', /Global Search|Busca Global/i],
  ['Disk Intelligence', /Disk Intelligence/i],
  ['Readiness / Go-Live', /Event Readiness|Readiness|Go-Live/i],
  ['Forecast Center', /Analytics & Forecast Center|Forecast Center/i],
  ['Event Day Command', /Event Day Command Center|Event Day Command/i],
  ['Executive Dashboard', /Producer Executive Dashboard|Executive Dashboard/i],
  ['Platform NOC', /Platform Operations|Platform NOC/i],
] as const

test.describe('@master Event OS 26.x', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()
    await expect(page.getByText(/Event Cockpit 360|Centro de Comando/i).first()).toBeVisible({ timeout: 15_000 })
  })

  for (const [navLabel, pageTitle] of eventModules) {
    test(`${navLabel} abre dentro do evento selecionado`, async ({ page }) => {
      const nav = page.getByText(navLabel, { exact: true }).first()
      await expect(nav).toBeVisible({ timeout: 10_000 })
      await nav.click()
      await expect(page.getByText(pageTitle).first()).toBeVisible({ timeout: 15_000 })
      await expect(page).toHaveURL(/\/eventos\/.+\//)
    })
  }
})
