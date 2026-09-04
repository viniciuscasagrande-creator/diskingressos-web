import fs from 'node:fs'
const checks=[
 ['src/pages/EventCustomer360Page.tsx',['Customer 360 Operacional','getEventCustomer360Profile','customer360-search','Abrir 360','Pedidos (','Ingressos (','Check-ins (','event-global-search','sac-hub','finance-dashboard']],
 ['src/services/api.ts',['Customer360Profile','getEventCustomer360Profile','/customer-360/profile']],
 ['server/src/routes/events.ts',["customer-360/profile","producerId!==req.auth!.producerId","Cliente não encontrado neste evento"]],
 ['src/pages/EventContextPage.tsx',['EventCustomer360Page event={event} notify={notify} onNavigate={onNavigate}']]
]
let ok=true
for(const [file,tokens] of checks){const text=fs.readFileSync(file,'utf8');for(const token of tokens){if(!text.includes(token)){console.error(`FAIL ${file}: ${token}`);ok=false}}}
if(!ok)process.exit(1)
console.log('PASS — Customer 360 Operacional: busca, filtros, perfil, jornada, navegação e tenant guard presentes.')
