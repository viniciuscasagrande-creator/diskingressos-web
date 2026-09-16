import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Fase 29.12 — Núcleo Financeiro & Contábil Enterprise Integrados ao Disk Core', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)
  })

  test('1. Navegação: Deve acessar o Núcleo Enterprise pelo botão no Dashboard Financeiro e validar conta bancária com MFA', async ({ page }) => {
    await page.goto('/app/finance-dashboard')
    await page.waitForLoadState('networkidle')

    // Botão de atalho para o Núcleo Enterprise
    const btnEnterprise = page.locator('button:has-text("Núcleo Enterprise")')
    await expect(btnEnterprise).toBeVisible({ timeout: 10_000 })
    await btnEnterprise.click()

    // Valida que o cockpit carregou
    const hub = page.locator('[data-testid="pagina-nucleo-financeiro-contabil"]')
    await expect(hub).toBeVisible({ timeout: 10_000 })

    await expect(page.locator('h1').first()).toContainText('Núcleo Financeiro & Contábil')
    await expect(page.locator('text=Ledger append-only de partidas dobradas')).toBeVisible()
    await expect(page.locator('text=MFA Ativo para Repasses')).toBeVisible()
  })

  test('2. Saldos & Subcontas: Deve exibir os 11 tipos de saldo do produtor e subcontas por evento', async ({ page }) => {
    await page.goto('/financial-core')
    await page.waitForLoadState('networkidle')

    const hub = page.locator('[data-testid="pagina-nucleo-financeiro-contabil"]')
    await expect(hub).toBeVisible({ timeout: 10_000 })

    // Valida os 11 tipos de saldo presentes na tela
    await expect(page.locator('text=1. Vendido (Bruto)')).toBeVisible()
    await expect(page.locator('text=2. Recebido (PIX/Débito)')).toBeVisible()
    await expect(page.locator('text=3. Em Liquidação')).toBeVisible()
    await expect(page.locator('text=4. A Receber (Parcelas)')).toBeVisible()
    await expect(page.locator('text=5. Saldo Disponível')).toBeVisible()
    await expect(page.locator('text=6. Reservado (Caução)')).toBeVisible()
    await expect(page.locator('text=7. Bloqueado')).toBeVisible()
    await expect(page.locator('text=8. Comprometido')).toBeVisible()
    await expect(page.locator('text=9. Em Transferência')).toBeVisible()
    await expect(page.locator('text=10. Em Repasse')).toBeVisible()
    await expect(page.locator('text=11. Total Repassado')).toBeVisible()

    // Valida subcontas
    await expect(page.locator('text=Festival Sertanejo Curitiba 2026').first()).toBeVisible()
    await expect(page.locator('text=Arena Rock Festival Edição Especial').first()).toBeVisible()
  })

  test('3. Livro Financeiro (Ledger): Deve listar partidas append-only e abrir auditoria detalhada', async ({ page }) => {
    await page.goto('/financial-core')
    await page.waitForLoadState('networkidle')

    // Clica na aba Ledger
    await page.locator('button:has-text("Livro Financeiro (Ledger)")').click()

    await expect(page.locator('text=Partidas dobradas balanceadas imutáveis')).toBeVisible()
    await expect(page.locator('text=LED-2026-090101').first()).toBeVisible()

    // Clica no botão de auditoria da primeira linha
    const auditBtn = page.locator('button[title="Ver Auditoria do Lançamento"]').first()
    await expect(auditBtn).toBeVisible()
    await auditBtn.click()

    // Valida o modal de auditoria
    const modal = page.locator('[data-testid="modal-auditoria-ledger"]')
    await expect(modal).toBeVisible()
    await expect(modal.locator('text=Auditoria de Partida do Ledger')).toBeVisible()
    await expect(modal.locator('text=Partida Dobrada Oficial')).toBeVisible()
    await expect(modal.locator('text=Conta a Débito')).toBeVisible()
    await expect(modal.locator('text=Conta a Crédito')).toBeVisible()
    await expect(modal.locator('text=Hash Criptográfico de Bloqueio (SHA-256)')).toBeVisible()

    // Fecha o modal
    await modal.locator('button:has-text("Fechar Auditoria")').click()
    await expect(modal).not.toBeVisible()
  })

  test('4. Transferências Entre Eventos: Deve abrir modal com simulação de impacto contábil', async ({ page }) => {
    await page.goto('/financial-core')
    await page.waitForLoadState('networkidle')

    // Clica na aba Transferências
    await page.locator('button:has-text("Transferências Entre Eventos")').click()
    await expect(page.locator('text=Regra Maker × Checker')).toBeVisible()

    // Abre modal de nova transferência
    const newTrfBtn = page.locator('button:has-text("Solicitar Nova Transferência")')
    await expect(newTrfBtn).toBeVisible()
    await newTrfBtn.click()

    const modal = page.locator('[data-testid="modal-transferencia-eventos"]')
    await expect(modal).toBeVisible()
    await expect(modal.locator('h2')).toContainText('Nova Transferência de Recursos Entre Eventos')

    // Clica em simular impacto
    const simBtn = modal.locator('button:has-text("Simular Impacto no Saldo")')
    await expect(simBtn).toBeVisible()
    await simBtn.click()

    await expect(modal.locator('text=Simulação de Impacto Contábil')).toBeVisible({ timeout: 5000 })
    await expect(modal.locator('text=Risco:')).toBeVisible()

    // Fecha modal
    await modal.locator('button:has-text("Cancelar")').click()
    await expect(modal).not.toBeVisible()
  })

  test('5. Conciliação em 5 Camadas: Deve validar acurácia global e equalização de divergência', async ({ page }) => {
    await page.goto('/financial-core')
    await page.waitForLoadState('networkidle')

    // Clica na aba Conciliação
    await page.locator('button:has-text("Conciliação em 5 Camadas")').click()

    await expect(page.locator('text=Motor de Conciliação em 5 Camadas')).toBeVisible()
    await expect(page.locator('text=99.98%')).toBeVisible()
    await expect(page.locator('text=Camada 1: Gateway & Adquirentes')).toBeVisible()
    await expect(page.locator('text=Camada 2: Liquidação de Recebíveis')).toBeVisible()
    await expect(page.locator('text=Camada 3: Extratos Bancários (OFX / API)')).toBeVisible()
    await expect(page.locator('text=Camada 4: Repasses a Produtores')).toBeVisible()
    await expect(page.locator('text=Camada 5: Contabilidade & Ledger Disk Core')).toBeVisible()
  })

  test('6. Fechamento de Evento & Borderô: Deve abrir demonstrativo oficial de bilheteria e taxas', async ({ page }) => {
    await page.goto('/financial-core')
    await page.waitForLoadState('networkidle')

    // Clica no botão "Borderô / Fechamento" na tabela de subcontas
    const borderoBtn = page.locator('button:has-text("Borderô / Fechamento")').first()
    await expect(borderoBtn).toBeVisible()
    await borderoBtn.click()

    const modal = page.locator('[data-testid="modal-fechamento-bordero"]')
    await expect(modal).toBeVisible()
    await expect(modal.locator('h2')).toContainText('Fechamento Financeiro & Borderô Oficial')
    await expect(modal.locator('text=Checklist de Fechamento Operacional')).toBeVisible()
    await expect(modal.locator('text=Demonstrativo de Bilheteria Oficial')).toBeVisible()
    await expect(modal.locator('text=Receita Bruta de Bilheteria')).toBeVisible()
    await expect(modal.locator('text=(-) Comissão DiskIngressos:')).toBeVisible()

    // Fecha o modal
    await modal.locator('button:has-text("Fechar")').click()
    await expect(modal).not.toBeVisible()
  })

  test('7. Compliance Total PT-BR: Proibido termos "360" e "Fase" em textos visíveis', async ({ page }) => {
    await page.goto('/financial-core')
    await page.waitForLoadState('networkidle')

    const hub = page.locator('[data-testid="pagina-nucleo-financeiro-contabil"]')
    await expect(hub).toBeVisible({ timeout: 10_000 })

    const textContent = await hub.innerText()
    expect(textContent).not.toMatch(/360[°º]?/i)
    expect(textContent).not.toMatch(/\bFase\b/i)
  })
})
