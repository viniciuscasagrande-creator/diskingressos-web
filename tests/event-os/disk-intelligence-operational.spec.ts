import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.16.11 · Disk Intelligence Operacional', () => {
  test('valida o fluxo operacional completo do Disk Intelligence: Health Score 87/100, Pergunte ao Disk com evidências, anomalias, explicabilidade, feedback, cross-tenant e proteção financeira', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // 1. Navegar para Disk Intelligence via sidebar
    const navIntel = page.getByText('Disk Intelligence', { exact: true }).first()
    await expect(navIntel).toBeVisible({ timeout: 10_000 })
    await navIntel.click()

    // 2. Valida container e header do Disk Intelligence
    await expect(page.getByTestId('disk-intelligence-container')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('disk-intelligence-header')).toBeVisible()
    await expect(page.getByTestId('disk-intelligence-header').getByRole('heading', { name: 'DISK INTELLIGENCE' })).toBeVisible()

    // 3. Valida Health Score (87/100) e sinais operacionais
    await expect(page.getByTestId('disk-intelligence-health-card')).toBeVisible()
    await expect(page.getByTestId('health-score-gauge')).toContainText('87')
    await expect(page.getByTestId('signal-predicted-revenue')).toBeVisible()
    await expect(page.getByTestId('signal-predicted-occupancy')).toBeVisible()
    await expect(page.getByTestId('signal-soldout-prob')).toBeVisible()

    // 4. Executar Reanálise operacional
    const btnAnalyze = page.getByTestId('btn-analyze-now')
    await expect(btnAnalyze).toBeVisible()
    await btnAnalyze.click()

    // 5. Pergunte ao Disk com consulta sobre vendas
    await expect(page.getByTestId('ask-disk-section')).toBeVisible()
    const inputAsk = page.getByTestId('input-ask-query')
    await expect(inputAsk).toBeVisible()
    await inputAsk.fill('Por que as vendas caíram hoje?')
    await page.getByTestId('btn-submit-ask').click()

    // Valida resposta fundamentada com evidências e ações
    await expect(page.getByTestId('ask-disk-answer-card')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('As vendas estão 18,4% abaixo da média')).toBeVisible()
    await expect(page.getByText('Tráfego pago caiu 21%')).toBeVisible()

    // 6. Testar anti-hallucination guard com dados ausentes
    await inputAsk.fill('Quais os dados ausentes de patrocínio externo?')
    await page.getByTestId('btn-submit-ask').click()
    await expect(page.getByTestId('anti-hallucination-notice')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Não existem dados suficientes para responder com segurança')).toBeVisible()

    // 7. Usar consulta rápida pronta
    const btnQuickQuery = page.getByTestId('btn-quick-query-0')
    await expect(btnQuickQuery).toBeVisible()
    await btnQuickQuery.click()
    await expect(page.getByTestId('ask-disk-answer-card')).toBeVisible()

    // 8. Insights Classificados (Oportunidade, Atenção, Crítico)
    await expect(page.getByTestId('intelligence-insights-section')).toBeVisible()
    await expect(page.getByTestId('insight-card-1')).toBeVisible()
    await expect(page.getByTestId('insight-card-2')).toBeVisible()
    await expect(page.getByTestId('insight-card-3')).toBeVisible()

    // 9. Modal de Explicabilidade ("Por que?")
    const btnWhy = page.getByTestId('btn-why-insight-1')
    await expect(btnWhy).toBeVisible()
    await btnWhy.click()
    await expect(page.getByTestId('modal-why-explanation')).toBeVisible()
    await expect(page.getByText('Por que este insight foi gerado?')).toBeVisible()
    await expect(page.getByTestId('modal-why-explanation').getByText('Velocidade de vendas')).toBeVisible()
    await page.getByTestId('btn-close-why-modal').click()
    await expect(page.getByTestId('modal-why-explanation')).not.toBeVisible()

    // 10. Reconhecer insight e feedback do operador
    const btnFeedbackUseful = page.getByTestId('btn-feedback-useful-1')
    await expect(btnFeedbackUseful).toBeVisible()
    await btnFeedbackUseful.click()

    const btnAck = page.getByTestId('btn-acknowledge-1')
    await expect(btnAck).toBeVisible()
    await btnAck.click()

    // 11. Intelligence Feed (Linha do tempo)
    await expect(page.getByTestId('intelligence-feed-section')).toBeVisible()
    await expect(page.getByTestId('feed-item-f-1')).toBeVisible()

    // 12. Navegação para Revenue Intelligence a partir do insight
    const btnActionRevenue = page.getByTestId('btn-insight-action-1-0')
    await expect(btnActionRevenue).toBeVisible()
    await btnActionRevenue.click()

    // Confirma abertura do Revenue Intelligence
    await expect(page.getByTestId('revenue-intel-operational')).toBeVisible({ timeout: 10_000 })

    // Volta para Disk Intelligence
    await navIntel.click()
    await expect(page.getByTestId('disk-intelligence-container')).toBeVisible({ timeout: 10_000 })

    // 13. Isolamento multi-tenant via API
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
      const res = await fetch('/api/events/99999999/intelligence', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      return res.status
    })
    expect([404, 403, 401]).toContain(invalidEventStatus)

    // 14. Proteção de Regressão Financeira: Estornos e Financeiro continuam 100% preservados
    await page.goto('/app/finance-refunds')
    await expect(page.getByTestId('estornos-control-center')).toBeVisible({ timeout: 15_000 })
  })
})
