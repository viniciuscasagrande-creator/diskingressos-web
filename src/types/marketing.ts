export type MarketingChannel = 
  | 'instagram' 
  | 'facebook' 
  | 'google' 
  | 'whatsapp' 
  | 'email' 
  | 'direct' 
  | 'affiliate' 
  | 'influencer'
  | 'tiktok' 
  | 'crm' 
  | 'coupon' 
  | 'qrcode'
  | 'multichannel';

export type TrackingInheritanceMode = 'inherit' | 'custom' | 'disabled';

export interface CampaignChannelDetail {
  id: string;
  channel: MarketingChannel;
  channelName: string;
  subchannel?: string; // e.g. "Stories", "Feed", "Search", "Base Ativa", "Remarketing"
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  budget: number;
  spent: number;
  salesCount: number;
  revenue: number;
  roi: number; // percentage
  cpa: number;
  ctr: number;
  status: 'active' | 'paused';
  trackingUrl?: string;
}

export type CampaignStatus = 'draft' | 'configured' | 'scheduled' | 'active' | 'paused' | 'finished';

export interface MarketingCampaign {
  id: string;
  code: string;
  name: string;
  objective: 'vendas' | 'lancamento' | 'urgencia' | 'remarketing' | 'reconhecimento' | 'reativacao';
  objectiveLabel: string;
  eventId: number | null; // null = global do produtor
  eventName?: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  reach?: number;
  visitors?: number;
  carts?: number;
  checkouts?: number;
  salesCount: number;
  revenue: number;
  conversionRate?: number;
  roi: number;
  roas?: number;
  cpa: number;
  ctr: number;
  startDate: string;
  endDate?: string;
  utmCampaign: string;
  audienceName?: string;
  channels: CampaignChannelDetail[];
  channelLabel?: string;
  isTemplate?: boolean;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'lancamento' | 'urgencia' | 'remarketing' | 'midia_paga' | 'engajamento' | 'influencia';
  recommendedBudget: number;
  channelsCount: number;
  channels: CampaignChannelDetail[];
  targetAudience: string;
  expectedRoi: string;
  badge: string;
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
  value?: number;
  discountValue?: number;
  eventId: number | null;
  eventName?: string;
  usageLimit?: number;
  maxUses?: number;
  usageCount?: number;
  currentUses?: number;
  totalDiscountGiven?: number;
  revenueGenerated: number;
  status: 'active' | 'expired' | 'paused';
  expiresAt?: string;
  validUntil?: string;
}

export interface TrackingTagConfig {
  id: string;
  name: string;
  type: 'meta-pixel' | 'google-analytics' | 'google-tag-manager' | 'google-ads' | 'tiktok-pixel';
  token: string;
  mode: TrackingInheritanceMode;
  status: 'active' | 'inactive';
}
