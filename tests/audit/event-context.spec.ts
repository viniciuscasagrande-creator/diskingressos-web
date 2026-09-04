import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.1 · Auditoria Automática: Event Context Preservation', () => {
  test('assegura que a transição entre módulos operacionais preserva o eventId selecionado sem deriva', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })

    // Selecionar primeiro evento
    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // 1. Cockpit 360
    await expect(page.getByTestId('cockpit-360-container')).toBeVisible({ timeout: 15_000 })

    // 2. Inventário
    const navInventory = page.getByText('Inventário', { exact: true }).first()
    await expect(navInventory).toBeVisible()
    await navInventory.click()
    await expect(page.getByTestId('event-inventory-operational')).toBeVisible({ timeout: 15_000 })

    // 3. Customer 360
    const navCustomer = page.getByText('Customer 360', { exact: true }).first()
    await expect(navCustomer).toBeVisible()
    await navCustomer.click()
    await expect(page.getByTestId('customer360-operational')).toBeVisible({ timeout: 15_000 })

    // 4. Live Operations
    const navLiveOps = page.getByText('Live Operations', { exact: true }).first()
    await expect(navLiveOps).toBeVisible()
    await navLiveOps.click()
    await expect(page.getByTestId('live-operations-operational')).toBeVisible({ timeout: 15_000 })

    // 5. Incident Center
    const navIncidents = page.getByText('Incident Center', { exact: true }).first()
    await expect(navIncidents).toBeVisible()
    await navIncidents.click()
    await expect(page.getByTestId('incident-center-operational')).toBeVisible({ timeout: 15_000 })

    // 6. Day Command
    const navDayCommand = page.getByText('Event Day Command', { exact: true }).first()
    await expect(navDayCommand).toBeVisible()
    await navDayCommand.click()
    await expect(page.getByTestId('event-day-command-operational')).toBeVisible({ timeout: 15_000 })

    // 7. Revenue Intelligence
    const navRevenue = page.getByText('Revenue Intelligence', { exact: true }).first()
    await expect(navRevenue).toBeVisible()
    await navRevenue.click()
    await expect(page.getByTestId('revenue-intel-operational')).toBeVisible({ timeout: 15_000 })

    // 8. Forecast Center
    const navForecast = page.getByText('Forecast Center', { exact: true }).first()
    await expect(navForecast).toBeVisible()
    await navForecast.click()
    await expect(page.getByTestId('forecast-center-container')).toBeVisible({ timeout: 15_000 })

    // 9. Disk Intelligence
    const navIntel = page.getByText('Disk Intelligence', { exact: true }).first()
    await expect(navIntel).toBeVisible()
    await navIntel.click()
    await expect(page.getByTestId('disk-intelligence-container')).toBeVisible({ timeout: 10_000 })

    // 10. Executive Dashboard
    const navExecutive = page.getByText('Executive Dashboard', { exact: true }).first()
    await expect(navExecutive).toBeVisible()
    await navExecutive.click()
    await expect(page.getByTestId('executive-dashboard-container')).toBeVisible({ timeout: 10_000 })
  })
})
