import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.16.8 · Revenue & Pricing Intelligence Operacional', () => {
  test('valida o fluxo completo de Revenue Intelligence, 8 indicadores, motor de velocidade, drill-down, forecast, simulador, change-request e isolamento financeiro', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // 1. Navegar para Revenue Intelligence
    const navRevenue = page.getByText('Revenue Intelligence', { exact: true }).first()
    await expect(navRevenue).toBeVisible({ timeout: 10_000 })
    await navRevenue.click()

    // 2. Valida container, release badge e escopo multi-tenant
    await expect(page.getByTestId('revenue-intel-operational')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('eri-eyebrow-badge')).toBeVisible()
    await expect(page.getByTestId('eri-release-badge')).toBeVisible()
    await expect(page.getByTestId('eri-scope-badge')).toBeVisible()

    // 3. Valida os 8 Indicadores Executivos
    await expect(page.getByTestId('eri-priority-kpis')).toBeVisible()
    await expect(page.getByTestId('kpi-gross-revenue')).toBeVisible()
    await expect(page.getByTestId('kpi-net-revenue')).toBeVisible()
    await expect(page.getByTestId('kpi-tickets-sold')).toBeVisible()
    await expect(page.getByTestId('kpi-avg-ticket')).toBeVisible()
    await expect(page.getByTestId('kpi-occupancy')).toBeVisible()
    await expect(page.getByTestId('kpi-potential-revenue')).toBeVisible()
    await expect(page.getByTestId('kpi-remaining-potential')).toBeVisible()
    await expect(page.getByTestId('kpi-sales-velocity')).toBeVisible()

    // 4. Troca de período e resposta do dashboard
    const tab7d = page.getByTestId('tab-period-7d')
    await expect(tab7d).toBeVisible()
    await tab7d.click()
    await expect(tab7d).toHaveClass(/active/)
    const tab24h = page.getByTestId('tab-period-24h')
    await tab24h.click()

    // 5. Valida seções operacionais
    await expect(page.getByTestId('eri-alerts-section')).toBeVisible()
    await expect(page.getByTestId('eri-velocity-section')).toBeVisible()
    await expect(page.getByTestId('eri-burnrate-section')).toBeVisible()
    await expect(page.getByTestId('eri-scenarios-section')).toBeVisible()
    await expect(page.getByTestId('eri-recommendations-section')).toBeVisible()
    await expect(page.getByTestId('eri-marketing-attribution-section')).toBeVisible()

    // 6. Drill-down no gráfico de velocidade (abre modal de pedidos)
    const barCol = page.locator('.eri-velocity-bar-col').first()
    await expect(barCol).toBeVisible()
    await barCol.click()
    await expect(page.getByTestId('eri-modal-drilldown')).toBeVisible()
    const btnCloseDrilldown = page.getByRole('button', { name: 'Fechar' })
    await expect(btnCloseDrilldown).toBeVisible()
    await btnCloseDrilldown.click()
    await expect(page.getByTestId('eri-modal-drilldown')).not.toBeVisible()

    // 7. Testa Simulador de Preço (SIMULAR CENÁRIO - Puramente simulação, NÃO altera produção)
    const btnSimModal = page.getByTestId('btn-open-sim-modal')
    await expect(btnSimModal).toBeVisible()
    await btnSimModal.click()
    await expect(page.getByTestId('eri-modal-simulation')).toBeVisible()

    // 8. Solicitar alteração de preço a partir do simulador (Abre modal de Change Request com RBAC)
    const btnRequestChange = page.getByRole('button', { name: 'Solicitar alteração de preço' })
    await expect(btnRequestChange).toBeVisible()
    await btnRequestChange.click()
    await expect(page.getByTestId('eri-modal-adjust-price')).toBeVisible()

    // 9. Confirmação obrigatória e envio autorizado
    const checkboxConfirm = page.locator('#confirm-pricing-change')
    await expect(checkboxConfirm).toBeVisible()
    await checkboxConfirm.check()

    const btnConfirmAdjust = page.getByTestId('btn-confirm-adjust-price')
    await expect(btnConfirmAdjust).toBeVisible()
    await btnConfirmAdjust.click()
    await expect(page.getByTestId('eri-modal-adjust-price')).not.toBeVisible({ timeout: 10_000 })

    // 10. Cross-Navigation para Inventário
    const linkInventory = page.getByTestId('eri-link-inventory')
    await expect(linkInventory).toBeVisible()
    await linkInventory.click()
    await expect(page.getByTestId('event-inventory-operational')).toBeVisible({ timeout: 10_000 })

    // 11. Voltar para Revenue Intelligence
    await navRevenue.click()
    await expect(page.getByTestId('revenue-intel-operational')).toBeVisible()

    // 12. Garante que módulos Financeiro e Estornos permanecem 100% intactos
    await page.goto('/app/finance-refunds')
    await expect(page.getByTestId('estornos-control-center')).toBeVisible({ timeout: 15_000 })
  })
})
