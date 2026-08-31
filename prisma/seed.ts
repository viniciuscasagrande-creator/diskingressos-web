import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
const prisma = new PrismaClient()

function demoToken(token:string){
  const secret=process.env.TRACKING_TOKEN_SECRET||process.env.JWT_SECRET||'dev-only-change-me'
  const key=crypto.createHash('sha256').update(secret).digest();const iv=crypto.randomBytes(12);const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);const ciphertext=Buffer.concat([cipher.update(token,'utf8'),cipher.final()]);const tag=cipher.getAuthTag();return {tokenCiphertext:ciphertext.toString('base64'),tokenIv:iv.toString('base64'),tokenTag:tag.toString('base64'),tokenLast4:token.slice(-4)}
}

async function main(){
  await prisma.trackingDeliveryLog.deleteMany()
  await prisma.trackingIntegrationEvent.deleteMany()
  await prisma.trackingIntegration.deleteMany()
  await prisma.contactConsent.deleteMany()
  await prisma.communicationChannel.deleteMany()
  await prisma.ticketMessage.deleteMany()
  await prisma.serviceTicket.deleteMany()
  await prisma.slaPolicy.deleteMany()
  await prisma.supportIntegration.deleteMany()
  await prisma.automationExecution.deleteMany()
  await prisma.recoveryAttempt.deleteMany()
  await prisma.recoveryOpportunity.deleteMany()
  await prisma.messageTemplate.deleteMany()
  await prisma.automationFlow.deleteMany()
  await prisma.trackingJourneyAction.deleteMany()
  await prisma.trackingAttribution.deleteMany()
  await prisma.trackingLink.deleteMany()
  await prisma.trackingConfig.deleteMany()
  await prisma.marketingCampaign.deleteMany()
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
    {name:'Financeiro FEP',email:'financeiro@fep.com.br',password:'Financeiro@123',role:'producer-finance',producerId:fep.id},
    {name:'Marketing Disk',email:'marketing@diskingressos.com.br',password:'Marketing@123',role:'producer-marketing',producerId:disk.id},
    {name:'Operação Disk',email:'operacao@diskingressos.com.br',password:'Operacao@123',role:'producer-operation',producerId:disk.id},
    {name:'Consulta Disk',email:'consulta@diskingressos.com.br',password:'Consulta@123',role:'viewer',producerId:disk.id}
  ]
  for(const u of users) await prisma.user.create({data:{name:u.name,email:u.email,passwordHash:await bcrypt.hash(u.password,12),role:u.role,producerId:u.producerId}})

  const semParar=await prisma.event.create({data:{code:'1760',title:'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA',venue:'Parque Jaime Lerner',city:'Curitiba - PR',date:'30/06/2027 10:00',available:832,courtesy:584,occupancy:70.2,cover:'nature',status:'ativo',category:'Música',producerId:disk.id}})
  const maiden=await prisma.event.create({data:{code:'3571',title:'IRON MAIDEN SYMPHONIC',venue:'Ópera de Arame',city:'Curitiba - PR',date:'14/03/2027 19:00',available:1596,occupancy:.6,cover:'maiden',status:'ativo',category:'Show',producerId:disk.id}})
  // Fase 16.2: o produtor de demonstração possui 15 eventos e recebe somente esse escopo após o login.
  await prisma.event.createMany({data:[
    {code:'4101',title:'Festival Disk Verão 2027',venue:'Pedreira Paulo Leminski',city:'Curitiba - PR',date:'10/01/2027 16:00',sales:482,available:3518,occupancy:12.1,cover:'nature',status:'ativo',category:'Festival',producerId:disk.id},
    {code:'4102',title:'Rock Experience Curitiba',venue:'Live Curitiba',city:'Curitiba - PR',date:'24/01/2027 20:00',sales:318,available:1182,occupancy:21.2,cover:'maiden',status:'ativo',category:'Show',producerId:disk.id},
    {code:'4103',title:'Sunset Eletrônico',venue:'Parque Barigui',city:'Curitiba - PR',date:'07/02/2027 15:00',sales:721,available:4279,occupancy:14.4,cover:'nature',status:'ativo',category:'Festival',producerId:disk.id},
    {code:'4104',title:'Encontro de Negócios & Inovação',venue:'Expo Unimed Curitiba',city:'Curitiba - PR',date:'18/02/2027 09:00',sales:206,available:794,occupancy:20.6,cover:'conference',status:'ativo',category:'Congresso',producerId:disk.id},
    {code:'4105',title:'Tributo aos Clássicos do Rock',venue:'Teatro Guaíra',city:'Curitiba - PR',date:'05/03/2027 20:30',sales:604,available:496,occupancy:54.9,cover:'maiden',status:'ativo',category:'Show',producerId:disk.id},
    {code:'4106',title:'Festival Gastronômico Curitiba',venue:'Museu Oscar Niemeyer',city:'Curitiba - PR',date:'21/03/2027 11:00',sales:332,available:1668,occupancy:16.6,cover:'nature',status:'ativo',category:'Festival',producerId:disk.id},
    {code:'4107',title:'Conexão Empreendedora 2027',venue:'Centro de Eventos Positivo',city:'Curitiba - PR',date:'09/04/2027 08:30',sales:187,available:813,occupancy:18.7,cover:'conference',status:'ativo',category:'Congresso',producerId:disk.id},
    {code:'4108',title:'Noite Sinfônica Especial',venue:'Ópera de Arame',city:'Curitiba - PR',date:'30/04/2027 20:00',sales:441,available:559,occupancy:44.1,cover:'conference2',status:'ativo',category:'Música',producerId:disk.id},
    {code:'4109',title:'Festival de Inverno Disk',venue:'Parque Tanguá',city:'Curitiba - PR',date:'12/06/2027 14:00',sales:518,available:2482,occupancy:17.3,cover:'nature',status:'ativo',category:'Festival',producerId:disk.id},
    {code:'4110',title:'Tech Experience Paraná',venue:'Viasoft Experience',city:'Curitiba - PR',date:'19/06/2027 09:00',sales:264,available:736,occupancy:26.4,cover:'conference',status:'ativo',category:'Tecnologia',producerId:disk.id},
    {code:'4111',title:'Especial MPB ao Ar Livre',venue:'Parque São Lourenço',city:'Curitiba - PR',date:'18/07/2027 16:00',sales:395,available:1605,occupancy:19.8,cover:'nature',status:'ativo',category:'Música',producerId:disk.id},
    {code:'4112',title:'Arena Gamer Curitiba',venue:'Expo Barigui',city:'Curitiba - PR',date:'07/08/2027 10:00',sales:807,available:3193,occupancy:20.2,cover:'conference2',status:'ativo',category:'Games',producerId:disk.id},
    {code:'4113',title:'Experience 80 & 90',venue:'Live Curitiba',city:'Curitiba - PR',date:'28/08/2027 21:00',sales:276,available:724,occupancy:27.6,cover:'maiden',status:'rascunho',category:'Show',producerId:disk.id}
  ]})
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


  await prisma.marketingCampaign.createMany({data:[
    {name:'Lançamento Iron Maiden',channel:'instagram',objective:'conversao',status:'ativa',budgetCents:1000000,spentCents:580000,revenueCents:4500000,impressions:168000,clicks:10400,conversions:850,producerId:disk.id,eventId:maiden.id},
    {name:'Último Lote',channel:'whatsapp',objective:'conversao',status:'ativa',budgetCents:300000,spentCents:180000,revenueCents:3200000,impressions:48000,clicks:5200,conversions:540,producerId:disk.id,eventId:maiden.id},
    {name:'Conferência 2027',channel:'google',objective:'vendas',status:'rascunho',budgetCents:250000,producerId:fep.id,eventId:conferencia.id}
  ]})

  // Fase 21.1.3 — massa de teste de Marketing para TODOS os eventos da produtora Disk.
  // Permite validar o Dashboard trocando o seletor de evento sem cair em telas vazias.
  const diskEventsForMarketing = await prisma.event.findMany({where:{producerId:disk.id},select:{id:true,title:true,code:true}})
  const eventsAlreadySeeded = new Set([maiden.id])
  for (const [index,event] of diskEventsForMarketing.entries()) {
    if (eventsAlreadySeeded.has(event.id)) continue
    const base = 120000 + (index * 17000)
    const spentMeta = base
    const spentGoogle = Math.round(base * 0.62)
    const spentWhatsapp = Math.round(base * 0.22)
    const factor = 4.1 + ((index % 5) * 0.55)
    await prisma.marketingCampaign.createMany({data:[
      {name:`Meta • ${event.title}`,channel:'meta',objective:'conversao',status:'ativa',budgetCents:Math.round(spentMeta*1.8),spentCents:spentMeta,revenueCents:Math.round(spentMeta*factor),impressions:28000+(index*4100),clicks:1200+(index*170),conversions:72+(index*9),producerId:disk.id,eventId:event.id},
      {name:`Google • ${event.title}`,channel:'google',objective:'vendas',status:index%4===0?'pausada':'ativa',budgetCents:Math.round(spentGoogle*1.7),spentCents:spentGoogle,revenueCents:Math.round(spentGoogle*(factor-.45)),impressions:19000+(index*2700),clicks:850+(index*120),conversions:49+(index*7),producerId:disk.id,eventId:event.id},
      {name:`WhatsApp • ${event.title}`,channel:'whatsapp',objective:'remarketing',status:'ativa',budgetCents:Math.round(spentWhatsapp*1.5),spentCents:spentWhatsapp,revenueCents:Math.round(spentWhatsapp*(factor+1.2)),impressions:6200+(index*850),clicks:510+(index*65),conversions:38+(index*5),producerId:disk.id,eventId:event.id}
    ]})
  }

  await prisma.trackingConfig.createMany({data:[
    {provider:'ga4',scope:'global',mode:'own',externalId:'G-DISKGLOBAL'},
    {provider:'meta_pixel',scope:'producer',mode:'own',externalId:'PIXEL-DISK-001',producerId:disk.id},
    {provider:'gtm',scope:'producer',mode:'own',externalId:'GTM-DISK01',producerId:disk.id},
    {provider:'google_ads',scope:'event',mode:'disabled',producerId:disk.id,eventId:maiden.id}
  ]})

  await prisma.trackingLink.createMany({data:[
    {code:'ig-maiden',name:'Instagram Iron Maiden',destination:'https://www.diskingressos.com.br/evento/iron-maiden',source:'instagram',medium:'social',campaign:'lancamento-maiden',producerId:disk.id,eventId:maiden.id,clicks:1240,conversions:86},
    {code:'wa-maiden',name:'WhatsApp Último Lote',destination:'https://www.diskingressos.com.br/evento/iron-maiden',source:'whatsapp',medium:'message',campaign:'ultimo-lote',producerId:disk.id,eventId:maiden.id,clicks:870,conversions:64}
  ]})
  const instagramLink=await prisma.trackingLink.findUniqueOrThrow({where:{code:'ig-maiden'}})
  const whatsappLink=await prisma.trackingLink.findUniqueOrThrow({where:{code:'wa-maiden'}})
  const actionPlan:Array<[string,number]>=[['added',36],['removed',10],['abandoned',1],['finalized',7]]
  const finalValues=[8050,9500,12000,15000,11000,12700,1900]
  let seq=0; let finalIdx=0
  for(const [action,count] of actionPlan){
    for(let i=0;i<count;i++){
      const day=19+(seq%5); const hour=12+(seq%9); const minute=(seq*7)%60
      await prisma.trackingJourneyAction.create({data:{action,orderCode:`#${16358000+Math.floor(seq/2)}`,customerName:['Ana Souza','Bruno Lima','Carla Mendes','Diego Alves'][seq%4],customerEmail:`cliente${(seq%12)+1}@example.com`,ticketSummary:action==='removed'?`${1+(seq%3)}x Sem modalidade`:`${1+(seq%2)}x INTEIRA - LOTE 02`,amountCents:action==='finalized'?finalValues[finalIdx++]:0,trackingLinkId:instagramLink.id,producerId:disk.id,eventId:maiden.id,createdAt:new Date(`2026-08-${String(day).padStart(2,'0')}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00`)}})
      seq++
    }
  }

  // Fase 16.5 — sessões de atribuição UTM: first-touch persistente até a compra ou abandono.
  const now=new Date('2026-08-23T20:00:00')
  const attr1=await prisma.trackingAttribution.create({data:{sessionKey:'utm-demo-instagram-001',visitorKey:'visitor-ana',status:'converted',landingUrl:instagramLink.destination,customerName:'Ana Souza',customerEmail:'ana.utm@example.com',cartValueCents:21800,trackingLinkId:instagramLink.id,producerId:disk.id,eventId:maiden.id,orderId:o1.id,firstSeenAt:new Date('2026-08-23T18:55:00'),lastActivityAt:new Date('2026-08-23T19:06:00'),expiresAt:new Date('2026-09-22T18:55:00'),convertedAt:new Date('2026-08-23T19:06:00')}})
  const attr2=await prisma.trackingAttribution.create({data:{sessionKey:'utm-demo-whatsapp-002',visitorKey:'visitor-julia',status:'abandoned',landingUrl:whatsappLink.destination,customerName:'Julia Martins',customerEmail:'julia.utm@example.com',customerPhone:'+5541999990001',cartValueCents:43600,trackingLinkId:whatsappLink.id,producerId:disk.id,eventId:maiden.id,firstSeenAt:new Date('2026-08-23T17:05:00'),lastActivityAt:new Date('2026-08-23T17:18:00'),expiresAt:new Date('2026-09-22T17:05:00'),abandonedAt:new Date('2026-08-23T17:48:00')}})
  const recUtm=await prisma.recoveryOpportunity.create({data:{code:'REC-UTM-DEMO',kind:'carrinho',customerName:'Julia Martins',email:'julia.utm@example.com',phone:'+5541999990001',amountCents:43600,status:'em_recuperacao',preferredChannel:'whatsapp',lastActivityAt:new Date('2026-08-23T17:18:00'),firstContactAt:new Date('2026-08-23T17:50:00'),nextAttemptAt:new Date('2026-08-23T18:20:00'),attemptCount:1,producerId:disk.id,eventId:maiden.id,trackingLinkId:whatsappLink.id,attributionId:attr2.id}})
  await prisma.trackingJourneyAction.createMany({data:[
    {action:'added',orderCode:'#16359001',customerName:'Marina Costa',ticketSummary:'2x INTEIRA - LOTE 02',trackingLinkId:whatsappLink.id,producerId:disk.id,eventId:maiden.id,createdAt:new Date('2026-08-23T17:12:00')},
    {action:'abandoned',orderCode:'#16359001',customerName:'Marina Costa',ticketSummary:'2x INTEIRA - LOTE 02',trackingLinkId:whatsappLink.id,producerId:disk.id,eventId:maiden.id,createdAt:new Date('2026-08-23T17:18:00')},
    {action:'finalized',orderCode:'#16359002',customerName:'Paulo Reis',ticketSummary:'1x INTEIRA - LOTE 02',amountCents:21800,trackingLinkId:whatsappLink.id,producerId:disk.id,eventId:maiden.id,createdAt:new Date('2026-08-23T18:21:00')}
  ]})
  const pixelPrincipal=await prisma.trackingIntegration.create({data:{name:'Pixel Principal',provider:'meta',integrationType:'pixel_capi',pixelId:'123456789012345',status:'ativo',applyToAllEvents:true,enabledEventsJson:JSON.stringify(['PageView','ViewContent','AddToCart','InitiateCheckout','Purchase']),producerId:disk.id,...demoToken('DEMO_META_TOKEN_PRINCIPAL_4F8A')}})
  const pixelAgencia=await prisma.trackingIntegration.create({data:{name:'Pixel Agência / Performance',provider:'meta',integrationType:'pixel_capi',pixelId:'987654321098765',status:'ativo',applyToAllEvents:false,enabledEventsJson:JSON.stringify(['PageView','ViewContent','InitiateCheckout','Purchase','Lead']),producerId:disk.id,...demoToken('DEMO_META_TOKEN_AGENCIA_92BC'),events:{create:[{eventId:maiden.id},{eventId:semParar.id}]}}})
  await prisma.trackingDeliveryLog.createMany({data:[
    {integrationId:pixelPrincipal.id,producerId:disk.id,eventId:maiden.id,eventName:'Purchase',status:'ok',responseCode:200,message:'Evento de demonstração registrado.'},
    {integrationId:pixelAgencia.id,producerId:disk.id,eventId:maiden.id,eventName:'InitiateCheckout',status:'ok',responseCode:200,message:'Evento de demonstração registrado.'}
  ]})




  const cartFlow=await prisma.automationFlow.create({data:{name:'Carrinho 30 min',trigger:'cart_abandoned',channel:'whatsapp',audience:'checkout abandonado',status:'ativo',delayMinutes:30,sentCount:124,convertedCount:28,revenueCents:612000,producerId:disk.id,eventId:maiden.id}})
  await prisma.recoveryOpportunity.update({where:{id:recUtm.id},data:{flowId:cartFlow.id}})
  await prisma.recoveryAttempt.create({data:{channel:'whatsapp',destination:'+5541999990001',status:'sent',attemptNumber:1,templateName:'Carrinho - lembrete rápido',messagePreview:'Olá Julia Martins! Seu ingresso ainda está no carrinho. Retome a compra pelo link da campanha.',scheduledAt:new Date('2026-08-23T17:50:00'),sentAt:new Date('2026-08-23T17:50:05'),deliveredAt:new Date('2026-08-23T17:50:07'),producerId:disk.id,eventId:maiden.id,recoveryId:recUtm.id,flowId:cartFlow.id}})
  const pixFlow=await prisma.automationFlow.create({data:{name:'PIX pendente 15 min',trigger:'payment_pending',channel:'multicanal',audience:'pagamento pendente',status:'ativo',delayMinutes:15,sentCount:96,convertedCount:19,revenueCents:414200,producerId:disk.id,eventId:maiden.id}})
  await prisma.automationFlow.createMany({data:[
    {name:'Último Lote',trigger:'last_lot',channel:'whatsapp',audience:'leads interessados',status:'ativo',delayMinutes:0,sentCount:580,convertedCount:42,revenueCents:915600,producerId:disk.id,eventId:maiden.id},
    {name:'Pós-evento +30 dias',trigger:'post_event',channel:'email',audience:'participantes',status:'ativo',delayMinutes:43200,sentCount:1480,convertedCount:31,revenueCents:248000,producerId:disk.id,eventId:semParar.id},
    {name:'Aniversariantes',trigger:'birthday',channel:'email',audience:'clientes',status:'rascunho',delayMinutes:0,producerId:fep.id,eventId:conferencia.id}
  ]})
  await prisma.messageTemplate.createMany({data:[
    {name:'Carrinho - lembrete rápido',channel:'whatsapp',category:'remarketing',body:'Olá {{nome}}! Seu ingresso para {{evento}} ainda está no carrinho. Finalize aqui: {{link}}',producerId:disk.id,eventId:maiden.id},
    {name:'Compra confirmada',channel:'whatsapp',category:'transacional',body:'Olá {{nome}}! Compra confirmada para {{evento}}. Seu ingresso: {{link_ingresso}}',producerId:disk.id,eventId:maiden.id},
    {name:'PIX pendente',channel:'email',category:'remarketing',subject:'Finalize seu pagamento para {{evento}}',body:'Olá {{nome}}, seu PIX ainda está pendente. Retome o pagamento pelo link {{link}}.',producerId:disk.id,eventId:maiden.id},
    {name:'Pós-evento',channel:'email',category:'relacionamento',subject:'Como foi sua experiência em {{evento}}?',body:'Obrigado por participar. Conte como foi sua experiência e veja os próximos eventos.',producerId:disk.id,eventId:semParar.id}
  ]})
  await prisma.automationExecution.createMany({data:[
    {channel:'whatsapp',destination:'+55 41 99999-1001',status:'enviado',scheduledAt:new Date(Date.now()-3600000),executedAt:new Date(Date.now()-3550000),messagePreview:'Seu ingresso ainda está no carrinho.',producerId:disk.id,eventId:maiden.id,flowId:cartFlow.id},
    {channel:'email',destination:'cliente@example.com',status:'enviado',scheduledAt:new Date(Date.now()-1800000),executedAt:new Date(Date.now()-1750000),messagePreview:'Finalize seu PIX.',producerId:disk.id,eventId:maiden.id,flowId:pixFlow.id}
  ]})
  await prisma.recoveryOpportunity.createMany({data:[
    {code:'REC-CART-001',kind:'carrinho',customerName:'Juliana Martins',email:'juliana@example.com',phone:'+55 41 99999-2001',amountCents:43600,status:'aberto',preferredChannel:'whatsapp',producerId:disk.id,eventId:maiden.id},
    {code:'REC-CART-002',kind:'carrinho',customerName:'Eduardo Lima',email:'eduardo@example.com',amountCents:21800,status:'recuperado',preferredChannel:'email',recoveredAt:new Date(),revenueCents:21800,producerId:disk.id,eventId:maiden.id},
    {code:'REC-PIX-001',kind:'pagamento',customerName:'Renata Alves',email:'renata@example.com',phone:'+55 41 99999-2003',amountCents:65400,status:'aberto',preferredChannel:'whatsapp',producerId:disk.id,eventId:maiden.id},
    {code:'REC-INAT-001',kind:'inativo',customerName:'Paulo Mendes',email:'paulo@example.com',amountCents:0,status:'aberto',preferredChannel:'email',producerId:disk.id,eventId:semParar.id},
    {code:'REC-POST-001',kind:'pos_evento',customerName:'Camila Rocha',email:'camila@example.com',amountCents:12000,status:'aberto',preferredChannel:'email',producerId:disk.id,eventId:semParar.id},
    {code:'REC-FEP-001',kind:'carrinho',customerName:'Ana Ribeiro',email:'ana@example.com',amountCents:9000,status:'aberto',preferredChannel:'email',producerId:fep.id,eventId:conferencia.id}
  ]})



  await prisma.communicationChannel.createMany({data:[
    {type:'whatsapp',provider:'Meta WhatsApp Business Platform',sender:'+55 41 3000-0000',status:'ativo',producerId:disk.id},
    {type:'email',provider:'SMTP / provedor transacional',sender:'atendimento@diskingressos.com.br',status:'ativo',producerId:disk.id},
    {type:'email',provider:'SMTP / provedor transacional',sender:'sac@fep.com.br',status:'pendente',producerId:fep.id}
  ]})
  await prisma.contactConsent.createMany({data:[
    {contact:'marina@example.com',channel:'email',status:'optin',source:'checkout',producerId:disk.id},
    {contact:'+55 41 99999-1001',channel:'whatsapp',status:'optin',source:'checkout',producerId:disk.id},
    {contact:'renata@example.com',channel:'email',status:'optout',source:'central_preferencias',producerId:disk.id}
  ]})

  await prisma.slaPolicy.createMany({data:[
    {name:'Crítico / indisponibilidade',priority:'P1',responseMinutes:15,resolutionMinutes:240,businessHours:'24x7',producerId:disk.id},
    {name:'Alto impacto',priority:'P2',responseMinutes:30,resolutionMinutes:480,businessHours:'24x7',producerId:disk.id},
    {name:'Impacto moderado',priority:'P3',responseMinutes:120,resolutionMinutes:1440,businessHours:'Comercial',producerId:disk.id},
    {name:'Baixo impacto',priority:'P4',responseMinutes:240,resolutionMinutes:2880,businessHours:'Comercial',producerId:disk.id},
    {name:'Crítico / indisponibilidade',priority:'P1',responseMinutes:15,resolutionMinutes:240,businessHours:'24x7',producerId:fep.id},
    {name:'Alto impacto',priority:'P2',responseMinutes:30,resolutionMinutes:480,businessHours:'24x7',producerId:fep.id},
    {name:'Impacto moderado',priority:'P3',responseMinutes:120,resolutionMinutes:1440,businessHours:'Comercial',producerId:fep.id},
    {name:'Baixo impacto',priority:'P4',responseMinutes:240,resolutionMinutes:2880,businessHours:'Comercial',producerId:fep.id}
  ]})
  await prisma.supportIntegration.createMany({data:[
    {name:'WhatsApp Business',type:'whatsapp',status:'configurado',description:'Entrada e atualização de chamados pelo canal WhatsApp.',producerId:disk.id},
    {name:'E-mail SAC',type:'email',status:'configurado',description:'Converte e-mails recebidos em chamados e registra respostas.',producerId:disk.id},
    {name:'Eventos e Ingressos',type:'internal',status:'ativo',description:'Relaciona chamado ao evento, pedido, ingresso e participante.',producerId:disk.id},
    {name:'Financeiro',type:'internal',status:'ativo',description:'Consulta status de pagamento, estorno e repasse.',producerId:disk.id},
    {name:'E-mail SAC',type:'email',status:'configurado',description:'Entrada de chamados por e-mail.',producerId:fep.id}
  ]})
  const sac1=await prisma.serviceTicket.create({data:{code:'SAC-000001',subject:'Ingresso não recebido por e-mail',description:'Cliente informa pagamento aprovado, porém não recebeu o ingresso.',category:'ingresso',impact:'medio',urgency:'alta',priority:'P2',status:'em-atendimento',channel:'whatsapp',requesterName:'Marina Costa',requesterEmail:'marina@example.com',requesterPhone:'+55 41 99999-1001',assignedTo:'Equipe N1',responseDueAt:new Date(Date.now()+20*60000),resolutionDueAt:new Date(Date.now()+6*3600000),producerId:disk.id,eventId:maiden.id}})
  await prisma.serviceTicket.create({data:{code:'SAC-000002',subject:'PIX pendente após pagamento',description:'Solicitante enviou comprovante e pede validação do pagamento.',category:'financeiro',impact:'alto',urgency:'alta',priority:'P1',status:'aberto',channel:'email',requesterName:'Renata Alves',requesterEmail:'renata@example.com',assignedTo:'Financeiro N2',responseDueAt:new Date(Date.now()+15*60000),resolutionDueAt:new Date(Date.now()+4*3600000),producerId:disk.id,eventId:maiden.id}})
  await prisma.serviceTicket.create({data:{code:'SAC-000003',subject:'Dúvida sobre acesso ao evento',description:'Participante quer confirmar horário e portão de entrada.',category:'requisicao',impact:'baixo',urgency:'baixa',priority:'P4',status:'resolvido',channel:'portal',requesterName:'Carlos Souza',requesterEmail:'carlos@example.com',responseDueAt:new Date(Date.now()-24*3600000),resolutionDueAt:new Date(Date.now()+24*3600000),resolvedAt:new Date(),producerId:fep.id,eventId:conferencia.id}})
  await prisma.ticketMessage.create({data:{author:'Equipe N1',body:'Chamado recebido. Validando o pedido e o disparo do ingresso.',channel:'whatsapp',internal:false,producerId:disk.id,ticketId:sac1.id}})

  console.log('Fase 16.6: remarketing automático, fila de recuperação e atribuição UTM inicializados.')
}
main().finally(()=>prisma.$disconnect())
