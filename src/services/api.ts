import type { AppUser, Producer } from '../auth/model'
import { seedUsers, producers as seedProducers } from '../auth/model'
import { events as seedEvents } from '../data/events'

const API=import.meta.env.VITE_API_URL||'http://localhost:3333/api'
let token=(typeof window!=='undefined'?(sessionStorage.getItem('disk_token')||localStorage.getItem('disk_token')||''):'')
export function setApiToken(value:string,remember=false){token=value;if(typeof window!=='undefined'){sessionStorage.removeItem('disk_token');localStorage.removeItem('disk_token');(remember?localStorage:sessionStorage).setItem('disk_token',value)}}
export function clearApiToken(){token='';if(typeof window!=='undefined'){sessionStorage.removeItem('disk_token');localStorage.removeItem('disk_token')}}
export function hasStoredToken(){return !!token}

const mockLinks: TrackingLink[] = [
  { id: 1, code: '4amigos-instagram', name: 'Instagram — Lançamento 2026', destination: 'https://diskingressos.com.br/evento/1760', source: 'instagram', medium: 'cpc', campaign: 'lancamento_2026', content: 'story_01', term: 'ingressos', clicks: 1842, conversions: 87, producerId: 1, eventId: 1, trackedUrl: 'https://disk.ing/4amigos-instagram', qrPayload: 'https://disk.ing/4amigos-instagram' },
  { id: 2, code: '4amigos-google', name: 'Google Ads — Pesquisa Direta', destination: 'https://diskingressos.com.br/evento/1760', source: 'google', medium: 'cpc', campaign: 'pesquisa_curitiba', content: 'anuncio_topo', term: '4amigos curitiba', clicks: 940, conversions: 31, producerId: 1, eventId: 1, trackedUrl: 'https://disk.ing/4amigos-google', qrPayload: 'https://disk.ing/4amigos-google' },
  { id: 3, code: '4amigos-whatsapp', name: 'WhatsApp — Disparo Último Lote', destination: 'https://diskingressos.com.br/evento/1760', source: 'whatsapp', medium: 'mensagem', campaign: 'ultimo_lote_urgencia', content: 'cta_vip', term: '', clicks: 480, conversions: 24, producerId: 1, eventId: 1, trackedUrl: 'https://disk.ing/4amigos-whatsapp', qrPayload: 'https://disk.ing/4amigos-whatsapp' },
  { id: 4, code: '4amigos-tiktok', name: 'TikTok Ads — Vídeo Lineup', destination: 'https://diskingressos.com.br/evento/1760', source: 'tiktok', medium: 'feed_video', campaign: 'trends_curitiba', content: 'video_lineup', term: '', clicks: 2150, conversions: 38, producerId: 1, eventId: 1, trackedUrl: 'https://disk.ing/4amigos-tiktok', qrPayload: 'https://disk.ing/4amigos-tiktok' },
  { id: 5, code: 'cult-vip', name: 'Influencer — Curitiba Cult VIP', destination: 'https://diskingressos.com.br/evento/1760', source: 'curitibacult', medium: 'influencer', campaign: 'parceria_vip', content: 'stories_arrasta', term: 'cupom_cult', clicks: 1420, conversions: 64, producerId: 1, eventId: 1, trackedUrl: 'https://disk.ing/cult-vip', qrPayload: 'https://disk.ing/cult-vip' },
  { id: 6, code: 'news-vip', name: 'E-mail — Newsletter Base Ativa', destination: 'https://diskingressos.com.br/evento/1760', source: 'email', medium: 'newsletter', campaign: 'base_ativa_shows', content: 'banner_principal', term: '', clicks: 890, conversions: 48, producerId: 1, eventId: 1, trackedUrl: 'https://disk.ing/news-vip', qrPayload: 'https://disk.ing/news-vip' },
  { id: 7, code: 'fb-remarketing', name: 'Facebook Ads — Remarketing Checkout', destination: 'https://diskingressos.com.br/evento/1760', source: 'facebook', medium: 'remarketing', campaign: 'abandono_carrinho', content: 'anuncio_carrossel', term: '', clicks: 630, conversions: 52, producerId: 1, eventId: 1, trackedUrl: 'https://disk.ing/fb-remarketing', qrPayload: 'https://disk.ing/fb-remarketing' },
  { id: 8, code: 'promoter-vip', name: 'Afiliados — Promoters Oficiais', destination: 'https://diskingressos.com.br/evento/1760', source: 'afiliados', medium: 'promoter', campaign: 'divulgacao_equipe', content: 'link_exclusivo', term: 'promoter_01', clicks: 1180, conversions: 58, producerId: 1, eventId: 1, trackedUrl: 'https://disk.ing/promoter-vip', qrPayload: 'https://disk.ing/promoter-vip' },
];

