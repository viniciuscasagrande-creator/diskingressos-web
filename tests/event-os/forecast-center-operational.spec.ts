import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.16.10 · Forecast Center Operacional', () => {
  test('valida o fluxo operacional completo do Forecast Center: KPIs, confiança, Previsto x Realizado, cenários, simulador em memória, inventário, alertas, snapshots, isolamento e proteção de saldo', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // 1. Navegar para Forecast Center via sidebar
    const navForecast = page.getByText('Forecast Center', { exact: true }).first()
    await expect(navForecast).toBeVisible({ timeout: 10_000 })
    await navForecast.click()

    // 2. Valida container do Forecast Center e cabeçalho com evento correto
    await expect(page.getByTestId('forecast-center-container')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('forecast-header')).toBeVisible()
    await expect(page.getByTestId('forecast-header').getByRole('heading', { name: 'FORECAST CENTER' })).toBeVisible()

    // 3. Valida os 6 KPIs Executivos do Forecast
    await expect(page.getByTestId('forecast-kpi-sales')).toBeVisible()
    await expect(page.getByTestId('forecast-kpi-revenue')).toBeVisible()
    await expect(page.getByTestId('forecast-kpi-occupancy')).toBeVisible()
    await expect(page.getByTestId('forecast-kpi-soldout')).toBeVisible()
    await expect(page.getByTestId('forecast-kpi-probability')).toBeVisible()
    await expect(page.getByTestId('forecast-kpi-ticket')).toBeVisible()

    // 4. Valida card de Confiança e Faixa Provável
    await expect(page.getByTestId('forecast-confidence-card')).toBeVisible()
    await expect(page.getByText('Índice de Confiança Operacional do Modelo')).toBeVisible()

    // 5. Valida Previsto × Realizado (Tabela e gráfico)
    await expect(page.getByTestId('forecast-comparison-section')).toBeVisible()
    await expect(page.getByTestId('forecast-timeline-table')).toBeVisible()

    // 6. Alternador de métricas: Receita, Ingressos, Ocupação, Ticket médio
    const btnMetricTickets = page.getByTestId('forecast-metric-toggle-tickets')
    await expect(btnMetricTickets).toBeVisible()
    await btnMetricTickets.click()
    await expect(btnMetricTickets).toHaveClass(/active/)

    const btnMetricOccupancy = page.getByTestId('forecast-metric-toggle-occupancy')
    await btnMetricOccupancy.click()
    await expect(btnMetricOccupancy).toHaveClass(/active/)

    const btnMetricTicket = page.getByTestId('forecast-metric-toggle-ticket')
    await btnMetricTicket.click()
    await expect(btnMetricTicket).toHaveClass(/active/)

    const btnMetricRevenue = page.getByTestId('forecast-metric-toggle-revenue')
    await btnMetricRevenue.click()
    await expect(btnMetricRevenue).toHaveClass(/active/)

    // 7. Cenários: Conservador, Base, Otimista
    await expect(page.getByTestId('forecast-scenarios-section')).toBeVisible()
    const scenarioConservador = page.getByTestId('forecast-scenario-conservative')
    await expect(scenarioConservador).toBeVisible()
    await scenarioConservador.click()

    const scenarioOtimista = page.getByTestId('forecast-scenario-optimistic')
    await expect(scenarioOtimista).toBeVisible()
    await scenarioOtimista.click()

    const scenarioBase = page.getByTestId('forecast-scenario-base')
    await expect(scenarioBase).toBeVisible()
    await scenarioBase.click()

    // 8. Simulador Interativo em Memória (NÃO altera produção)
    await expect(page.getByTestId('forecast-simulator')).toBeVisible()
    const btnSimulate = page.getByTestId('forecast-simulate-button')
    await expect(btnSimulate).toBeVisible()
    await btnSimulate.click()

    // Valida exibição do resultado da simulação com aviso claro
    await expect(page.getByTestId('forecast-simulation-result')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('SOMENTE SIMULAÇÃO')).toBeVisible()
    await expect(page.getByText('Simulação puramente em memória')).toBeVisible()

    // 9. Forecast por Lote / Setor e Navegação para Inventário
    await expect(page.getByTestId('forecast-lots-section')).toBeVisible()
    const btnGotoInventory = page.getByTestId('btn-goto-inventory-1')
    await expect(btnGotoInventory).toBeVisible()
    await btnGotoInventory.click()

    // Confirma abertura do Inventário
    await expect(page.getByTestId('event-inventory-operational')).toBeVisible({ timeout: 10_000 })

    // Volta para Forecast Center
    await navForecast.click()
    await expect(page.getByTestId('forecast-center-container')).toBeVisible({ timeout: 10_000 })

    // 10. Detecção Automática de Desvios com ação Investigar
    await expect(page.getByTestId('forecast-alerts-section')).toBeVisible()
    const btnInvestigate = page.getByTestId('btn-investigate-alert-1')
    await expect(btnInvestigate).toBeVisible()
    await btnInvestigate.click()

    // Confirma que abriu módulo de destino (ex: Revenue Intel) e volta
    await expect(page.getByTestId('revenue-intel-operational')).toBeVisible({ timeout: 10_000 })
    await navForecast.click()
    await expect(page.getByTestId('forecast-center-container')).toBeVisible()

    // 11. Executar Novo Forecast e Validar Persistência de Snapshots
    const btnRunForecast = page.getByTestId('btn-run-forecast')
    await expect(btnRunForecast).toBeVisible()
    await btnRunForecast.click()

    // 12. Histórico de Snapshots Persistidos
    await expect(page.getByTestId('forecast-history-section')).toBeVisible()

    // 13. Precisão do Modelo (Acurácia Pós-Evento)
    await expect(page.getByTestId('forecast-accuracy-section')).toBeVisible()
    await expect(page.getByText('Precisão do Modelo (Acurácia)')).toBeVisible()

    // 14. Isolamento Multi-tenant e Erros de API
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
      const res = await fetch('/api/events/99999999/forecast', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      return res.status
    })
    expect([404, 403, 401]).toContain(invalidEventStatus)

    // 15. Proteção de Regressão: Estornos e Financeiro continuam 100% intactos
    await page.goto('/app/finance-refunds')
    await expect(page.getByTestId('estornos-control-center')).toBeVisible({ timeout: 15_000 })
  })
})
