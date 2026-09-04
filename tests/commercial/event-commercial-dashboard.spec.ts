import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.7.1 — Central de Eventos + Painel Comercial Operacional', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.locator('[data-testid="events-page"]')).toBeVisible({ timeout: 15_000 })
  })

  test('Central de Eventos: Alternador Horizontal/Vertical, Seletor de 2 a 6 Colunas e Filtros de Status', async ({ page }) => {
    // 1. Valida filtros de status Ativos, Inativos e Todos
    const filterActive = page.locator('[data-testid="events-filter-active"]')
    const filterInactive = page.locator('[data-testid="events-filter-inactive"]')
    const filterAll = page.locator('[data-testid="events-filter-all"]')

    await expect(filterActive).toBeVisible()
    await expect(filterInactive).toBeVisible()
    await expect(filterAll).toBeVisible()

    // Clica em Inativos
    await filterInactive.click()
    await expect(filterInactive).toHaveClass(/active/)

    // Retorna para Ativos
    await filterActive.click()
    await expect(filterActive).toHaveClass(/active/)

    // 2. Valida Alternador Horizontal vs Vertical
    const btnHorizontal = page.locator('[data-testid="btn-view-horizontal"]')
    const btnVertical = page.locator('[data-testid="btn-view-vertical"]')
    const grid = page.locator('[data-testid="event-grid"]')

    await expect(btnHorizontal).toBeVisible()
    await expect(btnVertical).toBeVisible()

    // Alterna para modo Horizontal
    await btnHorizontal.click()
    await expect(grid).toHaveClass(/view-horizontal/)

    // Alterna de volta para modo Vertical
    await btnVertical.click()
    await expect(grid).toHaveClass(/view-vertical/)

    // 3. Valida Seletor de 2 a 6 Colunas por Linha
    const colSelector = page.locator('[data-testid="events-col-selector"]')
    await expect(colSelector).toBeVisible()

    for (const cols of [2, 3, 4, 5, 6]) {
      const colBtn = page.locator(`[data-testid="btn-cols-${cols}"]`)
      await expect(colBtn).toBeVisible()
      await colBtn.click()
      await expect(grid).toHaveClass(new RegExp(`cols-${cols}`))
    }
  })

  test('Central de Eventos: Motor de Comparação de Eventos (Seleção Múltipla e Modal Comparativo)', async ({ page }) => {
    const btnToggleCompare = page.locator('[data-testid="btn-toggle-compare-mode"]')
    await expect(btnToggleCompare).toBeVisible()

    // Ativa o modo de comparação
    await btnToggleCompare.click()
    const banner = page.locator('[data-testid="events-compare-banner"]')
    await expect(banner).toBeVisible()

    // O botão de executar deve estar desabilitado com menos de 2 selecionados
    const btnExecuteCompare = page.locator('[data-testid="btn-execute-compare"]')
    await expect(btnExecuteCompare).toBeDisabled()

    // Seleciona 2 eventos pelos checkboxes
    const checkboxes = page.locator('.event-compare-checkbox-wrap')
    await expect(checkboxes.first()).toBeVisible()

    await checkboxes.nth(0).click()
    await checkboxes.nth(1).click()

    // Agora o botão de execução de comparação deve estar habilitado
    await expect(btnExecuteCompare).toBeEnabled()
    await btnExecuteCompare.click()

    // Valida abertura do Modal do Comparador de Eventos
    const modal = page.locator('[data-testid="event-comparator-modal"]')
    await expect(modal).toBeVisible({ timeout: 10_000 })
    await expect(modal).toContainText('Comparador Comercial de Eventos')
    await expect(modal).toContainText('Receita Bruta Total')
    await expect(modal).toContainText('Ingressos Vendidos')
    await expect(modal).toContainText('Estoque Disponível')
    await expect(modal).toContainText('Taxa de Ocupação')

    // Fecha o modal
    const btnClose = modal.locator('[data-testid="btn-close-comparator"]')
    await btnClose.click()
    await expect(modal).not.toBeVisible()

    // Cancela o modo de comparação
    const btnCancel = page.locator('[data-testid="btn-cancel-compare"]')
    await btnCancel.click()
    await expect(banner).not.toBeVisible()
  })

  test('Painel Comercial do Evento: KPIs, Gráficos SVG, Sub-abas e Drill-down para Investigação 360', async ({ page }) => {
    // 1. Abre o Painel Comercial do Evento pelo botão "Painel do evento" (Settings2) do primeiro card
    const firstCard = page.locator('[data-testid="event-card"]').first()
    await expect(firstCard).toBeVisible({ timeout: 15_000 })

    const btnDashboard = firstCard.locator('button[title="Painel do evento"]')
    await expect(btnDashboard).toBeVisible()
    await btnDashboard.click()

    // 2. Valida carregamento do Painel Comercial
    const dashboard = page.locator('[data-testid="event-commercial-dashboard"]')
    await expect(dashboard).toBeVisible({ timeout: 15_000 })

    // 3. Valida Sub-abas e Cabeçalho Executivo
    const subtabs = page.locator('[data-testid="event-subtabs"]')
    await expect(subtabs).toBeVisible()
    await expect(subtabs).toContainText('Visão Geral')
    await expect(subtabs).toContainText('Vendas')
    await expect(subtabs).toContainText('Ingressos')
    await expect(subtabs).toContainText('Financeiro')
    await expect(subtabs).toContainText('Público')
    await expect(subtabs).toContainText('Marketing')
    await expect(subtabs).toContainText('Configurações')

    // 4. Valida os 5 KPIs Oficiais Coloridos
    const kpis = page.locator('[data-testid="commercial-kpis"]')
    await expect(kpis).toBeVisible()
    await expect(page.locator('[data-testid="kpi-revenue"]')).toContainText('Receita Total')
    await expect(page.locator('[data-testid="kpi-sold"]')).toContainText('Ingressos Vendidos')
    await expect(page.locator('[data-testid="kpi-available"]')).toContainText('Disponíveis')
    await expect(page.locator('[data-testid="kpi-courtesy"]')).toContainText('Cortesias')
    await expect(page.locator('[data-testid="kpi-occupancy"]')).toContainText('Ocupação')

    // 5. Valida Gráficos SVG Modernos
    await expect(page.locator('[data-testid="card-sales-evolution"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-sales-velocity"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-payment-methods"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-ticket-types"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-occupancy-gauge"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-weekday-distribution"]')).toBeVisible()

    // 6. Valida Drill-down de Investigação 360° em Últimas Transações
    const recentTx = page.locator('[data-testid="card-recent-transactions"]')
    await expect(recentTx).toBeVisible()

    const txRow = recentTx.locator('tbody tr').first()
    await expect(txRow).toBeVisible()
    await txRow.click()

    // Deve abrir o hub de investigação 360° do pedido
    const orderHub = page.locator('[data-testid="order-360-investigation-hub"]')
    await expect(orderHub).toBeVisible({ timeout: 15_000 })
    await expect(orderHub).toContainText('Jornada Operacional 360°')

    // Clica em "Voltar ao painel do evento"
    const btnBack = page.locator('[data-testid="btn-order-return"]')
    await expect(btnBack).toBeVisible()
    await btnBack.click()

    // Retorna para o Painel Comercial
    await expect(dashboard).toBeVisible({ timeout: 15_000 })

    // 7. Valida botão de transição para o Event OS [Acessar Event OS →]
    const btnAccessEventOS = page.locator('[data-testid="btn-access-event-os"]')
    await expect(btnAccessEventOS).toBeVisible()
    await btnAccessEventOS.click()

    // Deve abrir o Cockpit 360 do Event OS
    await expect(page.locator('[data-testid="cockpit-360-container"]')).toBeVisible({ timeout: 15_000 })
  })
})
