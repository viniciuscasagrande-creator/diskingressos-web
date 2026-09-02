import crypto from 'node:crypto'
import { prisma } from '../prisma.js'

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
 clarity:{page_view:'PageView',view_content:'ViewContent',begin_checkout:'InitiateCheckout',purchase:'Purchase'}
}

const sha256=(v?:string|null)=>v?crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex'):undefined
const providerEvent=(provider:string,name:string)=>eventMap[provider]?.[name]||name
const decrypt=(row:any)=>{if(!row.tokenCiphertext||!row.tokenIv||!row.tokenTag)return null;const secret=process.env.TRACKING_TOKEN_SECRET||process.env.JWT_SECRET||'dev-only-change-me';const key=crypto.createHash('sha256').update(secret).digest();const decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(row.tokenIv,'base64'));decipher.setAuthTag(Buffer.from(row.tokenTag,'base64'));return Buffer.concat([decipher.update(Buffer.from(row.tokenCiphertext,'base64')),decipher.final()]).toString('utf8')}

function buildPayload(provider:string,row:any,input:DispatchInput){
 const mapped=providerEvent(provider,input.eventName),seconds=Math.floor((input.occurredAt||new Date()).getTime()/1000),value=(input.valueCents||0)/100,currency=input.currency||'BRL'
 const user={em:sha256(input.email),ph:sha256(input.phone),external_id:sha256(input.externalId)}
 if(provider==='meta')return {data:[{event_name:mapped,event_time:seconds,event_id:input.eventId,action_source:'website',user_data:user,custom_data:{currency,value,order_id:input.orderId}}]}
 if(provider==='tiktok')return {event_source:'web',event_source_id:row.pixelId,data:[{event:mapped,event_time:seconds,event_id:input.eventId,user:{email:sha256(input.email),phone:sha256(input.phone),external_id:sha256(input.externalId)},properties:{currency,value,order_id:String(input.orderId||'')}}]}
 if(provider==='ga4')return {client_id:input.externalId||input.eventId,events:[{name:mapped,params:{currency,value,transaction_id:String(input.orderId||input.eventId)}}]}
 return {event_id:input.eventId,event_name:mapped,event_time:seconds,value,currency,order_id:input.orderId,user,attribution:input.attribution||{},metadata:input.metadata||{}}
}

async function deliver(row:any,payload:any){
 const mode=(process.env.MARKETING_DELIVERY_MODE||'dry_run').toLowerCase();if(mode!=='live')return {status:'dry_run',code:202,message:'Evento preparado. MARKETING_DELIVERY_MODE não está em live.'}
 const token=decrypt(row);if(!token)return {status:'erro',code:400,message:'Credencial não configurada.'}
 let url:string|undefined,headers:Record<string,string>={'content-type':'application/json'}
 if(row.provider==='meta'){url=`https://graph.facebook.com/v21.0/${encodeURIComponent(row.pixelId)}/events?access_token=${encodeURIComponent(token)}`}
 else if(row.provider==='tiktok'){url='https://business-api.tiktok.com/open_api/v1.3/event/track/';headers['Access-Token']=token}
 else if(row.provider==='ga4'){url=`https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(row.pixelId)}&api_secret=${encodeURIComponent(token)}`}
 else return {status:'queued',code:202,message:`Conector ${row.provider} preparado para worker/OAuth específico.`}
 try{const response=await fetch(url,{method:'POST',headers,body:JSON.stringify(payload)});const text=(await response.text()).slice(0,600);return {status:response.ok?'ok':'erro',code:response.status,message:text||response.statusText}}
 catch(error:any){return {status:'erro',code:503,message:error?.message||'Falha de rede no provedor.'}}
}

export async function dispatchUniversalConversion(input:DispatchInput){
 const existing=await prisma.marketingConversionEvent.findUnique({where:{eventId:input.eventId}})
 if(existing)return {event:existing,deduplicated:true,dispatches:[]}
 const integrations=await prisma.trackingIntegration.findMany({where:{producerId:input.producerId,status:'ativo',OR:[{applyToAllEvents:true},...(input.eventEntityId?[{events:{some:{eventId:input.eventEntityId}}}]:[])]},include:{events:true}})
 const event=await prisma.marketingConversionEvent.create({data:{eventId:input.eventId,eventName:input.eventName,occurredAt:input.occurredAt||new Date(),producerId:input.producerId,eventEntityId:input.eventEntityId||null,orderId:input.orderId||null,valueCents:input.valueCents||0,currency:input.currency||'BRL',emailHash:sha256(input.email)||null,phoneHash:sha256(input.phone)||null,externalIdHash:sha256(input.externalId)||null,attributionJson:JSON.stringify(input.attribution||{}),metadataJson:JSON.stringify(input.metadata||{})}})
 const dispatches=[] as any[]
 for(const row of integrations){
  const enabled=JSON.parse(row.enabledEventsJson||'[]') as string[];const mapped=providerEvent(row.provider,input.eventName);if(enabled.length&&!enabled.includes(mapped))continue
  const idempotencyKey=`${input.eventId}:${row.id}:${mapped}`;let dispatch=await prisma.marketingConversionDispatch.findUnique({where:{idempotencyKey}});if(dispatch){dispatches.push(dispatch);continue}
  const payload=buildPayload(row.provider,row,input);dispatch=await prisma.marketingConversionDispatch.create({data:{conversionEventId:event.id,integrationId:row.id,provider:row.provider,providerEventName:mapped,idempotencyKey,status:'processing',attempts:1,payloadJson:JSON.stringify(payload),nextAttemptAt:new Date()}})
  const result=await deliver(row,payload);dispatch=await prisma.marketingConversionDispatch.update({where:{id:dispatch.id},data:{status:result.status,responseCode:result.code,responseMessage:result.message,lastAttemptAt:new Date(),sentAt:result.status==='ok'?new Date():null,nextAttemptAt:result.status==='erro'?new Date(Date.now()+5*60*1000):null}})
  await prisma.trackingDeliveryLog.create({data:{integrationId:row.id,producerId:input.producerId,eventId:input.eventEntityId||null,eventName:mapped,status:result.status,responseCode:result.code,message:`event_id=${input.eventId} · ${result.message}`}})
  dispatches.push(dispatch)
 }
 return {event,deduplicated:false,dispatches}
}

export async function dispatchPurchaseForOrder(orderId:number){
 const order=await prisma.order.findUnique({where:{id:orderId},include:{attribution:{include:{trackingLink:true}}}});if(!order||order.status!=='pago')return null
 return dispatchUniversalConversion({eventId:`purchase:${order.code}`,eventName:'purchase',occurredAt:order.updatedAt,producerId:order.producerId,eventEntityId:order.eventId,orderId:order.id,valueCents:order.grossCents,currency:'BRL',email:order.buyerEmail,externalId:`order:${order.id}`,attribution:order.attribution?{source:order.attribution.trackingLink.source,campaign:order.attribution.trackingLink.campaign,medium:order.attribution.trackingLink.medium}:null,metadata:{orderCode:order.code,quantity:order.quantity,paymentMethod:order.paymentMethod}})
}
