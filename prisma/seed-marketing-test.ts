import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(){
  const producer = await prisma.producer.findFirst({where:{name:{contains:'DiskIngressos'}}})
  if(!producer) throw new Error('Produtora DiskIngressos não encontrada. Rode o seed/base inicial primeiro.')
  const events = await prisma.event.findMany({where:{producerId:producer.id},orderBy:{id:'asc'}})
  if(!events.length) throw new Error('Nenhum evento encontrado para a produtora.')
  const channels=[
    {channel:'meta',label:'Meta',share:1,roas:4.8},
    {channel:'google',label:'Google',share:.62,roas:4.15},
    {channel:'whatsapp',label:'WhatsApp',share:.22,roas:6.0},
  ]
  let changed=0
  for(const [i,event] of events.entries()){
    const base=120000+(i*17000)
    for(const [j,c] of channels.entries()){
      const name=`TESTE • ${c.label} • ${event.title}`
      const spent=Math.round(base*c.share)
      const data={channel:c.channel,objective:j===2?'remarketing':'conversao',status:'ativa',budgetCents:Math.round(spent*1.8),spentCents:spent,revenueCents:Math.round(spent*(c.roas+((i%4)*.2))),impressions:18000+(i*3100)+(j*2200),clicks:780+(i*105)+(j*80),conversions:45+(i*6)+(j*5),producerId:producer.id,eventId:event.id}
      const existing=await prisma.marketingCampaign.findFirst({where:{name,eventId:event.id,producerId:producer.id}})
      if(existing) await prisma.marketingCampaign.update({where:{id:existing.id},data})
      else await prisma.marketingCampaign.create({data:{name,...data}})
      changed++
    }
  }
  console.log(`Marketing test seed: ${changed} campanhas preparadas para ${events.length} eventos.`)
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect())
