import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 28.15.5 — Menu Mobile + Responsividade Enterprise 360', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('1. Mobile 360px: Botão hambúrguer abre drawer, overlay aparece, submenus expandem sem fechar', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto('/dashboard')

    // 1. Botão hambúrguer está visível
    const menuBtn = page.getByTestId('mobile-menu-button')
    await expect(menuBtn).toBeVisible()
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false')

    // 2. Sidebar está fora da tela (drawer fechado)
    const sidebar = page.locator('.safesaff-sidebar, .module-sidebar').first()
    await expect(sidebar).not.toHaveClass(/sidebar-mobile-expanded/)

    // 3. Clica no hambúrguer -> Abre drawer
    await menuBtn.click()
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'true')
    await expect(sidebar).toHaveClass(/sidebar-mobile-expanded/)
    await expect(page.locator('.mobile-nav-backdrop')).toBeVisible()

    // 4. Submenus funcionam dentro do drawer: expandir Contabilidade não fecha o drawer
    const contabilidadeBtn = sidebar.getByTestId('collapsible-contabilidade')
    await expect(contabilidadeBtn).toBeVisible()
    await contabilidadeBtn.click()

    // O drawer continua aberto!
    await expect(sidebar).toHaveClass(/sidebar-mobile-expanded/)
    await expect(contabilidadeBtn).toHaveAttribute('aria-expanded', 'true')

    // 5. Botão fechar (X) dentro do drawer fecha o menu
    const closeBtn = page.getByTestId('sidebar-mobile-close')
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()

    // Drawer fechou e backdrop sumiu
    await expect(sidebar).not.toHaveClass(/sidebar-mobile-expanded/)
    await expect(page.locator('.mobile-nav-backdrop')).not.toBeVisible()
  })

  test('2. Mobile 360px / 390px: Clicar em rota dentro do drawer carrega rota, mantém grupo aberto e fecha drawer automaticamente', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/dashboard')

    // 1. Abre drawer
    const menuBtn = page.getByTestId('mobile-menu-button')
    await menuBtn.click()

    const sidebar = page.locator('.safesaff-sidebar, .module-sidebar').first()
    await expect(sidebar).toHaveClass(/sidebar-mobile-expanded/)

    // 2. Abre accordion de Contabilidade
    const contabilidadeBtn = sidebar.getByTestId('collapsible-contabilidade')
    await contabilidadeBtn.click()

    // 3. Clica em "DRE Gerencial"
    const dreNav = sidebar.getByRole('button', { name: 'DRE Gerencial' })
    await expect(dreNav).toBeVisible()
    await dreNav.click()

    // 4. Drawer fecha automaticamente
    await expect(sidebar).not.toHaveClass(/sidebar-mobile-expanded/)
    await expect(page.locator('.mobile-nav-backdrop')).not.toBeVisible()

    // 5. Rota foi carregada corretamente
    await expect(page).toHaveURL(/\/contabilidade\/dre/)
    await expect(page.locator('#view-accounting-disk')).toBeVisible()
    await expect(page.getByRole('tab', { name: /DRE Gerencial/i })).toHaveAttribute('aria-selected', 'true')

    // 6. Se reabrir o drawer, o grupo Contabilidade permanece aberto e DRE Gerencial permanece ativo!
    await menuBtn.click()
    await expect(sidebar).toHaveClass(/sidebar-mobile-expanded/)
    await expect(contabilidadeBtn).toHaveAttribute('aria-expanded', 'true')
    await expect(dreNav).toHaveClass(/active/)
  })

  test('3. Mobile: Fechamento por clique no overlay backdrop e por tecla Escape', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 })
    await page.goto('/dashboard')

    const menuBtn = page.getByTestId('mobile-menu-button')
    const sidebar = page.locator('.safesaff-sidebar, .module-sidebar').first()
    const backdrop = page.locator('.mobile-nav-backdrop')

    // A. Fechamento por backdrop
    await menuBtn.click()
    await expect(sidebar).toHaveClass(/sidebar-mobile-expanded/)
    await expect(backdrop).toBeVisible()

    await backdrop.click({ position: { x: 380, y: 300 } })
    await expect(sidebar).not.toHaveClass(/sidebar-mobile-expanded/)
    await expect(backdrop).not.toBeVisible()

    // B. Fechamento por ESC
    await menuBtn.click()
    await expect(sidebar).toHaveClass(/sidebar-mobile-expanded/)

    await page.keyboard.press('Escape')
    await expect(sidebar).not.toHaveClass(/sidebar-mobile-expanded/)
    await expect(backdrop).not.toBeVisible()
  })

  test('4. Desktop (1440px, 1280px) & Tablet (1024px, 768px): Botão hambúrguer oculto, sidebar adaptativa/fixa, sem sobreposição', async ({ page }) => {
    const desktopViewports = [
      { name: 'desktop-1440', width: 1440, height: 900 },
      { name: 'notebook-1280', width: 1280, height: 800 },
      { name: 'tablet-1024', width: 1024, height: 768 },
      { name: 'tablet-768', width: 768, height: 1024 }
    ]

    for (const vp of desktopViewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/dashboard')

      // Botão hambúrguer deve estar oculto no tablet/desktop
      const menuBtn = page.locator('.mobile-menu-button, .sidebar-mobile-main-toggle')
      await expect(menuBtn).not.toBeVisible()

      // Backdrop overlay deve estar oculto
      const backdrop = page.locator('.mobile-nav-backdrop')
      await expect(backdrop).not.toBeVisible()

      // Sidebar visível
      const sidebar = page.locator('.safesaff-sidebar, .module-sidebar').first()
      await expect(sidebar).toBeVisible()
    }
  })

  test('5. Zero scroll horizontal homologado em 360, 390, 430, 768, 1024, 1280 e 1440+ px', async ({ page }) => {
    test.setTimeout(90_000)
    const testViewports = [
      { name: '360px (ultra-compacto)', width: 360, height: 640 },
      { name: '390px (iPhone regular)', width: 390, height: 844 },
      { name: '430px (iPhone Max)', width: 430, height: 932 },
      { name: '768px (Tablet portrait)', width: 768, height: 1024 },
      { name: '1024px (Tablet landscape)', width: 1024, height: 768 },
      { name: '1280px (Laptop)', width: 1280, height: 800 },
      { name: '1440px (Desktop HD)', width: 1440, height: 900 }
    ]

    const testRoutes = [
      '/dashboard',
      '/eventos',
      '/app/finance-dashboard',
      '/app/finance-refunds',
      '/contabilidade/dashboard',
      '/contabilidade/dre'
    ]

    for (const vp of testViewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      for (const route of testRoutes) {
        await page.goto(route)
        await page.waitForLoadState('domcontentloaded')

        const dimensions = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        }))

        // Tolerância máxima de 2px para subpixel rounding do motor de renderização
        expect(
          dimensions.scrollWidth,
          `Overflow horizontal detectado em ${route} com viewport ${vp.name}: scrollWidth=${dimensions.scrollWidth}, clientWidth=${dimensions.clientWidth}`
        ).toBeLessThanOrEqual(dimensions.clientWidth + 2)
      }
    }
  })

  test('6. Sem tela branca em 360px navegando sequencialmente por todos os módulos', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await page.goto('/dashboard')

    const routes = [
      '/eventos',
      '/app/finance-dashboard',
      '/app/finance-refunds',
      '/app/marketing-dashboard',
      '/app/sac-hub',
      '/contabilidade/dashboard',
      '/contabilidade/conciliacao',
      '/contabilidade/dre'
    ]

    for (const r of routes) {
      await page.goto(r)
      await page.waitForLoadState('domcontentloaded')
      // Verifica que o corpo não está em branco e o app shell está montado
      await expect(page.locator('.app-shell')).toBeVisible()
      const bodyText = await page.evaluate(() => document.body.innerText.trim().length)
      expect(bodyText).toBeGreaterThan(50)
    }
  })
})
