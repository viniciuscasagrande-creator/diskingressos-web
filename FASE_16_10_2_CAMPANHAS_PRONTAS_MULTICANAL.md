# Fase 16.10.2 — Campanhas Prontas & Ativação Multicanal

## Resumo da Implementação

A **Fase 16.10.2** implementa o primeiro grande motor operacional de marketing pré-configurado da DiskIngressos. O produtor pode selecionar qualquer um dos **15 eventos reais**, escolher uma das **8 campanhas prontas** e ativá-la instantaneamente através de um fluxo guiado (Wizard Operacional) que gera links UTM para cada canal ativo e retorna métricas em tempo real para o dashboard da campanha.

---

## ⚡ As 8 Campanhas Prontas Pré-Configuradas

| Campanha | Estratégia & Foco | Canais Ativos Integrados | Estimativa de ROAS |
| :--- | :--- | :--- | :--- |
| **1. Acelerar Vendas** | Pico de 48h com cupom relâmpago e oferta urgente | WhatsApp VIP + Meta Ads + Stories + E-mail | 450% a 700% |
| **2. Lançamento do Evento** | Abertura oficial 360° e lote promocional inicial | Meta Ads + Google Ads + TikTok + E-mail + Influenciadores | 320% a 480% |
| **3. Virada de Lote** | Escassez, urgência e contagem regressiva de 24 horas | Instagram Stories + Meta Retargeting + WhatsApp + E-mail | 500% a 750% |
| **4. Últimas Vagas** | Reta final de esgotamento (últimos 100 ingressos) | Instagram Stories + WhatsApp Disparo + Push CRM | 600% a 900% |
| **5. Evento nesta Semana** | Conversão imediata nos 5 dias antes do show | Google Search + Instagram Reels + WhatsApp | 480% a 680% |
| **6. Recuperar Carrinhos** | Resgate cirúrgico de checkouts e carrinhos abandonados | WhatsApp 1-a-1 + Meta Retargeting + E-mail Resgate | 800% a 1400% |
| **7. Remarketing de Visitantes**| Reimpacto de visitantes da página sem conversão | Meta Pixel CAPI + Google Display + Facebook Feed | 550% a 850% |
| **8. Reativar Compradores** | Recompra com base de compradores de edições anteriores | WhatsApp VIP + E-mail VIP + Cupom Fidelidade | 900% a 1600% |

---

## 🚀 Fluxo Operacional Passo a Passo (Wizard de 5 Etapas)

```text
HUB MARKETING
    ↓
CAMPANHAS PRONTAS
    ↓
1. SELECIONAR EVENTO (15 eventos reais DiskIngressos)
    ↓
2. ESCOLHER MODELO (Cards dos 8 presets com badge e estimativa)
    ↓
3. SELECIONAR CANAIS (WhatsApp, E-mail, Meta, Google, TikTok, Influenciadores)
    ↓
4. PÚBLICO & ORÇAMENTO (Segmentação + Orçamento R$ + Meta de Ingressos)
    ↓
5. PERÍODO & REVISÃO DE UTMS (Geração automática de utm_source, utm_medium, utm_campaign)
    ↓
ATIVAÇÃO OPERACIONAL → CAMPANHA ATIVA NO DASHBOARD
```

---

## 📊 Dashboard da Campanha com 10 KPIs Operacionais

Ao clicar em qualquer campanha, abre-se o dashboard detalhado com:

1. **Investimento (R$)**
2. **Visitas Atribuídas**
3. **Carrinhos Criados**
4. **Checkouts Iniciados**
5. **Ingressos Vendidos**
6. **Receita Total (R$)**
7. **Taxa de Conversão (%)**
8. **CPA Médio (R$)**
9. **ROAS Real (x)**
10. **Orçamento Alocado (R$)**

### Tabela de Canais com Copiar UTM em 1 Clique
- Visualização de URLs reais com parâmetros `utm_source`, `utm_medium` e `utm_campaign`.
- Botão instantâneo **"Copiar URL"** para distribuição no WhatsApp, criativos de anúncios ou e-mails.

### Ciclo de Vida da Campanha (Status Operacionais)
- **Rascunho** (`draft`)
- **Configurada** (`configured`)
- **Agendada** (`scheduled`)
- **Ativa** (`active`)
- **Pausada** (`paused`)
- **Finalizada** (`finished`)

### Ações de Gestão
- **Pausar / Retomar**
- **Duplicar Campanha** (cria cópia instantânea com novo código e novos links)
- **Finalizar & Arquivar**
- **Exportar Relatório**

---

## 💻 Arquivos Modificados
- `src/pages/marketing/MarketingCampaignsPage.tsx`
- `src/types/marketing.ts`
- `src/data/marketingData.ts`
- `FASE_16_10_2_CAMPANHAS_PRONTAS_MULTICANAL.md`
