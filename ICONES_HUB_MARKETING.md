# Hub Marketing — Ícones & Cards Habilitados

Documentação das rotas e ícones integrados ao Hub Marketing.

## 🎯 Alterações Realizadas

- **Navegação Interativa Total:** O card inteiro do Hub Marketing é clicável e dispara a troca de página instantânea.
- **Ícones Específicos:** Cada módulo possui seu ícone temático dedicado.
- **Acessibilidade:** Inclusão de `aria-label`, `title` e foco via teclado.
- **Feedback Visual:** Elevação suave no hover (`translateY(-2px)`), iluminação do ícone e realce da seta.

---

## 🗺️ Módulos Habilitados e Rotas

| Módulo | Rota (`PageKey`) | Descrição | Ícone |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `marketing-dashboard` | KPIs, funil e desempenho geral | `BarChart3` |
| **Campanhas** | `marketing-campaigns` | Criação, agendamento e métricas | `Megaphone` |
| **Automações** | `marketing-automations` | Fluxos automáticos de comunicação | `Zap` |
| **WhatsApp** | `marketing-whatsapp` | Campanhas e mensagens transacionais | `MessageSquare` |
| **E-mail Marketing** | `marketing-email` | Disparos e jornadas de e-mail | `Mail` |
| **Cupons e Promoções** | `marketing-coupons` | Ofertas, vouchers e descontos | `TicketPercent` |
| **Links, UTMs & QR Codes** | `marketing-links` | Rastreamento de origem e conversão | `Link2` / `QrCode` |
| **Afiliados e Parceiros** | `marketing-affiliates` | Performance de parceiros e comissões | `Users` |
| **Pixel & Analytics** | `marketing-tracking` | Meta, GA4, GTM e conversões | `Activity` |
| **Relatórios** | `marketing-reports` | ROI, ROAS, canais e exportações | `TrendingUp` |

---

## 🔄 Validação
- **TypeScript:** Validado sem erros (`npm run build`).
- **Deploy:** Integrado e publicado em **[https://safesaff.vercel.app/](https://safesaff.vercel.app/)**.
