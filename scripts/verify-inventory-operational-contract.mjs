import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const files={
  page:'src/pages/EventInventoryPage.tsx',
  api:'src/services/api.ts',
  routes:'server/src/routes/events.ts',
  engine:'server/src/services/inventoryEngine.ts',
}
const required={
  page:[
    'Inventário Operacional','inventory-new-lot','inventory-new-hold','inventory-save-lot',
    'createInventoryLot','updateInventoryLot','updateInventoryLotStatus','releaseInventoryHold',
    'producerId + eventId protegidos no backend'
  ],
  api:[
    'createInventoryLot','updateInventoryLot','updateInventoryLotStatus',
    '/inventory-lots','/inventory-holds'
  ],
  routes:[
    "eventsRouter.post('/:id/inventory-lots'",
    "eventsRouter.patch('/:id/inventory-lots/:lotId'",
    "eventsRouter.patch('/:id/inventory-lots/:lotId/status'",
    "eventsRouter.post('/:id/inventory-holds'",
    "eventsRouter.patch('/:id/inventory-holds/:holdId/release'",
    "Acesso negado a evento de outra produtora."
  ],
  engine:['26.16.3-inventario-operacional-2026-09-04']
}
let failed=false
for(const [key,rel] of Object.entries(files)){
  const full=path.join(root,rel)
  if(!fs.existsSync(full)){console.error(`FAIL ${rel} ausente`);failed=true;continue}
  const text=fs.readFileSync(full,'utf8')
  for(const token of required[key]){
    if(!text.includes(token)){console.error(`FAIL ${rel} não contém: ${token}`);failed=true}
  }
}
if(failed)process.exit(1)
console.log('PASS Fase 26.16.3 — contrato do Inventário Operacional preservado.')
