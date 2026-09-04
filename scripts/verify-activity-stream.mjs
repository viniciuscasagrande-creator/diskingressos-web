import fs from 'node:fs'
import path from 'node:path'
import { auditActivityStream } from './audit-activity-stream.mjs'

const RELEASE = '26.17.5-historico-atividades-unificado-ptbr-2026-09-04'

export function verifyActivityStream() {
  console.log('================================================================')
  console.log(`VERIFICAÇÃO DE HISTÓRICO DE ATIVIDADES — RELEASE: ${RELEASE}`)
  console.log('================================================================\n')

  const report = auditActivityStream()

  // Verificação adicional de independência de Estornos
  const appContent = fs.readFileSync('src/App.tsx', 'utf8')
  const hasIndependentRefunds = appContent.includes("'finance-refunds'") &&
    fs.existsSync('src/pages/finance/FinanceDisputesHubPage.tsx')

  if (!hasIndependentRefunds) {
    console.error('[FAIL] Proteção de Estornos violada: rota canônica ausente.')
    process.exit(1)
  }

  console.log('[PASS] Verificação de isolamento e integridade do Histórico de Atividades concluída com sucesso!')
  return { status: 'PASS', release: RELEASE, report }
}

if (process.argv[1]?.endsWith('verify-activity-stream.mjs')) {
  verifyActivityStream()
}
