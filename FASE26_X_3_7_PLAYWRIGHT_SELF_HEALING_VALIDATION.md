# Fase 26.x.3.7 — Playwright Self-Healing Validation

Release: `26.x.3.7-playwright-self-healing-validation-2026-09-03`

## Objetivo

Fechar o ciclo de QA após um reparo sugerido pelo Repair Advisor. A fase identifica automaticamente os módulos afetados pelo último diagnóstico, seleciona apenas os testes relacionados, executa esse reteste focado e somente depois libera a certificação completa da release.

## Importante

“Self-Healing” aqui **não significa que o Playwright altera o código sozinho**. O sistema não apaga telas, não muda rotas, não atualiza screenshots e não reduz asserts. A correção continua sendo aplicada pelo desenvolvedor/Gemini; esta fase valida inteligentemente se o reparo realmente resolveu a regressão sem causar novos danos.

## Fluxo

1. Playwright encontra uma falha.
2. `test:pw:diagnose` gera o diagnóstico.
3. `test:pw:repair-advisor` gera o plano de reparo e o prompt para Gemini.
4. Gemini/desenvolvedor corrige a causa raiz.
5. `test:pw:self-healing` lê os módulos afetados.
6. Executa somente os testes relacionados à falha.
7. Se passar, executa as proteções estruturais.
8. Se continuar aprovado, executa a certificação Playwright completa.
9. Gera relatório final de validação pós-reparo.

## Comandos

```bash
npm run test:pw:self-healing
npm run test:pw:self-healing:targeted
npm run test:pw:self-healing:dry-run
```

O modo `targeted` executa somente a área afetada e não inicia a certificação completa. O modo `dry-run` mostra quais testes seriam executados sem abrir navegador.

## Mapeamento inteligente

- Estornos → testes críticos de Estornos + Core Protected Modules.
- Central de Eventos → contrato funcional + tela oficial + Golden Master.
- Event OS → Event OS completo + Cockpit + segurança multi-tenant.
- Marketing/SAC → navegação Core + proteção de módulos + runtime.
- Runtime → erros JavaScript/HTTP.
- Visual → Golden Master + contrato da Central de Eventos.
- Auth/Tenant → login + isolamento producerId/eventId.

## Saídas

```text
test-results/self-healing/
├── SELF_HEALING_VALIDATION.html
├── SELF_HEALING_VALIDATION.md
└── SELF_HEALING_VALIDATION.json
```

Status possíveis:

- `HEALED_AND_CERTIFIED`: reparo passou no reteste focado e na certificação completa.
- `TARGETED_PASS`: reteste focado passou; usado quando a execução foi solicitada em modo targeted-only.
- `TARGETED_FAILED`: o reparo ainda não resolveu a regressão.
- `TARGETED_PASS_GUARD_FAILED`: teste afetado passou, mas uma proteção estrutural foi quebrada.
- `TARGETED_PASS_FULL_CERTIFICATION_FAILED`: o reparo resolveu a área original, mas introduziu ou revelou regressão em outra área.
- `NO_REPAIR_PENDING`: não existe diagnóstico/reparo pendente para validar.

## Guardrails

Estornos, Central de Eventos, módulos Core, Golden Master e isolamento multi-tenant continuam bloqueantes. A fase nunca atualiza baseline visual automaticamente e nunca autoriza remover funcionalidades para obter PASS.
