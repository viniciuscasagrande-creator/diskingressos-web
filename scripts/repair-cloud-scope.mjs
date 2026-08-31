import { PrismaClient } from '@prisma/client'
const prisma=new PrismaClient()
const email=(process.env.REPAIR_PRODUCER_EMAIL||'vinicius@diskingressos.com.br').toLowerCase()
const dry=process.env.REPAIR_APPLY!=='true'
try{
 const user=await prisma.user.findUnique({where:{email},include:{producer:true}})
 if(!user) throw new Error(`Usuário ${email} não existe no banco cloud.`)
 console.log('[scope] user', {id:user.id,email:user.email,role:user.role,producerId:user.producerId})
 if(!user.producerId||!user.producer) throw new Error('Usuário produtor sem produtora vinculada. Corrija o producerId antes de prosseguir.')
 const events=await prisma.event.findMany({where:{producerId:user.producerId},select:{id:true,code:true,title:true}})
 const campaigns=await prisma.marketingCampaign.count({where:{producerId:user.producerId}})
 console.log('[scope] producer', {id:user.producer.id,name:user.producer.name,events:events.length,campaigns})
 if(events.length===0){
   console.error('[scope] ERRO: a produtora autenticada não possui eventos neste banco.')
   console.error('[scope] Nenhum dado foi movido automaticamente para evitar atribuir eventos reais à produtora errada.')
   console.error('[scope] Para ambiente de homologação/demo, execute o bootstrap controlado: npm run cloud:bootstrap:demo')
   process.exitCode=2
 } else console.log('[scope] OK: vínculo produtor -> eventos existe.')
 if(dry) console.log('[scope] modo diagnóstico (REPAIR_APPLY não definido).')
} finally {await prisma.$disconnect()}
