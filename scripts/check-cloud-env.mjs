const required=['DATABASE_URL','JWT_SECRET','FRONTEND_URL'];
const missing=required.filter(k=>!process.env[k]);
if(missing.length){console.error('Variáveis cloud ausentes:',missing.join(', '));process.exit(1)}
if(!process.env.DATABASE_URL.startsWith('postgresql://')&&!process.env.DATABASE_URL.startsWith('postgres://')){console.error('DATABASE_URL deve apontar para PostgreSQL.');process.exit(1)}
console.log('Cloud env OK');
console.log('Frontend permitido:',process.env.FRONTEND_URL);
