# Fase 16.11 — Modelos Prontos & Campanhas Multicanais

## 🎯 Arquitetura Multicanal Implementada

Em vez do modelo simplista de “uma campanha = um canal”, a **Fase 16.11** implementa a arquitetura de **Campanha Multicanal & Hierárquica**:

```text
CAMPANHA MULTICANAL (ex: "Lançamento Oficial — Marcos & Belutti 18 Anos")
       │
       ├── Instagram (Feed, Reels & Stories) ────> utm_source=instagram&utm_medium=stories_ads
       ├── Meta Ads (Remarketing Checkout)   ────> utm_source=facebook&utm_medium=remarketing
       ├── Google Ads (Search & YouTube)     ────> utm_source=google&utm_medium=search_cpc
       ├── TikTok Ads (In-Feed Video)        ────> utm_source=tiktok&utm_medium=video_views
       ├── WhatsApp (Disparo Base VIP)       ────> utm_source=whatsapp&utm_medium=base_vip
       ├── E-mail Marketing (Newsletter)     ────> utm_source=email&utm_medium=newsletter
       └── Influenciadores & Promoters       ────> utm_source=influencer&utm_medium=stories_parceria
```

---

## ⚡ 8 Modelos Prontos de Campanhas (Templates / Presets)

1. **Lançamento Oficial do Evento (Full Multicanal - 8 Canais)**
   - *Canais:* Instagram (Feed/Stories), Google Ads, TikTok, WhatsApp, E-mail, Influenciadores, Promoters.
   - *Orçamento Sugerido:* R$ 15.000,00 | *ROI Estimado:* 320% a 450%.

2. **Últimos Ingressos & Virada de Lote (Urgência)**
   - *Canais:* Instagram Stories, Meta Remarketing, WhatsApp Alerta, E-mail Últimas 24h.
   - *Orçamento Sugerido:* R$ 6.500,00 | *ROI Estimado:* 500% a 750%.

3. **Pesquisa & Intenção de Compra**
   - *Canais:* Google Search (Termos Exatos), Google Display, YouTube Ads.
   - *Orçamento Sugerido:* R$ 5.500,00 | *ROI Estimado:* 380% a 520%.

4. **Remarketing de Checkout & Abandono**
   - *Canais:* WhatsApp 1-a-1 Recuperação Imediata, Meta Retargeting Dinâmico, E-mail Régua de Abandono.
   - *Orçamento Sugerido:* R$ 3.500,00 | *ROI Estimado:* 800% a 1400%.

5. **Vídeo Lineup & Teaser Viral**
   - *Canais:* TikTok Spark Ads, Instagram Reels Promoted, YouTube Shorts Ads.
   - *Orçamento Sugerido:* R$ 4.800,00 | *ROI Estimado:* 260% a 380%.

6. **Disparo Base Ativa & Clientes VIP**
   - *Canais:* WhatsApp Transacional VIP, E-mail Exclusivo VIP, CRM Push Notificação.
   - *Orçamento Sugerido:* R$ 2.200,00 | *ROI Estimado:* 900% a 1600%.

7. **Influenciadores & Afiliados VIP**
   - *Canais:* Influenciadores Cultura/Entretenimento, Promoters Universitários, Cupons de Desconto Trackeados.
   - *Orçamento Sugerido:* R$ 7.500,00 | *ROI Estimado:* 350% a 500%.

8. **Pós-Evento & Reativação para Próximo Show**
   - *Canais:* E-mail Obrigado & Pré-Venda, WhatsApp Convite Fidelidade, Cupom 15% OFF Pós-Show.
   - *Orçamento Sugerido:* R$ 1.800,00 | *ROI Estimado:* 1100% a 1800%.

---

## 🔍 Detalhamento por Canal (Drilldown)
- Ao clicar em qualquer campanha, o usuário tem acesso à visão detalhada de cada canal com seus respectivos links UTM, orçamento gasto, vendas, receita, ROI individual e CPA.
