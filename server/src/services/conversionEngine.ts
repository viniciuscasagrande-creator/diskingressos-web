import crypto from 'node:crypto'
import { prisma } from '../prisma.js'
import { decryptTrackingToken } from './trackingCrypto.js'
import { runWorkerTick } from './marketingTrackingWorker.js'

type CanonicalEvent='page_view'|'view_content'|'add_to_cart'|'begin_checkout'|'add_payment_info'|'purchase'|'lead'|'sign_up'

type DispatchInput={
 eventId:string; eventName:CanonicalEvent; occurredAt?:Date; producerId:number; eventEntityId?:number|null; orderId?:number|null;
 valueCents?:number; currency?:string; email?:string|null; phone?:string|null; externalId?:string|null;
 attribution?:Record<string,unknown>|null; metadata?:Record<string,unknown>|null
}

const eventMap:Record<string,Record<string,string>>={
 meta:{page_view:'PageView',view_content:'ViewContent',add_to_cart:'AddToCart',begin_checkout:'InitiateCheckout',add_payment_info:'AddPaymentInfo',purchase:'Purchase',lead:'Lead',sign_up:'CompleteRegistration'},
 tiktok:{page_view:'PageView',view_content:'ViewContent',add_to_cart:'AddToCart',begin_checkout:'InitiateCheckout',add_payment_info:'AddPaymentInfo',purchase:'Purchase',lead:'SubmitForm',sign_up:'CompleteRegistration'},
 ga4:{page_view:'page_view',view_content:'view_item',add_to_cart:'add_to_cart',begin_checkout:'begin_checkout',add_payment_info:'add_payment_info',purchase:'purchase',lead:'generate_lead',sign_up:'sign_up'},
 google_ads:{page_view:'page_view',view_content:'view_content',add_to_cart:'add_to_cart',begin_checkout:'begin_checkout',purchase:'purchase',lead:'lead'},
 linkedin:{page_view:'PageView',view_content:'ViewContent',purchase:'Purchase',lead:'Lead',sign_up:'CompleteRegistration'},
 pinterest:{page_view:'PageVisit',view_content:'ViewCategory',add_to_cart:'AddToCart',begin_checkout:'Checkout',purchase:'Checkout',lead:'Lead',sign_up:'Signup'},
 snapchat:{page_view:'PAGE_VIEW',view_content:'VIEW_CONTENT',add_to_cart:'ADD_CART',begin_checkout:'START_CHECKOUT',purchase:'PURCHASE',sign_up:'SIGN_UP'},
 microsoft_ads:{page_view:'page_view',view_content:'view_content',add_to_cart:'add_to_cart',begin_checkout:'begin_checkout',purchase:'purchase',lead:'lead'},
 gtm:{page_view:'PageView',view_content:'ViewContent',add_to_cart:'AddToCart',begin_checkout:'InitiateCheckout',purchase:'Purchase'},
  clarity:{page_view:'PageView',view_content:'ViewContent',begin_checkout:'InitiateCheckout',purchase:'Purchase'},
  spotify:{page_view:'VIEW',view_content:'PRODUCT',add_to_cart:'ADDTOCART',begin_checkout:'CHECKOUT',add_payment_info:'CHECKOUT',purchase:'PURCHASE',lead:'LEAD',sign_up:'SIGN_UP'}
}

const sha256=(v?:string|null)=>v?crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex'):undefined
const providerEvent=(provider:string,name:string)=>eventMap[provider]?.[name]||name

function buildPayload(provider:string,row:any,input:DispatchInput){
 const mapped=providerEvent(provider,input.eventName),seconds=Math.floor((input.occurredAt||new Date()).getTime()/1000),value=(input.valueCents||0)/100,currency=input.currency||'BRL'
 const user={em:sha256(input.email),ph:sha256(input.phone),external_id:sha256(input.externalId)}
 if(provider==='meta')return {data:[{event_name:mapped,event_time:seconds,event_id:input.eventId,action_source:'website',user_data:user,custom_data:{currency,value,order_id:input.orderId}}]}
 if(provider==='tiktok')return {event_source:'web',event_source_id:row.pixelId,data:[{event:mapped,event_time:seconds,event_id:input.eventId,user:{email:sha256(input.email),phone:sha256(input.phone),external_id:sha256(input.externalId)},properties:{currency,value,order_id:String(input.orderId||'')}}]}
 if(provider==='ga4')return {client_id:input.externalId||input.eventId,events:[{name:mapped,params:{currency,value,transaction_id:String(input.orderId||input.eventId)}}]}
 if(provider==='spotify')return {event_name:mapped,event_time:seconds,event_id:input.eventId,user_data:{email:sha256(input.email),phone_number:sha256(input.phone),external_id:sha256(input.externalId)},custom_data:{currency,value,order_id:input.orderId?String(input.orderId):undefined,content_type:'ticket',event_entity_id:input.eventEntityId},action_source:'WEBSITE'}
 return {event_id:input.eventId,event_name:mapped,event_time:seconds,value,currency,order_id:input.orderId,user,attribution:input.attribution||{},metadata:input.metadata||{}}
}

