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
