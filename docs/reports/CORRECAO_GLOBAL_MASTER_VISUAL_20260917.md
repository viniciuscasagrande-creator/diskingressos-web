# Correção Global — Master Visual Disk — 17/09/2026

## Objetivo
Aplicar ao projeto inteiro a referência visual aprovada Claro / Escuro / Sistema, sem alterar regras de negócio.

## Alterações realizadas
- Criada camada global `src/styles/disk-master-visual.css`, importada por último em `src/main.tsx`.
- AppShell, Header e Sidebar ligados aos tokens semânticos oficiais `--disk-*`.
- Compatibilidade global para superfícies, cards, tabelas, formulários, overlays e componentes legados comuns.
- Compatibilidade para classes Tailwind estruturais legadas (`bg-white`, slate/gray/zinc neutros) no modo escuro.
- Ponte para estilos inline neutros recorrentes produzidos pelo React, sem substituir cores de marca ou estados semânticos.
- Claro/Escuro continuam controlados pelo ThemeProvider já existente; Sistema continua seguindo `prefers-color-scheme`.
- Marcador de release no HTML: `data-disk-master-visual="2026-09-17-komposo-global-v1"`.
- Script `npm run verify:disk-master-visual` criado para confirmar que a camada master está conectada.

## O que NÃO foi alterado
- APIs, banco, cálculos, permissões, rotas, PageKeys e contexto Produtor × Evento.
- Cores de sucesso/alerta/erro/info e marcas externas não foram globalmente substituídas.
- Componentes legados não foram apagados; a camada de compatibilidade permite migração segura posterior.

## Validação executada neste ambiente
`npm run verify:disk-master-visual` / script equivalente: PASS.

## Limitação do ambiente
O backup não contém `node_modules`; por isso não foi possível certificar aqui `typecheck`, build Vite e Playwright completos sem reinstalar todas as dependências.

## Antes do deploy
1. `npm ci`
2. `npm run verify:disk-master-visual`
3. `npm run quality:gate`
4. `npm run build`
5. publicar o mesmo diretório/repositório usado pelo Vercel
6. no navegador da produção, confirmar no `<html>` o atributo `data-disk-master-visual="2026-09-17-komposo-global-v1"`
7. capturar a mesma rota em Claro e Escuro.