function getMockDashboard(linkId: number): UtmDashboard {
  const link = mockLinks.find(l => l.id === linkId) || mockLinks[0];
  const mult = link.id === 1 ? 1 : link.id === 2 ? 0.51 : link.id === 3 ? 0.26 : link.id === 4 ? 1.16 : link.id === 5 ? 0.77 : link.id === 6 ? 0.48 : link.id === 7 ? 0.34 : 0.64;
  const visits = Math.round(1842 * mult);
  const added = Math.round(312 * mult);
  const checkout = Math.round(145 * mult);
  const abandoned = Math.round(58 * mult);
  const finalized = Math.round(87 * mult);
  const revenueCents = Math.round(1248050 * mult);
  const avgTicketCents = finalized ? Math.round(revenueCents / finalized) : 14345;
  const conversionRate = visits ? (finalized / visits) * 100 : 0;

  return {
    link,
    summary: {
      visits,
      attributedSessions: Math.round(284 * mult),
      activeAttributions: Math.round(14 * mult),
      abandonedAttributions: Math.round(42 * mult),
      convertedAttributions: finalized,
      added,
      checkout,
      removed: Math.round(18 * mult),
      abandoned,
      finalized,
      revenueCents,
      avgTicketCents,
      conversionRate,
    },
    timeline: [
      { date: '2026-08-20', added: Math.round(42 * mult), checkout: Math.round(22 * mult), removed: 2, abandoned: 8, finalized: Math.round(14 * mult), revenueCents: Math.round(198000 * mult) },
      { date: '2026-08-21', added: Math.round(58 * mult), checkout: Math.round(30 * mult), removed: 4, abandoned: 10, finalized: Math.round(20 * mult), revenueCents: Math.round(285000 * mult) },
      { date: '2026-08-22', added: Math.round(85 * mult), checkout: Math.round(44 * mult), removed: 5, abandoned: 16, finalized: Math.round(28 * mult), revenueCents: Math.round(412000 * mult) },
      { date: '2026-08-23', added: Math.round(127 * mult), checkout: Math.round(49 * mult), removed: 7, abandoned: 24, finalized: Math.round(25 * mult), revenueCents: Math.round(353050 * mult) },
    ],
    hours: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      added: (h >= 10 && h <= 23) ? Math.round((Math.sin(h / 3) * 8 + 10) * mult) : 1,
      checkout: (h >= 10 && h <= 23) ? Math.round((Math.sin(h / 3) * 4 + 5) * mult) : 0,
      removed: (h >= 14 && h <= 22) ? 1 : 0,
      abandoned: (h >= 12 && h <= 23) ? Math.round((Math.sin(h / 3) * 2 + 2) * mult) : 0,
      finalized: (h >= 12 && h <= 23) ? Math.round((Math.sin(h / 3) * 3 + 3) * mult) : 0,
    })),
    actions: [
      { id: 101, action: 'finalized', orderCode: '#PED-94821', customerName: 'Camila Guimarães', customerEmail: 'camila.g@gmail.com', ticketSummary: '2x Plateia Premium', amountCents: 36000, createdAt: '2026-08-23T19:42:10Z' },
      { id: 102, action: 'checkout', orderCode: '#PED-94820', customerName: 'Rodrigo Antunes', customerEmail: 'rodrigo.a@outlook.com', ticketSummary: '1x Plateia Central', amountCents: 18000, createdAt: '2026-08-23T19:35:00Z' },
      { id: 103, action: 'abandoned', orderCode: '#PED-94818', customerName: 'Mariana Silveira', customerEmail: 'mariana.s@hotmail.com', ticketSummary: '2x Balcão Nobre', amountCents: 24000, createdAt: '2026-08-23T19:12:45Z' },
      { id: 104, action: 'finalized', orderCode: '#PED-94815', customerName: 'Felipe Rocha', customerEmail: 'felipe.r@gmail.com', ticketSummary: '4x Camarote Open', amountCents: 88000, createdAt: '2026-08-23T18:50:22Z' },
      { id: 105, action: 'added', orderCode: null, customerName: 'Beatriz Lima', customerEmail: 'beatriz.l@yahoo.com', ticketSummary: '1x Plateia Premium', amountCents: 18000, createdAt: '2026-08-23T18:30:10Z' },
      { id: 106, action: 'removed', orderCode: null, customerName: 'Lucas Mendes', customerEmail: 'lucas.m@gmail.com', ticketSummary: '1x Balcão Simples', amountCents: 9000, createdAt: '2026-08-23T18:15:00Z' },
    ],
    attributions: [
      { id: 201, sessionKey: 'sess_9942a1bc', status: 'converted', customerName: 'Camila Guimarães', customerEmail: 'camila.g@gmail.com', customerPhone: '(41) 99881-2244', cartValueCents: 36000, firstSeenAt: '2026-08-23T19:20:00Z', lastActivityAt: '2026-08-23T19:42:10Z', convertedAt: '2026-08-23T19:42:10Z', abandonedAt: null, order: { id: 94821, code: '#PED-94821', status: 'pago', grossCents: 36000 } },
      { id: 202, sessionKey: 'sess_8831f2dc', status: 'abandoned', customerName: 'Mariana Silveira', customerEmail: 'mariana.s@hotmail.com', customerPhone: '(41) 99123-4567', cartValueCents: 24000, firstSeenAt: '2026-08-23T18:55:00Z', lastActivityAt: '2026-08-23T19:12:45Z', convertedAt: null, abandonedAt: '2026-08-23T19:12:45Z', order: null },
      { id: 203, sessionKey: 'sess_7720e3ab', status: 'active', customerName: 'Rodrigo Antunes', customerEmail: 'rodrigo.a@outlook.com', customerPhone: '(41) 98765-4321', cartValueCents: 18000, firstSeenAt: '2026-08-23T19:30:00Z', lastActivityAt: '2026-08-23T19:35:00Z', convertedAt: null, abandonedAt: null, order: null },
      { id: 204, sessionKey: 'sess_6619d4ca', status: 'converted', customerName: 'Felipe Rocha', customerEmail: 'felipe.r@gmail.com', customerPhone: '(41) 99988-7766', cartValueCents: 88000, firstSeenAt: '2026-08-23T18:30:00Z', lastActivityAt: '2026-08-23T18:50:22Z', convertedAt: '2026-08-23T18:50:22Z', abandonedAt: null, order: { id: 94815, code: '#PED-94815', status: 'pago', grossCents: 88000 } },
    ],
  };
}

