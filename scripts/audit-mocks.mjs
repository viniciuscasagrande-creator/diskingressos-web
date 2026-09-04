import fs from 'node:fs'
import path from 'node:path'

export function auditMocks() {
  const policy = JSON.parse(fs.readFileSync('event-os-audit.policy.json', 'utf8'))
  const patterns = policy.mockPatterns || [
    'mockData', 'demoData', 'fakeData', 'sampleData', 'Math.random',
    'setTimeout', 'TODO', 'FIXME', 'placeholder', 'coming soon',
    'em breve', 'dados simulados', 'dados de demonstração'
  ]

  const dirs = ['src/pages', 'src/pages/eventos']
  const findings = []

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'))

    for (const file of files) {
      const fullPath = path.join(dir, file)
      const content = fs.readFileSync(fullPath, 'utf8')
      const lines = content.split('\n')

      lines.forEach((line, idx) => {
        const lineNum = idx + 1
        const trimmed = line.trim()

        for (const p of patterns) {
          if (trimmed.toLowerCase().includes(p.toLowerCase())) {
            let severity = 'MEDIUM'
            if (p === 'TODO' || p === 'FIXME') severity = 'LOW'
            if (p === 'fakeData' || p === 'mockData' || p === 'dados simulados') severity = 'HIGH'

            findings.push({
              file: fullPath.replace(/\\/g, '/'),
              line: lineNum,
              component: file,
              pattern: p,
              snippet: trimmed.slice(0, 100),
              severity
            })
            break // avoid duplicate hit on same line
          }
        }

        // Suspicious hardcoded metrics in component state (e.g. const revenue = 482640)
        const hardcodedMetricMatch = trimmed.match(/const\s+(revenue|attendance|sold|gmv|checkins|sales)\s*=\s*([0-9]{3,})/i)
        if (hardcodedMetricMatch) {
          findings.push({
            file: fullPath.replace(/\\/g, '/'),
            line: lineNum,
            component: file,
            pattern: `SUSPECTED_HARDCODED_METRIC (${hardcodedMetricMatch[1]}=${hardcodedMetricMatch[2]})`,
            snippet: trimmed.slice(0, 100),
            severity: 'MEDIUM'
          })
        }
      })
    }
  }

  return {
    totalMockPatternsDetected: findings.length,
    highSeverityCount: findings.filter(f => f.severity === 'HIGH').length,
    findings
  }
}

if (process.argv[1]?.endsWith('audit-mocks.mjs')) {
  const res = auditMocks()
  console.log(JSON.stringify(res, null, 2))
}
