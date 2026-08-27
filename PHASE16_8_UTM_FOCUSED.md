# Fase 16.8 — Central UTM focada

## Objetivo
Aplicar no sistema atual o desenho aprovado para UTM sem reinterpretar o fluxo e sem fragmentar a operação em várias páginas.

## Regra principal
A Central UTM funciona em UMA ÚNICA TELA por evento. O usuário cria ou seleciona uma URL rastreável e esta URL passa a alimentar todos os indicadores abaixo.

## Fluxo
Evento → URLs rastreáveis → URL selecionada → KPIs → Funil → Gráficos → Pedidos & Conversões → Atribuição → Remarketing.

## Estado inicial
A tela inicia sem campanha selecionada. Nenhum gráfico ou KPI de uma campanha é apresentado até o usuário escolher uma URL.

## Biblioteca de URLs
A seção "Todas as URLs rastreáveis do evento" mostra cards por URL com:
- canal/origem;
- nome;
- URL rastreável;
- utm_source, utm_medium e utm_campaign;
- visitas;
- vendas;
- receita atribuída;
- botão Selecionar.

Existe busca por URL/campanha/origem e filtro por canal.

## Nova UTM
O botão "Nova UTM" abre um drawer sem abandonar a Central. Ao salvar, a nova URL é automaticamente selecionada.

Campos:
- descrição;
- utm_source;
- utm_medium;
- utm_campaign;
- utm_term;
- utm_content;
- URL de destino;
- pré-visualização da URL completa.

## URL selecionada
A seleção é explícita e repetida em uma barra de contexto. Todos os componentes posteriores usam o mesmo linkId.

## KPIs
- Visitas
- Sessões UTM
- Adicionou ao carrinho
- Checkout
- Finalizou
- Receita atribuída / ticket médio

## Funil
Visita → Adicionou → Checkout → Abandonou → Compra.

## Pedidos & conversões
Mantidos na mesma tela, com filtros por etapa e pesquisa. Cada linha exibe UTM, cliente, ingresso/modalidade, valor e data/hora.

## Atribuição real
As sessões são persistidas e relacionadas à URL. É possível detectar abandonos e gerar oportunidades de remarketing.

## Remarketing
A origem UTM permanece vinculada à oportunidade e à eventual venda recuperada para devolver receita à campanha correta.

## APIs reutilizadas
- GET /api/marketing/links
- POST /api/marketing/links
- GET /api/marketing/utm/dashboard
- POST /api/marketing/utm/actions
- POST /api/marketing/utm/abandon-sweep
- POST /api/tracking/resolve/:code
- POST /api/tracking/events

## Segurança
Toda consulta respeita o evento atual e o isolamento multi-produtor implementado no backend.
