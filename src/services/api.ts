import type { User as AppUser } from '../types/auth';
import type { Producer } from '../types/producer';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
let token = '';

export function setApiToken(value: string) {
  token = value;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(data.message || data.error || 'Erro na API');
  }
  return data as T;
}

export async function login(email: string, password: string) {
  return request<{ token: string; user: AppUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export const getProducers = () => request<Producer[]>('/producers');
export const getUsers = () => request<AppUser[]>('/users');
export const getEvents = (producerId?: number) =>
  request<any[]>(`/events${producerId ? `?producerId=${producerId}` : ''}`);
export const getEventById = (id: number) => request<any>(`/events/${id}`);
export const getEventByCode = (code: string) => request<any>(`/events/code/${code}`);
export const getAudit = () => request<any[]>('/audit');

export interface OperationalSummary {
  events: number;
  lots: number;
  orders: number;
  tickets: number;
  participants: number;
  checkins: number;
  terminals: number;
  payouts: number;
  balanceCents: number;
}

function qs(values: Record<string, number | undefined>) {
  const p = new URLSearchParams();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined) p.set(k, String(v));
  });
  const q = p.toString();
  return q ? `?${q}` : '';
}

export const getOperationalSummary = (producerId?: number) =>
  request<OperationalSummary>(`/operations/summary${qs({ producerId })}`);

export const getLots = (eventId?: number, producerId?: number) =>
  request<any[]>(`/lots${qs({ eventId, producerId })}`);

export const getOrders = (eventId?: number, producerId?: number) =>
  request<any[]>(`/orders${qs({ eventId, producerId })}`);

export const getParticipantsApi = (eventId?: number, producerId?: number) =>
  request<any[]>(`/participants${qs({ eventId, producerId })}`);

export const getCheckins = (eventId?: number, producerId?: number) =>
  request<any[]>(`/checkins${qs({ eventId, producerId })}`);

export const getFinanceBalance = (producerId?: number) =>
  request<{ entriesCents: number; exitsCents: number; balanceCents: number }>(
    `/finance/balance${qs({ producerId })}`
  );

export const getTickets = (eventId?: number, producerId?: number) =>
  request<any[]>(`/tickets${qs({ eventId, producerId })}`);

// Marketing & Tracking APIs (Fase 12 & 13)
export interface MarketingCampaign {
  id: number;
  name: string;
  channel: string;
  objective: string;
  status: string;
  budgetCents: number;
  spentCents: number;
  revenueCents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startsAt?: string | null;
  endsAt?: string | null;
  producerId: number;
  eventId: number | null;
  event?: { id: number; title: string } | null;
  producer?: { id: number; name: string };
}

export interface TrackingLink {
  id: number;
  code: string;
  name: string;
  destination: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  clicks: number;
  conversions: number;
  producerId: number;
  eventId: number | null;
  trackedUrl: string;
  qrPayload: string;
  event?: { id: number; title: string } | null;
}

export interface TrackingConfig {
  id?: number;
  provider: string;
  scope: 'global' | 'producer' | 'event';
  mode: 'inherit' | 'own' | 'disabled';
  externalId: string | null;
  configJson?: string | null;
  producerId?: number | null;
  eventId?: number | null;
}

export interface ResolvedTracking {
  provider: string;
  source: string;
  mode: string;
  externalId: string | null;
  configJson: string | null;
}

export const getMarketingCampaigns = (producerId?: number, eventId?: number) =>
  request<MarketingCampaign[]>(`/marketing/campaigns${qs({ producerId, eventId })}`);

export const createMarketingCampaign = (body: any) =>
  request<MarketingCampaign>('/marketing/campaigns', { method: 'POST', body: JSON.stringify(body) });

