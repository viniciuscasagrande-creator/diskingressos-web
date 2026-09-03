import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const approved = 'tests/visual/reference/central-eventos-approved-reference.png'
const baseline = 'tests/visual-baselines/central-eventos-approved.png'

function fail(message) {
  console.error(`[visual-baseline] FAIL: ${message}`)
  process.exit(1)
}

for (const file of [approved, baseline]) {
  if (!fs.existsSync(file)) fail(`arquivo ausente: ${file}`)
}

const a = fs.readFileSync(approved)
const b = fs.readFileSync(baseline)
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex')
if (a.length !== b.length || sha(a) !== sha(b)) {
  fail('a baseline executável não é idêntica à referência visual aprovada')
}

// PNG IHDR width/height are bytes 16..23, big endian.
const width = a.readUInt32BE(16)
const height = a.readUInt32BE(20)
if (width !== 1520 || height !== 788) {
  fail(`dimensão inesperada: ${width}x${height}; esperado 1520x788`)
}

console.log(`[visual-baseline] PASS: Central de Eventos protegida (${width}x${height}, sha256 ${sha(a).slice(0, 12)}…)`)
