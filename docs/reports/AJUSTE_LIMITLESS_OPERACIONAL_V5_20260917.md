# Disk + Limitless — Ajuste Operacional V5

## Correção principal
O backup já continha `vendor/limitless`, `public/vendor/limitless`, `limitless-enterprise.css`, `limitless-disk-bridge.css` e `LimitlessPage.tsx`, porém o bridge visual `limitless-disk-bridge.css` não estava importado em `src/main.tsx`. Portanto boa parte da integração preparada não chegava ao runtime.

## Alterações
- Importação efetiva de `limitless-disk-bridge.css`.
- Novo contrato final `limitless-disk-global.css`, importado por último.
- `MainContent` passa a carregar `disk-limitless-page`, ativando o bridge nas páginas reais.
- AppShell padronizado: sidebar 252px, recolhida 64px, header 58px.
- Sidebar normalizada: linha 40px, ícone 16px, tipografia 13px, submenus proporcionais, scroll interno e estado ativo laranja.
- Colapso elimina labels/badges e centraliza ícones.
- Conteúdo principal usa toda a largura útil e neutraliza containers estreitos herdados.
- Mobile usa drawer de no máximo 304px/88vw.
- Nenhuma PageKey, rota, permissão, API ou regra de negócio foi removida.

## Marcador de produção
`data-disk-master-visual="2026-09-17-limitless-operacional-v5"`

## Homologação
Antes de considerar produção homologada: `npm ci`, Prisma generate/migrations quando aplicável, `npm run build` e Playwright de navegação/permissões. Depois validar visualmente desktop e mobile.
