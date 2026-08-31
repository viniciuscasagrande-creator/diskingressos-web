const api=(process.env.API_PUBLIC_URL||'').replace(/\/$/,'')
if(!api){ console.error('Defina API_PUBLIC_URL=https://seu-backend.up.railway.app'); process.exit(1) }
const health=await fetch(`${api}/api/health`).then(async r=>({status:r.status,body:await r.json().catch(()=>({}))}))
console.log('Health:', health)
if(health.status!==200 || !health.body?.ok || health.body?.database!=='postgresql') process.exit(2)
console.log('Cloud API + PostgreSQL OK.')
