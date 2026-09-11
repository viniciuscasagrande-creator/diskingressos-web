# Relatório de Homologação e Entrega Técnica: Fase 26.17.10 / Fase 28
## Spotify Ads + Conversões CAPI + Atribuição por Evento no SafeSaff / PDT

**Data de Entrega:** 11 de Setembro de 2026  
**Módulo:** Marketing & Growth OS · DiskIngressos  
**Release:** `26.17.10-spotify-ads-attribution-2026-09-11`  
**Status dos Gates:** Aprovado em todos os níveis (`check:lucide`, `verify:protected-modules`, `typecheck`, `build`, `verify:finance-release`)

---

### 1. Resumo Executivo

A **Fase 26.17.10** (e subfases 28.1 a 28.6) integra o ecossistema oficial do **Spotify Ads** nativamente ao **SafeSaff**, sob a vertical de **Marketing**, sem criar sistemas paralelos e **sem alterar ou comprometer nenhum dos módulos protegidos** (Financeiro, Estornos, SAC, Eventos).

A solução conecta o poder do streaming musical e podcasts ao fluxo de ticketing da DiskIngressos, permitindo que produtores alcancem fãs qualificados com spots de áudio de 15s/30s e companion banners interativos de 640x640, monitorando em tempo real as conversões server-side via **Spotify Conversions API (CAPI)** e atribuindo receita e ROAS diretamente a cada evento.

---

### 2. Hierarquia e Isolamento Rigoroso de Dados

A arquitetura respeita integralmente o modelo multi-inquilino (*multi-tenant*) da DiskIngressos:

```text
DISKINGRESSOS (Plataforma Global)
       │
       └── PRODUTOR (Tenant Isolado)
              │
              ├── CONEXÃO SPOTIFY ADS (OAuth 2.0 / Ad Account ID / Tokens AES-256-GCM)
              │
              └── EVENTO ESPECÍFICO (Ex: Show Ítalo / Sunset Eletrônico)
                     │
                     ├── Campanhas de Áudio (delivery_goal_group)
                     │      └── Ad Sets (delivery_goal, orçamentos, públicos)
                     │             └── Criativos (Áudio MP3/WAV + Companion 640x640 + CTA)
                     │
                     ├── Spotify Conversions API (CAPI Server-Side)
                     │      └── Eventos canônicos com hash SHA-256 de PII (email, tel)
                     │
                     └── Atribuição de Vendas UTM & Comparativo Omnichannel
                            └── Meta Ads · Google Ads · TikTok Ads · Spotify Ads
```

- **Garantia de Segurança Multi-Tenant:** Um produtor **nunca** tem visibilidade sobre credenciais, contas, campanhas ou métricas de outro produtor. Todas as consultas ao banco de dados e APIs do Spotify Ads utilizam o `producerId` verificado pelo token JWT da sessão no backend.
- **Credenciais em Repouso:** *Client Secrets*, *Access Tokens* e *Refresh Tokens* são criptografados com **AES-256-GCM** antes de qualquer gravação no banco, nunca sendo trafegados em texto puro para o frontend.

---

### 3. Componentes Implementados

