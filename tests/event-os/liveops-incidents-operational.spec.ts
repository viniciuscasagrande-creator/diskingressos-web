import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.16.5 & 26.16.6 · Live Operations e Incident Center Operacional', () => {
  test('abre Live Operations, valida KPIs, fluxo em tempo real e portões', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // Navegar para Live Operations
    const navLiveOps = page.getByText('Live Operations', { exact: true }).first()
    await expect(navLiveOps).toBeVisible({ timeout: 10_000 })
    await navLiveOps.click()

    // Valida container e título operacional
    await expect(page.getByTestId('live-operations-operational')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Live Operations Operacional')).toBeVisible()

    // Valida grid de KPIs
    await expect(page.getByTestId('liveops-kpis')).toBeVisible()
    await expect(page.getByText('Público presente agora')).toBeVisible()
    await expect(page.getByText('Ritmo de entrada')).toBeVisible()

    // Valida fluxo e portões
    await expect(page.getByTestId('liveops-flow-section')).toBeVisible()
    await expect(page.getByTestId('liveops-gates-panel')).toBeVisible()
    await expect(page.getByTestId('liveops-devices-panel')).toBeVisible()
    await expect(page.getByTestId('liveops-rejections-section')).toBeVisible()
  })

  test('abre Incident Center, valida KPIs, filtros, modal de novo incidente e drawer', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // Navegar para Incident Center
    const navIncidents = page.getByText('Incident Center', { exact: true }).first()
    await expect(navIncidents).toBeVisible({ timeout: 10_000 })
    await navIncidents.click()

    // Valida container e título operacional
    await expect(page.getByTestId('incident-center-operational')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Incident Center Operacional')).toBeVisible()

    // Valida KPIs
    await expect(page.getByTestId('incidents-kpis')).toBeVisible()
    await expect(page.getByText('Total em Aberto')).toBeVisible()

    // Valida busca e abas
    await expect(page.getByTestId('incidents-filters')).toBeVisible()
    await expect(page.getByTestId('tab-todos')).toBeVisible()
    await expect(page.getByTestId('tab-abertos')).toBeVisible()

    // Abre modal de Novo Incidente
    const btnNew = page.getByTestId('btn-new-incident')
    await expect(btnNew).toBeVisible()
    await btnNew.click()
    await expect(page.getByTestId('new-incident-modal')).toBeVisible()

    // Preenche formulário
    await page.getByTestId('new-incident-title').fill('Teste Operacional de Incidente')
    await page.getByTestId('btn-submit-incident').click()

    // Valida que o modal fecha
    await expect(page.getByTestId('new-incident-modal')).toBeHidden({ timeout: 10_000 })

    // Valida tabela e abre detalhes de um incidente
    const detailBtn = page.locator('[data-testid^="btn-details-"]').first()
    if (await detailBtn.isVisible().catch(() => false)) {
      await detailBtn.click()
      await expect(page.getByTestId('incident-drawer')).toBeVisible()
      await expect(page.getByTestId('drawer-nav-liveops')).toBeVisible()
      await page.getByTestId('drawer-close-btn').click()
      await expect(page.getByTestId('incident-drawer')).toBeHidden()
    }
  })
})
