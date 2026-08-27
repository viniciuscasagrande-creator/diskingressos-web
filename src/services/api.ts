import type { AppUser, Producer } from '../auth/model'
const API=import.meta.env.VITE_API_URL||'http://localhost:3333/api'
let token=(typeof window!=='undefined'?(sessionStorage.getItem('disk_token')||localStorage.getItem('disk_token')||''):'')
export function setApiToken(value:string,remember=false){token=value;if(typeof window!=='undefined'){sessionStorage.removeItem('disk_token');localStorage.removeItem('disk_token');(remember?localStorage:sessionStorage).setItem('disk_token',value)}}
export function clearApiToken(){token='';if(typeof window!=='undefined'){sessionStorage.removeItem('disk_token');localStorage.removeItem('disk_token')}}
export function hasStoredToken(){return !!token}
async function request<T>(path:string,options:RequestInit={}){const r=await fetch(`${API}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...(options.headers||{})}});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.message||'Erro na API');return data as T}
export async function login(email:string,password:string){return request<{token:string;user:AppUser}>('/auth/login',{method:'POST',body:JSON.stringify({email,password})})}
export const getMe=()=>request<AppUser>('/auth/me')
export const getProducers=()=>request<Producer[]>('/producers')
export const getUsers=()=>request<AppUser[]>('/users')
export const getEvents=(producerId?:number)=>request<any[]>(`/events${producerId?`?producerId=${producerId}`:''}`)
export const getAudit=()=>request<any[]>('/audit')


export type OperationalSummary={events:number;lots:number;orders:number;tickets:number;participants:number;checkins:number;terminals:number;payouts:number;balanceCents:number}
function qs(values:Record<string,number|undefined>){const p=new URLSearchParams();Object.entries(values).forEach(([k,v])=>{if(v!==undefined)p.set(k,String(v))});const q=p.toString();return q?`?${q}`:''}
export const getOperationalSummary=(producerId?:number)=>request<OperationalSummary>(`/operations/summary${qs({producerId})}`)
export const getLots=(eventId?:number,producerId?:number)=>request<any[]>(`/lots${qs({eventId,producerId})}`)
export const getOrders=(eventId?:number,producerId?:number)=>request<any[]>(`/orders${qs({eventId,producerId})}`)
export const getParticipantsApi=(eventId?:number,producerId?:number)=>request<any[]>(`/participants${qs({eventId,producerId})}`)
export const getCheckins=(eventId?:number,producerId?:number)=>request<any[]>(`/checkins${qs({eventId,producerId})}`)
export const getFinanceBalance=(producerId?:number)=>request<{entriesCents:number;exitsCents:number;balanceCents:number}>(`/finance/balance${qs({producerId})}`)

export const getTickets=(eventId?:number,producerId?:number)=>request<any[]>(`/tickets${qs({eventId,producerId})}`)

export type MarketingCampaign={id:number;name:string;channel:string;objective:string;status:string;budgetCents:number;spentCents:number;revenueCents:number;impressions:number;clicks:number;conversions:number;producerId:number;eventId:number|null;event?:{id:number;title:string}|null;producer?:{id:number;name:string}}
export type TrackingLink={id:number;code:string;name:string;destination:string;source:string|null;medium:string|null;campaign:string|null;content:string|null;term:string|null;clicks:number;conversions:number;producerId:number;eventId:number|null;trackedUrl:string;qrPayload:string;event?:{id:number;title:string}|null}
export type TrackingConfig={id?:number;provider:string;scope:'global'|'producer'|'event';mode:'inherit'|'own'|'disabled';externalId:string|null;configJson?:string|null;producerId?:number|null;eventId?:number|null}
export type ResolvedTracking={provider:string;source:string;mode:string;externalId:string|null;configJson:string|null}
export const getMarketingCampaigns=(producerId?:number,eventId?:number)=>request<MarketingCampaign[]>(`/marketing/campaigns${qs({producerId,eventId})}`)
export const createMarketingCampaign=(body:any)=>request<MarketingCampaign>('/marketing/campaigns',{method:'POST',body:JSON.stringify(body)})
export const updateMarketingCampaign=(id:number,body:any)=>request<MarketingCampaign>(`/marketing/campaigns/${id}`,{method:'PATCH',body:JSON.stringify(body)})
export const getTrackingLinks=(producerId?:number,eventId?:number)=>request<TrackingLink[]>(`/marketing/links${qs({producerId,eventId})}`)
export const createTrackingLink=(body:any)=>request<TrackingLink>('/marketing/links',{method:'POST',body:JSON.stringify(body)})

export type UtmJourneyAction={id:number;action:'added'|'checkout'|'removed'|'abandoned'|'finalized';orderCode:string|null;customerName:string|null;customerEmail:string|null;ticketSummary:string|null;amountCents:number;createdAt:string}
export type UtmSummary={visits:number;attributedSessions:number;activeAttributions:number;abandonedAttributions:number;convertedAttributions:number;added:number;checkout:number;removed:number;abandoned:number;finalized:number;revenueCents:number;avgTicketCents:number;conversionRate:number}
export type UtmTimelinePoint={date:string;added:number;checkout:number;removed:number;abandoned:number;finalized:number;revenueCents:number}
export type UtmHourPoint={hour:number;added:number;checkout:number;removed:number;abandoned:number;finalized:number}
export type UtmAttribution={id:number;sessionKey:string;status:string;customerName:string|null;customerEmail:string|null;customerPhone:string|null;cartValueCents:number;firstSeenAt:string;lastActivityAt:string;convertedAt:string|null;abandonedAt:string|null;order?:{id:number;code:string;status:string;grossCents:number}|null}
export type UtmDashboard={link:TrackingLink;summary:UtmSummary;timeline:UtmTimelinePoint[];hours:UtmHourPoint[];actions:UtmJourneyAction[];attributions:UtmAttribution[]}
export const getUtmDashboard=(eventId:number,linkId:number)=>request<UtmDashboard>(`/marketing/utm/dashboard${qs({eventId,linkId})}`)
export const createUtmJourneyAction=(body:any)=>request<UtmJourneyAction>('/marketing/utm/actions',{method:'POST',body:JSON.stringify(body)})
export const sweepUtmAbandonments=(eventId:number,linkId:number,inactiveMinutes=30)=>request<{processed:number;recoveries:number}>('/marketing/utm/abandon-sweep',{method:'POST',body:JSON.stringify({eventId,linkId,inactiveMinutes})})
export const getTrackingConfigs=(producerId?:number,eventId?:number)=>request<TrackingConfig[]>(`/marketing/tracking${qs({producerId,eventId})}`)
export const saveTrackingConfig=(body:TrackingConfig)=>request<TrackingConfig>('/marketing/tracking',{method:'PUT',body:JSON.stringify(body)})
export const getResolvedTracking=(producerId?:number,eventId?:number)=>request<ResolvedTracking[]>(`/marketing/tracking/resolved${qs({producerId,eventId})}`)

export type AutomationFlow={id:number;name:string;trigger:string;channel:'whatsapp'|'email'|'multicanal';audience:string;status:string;delayMinutes:number;sentCount:number;convertedCount:number;revenueCents:number;producerId:number;eventId:number|null;event?:{id:number;title:string}|null}
export type MessageTemplate={id:number;name:string;channel:'whatsapp'|'email';category:string;subject:string|null;body:string;status:string;producerId:number;eventId:number|null;event?:{id:number;title:string}|null}
export type AutomationExecution={id:number;channel:string;destination:string|null;status:string;scheduledAt:string;executedAt:string|null;messagePreview:string|null;revenueCents:number;flow:{id:number;name:string;trigger:string};event?:{id:number;title:string}|null}
export type RecoveryAttempt={id:number;channel:string;destination:string|null;status:string;attemptNumber:number;templateName:string|null;messagePreview:string|null;scheduledAt:string;sentAt:string|null;deliveredAt:string|null;readAt:string|null;errorMessage:string|null}
export type RecoveryOpportunity={id:number;code:string;kind:string;customerName:string;email:string|null;phone:string|null;amountCents:number;status:string;preferredChannel:string;lastActivityAt:string;firstContactAt:string|null;nextAttemptAt:string|null;attemptCount:number;recoveredAt:string|null;revenueCents:number;producerId:number;eventId:number|null;event?:{id:number;title:string}|null;trackingLink?:{id:number;name:string;source:string|null;medium:string|null;campaign:string|null;code:string}|null;flow?:{id:number;name:string;channel:string;delayMinutes:number}|null;attempts?:RecoveryAttempt[]}
export type AutomationSummary={activeFlows:number;totalFlows:number;templates:number;executions:number;openRecoveries:number;potentialCents:number;recoveredCount:number;recoveredCents:number;sent:number;conversions:number}
export const getAutomationFlows=(producerId?:number,eventId?:number)=>request<AutomationFlow[]>(`/automation/flows${qs({producerId,eventId})}`)
export const createAutomationFlow=(body:any)=>request<AutomationFlow>('/automation/flows',{method:'POST',body:JSON.stringify(body)})
export const updateAutomationFlow=(id:number,body:any)=>request<AutomationFlow>(`/automation/flows/${id}`,{method:'PATCH',body:JSON.stringify(body)})
export const testAutomationFlow=(id:number)=>request<any>(`/automation/flows/${id}/test`,{method:'POST'})
export const getMessageTemplates=(producerId?:number,eventId?:number,channel?:string)=>request<MessageTemplate[]>(`/automation/templates${qs({producerId,eventId})}${channel?`${qs({producerId,eventId})?'&':'?'}channel=${encodeURIComponent(channel)}`:''}`)
export const createMessageTemplate=(body:any)=>request<MessageTemplate>('/automation/templates',{method:'POST',body:JSON.stringify(body)})
export const getAutomationExecutions=(producerId?:number)=>request<AutomationExecution[]>(`/automation/executions${qs({producerId})}`)
export const getRecoveries=(producerId?:number,eventId?:number,kind?:string)=>request<RecoveryOpportunity[]>(`/automation/recoveries${qs({producerId,eventId})}${kind?`${qs({producerId,eventId})?'&':'?'}kind=${encodeURIComponent(kind)}`:''}`)
export const createRecovery=(body:any)=>request<RecoveryOpportunity>('/automation/recoveries',{method:'POST',body:JSON.stringify(body)})
export const markRecoveryRecovered=(id:number,revenueCents?:number)=>request<RecoveryOpportunity>(`/automation/recoveries/${id}/recover`,{method:'PATCH',body:JSON.stringify(revenueCents===undefined?{}:{revenueCents})})
export const startRecovery=(id:number,channel?:'whatsapp'|'email'|'multicanal')=>request<any>(`/automation/recoveries/${id}/start`,{method:'POST',body:JSON.stringify(channel?{channel}:{})})
export const processRecoveryQueue=()=>request<{enrolled?:number;processed:number;sent:number}>('/automation/recoveries/process-queue',{method:'POST',body:JSON.stringify({limit:100})})
export type RecoveryDashboard={open:number;inRecovery:number;recovered:number;potentialCents:number;recoveredCents:number;byChannel:Record<string,{attempts:number;recovered:number;revenueCents:number}>;campaigns:Array<{campaign:string;source:string|null;opportunities:number;recovered:number;revenueCents:number}>}
export const getRecoveryDashboard=(producerId?:number,eventId?:number)=>request<RecoveryDashboard>(`/automation/recovery-dashboard${qs({producerId,eventId})}`)
export const getAutomationSummary=(producerId?:number)=>request<AutomationSummary>(`/automation/summary${qs({producerId})}`)

export type SupportTicket={id:number;code:string;subject:string;description:string;category:string;impact:string;urgency:string;priority:string;status:string;channel:string;requesterName:string;requesterEmail:string|null;requesterPhone:string|null;assignedTo:string|null;responseDueAt:string;resolutionDueAt:string;resolvedAt:string|null;slaBreached:boolean;producerId:number;eventId:number|null;createdAt:string}
export type SupportSummary={total:number;open:number;p1:number;overdue:number;resolved:number;slaCompliance:number}
export type SlaPolicy={id:number;name:string;priority:string;responseMinutes:number;resolutionMinutes:number;businessHours:string;active:boolean;producerId:number}
export type SupportIntegration={id:number;name:string;type:string;status:string;description:string|null;producerId:number}
export const getSupportTickets=(producerId?:number)=>request<SupportTicket[]>(`/support/tickets${qs({producerId})}`)
export const createSupportTicket=(body:any)=>request<SupportTicket>('/support/tickets',{method:'POST',body:JSON.stringify(body)})
export const updateSupportTicket=(id:number,body:any)=>request<SupportTicket>(`/support/tickets/${id}`,{method:'PATCH',body:JSON.stringify(body)})
export const addSupportMessage=(id:number,body:any)=>request<any>(`/support/tickets/${id}/messages`,{method:'POST',body:JSON.stringify(body)})
export const getSupportSummary=(producerId?:number)=>request<SupportSummary>(`/support/summary${qs({producerId})}`)
export const getSlaPolicies=(producerId?:number)=>request<SlaPolicy[]>(`/support/sla-policies${qs({producerId})}`)
export const getSupportIntegrations=(producerId?:number)=>request<SupportIntegration[]>(`/support/integrations${qs({producerId})}`)

export type CommunicationChannel={id:number;type:string;provider:string;sender:string|null;status:string;webhookMode:string;producerId:number}
export type ContactConsent={id:number;contact:string;channel:string;status:string;source:string;producerId:number;updatedAt:string}
export type CommunicationSummary={channels:number;activeChannels:number;queued:number;sent:number;failed:number;optOuts:number}
export const getCommunicationSummary=(producerId?:number)=>request<CommunicationSummary>(`/communication/summary${qs({producerId})}`)
export const getCommunicationChannels=(producerId?:number)=>request<CommunicationChannel[]>(`/communication/channels${qs({producerId})}`)
export const updateCommunicationChannel=(id:number,body:any)=>request<CommunicationChannel>(`/communication/channels/${id}`,{method:'PATCH',body:JSON.stringify(body)})
export const getCommunicationQueue=(producerId?:number)=>request<any[]>(`/communication/queue${qs({producerId})}`)
export const getContactConsents=(producerId?:number)=>request<ContactConsent[]>(`/communication/consents${qs({producerId})}`)

export type TrackingIntegration={
 id:number;name:string;provider:string;integrationType:string;pixelId:string;apiTokenMasked:string;status:string;applyToAllEvents:boolean;enabledEvents:string[];producerId:number;lastTestAt:string|null;lastTestStatus:string|null;lastError:string|null;lastSentAt:string|null;events:Array<{eventId:number;event:{id:number;title:string;code:string}}> ;_count?:{deliveryLogs:number};createdAt:string;updatedAt:string
}
export type TrackingDeliveryLog={id:number;eventName:string;status:string;responseCode:number|null;message:string|null;createdAt:string;event?:{id:number;title:string}|null}
export const getTrackingIntegrations=(producerId?:number,eventId?:number)=>request<TrackingIntegration[]>(`/marketing/integrations${qs({producerId,eventId})}`)
export const createTrackingIntegration=(body:any)=>request<TrackingIntegration>('/marketing/integrations',{method:'POST',body:JSON.stringify(body)})
export const updateTrackingIntegration=(id:number,body:any)=>request<TrackingIntegration>(`/marketing/integrations/${id}`,{method:'PATCH',body:JSON.stringify(body)})
export const deleteTrackingIntegration=(id:number)=>request<void>(`/marketing/integrations/${id}`,{method:'DELETE'})
export const testTrackingIntegration=(id:number)=>request<{ok:boolean;message:string;lastTestAt:string}>(`/marketing/integrations/${id}/test`,{method:'POST'})
export const getTrackingIntegrationLogs=(id:number)=>request<TrackingDeliveryLog[]>(`/marketing/integrations/${id}/logs`)
