import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma=new PrismaClient()
const allow=process.env.ALLOW_CLOUD_DEMO_BOOTSTRAP==='true'
if(!allow) throw new Error('Bootstrap bloqueado. Defina ALLOW_CLOUD_DEMO_BOOTSTRAP=true somente em homologação/demo.')
async function main(){
 const disk=await prisma.producer.upsert({where:{document:'12.345.678/0001-90'},update:{name:'DiskIngressos Produções',status:'ativo'},create:{name:'DiskIngressos Produções',document:'12.345.678/0001-90',status:'ativo'}})
 const passwordHash=await bcrypt.hash(process.env.DEMO_PRODUCER_PASSWORD||'Produtor@123',12)
 await prisma.user.upsert({where:{email:'vinicius@diskingressos.com.br'},update:{producerId:disk.id,role:'producer-admin',status:'ativo'},create:{name:'Vinicius Casagrande',email:'vinicius@diskingressos.com.br',passwordHash,role:'producer-admin',status:'ativo',producerId:disk.id}})
 const defs=[
  ['1760','SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA','Parque Jaime Lerner','Curitiba - PR','30/06/2027 10:00'],
  ['3571','IRON MAIDEN SYMPHONIC','Ópera de Arame','Curitiba - PR','14/03/2027 19:00'],
  ['4101','Festival Disk Verão 2027','Pedreira Paulo Leminski','Curitiba - PR','10/01/2027 16:00'],
  ['4102','Rock Experience Curitiba','Live Curitiba','Curitiba - PR','24/01/2027 20:00'],
  ['4103','Sunset Eletrônico','Parque Barigui','Curitiba - PR','07/02/2027 15:00']
 ] as const
 for(const [code,title,venue,city,date] of defs){
  const event=await prisma.event.upsert({where:{code},update:{producerId:disk.id,title,venue,city,date,status:'ativo'},create:{code,title,venue,city,date,status:'ativo',producerId:disk.id}})
  const campaigns=[['meta',52000,228800],['google',39000,140400],['whatsapp',18000,108000]] as const
  for(const [channel,spent,revenue] of campaigns){
   const name=`${channel.toUpperCase()} • ${title}`
   const found=await prisma.marketingCampaign.findFirst({where:{producerId:disk.id,eventId:event.id,name}})
   if(found) await prisma.marketingCampaign.update({where:{id:found.id},data:{channel,status:'ativa',spentCents:spent,revenueCents:revenue,conversions:Math.max(1,Math.round(revenue/21800)),clicks:650,impressions:12000}})
   else await prisma.marketingCampaign.create({data:{name,channel,objective:'conversao',status:'ativa',budgetCents:spent*2,spentCents:spent,revenueCents:revenue,conversions:Math.max(1,Math.round(revenue/21800)),clicks:650,impressions:12000,producerId:disk.id,eventId:event.id}})
  }
 }
 console.log(`Bootstrap cloud demo concluído para producerId=${disk.id}.`)
}
main().finally(()=>prisma.$disconnect())