| Camada | Arquivo | Descrição |
|---|---|---|
| **Domínio / Tipos** | [`src/domain/marketing/spotifyAds.ts`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/domain/marketing/spotifyAds.ts) | Modelagem completa de conexões OAuth, campanhas v3 (`delivery_goal_group`), ad sets (`delivery_goal`), criativos de áudio, estimativas de audiência, mapeamento CAPI e omnichannel. |
| **Backend / Rotas** | [`server/src/routes/spotifyAds.ts`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/server/src/routes/spotifyAds.ts) | Endpoints REST seguros para fluxo OAuth 2.0, criptografia AES-256-GCM, listagem e persistência de campanhas por evento, Copilot de audiência, previsão/forecast, métricas do dashboard, atribuição UTM e simulação de teste CAPI. |
| **CAPI Server Engine** | [`server/src/services/conversionEngine.ts`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/server/src/services/conversionEngine.ts) | Conector server-side para envio resiliente de eventos de conversão ao endpoint oficial `https://spclient.wg.spotify.com/ads-event-gateway/v1/events`. |
| **API Client Frontend** | [`src/services/spotifyAdsApi.ts`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/services/spotifyAdsApi.ts) | Cliente HTTP tipado com tratamento de falhas e mock fallback operacional para garantir resiliência visual e de navegação. |
| **Wizard de Criação** | [`src/components/marketing/SpotifyCampaignWizardModal.tsx`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/components/marketing/SpotifyCampaignWizardModal.tsx) | Assistente guiado de 7 passos com Copilot PDT de gêneros musicais, cálculo em tempo real de alcance e índice de qualidade, player broadcast de áudio e validação de CAPI. |
| **Central de Mídia Hub** | [`src/pages/marketing/SpotifyAdsHubPage.tsx`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/pages/marketing/SpotifyAdsHubPage.tsx) | Painel oficial com KPIs de áudio, curva de impressões vs conversões, abas de Campanhas, Atribuição UTM, CAPI Server-Side e Comparativo Omnichannel. |
| **Navegação & Sidebar** | [`src/components/ModuleSidebar.tsx`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/components/ModuleSidebar.tsx) | Item "Spotify Ads" adicionado ao menu de Marketing sem afetar módulos protegidos. |
| **Roteamento SPA** | [`src/App.tsx`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/App.tsx) | Suporte canônico para as rotas `/app/marketing/spotify`, `/app/marketing-spotify` e `marketing-spotify-ads`. |
| **Marketing Hub OS** | [`src/pages/marketing/MarketingHubOSPage.tsx`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/pages/marketing/MarketingHubOSPage.tsx) | Banner de acesso rápido com atalho direto e atalho no bloco "Executar" do Marketing OS. |

---

### 4. Mapeamento Canônico de Conversões (DiskIngressos → Spotify CAPI)

O conector unificado mapeia os eventos de ingresso para o padrão oficial da Spotify Ads API v3:

| Evento PDT DiskIngressos | Evento Spotify CAPI | Momento do Disparo | Hash PII Obrigatório |
|---|---|---|---|
| `EVENT_PAGE_VIEW` | `VIEW` | Acesso à página do evento | IP + User-Agent |
| `TICKET_VIEW` | `PRODUCT` | Seleção de setor/lote | IP + User-Agent |
| `ADD_TO_CART` | `ADDTOCART` | Ingresso adicionado ao carrinho | SHA-256 (Email) |
| `CHECKOUT_STARTED` | `CHECKOUT` | Início do checkout | SHA-256 (Email + Telefone) |
| `ORDER_PAID` | `PURCHASE` | **Apenas após confirmação de pagamento** | SHA-256 (Email + Telefone + Nome) |

---

### 5. Parâmetros Canônicos de Rastreamento (UTM)

Os links gerados automaticamente pelo assistente DiskIngressos seguem a taxonomia:
- `utm_source=spotify`
- `utm_medium=paid_audio` (ou `audio_stream`)
- `utm_campaign={campaign_name_slug}`
- `utm_content={ad_creative_name_640x640}`
- `utm_term={genre_target_segment}`

---

### 6. Validação dos Gates de Qualidade

Todos os comandos de auditoria e gates de proteção foram executados com sucesso:

1. **`npm run verify:protected-modules`**:
   - `PASS menu Eventos`
   - `PASS menu Financeiro`
   - `PASS menu independente Estornos`
   - `PASS menu Marketing`
   - `PASS menu SAC`
   - `PASS release marker Core Stability Gate`
   - `PASS CORE_PROTECTED_MODULES: 5 módulos críticos preservados.`
2. **`npm run check:lucide`**:
   - `PASS`: Nenhum ícone JSX sem import detectado.
3. **`npm run typecheck` (`tsc --noEmit`)**:
   - `PASS`: 0 erros de compilação TypeScript em todo o projeto.
4. **`npm run build` (`vite build`)**:
   - `PASS`: Bundle de produção gerado com sucesso em 4.05s.
5. **`npm run verify:finance-release`**:
   - `PASS`: Todos os 38 marcadores de interface e 21 marcadores de banco preservados intactos.
