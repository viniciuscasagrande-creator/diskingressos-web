import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'notebook-1366', width: 1366, height: 768 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'mobile-390', width: 390, height: 844 },
]

for (const viewport of viewports) {
  test(`@responsive Central de Eventos não cria overflow horizontal em ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByRole('heading', { name: 'Eventos', exact: true })).toBeVisible()
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 2)
  })
}
