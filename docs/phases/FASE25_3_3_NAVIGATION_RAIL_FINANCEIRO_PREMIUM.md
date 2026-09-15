# Fase 25.3.3 — Navigation Rail Financeiro Premium

## Objetivo
Transformar a navegação horizontal do Dashboard Financeiro em um **Navigation Rail Financeiro Enterprise**, com 100% de aproveitamento da largura de tela, respiro vertical aprimorado e separação visual entre cada função.

## Implementado
- **Aproveitamento de Largura Total (100%)**: O carrossel ocupa toda a área horizontal disponível do Dashboard.
- **Largura Individual dos Itens (110–145px)**: No desktop grande, os 9 botões se distribuem uniformemente (`flex: 1 1 0px`) sem quebra de texto ou aglomeração.
- **Hierarquia Visual**: Ícone Lucide centralizado em cima e rótulo embaixo em `11.5px` com tipografia Inter/system UI.
- **Item Ativo**: Fundo contrastante escuro `#0f172a`, texto branco e indicador inferior luminoso em cyan (`#38bdf8`).
- **Setas Inteligentes com Auto-Hide**: Setas de navegação surgem apenas quando o conteúdo ultrapassar o viewport visível (`hasOverflow`).
- **Navegação Suave & Touch**: Suporte a scroll com a roda do mouse (`wheel`), scroll snap horizontal e auto-scroll até o item ativo.
- **Respiro Vertical no Dashboard**: Espaçamento calibrado de 24px entre o cabeçalho, a barra de navegação, a grade de KPIs, os links de saúde operacional e a busca.
- **Preservação Integral**: Sidebar aprovada na Fase 25.3.2.1, Estornos independente e regras financeiras mantidas intactas.

## Release
`25.3.3-navigation-rail-premium-2026-09-02`
