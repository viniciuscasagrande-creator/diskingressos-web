export type MarketingChannel = 'instagram' | 'facebook' | 'google' | 'whatsapp' | 'email' | 'direct' | 'affiliate';

export type TrackingInheritanceMode = 'inherit' | 'custom' | 'disabled';

export interface TrackingTagConfig {
  id: string;
  name: string;
  type: 'meta-pixel' | 'google-analytics' | 'google-tag-manager' | 'google-ads' | 'tiktok-pixel';
  token: string;
  mode: TrackingInheritanceMode;
  status: 'active' | 'inactive';
}

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: MarketingChannel;
  channelLabel: string;
  eventId: number | null; // null = global do produtor
  eventName?: string;
  status: 'active' | 'scheduled' | 'paused' | 'completed';
  budget: number;
  spent: number;
  salesCount: number;
  revenue: number;
  roi: number; // percentage, e.g. 420
  ctr: number;
  cpa: number;
  startDate: string;
  endDate?: string;
  utmSource: string;
  utmCampaign: string;
}

export interface ConversionFunnelData {
  visitors: number;
  views: number;
  checkout: number;
  payments: number;
  sales: number;
}

export interface ChannelPerformance {
  channel: MarketingChannel;
  channelLabel: string;
  percentage: number;
  revenue: number;
  sales: number;
  color: string;
}

export interface AbandonedCart {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  eventId: number;
  eventName: string;
  batchName: string;
  ticketCount: number;
  totalValue: number;
  abandonedAt: string;
  status: 'abandoned' | 'recovered' | 'in_recovery' | 'expired';
  recoveryChannel?: 'whatsapp' | 'email';
}

export interface UtmLink {
  id: string;
  title: string;
  baseUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  fullUrl: string;
  clicks: number;
  conversions: number;
  revenue: number;
  createdAt: string;
}

export interface CouponPromo {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  eventId: number | null;
  eventName?: string;
  maxUses: number;
  currentUses: number;
  totalDiscountGiven: number;
  revenueGenerated: number;
  validUntil: string;
  status: 'active' | 'expired' | 'depleted';
}
