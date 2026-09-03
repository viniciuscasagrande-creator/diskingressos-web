import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test('@smoke produtor autentica e entra no PDT', async ({ page }) => {
  await login(page)
  await expect(page.locator('body')).toContainText(/DiskIngressos|Eventos|Dashboard/)
})
