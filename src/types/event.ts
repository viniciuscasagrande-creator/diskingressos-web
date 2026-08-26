export type EventStatus = 'ativo' | 'inativo' | 'rascunho' | 'encerrado' | 'esgotado';

export type EventCategory = 
  | 'Show & Música' 
  | 'Show'
  | 'Festival'
  | 'Teatro & Espetáculo' 
  | 'Teatro'
  | 'Conferência & Palestra' 
  | 'Congresso'
  | 'Stand-up & Comédia' 
  | 'Esporte'
  | 'Esportivo'
  | 'Gastronômico';

export interface TicketBatch {
  id: string | number;
  name: string;
  category?: 'Pista' | 'VIP' | 'Camarote' | 'Mesa' | 'Plateia' | 'Área Premium' | 'Inteira' | 'Meia' | 'Cortesia';
  type?: 'Inteira' | 'Meia' | 'VIP' | 'Cortesia' | string;
  price: number;
  fee?: number;
  totalQuantity?: number;
  qty?: number;
  soldQuantity?: number;
  sold?: number;
  courtesyQuantity?: number;
  availableQuantity?: number;
  startDate?: string;
  endDate?: string;
  start?: string;
  end?: string;
  status: 'ativo' | 'esgotado' | 'pausado' | 'agendado' | 'encerrado';
}

export interface MetaPixelConfig {
  pixelId: string;
  conversionApiToken?: string;
  testCode?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  tiktokPixelId?: string;
  activeUtms?: { source: string; medium: string; campaign: string; clicks: number; conversions: number }[];
}

export interface FacialRecognitionMetrics {
  enabled: boolean;
  registeredCount: number;
  pendingCount: number;
  validationRate: number; // percentage e.g. 98.4%
}

export interface EventItem {
  id: number;
  code: string; // e.g. "1760", "3571"
  title: string;
  subtitle?: string;
  description?: string;
  category: EventCategory | string;
  venue: string;
  city: string;
  state?: string;
  address?: string;
  date: string; // "30/06/2027 10:00"
  endDate?: string;
  status: EventStatus;
  visibility?: 'publico' | 'privado';
  producerId?: string;
  producerName?: string;
  producer?: string;
  
  // Financial & Ticket Metrics
  totalRevenue: number; // e.g. 485290.00
  total?: string;
  salesCount: number; // ingressos vendidos
  sales?: number;
  availableCount: number; // ingressos disponíveis
  available?: number;
  courtesyCount: number; // cortesias emitidas
  courtesy?: number;
  totalCapacity?: number;
  occupancyRate: number; // 0 to 100
  occupancy?: string;
  averageTicketPrice?: number;
  
  // Design & Media
  coverType?: 'nature' | 'maiden' | 'conference' | 'conference2' | 'festival' | 'standup' | 'electronic' | 'custom' | string;
  cover?: string;
  customImageUrl?: string;
  badge?: string;
  featured?: boolean;
  
  // Details
  batches: TicketBatch[];
  metaPixel?: MetaPixelConfig;
  facialRecognition?: FacialRecognitionMetrics;
  createdAt?: string;
}

export interface EventFilterState {
  searchQuery: string;
  statusFilter: 'todos' | 'ativos' | 'inativos' | 'rascunhos';
  cityFilter: string;
  categoryFilter: string;
  producerFilter: string;
  periodFilter: 'todos' | 'proximos7dias' | 'esteMes' | 'proximos30dias' | 'anoAtual';
  sortBy: 'dateAsc' | 'dateDesc' | 'salesDesc' | 'revenueDesc' | 'occupancyDesc' | 'nameAsc';
  viewMode: 'horizontal' | 'grid' | 'table';
}
