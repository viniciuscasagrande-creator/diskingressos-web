# Fase 26.x.3.5 — Playwright Auto-Diagnóstico

Release: `26.x.3.5-playwright-auto-diagnostico-2026-09-03`

## Objetivo

Transformar falhas do Playwright em um diagnóstico operacional que diga **qual módulo falhou, o tipo provável do problema, rota relacionada, arquivos prováveis e ação recomendada**, sem permitir que Gemini/IA simplesmente remova a função para fazer o teste passar.

## Comandos

```bash
npm run test:pw:control-center
npm run test:pw:diagnose
```

O Control Center agora chama o diagnóstico automaticamente depois do relatório executivo.

## Saídas

`test-results/diagnostics/`:
- `DIAGNOSTICO_PLAYWRIGHT.html`
- `DIAGNOSTICO_PLAYWRIGHT.md`
- `DIAGNOSTICO_PLAYWRIGHT.json`

## Classificação automática

O motor identifica, entre outros:
- regressão visual;
- seletor/tela não renderizada;
- autenticação;
- isolamento `producerId/eventId`;
- rota ausente/não publicada;
- HTTP 5xx;
- erro JavaScript;
- rede/timeout;
- divergência de contrato.

## Módulos críticos

Estornos, Central de Eventos, Event OS, Runtime, Visual Golden Master e segurança multi-tenant são tratados como bloqueantes.

## Regra obrigatória para agentes de IA

Uma falha Playwright **não autoriza remover o recurso**. Corrigir a causa indicada pelo diagnóstico. O Golden Master só pode ser atualizado depois de aprovação humana explícita.
