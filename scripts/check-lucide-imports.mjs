import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx|jsx)$/.test(entry.name)) files.push(full);
  }
}
walk(root);

const lucideUniverse = new Set();
const fileImports = new Map();

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const importedFromLucide = new Set();
  const allImportedSymbols = new Set();

  const importRx = /import\s+([\s\S]*?)\s+from\s+['"][^'"]+['"]/g;
  for (const match of src.matchAll(importRx)) {
    const clause = match[1].trim();
    const defMatch = clause.match(/^([A-Z][A-Za-z0-9_]*)/);
    if (defMatch) allImportedSymbols.add(defMatch[1]);
    const asMatch = clause.match(/\*\s+as\s+([A-Z][A-Za-z0-9_]*)/);
    if (asMatch) allImportedSymbols.add(asMatch[1]);

    const namedMatch = clause.match(/{([\s\S]*?)}/);
    if (namedMatch) {
      for (let part of namedMatch[1].split(',')) {
        part = part.trim().replace(/^type\s+/, '');
        if (!part) continue;
        const local = part.includes(' as ')
          ? part.split(/\s+as\s+/).pop().trim()
          : part;
        if (local) {
          allImportedSymbols.add(local);
          if (match[0].includes('lucide-react')) {
            importedFromLucide.add(local);
            lucideUniverse.add(local);
          }
        }
      }
    }
  }

  fileImports.set(file, { src, importedFromLucide, allImportedSymbols });
}

const errors = [];

for (const [file, { src, importedFromLucide, allImportedSymbols }] of fileImports) {
  const localDefs = new Set([
    ...allImportedSymbols,
    ...[...src.matchAll(/\b(?:const|let|var|function|class|type|interface|enum)\s+([A-Z][A-Za-z0-9_]*)\b/g)].map(m => m[1])
  ]);

  const jsxNames = new Set(
    [...src.matchAll(/<([A-Z][A-Za-z0-9_]*)\b(?=[\s/>])/g)].map(m => m[1])
  );

  for (const name of jsxNames) {
    if (lucideUniverse.has(name) && !localDefs.has(name)) {
      errors.push(`${path.relative(process.cwd(), file)}: ${name} usado no JSX sem import de lucide-react`);
    }
  }
}

if (errors.length) {
  console.error('\n[check:lucide] Imports ausentes encontrados:\n');
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log('[check:lucide] OK — nenhum ícone JSX sem import detectado.');
