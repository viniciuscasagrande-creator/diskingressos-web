import type { AppUser, Producer } from '../auth/model'
const API=import.meta.env.VITE_API_URL||'/api'
// Fase 21.1.8: sessão isolada por origem da API. Evita reutilizar token local na Vercel (e vice-versa).
const apiNamespace=(()=>{
  if(typeof window==='undefined') return 'server'
  try {
    const resolved=new URL(API,window.location.origin)
    return `${resolved.protocol}//${resolved.host}${resolved.pathname.replace(/\/$/,'')}`
  } catch { return String(API) }
})()
const tokenKey=`disk_token:${apiNamespace}`
const legacyTokenKey='disk_token'
function readStoredToken(){
  if(typeof window==='undefined') return ''
  const current=sessionStorage.getItem(tokenKey)||localStorage.getItem(tokenKey)||''
  // Tokens antigos sem namespace são descartados de propósito ao mudar para 21.1.8.
  sessionStorage.removeItem(legacyTokenKey);localStorage.removeItem(legacyTokenKey)
  return current
}
let token=readStoredToken()
export function setApiToken(value:string,remember=false){token=value;if(typeof window!=='undefined'){sessionStorage.removeItem(tokenKey);localStorage.removeItem(tokenKey);sessionStorage.removeItem(legacyTokenKey);localStorage.removeItem(legacyTokenKey);(remember?localStorage:sessionStorage).setItem(tokenKey,value)}}
export function clearApiToken(){token='';if(typeof window!=='undefined'){sessionStorage.removeItem(tokenKey);localStorage.removeItem(tokenKey);sessionStorage.removeItem(legacyTokenKey);localStorage.removeItem(legacyTokenKey)}}
export function hasStoredToken(){return !!token}
export function getApiBaseUrl(){return API}
async function request<T>(path:string,options:RequestInit={}){const r=await fetch(`${API}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...(options.headers||{})}});const data=await r.json().catch(()=>({}));if(r.status===401){clearApiToken()}if(!r.ok)throw new Error(data.message||'Erro na API');return data as T}
export async function login(email:string,password:string){return request<{token:string;user:AppUser}>('/auth/login',{method:'POST',body:JSON.stringify({email,password})})}
export const getMe=()=>request<AppUser>('/auth/me')
export const getProducers=()=>request<Producer[]>('/producers')
export const getUsers=()=>request<AppUser[]>('/users')
export const getEvents=(producerId?:number)=>request<any[]>(`/events${producerId?`?producerId=${producerId}`:''}`)
export const getAudit=()=>request<any[]>('/audit')


export type OperationalSummary={events:number;lots:number;orders:number;tickets:number;participants:number;checkins:number;terminals:number;payouts:number;balanceCents:number}
function qs(values: Record<string, string | number | undefined | null>) {
  const p = new URLSearchParams();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const q = p.toString();
  return q ? `?${q}` : '';
}
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
export type MarketingOSSummary={campaigns:MarketingCampaign[];ready:ReadyCampaignActivation[];tracking:ResolvedTracking[];automation:AutomationSummary;communication:CommunicationSummary;health:{ok:boolean;unavailable:string[];sourceHealth:Record<string,{ok:boolean;state:'active'|'empty'|'unavailable';message?:string}>}}
export const getMarketingOSSummary=(producerId?:number,eventId?:number,period?:string)=>request<MarketingOSSummary>(`/marketing/os/summary${qs({producerId,eventId,period})}`)
export const createMarketingCampaign=(body:any)=>request<MarketingCampaign>('/marketing/campaigns',{method:'POST',body:JSON.stringify(body)})
export type ReadyCampaignTemplate={key:string;name:string;description:string;objective:string;audience:string;recommendedChannels:string[];suggestedBudgetCents:number;badge:string}
export type ReadyCampaignActivation={id:number;templateKey:string;name:string;objective:string;status:string;audience:string;channels:string[];campaignIds:number[];trackingLinkIds:number[];budgetCents:number;startsAt:string|null;endsAt:string|null;producerId:number;eventId:number;event?:{id:number;title:string;code:string};metrics?:{spentCents:number;revenueCents:number;impressions:number;clicks:number;conversions:number;roas:number;cpaCents:number}}
export const getReadyCampaignTemplates=()=>request<ReadyCampaignTemplate[]>('/marketing/ready-campaigns/templates')
export const getReadyCampaignActivations=(producerId?:number,eventId?:number)=>request<ReadyCampaignActivation[]>(`/marketing/ready-campaigns${qs({producerId,eventId})}`)
export const activateReadyCampaign=(body:any)=>request<ReadyCampaignActivation>('/marketing/ready-campaigns/activate',{method:'POST',body:JSON.stringify(body)})
export const updateReadyCampaignActivation=(id:number,status:string)=>request<ReadyCampaignActivation>(`/marketing/ready-campaigns/${id}`,{method:'PATCH',body:JSON.stringify({status})})
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
export type RecoveryEventOption={id:number;title:string;code:string;producerId:number;abandonedCount:number;openCount:number;potentialCents:number}
export const getRecoveryEvents=(producerId?:number,kind='carrinho')=>request<RecoveryEventOption[]>(`/automation/recovery-events${qs({producerId})}${qs({producerId})?'&':'?'}kind=${encodeURIComponent(kind)}`)
export const createRecovery=(body:any)=>request<RecoveryOpportunity>('/automation/recoveries',{method:'POST',body:JSON.stringify(body)})
export const markRecoveryRecovered=(id:number,revenueCents?:number)=>request<RecoveryOpportunity>(`/automation/recoveries/${id}/recover`,{method:'PATCH',body:JSON.stringify(revenueCents===undefined?{}:{revenueCents})})
export const startRecovery=(id:number,channel?:'whatsapp'|'email'|'multicanal')=>request<any>(`/automation/recoveries/${id}/start`,{method:'POST',body:JSON.stringify(channel?{channel}:{})})
export const processRecoveryQueue=(eventId?:number)=>request<{enrolled?:number;processed:number;sent:number}>('/automation/recoveries/process-queue',{method:'POST',body:JSON.stringify({limit:100,eventId})})
export type RecoveryDashboard={open:number;inRecovery:number;recovered:number;potentialCents:number;recoveredCents:number;byChannel:Record<string,{attempts:number;recovered:number;revenueCents:number}>;campaigns:Array<{campaign:string;source:string|null;opportunities:number;recovered:number;revenueCents:number}>}
export const getRecoveryDashboard=(producerId?:number,eventId?:number)=>request<RecoveryDashboard>(`/automation/recovery-dashboard${qs({producerId,eventId})}`)
export const getAutomationSummary=(producerId?:number,eventId?:number)=>request<AutomationSummary>(`/automation/summary${qs({producerId,eventId})}`)

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

// ===== Fase 18.4 — Financeiro Contábil, Borderôs e Assinaturas =====
export type FinanceAccountingSummary={revenueCents:number;netRevenueCents:number;expensesCents:number;resultCents:number;reconciledCents:number;pendingCents:number;divergences:number;payablesCents:number;receivablesCents:number;borderos:number;signatures:number;costCenters:number;entries:number}
export type CostCenter={id:number;code:string;name:string;description:string|null;type:string;status:string;eventId:number|null;producerId:number;event?:{id:number;title:string}|null;_count?:{entries:number;obligations:number;budgets:number}}
export type ChartAccount={id:number;code:string;name:string;nature:string;accountType:string;level:number;parentCode:string|null;status:string;producerId:number}
export type AccountingEntry={id:number;code:string;competence:string;entryDate:string;description:string;debitCents:number;creditCents:number;status:string;source:string;documentRef:string|null;event?:{id:number;title:string}|null;costCenter?:CostCenter|null;chartAccount?:ChartAccount|null}
export type ReconciliationItem={id:number;code:string;sourceType:string;sourceRef:string|null;externalRef:string|null;expectedCents:number;receivedCents:number;differenceCents:number;status:string;reason:string|null;reconciledBy:string|null;reconciledAt:string|null;occurredAt:string;event?:{id:number;title:string}|null}
export type FinancialObligation={id:number;code:string;kind:'pagar'|'receber';category:string;description:string;amountCents:number;dueDate:string;paidAt:string|null;status:string;counterparty:string|null;documentRef:string|null;event?:{id:number;title:string}|null;costCenter?:CostCenter|null;chartAccount?:ChartAccount|null}
export type BudgetLine={id:number;competence:string;category:string;plannedCents:number;realizedCents:number;notes:string|null;costCenter?:CostCenter|null;event?:{id:number;title:string}|null}
export type BorderoDocument={id:number;code:string;reportType:string;version:number;status:string;title:string;generatedAt:string;approvedAt:string|null;approvedBy:string|null;event:{id:number;title:string;code:string};summary?:any;signatureRequests?:SignatureRequest[]}
export type SignatureSigner={id:number;name:string;email:string;role:string|null;orderIndex:number;status:string;signedAt:string|null}
export type SignatureRequest={id:number;code:string;provider:string;providerDocumentId:string|null;status:string;subject:string;message:string|null;signingOrder:boolean;documentUrl:string|null;signedFileUrl:string|null;hash:string|null;sentAt:string|null;completedAt:string|null;signers:SignatureSigner[];bordero?:{id:number;code:string;title:string}|null}
export type DreSummary={grossRevenueCents:number;deductionsCents:number;netRevenueCents:number;operatingCostsCents:number;operatingResultCents:number;marginPercent:number;feeCents:number}
export type FinancialClosing={id:number;competence:string;status:string;checklistJson:string;notes:string|null;closedBy:string|null;closedAt:string|null;event?:{id:number;title:string;code:string}|null;checklist?:Record<string,boolean>}
const financeQs=(producerId?:number,eventId?:number)=>qs({producerId,eventId})
export const getFinanceAccountingSummary=(producerId?:number,eventId?:number)=>request<FinanceAccountingSummary>(`/finance/accounting/summary${financeQs(producerId,eventId)}`)
export const bootstrapFinanceAccounting=(body:any)=>request<{ok:boolean}>('/finance/accounting/bootstrap',{method:'POST',body:JSON.stringify(body)})
export const getCostCenters=(producerId?:number,eventId?:number)=>request<CostCenter[]>(`/finance/accounting/cost-centers${financeQs(producerId,eventId)}`)
export const createCostCenter=(body:any)=>request<CostCenter>('/finance/accounting/cost-centers',{method:'POST',body:JSON.stringify(body)})
export const updateCostCenter=(id:number,body:any)=>request<CostCenter>(`/finance/accounting/cost-centers/${id}`,{method:'PATCH',body:JSON.stringify(body)})
export const getChartAccounts=(producerId?:number)=>request<ChartAccount[]>(`/finance/accounting/chart-accounts${qs({producerId})}`)
export const createChartAccount=(body:any)=>request<ChartAccount>('/finance/accounting/chart-accounts',{method:'POST',body:JSON.stringify(body)})
export const getAccountingEntries=(producerId?:number,eventId?:number)=>request<AccountingEntry[]>(`/finance/accounting/entries${financeQs(producerId,eventId)}`)
export const createAccountingEntry=(body:any)=>request<AccountingEntry>('/finance/accounting/entries',{method:'POST',body:JSON.stringify(body)})
export const getReconciliations=(producerId?:number,eventId?:number)=>request<ReconciliationItem[]>(`/finance/accounting/reconciliations${financeQs(producerId,eventId)}`)
export const createReconciliation=(body:any)=>request<ReconciliationItem>('/finance/accounting/reconciliations',{method:'POST',body:JSON.stringify(body)})
export const reconcileItem=(id:number,body:any)=>request<ReconciliationItem>(`/finance/accounting/reconciliations/${id}/reconcile`,{method:'PATCH',body:JSON.stringify(body)})
export const autoReconcile=(body:any)=>request<{created:number}>('/finance/accounting/reconciliations/auto',{method:'POST',body:JSON.stringify(body)})
export const getFinancialObligations=(producerId?:number,eventId?:number,kind?:'pagar'|'receber')=>request<FinancialObligation[]>(`/finance/accounting/obligations${financeQs(producerId,eventId)}${kind?`${financeQs(producerId,eventId)?'&':'?'}kind=${kind}`:''}`)
export const createFinancialObligation=(body:any)=>request<FinancialObligation>('/finance/accounting/obligations',{method:'POST',body:JSON.stringify(body)})
export const payFinancialObligation=(id:number)=>request<FinancialObligation>(`/finance/accounting/obligations/${id}/pay`,{method:'PATCH',body:'{}'})
export const getBudgets=(producerId?:number,eventId?:number)=>request<BudgetLine[]>(`/finance/accounting/budgets${financeQs(producerId,eventId)}`)
export const createBudgetLine=(body:any)=>request<BudgetLine>('/finance/accounting/budgets',{method:'POST',body:JSON.stringify(body)})
export const getBorderos=(producerId?:number,eventId?:number)=>request<BorderoDocument[]>(`/finance/accounting/borderos${financeQs(producerId,eventId)}`)
export const generateBordero=(body:any)=>request<BorderoDocument>('/finance/accounting/borderos/generate',{method:'POST',body:JSON.stringify(body)})
export const getBorderoDetail=(id:number)=>request<any>(`/finance/accounting/borderos/${id}/detail`)
export const approveBordero=(id:number)=>request<BorderoDocument>(`/finance/accounting/borderos/${id}/approve`,{method:'PATCH',body:'{}'})
export const getSignatureRequests=(producerId?:number,eventId?:number)=>request<SignatureRequest[]>(`/finance/accounting/signatures${financeQs(producerId,eventId)}`)
export const createSignatureRequest=(body:any)=>request<SignatureRequest>('/finance/accounting/signatures',{method:'POST',body:JSON.stringify(body)})
export const updateSignatureStatus=(id:number,body:any)=>request<SignatureRequest>(`/finance/accounting/signatures/${id}/status`,{method:'PATCH',body:JSON.stringify(body)})
export const updateSignerStatus=(requestId:number,signerId:number,status:string)=>request<SignatureSigner>(`/finance/accounting/signatures/${requestId}/signers/${signerId}`,{method:'PATCH',body:JSON.stringify({status})})
export const getDreSummary=(producerId?:number,eventId?:number)=>request<DreSummary>(`/finance/accounting/dre${financeQs(producerId,eventId)}`)
export const getFinancialClosings=(producerId?:number,eventId?:number)=>request<FinancialClosing[]>(`/finance/accounting/closings${financeQs(producerId,eventId)}`)
export const createFinancialClosing=(body:any)=>request<FinancialClosing>('/finance/accounting/closings',{method:'POST',body:JSON.stringify(body)})
export const closeFinancialClosing=(id:number)=>request<FinancialClosing>(`/finance/accounting/closings/${id}/close`,{method:'PATCH',body:'{}'})

// ===== Fase 20.1 — Financeiro 360° / Pagamentos =====
export type FinancePaymentsSummary={gateways:number;activeGateways:number;acquirers:number;activeAcquirers:number;methods:number;pendingRefunds:number;refundedCents:number}
export type PaymentGatewayConfig={id:number;name:string;provider:string;environment:string;status:string;isPrimary:boolean;webhookUrl:string|null;publicKeyMasked:string|null;credentialsConfigured:boolean;lastValidationAt:string|null;lastValidationStatus:string|null;producerId:number}
export type CardAcquirer={id:number;name:string;code:string;status:string;creditCashMdrBps:number;creditInstallmentMdrBps:number;debitMdrBps:number;pixFeeBps:number;settlementDays:number;anticipationBps:number;approvalRateBps:number;producerId:number}
export type PaymentMethodRule={id:number;method:string;label:string;status:string;minInstallments:number;maxInstallments:number;customerInterestBps:number;producerInterestBps:number;minimumCents:number;gatewayId:number|null;acquirerId:number|null;producerId:number}
export type RefundRequest={id:number;code:string;orderCode:string;transactionRef:string|null;eventId:number|null;amountCents:number;kind:string;method:string;reason:string;status:string;gatewayId:number|null;acquirerId:number|null;gatewayProtocol:string|null;requestedBy:string|null;approvedBy:string|null;approvedAt:string|null;sentToGatewayAt:string|null;completedAt:string|null;producerId:number;createdAt:string;message?:string}
export const getFinancePaymentsSummary=(producerId?:number)=>request<FinancePaymentsSummary>(`/finance/payments/summary${qs({producerId})}`)
export const getPaymentGateways=(producerId?:number)=>request<PaymentGatewayConfig[]>(`/finance/payments/gateways${qs({producerId})}`)
export const createPaymentGateway=(body:any)=>request<PaymentGatewayConfig>('/finance/payments/gateways',{method:'POST',body:JSON.stringify(body)})
export const updatePaymentGateway=(id:number,body:any)=>request<PaymentGatewayConfig>(`/finance/payments/gateways/${id}`,{method:'PATCH',body:JSON.stringify(body)})
export const validatePaymentGateway=(id:number)=>request<{ok:boolean;status:string;message:string;checks:any}>(`/finance/payments/gateways/${id}/validate`,{method:'POST'})
export const getCardAcquirers=(producerId?:number)=>request<CardAcquirer[]>(`/finance/payments/acquirers${qs({producerId})}`)
export const createCardAcquirer=(body:any)=>request<CardAcquirer>('/finance/payments/acquirers',{method:'POST',body:JSON.stringify(body)})
export const updateCardAcquirer=(id:number,body:any)=>request<CardAcquirer>(`/finance/payments/acquirers/${id}`,{method:'PATCH',body:JSON.stringify(body)})
export const getPaymentMethodRules=(producerId?:number)=>request<PaymentMethodRule[]>(`/finance/payments/methods${qs({producerId})}`)
export const createPaymentMethodRule=(body:any)=>request<PaymentMethodRule>('/finance/payments/methods',{method:'POST',body:JSON.stringify(body)})
export const updatePaymentMethodRule=(id:number,body:any)=>request<PaymentMethodRule>(`/finance/payments/methods/${id}`,{method:'PATCH',body:JSON.stringify(body)})
export const getRefundRequests=(producerId?:number)=>request<RefundRequest[]>(`/finance/payments/refunds${qs({producerId})}`)
export const createRefundRequest=(body:any)=>request<RefundRequest>('/finance/payments/refunds',{method:'POST',body:JSON.stringify(body)})
export const approveRefundRequest=(id:number)=>request<RefundRequest>(`/finance/payments/refunds/${id}/approve`,{method:'PATCH'})
export const sendRefundToGateway=(id:number)=>request<RefundRequest>(`/finance/payments/refunds/${id}/send-to-gateway`,{method:'PATCH'})

// ===== Fase 20.2 & 20.2.1 — Spread, Recebíveis, Conciliação e Inteligência =====
export type SpreadSimulationResult={id?:number;saved:boolean;grossCents:number;paymentMethod:string;installments:number;serviceFeeBps:number;mdrBps:number;anticipationBps:number;gatewayCostCents:number;mdrCostCents:number;anticipationCents:number;serviceRevenueCents:number;totalCostCents:number;netMarginCents:number;marginBps:number;settlementDays:number;acquirer:{id:number;name:string}}
export type SpreadAcquirerSummary={acquirerId:number;name:string;simulations:number;volumeCents:number;totalCostCents:number;netMarginCents:number;marginBps:number}
export type SpreadDashboard={simulations:number;volumeCents:number;serviceRevenueCents:number;totalCostCents:number;netMarginCents:number;avgMarginBps:number;avgServiceFeeBps:number;byAcquirer:SpreadAcquirerSummary[]}
export type FinanceOperations360Summary={receivables:{open:number;dueCents:number};reconciliation:{items:number;reconciledCents:number;divergences:number;divergenceCents:number};refunds:{pendingCents:number};spread:{simulations:number;avgMarginBps:number};acquirers:Array<{id:number;name:string;status:string;approvalRateBps:number;settlementDays:number;creditCashMdrBps:number;creditInstallmentMdrBps:number}>;insights:Array<{level:string;title:string;message:string}>}

export const simulateFinanceSpread=(body:any)=>request<SpreadSimulationResult>('/finance/payments/spread/simulate',{method:'POST',body:JSON.stringify(body)})
export const compareFinanceSpread=(body:any)=>request<SpreadSimulationResult[]>('/finance/payments/spread/compare',{method:'POST',body:JSON.stringify(body)})
export const getFinanceSpreadDashboard=(producerId?:number,eventId?:number)=>request<SpreadDashboard>(`/finance/payments/spread/dashboard${qs({producerId,eventId})}`)
export const getFinanceSpreadHistory=(producerId?:number,eventId?:number)=>request<any[]>(`/finance/payments/spread/history${qs({producerId,eventId})}`)
export const getFinanceOperations360Summary=(producerId?:number,eventId?:number)=>request<FinanceOperations360Summary>(`/finance/payments/operations/summary${qs({producerId,eventId})}`)


// ===== Fase 20.2.5.3 — Advanced, Conciliação, Spread, Split e Inteligência =====
export type FinanceAdvancedSummary={
  receivablesCents:number;receivablesCount:number;divergences:number;divergenceCents:number;
  avgMarginBps:number;spreadSimulations:number;settlementExpectedCents:number;settlementReconciledCents:number;
  pendingPayoutsCents:number;pendingPayoutsCount:number;activeAcquirers:number;activeGateways:number;
  acquirers:Array<{id:number;name:string;status:string;approvalRateBps:number;creditMdrBps:number;settlementDays:number}>;
  insights:Array<{level:'ok'|'warning'|'critical';title:string;message:string}>;
  health:{ok:number;total:number;unavailable:string[]}
}
export const getFinanceAdvancedSummary=(producerId?:number,eventId?:number)=>request<FinanceAdvancedSummary>(`/finance/advanced/summary${qs({producerId,eventId})}`)

// ===== Fase 20.2.2 — Advanced & Taxas Operacional =====
export type FinanceGateway = {
  id: number
  producerId: number
  name: string
  provider: string
  environment: string
  status: string
  configured?: boolean
  publicKeyMasked?: string | null
  merchantId?: string | null
  webhookUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

export type FinancePaymentMethod = {
  id: number
  producerId: number
  code?: string
  name?: string
  method?: string
  label?: string
  status: string
  maxInstallments: number
  minInstallments?: number
  minInstallmentCents?: number
  minimumCents?: number
  fixedFeeCents?: number
  variableFeeBps?: number
  createdAt?: string
  updatedAt?: string
}

export const getFinanceGateways = (producerId?: number) =>
  request<FinanceGateway[]>(`/finance/payments/gateways${qs({ producerId })}`)
export const createFinanceGateway = (body: any) =>
  request<FinanceGateway>('/finance/payments/gateways', { method: 'POST', body: JSON.stringify(body) })
export const updateFinanceGateway = (id: number, body: any) =>
  request<FinanceGateway>(`/finance/payments/gateways/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
export const validateFinanceGateway = (id: number, producerId?: number) =>
  request<{ ok: boolean; message: string; status?: string }>(`/finance/payments/gateways/${id}/validate`, { method: 'POST', body: JSON.stringify({ producerId }) })

export const getFinancePaymentMethods = (producerId?: number) =>
  request<FinancePaymentMethod[]>(`/finance/payments/methods${qs({ producerId })}`)
export const createFinancePaymentMethod = (body: any) =>
  request<FinancePaymentMethod>('/finance/payments/methods', { method: 'POST', body: JSON.stringify(body) })
export const updateFinancePaymentMethod = (id: number, body: any) =>
  request<FinancePaymentMethod>(`/finance/payments/methods/${id}`, { method: 'PATCH', body: JSON.stringify(body) })



// ===== Fase 20.3 — Split, Repasses, Antecipações e Liquidação =====
export type FinanceSettlementSummary = {
  availableBalanceCents: number
  blockedBalanceCents: number
  futureBalanceCents: number
  totalSplits: number
  activeSplitsCount: number
  payoutsCount: number
  pendingPayoutsCount: number
  pendingPayoutsCents: number
  advancesCount: number
  contractedAdvancesCents: number
  settlementsCount: number
  expectedSettlementCents: number
  reconciledSettlementCents: number
}

export type FinanceSplitRule = {
  id: number
  code: string
  title: string
  recipientName: string
  recipientDocument: string | null
  recipientAccount: string | null
  splitType: 'percentage' | 'fixed'
  splitValueBps: number
  fixedCents: number
  feeDeductionMode: 'gross' | 'net'
  priority: number
  status: 'draft' | 'active' | 'inactive' | 'expired'
  eventId: number | null
  producerId: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type SplitSimulationResult = {
  rule: { id: number; code: string; title: string; recipientName: string; splitType: string; splitValueBps: number; fixedCents: number }
  grossAmountCents: number
  platformFeeCents: number
  netAmountCents: number
  recipientShareCents: number
  producerRemainingCents: number
  feeDeductionMode: string
}

export type FinanceAdvance = {
  id: number
  code: string
  requestedAmountCents: number
  feeBps: number
  feeCents: number
  netAmountCents: number
  status: 'simulated' | 'requested' | 'approved' | 'contracted' | 'settled' | 'rejected' | 'cancelled'
  eligibleReceivablesCount: number
  bankAccount: string | null
  contractedAt: string | null
  approvedBy: string | null
  notes: string | null
  eventId: number | null
  producerId: number
  createdAt: string
}

export type AdvanceSimulationResult = {
  eligibleReceivablesCount: number
  totalEligibleCents: number
  feeBps: number
  feeCents: number
  netAmountCents: number
}

export type FinanceSettlement = {
  id: number
  code: string
  gatewayName: string
  acquirerName: string | null
  batchRef: string | null
  expectedCents: number
  receivedCents: number
  feeCents: number
  differenceCents: number
  expectedDate: string
  settledDate: string | null
  status: 'pending' | 'expected' | 'received' | 'reconciled' | 'divergent' | 'cancelled'
  reconciliationRef: string | null
  eventId: number | null
  producerId: number
  createdAt: string
}

export const getFinanceSettlementSummary = (producerId?: number, eventId?: number) =>
  request<FinanceSettlementSummary>(`/finance/settlement/summary${qs({ producerId, eventId })}`)

export const getFinanceSplits = (producerId?: number, eventId?: number) =>
  request<FinanceSplitRule[]>(`/finance/settlement/splits${qs({ producerId, eventId })}`)
export const createFinanceSplit = (body: any) =>
  request<FinanceSplitRule>('/finance/settlement/splits', { method: 'POST', body: JSON.stringify(body) })
export const updateFinanceSplit = (id: number, body: any) =>
  request<FinanceSplitRule>(`/finance/settlement/splits/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
export const simulateFinanceSplit = (id: number, body: any) =>
  request<SplitSimulationResult>(`/finance/settlement/splits/${id}/simulate`, { method: 'POST', body: JSON.stringify(body) })

export const getFinanceSettlementPayouts = (producerId?: number) =>
  request<any[]>(`/finance/settlement/payouts${qs({ producerId })}`)
export const createFinanceSettlementPayout = (body: any) =>
  request<any>('/finance/settlement/payouts', { method: 'POST', body: JSON.stringify(body) })
export const approveFinanceSettlementPayout = (id: number) =>
  request<any>(`/finance/settlement/payouts/${id}/approve`, { method: 'PATCH' })
export const scheduleFinanceSettlementPayout = (id: number) =>
  request<any>(`/finance/settlement/payouts/${id}/schedule`, { method: 'PATCH' })
export const payFinanceSettlementPayout = (id: number) =>
  request<any>(`/finance/settlement/payouts/${id}/pay`, { method: 'PATCH' })
export const cancelFinanceSettlementPayout = (id: number) =>
  request<any>(`/finance/settlement/payouts/${id}/cancel`, { method: 'PATCH' })

export const getFinanceAdvances = (producerId?: number, eventId?: number) =>
  request<FinanceAdvance[]>(`/finance/settlement/advances${qs({ producerId, eventId })}`)
export const simulateFinanceAdvance = (producerId?: number, eventId?: number) =>
  request<AdvanceSimulationResult>(`/finance/settlement/advances/simulate`, { method: 'POST', body: JSON.stringify({ producerId, eventId }) })
export const createFinanceAdvance = (body: any) =>
  request<FinanceAdvance>('/finance/settlement/advances', { method: 'POST', body: JSON.stringify(body) })
export const approveFinanceAdvance = (id: number) =>
  request<FinanceAdvance>(`/finance/settlement/advances/${id}/approve`, { method: 'PATCH' })
export const contractFinanceAdvance = (id: number) =>
  request<FinanceAdvance>(`/finance/settlement/advances/${id}/contract`, { method: 'PATCH' })

export const getFinanceSettlements = (producerId?: number, eventId?: number) =>
  request<FinanceSettlement[]>(`/finance/settlement/settlements${qs({ producerId, eventId })}`)
export const createFinanceSettlement = (body: any) =>
  request<FinanceSettlement>('/finance/settlement/settlements', { method: 'POST', body: JSON.stringify(body) })
export const reconcileFinanceSettlement = (id: number, body: any) =>
  request<FinanceSettlement>(`/finance/settlement/settlements/${id}/reconcile`, { method: 'PATCH', body: JSON.stringify(body) })

// ===== Fase 20.4 — Estornos, Chargebacks, Devoluções e Disputas =====
export type FinanceDisputesSummary = {
  totalRefundsCount: number
  pendingRefundsCount: number
  totalRequestedRefundCents: number
  totalCompletedRefundCents: number
  partialRefundsCount: number
  totalChargebacksCount: number
  openChargebacksCount: number
  openChargebacksCents: number
  wonChargebacksCount: number
  wonChargebacksCents: number
  lostChargebacksCount: number
  lostChargebacksCents: number
  recoveryRatePct: number
}

export type FinanceChargeback = {
  id: number
  code: string
  disputeId: string | null
  orderCode: string
  cardBrand: string | null
  cardLast4: string | null
  amountCents: number
  feeCents: number
  reason: string
  status: 'disputed' | 'evidence_required' | 'evidence_sent' | 'chargeback_won' | 'chargeback_lost' | 'cancelled'
  slaDeadline: string | null
  evidenceNotes: string | null
  evidenceUrls: string | null
  resolutionNotes: string | null
  resolvedAt: string | null
  gatewayId: number | null
  acquirerId: number | null
  eventId: number | null
  producerId: number
  createdAt: string
  updatedAt: string
}

export const getFinanceDisputesSummary = (producerId?: number, eventId?: number) =>
  request<FinanceDisputesSummary>(`/finance/disputes/summary${qs({ producerId, eventId })}`)

export const getFinanceDisputesRefunds = (producerId?: number, eventId?: number, status?: string, kind?: string) =>
  request<RefundRequest[]>(`/finance/disputes/refunds${qs({ producerId, eventId, status, kind })}`)
export const createFinanceDisputesRefund = (body: any) =>
  request<RefundRequest>('/finance/disputes/refunds', { method: 'POST', body: JSON.stringify(body) })
export const approveFinanceDisputesRefund = (id: number) =>
  request<RefundRequest>(`/finance/disputes/refunds/${id}/approve`, { method: 'POST' })
export const processFinanceDisputesRefund = (id: number) =>
  request<RefundRequest>(`/finance/disputes/refunds/${id}/process`, { method: 'POST' })
export const completeFinanceDisputesRefund = (id: number) =>
  request<RefundRequest>(`/finance/disputes/refunds/${id}/complete`, { method: 'POST' })

export const getFinanceChargebacks = (producerId?: number, eventId?: number, status?: string) =>
  request<FinanceChargeback[]>(`/finance/disputes/chargebacks${qs({ producerId, eventId, status })}`)
export const createFinanceChargeback = (body: any) =>
  request<FinanceChargeback>('/finance/disputes/chargebacks', { method: 'POST', body: JSON.stringify(body) })
export const submitChargebackEvidence = (id: number, body: { evidenceNotes: string; evidenceUrls?: string }) =>
  request<FinanceChargeback>(`/finance/disputes/chargebacks/${id}/evidence`, { method: 'POST', body: JSON.stringify(body) })
export const resolveFinanceChargeback = (id: number, body: { decision: 'chargeback_won' | 'chargeback_lost'; resolutionNotes?: string }) =>
  request<FinanceChargeback>(`/finance/disputes/chargebacks/${id}/resolve`, { method: 'POST', body: JSON.stringify(body) })

export const sendPaymentWebhook = (body: any) =>
  request<{ ok: boolean; webhookId?: number; status: string; message?: string }>('/finance/disputes/payment-events/webhook', { method: 'POST', body: JSON.stringify(body) })






export type FinanceDashboardSummary={
 availableBalanceCents:number;futureBalanceCents:number;payablesCents:number;pendingPayoutsCents:number;pendingPayoutsCount:number;
 avgMarginBps:number;spreadSimulations:number;divergences:number;activeGateways:number;activeAcquirers:number;methods:number;
 refundsCents:number;receivablesCents:number;health:{ok:number;total:number;unavailable:string[]}
}
export const getFinanceDashboardSummary=(producerId?:number,eventId?:number)=>
 request<FinanceDashboardSummary>(`/finance/dashboard${qs({producerId,eventId})}`)


// ===== Fase 20.2.5.2 — Operações de Caixa Financeiro =====
export type FinanceEventBalance={eventId:number|null;eventName:string;entriesCents:number;exitsCents:number;availableCents:number;pendingCents:number;receivableCents:number}
export type FinanceCashSummary={availableCents:number;pendingPayoutCents:number;futureCents:number;expensesOpenCents:number;expensesPaidCents:number;events:FinanceEventBalance[]}
export type FinanceBankAccount={id:number;bankCode:string;bankName:string;agency:string;accountNumber:string;accountType:string;holderName:string;holderDocument:string;pixType:string|null;pixKey:string|null;isPrimary:boolean;status:string;verifiedAt:string|null;producerId:number;createdAt:string;updatedAt:string}
export type FinanceExpense={id:number;code:string;kind:string;category:string;description:string;amountCents:number;dueDate:string;paidAt:string|null;status:string;counterparty:string|null;documentRef:string|null;producerId:number;eventId:number|null;event?:{id:number;title:string}|null;createdAt:string;updatedAt:string}
export type FinanceTransaction={id:number;code:string;type:string;category:string;description:string;amountCents:number;status:string;occurredAt:string;producerId:number;eventId:number|null;event?:{id:number;title:string}|null;order?:{id:number;code:string}|null;payout?:{id:number;code:string}|null}
export const getFinanceCashSummary=(producerId?:number,eventId?:number)=>request<FinanceCashSummary>(`/finance/cash/summary${qs({producerId,eventId})}`)
export const getFinanceCashTransactions=(producerId?:number,eventId?:number,type?:string,category?:string)=>request<FinanceTransaction[]>(`/finance/cash/transactions${qs({producerId,eventId,type,category})}`)
export const getFinanceBankAccounts=(producerId?:number)=>request<FinanceBankAccount[]>(`/finance/cash/bank-accounts${qs({producerId})}`)
export const createFinanceBankAccount=(body:any)=>request<FinanceBankAccount>('/finance/cash/bank-accounts',{method:'POST',body:JSON.stringify(body)})
export const updateFinanceBankAccount=(id:number,body:any)=>request<FinanceBankAccount>(`/finance/cash/bank-accounts/${id}`,{method:'PATCH',body:JSON.stringify(body)})
export const setFinancePrimaryBankAccount=(id:number)=>request<FinanceBankAccount>(`/finance/cash/bank-accounts/${id}/primary`,{method:'PATCH'})
export const getFinanceExpenses=(producerId?:number,eventId?:number)=>request<FinanceExpense[]>(`/finance/cash/expenses${qs({producerId,eventId})}`)
export const createFinanceExpense=(body:any)=>request<FinanceExpense>('/finance/cash/expenses',{method:'POST',body:JSON.stringify(body)})
export const updateFinanceExpense=(id:number,body:any)=>request<FinanceExpense>(`/finance/cash/expenses/${id}`,{method:'PATCH',body:JSON.stringify(body)})
export const payFinanceExpense=(id:number)=>request<FinanceExpense>(`/finance/cash/expenses/${id}/pay`,{method:'PATCH'})

export type ScopeDiagnostics={ok:boolean;code?:string;message?:string;user:{id:number;email:string;role:string;producerId:number|null};producer?:{id:number;name:string;status:string;_count:{events:number;marketingCampaigns:number;users:number}}|null;events?:Array<{id:number;code:string;title:string;status:string;_count:{marketingCampaigns:number}}>;totalEvents?:number;totalCampaigns?:number}
export const getScopeDiagnostics=()=>request<ScopeDiagnostics>('/scope/diagnostics')

// ===== Fase 25.8 — Motor Enterprise de Estornos =====
export type RefundEnterpriseOverview = {
  release:string; pendingApprovals:number; pendingAmountCents:number; criticalCases:number; partialRefunds:number;
  policy:{level1MaxCents:number;level2FromCents:number;level3FromCents:number;immutableLedger:boolean;requesterCannotApproveCritical:boolean};
  capabilities:string[]
}
export type RefundEligibility = {eligible:boolean;riskLevel:'low'|'medium'|'high'|'critical';requiredApprovals:number;checks:Array<{key:string;label:string;status:'ok'|'warning'|'blocked';detail:string}>;blockingReasons:string[]}
export const getRefundEnterpriseOverview=(producerId?:number,eventId?:number)=>request<RefundEnterpriseOverview>(`/finance/disputes/enterprise/overview${qs({producerId,eventId})}`)
export const evaluateRefund=(id:number)=>request<RefundEligibility>(`/finance/disputes/refunds/${id}/eligibility`,{method:'POST'})
export const enterpriseApproveRefund=(id:number,notes?:string)=>request<{complete:boolean;currentLevel:number;requiredApprovals:number}>(`/finance/disputes/refunds/${id}/enterprise-approve`,{method:'POST',body:JSON.stringify({notes})})
export const createRefundReversalPlan=(id:number)=>request<any>(`/finance/disputes/refunds/${id}/reversal-plan`,{method:'POST'})

// Fase 26.0 — Event OS / Centro de Comando
export type EventCommandCenter={
  release:string
  event:{id:number;code:string;title:string;producerId:number;producerName:string;status:string}
  kpis:{revenueCents:number;paidOrders:number;tickets:number;participants:number;checkins:number;inventoryCapacity:number;inventorySold:number;inventoryAvailable:number;occupancy:number;openRecoveries:number;recoverableCents:number;recoveredCents:number;activeCampaigns:number}
  health:{score:number}
  readiness:Array<{key:string;label:string;status:'ok'|'warning'|'critical';detail:string}>
  alerts:Array<{code:string;severity:'warning'|'critical';title:string;message:string}>
}
export const getEventCommandCenter=(eventId:number)=>request<EventCommandCenter>(`/events/${eventId}/command-center`)


// ===== Fase 26.1 — Event Cockpit 360 + Activity Stream =====
export type EventActivityType='sale'|'checkin'|'recovery'|'refund'|'finance'|'marketing'|'incident'
export type EventActivityItem={id:string;type:EventActivityType;occurredAt:string;title:string;detail:string;status:string;amountCents?:number;severity:'success'|'info'|'warning'|'critical'|string}
export type EventActivityStream={
  release:string;generatedAt:string;refreshRecommendedSeconds:number;
  event:{id:number;code:string;title:string;producerId:number;status:string};
  pulse:{orders15m:number;revenue15mCents:number;orders1h:number;revenue1hCents:number;checkins15m:number;checkins1h:number;recovered12h:number;recoveredRevenue12hCents:number;openRefunds:number;openIncidents:number};
  trend:Array<{hour:string;orders:number;revenueCents:number;checkins:number}>;
  activity:EventActivityItem[]
}
export const getEventActivityStream=(eventId:number,limit=40)=>request<EventActivityStream>(`/events/${eventId}/activity-stream${qs({limit})}`)

// ===== Fase 26.2 — Inventory Engine =====
export type InventoryHold={id:number;producerId:number;eventId:number;lotId:number|null;code:string;quantity:number;status:string;reason:string;source:string;expiresAt:string;createdBy:string|null;releasedAt:string|null;createdAt:string}
export type InventoryLot={id:number;name:string;sector:string|null;capacity:number;sold:number;held:number;available:number;priceCents:number;status:string;startsAt:string|null;endsAt:string|null;sales24h:number;occupancy:number;salesVelocityPerHour:number;forecastHours:number|null;forecastSoldOutAt:string|null;health:'healthy'|'attention'|'critical'}
export type InventorySector={sector:string;capacity:number;sold:number;held:number;available:number;revenuePotentialCents:number;occupancy:number}
export type InventoryRecommendation={code:string;severity:'info'|'warning'|'critical';title:string;message:string;lotId?:number}
export type EventInventoryEngine={
  release:string;generatedAt:string;event:{id:number;code:string;title:string;producerId:number;status:string};
  summary:{capacity:number;sold:number;held:number;available:number;occupancy:number;revenuePotentialCents:number;velocityPerHour:number;forecastHours:number|null;activeLots:number};
  lots:InventoryLot[];sectors:InventorySector[];holds:InventoryHold[];recommendations:InventoryRecommendation[]
}
export const getEventInventoryEngine=(eventId:number)=>request<EventInventoryEngine>(`/events/${eventId}/inventory-engine`)
export type InventoryLotMutation={name:string;sector?:string|null;priceCents:number;capacity:number;status?:string;startsAt?:string|null;endsAt?:string|null}
export const createInventoryLot=(eventId:number,body:InventoryLotMutation)=>request<InventoryLot>(`/events/${eventId}/inventory-lots`,{method:'POST',body:JSON.stringify(body)})
export const updateInventoryLot=(eventId:number,lotId:number,body:Partial<InventoryLotMutation>)=>request<InventoryLot>(`/events/${eventId}/inventory-lots/${lotId}`,{method:'PATCH',body:JSON.stringify(body)})
export const updateInventoryLotStatus=(eventId:number,lotId:number,status:'ativo'|'pausado'|'encerrado')=>request<InventoryLot>(`/events/${eventId}/inventory-lots/${lotId}/status`,{method:'PATCH',body:JSON.stringify({status})})
export const createInventoryHold=(eventId:number,body:{lotId:number;quantity:number;minutes:number;reason:string;source?:string})=>request<InventoryHold>(`/events/${eventId}/inventory-holds`,{method:'POST',body:JSON.stringify(body)})
export const releaseInventoryHold=(eventId:number,holdId:number)=>request<InventoryHold>(`/events/${eventId}/inventory-holds/${holdId}/release`,{method:'PATCH'})

// ===== Fase 26.3 — Customer 360 / CRM de Participantes =====
export type Customer360Row={key:string;name:string;email:string|null;phone:string|null;document:string|null;orders:number;tickets:number;checkins:number;grossCents:number;firstPurchaseAt:string|null;lastPurchaseAt:string|null;recencyDays:number|null;frequency:number;monetaryCents:number;segment:string;score:number}
export type EventCustomer360={release:string;generatedAt:string;event:{id:number;code:string;title:string;producerId:number};summary:{customers:number;buyers:number;participants:number;repeatCustomers:number;vipCustomers:number;atRiskCustomers:number;grossCents:number;averageTicketCents:number;identifiedRate:number};segments:Array<{name:string;customers:number;grossCents:number}>;customers:Customer360Row[]}
export const getEventCustomer360=(eventId:number,search='')=>request<EventCustomer360>(`/events/${eventId}/customer-360${qs({search})}`)
export type Customer360Profile={release:string;generatedAt:string;event:{id:number;code:string;title:string;producerId:number};customer:Customer360Row;orders:Array<{id:number;code:string;status:string;paymentMethod:string;quantity:number;grossCents:number;createdAt:string}>;tickets:Array<{id:number;code:string;status:string;type:string;priceCents:number;lot:string|null;sector:string|null;orderCode:string;createdAt:string}>;checkins:Array<{id:number;status:string;gate:string|null;method:string;operatorName:string|null;checkedAt:string;ticketCode:string|null}>}
export const getEventCustomer360Profile=(eventId:number,key:string)=>request<Customer360Profile>(`/events/${eventId}/customer-360/profile${qs({key})}`)

// ===== Fase 26.x completa — 26.4 a 26.15 =====
export type EventOSAdvanced={release:string;generatedAt:string;event:{id:number;code:string;title:string;producerId:number};kpis:{revenueCents:number;paidOrders:number;checkins:number;checkins1h:number;capacity:number;sold:number;available:number;occupancy:number;openIncidents:number;criticalIncidents:number;readinessScore:number};signals:Array<{code:string;severity:string;title:string;message:string}>;readiness:Array<{key:string;label:string;status:string;detail:string|null}>;activity:Array<{id:string;title:string;detail:string;at:string;type:string}>}
export const getEventOSAdvanced=(eventId:number)=>request<EventOSAdvanced>(`/events/${eventId}/event-os/advanced`)

// ===== Fase 26.16.1 — Global Search & Command Operacional =====
export type GlobalSearchResultItem = {
  id: number
  code?: string
  name?: string
  buyerName?: string
  buyerEmail?: string
  buyerDocument?: string
  document?: string
  email?: string
  phone?: string
  status?: string
  paymentMethod?: string
  grossCents?: number
  amountCents?: number
  ticketsCount?: number
  lotName?: string
  sector?: string
  participantName?: string
  orderCode?: string | null
  orderId?: number
  description?: string
  category?: string
  type?: string
  gate?: string
  operatorName?: string | null
  method?: string
  subject?: string
  requesterName?: string
  requesterEmail?: string | null
  priority?: string
  reason?: string
  kind?: string
  createdAt?: string
  occurredAt?: string
  checkedAt?: string
  updatedAt?: string
  actions: string[]
}

export type GlobalSearchResponse = {
  release: string
  event: { id: number; name: string; title: string; code: string; producerId: number }
  query: string
  total: number
  counts: {
    orders: number
    customers: number
    tickets: number
    financial: number
    checkins: number
    support: number
    refunds: number
  }
  groups: {
    orders: GlobalSearchResultItem[]
    customers: GlobalSearchResultItem[]
    tickets: GlobalSearchResultItem[]
    financial: GlobalSearchResultItem[]
    checkins: GlobalSearchResultItem[]
    support: GlobalSearchResultItem[]
    refunds: GlobalSearchResultItem[]
  }
}

export const searchEventGlobal = (
  eventId: number,
  params: { q?: string; type?: string; status?: string; paymentMethod?: string; limit?: number } = {}
) => request<GlobalSearchResponse>(`/events/${eventId}/global-search${qs(params)}`)

// ===== Fase 26.16.8 — Revenue & Pricing Intelligence Operacional =====
export type RevenueIntelLot = {
  id: number
  name: string
  sector: string
  capacity: number
  sold: number
  available: number
  priceCents: number
  revenueCents: number
  absorptionPct: number
  burnRateHourly: number
  runoutHours: number
  urgencyStatus: 'CRÍTICO' | 'ACELERADO' | 'ESTÁVEL' | 'ESGOTADO' | 'PAUSADO'
  priceElasticity: 'Inelástica' | 'Moderada' | 'Elástica'
  suggestedPriceCents: number
  status: string
}

export type PricingRecommendation = {
  id: string
  lotId: number
  lotName: string
  sector: string
  type: string
  title: string
  description: string
  currentPriceCents: number
  suggestedPriceCents: number
  priceChangePct: number
  estimatedRevenueUpsideCents: number
  confidenceScore: number
  urgency: 'ALTA' | 'MÉDIA' | 'BAIXA'
  status: 'PENDING' | 'APPLIED' | 'DISMISSED'
  reason: string
}

export type SalesVelocityInterval = {
  hour: string
  ticketsSold: number
  revenueCents: number
  velocityPerHour: number
  speedLevel: 'NORMAL' | 'ACELERADO' | 'PICO'
}

export type ForecastScenario = {
  revenueCents: number
  ticketsSold: number
  probabilityPct: number
  deltaTargetCents: number
  description: string
}

export type PricingAuditEntry = {
  id: number
  adjustedAt: string
  lotName: string
  oldPriceCents: number
  newPriceCents: number
  adjustedBy: string
  reason: string
}

export type RevenueIntelligenceResponse = {
  release: string
  event: {
    id: number
    code: string
    title: string
    producerId: number
    capacity: number
    date: string
    venue: string
  }
  period: string
  kpis: {
    grossRevenueCents: number
    targetRevenueCents: number
    targetAchievedPct: number
    salesVelocityHourly: number
    salesVelocityTrend: number
    runoutHoursGlobal: number
    avgTicketCents: number
    absorptionPct: number
    projectedRevenueCents: number
    dynamicUpsideCents: number
    activeRecommendationsCount: number
    totalSold: number
    availableTickets: number
  }
  scenarios: {
    conservative: ForecastScenario
    moderate: ForecastScenario
    optimistic: ForecastScenario
  }
  lots: RevenueIntelLot[]
  recommendations: PricingRecommendation[]
  salesVelocityTimeline: SalesVelocityInterval[]
  pricingAuditLog: PricingAuditEntry[]
}

export const getRevenueIntelligence = (eventId: number, period?: string) =>
  request<RevenueIntelligenceResponse>(`/events/${eventId}/revenue-intelligence${qs({ period })}`)

export const updateLotPrice = (
  eventId: number,
  lotId: number,
  newPriceCents: number,
  reason?: string,
  forceConfirmed?: boolean
) =>
  request<{ success: boolean; lot: any; oldPriceCents: number; newPriceCents: number; message: string }>(
    `/events/${eventId}/lots/${lotId}/price`,
    {
      method: 'PATCH',
      body: JSON.stringify({ newPriceCents, reason, forceConfirmed })
    }
  )

export const applyPricingRecommendation = (
  eventId: number,
  recommendationId: string,
  lotId: number,
  newPriceCents: number,
  reason?: string
) =>
  request<{ success: boolean; recommendationId: string; message: string }>(
    `/events/${eventId}/pricing-rules/recommendations/apply`,
    {
      method: 'POST',
      body: JSON.stringify({ recommendationId, lotId, newPriceCents, reason })
    }
  )

export const simulatePricingScenario = (
  eventId: number,
  lotId: number,
  targetPriceCents: number
) =>
  request<{
    success: boolean
    lotId: number
    currentPriceCents: number
    targetPriceCents: number
    availableTickets: number
    simulatedTicketsSold: number
    simulatedRevenueCents: number
    deltaRevenueCents: number
    elasticityImpactPct: number
    confidenceScore: number
  }>(`/events/${eventId}/revenue-intelligence/simulate`, {
    method: 'POST',
    body: JSON.stringify({ lotId, targetPriceCents })
  })

export const getRevenueTimeline = (eventId: number, period?: string) =>
  request<any>(`/events/${eventId}/revenue-intelligence/timeline${qs({ period })}`)

export const getRevenueLots = (eventId: number) =>
  request<any>(`/events/${eventId}/revenue-intelligence/lots`)

export const getRevenueForecast = (eventId: number) =>
  request<any>(`/events/${eventId}/revenue-intelligence/forecast`)

export const getRevenueRecommendations = (eventId: number) =>
  request<any>(`/events/${eventId}/revenue-intelligence/recommendations`)

export const simulateRevenuePricing = (eventId: number, lotId: number, targetPriceCents: number) =>
  request<any>(`/events/${eventId}/revenue-intelligence/simulate`, {
    method: 'POST',
    body: JSON.stringify({ lotId, targetPriceCents })
  })

export const requestPricingChange = (
  eventId: number,
  body: { lotId: number; newPriceCents: number; reason: string; recommendationOrigin?: string; confirmed: boolean }
) =>
  request<{ success: boolean; release: string; lotId: number; oldPriceCents: number; newPriceCents: number; message: string }>(
    `/events/${eventId}/pricing/change-request`,
    {
      method: 'POST',
      body: JSON.stringify(body)
    }
  )

// ===== Fase 26.16.10 — Forecast Center Operacional =====
export type ForecastKpis = {
  predictedTickets: number
  predictedRevenueCents: number
  predictedOccupancy: number
  predictedSelloutAt: string
  selloutProbability: number
  predictedAverageTicketCents: number
  confidence: number
  lowerBoundRevenueCents: number
  upperBoundRevenueCents: number
  modelVersion: string
  lastUpdatedAt: string
  nextUpdateAt: string
  snapshotId?: number
}

export type ForecastDeviationAlert = {
  id: number
  type: 'warning' | 'fire'
  text: string
  targetModule: string
  actionLabel: string
}

export type ForecastData = {
  success: boolean
  release: string
  eventId: number
  producerId: number
  eventTitle: string
  eventCode: string
  kpis: ForecastKpis
  deviationAlerts: ForecastDeviationAlert[]
}

export type ForecastTimelineData = {
  success: boolean
  release: string
  comparison: {
    revenue: { predictedCents: number; realizedCents: number; deviationPct: number }
    tickets: { predicted: number; realized: number; deviationPct: number }
    occupancy: { predictedPct: number; realizedPct: number; deviationPp: number }
    averageTicket: { predictedCents: number; realizedCents: number; deviationPct: number }
  }
  series: Array<{
    label: string
    realizedRevenue: number | null
    forecastRevenue: number
    targetRevenue: number
    realizedTickets: number | null
    forecastTickets: number
    targetTickets: number
    realizedOccupancy: number | null
    forecastOccupancy: number
    targetOccupancy: number
    realizedAvgTicket: number | null
    forecastAvgTicket: number
    targetAvgTicket: number
  }>
}

export type ForecastLot = {
  lotId: number
  name: string
  sector: string
  sold: number
  available: number
  currentVelocityPerHour: number
  finalForecastTickets: number
  predictedOccupancyPct: number
  probableSoldOutAt: string
  confidencePct: number
  capacity: number
  priceCents: number
  realizedRevenueCents: number
  remainingPotentialCents: number
  targetInventoryModule: string
}

export type ForecastAccuracyData = {
  success: boolean
  release: string
  predictedRevenueCents: number
  realizedRevenueCents: number
  revenueErrorPct: number
  predictedTickets: number
  realizedTickets: number
  ticketsErrorPct: number
  overallMapePct: number
  modelConfidenceScore: number
  evaluationStatus: string
  notes: string
}

export type ForecastScenariosData = {
  success: boolean
  release: string
  scenarios: {
    conservador: { name: string; revenueCents: number; occupancyPct: number; tickets: number; velocityPerHour: number; conversionPct: number; avgTicketCents: number; description: string }
    base: { name: string; revenueCents: number; occupancyPct: number; tickets: number; velocityPerHour: number; conversionPct: number; avgTicketCents: number; description: string }
    otimista: { name: string; revenueCents: number; occupancyPct: number; tickets: number; velocityPerHour: number; conversionPct: number; avgTicketCents: number; description: string }
  }
  history: Array<{
    id: number
    date: string
    predictedRevenueCents: number
    predictedTickets: number
    occupancyPct: number
    confidence: number
  }>
}

export type ForecastSimulationResult = {
  success: boolean
  release: string
  isSimulation: boolean
  simulationOnly: boolean
  simulatedTickets: number
  simulatedRevenueCents: number
  simulatedOccupancyPct: number
  deltaRevenueCents: number
  deltaTickets: number
  parameters: {
    velocityDeltaPct: number
    conversionDeltaPct: number
    ticketMediumCents: number
    marketingInvestmentCents: number
  }
  notice: string
}

export const getEventForecast = (eventId: number) =>
  request<ForecastData>(`/events/${eventId}/forecast`)

export const getForecastTimeline = (eventId: number) =>
  request<ForecastTimelineData>(`/events/${eventId}/forecast/timeline`)

export const getForecastLots = (eventId: number) =>
  request<{ success: boolean; release: string; lots: ForecastLot[] }>(`/events/${eventId}/forecast/lots`)

export const getForecastAccuracy = (eventId: number) =>
  request<ForecastAccuracyData>(`/events/${eventId}/forecast/accuracy`)

export const getForecastScenarios = (eventId: number) =>
  request<ForecastScenariosData>(`/events/${eventId}/forecast/scenarios`)

export const simulateForecastScenario = (
  eventId: number,
  params: {
    velocityDeltaPct?: number
    conversionDeltaPct?: number
    ticketMediumCents?: number
    marketingInvestmentCents?: number
  }
) =>
  request<ForecastSimulationResult>(`/events/${eventId}/forecast/simulate`, {
    method: 'POST',
    body: JSON.stringify(params)
  })

export const runEventForecast = (eventId: number) =>
  request<{
    success: boolean
    release: string
    message: string
    snapshot: any
    previousSnapshotsRetained: number
  }>(`/events/${eventId}/forecast/run`, {
    method: 'POST'
  })

// ===== Fase 26.16.11 — Disk Intelligence Operacional =====
export type IntelligenceEvidence = {
  source: string
  metric: string
  value: string | number
  label: string
}

export type IntelligenceAction = {
  label: string
  targetModule: string
}

export type IntelligenceWhyExplanation = {
  indicator: string
  current: string
  baseline: string
  variation: string
  window: string
  sources: string[]
  confidenceScore: number
}

export type IntelligenceInsightItem = {
  id: number
  producerId: number
  eventId: number
  type: 'opportunity' | 'attention' | 'critical' | 'info'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  estimatedImpactCents: number | null
  confidence: number
  evidence: IntelligenceEvidence[]
  recommendedActions: IntelligenceAction[]
  whyExplanation: IntelligenceWhyExplanation
  sourceModules: string
  detectedAt: string
  acknowledgedAt: string | null
  userFeedback: 'useful' | 'irrelevant' | null
}

export type IntelligenceFeedItem = {
  id: string
  time: string
  title: string
  targetModule: string
  type: 'positive' | 'warning' | 'critical' | 'info'
}

export type IntelligenceHealthDimension = {
  name: string
  score: number
  status: string
}

export type DiskIntelligenceData = {
  success: boolean
  release: string
  eventId: number
  producerId: number
  eventTitle: string
  eventCode: string
  healthScore: number
  healthStatus: string
  kpis: {
    predictedRevenueCents: number
    predictedOccupancy: number
    soldoutProbability: number
    criticalIncidents: number
    operationalRisk: string
    readinessPct: number
    lastAnalysisAt: string
  }
  insights: IntelligenceInsightItem[]
  feed: IntelligenceFeedItem[]
}

export type AskDiskResponse = {
  success: boolean
  release: string
  hasSufficientData: boolean
  answer: string
  confidence?: number
  missingData?: string[]
  keySignals?: string[]
  evidence?: IntelligenceEvidence[]
  analyzedModules?: string[]
  actions: IntelligenceAction[]
}

export const getDiskIntelligence = (eventId: number) =>
  request<DiskIntelligenceData>(`/events/${eventId}/intelligence`)

export const getIntelligenceInsights = (eventId: number) =>
  request<{ success: boolean; release: string; insights: IntelligenceInsightItem[] }>(`/events/${eventId}/intelligence/insights`)

export const getIntelligenceFeed = (eventId: number) =>
  request<{ success: boolean; release: string; feed: IntelligenceFeedItem[] }>(`/events/${eventId}/intelligence/feed`)

export const getIntelligenceHealth = (eventId: number) =>
  request<{ success: boolean; release: string; overallScore: number; status: string; dimensions: IntelligenceHealthDimension[] }>(`/events/${eventId}/intelligence/health`)

export const analyzeDiskIntelligence = (eventId: number) =>
  request<{ success: boolean; release: string; message: string; analyzedAt: string; healthScore: number; insightsCount: number }>(`/events/${eventId}/intelligence/analyze`, {
    method: 'POST'
  })

export const askDiskIntelligence = (eventId: number, query: string) =>
  request<AskDiskResponse>(`/events/${eventId}/intelligence/ask`, {
    method: 'POST',
    body: JSON.stringify({ query })
  })

export const acknowledgeIntelligenceInsight = (eventId: number, insightId: number) =>
  request<{ success: boolean; release: string; insightId: number; acknowledgedAt: string; message: string }>(`/events/${eventId}/intelligence/insights/${insightId}/acknowledge`, {
    method: 'POST'
  })

export const submitInsightFeedback = (eventId: number, insightId: number, feedback: 'useful' | 'irrelevant') =>
  request<{ success: boolean; release: string; insightId: number; feedback: string; message: string }>(`/events/${eventId}/intelligence/insights/${insightId}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ feedback })
  })

