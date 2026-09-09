import { test } from '@playwright/test'
import { login } from '../fixtures/auth'

test('capture live vercel events page', async ({ page }) => {
  await login(page)
  await page.goto('/app/events')
  await page.getByTestId('events-filter-active').click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'C:/Users/vinad/.gemini/antigravity-cli/brain/38eacf3b-e19f-4d1f-8bd6-df7ccbadc6ae/live-vercel-screen.png' })
  await page.getByTestId('events-page').screenshot({ path: 'C:/Users/vinad/.gemini/antigravity-cli/brain/38eacf3b-e19f-4d1f-8bd6-df7ccbadc6ae/events-page-component.png' })
})
