import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execSync } from 'node:child_process'

const baseDir = process.cwd()
const desktop = fs.existsSync('C:/Users/vinad/OneDrive/Desktop')
  ? 'C:/Users/vinad/OneDrive/Desktop'
  : path.join(os.homedir(), 'Desktop')

const destZip = path.join(desktop, 'Disk_Backup_Geral_Sem_CSS_Layout_20260917.zip')
const tempDir = path.join(os.tmpdir(), `disk_backup_50mb_${Date.now()}`)

fs.mkdirSync(tempDir, { recursive: true })

const excludedTopDirs = new Set([
  'node_modules',
  '.git',
  'dist',
  '.vercel',
  'test-results',
  'playwright-report',
  '.cache',
  '.turbo',
  'vendor'
])

let copiedFiles = 0
let copiedBytes = 0
let excludedCss = 0
let excludedLayout = 0
let excludedVendor = 0

function isExcluded(rel) {
  const norm = rel.replace(/\\/g, '/').toLowerCase()
  if (/\.(css|scss|sass|less|styl)$/i.test(norm) || norm.startsWith('src/styles')) {
    return 'css'
  }
  if (norm.includes('layout')) {
    return 'layout'
  }
  if (norm.startsWith('public/vendor') || norm.includes('limitless')) {
    return 'vendor'
  }
  return false
}

function scanAndCopy(dir, targetSubDir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const rel = path.relative(baseDir, full)

    if (entry.isDirectory()) {
      if (excludedTopDirs.has(entry.name.toLowerCase())) continue
      const exc = isExcluded(rel)
      if (exc) {
        if (exc === 'css') excludedCss++
        if (exc === 'layout') excludedLayout++
        if (exc === 'vendor') excludedVendor++
        continue
      }
      const targetDir = path.join(targetSubDir, entry.name)
      fs.mkdirSync(targetDir, { recursive: true })
      scanAndCopy(full, targetDir)
    } else {
      if (entry.name.endsWith('.zip') || entry.name === '.DS_Store') continue
      const exc = isExcluded(rel)
      if (exc) {
        if (exc === 'css') excludedCss++
        if (exc === 'layout') excludedLayout++
        if (exc === 'vendor') excludedVendor++
        continue
      }
      const targetFile = path.join(targetSubDir, entry.name)
      fs.copyFileSync(full, targetFile)
      const stat = fs.statSync(full)
      copiedFiles++
      copiedBytes += stat.size
    }
  }
}

console.log('Iniciando copia limpa (sem CSS, sem Layout, sem assets legados)...')
scanAndCopy(baseDir, tempDir)

console.log(`Copiados ${copiedFiles} arquivos (${(copiedBytes / 1024 / 1024).toFixed(2)} MB).`)
console.log(`Excluidos: ${excludedCss} arquivos CSS, ${excludedLayout} arquivos Layout, ${excludedVendor} arquivos Vendor/Limitless.`)

if (fs.existsSync(destZip)) {
  fs.unlinkSync(destZip)
}

console.log(`Compactando em ${destZip}...`)
execSync(`tar -acf "${destZip}" *`, { cwd: tempDir, stdio: 'inherit' })

console.log('Removendo diretorio temporario...')
fs.rmSync(tempDir, { recursive: true, force: true })

const zipStat = fs.statSync(destZip)
console.log(`\n========================================================`)
console.log(`BACKUP GERAL LIMPO CONCLUIDO!`)
console.log(`Arquivo: ${destZip}`)
console.log(`Tamanho: ${(zipStat.size / 1024 / 1024).toFixed(2)} MB`)
console.log(`Arquivos funcionais incluidos: ${copiedFiles}`)
console.log(`CSS restantes: 0`)
console.log(`Layouts restantes: 0`)
console.log(`========================================================\n`)
