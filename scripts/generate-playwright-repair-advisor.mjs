import fs from 'node:fs'
import path from 'node:path'

const diagFile = process.env.PLAYWRIGHT_DIAGNOSTICS_JSON || 'test-results/diagnostics/DIAGNOSTICO_PLAYWRIGHT.json'
const outDir = process.env.PLAYWRIGHT_REPAIR_DIR || 'test-results/repair-advisor'
const release = '26.x.3.7-playwright-self-healing-validation-2026-09-03'
fs.mkdirSync(outDir, { recursive: true })

const readJson = f => { try { return JSON.parse(fs.readFileSync(f,'utf8')) } catch { return null } }
const diag = readJson(diagFile)
if (!diag) {
  const msg = `Diagnóstico não encontrado em ${diagFile}. Execute npm run test:pw:diagnose primeiro.`
  fs.writeFileSync(path.join(outDir,'REPAIR_ADVISOR.md'), `# Playwright Repair Advisor\n\n**STATUS: BLOCKED**\n\n${msg}\n`)
  console.error(`[repair-advisor] BLOCKED: ${msg}`)
  process.exit(2)
}

const protectedRules = [
  'NÃO remover, ocultar, absorver ou renomear módulos protegidos para fazer testes passarem.',
  'NÃO alterar a rota canônica /app/finance-refunds nem remover a tela independente de Estornos.',
  'NÃO atualizar Golden Master/snapshots sem aprovação humana explícita.',
  'NÃO enfraquecer producerId/eventId, tenant.ts, RBAC ou testes de isolamento multi-tenant.',
  'NÃO comentar, pular (.skip), excluir ou reduzir asserts dos testes que falharam.',
  'Corrigir a causa raiz com a menor alteração possível e preservar o visual aprovado da Central de Eventos.'
]

const recipes = {
  VISUAL_REGRESSION: ['Comparar screenshot atual, diff e Golden Master.', 'Localizar CSS/componente que alterou geometria, tipografia ou espaçamento.', 'Restaurar o visual aprovado; não regenerar baseline como atalho.'],
  UI_SELECTOR_OR_RENDER: ['Confirmar se a rota ainda renderiza o componente esperado.', 'Conferir menu/PageKey/imports e condições de permissão.', 'Restaurar o componente ou contrato acessível sem alterar o teste para esconder a regressão.'],
  AUTHENTICATION: ['Validar credenciais QA e resposta do endpoint de login.', 'Conferir token/sessionStorage/cookie e expiração.', 'Não hard-code credenciais no código ou nos testes.'],
  TENANT_OR_PERMISSION: ['Reproduzir com produtor A e B.', 'Revisar requestedProducerId/ownsProducer e validação de eventId.', 'Manter 403/404 para acesso cruzado; nunca relaxar autorização para passar o teste.'],
  ROUTE_OR_NOT_DEPLOYED: ['Conferir App/PageKey/import e navegação canônica.', 'Confirmar que o bundle publicado contém a implementação.', 'Restaurar rota/componente e executar build antes do reteste.'],
  BACKEND_5XX: ['Inspecionar primeiro erro da API e logs do deploy.', 'Validar Prisma/schema/migration/env vars.', 'Corrigir endpoint sem criar fonte de verdade paralela.'],
  JAVASCRIPT_RUNTIME: ['Corrigir o primeiro pageerror/console error da stack.', 'Revisar imports, null guards e contrato da API.', 'Reexecutar somente o teste afetado antes da suíte completa.'],
  NETWORK_OR_TIMEOUT: ['Validar URL base, API, CORS e disponibilidade.', 'Distinguir indisponibilidade real de espera por seletor.', 'Evitar aumentar timeout como única correção.'],
  ASSERTION_MISMATCH: ['Comparar requisito aprovado com comportamento atual.', 'Se não houve mudança aprovada, restaurar o contrato.', 'Se houve mudança aprovada, atualizar contrato/teste somente com autorização.'],
  UNKNOWN: ['Abrir trace, screenshot, vídeo e stack.', 'Reproduzir o teste isoladamente.', 'Não alterar módulos protegidos até identificar causa raiz.']
}

const findings = diag.findings || []
const plans = findings.map((f,i) => ({
  id: `FIX-${String(i+1).padStart(3,'0')}`,
  findingId: f.id,
  severity: f.severity,
  module: f.module,
  kind: f.kind,
  test: f.test,
  routes: f.routes || [],
  files: f.likelyFiles || [],
  steps: recipes[f.kind] || recipes.UNKNOWN,
  verification: [
    `Reexecutar o teste: ${f.testFile || 'teste afetado'}`,
    'Executar npm run verify:protected-modules',
    'Executar npm run test:pw:critical',
    f.kind === 'VISUAL_REGRESSION' ? 'Executar npm run test:pw:visual-lock' : 'Executar npm run test:pw:runtime'
  ]
}))

