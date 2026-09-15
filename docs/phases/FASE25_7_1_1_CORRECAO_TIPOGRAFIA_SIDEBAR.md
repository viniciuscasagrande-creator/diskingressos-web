# Fase 25.7.1.1 — Correção Definitiva da Tipografia da Sidebar

## Problema identificado
A Sidebar declarava `Inter`, porém a fonte Inter não era carregada diretamente. O CSS global carregava Plus Jakarta Sans via Google Fonts e havia regras globais antigas de navegação. Em navegadores/deploys onde `Inter` não estava disponível, a Sidebar fazia fallback e apresentava aparência inconsistente. Além disso, pesos não padronizados como 520/620 dependiam de uma fonte variável efetivamente carregada.

## Correção aplicada
- Carregamento local da Inter variável fornecida pelo próprio pacote Limitless adquirido.
- Fonte isolada com nome `SafeSaff Inter` para evitar colisão com regras legadas.
- Aplicação explícita na Sidebar, botões, labels, captions e badges.
- Pesos principais normalizados: 500 (item), 600 (ativo), 450/550 em submenu.
- Line-height, letter-spacing, truncamento e renderização padronizados.
- Nenhuma alteração de rota, permissão, ícones, responsividade ou comportamento de expansão.

## Release
`25.7.1.1-sidebar-typography-hotfix-2026-09-02`
