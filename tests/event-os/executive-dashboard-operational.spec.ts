import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.16.12 · Executive Dashboard Operacional', () => {
  test('valida o painel executivo consolidado com KPIs em tempo real, funil, canais, financeiro read-only, incidentes, modo apresentação, comparativo 2025 e proteção multi-tenant', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // 1. Navegar para Executive Dashboard via sidebar
    const navExecutive = page.getByText('Executive Dashboard', { exact: true }).first()
    await expect(navExecutive).toBeVisible({ timeout: 10_000 })
    await navExecutive.click()

    // 2. Valida container e header executivo
    await expect(page.getByTestId('executive-dashboard-container')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('executive-header')).toBeVisible()
    await expect(page.getByTestId('executive-title')).toContainText('Executive Dashboard')
    await expect(page.getByTestId('badge-live')).toContainText('AO VIVO')
    await expect(page.getByTestId('badge-health')).toContainText('Saúde: 87/100 ESTÁVEL')
    await expect(page.getByTestId('event-title-meta')).toBeVisible()

    // 3. Validação dos 8 KPIs de primeira linha
    await expect(page.getByTestId('executive-kpi-grid')).toBeVisible()
    await expect(page.getByTestId('kpi-gross-revenue')).toContainText('R$ 482.640,00')
    await expect(page.getByTestId('kpi-gross-revenue')).toContainText('+12.4%')

    await expect(page.getByTestId('kpi-net-revenue')).toContainText('R$ 431.870,00')
    await expect(page.getByTestId('kpi-net-revenue')).toContainText('+11.8%')

    await expect(page.getByTestId('kpi-tickets-sold')).toContainText('4.826')
    await expect(page.getByTestId('kpi-tickets-sold')).toContainText('+8.7%')

    await expect(page.getByTestId('kpi-average-ticket')).toContainText('R$ 100,01')
    await expect(page.getByTestId('kpi-average-ticket')).toContainText('+3.1%')

    await expect(page.getByTestId('kpi-occupancy')).toContainText('71.4%')
    await expect(page.getByTestId('kpi-occupancy')).toContainText('+6.2 p.p.')

    await expect(page.getByTestId('kpi-forecast-revenue')).toContainText('R$ 742.680,00')
    await expect(page.getByTestId('kpi-forecast-revenue')).toContainText('+4.7%')

    await expect(page.getByTestId('kpi-soldout-probability')).toContainText('78%')
    await expect(page.getByTestId('kpi-soldout-probability')).toContainText('+9 p.p.')

    await expect(page.getByTestId('kpi-health-score')).toContainText('87/100')
    await expect(page.getByTestId('kpi-health-score')).toContainText('Estável')

    // 4. Progresso Comercial (Realizado × Forecast × Meta)
    await expect(page.getByTestId('card-revenue-progress')).toBeVisible()
    await expect(page.getByTestId('card-revenue-progress')).toContainText('R$ 482.640,00')
    await expect(page.getByTestId('card-revenue-progress')).toContainText('R$ 742.680,00')
    await expect(page.getByTestId('card-revenue-progress')).toContainText('R$ 780.000,00')

    // 5. Funil de Conversão
    await expect(page.getByTestId('card-conversion-funnel')).toBeVisible()
    await expect(page.getByTestId('card-conversion-funnel')).toContainText('184.620')
    await expect(page.getByTestId('card-conversion-funnel')).toContainText('18.420')
    await expect(page.getByTestId('card-conversion-funnel')).toContainText('7.841')
    await expect(page.getByTestId('card-conversion-funnel')).toContainText('6.984')
    await expect(page.getByTestId('card-conversion-funnel')).toContainText('8.412')
    await expect(page.getByTestId('funnel-conversion-rate')).toContainText('3.78%')

    // 6. Desempenho por Canal
    await expect(page.getByTestId('card-channels-performance')).toBeVisible()
    await expect(page.getByTestId('card-channels-performance')).toContainText('Meta Ads')
    await expect(page.getByTestId('card-channels-performance')).toContainText('Google Ads')
    await expect(page.getByTestId('card-channels-performance')).toContainText('WhatsApp')
    await expect(page.getByTestId('card-channels-performance')).toContainText('7,8x')
    await expect(page.getByTestId('card-channels-performance')).toContainText('12,2x')

    // 7. Ocupação & Presença por Setor
    await expect(page.getByTestId('card-attendance-sectors')).toBeVisible()
    await expect(page.getByTestId('card-attendance-sectors')).toContainText('8.500')
    await expect(page.getByTestId('card-attendance-sectors')).toContainText('6.284')
    await expect(page.getByTestId('card-attendance-sectors')).toContainText('Pista')
    await expect(page.getByTestId('card-attendance-sectors')).toContainText('96%')
    await expect(page.getByTestId('card-attendance-sectors')).toContainText('VIP')
    await expect(page.getByTestId('card-attendance-sectors')).toContainText('81%')

    // 8. Financeiro Consolidado (Read-Only)
    await expect(page.getByTestId('card-finance-consolidated')).toBeVisible()
    await expect(page.getByTestId('card-finance-consolidated')).toContainText('R$ 482.640,00')
    await expect(page.getByTestId('card-finance-consolidated')).toContainText('R$ 50.770,00')
    await expect(page.getByTestId('card-finance-consolidated')).toContainText('R$ 431.870,00')
    await expect(page.getByTestId('card-finance-consolidated')).toContainText('R$ 184.320,00')
    await expect(page.getByTestId('card-finance-consolidated')).toContainText('R$ 247.550,00')
    await expect(page.getByTestId('card-finance-consolidated')).toContainText('R$ 198.400,00')
    await expect(page.getByTestId('card-finance-consolidated')).toContainText('R$ 8.420,00')
    await expect(page.getByTestId('card-finance-consolidated')).toContainText('R$ 2.140,00')

    // 9. Live Ops & Atendimento SAC
    await expect(page.getByTestId('card-liveops-support')).toBeVisible()
    await expect(page.getByTestId('card-liveops-support')).toContainText('6.284')
    await expect(page.getByTestId('card-liveops-support')).toContainText('186')
    await expect(page.getByTestId('card-liveops-support')).toContainText('7/8')
    await expect(page.getByTestId('card-liveops-support')).toContainText('31/34')
    await expect(page.getByTestId('card-liveops-support')).toContainText('41')
    await expect(page.getByTestId('card-liveops-support')).toContainText('92%')
    await expect(page.getByTestId('card-liveops-support')).toContainText('71')

    // 10. Risco & Incidentes com incidente prioritário
    await expect(page.getByTestId('card-risk-incidents')).toBeVisible()
    await expect(page.getByTestId('priority-incident-banner')).toBeVisible()
    await expect(page.getByTestId('priority-incident-banner')).toContainText('INC-00481')
    await expect(page.getByTestId('priority-incident-banner')).toContainText('CRÍTICO')
    await expect(page.getByTestId('priority-incident-banner')).toContainText('Falha de scanners — Portão C')

    // 11. Insights Executivos (Disk Intelligence)
    await expect(page.getByTestId('card-executive-insights')).toBeVisible()
    await expect(page.getByTestId('card-executive-insights')).toContainText('VIP deve esgotar antes do previsto.')

    // 12. Alternar Modo Apresentação / Modo TV
    const btnPresentation = page.getByTestId('btn-presentation-mode')
    await expect(btnPresentation).toBeVisible()
    await btnPresentation.click()
    await expect(page.getByTestId('executive-dashboard-container')).toHaveClass(/is-presentation/)
    await btnPresentation.click()
    await expect(page.getByTestId('executive-dashboard-container')).not.toHaveClass(/is-presentation/)

    // 13. Comparativo de Edições (Sunset 2026 × Sunset 2025)
    const btnComparison = page.getByTestId('btn-open-comparison')
    await expect(btnComparison).toBeVisible()
    await btnComparison.click()
    await expect(page.getByTestId('comparison-modal')).toBeVisible()
    await expect(page.getByTestId('comparison-modal')).toContainText('Comparativo de Edições')
    await expect(page.getByTestId('comparison-modal')).toContainText('Sunset 2026 (Atual)')
    await expect(page.getByTestId('comparison-modal')).toContainText('Sunset 2025')
    await expect(page.getByTestId('comparison-modal')).toContainText('+14,6%')
    await page.getByTestId('btn-close-comparison').click()
    await expect(page.getByTestId('comparison-modal')).not.toBeVisible()

    // 14. Exportação Executiva (PDF / Excel)
    await page.getByTestId('btn-export-pdf').click()
    await page.getByTestId('btn-export-excel').click()

    // 15. Isolamento multi-tenant via API
    const invalidEventStatus = await page.evaluate(async () => {
      let token = ''
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i)
        if (k && k.startsWith('disk_token')) token = sessionStorage.getItem(k) || ''
      }
      if (!token) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && k.startsWith('disk_token')) token = localStorage.getItem(k) || ''
        }
      }
      const res = await fetch('/api/events/99999999/executive-dashboard', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      return res.status
    })
    expect([404, 403, 401]).toContain(invalidEventStatus)

    // 16. Proteção de Regressão Financeira: Estornos continuam 100% preservados
    await page.goto('/app/finance-refunds')
    await expect(page.getByTestId('estornos-control-center')).toBeVisible({ timeout: 15_000 })
  })
})
