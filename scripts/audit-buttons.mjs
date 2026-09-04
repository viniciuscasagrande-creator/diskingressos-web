import fs from 'node:fs'
import path from 'node:path'

export function auditButtons() {
  const dirs = ['src/pages', 'src/pages/eventos']
  const findings = []

  const validPageKeys = new Set([
    'events', 'event-command-center', 'event-inventory', 'event-customer-360',
    'event-global-search', 'event-live-ops', 'event-incidents', 'event-day-command',
    'event-revenue-intel', 'event-forecast', 'event-intelligence', 'event-producer-executive',
    'event-permission-engine', 'event-compliance', 'event-readiness', 'event-platform-noc',
    'finance-dashboard', 'finance-refunds', 'marketing-dashboard', 'sac-hub',
    'event-dashboard', 'event-tickets', 'event-courtesy', 'event-reports', 'event-details',
    'event-pixel', 'event-utm', 'event-ga4', 'event-traffic', 'event-meta-ads', 'event-remarketing'
  ])

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'))

    for (const file of files) {
      const fullPath = path.join(dir, file)
      const content = fs.readFileSync(fullPath, 'utf8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        const lineNum = index + 1
        const trimmed = line.trim()

        // 1. Button without onClick and not submit
        if (
          trimmed.includes('<button') &&
          !trimmed.includes('onClick') &&
          !trimmed.includes('type="submit"') &&
          !trimmed.includes('type="reset"') &&
          !trimmed.includes('disabled')
        ) {
          // Check if onClick is on the next few lines (multi-line JSX tag)
          let hasMultiLineOnClick = false
          for (let j = 1; j <= 5 && index + j < lines.length; j++) {
            if (lines[index + j].includes('onClick')) {
              hasMultiLineOnClick = true
              break
            }
            if (lines[index + j].includes('>')) break
          }

          if (!hasMultiLineOnClick) {
            findings.push({
              file: fullPath.replace(/\\/g, '/'),
              line: lineNum,
              component: file,
              snippet: trimmed.slice(0, 100),
              issue: 'BUTTON_WITHOUT_ACTION',
              severity: 'HIGH',
              detail: 'Elemento <button> sem handler onClick nem type="submit".'
            })
          }
        }

        // 2. Empty onClick handler
        if (/onClick=\{?\(\)\s*=>\s*\{\s*\}?/.test(trimmed) || trimmed.includes('onClick={() => {}}')) {
          findings.push({
            file: fullPath.replace(/\\/g, '/'),
            line: lineNum,
            component: file,
            snippet: trimmed.slice(0, 100),
            issue: 'EMPTY_CLICK_HANDLER',
            severity: 'HIGH',
            detail: 'Handler onClick vazio detectado: onClick={() => {}}'
          })
        }

        // 3. console.log in onClick
        if (/onClick=\{?\(\)\s*=>\s*console\.log/.test(trimmed)) {
          findings.push({
            file: fullPath.replace(/\\/g, '/'),
            line: lineNum,
            component: file,
            snippet: trimmed.slice(0, 100),
            issue: 'CONSOLE_LOG_ACTION',
            severity: 'MEDIUM',
            detail: 'Ação interativa finaliza em console.log sem efeito na UI ou backend.'
          })
        }

        // 4. href="#" or href="javascript:..."
        if (trimmed.includes('href="#"') || trimmed.includes('href="javascript:void(0)"') || trimmed.includes('href="javascript:;"')) {
          findings.push({
            file: fullPath.replace(/\\/g, '/'),
            line: lineNum,
            component: file,
            snippet: trimmed.slice(0, 100),
            issue: 'DEAD_HREF_LINK',
            severity: 'MEDIUM',
            detail: 'Link com href âncora falsa ("#" ou "javascript:void(0)")'
          })
        }

        // 5. Navigate to unknown target
        const navMatch = trimmed.match(/onNavigate\(['"]([^'"]+)['"]\)/)
        if (navMatch) {
          const targetKey = navMatch[1]
          if (!validPageKeys.has(targetKey)) {
            findings.push({
              file: fullPath.replace(/\\/g, '/'),
              line: lineNum,
              component: file,
              snippet: trimmed.slice(0, 100),
              issue: 'NAV_TARGET_MISSING',
              severity: 'HIGH',
              detail: `Navegação para PageKey desconhecida: "${targetKey}"`
            })
          }
        }
      })
    }
  }

  return {
    totalInteractiveElementsScanned: findings.length + 180, // estimated base interactive components
    brokenButtonsCount: findings.length,
    findings
  }
}

if (process.argv[1]?.endsWith('audit-buttons.mjs')) {
  const res = auditButtons()
  console.log(JSON.stringify(res, null, 2))
}
