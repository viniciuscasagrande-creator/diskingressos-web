# Correção de Produção — Tema Global Disk V2

Data: 17/09/2026

## Evidência usada
A produção confirmou `html.dark`, `data-theme="dark"` e o marcador do Master Visual V1. O shell estava escuro, mas o Dashboard por Perfil continuava com cards brancos.

## Causa confirmada
`ProfileDashboardPage.tsx` usa classes próprias (`profile-hero`, `profile-kpi`, `profile-section`, `profile-scope-card`, `profile-shortcut`, `profile-event-row`) cujo CSS legado em `styles.css` fixa `background:#fff` e cores hexadecimais. Essas classes não faziam parte da primeira ponte global do Master Visual.

## Correção aplicada
- Conexão explícita de toda a família `profile-*` aos tokens `--disk-*`.
- Superfícies, bordas, títulos, textos secundários, hover, atalhos, lista de eventos e nota de escopo agora respeitam Claro/Escuro/Sistema.
- Ponte adicional para famílias estruturais antigas de dashboard/cards.
- Ajustes mobile em 400px para reduzir colisões, espaçamentos e melhorar composição do dashboard.
- Marker atualizado para `2026-09-17-komposo-global-v2`.
- Script `verify:disk-master-visual` atualizado para validar V2.

## Regras preservadas
Nenhuma alteração em APIs, rotas, PageKeys, autenticação, permissões, Producer × Event, cálculos financeiros ou regras de negócio.

## Validação disponível neste ambiente
`npm run verify:disk-master-visual`: aprovado.

`typecheck/build`: não homologados neste ambiente porque o backup não contém `node_modules`; os erros de TypeScript observados começam por dependências ausentes (`react`, `lucide-react`, `react/jsx-runtime`). Execute `npm ci` antes dos gates completos.
