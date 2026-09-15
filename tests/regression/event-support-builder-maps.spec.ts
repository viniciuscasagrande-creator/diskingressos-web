import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Fase 29.2 — Suporte a Eventos, Event Builder & Disk Maps', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)
  })

  test('1. Navegação: Deve acessar "Suporte a Eventos" pelo menu lateral oficial', async ({ page }) => {
    // Localiza e clica no item Suporte a Eventos no menu
    const menuSupport = page.locator('#main-module-sidebar, [data-testid="main-module-sidebar"]').locator('button:has-text("Suporte a Eventos")')
    await expect(menuSupport).toBeVisible({ timeout: 10_000 })
    await menuSupport.click()

    // Verifica que a central de suporte foi renderizada
    const hub = page.locator('[data-testid="event-support-hub"]')
    await expect(hub).toBeVisible({ timeout: 10_000 })
    await expect(hub).toContainText('Suporte a Eventos & Event Builder')
    await expect(hub).toContainText('Disk Interno • Central Operacional de Eventos')
  })

  test('2. Métricas e Filas: Deve exibir contadores de implantação e filtrar solicitações', async ({ page }) => {
    await page.goto('/app/event-support')
    await page.waitForLoadState('networkidle')

    const hub = page.locator('[data-testid="event-support-hub"]')
    await expect(hub).toBeVisible({ timeout: 10_000 })

    // Contadores de status
    await expect(hub).toContainText('Em Implantação')
    await expect(hub).toContainText('Aguardando Produtor')
    await expect(hub).toContainText('Prontos p/ Homologação')
    await expect(hub).toContainText('Urgentes / SLA Crítico')

    // Tabela com protocolos
    await expect(hub.locator('table')).toContainText('REQ-008721')
    await expect(hub.locator('table')).toContainText('Orquestra Sinfônica')

    // Filtrar por Urgentes
    await hub.locator('button:has-text("Urgentes")').click()
    await expect(hub.locator('table')).toContainText('Festival Sertanejo Prime')
    await expect(hub.locator('table')).not.toContainText('Orquestra Sinfônica')

    // Voltar para Todas
    await hub.locator('button:has-text("Todas")').click()
    await expect(hub.locator('table')).toContainText('Orquestra Sinfônica')
  })

  test('3. Dossiê 360° e Event Builder: Deve abrir o dossiê e navegar pelas 13 etapas de montagem', async ({ page }) => {
    await page.goto('/app/event-support')
    await page.waitForLoadState('networkidle')

    // Clica no botão Dossiê 360° do primeiro item
    const dossieBtn = page.locator('button:has-text("Dossiê 360°")').first()
    await expect(dossieBtn).toBeVisible()
    await dossieBtn.click()

    // Valida abertura do modal
    const modal = page.locator('[data-testid="event-dossier-modal"]')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('Orquestra Sinfônica — Noite de Clássicos')
    await expect(modal).toContainText('Prontidão para Publicação')
    await expect(modal).toContainText('Etapas do Event Builder (13 Módulos de Montagem)')

    // Verifica etapas específicas
    await expect(modal).toContainText('01. Dados Gerais')
    await expect(modal).toContainText('04. Disk Maps (Mapa de Assentos)')
    await expect(modal).toContainText('08. Modalidades e Preços')
    await expect(modal).toContainText('13. Homologação e Publicação')

    // Clica na etapa 4 para visualizar detalhes
    await modal.locator('button:has-text("04. Disk Maps")').click()
    await expect(modal.locator('button:has-text("Abrir Editor Disk Maps")')).toBeVisible()
  })

  test('4. Disk Maps: Deve renderizar a grade de assentos, legenda pt-BR e proteger assento vendido', async ({ page }) => {
    await page.goto('/app/event-support')
    await page.waitForLoadState('networkidle')

    await page.locator('button:has-text("Dossiê 360°")').first().click()
    const modal = page.locator('[data-testid="event-dossier-modal"]')
    await expect(modal).toBeVisible()

    // Alterna para a aba do mapa
    await modal.locator('button:has-text("Disk Maps (Assentos & Inventário)")').click()

    // Valida elementos do Disk Maps
    await expect(modal).toContainText('PALCO PRINCIPAL')
    await expect(modal).toContainText('Plateia Premium')
    await expect(modal).toContainText('Plateia Geral')
    await expect(modal).toContainText('Balcão Nobre')
    await expect(modal).toContainText('Disponível')
    await expect(modal).toContainText('Em Reserva (10 min)')
    await expect(modal).toContainText('Vendido')

    // Clica em um assento disponível (ex: fila A assento 1)
    const seatAvailable = modal.locator('button[title*="Disponível"]').first()
    await seatAvailable.click()
    await expect(modal).toContainText('Bloquear Assento')

    // Clica em um assento vendido (fila A assento 7 ou 8)
    const seatSold = modal.locator('button[title*="Vendido"]').first()
    await seatSold.click()
    await expect(modal).toContainText('Ingresso Vendido (Alteração protegida contra IDOR / Overbooking)')
  })

  test('5. Homologação e Publicação: Deve validar Score de Prontidão e disparar publicação', async ({ page }) => {
    await page.goto('/app/event-support')
    await page.waitForLoadState('networkidle')

    await page.locator('button:has-text("Dossiê 360°")').first().click()
    const modal = page.locator('[data-testid="event-dossier-modal"]')
    await expect(modal).toBeVisible()

    // Clica no botão Homologar e Publicar
    const publishBtn = modal.locator('button:has-text("Homologar e Publicar")')
    await expect(publishBtn).toBeVisible()
    await publishBtn.click()

    // Deve acusar publicação imediata
    await expect(modal).toContainText('Evento Publicado no Core!')

    // Fecha modal
    await modal.locator('button:has(svg.lucide-x)').click()
    await expect(modal).not.toBeVisible()

    // Na tabela o evento agora deve constar como Publicado no Site
    await expect(page.locator('[data-testid="event-support-hub"]')).toContainText('Publicado no Site')
  })

  test('6. Nova Solicitação de Evento: Deve abrir modal alinhado, preencher formulário e cadastrar na fila', async ({ page }) => {
    await page.goto('/app/event-support')
    await page.waitForLoadState('networkidle')

    const hub = page.locator('[data-testid="event-support-hub"]')
    await expect(hub).toBeVisible({ timeout: 10_000 })

    // Clica em Nova Solicitação de Evento
    const createBtn = hub.locator('button:has-text("Nova Solicitação de Evento")')
    await expect(createBtn).toBeVisible()
    await createBtn.click()

    // Modal de criação deve estar visível e alinhado
    const createModal = page.locator('[data-testid="create-event-request-modal"]')
    await expect(createModal).toBeVisible()
    await expect(createModal).toContainText('Solicitação de Abertura de Evento')
    await expect(createModal).toContainText('Fila de Implantação e Montagem do Suporte a Eventos')

    // Preenche campos
    const uniqueEventName = `Turnê Especial E2E Test ${Date.now()}`
    await createModal.locator('input[placeholder*="Show Acústico Internacional"]').fill(uniqueEventName)
    await createModal.locator('button:has-text("Submeter ao Suporte Disk")').click()

    // O modal deve fechar e a tabela deve conter o novo evento
    await expect(createModal).not.toBeVisible({ timeout: 5_000 })
    await expect(hub.locator('table')).toContainText(uniqueEventName)
  })
})
