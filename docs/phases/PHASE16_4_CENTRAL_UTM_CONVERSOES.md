# Fase 16.4 — Central UTM & Conversões do Evento

## 📌 Visão Geral

A **Fase 16.4** unifica todas as etapas de criação, gestão, mensuração, atribuição e recuperação de campanhas UTM em uma **única Central UTM & Conversões do Evento**.

Anteriormente, as telas de *Gerar Link*, *Links Gerados*, *Pedidos & Conversões* e *Gráficos* eram separadas. Agora, a tela opera como um **cockpit analítico 360° em tempo real**, onde a seleção de uma campanha alimenta instantaneamente todos os KPIs, gráficos, funil e pedidos nominais.

---

## 🎯 1. Fluxo e Arquitetura da Tela

```text
EVENTO: #1760 - SEM PARAR / ID.3217 - 4 AMIGOS 2026
Início das vendas: 14/04/2026 15:52  |  Final das vendas: 23/08/2026 20:10

[ + Nova UTM ]  [ Campanha / Link UTM ▼ ]  [ Período ▼ ]  [ Comparar URLs ]  [ Exportar ]
────────────────────────────────────────────────────────────────────────────────────────

URL SELECIONADA
Instagram — Lançamento 2026
disk.ing/4amigos-instagram
source: instagram | medium: cpc | campaign: lancamento_2026 | content: story_01
[ Copiar URL Curta ] [ Copiar Completa ] [ QR Code ] [ Pausar / Ativar ]
────────────────────────────────────────────────────────────────────────────────────────

KPIS DA CAMPANHA
[ Visitas: 1.842 ] [ Adicionou: 326 (17,7%) ] [ Checkout: 142 (43,5%) ] [ Comprou: 87 (61,3%) ]
[ Receita: R$ 12.480,50 ] [ Ticket Médio: R$ 143,45 ] [ Conversão Geral: 4,72% ]
────────────────────────────────────────────────────────────────────────────────────────

FUNIL DE CONVERSÃO VISUAL
1.842 VISITAS             ████████████████████████████████ 100%
  326 ADICIONOU CARRINHO  ████████████████                 17,7% (17,7% das visitas)
  142 INICIOU CHECKOUT    ███████                           7,7% (43,5% do carrinho)
   18 ABANDONOU           █                                 1,0% (12,7% do checkout)
   87 COMPROU             ████                              4,7% (61,3% do checkout)
────────────────────────────────────────────────────────────────────────────────────────

DESEMPENHO NO TEMPO & HORÁRIOS
[ Receita | Conversões | Ações | Ticket Médio ]      [ Distribuição por Horário: 00h às 23h ]
(Gráfico de Área Interativo)                         (Barras com filtro por hora ao clicar)
────────────────────────────────────────────────────────────────────────────────────────

PEDIDOS & CONVERSÕES (Nominal)
[ Todos 54 ] [ Adicionou 36 ] [ Removeu 10 ] [ Abandonou 1 ] [ Finalizou 7 ]
(Tabela com busca, valor, parâmetros e drawer de jornada detalhada com timestamps)
(Botão [ ⚡ Recuperar ] para carrinhos abandonados com disparo WhatsApp/E-mail/Automação)
────────────────────────────────────────────────────────────────────────────────────────

TODAS AS URLs DA CAMPANHA (Troca Rápida de Contexto)
[ Instagram — Feed ] [ Google Ads — Pesquisa ] [ WhatsApp — Último Lote ] [ TikTok Viral ]
```

---

## ⚡ 2. Recursos e Funcionalidades Integradas

1. **Seletor de Campanha no Topo:**
   - Dropdown inteligente que altera todos os blocos de dados da tela sem recarregar a página.
   - Estado vazio amigável quando nenhuma campanha estiver selecionada com CTA `[ + Criar primeira URL ]`.

2. **Drawer Lateral "+ Nova UTM":**
   - Criação sem sair da tela.
   - Parâmetros: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, descrição amigável e URL de destino.
   - Prévia dinâmica em tempo real da URL montada.
   - Ao salvar, a nova UTM é automaticamente selecionada no dashboard.

3. **Funil com Taxas de Passagem:**
   - Exibe a porcentagem absoluta e a taxa de passagem entre cada etapa:
     - *Visita → Carrinho:* `17,7%`
     - *Carrinho → Checkout:* `43,5%`
     - *Checkout → Compra:* `61,3%`

4. **Gráficos Dinâmicos e Filtro por Horário:**
   - Alternância entre métricas (*Receita*, *Conversões*, *Ações*, *Ticket Médio*) e granularidade (*Hora*, *Dia*, *Semana*).
   - Distribuição de 00h às 23h com barras clicáveis que filtram os pedidos daquele horário específico na tabela abaixo.

5. **Drawer de Jornada do Pedido (Botão `>`):**
   - Linha do tempo completa do comprador com timestamps e eventos:
     - `19:40 Visitou página` → `19:40 Adicionou 3 ingressos` → `19:41 Removeu 1 ingresso` → `19:42 Checkout iniciado` → `19:42 Compra finalizada (R$ 180,00)`.

6. **Integração Direta com Remarketing (Recuperação de Carrinho):**
   - Em registros com status `Abandonou`, botão `[ ⚡ Recuperar ]` dispara mensagem personalizada (WhatsApp, E-mail ou Fluxo Automático) e atualiza o registro para `RECUPERADO` com receita salva.

7. **Comparativo Multicanal (Modal "Comparar URLs"):**
   - Tabela comparativa lado a lado entre canais (*Instagram* vs *Google Ads* vs *WhatsApp* vs *TikTok*).

8. **Exportação & QR Code:**
   - Download de QR Code para totens e materiais impressos.
   - Exportação de dados e pedidos em formato CSV.
