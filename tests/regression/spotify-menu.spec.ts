import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 28.1.1 — Submenu Spotify Ads no Menu Marketing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('1. Desktop: Clicar em Marketing abre o submenu e clicar em Spotify Ads navega para /app/marketing/spotify', async ({ page }) => {
    // 1. Garantir que estamos na tela inicial/eventos
    const sidebar = page.locator('.module-sidebar')
    await expect(sidebar).toBeVisible()

    // 2. Localiza o botão accordion de Marketing na sidebar
    const marketingSectionBtn = sidebar.getByTestId('collapsible-marketing')
    await expect(marketingSectionBtn).toBeVisible()

    // Se não estiver aberto, clica para abrir
    const isExpanded = await marketingSectionBtn.getAttribute('aria-expanded')
    if (isExpanded !== 'true') {
      await marketingSectionBtn.click()
    }

    // 3. Verifica que o submenu Marketing está aberto e exibe os itens esperados
    await expect(marketingSectionBtn).toHaveAttribute('aria-expanded', 'true')
    await expect(sidebar.getByRole('button', { name: 'Dashboard Marketing' })).toBeVisible()

    // 4. Localiza o item Spotify Ads dentro do menu Marketing
    const spotifyNavBtn = sidebar.getByRole('button', { name: 'Spotify Ads' })
    await expect(spotifyNavBtn).toBeVisible()

    // 5. Clica no item Spotify Ads
    await spotifyNavBtn.click()

    // 6. Valida navegação SPA para /app/marketing/spotify
    await expect(page).toHaveURL(/\/app\/marketing\/spotify/)

    // 7. Valida que a página do Spotify Ads foi renderizada
    await expect(page.getByRole('heading', { name: /Central de Mídia Spotify Ads & Conversões CAPI/i })).toBeVisible()
    await expect(page.locator('[data-release="26.17.10-spotify-ads-attribution-2026-09-11"]')).toBeVisible()

    // 8. Valida que o item Spotify Ads está marcado como ativo
    await expect(spotifyNavBtn).toHaveClass(/active/)
    await expect(spotifyNavBtn).toHaveAttribute('aria-current', 'page')

    // 9. Valida que o grupo Marketing permanece aberto mesmo após navegação
    await expect(marketingSectionBtn).toHaveAttribute('aria-expanded', 'true')
  })

  test('2. F5 / Reload direto em /app/marketing/spotify mantém Marketing aberto e Spotify Ads ativo', async ({ page }) => {
    // Acessa diretamente a URL /app/marketing/spotify
    await page.goto('/app/marketing/spotify')

    // Valida que a página oficial do Spotify Ads carregou
    await expect(page.getByRole('heading', { name: /Central de Mídia Spotify Ads & Conversões CAPI/i })).toBeVisible()

    const sidebar = page.locator('.module-sidebar')
    // Valida que o menu lateral possui Marketing expandido
    const marketingSectionBtn = sidebar.getByTestId('collapsible-marketing')
    await expect(marketingSectionBtn).toBeVisible()
    await expect(marketingSectionBtn).toHaveAttribute('aria-expanded', 'true')

    // Valida que o botão Spotify Ads está visível e ativo
    const spotifyNavBtn = sidebar.getByRole('button', { name: 'Spotify Ads' })
    await expect(spotifyNavBtn).toBeVisible()
    await expect(spotifyNavBtn).toHaveClass(/active/)
    await expect(spotifyNavBtn).toHaveAttribute('aria-current', 'page')

    // Executa recarregamento da página (F5)
    await page.reload()

    // Após o reload, valida novamente a consistência de estado
    await expect(page).toHaveURL(/\/app\/marketing\/spotify/)
    await expect(page.getByRole('heading', { name: /Central de Mídia Spotify Ads & Conversões CAPI/i })).toBeVisible()
    await expect(marketingSectionBtn).toHaveAttribute('aria-expanded', 'true')
    await expect(spotifyNavBtn).toHaveClass(/active/)
    await expect(spotifyNavBtn).toHaveAttribute('aria-current', 'page')
  })

  test('3. Mobile Drawer: Abertura pelo menu móvel e navegação para Spotify Ads', async ({ page }) => {
    // Configura viewport móvel
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')

    // Abre o menu móvel pelo botão hamburguer
    const menuBtn = page.getByRole('button', { name: 'Abrir navegação' })
    await expect(menuBtn).toBeVisible()
    await menuBtn.click()

    const sidebar = page.locator('.module-sidebar')
    // Localiza a seção Marketing no drawer
    const marketingSectionBtn = sidebar.getByTestId('collapsible-marketing')
    await expect(marketingSectionBtn).toBeVisible()

    const isExpanded = await marketingSectionBtn.getAttribute('aria-expanded')
    if (isExpanded !== 'true') {
      await marketingSectionBtn.click()
    }

    // Localiza e clica em Spotify Ads
    const spotifyNavBtn = sidebar.getByRole('button', { name: 'Spotify Ads' })
    await expect(spotifyNavBtn).toBeVisible()
    await spotifyNavBtn.click()

    // Valida URL e conteúdo na visão mobile
    await expect(page).toHaveURL(/\/app\/marketing\/spotify/)
    await expect(page.getByRole('heading', { name: /Central de Mídia Spotify Ads & Conversões CAPI/i })).toBeVisible()
  })

  test('4. Spotify Ads aparece dentro do Marketing (Teste Direto)', async ({ page }) => {
    await page.goto('/app/events')

    const sidebar = page.locator('.module-sidebar')
    const marketingSectionBtn = sidebar.getByTestId('collapsible-marketing')
    await marketingSectionBtn.click()

    await expect(
      sidebar.getByText('Spotify Ads')
    ).toBeVisible()

    await sidebar.getByText('Spotify Ads').click()

    await expect(page).toHaveURL(
      /\/app\/marketing\/spotify/
    )
  })
})
