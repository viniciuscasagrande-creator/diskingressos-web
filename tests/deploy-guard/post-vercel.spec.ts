import { expect, test } from '@playwright/test'
import { producerA } from '../fixtures/auth'

const protectedModules = [
  { label: /Eventos/i, route: '/app/events' },
  { label: /Financeiro/i, route: '/app/finance-dashboard' },
  { label: /Estornos/i, route: '/app/finance-refunds' },
  { label: /Marketing/i, route: '/app/marketing-dashboard' },
  { label: /Atendimento|SAC/i, route: '/app/sac-hub' },
]

test.describe('Fase 26.x.3 • Deploy Guard pós-Vercel', () => {
  test('deploy responde e carrega a aplicação', async ({ page }) => {
    const response = await page.goto('/app', { waitUntil: 'domcontentloaded' })
    expect(response?.ok()).toBeTruthy()
    await expect(page).toHaveTitle(/DiskIngressos|SafeSaff|Gestão de Eventos/i)
  })

  test('login de produtor continua operacional', async ({ page }) => {
    test.skip(!producerA.email || !producerA.password, 'Credenciais E2E não configuradas')
    await page.goto('/app')
    const email = page.locator('input[type="email"], input[name="email"]').first()
    const password = page.locator('input[type="password"], input[name="password"]').first()
    if (await email.isVisible().catch(() => false)) {
      await email.fill(producerA.email)
      await password.fill(producerA.password)
      await page.getByRole('button', { name: /entrar|acessar|login/i }).click()
    }
    await expect(page).toHaveURL(/\/app/)
  })

  test('módulos core protegidos permanecem acessíveis', async ({ page }) => {
    test.skip(!producerA.email || !producerA.password, 'Credenciais E2E não configuradas')
    await page.goto('/app')
    const email = page.locator('input[type="email"], input[name="email"]').first()
    if (await email.isVisible().catch(() => false)) {
      await email.fill(producerA.email)
      await page.locator('input[type="password"], input[name="password"]').first().fill(producerA.password)
      await page.getByRole('button', { name: /entrar|acessar|login/i }).click()
    }

    for (const module of protectedModules) {
      await page.goto(module.route)
      await expect(page).toHaveURL(new RegExp(module.route.replaceAll('/', '\\/')))
      await expect(page.locator('body')).not.toContainText(/404|not found|página não encontrada/i)
    }
  })

  test('Estornos continua independente e não desaparece', async ({ page }) => {
    test.skip(!producerA.email || !producerA.password, 'Credenciais E2E não configuradas')
    await page.goto('/app/finance-refunds')
    const email = page.locator('input[type="email"], input[name="email"]').first()
    if (await email.isVisible().catch(() => false)) {
      await email.fill(producerA.email)
      await page.locator('input[type="password"], input[name="password"]').first().fill(producerA.password)
      await page.getByRole('button', { name: /entrar|acessar|login/i }).click()
      await page.goto('/app/finance-refunds')
    }
    await expect(page).toHaveURL(/\/app\/finance-refunds/)
    await expect(page.locator('body')).toContainText(/Estornos|Reembolsos|Chargebacks/i)
  })

  test('Central de Eventos mantém os controles visuais aprovados', async ({ page }) => {
    test.skip(!producerA.email || !producerA.password, 'Credenciais E2E não configuradas')
    await page.goto('/app/events')
    const email = page.locator('input[type="email"], input[name="email"]').first()
    if (await email.isVisible().catch(() => false)) {
      await email.fill(producerA.email)
      await page.locator('input[type="password"], input[name="password"]').first().fill(producerA.password)
      await page.getByRole('button', { name: /entrar|acessar|login/i }).click()
      await page.goto('/app/events')
    }
    await expect(page.getByText('Comparar', { exact: true })).toBeVisible()
    await expect(page.getByText('Horizontal', { exact: true })).toBeVisible()
    for (const label of ['Ativos', 'Inativos', 'Todos']) await expect(page.getByText(label, { exact: true })).toBeVisible()
  })
})
