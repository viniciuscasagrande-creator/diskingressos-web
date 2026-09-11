import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Marketing Subpages Null Safety & Crash Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('1. Direct access to /app/marketing-tiktok-ads loads without ErrorBoundary', async ({ page }) => {
    await page.goto('/app/marketing-tiktok-ads')

    // Ensure error boundary is NOT triggered
    await expect(page.getByText('Não foi possível carregar esta área')).not.toBeVisible()

    // Ensure TikTok Ads section is rendered
    await expect(page.getByRole('heading', { name: /TikTok Ads/i }).first()).toBeVisible()
    await expect(page.getByText('Campanhas virais em vídeo com rastreamento via TikTok Pixel & Event API.')).toBeVisible()
    await expect(page.getByText('Spark Ads em Veiculação')).toBeVisible()
  })

  test('2. Direct access to /app/marketing-meta-ads loads without ErrorBoundary', async ({ page }) => {
    await page.goto('/app/marketing-meta-ads')

    await expect(page.getByText('Não foi possível carregar esta área')).not.toBeVisible()
    await expect(page.getByRole('heading', { name: /Meta Ads/i }).first()).toBeVisible()
  })

  test('3. Direct access to /app/marketing-google-ads loads without ErrorBoundary', async ({ page }) => {
    await page.goto('/app/marketing-google-ads')

    await expect(page.getByText('Não foi possível carregar esta área')).not.toBeVisible()
    await expect(page.getByRole('heading', { name: /Google Ads/i }).first()).toBeVisible()
  })

  test('4. Direct access to /app/marketing-crm loads without ErrorBoundary', async ({ page }) => {
    await page.goto('/app/marketing-crm')

    await expect(page.getByText('Não foi possível carregar esta área')).not.toBeVisible()
    await expect(page.getByRole('heading', { name: /CRM de Relacionamento/i })).toBeVisible()
  })

  test('5. Direct access to /app/marketing-audiences loads without ErrorBoundary', async ({ page }) => {
    await page.goto('/app/marketing-audiences')

    await expect(page.getByText('Não foi possível carregar esta área')).not.toBeVisible()
    await expect(page.getByRole('heading', { name: /Públicos Personalizados/i })).toBeVisible()
  })
})
