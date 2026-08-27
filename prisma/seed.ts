import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main(){
  await prisma.checkIn.deleteMany()
  await prisma.posTransaction.deleteMany()
  await prisma.financialTransaction.deleteMany()
  await prisma.payout.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.participant.deleteMany()
  await prisma.order.deleteMany()
  await prisma.posTerminal.deleteMany()
  await prisma.lot.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()
  await prisma.producer.deleteMany()

  const disk = await prisma.producer.create({data:{name:'DiskIngressos Produções',document:'12.345.678/0001-90'}})
  const fep = await prisma.producer.create({data:{name:'FEP Eventos',document:'98.765.432/0001-10'}})

  const users=[
    {name:'Administrador Master',email:'admin@diskingressos.com.br',password:'Admin@123',role:'admin-master',producerId:null},
    {name:'Vinicius Casagrande',email:'vinicius@diskingressos.com.br',password:'Produtor@123',role:'producer-admin',producerId:disk.id},
    {name:'Financeiro FEP',email:'financeiro@fep.com.br',password:'Financeiro@123',role:'producer-finance',producerId:fep.id}
  ]
  for(const u of users) await prisma.user.create({data:{name:u.name,email:u.email,passwordHash:await bcrypt.hash(u.password,12),role:u.role,producerId:u.producerId}})

  const semParar=await prisma.event.create({data:{code:'1760',title:'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA',venue:'Parque Jaime Lerner',city:'Curitiba - PR',date:'30/06/2027 10:00',available:832,courtesy:584,occupancy:70.2,cover:'nature',status:'ativo',category:'Música',producerId:disk.id}})
  const maiden=await prisma.event.create({data:{code:'3571',title:'IRON MAIDEN SYMPHONIC',venue:'Ópera de Arame',city:'Curitiba - PR',date:'14/03/2027 19:00',available:1596,occupancy:.6,cover:'maiden',status:'ativo',category:'Show',producerId:disk.id}})
  const conferencia=await prisma.event.create({data:{code:'3714',title:'29ª Conferência Espírita',venue:'Teatro Positivo',city:'Curitiba - PR',date:'14/03/2027 08:00',available:2188,occupancy:.5,cover:'conference',badge:'29ª Conferência Estadual Espírita',status:'ativo',category:'Congresso',producerId:fep.id}})
  await prisma.event.create({data:{code:'3713',title:'29ª Conferência Espírita',venue:'Teatro Positivo',city:'Curitiba - PR',date:'13/03/2027 08:00',available:2587,occupancy:.5,cover:'conference2',badge:'29ª Conferência Estadual Espírita',status:'ativo',category:'Congresso',producerId:fep.id}})

  const diskLot=await prisma.lot.create({data:{name:'1º Lote',sector:'Pista',priceCents:21800,capacity:1600,sold:10,eventId:maiden.id,producerId:disk.id}})
  const fepLot=await prisma.lot.create({data:{name:'Lote Geral',sector:'Auditório',priceCents:4500,capacity:2200,sold:12,eventId:conferencia.id,producerId:fep.id}})
  await prisma.lot.create({data:{name:'Experiência',sector:'Parque',priceCents:12000,capacity:1400,sold:0,eventId:semParar.id,producerId:disk.id}})

  const p1=await prisma.participant.create({data:{name:'Marina Costa',email:'marina@example.com',document:'123.456.789-00',facialStatus:'aprovado',eventId:maiden.id,producerId:disk.id}})
  const p2=await prisma.participant.create({data:{name:'Carlos Souza',email:'carlos@example.com',facialStatus:'pendente',eventId:conferencia.id,producerId:fep.id}})

  const o1=await prisma.order.create({data:{code:'PED-1001',buyerName:'Marina Costa',buyerEmail:'marina@example.com',paymentMethod:'pix',status:'pago',quantity:1,grossCents:21800,feeCents:1800,netCents:20000,eventId:maiden.id,producerId:disk.id}})
  const t1=await prisma.ticket.create({data:{code:'ING-1001',priceCents:21800,producerId:disk.id,eventId:maiden.id,orderId:o1.id,lotId:diskLot.id,participantId:p1.id}})
  await prisma.financialTransaction.create({data:{code:'FIN-PED-1001',type:'entrada',category:'venda',description:'Venda PED-1001',amountCents:20000,status:'liquidado',producerId:disk.id,eventId:maiden.id,orderId:o1.id}})

  const o2=await prisma.order.create({data:{code:'PED-2001',buyerName:'Carlos Souza',buyerEmail:'carlos@example.com',paymentMethod:'credito',status:'pago',quantity:1,grossCents:4500,feeCents:500,netCents:4000,eventId:conferencia.id,producerId:fep.id}})
  await prisma.ticket.create({data:{code:'ING-2001',priceCents:4500,producerId:fep.id,eventId:conferencia.id,orderId:o2.id,lotId:fepLot.id,participantId:p2.id}})
  await prisma.financialTransaction.create({data:{code:'FIN-PED-2001',type:'entrada',category:'venda',description:'Venda PED-2001',amountCents:4000,status:'liquidado',producerId:fep.id,eventId:conferencia.id,orderId:o2.id}})

  await prisma.checkIn.create({data:{gate:'Portão A',method:'qr',operatorName:'Operação 01',producerId:disk.id,eventId:maiden.id,participantId:p1.id,ticketId:t1.id}})

  const pos=await prisma.posTerminal.create({data:{code:'POS-001',name:'Bilheteria 01',status:'online',operatorName:'Ana',batteryPercent:91,lastSyncAt:new Date(),producerId:disk.id,eventId:maiden.id}})
  await prisma.posTransaction.create({data:{code:'POS-TX-001',amountCents:21800,paymentMethod:'credito',status:'aprovada',producerId:disk.id,eventId:maiden.id,terminalId:pos.id}})

  const payout=await prisma.payout.create({data:{code:'REP-DEMO-001',amountCents:5000,status:'solicitado',bankAccount:'Conta principal',producerId:disk.id}})
  await prisma.financialTransaction.create({data:{code:'FIN-REP-DEMO-001',type:'saida',category:'repasse',description:'Repasse demonstrativo',amountCents:5000,status:'pendente',producerId:disk.id,payoutId:payout.id}})

  console.log('Fase 10: banco inicializado com núcleo operacional, financeiro, POS e multi-produtor.')
}
main().finally(()=>prisma.$disconnect())