// ===== Fase 26.16.12 — Executive Dashboard Operacional =====
export type ExecutiveDashboardData = {
  success: boolean
  release: string
  event: {
    id: number
    code: string
    title: string
    status: string
    healthScore: number
    healthStatus: string
    readinessPct: number
    updatedAt: string
  }
  kpis: {
    grossRevenueCents: number
    grossRevenueDeltaPct: number
    netRevenueCents: number
    netRevenueDeltaPct: number
    ticketsSold: number
    ticketsSoldDeltaPct: number
    averageTicketCents: number
    averageTicketDeltaPct: number
    occupancyPct: number
    occupancyDeltaPp: number
    forecastRevenueCents: number
    forecastRevenueDeltaPct: number
    soldoutProbabilityPct: number
    soldoutProbabilityDeltaPp: number
    healthScore: number
    healthTrend: string
  }
  revenueProgress: {
    realizedCents: number
    forecastCents: number
    targetCents: number
    currentAttainmentPct: number
    forecastAttainmentPct: number
  }
  funnel: {
    visitors: number
    checkouts: number
    orders: number
    approvedOrders: number
    tickets: number
    conversionPct: number
    previousConversionPct: number
  }
  channels: Array<{
    name: string
    revenueCents: number
    conversions: number
    roas: string
  }>
  attendance: {
    capacity: number
    sold: number
    checkins: number
    presentNow: number
    soldOccupancyPct: number
    realOccupancyPct: number
    noShowPct: number
    sectors: Array<{
      name: string
      occupancyPct: number
    }>
  }
  finance: {
    gmvCents: number
    feesCents: number
    netRevenueCents: number
    receivableCents: number
    availableCents: number
    scheduledPayoutsCents: number
    refundsCents: number
    chargebacksCents: number
  }
  forecast: {
    predictedRevenueCents: number
    predictedTickets: number
    predictedOccupancyPct: number
    soldoutProbabilityPct: number
    confidencePct: number
    lowerBoundCents: number
    upperBoundCents: number
    deviations: {
      revenuePct: number
      ticketsPct: number
      occupancyPp: number
    }
  }
  liveOps: {
    presentNow: number
    entriesPerMin: number
    activeGates: string
    onlineScanners: string
    rejectionsCount: number
    status: string
  }
  support: {
    openTickets: number
    slaExpired: number
    avgResolutionMin: number
    csatPct: number
    nps: number
    topReasons: Array<{
      label: string
      pct: number
    }>
  }
  risk: {
    activeIncidents: number
    criticalIncidents: number
    expiredSlaIncidents: number
    chargebackPct: number
    duplicateQr: number
    ordersInAnalysis: number
    overallRisk: string
    priorityIncident: {
      code: string
      severity: string
      title: string
      openedAt: string
    }
  }
  intelligenceInsights: Array<{
    id: string
    type: string
    text: string
  }>
  comparison: {
    currentEdition: {
      name: string
      revenueCents: number
      tickets: number
      avgTicketCents: number
      conversionPct: number
      occupancyPct: number
      refundsPct: number
      nps: number
    }
    previousEdition: {
      name: string
      revenueCents: number
      tickets: number
      avgTicketCents: number
      conversionPct: number
      occupancyPct: number
      refundsPct: number
      nps: number
    }
  }
}

export const getExecutiveDashboard = (eventId: number) =>
  request<ExecutiveDashboardData>(`/events/${eventId}/executive-dashboard`)

// ===== Fase 26.17.3 — API Contract & Real Data Integration =====
export const getEventCockpit = (eventId: number, period?: string) =>
  request<any>(`/events/${eventId}/cockpit${qs({ period })}`)
export const getEventCockpitData = getEventCockpit

export const getEventLiveOperations = (eventId: number) =>
  request<any>(`/events/${eventId}/live-operations`)
export const getEventLiveOpsOverview = getEventLiveOperations

export const getEventIncidents = (eventId: number) =>
  request<any>(`/events/${eventId}/incidents`)

export const getEventDayCommand = (eventId: number) =>
  request<any>(`/events/${eventId}/event-day-command`)
export const getEventDayCommandOverview = getEventDayCommand

export const getForecastSummary = getEventForecast





