import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.10 - Spotify Ads + Conversões + Atribuição por Evento', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('1. Hub Spotify Ads: Conexão OAuth, KPIs, Curva de Desempenho e Abas', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')

    // Verifica que o painel de marketing carregou
    await expect(page.getByRole('heading', { name: /Dashboard Marketing/i })).toBeVisible()

    // Clica no botão/banner do Spotify Ads & CAPI
    const spotifyTab = page.getByRole('button', { name: /Spotify Ads & CAPI/i })
    await expect(spotifyTab).toBeVisible()
    await spotifyTab.click()

    // Release Marker da Fase 26.17.10
    const container = page.locator('[data-release="26.17.10-spotify-ads-attribution-2026-09-11"]')
    await expect(container).toBeVisible()

    // Cabeçalho da Central
    await expect(page.getByRole('heading', { name: /Central de Mídia Spotify Ads & Conversões CAPI/i })).toBeVisible()
    await expect(page.getByText(/Hierarquia: DiskIngressos → Produtor → Evento/i)).toBeVisible()

    // Banner de Conexão OAuth com status CONECTADO
    await expect(page.getByText(/CONECTADO/i).first()).toBeVisible()
    await expect(page.getByText(/Business ID:/i)).toBeVisible()
    await expect(page.getByText(/Ad Account:/i)).toBeVisible()
    await expect(page.getByText(/••••••••••••7F4B/i)).toBeVisible()

    // KPIs de Áudio e Mídia
    await expect(page.getByText(/Investimento/i).first()).toBeVisible()
    await expect(page.getByText(/Ouvintes/i).first()).toBeVisible()
    await expect(page.getByText(/Cliques Banner/i).first()).toBeVisible()
    await expect(page.getByText(/CTR Médio/i).first()).toBeVisible()
    await expect(page.getByText(/Conclusão/i).first()).toBeVisible()
    await expect(page.getByText(/Ingressos/i).first()).toBeVisible()
    await expect(page.getByText(/Receita/i).first()).toBeVisible()
    await expect(page.getByText(/ROAS/i).first()).toBeVisible()

    // Curva diária de impressões
    await expect(page.getByText(/Curva Diária de Impressões de Áudio vs Conversões/i)).toBeVisible()
  })

  test('2. Assistente de Criação de Campanha Spotify Ads (Wizard 7 Passos com Copilot)', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')

    // Abre a aba Spotify
    await page.getByRole('button', { name: /Spotify Ads & CAPI/i }).click()

    // Clica no botão "Nova Campanha Spotify"
    const newCampBtn = page.getByRole('button', { name: /Nova Campanha Spotify/i })
    await expect(newCampBtn).toBeVisible()
    await newCampBtn.click()

    // Modal aberto: Passo 1 (Campanha)
    await expect(page.getByRole('heading', { name: /Assistente de Criação de Campanha de Áudio & CAPI/i })).toBeVisible()
    await expect(page.getByText(/Identificação da Campanha & Evento/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Venda de Ingressos/i })).toBeVisible()

    // Avança para Passo 2: Público & Copilot
    await page.getByRole('button', { name: /Avançar/i }).click()
    await expect(page.getByText(/Público, Gêneros Musicais & Copilot IA/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Sugerir Público com Copilot PDT/i })).toBeVisible()

    // Testa clique no Copilot
    await page.getByRole('button', { name: /Sugerir Público com Copilot PDT/i }).click()
    await expect(page.getByText(/Diagnóstico do Copilot DiskIngressos:/i)).toBeVisible({ timeout: 5000 })

    // Avança para Passo 3: Previsão de Audiência
    await page.getByRole('button', { name: /Avançar/i }).click()
    await expect(page.getByText(/Previsão de Audiência & Alcance Potencial/i)).toBeVisible()
    await expect(page.getByText(/Alcance de Ouvintes Únicos/i)).toBeVisible()
    await expect(page.getByText(/Índice de Qualidade da Audiência/i)).toBeVisible()

    // Avança para Passo 4: Orçamento
    await page.getByRole('button', { name: /Avançar/i }).click()
    await expect(page.getByText(/Orçamento & Estratégia de Lances/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Orçamento Total/i })).toBeVisible()

    // Avança para Passo 5: Criativo & Player de Áudio
    await page.getByRole('button', { name: /Avançar/i }).click()
    await expect(page.getByText(/Biblioteca de Criativos \(Áudio \+ Companion Banner\)/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Ouvir Spot Áudio/i })).toBeVisible()

    // Avança para Passo 6: CAPI & Rastreio
    await page.getByRole('button', { name: /Avançar/i }).click()
    await expect(page.getByText(/Mapeamento Canônico PDT DiskIngressos → Spotify Ads CAPI/i)).toBeVisible()
    await expect(page.getByText(/ORDER_PAID/i)).toBeVisible()
    await expect(page.getByText(/PURCHASE/i)).toBeVisible()

    // Avança para Passo 7: Revisão Final
    await page.getByRole('button', { name: /Avançar/i }).click()
    await expect(page.getByText(/Revisão Final da Campanha/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Publicar Campanha Spotify/i })).toBeVisible()

    // Fecha o modal
    await page.locator('button:has-text("Cancelar")').click()
  })

  test('3. Sub-Abas: Atribuição de Vendas, Spotify CAPI e Comparativo Omnichannel', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')
    await page.getByRole('button', { name: /Spotify Ads & CAPI/i }).click()

    // Aba Atribuição de Vendas
    const attrTab = page.getByRole('button', { name: /Atribuição de Vendas UTM/i })
    await expect(attrTab).toBeVisible()
    await attrTab.click()
    await expect(page.getByText(/Vendas de Ingressos Atribuídas ao Spotify Ads \(UTM Tracking\)/i)).toBeVisible()

    // Aba Spotify CAPI
    const capiTab = page.getByRole('button', { name: /Spotify CAPI & Eventos/i })
    await expect(capiTab).toBeVisible()
    await capiTab.click()
    await expect(page.getByText(/Monitor Spotify Conversions API/i)).toBeVisible()
    await expect(page.getByText(/Simulação de Conversão Server-Side/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Enviar Evento de Teste PURCHASE/i })).toBeVisible()

    // Aba Comparativo Omnichannel
    const omniTab = page.getByRole('button', { name: /Comparativo Omnichannel/i })
    await expect(omniTab).toBeVisible()
    await omniTab.click()
    await expect(page.getByText(/Dashboard Unificado de Mídia por Evento: Meta · Google · TikTok · Spotify/i)).toBeVisible()
    await expect(page.getByText(/Spotify Ads/i).first()).toBeVisible()
    await expect(page.getByText(/Meta Ads/i).first()).toBeVisible()
    await expect(page.getByText(/Google Ads/i).first()).toBeVisible()
    await expect(page.getByText(/TikTok Ads/i).first()).toBeVisible()
  })

  test('4. Acesso Direto por URL (/app/marketing-spotify e /app/marketing/spotify)', async ({ page }) => {
    await page.goto('/app/marketing-spotify')
    await expect(page.locator('[data-release="26.17.10-spotify-ads-attribution-2026-09-11"]')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Central de Mídia Spotify Ads & Conversões CAPI/i })).toBeVisible()
    await expect(page.getByText(/CONECTADO/i).first()).toBeVisible()
  })
})
