import {test,expect} from '@playwright/test'
import {login} from '../fixtures/auth'

test.describe('Fase 26.16.4 · Customer 360 Operacional',()=>{
 test('abre, pesquisa, filtra e abre perfil operacional',async({page})=>{
  await login(page)
  await page.goto('/eventos')
  await expect(page.getByTestId('events-page')).toBeVisible({timeout:15_000})
  const firstCard=page.getByTestId('event-card').first()
  await expect(firstCard).toBeVisible()
  await firstCard.click()
  const nav=page.getByText('Customer 360',{exact:true}).first()
  await expect(nav).toBeVisible({timeout:10_000})
  await nav.click()
  await expect(page.getByTestId('customer360-operational')).toBeVisible({timeout:15_000})
  await expect(page.getByText('Customer 360 Operacional')).toBeVisible()
  const search=page.getByTestId('customer360-search').locator('input')
  await expect(search).toBeEditable()
  await search.fill('a')
  const open=page.getByTestId('customer360-open-profile').first()
  if(await open.isVisible().catch(()=>false)){await open.click();await expect(page.getByTestId('customer360-profile')).toBeVisible()}
 })
})