async function request<T>(path:string,options:RequestInit={}){
  try {
    const r=await fetch(`${API}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...(options.headers||{})}});
    const data=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.message||'Erro na API');
    return data as T;
  } catch (err: any) {
    // Graceful fallback for offline / Netlify demo
    if (path.startsWith('/auth/login')) {
      const body = JSON.parse((options.body as string) || '{}');
      const found = seedUsers.find(u => u.email.toLowerCase() === (body.email || '').toLowerCase()) || seedUsers[1];
      return { token: 'demo-jwt-token', user: found } as unknown as T;
    }
    if (path.startsWith('/auth/me')) {
      return seedUsers[1] as unknown as T;
    }
    if (path.startsWith('/producers')) {
      return seedProducers as unknown as T;
    }
    if (path.startsWith('/users')) {
      return seedUsers as unknown as T;
    }
    if (path.startsWith('/events')) {
      return seedEvents as unknown as T;
    }
    if (path.startsWith('/marketing/links')) {
      if (options.method === 'POST') {
        const body = JSON.parse((options.body as string) || '{}');
        const newLink: TrackingLink = {
          id: Date.now(),
          code: body.name ? body.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'link-utm',
          name: body.name || 'Nova UTM',
          destination: body.destination || 'https://diskingressos.com.br/',
          source: body.source || null,
          medium: body.medium || null,
          campaign: body.campaign || null,
          content: body.content || null,
          term: body.term || null,
          clicks: 0,
          conversions: 0,
          producerId: body.producerId || 1,
          eventId: body.eventId || 1,
          trackedUrl: `${body.destination || 'https://diskingressos.com.br/'}?utm_source=${body.source || ''}&utm_medium=${body.medium || ''}&utm_campaign=${body.campaign || ''}`,
          qrPayload: body.destination || 'https://diskingressos.com.br/',
        };
        mockLinks.unshift(newLink);
        return newLink as unknown as T;
      }
      return mockLinks as unknown as T;
    }
    if (path.startsWith('/marketing/utm/dashboard')) {
      const url = new URL(`http://localhost${path}`);
      const linkId = Number(url.searchParams.get('linkId') || '1');
      return getMockDashboard(linkId) as unknown as T;
    }
    if (path.startsWith('/marketing/utm/abandon-sweep')) {
      return { processed: 3, recoveries: 2 } as unknown as T;
    }
    if (path.startsWith('/marketing/campaigns')) {
      return [] as unknown as T;
    }
    if (path.startsWith('/marketing/integrations')) {
      return [] as unknown as T;
    }
    if (path.startsWith('/automation/')) {
      return [] as unknown as T;
    }
    if (path.startsWith('/operations/summary')) {
      return { events: seedEvents.length, lots: 12, orders: 480, tickets: 950, participants: 600, checkins: 420, terminals: 4, payouts: 2, balanceCents: 15400000 } as unknown as T;
    }
    if (path.startsWith('/lots') || path.startsWith('/orders') || path.startsWith('/participants') || path.startsWith('/tickets') || path.startsWith('/checkins')) {
      return [] as unknown as T;
    }
    if (path.startsWith('/finance/balance')) {
      return { entriesCents: 18450000, exitsCents: 3050000, balanceCents: 15400000 } as unknown as T;
    }
    throw err;
  }
}
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
