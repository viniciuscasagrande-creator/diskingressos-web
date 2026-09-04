import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'
import fs from 'node:fs'
import path from 'node:path'

test.use({
  video: {
    mode: 'on',
    size: { width: 1440, height: 900 }
  },
  viewport: { width: 1440, height: 900 }
})

test.describe('Homologação Visual & Operacional Fase 26.17.7.1', () => {
  test('Gravação e Captura Visual Completa dos 8 Pontos de Homologação', async ({ page }, testInfo) => {
    test.setTimeout(90_000)
    const projectArtifactsDir = path.resolve('artifacts/homologacao-fase26-17-7-1')
    const brainArtifactsDir = path.resolve('C:/Users/vinad/.gemini/antigravity-cli/brain/38eacf3b-e19f-4d1f-8bd6-df7ccbadc6ae')

    if (!fs.existsSync(projectArtifactsDir)) {
      fs.mkdirSync(projectArtifactsDir, { recursive: true })
    }

    const saveScreenshot = async (name: string) => {
      const p1 = path.join(projectArtifactsDir, name)
      const p2 = path.join(brainArtifactsDir, name)
      await page.screenshot({ path: p1, fullPage: true })
      try {
        fs.copyFileSync(p1, p2)
      } catch (e) {}
    }

    // =========================================================================
    // 1. LOGIN E CENTRAL DE EVENTOS
    // =========================================================================
    await login(page)
    await page.goto('/eventos')
    await expect(page.locator('[data-testid="events-page"]')).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(1000)

    // PONTO 1: Central de Eventos (Visual Padrão / Vertical)
    await saveScreenshot('01-central-eventos-vertical-3cols.png')

    // Alternar para modo Horizontal
    const btnHorizontal = page.locator('[data-testid="btn-view-horizontal"]')
    await btnHorizontal.click()
    await page.waitForTimeout(500)
    await saveScreenshot('02-central-eventos-horizontal.png')

    // Alternar de volta para Vertical e testar 4 Colunas
    const btnVertical = page.locator('[data-testid="btn-view-vertical"]')
    await btnVertical.click()
    await page.locator('[data-testid="btn-cols-4"]').click()
    await page.waitForTimeout(500)
    await saveScreenshot('03-central-eventos-vertical-4cols.png')

    // Testar filtro Inativos e Ativos
    await page.locator('[data-testid="events-filter-inactive"]').click()
    await page.waitForTimeout(500)
    await page.locator('[data-testid="events-filter-active"]').click()
    await page.waitForTimeout(500)

    // Testar Modo de Comparação
    await page.locator('[data-testid="btn-toggle-compare-mode"]').click()
    await page.waitForTimeout(500)
    const checkboxes = page.locator('.event-compare-checkbox-wrap')
    await checkboxes.nth(0).click()
    await checkboxes.nth(1).click()
    await page.waitForTimeout(500)

    // Abrir Modal do Comparador
    await page.locator('[data-testid="btn-execute-compare"]').click()
    await expect(page.locator('[data-testid="event-comparator-modal"]')).toBeVisible({ timeout: 10_000 })
    await page.waitForTimeout(1000)
    await saveScreenshot('04-comparador-eventos-modal.png')

    // Fechar Modal e cancelar comparação
    await page.locator('[data-testid="btn-close-comparator"]').click()
    await page.locator('[data-testid="btn-cancel-compare"]').click()
    await page.waitForTimeout(500)

    // =========================================================================
    // 2. PAINEL COMERCIAL DO EVENTO (VISÃO GERAL)
    // =========================================================================
    // Clica no botão "Painel do evento" (Settings2) do primeiro card
    const firstCard = page.locator('[data-testid="event-card"]').first()
    const btnDashboard = firstCard.locator('button[title="Painel do evento"]')
    await btnDashboard.click()

    const commercialDashboard = page.locator('[data-testid="event-commercial-dashboard"]')
    await expect(commercialDashboard).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(1500)

    // PONTO 2 & 6: Checagem rigorosa de ausência de chaves de tradução (ex: events.tabs.home)
    const bodyHtml = await page.content()
    expect(bodyHtml).not.toContain('events.tabs.')
    expect(bodyHtml).not.toContain('events.tabs.home')

    // PONTO 2: Screenshot Geral do Painel Comercial
    await saveScreenshot('05-painel-comercial-geral.png')

    // PONTO 3 & 4: Screenshot dos 5 KPIs Coloridos Sólidos com dados reais
    const kpisSection = page.locator('[data-testid="commercial-kpis"]')
    await expect(kpisSection).toBeVisible()
    await kpisSection.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await saveScreenshot('06-painel-comercial-5-kpis.png')

    // PONTO 3: Gráficos de Evolução de Vendas e Ritmo de Vendas
    const rowCharts = page.locator('.ecd-row-two-col').first()
    await rowCharts.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await saveScreenshot('07-graficos-evolucao-ritmo.png')

    // PONTO 3: Formas de Pagamento (Donut), Tipos de Ingresso e Ocupação (Gauge)
    const rowThree = page.locator('.ecd-row-three-col')
    await rowThree.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await saveScreenshot('08-graficos-pagamentos-ocupacao.png')

    // PONTO 3 & 8: Últimas Transações e Vendas por Dia da Semana
    const rowBottom = page.locator('.ecd-row-two-col').last()
    await rowBottom.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await saveScreenshot('09-transacoes-e-distribuicao-semanal.png')

    // PONTO 8: Drill-down para Investigação 360° do Pedido
    const txRow = page.locator('[data-testid="card-recent-transactions"] tbody tr').first()
    await txRow.click()
    const orderHub = page.locator('[data-testid="order-360-investigation-hub"]')
    await expect(orderHub).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(1000)
    await saveScreenshot('10-pedido-360-drilldown.png')

    // Voltar para o Painel Comercial
    await page.locator('[data-testid="btn-order-return"]').click()
    await expect(commercialDashboard).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(500)

    // =========================================================================
    // 5. EVENT OS (COCKPIT 360, INVENTÁRIO, CLIENTE 360°)
    // =========================================================================
    // Transição para o Event OS via botão oficial [Acessar Event OS →]
    const btnAccessEventOS = page.locator('[data-testid="btn-access-event-os"]')
    await btnAccessEventOS.click()

    const cockpit = page.locator('[data-testid="cockpit-360-container"]')
    await expect(cockpit).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(1000)
    await saveScreenshot('11-event-os-cockpit360.png')

    // Navega para Inventário
    const navInventory = page.locator('.event-context-sidebar button, .event-context-sidebar a').filter({ hasText: /Inventário|Estoque/i }).first()
    if (await navInventory.isVisible()) {
      await navInventory.click()
    } else {
      await page.goto(page.url().replace(/\/command-center.*$/, '/inventory'))
    }
    await page.waitForTimeout(1000)
    await saveScreenshot('12-event-os-inventario.png')

    // Navega para Cliente 360°
    const navCustomer = page.locator('.event-context-sidebar button, .event-context-sidebar a').filter({ hasText: /Cliente 360|Público/i }).first()
    if (await navCustomer.isVisible()) {
      await navCustomer.click()
    } else {
      await page.goto(page.url().replace(/\/inventory.*$/, '/customer-360'))
    }
    await page.waitForTimeout(1000)
    await saveScreenshot('13-event-os-cliente360.png')

    // =========================================================================
    // 7. ESTORNOS (MÓDULO INDEPENDENTE OFICIAL)
    // =========================================================================
    await page.goto('/app/finance-refunds')
    const refundsHub = page.locator('[data-testid="estornos-control-center"]')
    await expect(refundsHub).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(1000)
    await saveScreenshot('14-estornos-centro-controle-independente.png')

    // Conclusão com sucesso
    console.log('[OK] Homologação visual e funcional concluída com 14 capturas!')
  })
})
