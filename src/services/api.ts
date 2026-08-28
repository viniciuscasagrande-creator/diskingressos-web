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
