import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

const modules = [
  { id: 'eventos', testId: 'nav-events', path: '/app/events', route: /\/app\/events(?:$|[?#])/, visible: /Eventos|Todos os Eventos/i },
  { id: 'financeiro', testId: 'nav-finance-dashboard', path: '/app/finance-dashboard', route: /\/app\/finance-dashboard(?:$|[?#])/, visible: /Financeiro/i },
  { id: 'estornos', testId: 'nav-finance-refunds', path: '/app/finance-refunds', route: /\/app\/finance-refunds(?:$|[?#])/, visible: /Central de Estornos|Estornos/i },
  { id: 'marketing', testId: 'nav-marketing-dashboard', path: '/app/marketing-dashboard', route: /\/app\/marketing-dashboard(?:$|[?#])/, visible: /Marketing/i },
  { id: 'sac', testId: 'nav-sac-hub', path: '/app/sac-hub', route: /\/app\/sac-hub(?:$|[?#])/, visible: /SAC|Atendimento/i },
]

test.describe('@protected core modules', () => {
  test.beforeEach(async ({ page }) => { await login(page) })

  for (const mod of modules) {
    test(`${mod.id} mantém contrato de navegação`, async ({ page }) => {
      if (mod.id === 'financeiro' || mod.id === 'marketing') {
        // As entradas ficam em seções recolhíveis. A rota direta testa o contrato sem depender do estado da seção.
        await page.goto(mod.path)
      } else {
        const nav = page.getByTestId(mod.testId)
        await expect(nav).toBeVisible()
        await expect(nav).toHaveAttribute('data-protected-module', mod.id)
        await nav.click()
      }
      await expect(page).toHaveURL(mod.route)
      await expect(page.getByText(mod.visible).first()).toBeVisible()
    })
  }
})
