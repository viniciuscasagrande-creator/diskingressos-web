# Aplicação no VS Code — Fase 26.17.7.1

Este ZIP contém o projeto SafeSaff completo já atualizado.

## Aplicação recomendada

1. Faça backup/commit da versão atual.
2. Extraia este ZIP.
3. Compare e aplique a pasta `safesaff/` sobre o projeto atual.
4. Execute `npm install` se `node_modules` não existir.
5. Execute `npm run build`.
6. Execute os testes Playwright da Central de Eventos e Painel Comercial.
7. Faça deploy no Vercel.

## Entrada nova

Abrir um card de evento leva para `/eventos/:code/dashboard`, onde é exibido o **Painel Comercial do Evento**. O botão **Acessar Event OS** leva ao Cockpit 360.

## Não remover

- Central de Eventos e seu Golden Master.
- Dashboard Financeiro aprovado.
- Módulo Estornos independente em `/app/finance-refunds`.

## Observação de validação

A validação sintática TypeScript dos arquivos alterados foi executada. O `tsc` completo não pôde resolver dependências porque `node_modules` não é incluído no pacote fonte; rode `npm install` no seu ambiente antes do build completo.
