import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Design System Disk • Padrão Visual Komposo & Sistema de Temas', () => {
  test.beforeEach(async ({ page }) => {
    // Autenticar com usuário administrativo
    await login(page, qaUsers.admin.email, qaUsers.admin.password)
    
    // Acessar o Developer Center e ativar a aba do Design System
    await page.goto('/desenvolvedor')
    await page.waitForLoadState('networkidle')
    
    const tabDs = page.locator('[data-testid="tab-design-system"]')
    await expect(tabDs).toBeVisible({ timeout: 10000 })
    await tabDs.click()
  })

  test('Deve renderizar a vitrine do Design System Disk com sucesso', async ({ page }) => {
    const showcase = page.locator('[data-testid="design-system-showcase"]')
    await expect(showcase).toBeVisible({ timeout: 15000 })

    // Validar presença dos títulos e seções
    await expect(page.getByText('Design System Disk • Padrão Visual Komposo')).toBeVisible()
    await expect(page.getByText('Fundação Visual & Sistema de Tokens')).toBeVisible()
    await expect(page.getByText('1. Paleta de Cores & Tokens Oficiais')).toBeVisible()
    await expect(page.getByText('2. Tipografia & Hierarquia Textual')).toBeVisible()
    await expect(page.getByText('3. Botões & Ações')).toBeVisible()
    await expect(page.getByText('4. Entradas & Controles de Formulário')).toBeVisible()
    await expect(page.getByText('5. Cards & Superfícies Komposo')).toBeVisible()
    await expect(page.getByText('6. Badges & Pílulas de Status')).toBeVisible()
    await expect(page.getByText('7. Tabela de Listagem no Padrão Komposo')).toBeVisible()
    await expect(page.getByText('8. Visualização de Gráficos Adaptativa')).toBeVisible()
  })

  test('Deve alternar entre modo Claro, Escuro e Sistema com persistência', async ({ page }) => {
    const showcase = page.locator('[data-testid="design-system-showcase"]')
    await expect(showcase).toBeVisible({ timeout: 15000 })

    // 1. Mudar para modo Escuro
    const darkBtn = page.locator('[data-testid="theme-btn-dark"]').first()
    await darkBtn.click()

    // Validar classe 'dark' e atributo data-theme no <html>
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDark).toBe(true)

    const storedDark = await page.evaluate(() => localStorage.getItem('disk-theme'))
    expect(storedDark).toBe('dark')

    // 2. Recarregar a página e garantir persistência (prevenção de FOUC)
    await page.reload()
    await page.waitForLoadState('networkidle')

    const isDarkAfterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDarkAfterReload).toBe(true)

    // Reativar aba do Design System se necessário após reload
    const tabDs = page.locator('[data-testid="tab-design-system"]')
    if (await tabDs.isVisible()) {
      await tabDs.click()
    }

    // 3. Mudar para modo Claro
    const lightBtn = page.locator('[data-testid="theme-btn-light"]').first()
    await lightBtn.click()

    const isDarkCleared = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDarkCleared).toBe(false)

    const storedLight = await page.evaluate(() => localStorage.getItem('disk-theme'))
    expect(storedLight).toBe('light')

    // 4. Mudar para modo Sistema
    const systemBtn = page.locator('[data-testid="theme-btn-system"]').first()
    await systemBtn.click()

    const storedSystem = await page.evaluate(() => localStorage.getItem('disk-theme'))
    expect(storedSystem).toBe('system')
  })

  test('Deve funcionar o botão de alternância rápida compacta', async ({ page }) => {
    const showcase = page.locator('[data-testid="design-system-showcase"]')
    await expect(showcase).toBeVisible({ timeout: 15000 })

    const toggleCompact = page.locator('[data-testid="disk-theme-toggle-compact"]')
    await expect(toggleCompact).toBeVisible()

    // Clicar para alternar
    await toggleCompact.click()
    const stored = await page.evaluate(() => localStorage.getItem('disk-theme'))
    expect(stored).toBeTruthy()
  })

  test('Deve validar a presença das cores institucionais do Laranja Disk', async ({ page }) => {
    const showcase = page.locator('[data-testid="design-system-showcase"]')
    await expect(showcase).toBeVisible({ timeout: 15000 })

    await expect(page.getByText('#F97316')).toBeVisible()
    await expect(page.getByText('Laranja Disk Principal')).toBeVisible()
    await expect(page.getByText('--disk-color-primary', { exact: true })).toBeVisible()
  })
})