export const updateMarketingCampaign = (id: number, body: any) =>
  request<MarketingCampaign>(`/marketing/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const getTrackingLinks = (producerId?: number, eventId?: number) =>
  request<TrackingLink[]>(`/marketing/links${qs({ producerId, eventId })}`);

export const createTrackingLink = (body: any) =>
  request<TrackingLink>('/marketing/links', { method: 'POST', body: JSON.stringify(body) });

export const getTrackingConfigs = (producerId?: number, eventId?: number) =>
  request<TrackingConfig[]>(`/marketing/tracking${qs({ producerId, eventId })}`);

export const saveTrackingConfig = (body: TrackingConfig) =>
  request<TrackingConfig>('/marketing/tracking', { method: 'PUT', body: JSON.stringify(body) });

export const getResolvedTracking = (producerId?: number, eventId?: number) =>
  request<ResolvedTracking[]>(`/marketing/tracking/resolved${qs({ producerId, eventId })}`);

// Automation & Messaging APIs (Fase 13)
export interface AutomationFlow {
  id: number;
  name: string;
  trigger: string;
  channel: 'whatsapp' | 'email' | 'multicanal';
  audience: string;
  status: string;
  delayMinutes: number;
  sentCount: number;
  convertedCount: number;
  revenueCents: number;
  producerId: number;
  eventId: number | null;
  event?: { id: number; title: string } | null;
}

export interface MessageTemplate {
  id: number;
  name: string;
  channel: 'whatsapp' | 'email';
  category: string;
  subject: string | null;
  body: string;
  status: string;
  producerId: number;
  eventId: number | null;
  event?: { id: number; title: string } | null;
}

export interface AutomationExecution {
  id: number;
  channel: string;
  destination: string | null;
  status: string;
  scheduledAt: string;
  executedAt: string | null;
  messagePreview: string | null;
  revenueCents: number;
  flow: { id: number; name: string; trigger: string };
  event?: { id: number; title: string } | null;
}

export interface RecoveryOpportunity {
  id: number;
  code: string;
  kind: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  amountCents: number;
  status: string;
  preferredChannel: string;
  lastActivityAt: string;
  recoveredAt: string | null;
  revenueCents: number;
  producerId: number;
  eventId: number | null;
  event?: { id: number; title: string } | null;
}

export interface AutomationSummary {
  activeFlows: number;
  totalFlows: number;
  templates: number;
  executions: number;
  openRecoveries: number;
  potentialCents: number;
  recoveredCount: number;
  recoveredCents: number;
  sent: number;
  conversions: number;
}

export const getAutomationFlows = (producerId?: number, eventId?: number) =>
  request<AutomationFlow[]>(`/automation/flows${qs({ producerId, eventId })}`);

export const createAutomationFlow = (body: any) =>
  request<AutomationFlow>('/automation/flows', { method: 'POST', body: JSON.stringify(body) });

export const updateAutomationFlow = (id: number, body: any) =>
  request<AutomationFlow>(`/automation/flows/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const testAutomationFlow = (id: number) =>
  request<any>(`/automation/flows/${id}/test`, { method: 'POST' });

export const getMessageTemplates = (producerId?: number, eventId?: number, channel?: string) =>
  request<MessageTemplate[]>(
    `/automation/templates${qs({ producerId, eventId })}${channel ? `${qs({ producerId, eventId }) ? '&' : '?'}channel=${encodeURIComponent(channel)}` : ''}`
  );

export const createMessageTemplate = (body: any) =>
  request<MessageTemplate>('/automation/templates', { method: 'POST', body: JSON.stringify(body) });

export const getAutomationExecutions = (producerId?: number) =>
  request<AutomationExecution[]>(`/automation/executions${qs({ producerId })}`);

export const getRecoveries = (producerId?: number, eventId?: number, kind?: string) =>
  request<RecoveryOpportunity[]>(
    `/automation/recoveries${qs({ producerId, eventId })}${kind ? `${qs({ producerId, eventId }) ? '&' : '?'}kind=${encodeURIComponent(kind)}` : ''}`
  );

export const createRecovery = (body: any) =>
  request<RecoveryOpportunity>('/automation/recoveries', { method: 'POST', body: JSON.stringify(body) });

export const markRecoveryRecovered = (id: number) =>
  request<RecoveryOpportunity>(`/automation/recoveries/${id}/recover`, { method: 'PATCH' });

export const getAutomationSummary = (producerId?: number) =>
  request<AutomationSummary>(`/automation/summary${qs({ producerId })}`);

// Support & Service Desk APIs (Fase 14)
export interface SupportTicket {
  id: number;
  code: string;
  subject: string;
  description: string;
  category: string;
  impact: string;
  urgency: string;
  priority: string;
  status: string;
  channel: string;
  requesterName: string;
  requesterEmail?: string | null;
  requesterPhone?: string | null;
  assignedTo?: string | null;
  firstResponseAt?: string | null;
  responseDueAt: string;
  resolutionDueAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
  slaBreached: boolean;
  producerId: number;
  eventId?: number | null;
  event?: { id: number; title: string } | null;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: number;
  author: string;
  body: string;
  channel: string;
  internal: boolean;
  ticketId: number;
  createdAt: string;
}

export interface SlaPolicy {
  id: number;
  name: string;
  priority: string;
  responseMinutes: number;
  resolutionMinutes: number;
  businessHours: string;
  active: boolean;
  producerId: number;
}

export interface SupportIntegration {
  id: number;
  name: string;
  type: string;
  status: string;
  description?: string | null;
  producerId: number;
}

export interface SupportSummary {
  total: number;
  open: number;
  p1: number;
  overdue: number;
  resolved: number;
  slaCompliance: number;
}

export const getSupportSummary = (producerId?: number) =>
  request<SupportSummary>(`/support/summary${qs({ producerId })}`);

export const getSupportTickets = (producerId?: number) =>
  request<SupportTicket[]>(`/support/tickets${qs({ producerId })}`);

export const createSupportTicket = (body: any) =>
  request<SupportTicket>('/support/tickets', { method: 'POST', body: JSON.stringify(body) });

export const updateSupportTicket = (id: number, body: any) =>
  request<SupportTicket>(`/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const createTicketMessage = (id: number, body: any) =>
  request<TicketMessage>(`/support/tickets/${id}/messages`, { method: 'POST', body: JSON.stringify(body) });

export const getSlaPolicies = (producerId?: number) =>
  request<SlaPolicy[]>(`/support/sla-policies${qs({ producerId })}`);

export const getSupportIntegrations = (producerId?: number) =>
  request<SupportIntegration[]>(`/support/integrations${qs({ producerId })}`);

// Communication Integrations APIs (Fase 14)
export interface CommunicationChannel {
  id: number;
  type: string;
  provider: string;
  sender?: string | null;
  status: string;
  webhookMode: string;
  producerId: number;
}

export interface ContactConsent {
  id: number;
  contact: string;
  channel: string;
  status: string;
  source: string;
  producerId: number;
  updatedAt: string;
}

export interface CommunicationSummary {
  channels: number;
  activeChannels: number;
  queued: number;
  sent: number;
  failed: number;
  optOuts: number;
}

export const getCommunicationSummary = (producerId?: number) =>
  request<CommunicationSummary>(`/communication/summary${qs({ producerId })}`);

export const getCommunicationChannels = (producerId?: number) =>
  request<CommunicationChannel[]>(`/communication/channels${qs({ producerId })}`);

export const updateCommunicationChannel = (id: number, body: any) =>
  request<CommunicationChannel>(`/communication/channels/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const getCommunicationQueue = (producerId?: number) =>
  request<any[]>(`/communication/queue${qs({ producerId })}`);

export const getContactConsents = (producerId?: number) =>
  request<ContactConsent[]>(`/communication/consents${qs({ producerId })}`);

export const createContactConsent = (body: any) =>
  request<ContactConsent>('/communication/consents', { method: 'POST', body: JSON.stringify(body) });

// Fase 16.1 — Multi-Pixel & Multi-Token Tracking APIs
export interface ApiTrackingIntegration {
  id: number;
  name: string;
  provider: 'meta' | 'google' | 'tiktok' | 'gtm' | 'custom';
  type: string;
  pixelId: string;
  maskedToken?: string;
  hasToken?: boolean;
  testEventCode?: string;
  status: 'ativo' | 'pausado' | 'atencao' | 'erro';
  inheritanceMode: 'all_events' | 'selected_events' | 'current_event';
  lastEventName?: string;
  lastFiredAt?: string;
  lastResponseStatus?: string;
  lastErrorMessage?: string;
  eventsSentToday: number;
  producerId: number;
  targetEventNames?: string[];
  trackedEvents?: string[];
  events?: { id: number; eventId: number; event: { id: number; code: string; title: string; venue: string } }[];
  logs?: TrackingLogItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackingLogItem {
  id: number;
  integrationId: number;
  eventId?: number;
  eventName: string;
  status: 'success' | 'error';
  responseCode: number;
  responseBody?: string;
  payloadSample?: string;
  createdAt: string;
}

export interface TrackingSummary {
  total: number;
  active: number;
  paused: number;
  attention: number;
  eventsSentToday: number;
  matchQuality: string;
  serverSideCoverage: string;
}

export const getTrackingSummary = (producerId?: number) =>
  request<TrackingSummary>(`/tracking/summary${qs({ producerId })}`);

export const getTrackingIntegrations = (producerId?: number, eventId?: number) =>
  request<ApiTrackingIntegration[]>(`/tracking/integrations${qs({ producerId, eventId })}`);

export const getTrackingIntegration = (id: number) =>
  request<ApiTrackingIntegration>(`/tracking/integrations/${id}`);

export const createTrackingIntegration = (body: any) =>
  request<ApiTrackingIntegration>('/tracking/integrations', { method: 'POST', body: JSON.stringify(body) });

export const updateTrackingIntegration = (id: number, body: any) =>
  request<ApiTrackingIntegration>(`/tracking/integrations/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const toggleTrackingIntegration = (id: number) =>
  request<{ ok: boolean; id: number; status: string }>(`/tracking/integrations/${id}/toggle`, { method: 'PATCH' });

export const duplicateTrackingIntegration = (id: number) =>
  request<ApiTrackingIntegration>(`/tracking/integrations/${id}/duplicate`, { method: 'POST' });

export const deleteTrackingIntegration = (id: number) =>
  request<{ ok: boolean; message: string }>(`/tracking/integrations/${id}`, { method: 'DELETE' });

export const testTrackingIntegration = (id: number, eventName?: string) =>
  request<{ ok: boolean; message: string; responseStatus: string; logId: number; timestamp: string }>(
    `/tracking/integrations/${id}/test`,
    { method: 'POST', body: JSON.stringify({ eventName: eventName || 'Purchase' }) }
  );

export const getTrackingIntegrationLogs = (id: number) =>
  request<TrackingLogItem[]>(`/tracking/integrations/${id}/logs`);

