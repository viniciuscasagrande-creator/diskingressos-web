import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.9.4.3 - Conciliação Bancária, Gateways & Liquidação Automática', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('navega para conciliação e exibe os 5 cards de KPI e a esteira dos 3 níveis', async ({ page }) => {
    await page.goto('/app/finance-reconciliation')

    // 1. Título principal e subtítulo
    await expect(page.getByRole('heading', { name: /Conciliação Bancária & Gateways/i })).toBeVisible()
    await expect(page.getByText(/Fase 26.17.9.4.3 · Núcleo ERP Financeiro/i)).toBeVisible()

    // 2. Os 5 Cards de KPI
    await expect(page.getByText(/Batimento Geral/i)).toBeVisible()
    await expect(page.getByText(/Volume Liquidado/i)).toBeVisible()
    await expect(page.getByText(/Em Agenda \(D\+N\)/i)).toBeVisible()
    await expect(page.getByText(/Divergências Ativas/i)).toBeVisible()
    await expect(page.getByText(/Sobretaxas MDR/i)).toBeVisible()

    // 3. Esteira do Ciclo Financeiro
    await expect(page.getByText(/Esteira do Ciclo Financeiro do Evento/i)).toBeVisible()
    await expect(page.getByText(/1\. Venda do Ingresso/i)).toBeVisible()
    await expect(page.getByText(/2\. Gateway & Transação/i)).toBeVisible()
    await expect(page.getByText(/3\. Agenda de Liquidação/i)).toBeVisible()
    await expect(page.getByText(/4\. Baixa no Ledger/i)).toBeVisible()
    await expect(page.getByText(/5\. Split & Repasse/i)).toBeVisible()

    // 4. Central de Divergências e Batimento Tripartite
    await expect(page.getByText(/Central de Conciliação, Divergências & Baixas/i)).toBeVisible()

    // 5. Verifica os 3 badges de nível em lançamentos
    await expect(page.getByText(/N1 \(Pedido × Gateway\):/i).first()).toBeVisible()
    await expect(page.getByText(/N2 \(Gateway × Liquidação\):/i).first()).toBeVisible()
    await expect(page.getByText(/N3 \(Liquidação × Ledger\):/i).first()).toBeVisible()
  })

  test('abre modal de espelho e auditoria formal com partidas dobradas e hash digital', async ({ page }) => {
    await page.goto('/app/finance-reconciliation')

    // Clica no botão Espelho / Auditoria do primeiro lançamento
    const voucherBtn = page.getByRole('button', { name: /Espelho \/ Auditoria/i }).first()
    await expect(voucherBtn).toBeVisible()
    await voucherBtn.click()

    // Valida modal de espelho
    await expect(page.getByRole('heading', { name: /Espelho Oficial de Conciliação Bancária & Ledger/i })).toBeVisible()
    await expect(page.getByText(/PARTIDAS DOBRADAS \(LEDGER CONTÁBIL\):/i)).toBeVisible()
    await expect(page.getByText(/Assinatura Digital SHA-256:/i)).toBeVisible()

    // Fecha modal
    await page.getByRole('button', { name: /Fechar/i }).click()
  })
})
