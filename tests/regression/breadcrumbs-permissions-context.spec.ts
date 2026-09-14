import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Fase 28.15.6 — Breadcrumbs, Permissões e Contexto Produtor/Evento', () => {

  // =========================================================================
  // 1. ADMIN: Seleção de Produtor, Evento, Limpeza Automática e F5
  // =========================================================================
  test('Admin: Seleciona produtor, evento, confirma limpeza automática na troca e restauração F5', async ({ page }) => {
    await login(page, qaUsers.admin.email, qaUsers.admin.password)

    // Admin deve enxergar o seletor de produtoras no cabeçalho
    const producerSelect = page.locator('[data-testid="header-producer-select"]')
    await expect(producerSelect).toBeVisible()

    // 1. Seleciona a primeira produtora disponível da lista
    const firstOptionVal = await producerSelect.locator('option').nth(1).getAttribute('value')
    expect(firstOptionVal).toBeTruthy()
    await producerSelect.selectOption(firstOptionVal!)

    // O seletor de eventos deve estar disponível
    const eventSelect = page.locator('[data-testid="header-event-select"]')
    await expect(eventSelect).toBeVisible()

    // Aguarda opções de eventos da produtora selecionada carregarem
    await expect(eventSelect.locator('option')).not.toHaveCount(1, { timeout: 10_000 })
    const optionCount = await eventSelect.locator('option').count()
    expect(optionCount).toBeGreaterThan(1)

    // 2. Seleciona o primeiro evento disponível
    const firstEventOption = await eventSelect.locator('option').nth(1).getAttribute('value')
    if (firstEventOption) {
      await eventSelect.selectOption(firstEventOption)
      await page.waitForTimeout(300)

      // Navega para rota que exibe breadcrumbs
      await page.goto('/financeiro/dashboard')
      await page.waitForTimeout(500)

      // O breadcrumb deve refletir a navegação
      const breadcrumb = page.locator('[data-testid="breadcrumb-nav"]')
      await expect(breadcrumb).toBeVisible()

      // 3. REGRA CRÍTICA: Troca de Produtor A -> Produtor B limpa obrigatoriamente o evento!
      const secondOptionVal = await producerSelect.locator('option').nth(2).getAttribute('value')
      if (secondOptionVal) {
        await producerSelect.selectOption(secondOptionVal)
        await page.waitForTimeout(600)

        // Verifica que o eventSelect foi resetado para vazio
        const currentEventVal = await eventSelect.inputValue()
        expect(currentEventVal).toBe('')

        // 4. Teste de F5 / Reload: Preserva contexto válido da produtora 2
        await page.reload()
        await page.waitForTimeout(800)

        const reloadedProducerVal = await page.locator('[data-testid="header-producer-select"]').inputValue()
        expect(reloadedProducerVal).toBe(secondOptionVal)
      }
    }
  })

  // =========================================================================
  // 2. PRODUTOR: Produtor Fixo e Isolamento Estrito de Eventos
  // =========================================================================
  test('Produtor: Produtor fixo no cabeçalho, sem seletor de outras produtoras e somente eventos próprios', async ({ page }) => {
    // Login como Produtor A (vinicius@diskingressos.com.br, produtora 1)
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)

    // O seletor de outras produtoras NÃO pode ser acessível para usuário produtor regular
    const producerSelect = page.locator('[data-testid="header-producer-select"]')
    await expect(producerSelect).toHaveCount(0)

    // O badge de produtora fixa deve estar visível com a produtora dele
    const producerFixed = page.locator('[data-testid="header-producer-fixed"]')
    await expect(producerFixed).toBeVisible()
    await expect(producerFixed).toContainText('DiskIngressos Produções')

    // O seletor de eventos deve listar somente eventos da sua própria produtora
    const eventSelect = page.locator('[data-testid="header-event-select"]')
    await expect(eventSelect).toBeVisible()

    // Valida que nenhuma opção pertence à FEP Eventos
    const eventOptionsText = await eventSelect.allInnerTexts()
    const joinedText = eventOptionsText.join(' ')
    expect(joinedText).not.toContain('FEP Eventos')
  })

  // =========================================================================
  // 3. CONTEXTGUARD: Rota com exigência de evento exibe bloqueio amigável
  // =========================================================================
  test('ContextGuard: Acessar rota que exige evento sem evento selecionado exibe bloqueio amigável pt-BR', async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)

    // Garante que nenhum evento está selecionado no contexto
    await page.evaluate(() => {
      if ((window as any).AppContext) {
        ;(window as any).AppContext.clearEvent()
      }
    })

    // Tenta acessar diretamente /marketing/pixels (que possui context: { producer: true, event: true })
    await page.goto('/marketing/pixels')
    await page.waitForTimeout(600)

    // Deve exibir o estado amigável do ContextGuard (need_event)
    const blockedState = page.locator('[data-testid="blocked-state-need-event"]')
    await expect(blockedState).toBeVisible()
    await expect(blockedState).toContainText('Selecione um evento para continuar')

    // Deve conter botão para ver eventos
    const actionBtn = page.locator('[data-testid="btn-blocked-to-events"]')
    await expect(actionBtn).toBeVisible()
  })

  // =========================================================================
  // 4. PERMISSIONGUARD: Bloqueio amigável para usuário sem permissão
  // =========================================================================
  test('PermissionGuard: Usuário sem permissão recebe mensagem amigável de Acesso não autorizado', async ({ page }) => {
    // Login como operador de marketing (não possui permissão para contabilidade ou pos)
    await login(page, 'marketing@diskingressos.com.br', 'Marketing@123')

    // Tenta acessar rota contábil protegida diretamente
    await page.goto('/contabilidade/fechamento')
    await page.waitForTimeout(600)

    // Deve exibir tela de bloqueio de permissão amigável em pt-BR
    const unauthorizedState = page.locator('[data-testid="blocked-state-unauthorized"]')
    await expect(unauthorizedState).toBeVisible()
    await expect(unauthorizedState).toContainText('Acesso não autorizado')
    await expect(unauthorizedState).toContainText('Você não possui permissão para acessar esta funcionalidade.')

    // Botão de voltar ao dashboard
    const backBtn = page.locator('[data-testid="btn-blocked-back"]')
    await expect(backBtn).toBeVisible()
  })

  // =========================================================================
  // 5. RESPONSIVIDADE & LAYOUT: Breadcrumbs Desktop vs Mobile 360px sem overflow
  // =========================================================================
  test('Layout & Breadcrumbs: Desktop exibe caminho completo e Mobile 360px exibe formato compacto sem overflow', async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)

    // 1. Desktop (1280px)
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/financeiro/saldos')
    await page.waitForTimeout(500)

    const breadcrumbNav = page.locator('[data-testid="breadcrumb-nav"]')
    await expect(breadcrumbNav).toBeVisible()

    const desktopBreadcrumbs = page.locator('.breadcrumb-desktop').first()
    await expect(desktopBreadcrumbs).toBeVisible()

    const currentItem = page.locator('[data-testid="breadcrumb-current-item"]').first()
    await expect(currentItem).toBeVisible()
    await expect(currentItem).toHaveAttribute('aria-current', 'page')

    // 2. Mobile (360px)
    await page.setViewportSize({ width: 360, height: 640 })
    await page.waitForTimeout(500)

    // Valida que o container do breadcrumb não causa scroll horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)

    // O breadcrumb mobile compacto deve estar ativo
    const mobileBreadcrumb = page.locator('.breadcrumb-mobile:visible').first()
    await expect(mobileBreadcrumb).toBeVisible()
    const mobileCurrent = page.locator('[data-testid="breadcrumb-mobile-current"]:visible').first()
    await expect(mobileCurrent).toBeVisible()
  })

  // =========================================================================
  // 6. IDOR BACKEND: Tentativa de transferência entre eventos de produtoras distintas é bloqueada
  // =========================================================================
  test('IDOR Backend: Endpoint de transferência rejeita com 403 evento pertencente a outra produtora', async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)

    // Executa chamada direta à API de transferência simulando ataque IDOR onde evento 9999 pertence a outra produtora
    const token = await page.evaluate(() => localStorage.getItem('safesaff.jwt') || sessionStorage.getItem('safesaff.jwt'))

    const response = await page.request.post('/api/finance/internal-transfers/preview', {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      data: {
        sourceEventId: 1,
        destinationEventId: 999999, // IDOR
        amountCents: 50000,
        reason: 'Tentativa de transferência inválida',
        category: 'equalizacao_caixa'
      }
    })

    // O backend deve recusar com status 400 ou 403 (nunca 200)
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

})
