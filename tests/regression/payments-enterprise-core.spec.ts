import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Núcleo de Pagamentos Enterprise — PIX, Cartões, Antifraude & Conciliação', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)
  })

  test('1. Navegação: Deve acessar a Central de Pagamentos através do atalho oficial em Pedidos & Vendas', async ({ page }) => {
    // Acessa Pedidos & Vendas
    await page.goto('/app/commerce-orders')
    await page.waitForLoadState('networkidle')

    const hubOrders = page.locator('[data-testid="commerce-orders-hub"]')
    await expect(hubOrders).toBeVisible({ timeout: 10_000 })

    // Clica no botão de atalho para Central de Pagamentos
    const gotoPaymentsBtn = page.locator('[data-testid="goto-payments-btn"]')
    await expect(gotoPaymentsBtn).toBeVisible()
    await gotoPaymentsBtn.click()

    // Valida que a Central de Pagamentos Enterprise abriu
    const paymentsHub = page.locator('[data-testid="payments-hub"]')
    await expect(paymentsHub).toBeVisible({ timeout: 10_000 })
    await expect(paymentsHub).toContainText('Central de Pagamentos Enterprise')
    await expect(paymentsHub).toContainText('Volume Processado Hoje')
    await expect(paymentsHub).toContainText('Taxa de Aprovação')
    await expect(paymentsHub).toContainText('PIX vs Cartões')
  })

  test('2. Dossiê 360° e Estorno: Deve abrir dossiê, validar split congelado e executar estorno parcial com motivo', async ({ page }) => {
    await page.goto('/app/payments')
    await page.waitForLoadState('networkidle')

    const paymentsHub = page.locator('[data-testid="payments-hub"]')
    await expect(paymentsHub).toBeVisible({ timeout: 10_000 })

    // Muda para a aba de Transações
    await paymentsHub.locator('button:has-text("Transações & Meios")').click()

    // Abre o primeiro dossiê
    const dossieBtn = paymentsHub.locator('button:has-text("Dossiê")').first()
    await expect(dossieBtn).toBeVisible()
    await dossieBtn.click()

    const modal = page.locator('[data-testid="payment-dossier-360-modal"]')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('PAY-98281')
    await expect(modal).toContainText('Maria Silva Santos')

    // Aba de Split Econômico
    await modal.locator('button:has-text("Split Econômico & Ledger")').click()
    await expect(modal).toContainText('Snapshot do Split Comercial e Contábil')
    await expect(modal).toContainText('Partida Dobrada & Integridade do Ledger')

    // Aba de Timeline Cronológica
    await modal.locator('button:has-text("Timeline Cronológica")').click()
    await expect(modal).toContainText('Rastreamento Cronológico Universal')
    await expect(modal).toContainText('Intenção Criada')

    // Aba de Estorno
    await modal.locator('button:has-text("Estorno & Alçadas")').click()
    await expect(modal).toContainText('Central de Estorno & Política de Alçadas')

    // Preenche motivo e executa
    await modal.locator('textarea').fill('Desistência solicitada pelo comprador via SAC dentro do prazo de 7 dias')
    await modal.locator('button:has-text("Confirmar e Executar Estorno no Core")').click()

    await expect(page.locator('text=Estorno executado e registrado no Core com sucesso!')).toBeVisible({ timeout: 5000 })
  })

  test('3. Antifraude & Revisão Manual: Deve avaliar fila de risco e deliberar liberação de transação com auditoria', async ({ page }) => {
    await page.goto('/app/payments')
    await page.waitForLoadState('networkidle')

    const paymentsHub = page.locator('[data-testid="payments-hub"]')
    await expect(paymentsHub).toBeVisible({ timeout: 10_000 })

    // Clica na aba Antifraude & Risco
    await paymentsHub.locator('button:has-text("Antifraude & Risco")').click()
    await expect(paymentsHub).toContainText('Fila de Revisão Manual de Antifraude')

    // Clica para revisar decisão
    const reviewBtn = paymentsHub.locator('button:has-text("Revisar Decisão")').first()
    await expect(reviewBtn).toBeVisible()
    await reviewBtn.click()

    const modal = page.locator('[data-testid="manual-review-modal"]')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Revisão Manual de Antifraude')

    // Preenche justificativa obrigatória
    await modal.locator('textarea').fill('Comprador contatado e documento com foto autenticado via SAC')
    await modal.locator('button:has-text("Confirmar Decisão de Risco")').click()

    await expect(modal).not.toBeVisible()
    await expect(page.locator('text=registrada com auditoria!')).toBeVisible()
  })

  test('4. Chargebacks: Deve visualizar caso com check-in em catraca física e enviar pacote de evidências', async ({ page }) => {
    await page.goto('/app/payments')
    await page.waitForLoadState('networkidle')

    const paymentsHub = page.locator('[data-testid="payments-hub"]')
    await expect(paymentsHub).toBeVisible({ timeout: 10_000 })

    // Clica na aba Chargebacks
    await paymentsHub.locator('button:has-text("Chargebacks")').click()
    await expect(paymentsHub).toContainText('Central de Chargebacks & Contestações')
    await expect(paymentsHub).toContainText('SIM (Portão 03)')

    // Clica em Enviar Evidências
    const contestBtn = paymentsHub.locator('button:has-text("Enviar Evidências")').first()
    await expect(contestBtn).toBeVisible()
    await contestBtn.click()

    await expect(page.locator('text=Pacote oficial de evidências transmitido à adquirente com sucesso!')).toBeVisible()
  })

  test('5. Conciliação: Deve listar divergências e acionar compensação contábil no Ledger', async ({ page }) => {
    await page.goto('/app/payments')
    await page.waitForLoadState('networkidle')

    const paymentsHub = page.locator('[data-testid="payments-hub"]')
    await expect(paymentsHub).toBeVisible({ timeout: 10_000 })

    // Clica na aba Conciliação & Divergências
    await paymentsHub.locator('button:has-text("Conciliação & Divergências")').click()
    await expect(paymentsHub).toContainText('Central de Divergências & Conciliação Automática')

    // Clica em Compensar Ledger
    const resolveBtn = paymentsHub.locator('button:has-text("Compensar Ledger")').first()
    if (await resolveBtn.isVisible()) {
      await resolveBtn.click()
      await expect(page.locator('text=Divergência financeira resolvida')).toBeVisible()
    }
  })
})
