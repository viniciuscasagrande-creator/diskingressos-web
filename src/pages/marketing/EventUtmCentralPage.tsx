import React, { useState, useMemo } from 'react';
import { 
  Link, QrCode, Copy, Check, Plus, ExternalLink, 
  MousePointerClick, ShoppingCart, DollarSign, Download,
  TrendingUp, BarChart3, Users, Clock, AlertTriangle,
  ArrowRight, Search, Filter, RefreshCw, Play, Pause,
  Edit3, SlidersHorizontal, Layers, MessageSquare, Mail,
  Sparkles, Share2, Trash2, Zap, CheckCircle2, ChevronRight,
  ChevronDown, X, Tag, ArrowUpRight, Percent, Calendar
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

export interface UtmOrderRecord {
  id: string;
  status: 'Finalizou' | 'Adicionou' | 'Removeu' | 'Abandonou' | 'Recuperado';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  utmParams: string;
  ticketDescription: string;
  value: number;
  dateTime: string;
  hour: number;
  recovered?: boolean;
  recoveryChannel?: 'whatsapp' | 'email' | 'automacao';
  journey: { time: string; event: string; detail?: string; iconType?: string }[];
}

export interface UtmCampaignData {
  id: string;
  code: string;
  name: string;
  shortUrl: string;
  fullUrl: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  description: string;
  status: 'ativo' | 'pausado';
  createdAt: string;
  metrics: {
    visitors: number;
    addedToCart: number;
    checkoutStarted: number;
    abandoned: number;
    purchased: number;
    revenue: number;
    averageTicket: number;
    conversionRate: number;
    rates: {
      visitorToCart: number;
      cartToCheckout: number;
      checkoutToPurchase: number;
    };
  };
  timelineData: { time: string; revenue: number; conversions: number; actions: number; avgTicket: number }[];
  hourlyDistribution: { hour: number; hourLabel: string; count: number; revenue: number }[];
  orders: UtmOrderRecord[];
}

// Initial Mock UTMs Data
const initialUtmCampaigns: UtmCampaignData[] = [
  {
    id: 'utm-1',
    code: '4amigos-instagram',
    name: 'Instagram — Lançamento 2026',
    shortUrl: 'disk.ing/4amigos-instagram',
    fullUrl: 'https://diskingressos.com.br/evento/1760?utm_source=instagram&utm_medium=cpc&utm_campaign=lancamento_2026&utm_content=story_01&utm_term=ingressos',
    source: 'instagram',
    medium: 'cpc',
    campaign: 'lancamento_2026',
    content: 'story_01',
    term: 'ingressos',
    description: 'Instagram — Story lançamento oficial com vídeo 15s',
    status: 'ativo',
    createdAt: '14/04/2026',
    metrics: {
      visitors: 1842,
      addedToCart: 326,
      checkoutStarted: 142,
      abandoned: 18,
      purchased: 87,
      revenue: 12480.50,
      averageTicket: 143.45,
      conversionRate: 4.72,
      rates: {
        visitorToCart: 17.7,
        cartToCheckout: 43.5,
        checkoutToPurchase: 61.3,
      }
    },
    timelineData: [
      { time: '18/08', revenue: 1420, conversions: 10, actions: 48, avgTicket: 142.0 },
      { time: '19/08', revenue: 2150, conversions: 15, actions: 72, avgTicket: 143.3 },
      { time: '20/08', revenue: 1980, conversions: 14, actions: 64, avgTicket: 141.4 },
      { time: '21/08', revenue: 2890, conversions: 20, actions: 98, avgTicket: 144.5 },
      { time: '22/08', revenue: 3120, conversions: 22, actions: 112, avgTicket: 141.8 },
      { time: '23/08', revenue: 920.5, conversions: 6, actions: 32, avgTicket: 153.4 },
    ],
    hourlyDistribution: [
      { hour: 0, hourLabel: '00h', count: 1, revenue: 140 },
      { hour: 2, hourLabel: '02h', count: 0, revenue: 0 },
      { hour: 4, hourLabel: '04h', count: 0, revenue: 0 },
      { hour: 6, hourLabel: '06h', count: 1, revenue: 180 },
      { hour: 8, hourLabel: '08h', count: 4, revenue: 560 },
      { hour: 10, hourLabel: '10h', count: 8, revenue: 1120 },
      { hour: 12, hourLabel: '12h', count: 14, revenue: 1980 },
      { hour: 14, hourLabel: '14h', count: 9, revenue: 1260 },
      { hour: 16, hourLabel: '16h', count: 11, revenue: 1540 },
      { hour: 18, hourLabel: '18h', count: 16, revenue: 2320 },
      { hour: 19, hourLabel: '19h', count: 12, revenue: 1840 },
      { hour: 20, hourLabel: '20h', count: 7, revenue: 980 },
      { hour: 22, hourLabel: '22h', count: 4, revenue: 560 },
    ],
    orders: [
      {
        id: '#16358334',
        status: 'Finalizou',
        customerName: 'João Silva Santos',
        customerEmail: 'joao.silva@email.com',
        customerPhone: '(41) 99881-2233',
        utmParams: 'instagram / cpc',
        ticketDescription: '2x Ingressos Pista Premium',
        value: 180.00,
        dateTime: '23/08 19:42',
        hour: 19,
        journey: [
          { time: '19:40', event: 'Visitou a página do evento', detail: 'Via Instagram Story #01' },
          { time: '19:40', event: 'Adicionou 3 ingressos ao carrinho', detail: 'Pista Premium Lote 1' },
          { time: '19:41', event: 'Removeu 1 ingresso', detail: 'Ajustou para 2 ingressos' },
          { time: '19:42', event: 'Checkout iniciado', detail: 'Preencheu dados de contato' },
          { time: '19:42', event: 'Compra finalizada com sucesso', detail: 'Pago via PIX imediato • R$ 180,00' }
        ]
      },
      {
        id: '#16358334-act2',
        status: 'Removeu',
        customerName: 'João Silva Santos',
        customerEmail: 'joao.silva@email.com',
        utmParams: 'instagram / cpc',
        ticketDescription: '1x Ingresso Pista Premium',
        value: 0,
        dateTime: '23/08 19:41',
        hour: 19,
        journey: [
          { time: '19:40', event: 'Adicionou 3 ingressos' },
          { time: '19:41', event: 'Removeu 1 ingresso do carrinho' }
        ]
      },
      {
        id: '#16358488',
        status: 'Abandonou',
        customerName: 'Rodrigo Medeiros',
        customerEmail: 'rodrigo.medeiros@gmail.com',
        customerPhone: '(41) 98765-4321',
        utmParams: 'instagram / cpc',
        ticketDescription: '2x Camarote Open Bar',
        value: 240.00,
        dateTime: '23/08 18:15',
        hour: 18,
        recovered: false,
        journey: [
          { time: '18:10', event: 'Visitou a página do evento' },
          { time: '18:12', event: 'Adicionou 2 ingressos Camarote' },
          { time: '18:14', event: 'Iniciou Checkout' },
          { time: '18:15', event: 'Abandonou o carrinho na etapa de pagamento' }
        ]
      },
      {
        id: '#16356495',
        status: 'Adicionou',
        customerName: 'Maria Fernanda Costa',
        customerEmail: 'maria.costa@yahoo.com.br',
        utmParams: 'instagram / cpc',
        ticketDescription: '1x Ingresso Área VIP',
        value: 120.00,
        dateTime: '23/08 17:22',
        hour: 17,
        journey: [
          { time: '17:20', event: 'Visitou a página do evento' },
          { time: '17:22', event: 'Adicionou 1 ingresso Área VIP' }
        ]
      },
      {
        id: '#16355912',
        status: 'Finalizou',
        customerName: 'Carlos Eduardo Lima',
        customerEmail: 'carlos.lima@gmail.com',
        utmParams: 'instagram / cpc',
        ticketDescription: '4x Passaporte Família',
        value: 360.00,
        dateTime: '23/08 16:40',
        hour: 16,
        journey: [
          { time: '16:35', event: 'Visitou via Instagram' },
          { time: '16:37', event: 'Adicionou 4 ingressos Família' },
          { time: '16:38', event: 'Checkout iniciado' },
          { time: '16:40', event: 'Pagamento Cartão Aprovado • R$ 360,00' }
        ]
      },
      {
        id: '#16354890',
        status: 'Finalizou',
        customerName: 'Patrícia Alcantara',
        customerEmail: 'patricia.alc@hotmail.com',
        utmParams: 'instagram / cpc',
        ticketDescription: '1x Pista Premium',
        value: 90.00,
        dateTime: '23/08 14:15',
        hour: 14,
        journey: [
          { time: '14:10', event: 'Visitou a página' },
          { time: '14:12', event: 'Adicionou 1 ingresso' },
          { time: '14:15', event: 'Compra finalizada • R$ 90,00' }
        ]
      },
    ]
  },
  {
    id: 'utm-2',
    code: 'google-pesquisa',
    name: 'Google Ads — Pesquisa Direta',
    shortUrl: 'disk.ing/4amigos-google',
    fullUrl: 'https://diskingressos.com.br/evento/1760?utm_source=google&utm_medium=cpc&utm_campaign=pesquisa_curitiba&utm_content=anuncio_topo&utm_term=4amigos+curitiba',
    source: 'google',
    medium: 'cpc',
    campaign: 'pesquisa_curitiba',
    content: 'anuncio_topo',
    term: '4amigos curitiba',
    description: 'Campanha de rede de pesquisa palavras-chave exatas Curitiba',
    status: 'ativo',
    createdAt: '15/04/2026',
    metrics: {
      visitors: 940,
      addedToCart: 160,
      checkoutStarted: 64,
      abandoned: 8,
      purchased: 31,
      revenue: 4920.00,
      averageTicket: 158.70,
      conversionRate: 3.30,
      rates: {
        visitorToCart: 17.0,
        cartToCheckout: 40.0,
        checkoutToPurchase: 48.4,
      }
    },
    timelineData: [
      { time: '18/08', revenue: 780, conversions: 5, actions: 24, avgTicket: 156.0 },
      { time: '19/08', revenue: 940, conversions: 6, actions: 30, avgTicket: 156.6 },
      { time: '20/08', revenue: 1100, conversions: 7, actions: 35, avgTicket: 157.1 },
      { time: '21/08', revenue: 1250, conversions: 8, actions: 40, avgTicket: 156.2 },
      { time: '22/08', revenue: 850, conversions: 5, actions: 28, avgTicket: 170.0 },
    ],
    hourlyDistribution: [
      { hour: 8, hourLabel: '08h', count: 2, revenue: 320 },
      { hour: 10, hourLabel: '10h', count: 5, revenue: 790 },
      { hour: 12, hourLabel: '12h', count: 8, revenue: 1280 },
      { hour: 15, hourLabel: '15h', count: 7, revenue: 1100 },
      { hour: 19, hourLabel: '19h', count: 6, revenue: 950 },
      { hour: 21, hourLabel: '21h', count: 3, revenue: 480 },
    ],
    orders: [
      {
        id: '#16358100',
        status: 'Finalizou',
        customerName: 'Guilherme Franco',
        customerEmail: 'guilherme.franco@gmail.com',
        utmParams: 'google / cpc',
        ticketDescription: '2x Ingressos Pista',
        value: 160.00,
        dateTime: '23/08 15:30',
        hour: 15,
        journey: [
          { time: '15:25', event: 'Buscou no Google "4 amigos curitiba ingressos"' },
          { time: '15:26', event: 'Clicou no anúncio de busca' },
          { time: '15:28', event: 'Adicionou 2 ingressos' },
          { time: '15:30', event: 'Compra confirmada • R$ 160,00' }
        ]
      }
    ]
  },
  {
    id: 'utm-3',
    code: 'whatsapp-urgencia',
    name: 'WhatsApp — Disparo Último Lote',
    shortUrl: 'disk.ing/4amigos-whatsapp',
    fullUrl: 'https://diskingressos.com.br/evento/1760?utm_source=whatsapp&utm_medium=mensagem&utm_campaign=ultimo_lote_urgencia&utm_content=cta_vip',
    source: 'whatsapp',
    medium: 'mensagem',
    campaign: 'ultimo_lote_urgencia',
    content: 'cta_vip',
    term: '',
    description: 'Disparo direto via WhatsApp para base de clientes cadastrados',
    status: 'ativo',
    createdAt: '20/04/2026',
    metrics: {
      visitors: 480,
      addedToCart: 91,
      checkoutStarted: 42,
      abandoned: 3,
      purchased: 24,
      revenue: 3560.00,
      averageTicket: 148.33,
      conversionRate: 5.00,
      rates: {
        visitorToCart: 19.0,
        cartToCheckout: 46.1,
        checkoutToPurchase: 57.1,
      }
    },
    timelineData: [
      { time: '20/08', revenue: 1480, conversions: 10, actions: 38, avgTicket: 148.0 },
      { time: '21/08', revenue: 1180, conversions: 8, actions: 30, avgTicket: 147.5 },
      { time: '22/08', revenue: 900, conversions: 6, actions: 23, avgTicket: 150.0 },
    ],
    hourlyDistribution: [
      { hour: 10, hourLabel: '10h', count: 6, revenue: 890 },
      { hour: 14, hourLabel: '14h', count: 8, revenue: 1190 },
      { hour: 18, hourLabel: '18h', count: 7, revenue: 1040 },
      { hour: 20, hourLabel: '20h', count: 3, revenue: 440 },
    ],
    orders: [
      {
        id: '#16358999',
        status: 'Finalizou',
        customerName: 'Beatriz Rezende',
        customerEmail: 'bia.rezende@gmail.com',
        utmParams: 'whatsapp / mensagem',
        ticketDescription: '2x Ingressos VIP',
        value: 220.00,
        dateTime: '22/08 18:40',
        hour: 18,
        journey: [
          { time: '18:35', event: 'Recebeu mensagem no WhatsApp' },
          { time: '18:36', event: 'Clicou no link curto' },
          { time: '18:40', event: 'Compra confirmada • R$ 220,00' }
        ]
      }
    ]
  },
  {
    id: 'utm-4',
    code: 'tiktok-viral',
    name: 'TikTok Ads — Vídeo Lineup',
    shortUrl: 'disk.ing/4amigos-tiktok',
    fullUrl: 'https://diskingressos.com.br/evento/1760?utm_source=tiktok&utm_medium=feed_video&utm_campaign=trends_curitiba&utm_content=video_lineup',
    source: 'tiktok',
    medium: 'feed_video',
    campaign: 'trends_curitiba',
    content: 'video_lineup',
    term: '',
    description: 'Campanha de vídeo patrocinado nos feeds do TikTok',
    status: 'ativo',
    createdAt: '18/04/2026',
    metrics: {
      visitors: 2150,
      addedToCart: 210,
      checkoutStarted: 82,
      abandoned: 15,
      purchased: 38,
      revenue: 5320.00,
      averageTicket: 140.00,
      conversionRate: 1.77,
      rates: {
        visitorToCart: 9.8,
        cartToCheckout: 39.0,
        checkoutToPurchase: 46.3,
      }
    },
    timelineData: [
      { time: '19/08', revenue: 980, conversions: 7, actions: 40, avgTicket: 140.0 },
      { time: '20/08', revenue: 1400, conversions: 10, actions: 55, avgTicket: 140.0 },
      { time: '21/08', revenue: 1540, conversions: 11, actions: 60, avgTicket: 140.0 },
      { time: '22/08', revenue: 1400, conversions: 10, actions: 55, avgTicket: 140.0 },
    ],
    hourlyDistribution: [
      { hour: 12, hourLabel: '12h', count: 6, revenue: 840 },
      { hour: 16, hourLabel: '16h', count: 8, revenue: 1120 },
      { hour: 20, hourLabel: '20h', count: 14, revenue: 1960 },
      { hour: 22, hourLabel: '22h', count: 10, revenue: 1400 },
    ],
    orders: [
      {
        id: '#16359210',
        status: 'Finalizou',
        customerName: 'Larissa Manoela Reis',
        customerEmail: 'larissa.reis@gmail.com',
        customerPhone: '(41) 99112-3344',
        utmParams: 'tiktok / feed_video',
        ticketDescription: '2x Ingressos Pista Promo',
        value: 140.00,
        dateTime: '22/08 20:15',
        hour: 20,
        journey: [
          { time: '20:10', event: 'Visualizou vídeo no TikTok' },
          { time: '20:11', event: 'Clicou no link da bio' },
          { time: '20:13', event: 'Adicionou 2 ingressos' },
          { time: '20:15', event: 'Compra confirmada • R$ 140,00' }
        ]
      }
    ]
  },
  {
    id: 'utm-5',
    code: 'influencer-curitiba',
    name: 'Influencer — Curitiba Cult VIP',
    shortUrl: 'disk.ing/cult-vip',
    fullUrl: 'https://diskingressos.com.br/evento/1760?utm_source=curitibacult&utm_medium=influencer&utm_campaign=parceria_vip&utm_content=stories_arrasta',
    source: 'curitibacult',
    medium: 'influencer',
    campaign: 'parceria_vip',
    content: 'stories_arrasta',
    term: 'cupom_cult',
    description: 'Ação de divulgação nos stories do portal Curitiba Cult com cupom VIP',
    status: 'ativo',
    createdAt: '22/04/2026',
    metrics: {
      visitors: 1420,
      addedToCart: 280,
      checkoutStarted: 110,
      abandoned: 12,
      purchased: 64,
      revenue: 9240.00,
      averageTicket: 144.37,
      conversionRate: 4.51,
      rates: {
        visitorToCart: 19.7,
        cartToCheckout: 39.3,
        checkoutToPurchase: 58.2,
      }
    },
    timelineData: [
      { time: '19/08', revenue: 1600, conversions: 11, actions: 52, avgTicket: 145.4 },
      { time: '20/08', revenue: 2320, conversions: 16, actions: 76, avgTicket: 145.0 },
      { time: '21/08', revenue: 2900, conversions: 20, actions: 94, avgTicket: 145.0 },
      { time: '22/08', revenue: 2420, conversions: 17, actions: 82, avgTicket: 142.3 },
    ],
    hourlyDistribution: [
      { hour: 11, hourLabel: '11h', count: 8, revenue: 1160 },
      { hour: 14, hourLabel: '14h', count: 12, revenue: 1740 },
      { hour: 18, hourLabel: '18h', count: 24, revenue: 3480 },
      { hour: 21, hourLabel: '21h', count: 20, revenue: 2860 },
    ],
    orders: [
      {
        id: '#16359440',
        status: 'Finalizou',
        customerName: 'Fernanda Meirelles',
        customerEmail: 'fernanda.meirelles@uol.com.br',
        customerPhone: '(41) 98822-4455',
        utmParams: 'curitibacult / influencer',
        ticketDescription: '2x Ingressos Área VIP Cupom Cult',
        value: 200.00,
        dateTime: '22/08 18:32',
        hour: 18,
        journey: [
          { time: '18:25', event: 'Arrastou link no Story Curitiba Cult' },
          { time: '18:27', event: 'Aplicou cupom CULT10' },
          { time: '18:30', event: 'Checkout iniciado com sucesso' },
          { time: '18:32', event: 'Pago via PIX • R$ 200,00' }
        ]
      }
    ]
  },
  {
    id: 'utm-6',
    code: 'email-base-ativa',
    name: 'E-mail — Newsletter Base Ativa',
    shortUrl: 'disk.ing/news-vip',
    fullUrl: 'https://diskingressos.com.br/evento/1760?utm_source=email&utm_medium=newsletter&utm_campaign=base_ativa_shows&utm_content=banner_principal',
    source: 'email',
    medium: 'newsletter',
    campaign: 'base_ativa_shows',
    content: 'banner_principal',
    term: '',
    description: 'Disparo de newsletter semanal para clientes compradores de shows',
    status: 'ativo',
    createdAt: '24/04/2026',
    metrics: {
      visitors: 890,
      addedToCart: 175,
      checkoutStarted: 78,
      abandoned: 6,
      purchased: 48,
      revenue: 7360.00,
      averageTicket: 153.33,
      conversionRate: 5.39,
      rates: {
        visitorToCart: 19.6,
        cartToCheckout: 44.5,
        checkoutToPurchase: 61.5,
      }
    },
    timelineData: [
      { time: '20/08', revenue: 2150, conversions: 14, actions: 60, avgTicket: 153.5 },
      { time: '21/08', revenue: 3060, conversions: 20, actions: 88, avgTicket: 153.0 },
      { time: '22/08', revenue: 2150, conversions: 14, actions: 60, avgTicket: 153.5 },
    ],
    hourlyDistribution: [
      { hour: 9, hourLabel: '09h', count: 10, revenue: 1530 },
      { hour: 12, hourLabel: '12h', count: 16, revenue: 2450 },
      { hour: 15, hourLabel: '15h', count: 14, revenue: 2150 },
      { hour: 20, hourLabel: '20h', count: 8, revenue: 1230 },
    ],
    orders: [
      {
        id: '#16359550',
        status: 'Finalizou',
        customerName: 'Marcos Vinicius Duarte',
        customerEmail: 'marcos.duarte@terra.com.br',
        customerPhone: '(41) 97711-2233',
        utmParams: 'email / newsletter',
        ticketDescription: '2x Ingressos Pista Premium',
        value: 180.00,
        dateTime: '21/08 12:45',
        hour: 12,
        journey: [
          { time: '12:38', event: 'Abriu e-mail marketing "Não perca o 4 Amigos"' },
          { time: '12:40', event: 'Clicou no botão Garantir Ingresso' },
          { time: '12:42', event: 'Adicionou ao carrinho' },
          { time: '12:45', event: 'Compra confirmada Cartão Crédito • R$ 180,00' }
        ]
      }
    ]
  },
  {
    id: 'utm-7',
    code: 'facebook-remarketing',
    name: 'Facebook Ads — Remarketing Checkout',
    shortUrl: 'disk.ing/fb-remarketing',
    fullUrl: 'https://diskingressos.com.br/evento/1760?utm_source=facebook&utm_medium=remarketing&utm_campaign=abandono_carrinho&utm_content=anuncio_carrossel',
    source: 'facebook',
    medium: 'remarketing',
    campaign: 'abandono_carrinho',
    content: 'anuncio_carrossel',
    term: '',
    description: 'Campanha de remarketing de 3 dias para visitantes que iniciaram checkout',
    status: 'ativo',
    createdAt: '25/04/2026',
    metrics: {
      visitors: 630,
      addedToCart: 145,
      checkoutStarted: 88,
      abandoned: 9,
      purchased: 52,
      revenue: 8120.00,
      averageTicket: 156.15,
      conversionRate: 8.25,
      rates: {
        visitorToCart: 23.0,
        cartToCheckout: 60.7,
        checkoutToPurchase: 59.1,
      }
    },
    timelineData: [
      { time: '20/08', revenue: 2480, conversions: 16, actions: 68, avgTicket: 155.0 },
      { time: '21/08', revenue: 3120, conversions: 20, actions: 85, avgTicket: 156.0 },
      { time: '22/08', revenue: 2520, conversions: 16, actions: 70, avgTicket: 157.5 },
    ],
    hourlyDistribution: [
      { hour: 13, hourLabel: '13h', count: 12, revenue: 1870 },
      { hour: 17, hourLabel: '17h', count: 15, revenue: 2340 },
      { hour: 20, hourLabel: '20h', count: 18, revenue: 2810 },
      { hour: 22, hourLabel: '22h', count: 7, revenue: 1100 },
    ],
    orders: [
      {
        id: '#16359660',
        status: 'Finalizou',
        customerName: 'Renata Albuquerque',
        customerEmail: 'renata.albuquerque@gmail.com',
        customerPhone: '(41) 98123-4567',
        utmParams: 'facebook / remarketing',
        ticketDescription: '2x Ingressos Pista',
        value: 160.00,
        dateTime: '21/08 20:18',
        hour: 20,
        recovered: true,
        recoveryChannel: 'automacao',
        journey: [
          { time: '19/08 16:30', event: 'Abandonou carrinho inicial' },
          { time: '21/08 19:55', event: 'Visualizou carrossel de remarketing no Facebook' },
          { time: '21/08 20:00', event: 'Retornou ao checkout com carrinho preservado' },
          { time: '21/08 20:18', event: 'Venda recuperada • R$ 160,00' }
        ]
      }
    ]
  },
  {
    id: 'utm-8',
    code: 'afiliados-promoters',
    name: 'Afiliados — Promoters Oficiais',
    shortUrl: 'disk.ing/promoter-vip',
    fullUrl: 'https://diskingressos.com.br/evento/1760?utm_source=afiliados&utm_medium=promoter&utm_campaign=divulgacao_equipe&utm_content=link_exclusivo',
    source: 'afiliados',
    medium: 'promoter',
    campaign: 'divulgacao_equipe',
    content: 'link_exclusivo',
    term: 'promoter_01',
    description: 'Links comissionados distribuídos pela equipe de promoters oficiais',
    status: 'ativo',
    createdAt: '26/04/2026',
    metrics: {
      visitors: 1180,
      addedToCart: 195,
      checkoutStarted: 90,
      abandoned: 10,
      purchased: 58,
      revenue: 8700.00,
      averageTicket: 150.00,
      conversionRate: 4.92,
      rates: {
        visitorToCart: 16.5,
        cartToCheckout: 46.1,
        checkoutToPurchase: 64.4,
      }
    },
    timelineData: [
      { time: '19/08', revenue: 1800, conversions: 12, actions: 55, avgTicket: 150.0 },
      { time: '20/08', revenue: 2400, conversions: 16, actions: 72, avgTicket: 150.0 },
      { time: '21/08', revenue: 2700, conversions: 18, actions: 82, avgTicket: 150.0 },
      { time: '22/08', revenue: 1800, conversions: 12, actions: 55, avgTicket: 150.0 },
    ],
    hourlyDistribution: [
      { hour: 14, hourLabel: '14h', count: 14, revenue: 2100 },
      { hour: 17, hourLabel: '17h', count: 16, revenue: 2400 },
      { hour: 19, hourLabel: '19h', count: 18, revenue: 2700 },
      { hour: 22, hourLabel: '22h', count: 10, revenue: 1500 },
    ],
    orders: [
      {
        id: '#16359770',
        status: 'Finalizou',
        customerName: 'Thiago Guimarães',
        customerEmail: 'thiago.guimaraes@gmail.com',
        customerPhone: '(41) 99654-3210',
        utmParams: 'afiliados / promoter',
        ticketDescription: '2x Ingressos Pista Premium Promoter',
        value: 180.00,
        dateTime: '21/08 19:40',
        hour: 19,
        journey: [
          { time: '19:30', event: 'Recebeu link do Promoter no WhatsApp' },
          { time: '19:32', event: 'Acessou link direto com comissão atribuída' },
          { time: '19:35', event: 'Checkout preenchido' },
          { time: '19:40', event: 'Pagamento PIX confirmado • R$ 180,00' }
        ]
      }
    ]
  }
];

interface EventUtmCentralPageProps {
  event?: EventItem;
  notify?: (msg: string) => void;
}

export const EventUtmCentralPage: React.FC<EventUtmCentralPageProps> = ({ event, notify }) => {
  const [utmList, setUtmList] = useState<UtmCampaignData[]>(initialUtmCampaigns);
  const [selectedUtmId, setSelectedUtmId] = useState<string>('utm-1');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [metricTab, setMetricTab] = useState<'revenue' | 'conversions' | 'actions' | 'avgTicket'>('revenue');
  const [timeGranularity, setTimeGranularity] = useState<'hora' | 'dia' | 'semana'>('dia');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedHourFilter, setSelectedHourFilter] = useState<number | null>(null);

  // Modals & Drawers State
  const [isNewUtmDrawerOpen, setIsNewUtmDrawerOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
  const [selectedJourneyOrder, setSelectedJourneyOrder] = useState<UtmOrderRecord | null>(null);
  const [recoveryOrderModal, setRecoveryOrderModal] = useState<UtmOrderRecord | null>(null);
  const [recoveryChannel, setRecoveryChannel] = useState<'whatsapp' | 'email' | 'automacao'>('whatsapp');
  const [recoveryFeedback, setRecoveryFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // New UTM Form State
  const [newSource, setNewSource] = useState('instagram');
  const [newMedium, setNewMedium] = useState('cpc');
  const [newCampaign, setNewCampaign] = useState('lancamento_4_amigos');
  const [newTerm, setNewTerm] = useState('ingressos');
  const [newContent, setNewContent] = useState('story_01');
  const [newDescription, setNewDescription] = useState('Instagram — Story lançamento');
  const [newBaseUrl, setNewBaseUrl] = useState(
    event ? `https://diskingressos.com.br/evento/${event.code}` : 'https://diskingressos.com.br/evento/1760'
  );

  // Active Selected UTM
  const selectedUtm = useMemo(() => {
    return utmList.find(u => u.id === selectedUtmId) || utmList[0];
  }, [utmList, selectedUtmId]);

  // Live preview URL for New UTM Form
  const previewFullUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (newSource) params.set('utm_source', newSource);
    if (newMedium) params.set('utm_medium', newMedium);
    if (newCampaign) params.set('utm_campaign', newCampaign);
    if (newTerm) params.set('utm_term', newTerm);
    if (newContent) params.set('utm_content', newContent);
    return `${newBaseUrl}?${params.toString()}`;
  }, [newBaseUrl, newSource, newMedium, newCampaign, newTerm, newContent]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (!selectedUtm || !selectedUtm.orders) return [];
    return selectedUtm.orders.filter(order => {
      // Status Filter
      if (orderStatusFilter !== 'all') {
        if (orderStatusFilter === 'Adicionou' && order.status !== 'Adicionou') return false;
        if (orderStatusFilter === 'Removeu' && order.status !== 'Removeu') return false;
        if (orderStatusFilter === 'Abandonou' && order.status !== 'Abandonou' && order.status !== 'Recuperado') return false;
        if (orderStatusFilter === 'Finalizou' && order.status !== 'Finalizou') return false;
      }
      // Hour Filter
      if (selectedHourFilter !== null && order.hour !== selectedHourFilter) {
        return false;
      }
      // Search query
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchId = order.id.toLowerCase().includes(q);
        const matchName = order.customerName.toLowerCase().includes(q);
        const matchEmail = order.customerEmail.toLowerCase().includes(q);
        const matchTicket = order.ticketDescription.toLowerCase().includes(q);
        return matchId || matchName || matchEmail || matchTicket;
      }
      return true;
    });
  }, [selectedUtm, orderStatusFilter, orderSearchQuery, selectedHourFilter]);

  // Counts for order tabs
  const orderCounts = useMemo(() => {
    if (!selectedUtm || !selectedUtm.orders) return { all: 0, added: 0, removed: 0, abandoned: 0, completed: 0 };
    const all = selectedUtm.orders.length;
    const added = selectedUtm.orders.filter(o => o.status === 'Adicionou').length;
    const removed = selectedUtm.orders.filter(o => o.status === 'Removeu').length;
    const abandoned = selectedUtm.orders.filter(o => o.status === 'Abandonou' || o.status === 'Recuperado').length;
    const completed = selectedUtm.orders.filter(o => o.status === 'Finalizou').length;
    return { all, added, removed, abandoned, completed };
  }, [selectedUtm]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    if (notify) notify('Link copiado com sucesso para a área de transferência!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Toggle UTM Status
  const handleToggleStatus = (id: string) => {
    setUtmList(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'ativo' ? 'pausado' : 'ativo';
        if (notify) notify(`Campanha UTM "${u.name}" agora está ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Create New UTM
  const handleCreateUtm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource || !newMedium || !newCampaign) {
      if (notify) notify('Preencha os campos obrigatórios (Origem, Meio e Campanha).');
      return;
    }

    const newId = `utm-${Date.now().toString().slice(-4)}`;
    const shortCode = `disk.ing/${newCampaign.slice(0, 10)}-${newSource}`;
    
    const newEntry: UtmCampaignData = {
      id: newId,
      code: `${newCampaign}-${newSource}`,
      name: newDescription || `${newSource.toUpperCase()} — ${newCampaign}`,
      shortUrl: shortCode,
      fullUrl: previewFullUrl,
      source: newSource,
      medium: newMedium,
      campaign: newCampaign,
      content: newContent,
      term: newTerm,
      description: newDescription,
      status: 'ativo',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      metrics: {
        visitors: 0,
        addedToCart: 0,
        checkoutStarted: 0,
        abandoned: 0,
        purchased: 0,
        revenue: 0,
        averageTicket: 0,
        conversionRate: 0,
        rates: { visitorToCart: 0, cartToCheckout: 0, checkoutToPurchase: 0 }
      },
      timelineData: [
        { time: 'Hoje', revenue: 0, conversions: 0, actions: 0, avgTicket: 0 }
      ],
      hourlyDistribution: [
        { hour: 10, hourLabel: '10h', count: 0, revenue: 0 },
        { hour: 14, hourLabel: '14h', count: 0, revenue: 0 },
        { hour: 18, hourLabel: '18h', count: 0, revenue: 0 },
        { hour: 20, hourLabel: '20h', count: 0, revenue: 0 },
      ],
      orders: []
    };

    setUtmList(prev => [newEntry, ...prev]);
    setSelectedUtmId(newId);
    setIsNewUtmDrawerOpen(false);
    if (notify) notify(`Nova URL UTM "${newEntry.name}" criada e selecionada com sucesso!`);
  };

  // Recovery Handler
  const handleTriggerRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryOrderModal || !selectedUtm) return;

    setUtmList(prev => prev.map(u => {
      if (u.id === selectedUtm.id) {
        return {
          ...u,
          orders: u.orders.map(ord => {
            if (ord.id === recoveryOrderModal.id) {
              return {
                ...ord,
                status: 'Recuperado',
                recovered: true,
                recoveryChannel,
                journey: [
                  ...ord.journey,
                  { 
                    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), 
                    event: `Disparo de recuperação via ${recoveryChannel.toUpperCase()} enviado com sucesso!`,
                    detail: 'Mensagem com link direto de finalização gerada pelo módulo de Remarketing.'
                  }
                ]
              };
            }
            return ord;
          })
        };
      }
      return u;
    }));

    setRecoveryFeedback(`Recuperação enviada com sucesso para ${recoveryOrderModal.customerName} via ${recoveryChannel.toUpperCase()}!`);
    setTimeout(() => {
      setRecoveryFeedback(null);
      setRecoveryOrderModal(null);
      if (notify) notify('Disparo de recuperação registrado na Central de Remarketing!');
    }, 1800);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!selectedUtm) {
      if (notify) notify('Selecione uma URL para exportar.');
      return;
    }
    const rows = [
      ['Pedido', 'Status', 'Cliente', 'Email', 'UTM', 'Ingressos', 'Valor (BRL)', 'Data/Hora'],
      ...selectedUtm.orders.map(o => [
        o.id,
        o.status,
        o.customerName,
        o.customerEmail,
        o.utmParams,
        o.ticketDescription,
        o.value.toFixed(2),
        o.dateTime
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `utm-relatorio-${selectedUtm.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (notify) notify('Relatório CSV da campanha exportado com sucesso!');
  };

  const formatBrl = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="w-full space-y-6 select-none font-sans pb-12">
      {/* 1. Header do Evento & Central UTM */}
      <div className="bg-[#1E293B] text-white p-5 sm:p-6 rounded-card border border-[#334155] shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                CENTRAL UTM & CONVERSÕES
              </span>
              <span className="text-xs text-slate-400 font-mono">
                EVENTO: {event ? `#${event.code} - ${event.title}` : 'ID.3217 - 4 AMIGOS 2026'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span><strong>Início das vendas:</strong> 14/04/2026 15:52</span>
              <span className="text-slate-500">•</span>
              <span><strong>Final das vendas:</strong> 23/08/2026 20:10</span>
              <span className="text-slate-500">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Vendas Ativas & Rastreamento em Tempo Real
              </span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsNewUtmDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-btn bg-[#1677FF] hover:bg-[#1366DB] text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              <span>+ Nova UTM</span>
            </button>

            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-btn bg-[#334155] hover:bg-[#475569] text-slate-200 font-bold text-xs transition cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>Comparar URLs</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-btn bg-[#334155] hover:bg-[#475569] text-slate-200 font-bold text-xs transition cursor-pointer"
              title="Exportar dados da UTM selecionada em CSV"
            >
              <Download size={14} />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Seletor de Campanha & Card da URL Selecionada */}
      <div className="bg-white rounded-card border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex-1 max-w-md">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
              Campanha / Link UTM Selecionado
            </label>
            <div className="relative">
              <select
                value={selectedUtmId}
                onChange={(e) => setSelectedUtmId(e.target.value)}
                className="w-full h-[40px] pl-3 pr-8 rounded-input border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-bold text-[#0E1726] outline-none focus:border-[#1677FF] transition cursor-pointer appearance-none"
              >
                {utmList.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.source} / {u.medium}) — {u.metrics.purchased} vendas
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Período:</span>
            <div className="inline-flex rounded-btn border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
              {(['24h', '7d', '30d', 'all'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setTimeRange(p)}
                  className={`px-2.5 py-1 rounded transition ${
                    timeRange === p ? 'bg-white text-[#1677FF] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p === '24h' ? '24 Horas' : p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : 'Todo Período'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card Detalhado da URL Ativa */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-[#F8FAFC] rounded-btn p-4 border border-[#EDF2F7]">
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${selectedUtm.status === 'ativo' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <strong className="text-[15px] font-extrabold text-[#0E1726]">
                {selectedUtm.name}
              </strong>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {selectedUtm.source}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#1677FF] bg-blue-50 px-2.5 py-1 rounded border border-blue-200 select-all truncate max-w-[320px]">
                {selectedUtm.shortUrl}
              </span>
              <span className="text-[11px] text-slate-500 truncate max-w-[200px]" title={selectedUtm.fullUrl}>
                {selectedUtm.fullUrl}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono">
                source: <strong>{selectedUtm.source}</strong>
              </span>
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono">
                medium: <strong>{selectedUtm.medium}</strong>
              </span>
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono">
                campaign: <strong>{selectedUtm.campaign}</strong>
              </span>
              {selectedUtm.content && (
                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono">
                  content: <strong>{selectedUtm.content}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-wrap items-center justify-start lg:justify-end gap-2">
            <button
              onClick={() => handleCopy(selectedUtm.shortUrl)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-btn bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar URL Curta'}</span>
            </button>

            <button
              onClick={() => handleCopy(selectedUtm.fullUrl)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-btn bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>Copiar URL Completa</span>
            </button>

            <button
              onClick={() => setIsQrCodeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-btn bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <QrCode size={14} />
              <span>QR Code</span>
            </button>

            <button
              onClick={() => handleToggleStatus(selectedUtm.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-btn font-bold text-xs border shadow-xs transition cursor-pointer ${
                selectedUtm.status === 'ativo'
                  ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {selectedUtm.status === 'ativo' ? <Pause size={14} /> : <Play size={14} />}
              <span>{selectedUtm.status === 'ativo' ? 'Pausar' : 'Ativar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. KPIs da Campanha Selecionada */}
      {selectedUtm && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="bg-white rounded-card border border-[#E2E8F0] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              VISITAS
            </span>
            <div className="text-[20px] font-black text-[#0E1726]">
              {selectedUtm.metrics.visitors.toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-blue-600 font-bold">100% tráfego</span>
          </div>

          <div className="bg-white rounded-card border border-[#E2E8F0] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              ADICIONOU
            </span>
            <div className="text-[20px] font-black text-[#0E1726]">
              {selectedUtm.metrics.addedToCart.toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">{selectedUtm.metrics.rates.visitorToCart}% das visitas</span>
          </div>

          <div className="bg-white rounded-card border border-[#E2E8F0] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              CHECKOUT
            </span>
            <div className="text-[20px] font-black text-[#0E1726]">
              {selectedUtm.metrics.checkoutStarted.toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-purple-600 font-bold">{selectedUtm.metrics.rates.cartToCheckout}% do carrinho</span>
          </div>

          <div className="bg-white rounded-card border border-[#E2E8F0] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              FINALIZOU
            </span>
            <div className="text-[20px] font-black text-[#0E1726]">
              {selectedUtm.metrics.purchased.toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-emerald-700 font-bold">{selectedUtm.metrics.rates.checkoutToPurchase}% do checkout</span>
          </div>

          <div className="bg-white rounded-card border border-[#E2E8F0] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              RECEITA
            </span>
            <div className="text-[18px] font-black text-emerald-700 truncate">
              {formatBrl(selectedUtm.metrics.revenue)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">atribuída</span>
          </div>

          <div className="bg-white rounded-card border border-[#E2E8F0] p-4 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              TICKET MÉDIO
            </span>
            <div className="text-[18px] font-black text-[#0E1726]">
              {formatBrl(selectedUtm.metrics.averageTicket)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">por compra</span>
          </div>

          <div className="bg-white rounded-card border border-[#E2E8F0] p-4 shadow-xs bg-blue-50/50 border-blue-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
              CONVERSÃO GERAL
            </span>
            <div className="text-[20px] font-black text-[#1677FF]">
              {selectedUtm.metrics.conversionRate.toFixed(2)}%
            </div>
            <span className="text-[11px] text-blue-700 font-bold">visita → venda</span>
          </div>
        </div>
      )}

      {/* 4. Funil de Conversão Visual */}
      {selectedUtm && (
        <div className="bg-white rounded-card border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-extrabold text-[#0E1726] flex items-center gap-2">
                <BarChart3 size={18} className="text-[#1677FF]" />
                Funil de Conversão da Campanha
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhamento passo a passo do fluxo de compradores atraídos por este link.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
              <span className="bg-slate-100 px-2.5 py-1 rounded">Visita → Carrinho: <strong className="text-blue-700">{selectedUtm.metrics.rates.visitorToCart}%</strong></span>
              <span className="bg-slate-100 px-2.5 py-1 rounded">Carrinho → Checkout: <strong className="text-purple-700">{selectedUtm.metrics.rates.cartToCheckout}%</strong></span>
              <span className="bg-slate-100 px-2.5 py-1 rounded">Checkout → Compra: <strong className="text-emerald-700">{selectedUtm.metrics.rates.checkoutToPurchase}%</strong></span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Etapa 1: Visitas */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  VISITAS
                </span>
                <span>{selectedUtm.metrics.visitors.toLocaleString('pt-BR')} (100%)</span>
              </div>
              <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Etapa 2: Adicionou ao Carrinho */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  ADICIONOU AO CARRINHO
                </span>
                <span>{selectedUtm.metrics.addedToCart.toLocaleString('pt-BR')} ({selectedUtm.metrics.rates.visitorToCart}%)</span>
              </div>
              <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${selectedUtm.metrics.rates.visitorToCart}%` }} />
              </div>
            </div>

            {/* Etapa 3: Iniciou Checkout */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  INICIOU CHECKOUT
                </span>
                <span>{selectedUtm.metrics.checkoutStarted.toLocaleString('pt-BR')} (7,7%)</span>
              </div>
              <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: '16%' }} />
              </div>
            </div>

            {/* Etapa 4: Abandonou */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  ABANDONOU
                </span>
                <span>{selectedUtm.metrics.abandoned.toLocaleString('pt-BR')} (1,0%)</span>
              </div>
              <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: '4%' }} />
              </div>
            </div>

            {/* Etapa 5: Comprou */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  COMPROU / FINALIZOU
                </span>
                <span>{selectedUtm.metrics.purchased.toLocaleString('pt-BR')} ({selectedUtm.metrics.conversionRate.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Desempenho no Tempo & Distribuição por Horário */}
      {selectedUtm && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gráfico 1: Desempenho no Tempo */}
          <div className="lg:col-span-8 bg-white rounded-card border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-[15px] font-extrabold text-[#0E1726]">
                    Desempenho da Campanha
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evolução cronológica de vendas e receita gerada por este link.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-btn border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
                    {(['revenue', 'conversions', 'actions', 'avgTicket'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setMetricTab(tab)}
                        className={`px-2.5 py-1 rounded transition ${
                          metricTab === tab ? 'bg-[#1677FF] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab === 'revenue' ? 'Receita' : tab === 'conversions' ? 'Conversões' : tab === 'actions' ? 'Ações' : 'Ticket Médio'}
                      </button>
                    ))}
                  </div>

                  <div className="inline-flex rounded-btn border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
                    {(['hora', 'dia', 'semana'] as const).map(g => (
                      <button
                        key={g}
                        onClick={() => setTimeGranularity(g)}
                        className={`px-2 py-1 rounded transition ${
                          timeGranularity === g ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        {g === 'hora' ? 'Hora' : g === 'dia' ? 'Dia' : 'Semana'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Linhas do Gráfico */}
              <div className="pt-6 pb-2">
                <div className="h-44 w-full flex items-end justify-between gap-2 px-2">
                  {selectedUtm.timelineData.map((item, idx) => {
                    const maxVal = metricTab === 'revenue' ? 3500 : metricTab === 'conversions' ? 25 : 120;
                    const curVal = metricTab === 'revenue' ? item.revenue : metricTab === 'conversions' ? item.conversions : item.actions;
                    const heightPercent = Math.min(100, Math.max(15, (curVal / maxVal) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition">
                          {metricTab === 'revenue' ? formatBrl(item.revenue) : `${curVal}`}
                        </span>
                        <div className="w-full bg-slate-100 rounded-t h-36 flex items-end overflow-hidden">
                          <div
                            className="w-full bg-gradient-to-t from-[#1677FF] to-[#38BDF8] rounded-t transition-all duration-300 group-hover:brightness-110"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">{item.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Período analisado: 18/08 a 23/08</span>
              <span className="font-bold text-slate-800">Total no período: {formatBrl(selectedUtm.metrics.revenue)}</span>
            </div>
          </div>

          {/* Gráfico 2: Distribuição por Horário */}
          <div className="lg:col-span-4 bg-white rounded-card border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-[15px] font-extrabold text-[#0E1726]">
                  Distribuição por Horário
                </h3>
                <p className="text-xs text-slate-500">
                  Picos de conversão de 00h às 23h. Clique na barra para filtrar.
                </p>
              </div>

              <div className="pt-5 pb-2">
                <div className="h-40 flex items-end justify-between gap-1">
                  {selectedUtm.hourlyDistribution.map((h, i) => {
                    const maxH = 16;
                    const hPercent = Math.min(100, Math.max(8, (h.count / maxH) * 100));
                    const isSelected = selectedHourFilter === h.hour;

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedHourFilter(isSelected ? null : h.hour)}
                        className={`flex-1 flex flex-col items-center gap-1 group cursor-pointer transition ${
                          isSelected ? 'scale-105' : ''
                        }`}
                        title={`${h.hourLabel}: ${h.count} conversões (${formatBrl(h.revenue)})`}
                      >
                        <span className="text-[9px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                          {h.count}
                        </span>
                        <div className="w-full bg-slate-100 rounded-t h-32 flex items-end">
                          <div
                            className={`w-full rounded-t transition-all ${
                              isSelected ? 'bg-[#7C3AED]' : 'bg-[#10B981] group-hover:bg-[#059669]'
                            }`}
                            style={{ height: `${hPercent}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-medium text-slate-500">{h.hourLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {selectedHourFilter !== null ? `Filtrando: ${selectedHourFilter}h` : 'Maior pico: 18h - 19h'}
              </span>
              {selectedHourFilter !== null && (
                <button
                  onClick={() => setSelectedHourFilter(null)}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Limpar filtro
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Pedidos & Conversões da UTM Selecionada */}
      {selectedUtm && (
        <div className="bg-white rounded-card border border-[#E2E8F0] shadow-xs overflow-hidden">
          {/* Table Header & Filters */}
          <div className="p-5 border-b border-[#EDF0F4] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-extrabold text-[#0E1726] flex items-center gap-2">
                  <ShoppingCart size={18} className="text-[#1677FF]" />
                  Pedidos & Conversões da Campanha
                </h3>
                <p className="text-xs text-slate-500">
                  Rastreamento nominal de ações, adições, desistências e compras concluídas.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setOrderStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-full transition ${
                    orderStatusFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos ({orderCounts.all})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('Adicionou')}
                  className={`px-3 py-1.5 rounded-full transition ${
                    orderStatusFilter === 'Adicionou'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Adicionou ({orderCounts.added})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('Removeu')}
                  className={`px-3 py-1.5 rounded-full transition ${
                    orderStatusFilter === 'Removeu'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Removeu ({orderCounts.removed})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('Abandonou')}
                  className={`px-3 py-1.5 rounded-full transition ${
                    orderStatusFilter === 'Abandonou'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Abandonou ({orderCounts.abandoned})
                </button>
                <button
                  onClick={() => setOrderStatusFilter('Finalizou')}
                  className={`px-3 py-1.5 rounded-full transition ${
                    orderStatusFilter === 'Finalizou'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Finalizou ({orderCounts.completed})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Pesquisar pedido, cliente ou ingresso..."
                className="w-full h-[36px] pl-9 pr-4 rounded-input border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-medium text-[#0E1726] outline-none focus:border-[#1677FF]"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4">Pedido</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">UTM</th>
                  <th className="py-3 px-4">Ingressos</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4 text-center">Jornada / Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#1677FF]">
                        {ord.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          ord.status === 'Finalizou'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Recuperado'
                            ? 'bg-teal-100 text-teal-800'
                            : ord.status === 'Abandonou'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'Adicionou'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ord.status === 'Recuperado' ? '⚡ Recuperado' : ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0E1726]">{ord.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{ord.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {ord.utmParams}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {ord.ticketDescription}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {ord.value > 0 ? formatBrl(ord.value) : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {ord.dateTime}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botão de Recuperação para Carrinhos Abandonados */}
                          {ord.status === 'Abandonou' && (
                            <button
                              onClick={() => setRecoveryOrderModal(ord)}
                              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer"
                              title="Disparar recuperação de carrinho"
                            >
                              <Zap size={12} />
                              <span>Recuperar</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedJourneyOrder(ord)}
                            className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-[#1677FF] font-bold transition cursor-pointer"
                            title="Ver jornada completa do pedido"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                      Nenhum registro encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Lista Rápida de Links da Campanha */}
      <div className="utm-cards-panel bg-white rounded-card border border-[#E2E8F0] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-extrabold text-[#0E1726] flex items-center gap-2">
            <Layers size={18} className="text-[#1677FF]" />
            Todas as URLs Rastreáveis da Campanha
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            {utmList.length} URLs cadastradas
          </span>
        </div>

        <div className="utm-cards-grid grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {utmList.map(u => {
            const isSelected = u.id === selectedUtmId;
            return (
              <div
                key={u.id}
                onClick={() => {
                  setSelectedUtmId(u.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (notify) notify(`URL "${u.name}" selecionada!`);
                }}
                className={`utm-card-box p-4 rounded-btn border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'selected border-[#1677FF] bg-blue-50/40 shadow-xs'
                    : 'border-[#E2E8F0] bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="utm-card-top flex items-center justify-between mb-1.5">
                    <span className="utm-card-badge text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {u.source.toUpperCase()}
                    </span>
                    <span className={`utm-card-status text-[10px] font-bold ${u.status === 'ativo' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      ● {u.status}
                    </span>
                  </div>

                  <strong className="utm-card-title text-xs font-extrabold text-[#0E1726] block">
                    {u.name}
                  </strong>
                  <span className="utm-card-url text-[11px] text-slate-500 font-mono block mt-0.5 truncate">
                    {u.shortUrl}
                  </span>

                  <div className="utm-card-stats mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{u.metrics.visitors} visitas</span>
                    <span className="font-bold text-emerald-700">{u.metrics.purchased} vendas ({formatBrl(u.metrics.revenue)})</span>
                  </div>
                </div>

                <div className="mt-3 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUtmId(u.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      if (notify) notify(`URL "${u.name}" selecionada!`);
                    }}
                    className={`utm-card-btn w-full py-1.5 text-center rounded font-bold text-xs transition cursor-pointer ${
                      isSelected
                        ? 'active bg-[#1677FF] text-white shadow-xs'
                        : 'default bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ Selecionado' : 'Selecionar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DRAWER LATERAL: + NOVA URL RASTREÁVEL                                     */}
      {/* ========================================================================= */}
      {isNewUtmDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-blue-50 text-[#1677FF] flex items-center justify-center font-bold">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-black text-[#0E1726]">Nova URL Rastreável (UTM)</h3>
                    <p className="text-xs text-slate-500">Crie links personalizados com atribuição exata.</p>
                  </div>
                </div>
                <button onClick={() => setIsNewUtmDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUtm} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Origem da Campanha (utm_source) *
                  </label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="ex: instagram, google, facebook, whatsapp, tiktok"
                    required
                    className="w-full h-[38px] px-3 rounded-input border border-slate-300 text-xs font-medium text-[#0E1726] outline-none focus:border-[#1677FF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Meio da Campanha (utm_medium) *
                  </label>
                  <input
                    type="text"
                    value={newMedium}
                    onChange={(e) => setNewMedium(e.target.value)}
                    placeholder="ex: cpc, story, feed, mensagem, bio, newsletter"
                    required
                    className="w-full h-[38px] px-3 rounded-input border border-slate-300 text-xs font-medium text-[#0E1726] outline-none focus:border-[#1677FF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Nome da Campanha (utm_campaign) *
                  </label>
                  <input
                    type="text"
                    value={newCampaign}
                    onChange={(e) => setNewCampaign(e.target.value)}
                    placeholder="ex: lancamento_4_amigos"
                    required
                    className="w-full h-[38px] px-3 rounded-input border border-slate-300 text-xs font-medium text-[#0E1726] outline-none focus:border-[#1677FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Termo (utm_term)
                    </label>
                    <input
                      type="text"
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      placeholder="ex: ingressos, comedia"
                      className="w-full h-[38px] px-3 rounded-input border border-slate-300 text-xs font-medium text-[#0E1726] outline-none focus:border-[#1677FF]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                      Conteúdo (utm_content)
                    </label>
                    <input
                      type="text"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="ex: story_01, banner_azul"
                      className="w-full h-[38px] px-3 rounded-input border border-slate-300 text-xs font-medium text-[#0E1726] outline-none focus:border-[#1677FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Descrição Amigável
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="ex: Instagram — Story lançamento"
                    className="w-full h-[38px] px-3 rounded-input border border-slate-300 text-xs font-medium text-[#0E1726] outline-none focus:border-[#1677FF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    URL de Destino
                  </label>
                  <input
                    type="text"
                    value={newBaseUrl}
                    onChange={(e) => setNewBaseUrl(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-input border border-slate-300 text-xs font-mono text-slate-600 outline-none focus:border-[#1677FF]"
                  />
                </div>

                {/* Prévia da URL Completa */}
                <div className="p-3 bg-slate-50 rounded-btn border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Prévia da URL Completa:
                  </span>
                  <p className="text-[11px] font-mono text-[#1677FF] break-all">
                    {previewFullUrl}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setIsNewUtmDrawerOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" icon={<Check size={14} />}>
                    Gerar e Salvar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: JORNADA DO PEDIDO                                         */}
      {/* ========================================================================= */}
      {selectedJourneyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-card p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedJourneyOrder(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="h-10 w-10 rounded-btn bg-blue-50 text-[#1677FF] flex items-center justify-center font-bold">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h3 className="text-[16px] font-black text-[#0E1726]">
                  Jornada do Pedido {selectedJourneyOrder.id}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedJourneyOrder.customerName} • {selectedJourneyOrder.ticketDescription}
                </p>
              </div>
            </div>

            <div className="space-y-4 my-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Linha do Tempo de Interações:
              </span>

              <div className="space-y-3 pl-2 border-l-2 border-blue-200">
                {selectedJourneyOrder.journey.map((step, idx) => (
                  <div key={idx} className="relative pl-4">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-[#1677FF] border-2 border-white" />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {step.time}
                      </span>
                      <strong className="text-xs text-[#0E1726]">{step.event}</strong>
                    </div>
                    {step.detail && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.detail}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-3 rounded-btn border border-slate-200 mt-4 space-y-1">
                <div className="text-xs text-slate-600">
                  <strong>UTM de Atribuição:</strong> {selectedJourneyOrder.utmParams}
                </div>
                <div className="text-xs text-slate-600">
                  <strong>Receita Atribuída:</strong> {formatBrl(selectedJourneyOrder.value)}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedJourneyOrder(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECUPERAÇÃO DE CARRINHO ABANDONADO                                */}
      {/* ========================================================================= */}
      {recoveryOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-card p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setRecoveryOrderModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="h-10 w-10 rounded-btn bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-[16px] font-black text-[#0E1726]">
                  Recuperar Carrinho Abandonado
                </h3>
                <p className="text-xs text-slate-500">
                  {recoveryOrderModal.customerName} ({formatBrl(recoveryOrderModal.value)})
                </p>
              </div>
            </div>

            {recoveryFeedback ? (
              <div className="p-4 rounded-btn bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{recoveryFeedback}</span>
              </div>
            ) : (
              <form onSubmit={handleTriggerRecovery} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Envie uma mensagem personalizada com link direto para finalização da compra:
                </p>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-btn border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="recovery_ch"
                      checked={recoveryChannel === 'whatsapp'}
                      onChange={() => setRecoveryChannel('whatsapp')}
                    />
                    <MessageSquare size={16} className="text-emerald-600" />
                    <span>Disparo Direto via WhatsApp (Alta Conversão)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-btn border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="recovery_ch"
                      checked={recoveryChannel === 'email'}
                      onChange={() => setRecoveryChannel('email')}
                    />
                    <Mail size={16} className="text-blue-600" />
                    <span>E-mail Transacional de Carrinho Abandonado</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-btn border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="recovery_ch"
                      checked={recoveryChannel === 'automacao'}
                      onChange={() => setRecoveryChannel('automacao')}
                    />
                    <Sparkles size={16} className="text-purple-600" />
                    <span>Fluxo Automático Multicanal com Cupom 5%</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setRecoveryOrderModal(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" icon={<Zap size={14} />}>
                    Iniciar Recuperação
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPARAR URLs DA CAMPANHA                                          */}
      {/* ========================================================================= */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-card p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="h-10 w-10 rounded-btn bg-purple-50 text-[#7C3AED] flex items-center justify-center font-bold">
                <SlidersHorizontal size={20} />
              </div>
              <div>
                <h3 className="text-[16px] font-black text-[#0E1726]">
                  Comparativo de Performance por Canal UTM
                </h3>
                <p className="text-xs text-slate-500">
                  Compare conversão, volume de vendas e receita gerada por canal.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto my-3">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Campanha / Canal</th>
                    <th className="py-2.5 px-3 text-right">Visitas</th>
                    <th className="py-2.5 px-3 text-right">Carrinho</th>
                    <th className="py-2.5 px-3 text-right">Vendas</th>
                    <th className="py-2.5 px-3 text-center">Taxa Conv.</th>
                    <th className="py-2.5 px-3 text-right">Receita Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {utmList.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <strong className="text-slate-900">{u.name}</strong>
                        <div className="text-[11px] text-slate-400 font-mono">{u.source} / {u.medium}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">{u.metrics.visitors.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-3 text-right font-mono">{u.metrics.addedToCart.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#1677FF]">{u.metrics.purchased}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[11px]">
                          {u.metrics.conversionRate.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        {formatBrl(u.metrics.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsCompareModalOpen(false)}>
                Fechar Comparativo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QR CODE AMPLIADO                                                   */}
      {/* ========================================================================= */}
      {isQrCodeModalOpen && selectedUtm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-card p-6 shadow-2xl border border-slate-200 text-center relative">
            <button
              onClick={() => setIsQrCodeModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <h3 className="text-[16px] font-black text-[#0E1726] mb-1">
              QR Code Rastreável
            </h3>
            <p className="text-xs text-slate-500 mb-4">{selectedUtm.name}</p>

            <div className="p-4 bg-slate-50 rounded-card border border-slate-200 inline-block mb-4">
              <div className="h-44 w-44 bg-white p-2 border border-slate-300 rounded flex items-center justify-center mx-auto">
                <QrCode size={160} className="text-slate-900" />
              </div>
            </div>

            <p className="text-xs font-mono text-slate-600 bg-slate-100 p-2 rounded truncate mb-4 select-all">
              {selectedUtm.shortUrl}
            </p>

            <div className="flex items-center justify-center gap-2">
              <Button variant="secondary" onClick={() => handleCopy(selectedUtm.shortUrl)}>
                Copiar Link
              </Button>
              <Button variant="primary" onClick={() => {
                if (notify) notify('QR Code pronto para impressão em alta resolução!');
                setIsQrCodeModalOpen(false);
              }}>
                Baixar Imagem
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
