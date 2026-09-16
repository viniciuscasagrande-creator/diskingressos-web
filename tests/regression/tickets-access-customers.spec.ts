import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Fase 29.10 & 29.11 — Ingressos, Controle de Acesso e Central de Clientes', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)
  })

  test('1. Ingressos: Deve acessar a Central de Ingressos através do atalho em Pedidos & Vendas', async ({ page }) => {
    await page.goto('/app/commerce-orders')
    await page.waitForLoadState('networkidle')

    const hubOrders = page.locator('[data-testid="commerce-orders-hub"]')
    await expect(hubOrders).toBeVisible({ timeout: 10_000 })

    // Clica no botão de atalho para Central de Ingressos
    const gotoTicketsBtn = page.locator('[data-testid="goto-tickets-btn"]')
    await expect(gotoTicketsBtn).toBeVisible()
    await gotoTicketsBtn.click()

    // Valida que a Central de Ingressos abriu
    await expect(page.locator('h1').first()).toContainText('Central de Ingressos')
    await expect(page.locator('text=Separação rigorosa entre Comprador e Titularidade')).toBeVisible()
    await expect(page.locator('text=Total de Ingressos')).toBeVisible()
    await expect(page.locator('text=Ativos para Entrada').first()).toBeVisible()
  })

  test('2. Credenciais & Transferência: Deve abrir modal de transferência e validar comprador vs titular', async ({ page }) => {
    await page.goto('/app/tickets')
    await page.waitForLoadState('networkidle')

    // Valida tabela de ingressos
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('text=Maria Silva Santos').first()).toBeVisible()

    // Clica no botão de Transferir habilitado
    const transferBtn = page.locator('button:has-text("Transferir"):not([disabled])').first()
    await expect(transferBtn).toBeVisible()
    await transferBtn.click()

    // Valida o modal de transferência
    await expect(page.locator('h3:has-text("Transferência de Titularidade")')).toBeVisible()
    await expect(page.locator('text=Regra de Segurança Disk Core')).toBeVisible()
    await expect(page.locator('text=O comprador original')).toBeVisible()

    // Fecha o modal
    await page.locator('button:has-text("Cancelar")').click()
  })

  test('3. Controle de Acesso (Disk Acesso): Deve validar portões, coletores e simulador ótico de catraca', async ({ page }) => {
    await page.goto('/app/access-control')
    await page.waitForLoadState('networkidle')

    // Valida cabeçalho do Disk Acesso
    await expect(page.locator('h1').first()).toContainText('Controle de Acesso')
    await expect(page.locator('text=Disk Acesso • Portaria & Catracas')).toBeVisible()
    await expect(page.locator('text=Entradas Confirmadas')).toBeVisible()
    await expect(page.locator('text=Portões Operando')).toBeVisible()

    // Dispara leitura ótica de teste
    const scanBtn = page.locator('button:has-text("Disparar Leitura Ótica")')
    await expect(scanBtn).toBeVisible()
    await scanBtn.click()

    // Valida resultado da validação ótica
    await expect(page.locator('strong:has-text("Resultado:")')).toBeVisible({ timeout: 8_000 })
  })

  test('4. Central de Clientes: Deve buscar clientes e abrir o dossiê sem qualquer menção ao termo 360', async ({ page }) => {
    await page.goto('/app/customers')
    await page.waitForLoadState('networkidle')

    // Valida cabeçalho da Central de Clientes
    await expect(page.locator('h1').first()).toContainText('Central de Clientes')
    await expect(page.locator('text=Central de Consulta de Clientes')).toBeVisible()
    await expect(page.locator('text=Base Unificada Disk Core')).toBeVisible()

    // Não pode conter "360" visível ao usuário
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toContain('Cliente 360')
    expect(bodyText).not.toContain('Customer 360')
    expect(bodyText).not.toContain('Dossiê 360')
    expect(bodyText).not.toContain('360°')
    expect(bodyText).not.toContain('360º')

    // Abre Dossiê do Cliente
    const dossieBtn = page.locator('button:has-text("Dossiê do Cliente")').first()
    await expect(dossieBtn).toBeVisible()
    await dossieBtn.click()

    // Valida dados no modal
    await expect(page.locator('text=Visão Cadastral & Comercial')).toBeVisible()
    await expect(page.locator('text=Linha do Tempo de Interações')).toBeVisible()
    await expect(page.locator('text=Score de Risco')).toBeVisible()

    // Fecha o dossiê
    await page.locator('button:has-text("Fechar Dossiê")').click()
  })
})
