import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Fase 29.7 & 29.8 — Commerce Core, Pedidos 360° & Desenvolvedor', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)
  })

  test('1. Navegação: Deve acessar a central "Pedidos & Vendas" pelo menu oficial', async ({ page }) => {
    const menuOrders = page.locator('#main-module-sidebar, [data-testid="main-module-sidebar"]').locator('button:has-text("Pedidos & Vendas")')
    await expect(menuOrders).toBeVisible({ timeout: 10_000 })
    await menuOrders.click()

    const hub = page.locator('[data-testid="commerce-orders-hub"]')
    await expect(hub).toBeVisible({ timeout: 10_000 })
    await expect(hub).toContainText('Pedidos, Ingressos & Integridade Comercial')
    await expect(hub).toContainText('Commerce Integrity Center')
    await expect(hub).toContainText('Faturamento do Dia')
    await expect(hub).toContainText('Holds Ativos (Redis)')
  })

  test('2. Pedido 360°: Deve abrir o dossiê completo, navegar pelas abas e reemitir ingresso', async ({ page }) => {
    await page.goto('/app/commerce-orders')
    await page.waitForLoadState('networkidle')

    const hub = page.locator('[data-testid="commerce-orders-hub"]')
    await expect(hub).toBeVisible({ timeout: 10_000 })

    // Abre o primeiro pedido (ORD-928371)
    const dossieBtn = hub.locator('button:has-text("Dossiê 360°")').first()
    await expect(dossieBtn).toBeVisible()
    await dossieBtn.click()

    // Valida modal 360
    const modal = page.locator('[data-testid="order-dossier-360-modal"]')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('ORD-928371')
    await expect(modal).toContainText('Maria Silva Santos')
    await expect(modal).toContainText('Orquestra Sinfônica — Noite de Clássicos')

    // Aba de Ingressos
    await modal.locator('button:has-text("Ingressos & Titularidade")').click()
    await expect(modal).toContainText('Plateia Premium')
    await expect(modal).toContainText('DI-TCK-88120')

    // Clica para reemitir ingresso
    const reissueBtn = modal.locator('button:has-text("Reemitir Ingresso")').first()
    await expect(reissueBtn).toBeVisible()
    await reissueBtn.click()
    await expect(modal).toContainText('reemitido com sucesso!')

    // Aba de Pagamento & Split
    await modal.locator('button:has-text("Pagamento & Split")').click()
    await expect(modal).toContainText('Composição do Split Comercial')
    await expect(modal).toContainText('Partida Dobrada OK')

    // Aba de Timeline
    await modal.locator('button:has-text("Timeline do Pedido")').click()
    await expect(modal).toContainText('Timeline Cronológica Universal')
    await expect(modal).toContainText('Carrinho criado')

    // Aba de Rastreamento Developer
    await modal.locator('button:has-text("Rastreamento Técnico (Developer)")').click()
    await expect(modal).toContainText('COR-982736')

    // Fecha Dossiê
    await modal.locator('button:has-text("Fechar Dossiê")').click()
    await expect(modal).not.toBeVisible()
  })

  test('3. Desenvolvedor: Deve acessar o Developer Command Center e ativar modo suporte (impersonation)', async ({ page }) => {
    const menuDev = page.locator('#main-module-sidebar, [data-testid="main-module-sidebar"]').locator('button:has-text("Desenvolvedor")')
    await expect(menuDev).toBeVisible({ timeout: 10_000 })
    await menuDev.click()

    const devHub = page.locator('[data-testid="developer-command-center"]')
    await expect(devHub).toBeVisible({ timeout: 10_000 })
    await expect(devHub).toContainText('Developer Command Center')
    await expect(devHub).toContainText('Uptime Plataforma')
    await expect(devHub).toContainText('Latência P95')

    // Ativa Impersonation
    const impBtn = devHub.locator('button:has-text("Simular Impersonation")')
    await expect(impBtn).toBeVisible()
    await impBtn.click()

    // Valida banner ostensivo
    const banner = page.locator('[data-testid="developer-impersonation-banner"]')
    await expect(banner).toBeVisible()
    await expect(banner).toContainText('Modo Suporte Técnico / Investigação Developer')
    await expect(banner).toContainText('Carlos Henrique (Developer Lead)')

    // Encerra banner
    await banner.locator('button:has-text("Encerrar Suporte")').click()
    await expect(banner).not.toBeVisible()
  })

  test('4. Rastreamento Universal: Deve buscar por Correlation ID e renderizar a cadeia de execução', async ({ page }) => {
    await page.goto('/app/developer-center')
    await page.waitForLoadState('networkidle')

    const devHub = page.locator('[data-testid="developer-command-center"]')
    await expect(devHub).toBeVisible({ timeout: 10_000 })

    // Valida busca de jornada por Correlation ID (COR-982736)
    await expect(devHub).toContainText('COR-982736')
    await expect(devHub).toContainText('STATUS: FALHA NA NOTIFICAÇÃO (DLQ)')
    await expect(devHub).toContainText('Cadeia Canônica de Execução no Disk Core')
    await expect(devHub).toContainText('Site Checkout')
    await expect(devHub).toContainText('Disk Core • Ticket Core')
    await expect(devHub).toContainText('Reprocessar DLQ')

    // Alterna para aba de Logs Estruturados
    await devHub.locator('button:has-text("Logs Estruturados")').click()
    await expect(devHub).toContainText('Logs Estruturados Sanitizados')
    await expect(devHub).toContainText('CheckoutCore')

    // Alterna para aba de Erros & Fingerprints
    await devHub.locator('button:has-text("Erros & Fingerprints")').click()
    await expect(devHub).toContainText('Exceções Agrupadas por Fingerprint')
    await expect(devHub).toContainText('ERR-FP-0192')
  })
})