const status = findings.length === 0 ? 'NO_REPAIR_NEEDED' : (diag.totals?.blockers || 0) > 0 ? 'BLOCKED_REPAIR_REQUIRED' : 'REPAIR_RECOMMENDED'
const payload = { release, generatedAt:new Date().toISOString(), sourceRelease:diag.release, status, protectedRules, plans }
fs.writeFileSync(path.join(outDir,'REPAIR_ADVISOR.json'), JSON.stringify(payload,null,2))

const planMd = plans.map(p => `## ${p.id} — ${p.module}\n\n**Origem:** ${p.findingId}  \n**Severidade:** ${p.severity}  \n**Tipo:** ${p.kind}  \n**Teste:** ${p.test}\n\n**Rotas:** ${p.routes.join(', ') || 'não inferida'}\n\n**Arquivos candidatos:**\n${p.files.map(x=>`- \`${x}\``).join('\n') || '- não inferidos'}\n\n**Plano de correção:**\n${p.steps.map((x,j)=>`${j+1}. ${x}`).join('\n')}\n\n**Validação obrigatória:**\n${p.verification.map(x=>`- ${x}`).join('\n')}\n`).join('\n')
const md = `# SafeSaff — Playwright Repair Advisor\n\n**Release:** ${release}  \n**Status:** **${status}**  \n**Diagnósticos recebidos:** ${findings.length}\n\n## Guardrails obrigatórios\n\n${protectedRules.map(x=>`- ${x}`).join('\n')}\n\n${planMd || '## Resultado\n\nNenhuma correção é necessária. A suíte analisada não possui falhas.'}\n`
fs.writeFileSync(path.join(outDir,'REPAIR_ADVISOR.md'), md)

const prompt = `# INSTRUÇÃO DE REPARO PARA GEMINI / AGENTE DE CÓDIGO\n\nVocê está corrigindo o SafeSaff/DiskIngressos PDT. Aplique SOMENTE correções de causa raiz indicadas abaixo.\n\n## REGRAS INVIOLÁVEIS\n${protectedRules.map(x=>`- ${x}`).join('\n')}\n\n## PLANOS DE REPARO\n${plans.map(p=>`### ${p.id} | ${p.module} | ${p.kind}\nTeste: ${p.test}\nRotas: ${p.routes.join(', ') || '-'}\nArquivos candidatos: ${p.files.join(', ') || '-'}\nPassos:\n${p.steps.map((x,j)=>`${j+1}. ${x}`).join('\n')}\nValidação: ${p.verification.join(' ; ')}`).join('\n\n') || 'Nenhuma falha. Não faça alterações.'}\n\n## CRITÉRIO DE CONCLUSÃO\nNão declare concluído até os testes afetados, módulos protegidos e quality gate passarem. Não remova funcionalidades como estratégia de correção.\n`
fs.writeFileSync(path.join(outDir,'PROMPT_REPARO_GEMINI.md'), prompt)

const esc = s => String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
const cards = plans.map(p=>`<article><div class="row"><b>${p.id}</b><span>${p.severity}</span><strong>${esc(p.module)}</strong></div><h3>${esc(p.kind)}</h3><p>${esc(p.test)}</p><h4>Arquivos candidatos</h4><code>${esc(p.files.join(', ')||'não inferidos')}</code><h4>Plano</h4><ol>${p.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><h4>Validação</h4><ul>${p.verification.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article>`).join('')
const html=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Repair Advisor</title><style>body{font-family:Inter,Arial;background:#f5f6f8;color:#17191c;margin:0;padding:28px}.wrap{max-width:1120px;margin:auto}.hero,article,.rules{background:white;border:1px solid #e3e6eb;border-radius:16px;padding:20px;margin-bottom:14px}.status{font-size:30px;font-weight:900}.row{display:flex;gap:12px;align-items:center}.row span{background:#f1f3f5;border-radius:999px;padding:4px 9px;font-size:12px}code{display:block;white-space:normal;background:#f6f7f9;padding:10px;border-radius:8px}@media(max-width:700px){body{padding:12px}}</style></head><body><div class="wrap"><section class="hero"><div>DiskIngressos PDT • QA Intelligence</div><h1>Playwright Repair Advisor</h1><div class="status">${status}</div><p>${payload.generatedAt}</p></section><section class="rules"><h2>Guardrails</h2><ul>${protectedRules.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>${cards||'<article><h2>Nenhum reparo necessário</h2></article>'}</div></body></html>`
fs.writeFileSync(path.join(outDir,'REPAIR_ADVISOR.html'),html)
console.log(`[repair-advisor] ${status}: ${plans.length} plano(s) gerado(s)`)
