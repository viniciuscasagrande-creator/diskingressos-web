import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const source=path.join(root,'.env.local.postgres.example');
const target=path.join(root,'.env');
if(!fs.existsSync(source)){console.error('Arquivo .env.local.postgres.example não encontrado.');process.exit(1)}
if(fs.existsSync(target) && !fs.existsSync(path.join(root,'.env.before-local-postgres'))){fs.copyFileSync(target,path.join(root,'.env.before-local-postgres'))}
fs.copyFileSync(source,target);
console.log('PostgreSQL local ativado em .env. Backup anterior: .env.before-local-postgres');
