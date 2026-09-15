# Fase 25.3.4 — Integração 100% do Framework Limitless no SafeSaff

## Objetivo
Transformar o pacote Limitless adquirido pela empresa na fundação visual oficial do SafeSaff, sem substituir a arquitetura React/Vite, sem quebrar as rotas e sem reintroduzir os problemas de tipografia/spacing já corrigidos nas Fases 25.3.2–25.3.3.

## O que significa “100% integrado”
O pacote original licenciado foi preservado integralmente em `vendor/limitless/`, acompanhado de um manifesto de todos os arquivos. Ele passa a funcionar como biblioteca-fonte interna do produto. O SafeSaff **não carrega todo o CSS/JS legado de uma vez**, porque isso criaria colisões com React/Tailwind e aumentaria o bundle. Em vez disso, foi criada uma camada de compatibilidade oficial que traduz o design system Limitless para os componentes React.

Isso disponibiliza ao projeto todas as famílias de recursos do pacote: layouts, navegação, formulários, validação, wizards, tabelas avançadas, dashboards, charts, mapas, modais/offcanvas, toasts, badges, páginas auxiliares e utilitários.

## Arquivos adicionados
- `vendor/limitless/` — pacote adquirido preservado integralmente.
- `vendor/LIMITLESS_MANIFEST.json` — inventário completo.
- `public/vendor/limitless/fonts/` e `public/vendor/limitless/icons/` — ativos de runtime.
- `src/styles/limitless-enterprise.css` — tokens e adaptador enterprise.
- `src/components/ui/Limitless.tsx` — primitivas React reutilizáveis.
- `src/theme/limitlessManifest.ts` — catálogo funcional e marcador de release.

## Regras de arquitetura
1. O Limitless é a **fundação de UI**, não um segundo aplicativo dentro do SafeSaff.
2. Os HTMLs de demonstração são referência de implementação, não rotas de produção.
3. CSS Bootstrap/Limitless completo não é importado globalmente para evitar colisões.
4. Recursos são convertidos em componentes React/Tailwind conforme cada módulo usa.
5. Dados, permissões, ERP, CRM, Ledger, Split, SAC e Financeiro continuam sendo fontes do SafeSaff.
6. O Dashboard Financeiro homologado não é substituído; recebe tokens e componentes de forma compatível.

## Padrão visual oficial
- Fonte principal: Inter, com fallback Plus Jakarta Sans/system.
- Corpo: 14px.
- Título de página: 26px / 650.
- Título de seção: 16px / 600.
- Labels auxiliares: 11–12px / 550–650.
- Cor primária: `#0c83ff`.
- Canvas: `#f1f4f9`.
- Bordas: escala Gray 300 do Limitless.
- Raio base: 6–8px.
- Valores financeiros: alinhamento à direita + `tabular-nums`.
- Textos: alinhamento à esquerda.

## Migração funcional
A camada criada permite migrar módulos sem reescrever regras de negócio. Os componentes principais são `LLCard`, `LLStat`, `LLToolbar`, `LLButton`, `LLBadge`, `LLTableFrame` e `LLEmpty`.

## Próximo padrão de evolução
A partir desta fase, novas telas e refatorações das telas existentes devem reutilizar a camada `Limitless.tsx` ou seus tokens. Dessa forma o sistema inteiro converge para uma única linguagem visual, mantendo o pacote adquirido disponível para qualquer componente avançado necessário.

Release: `25.3.4-limitless-enterprise-ui-2026-09-02`
