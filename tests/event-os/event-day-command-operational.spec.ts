import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.16.7 · Event Day Command Operacional', () => {
  test('abre Event Day Command, valida 8 KPIs prioritários, seções operacionais, Modo TV e fluxo War Room', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // Navegar para Event Day Command
    const navDayCommand = page.getByText('Event Day Command', { exact: true }).first()
    await expect(navDayCommand).toBeVisible({ timeout: 10_000 })
    await navDayCommand.click()

    // Valida container e título operacional
    await expect(page.getByTestId('event-day-command-operational')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('edc-eyebrow-badge')).toBeVisible()

    // Valida 8 KPIs prioritários
    await expect(page.getByTestId('edc-priority-kpis')).toBeVisible()
    await expect(page.getByTestId('kpi-present-now')).toBeVisible()
    await expect(page.getByTestId('kpi-checkins')).toBeVisible()
    await expect(page.getByTestId('kpi-occupancy')).toBeVisible()
    await expect(page.getByTestId('kpi-flow-rate')).toBeVisible()
    await expect(page.getByTestId('kpi-sales-today')).toBeVisible()
    await expect(page.getByTestId('kpi-unused-tickets')).toBeVisible()
    await expect(page.getByTestId('kpi-rejections')).toBeVisible()
    await expect(page.getByTestId('kpi-active-incidents')).toBeVisible()

    // Valida seções operacionais
    await expect(page.getByTestId('edc-gates-section')).toBeVisible()
    await expect(page.getByTestId('edc-flow-section')).toBeVisible()
    await expect(page.getByTestId('edc-sectors-section')).toBeVisible()
    await expect(page.getByTestId('edc-sales-section')).toBeVisible()
    await expect(page.getByTestId('edc-risk-section')).toBeVisible()
    await expect(page.getByTestId('edc-support-section')).toBeVisible()
    await expect(page.getByTestId('edc-incidents-section')).toBeVisible()
    await expect(page.getByTestId('edc-alerts-section')).toBeVisible()
    await expect(page.getByTestId('edc-activity-stream')).toBeVisible()

    // Testa Modo TV (War Room)
    const btnTv = page.getByTestId('btn-toggle-tv')
    await expect(btnTv).toBeVisible()
    await btnTv.click()
    const exitTv = page.getByTestId('btn-exit-tv-mode')
    await expect(exitTv).toBeVisible()
    await exitTv.click()
    await expect(page.getByTestId('btn-toggle-tv')).toBeVisible()

    // Testa menu Ações
    const btnActions = page.getByTestId('btn-edc-actions-dropdown')
    await expect(btnActions).toBeVisible()
    await btnActions.click()
    await expect(page.getByTestId('edc-actions-menu')).toBeVisible()
    await btnActions.click()

    // Fluxo War Room: Clicar no portão leva ao Live Operations
    const linkLiveOps = page.getByTestId('edc-link-liveops')
    await expect(linkLiveOps).toBeVisible()
    await linkLiveOps.click()
    await expect(page.getByTestId('live-operations-operational')).toBeVisible({ timeout: 10_000 })

    // Voltar ao Event Day Command
    await navDayCommand.click()
    await expect(page.getByTestId('event-day-command-operational')).toBeVisible()

    // Clicar em Ver Inventário
    const linkInv = page.getByTestId('edc-link-inventory')
    await expect(linkInv).toBeVisible()
    await linkInv.click()
    await expect(page.getByTestId('event-inventory-operational')).toBeVisible({ timeout: 10_000 })
  })
})