function matchesRuleEvent(ruleEventName:string,canonicalName:string,providerMappedName:string):boolean{
 const normRule=ruleEventName.toLowerCase().replace(/[^a-z0-9]/g,'')
 const normCanonical=canonicalName.toLowerCase().replace(/[^a-z0-9]/g,'')
 const normMapped=providerMappedName.toLowerCase().replace(/[^a-z0-9]/g,'')
 return normRule===normCanonical||normRule===normMapped
}

export async function dispatchUniversalConversion(input:DispatchInput){
 const existing=await prisma.marketingConversionEvent.findUnique({where:{eventId:input.eventId}})
 if(existing)return {event:existing,deduplicated:true,dispatches:[]}
 const integrations=await prisma.trackingIntegration.findMany({
  where:{
   producerId:input.producerId,
   status:'ativo',
   OR:[
    {applyToAllEvents:true},
    ...(input.eventEntityId?[{events:{some:{eventId:input.eventEntityId,enabled:true}}}]:[])
   ]
  },
  include:{
   events:{
    where:input.eventEntityId?{eventId:input.eventEntityId}:undefined,
    include:{rules:true}
   }
  }
 })
 const event=await prisma.marketingConversionEvent.create({data:{eventId:input.eventId,eventName:input.eventName,occurredAt:input.occurredAt||new Date(),producerId:input.producerId,eventEntityId:input.eventEntityId||null,orderId:input.orderId||null,valueCents:input.valueCents||0,currency:input.currency||'BRL',emailHash:sha256(input.email)||null,phoneHash:sha256(input.phone)||null,externalIdHash:sha256(input.externalId)||null,attributionJson:JSON.stringify(input.attribution||{}),metadataJson:JSON.stringify(input.metadata||{})}})
 const dispatches=[] as any[]
 for(const row of integrations){
  const mapped=providerEvent(row.provider,input.eventName)
  const assignment=row.events?.[0]
  if(assignment){
   if(assignment.enabled===false)continue
   // Se o modo for BROWSER, o backend não executa disparo server-side
   if(assignment.trackingMode==='BROWSER')continue

   if(assignment.rules&&assignment.rules.length>0){
    const matchingRule=assignment.rules.find((r:any)=>matchesRuleEvent(r.eventName,input.eventName,mapped))
    if(matchingRule){
     if(!matchingRule.enabled||!matchingRule.serverEnabled)continue
    } else {
     const enabled=JSON.parse(row.enabledEventsJson||'[]') as string[]
     if(enabled.length&&!enabled.includes(mapped))continue
    }
   } else {
    const enabled=JSON.parse(row.enabledEventsJson||'[]') as string[]
    if(enabled.length&&!enabled.includes(mapped))continue
   }
  } else {
   const enabled=JSON.parse(row.enabledEventsJson||'[]') as string[]
   if(enabled.length&&!enabled.includes(mapped))continue
  }

  const idempotencyKey=`${input.eventId}:${row.id}:${mapped}`
  let dispatch=await prisma.marketingConversionDispatch.findUnique({where:{idempotencyKey}})
  if(dispatch){dispatches.push(dispatch);continue}
  const payload=buildPayload(row.provider,row,input)
  const priority=input.eventName==='purchase'?'HIGH':'NORMAL'
  const deliveryMode=(process.env.MARKETING_DELIVERY_MODE||'dry_run').toLowerCase()

  dispatch=await prisma.marketingConversionDispatch.create({
    data:{
      conversionEventId:event.id,
      integrationId:row.id,
      provider:row.provider,
      providerEventName:mapped,
      idempotencyKey,
      status:'queued',
      priority,
      deliveryMode,
      maxAttempts:5,
      attempts:0,
      payloadJson:JSON.stringify(payload),
      nextAttemptAt:new Date()
    }
  })
  dispatches.push(dispatch)
 }

 // Dispara processamento em background sem travar o checkout
 if(dispatches.length>0){
   setImmediate(()=>{
     runWorkerTick().catch(err=>{
       console.error('[conversionEngine] Erro ao disparar worker assíncrono:', err)
     })
   })
 }

 return {event,deduplicated:false,dispatches}
}


export async function dispatchPurchaseForOrder(orderId:number){
 const order=await prisma.order.findUnique({where:{id:orderId},include:{attribution:{include:{trackingLink:true}}}});if(!order||order.status!=='pago')return null
 return dispatchUniversalConversion({eventId:`purchase:${order.code}`,eventName:'purchase',occurredAt:order.updatedAt,producerId:order.producerId,eventEntityId:order.eventId,orderId:order.id,valueCents:order.grossCents,currency:'BRL',email:order.buyerEmail,externalId:`order:${order.id}`,attribution:order.attribution?{source:order.attribution.trackingLink.source,campaign:order.attribution.trackingLink.campaign,medium:order.attribution.trackingLink.medium}:null,metadata:{orderCode:order.code,quantity:order.quantity,paymentMethod:order.paymentMethod}})
}
