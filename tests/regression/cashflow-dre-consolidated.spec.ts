import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.9.4.4 - Fluxo de Caixa, DRE Gerencial & Resultado Consolidado', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('1. Fluxo de Caixa Realizado & Projetado e Calendário Financeiro Interativo', async ({ page }) => {
    await page.goto('/app/finance-cashflow')

    // Título e subseção
    await expect(page.getByRole('heading', { name: /Fluxo de Caixa Realizado & Projetado/i })).toBeVisible()
    await expect(page.getByText(/Planejamento de Liquidez & Tesouraria/i)).toBeVisible()

    // Toggle de Regime Caixa / Competência
    await expect(page.getByRole('button', { name: /Regime de Caixa/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Regime de Competência/i })).toBeVisible()

    // KPIs Realizado × Projetado
    await expect(page.getByText(/Saldo Inicial/i)).toBeVisible()
    await expect(page.getByText(/Entradas Realizadas/i)).toBeVisible()
    await expect(page.getByText(/Saídas Realizadas/i)).toBeVisible()
    await expect(page.getByText(/Saldo Atual/i)).toBeVisible()
    await expect(page.getByText(/A Receber/i)).toBeVisible()
    await expect(page.getByText(/A Pagar/i)).toBeVisible()
    await expect(page.getByText(/Saldo Projetado/i)).toBeVisible()

    // Calendário Operacional Financeiro
    await expect(page.getByRole('heading', { name: /Calendário Financeiro Operacional/i })).toBeVisible()
    await expect(page.getByText(/Setembro de 2026/i)).toBeVisible()

    // Clica em um dia do calendário com eventos para abrir o modal
    const dayWithEvents = page.locator('text=1 item').or(page.locator('text=2 itens')).first()
    if (await dayWithEvents.isVisible()) {
      await dayWithEvents.click()
      await expect(page.getByRole('heading', { name: /Agenda Financeira:/i })).toBeVisible()
      await expect(page.getByText(/Lançamentos Programados/i)).toBeVisible()
      await page.getByRole('button', { name: /Fechar/i }).click()
    }

    // Tabela DFC Mensal
    await expect(page.getByRole('heading', { name: /Demonstração do Fluxo de Caixa Mensal \(DFC\)/i })).toBeVisible()
  })

  test('2. DRE Gerencial por Evento, Métricas Unitárias, Break-Even, Fechamento e Borderô', async ({ page }) => {
    await page.goto('/app/finance-cost-centers')

    // Botões de Ação do Topo: Borderô e Fechamento
    await expect(page.getByRole('button', { name: /Borderô Oficial/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Fechamento:/i })).toBeVisible()

    // Troca para a aba de DRE
    const dreTab = page.getByRole('button', { name: /Resultado Financeiro do Evento \(DRE\)/i })
    await expect(dreTab).toBeVisible()
    await dreTab.click()

    // DRE Gerencial Header e Métricas Unitárias
    await expect(page.getByText(/DRE Gerencial por Evento \(com Drilldown Contábil\)/i)).toBeVisible()
    await expect(page.getByText(/Receita \/ Ingresso/i)).toBeVisible()
    await expect(page.getByText(/Custo \/ Ingresso/i)).toBeVisible()
    await expect(page.getByText(/Margem \/ Ingresso/i)).toBeVisible()
    await expect(page.getByText(/ROAS de Mídia/i)).toBeVisible()
    await expect(page.getByText(/Taxa de Ocupação/i)).toBeVisible()

    // Ponto de Equilíbrio (Break-Even) Visual
    await expect(page.getByRole('heading', { name: /Ponto de Equilíbrio \(Break-Even do Evento\)/i })).toBeVisible()
    await expect(page.getByText(/Meta Superada/i)).toBeVisible()

    // Estrutura Hierárquica DRE
    await expect(page.getByRole('heading', { name: /Demonstração Gerencial com Drilldown/i })).toBeVisible()
    await expect(page.getByText(/RECEITA BRUTA OPERACIONAL/i)).toBeVisible()
    await expect(page.getByText(/DEDUÇÕES DA RECEITA BRUTA/i)).toBeVisible()
    await expect(page.getByText(/RESULTADO OPERACIONAL DO EVENTO/i)).toBeVisible()

    // Abre Modal de Fechamento Financeiro
    await page.getByRole('button', { name: /Fechamento:/i }).click()
    await expect(page.getByRole('heading', { name: /Fechamento Financeiro do Evento/i })).toBeVisible()
    await expect(page.getByText(/Checklist de Auditoria Obrigatória/i)).toBeVisible()
    await page.getByRole('button', { name: /Cancelar/i }).click()

    // Abre Modal de Borderô Oficial
    await page.getByRole('button', { name: /Borderô Oficial/i }).click()
    await expect(page.getByRole('heading', { name: /Borderô Oficial de Prestação de Contas/i })).toBeVisible()
    await expect(page.getByText(/Assinatura Digital & Hash SHA-256/i)).toBeVisible()
    await page.getByRole('button', { name: /Demonstrativo por Lote/i }).click()
    await expect(page.getByText(/Lote \/ Setor/i)).toBeVisible()
    await page.getByRole('button', { name: /Fechar/i }).click()
  })

  test('3. Resultado Consolidado do Produtor, Eliminação de Transferências e Comparativo Multieventos', async ({ page }) => {
    await page.goto('/app/finance-consolidated')

    // Título principal
    await expect(page.getByRole('heading', { name: /Resultado Consolidado do Produtor & Comparativo Multieventos/i })).toBeVisible()

    // KPIs Consolidados
    await expect(page.getByText(/Receita Consolidada/i)).toBeVisible()
    await expect(page.getByText(/Custos Consolidados/i)).toBeVisible()
    await expect(page.getByText(/Resultado Operacional/i)).toBeVisible()
    await expect(page.getByText(/Margem Média/i)).toBeVisible()

    // REGRA CRÍTICA: Eliminação de Transferências Internas
    await expect(page.getByText(/Regra Contábil do ERP: Eliminação de Transferências Internas entre Eventos/i)).toBeVisible()
    await expect(page.getByText(/Efeito Econômico: R\$ 0,00 na DRE Consolidada/i)).toBeVisible()

    // Tabela de Eventos (Lucrativos vs Deficitários)
    await expect(page.getByRole('heading', { name: /Resultado por Evento do Produtor/i })).toBeVisible()
    await expect(page.getByText(/Lucrativo/i).first()).toBeVisible()
    await expect(page.getByText(/Deficitário/i).first()).toBeVisible()

    // Modal Comparativo Multieventos
    const compareBtn = page.getByRole('button', { name: /Comparar/i }).first()
    await expect(compareBtn).toBeVisible()
    await compareBtn.click()

    await expect(page.getByRole('heading', { name: /Comparativo de Resultados entre Eventos/i })).toBeVisible()
    await expect(page.getByText(/Status de Rentabilidade/i)).toBeVisible()
    await expect(page.getByText(/Receita Bruta Total/i)).toBeVisible()
    await page.getByRole('button', { name: /Fechar/i }).click()

    // Preservação do Hero Success Banner e Checklist da Fase 17
    await expect(page.getByRole('heading', { name: /Módulo Financeiro 100% Funcional e Integrado/i })).toBeVisible()
    await expect(page.getByText(/Fase 17 Concluída com Sucesso/i).first()).toBeVisible()
  })
})
