import type { EventItem } from '../types/event';

export const mockEvents: EventItem[] = [
  {
    id: 1,
    code: '1760',
    title: 'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA',
    subtitle: 'Música e natureza fazendo arte.',
    category: 'Festival',
    venue: 'Parque Jaime Lerner',
    city: 'Curitiba',
    state: 'PR',
    address: 'Av. Jaime Lerner, s/n - Alphaville Graciosa',
    date: '30/06/2027 10:00',
    endDate: '30/06/2027 22:00',
    status: 'ativo',
    producerId: 'prod-live',
    producerName: 'Live Entretenimento',
    totalRevenue: 0.00,
    salesCount: 0,
    availableCount: 832,
    courtesyCount: 584,
    totalCapacity: 1416,
    occupancyRate: 70.2,
    averageTicketPrice: 0.00,
    coverType: 'nature',
    badge: 'EXPERIÊNCIA AO AR LIVRE',
    featured: true,
    batches: [
      {
        id: 'b-101',
        name: 'Passaporte Geral - Lote Promocional',
        category: 'Pista',
        price: 0.00,
        fee: 0.00,
        totalQuantity: 600,
        soldQuantity: 0,
        courtesyQuantity: 584,
        availableQuantity: 16,
        status: 'ativo'
      },
      {
        id: 'b-102',
        name: 'Passaporte Geral - 1º Lote',
        category: 'Pista',
        price: 80.00,
        fee: 8.00,
        totalQuantity: 816,
        soldQuantity: 0,
        courtesyQuantity: 0,
        availableQuantity: 816,
        status: 'agendado'
      }
    ],
    metaPixel: {
      pixelId: '891044728912903',
      conversionApiToken: 'EAAX7c9...TOKEN_META_LIVE',
      googleAnalyticsId: 'G-7X9810LL3',
      activeUtms: [
        { source: 'instagram', medium: 'stories_ads', campaign: 'musica_natureza_lancamento', clicks: 1420, conversions: 584 },
        { source: 'google', medium: 'cpc', campaign: 'parque_jaime_lerner_curitiba', clicks: 430, conversions: 120 }
      ]
    },
    facialRecognition: {
      enabled: true,
      registeredCount: 412,
      pendingCount: 172,
      validationRate: 99.2
    },
    createdAt: '2026-02-15T14:30:00Z'
  },
  {
    id: 2,
    code: '3571',
    title: 'IRON MAIDEN SYMPHONIC',
    subtitle: 'THE BEAST EXPERIENCE - ORQUESTRA & BANDA',
    category: 'Show & Música',
    venue: 'Ópera de Arame',
    city: 'Curitiba',
    state: 'PR',
    address: 'Rua João Gava, 920 - Abranches',
    date: '14/03/2027 19:00',
    endDate: '14/03/2027 23:00',
    status: 'ativo',
    producerId: 'prod-opus',
    producerName: 'Opus Entretenimento',
    totalRevenue: 2180.00,
    salesCount: 10,
    availableCount: 1596,
    courtesyCount: 0,
    totalCapacity: 1606,
    occupancyRate: 0.6,
    averageTicketPrice: 218.00,
    coverType: 'maiden',
    badge: 'ESPETÁCULO SINFÔNICO',
    featured: true,
    batches: [
      {
        id: 'b-201',
        name: 'Plateia Premium - 1º Lote',
        category: 'Área Premium',
        price: 280.00,
        fee: 28.00,
        totalQuantity: 200,
        soldQuantity: 4,
        courtesyQuantity: 0,
        availableQuantity: 196,
        status: 'ativo'
      },
      {
        id: 'b-202',
        name: 'Plateia Baixa - 1º Lote',
        category: 'Plateia',
        price: 190.00,
        fee: 19.00,
        totalQuantity: 600,
        soldQuantity: 6,
        courtesyQuantity: 0,
        availableQuantity: 594,
        status: 'ativo'
      },
      {
        id: 'b-203',
        name: 'Plateia Alta - 1º Lote',
        category: 'Plateia',
        price: 140.00,
        fee: 14.00,
        totalQuantity: 806,
        soldQuantity: 0,
        courtesyQuantity: 0,
        availableQuantity: 806,
        status: 'ativo'
      }
    ],
    metaPixel: {
      pixelId: '472910842019482',
      conversionApiToken: 'EAAX7c9...TOKEN_MAIDEN_OPUS',
      googleAnalyticsId: 'G-98402ZZP',
      activeUtms: [
        { source: 'facebook', medium: 'feed_post', campaign: 'iron_maiden_opera', clicks: 890, conversions: 7 },
        { source: 'site_diskingressos', medium: 'banner_home', campaign: 'destaques_marco', clicks: 310, conversions: 3 }
      ]
    },
    facialRecognition: {
      enabled: true,
      registeredCount: 8,
      pendingCount: 2,
      validationRate: 100.0
    },
    createdAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 3,
    code: '3714',
    title: '29ª Conferência Estadual Espírita',
    subtitle: 'Luz em nossas vidas - Sessão Domingo',
    category: 'Conferência & Palestra',
    venue: 'Teatro Positivo',
    city: 'Curitiba',
    state: 'PR',
    address: 'Rua Prof. Pedro Viriato Parigot de Souza, 5300 - Campo Comprido',
    date: '14/03/2027 08:00',
    endDate: '14/03/2027 18:00',
    status: 'ativo',
    producerId: 'prod-seven',
    producerName: 'Seven Entretenimento',
    totalRevenue: 540.00,
    salesCount: 12,
    availableCount: 2188,
    courtesyCount: 0,
    totalCapacity: 2200,
    occupancyRate: 0.5,
    averageTicketPrice: 45.00,
    coverType: 'conference',
    badge: '29ª Conferência Estadual Espírita',
    featured: false,
    batches: [
      {
        id: 'b-301',
        name: 'Inscrição Geral Domingo - 1º Lote',
        category: 'Plateia',
        price: 45.00,
        fee: 4.50,
        totalQuantity: 2200,
        soldQuantity: 12,
        courtesyQuantity: 0,
        availableQuantity: 2188,
        status: 'ativo'
      }
    ],
    metaPixel: {
      pixelId: '681920384910283',
      googleAnalyticsId: 'G-CONFERENCIA29',
      activeUtms: [
        { source: 'whatsapp_grupos', medium: 'direct', campaign: 'divulgacao_centros', clicks: 650, conversions: 12 }
      ]
    },
    facialRecognition: {
      enabled: false,
      registeredCount: 0,
      pendingCount: 0,
      validationRate: 0
    },
    createdAt: '2026-03-02T11:20:00Z'
  },
  {
    id: 4,
    code: '3713',
    title: '29ª Conferência Estadual Espírita',
    subtitle: 'Luz em nossas vidas - Sessão Sábado',
    category: 'Conferência & Palestra',
    venue: 'Teatro Positivo',
    city: 'Curitiba',
    state: 'PR',
    address: 'Rua Prof. Pedro Viriato Parigot de Souza, 5300 - Campo Comprido',
    date: '13/03/2027 08:00',
    endDate: '13/03/2027 18:00',
    status: 'ativo',
    producerId: 'prod-seven',
    producerName: 'Seven Entretenimento',
    totalRevenue: 605.00,
    salesCount: 13,
    availableCount: 2587,
    courtesyCount: 0,
    totalCapacity: 2600,
    occupancyRate: 0.5,
    averageTicketPrice: 46.54,
    coverType: 'conference2',
    badge: '29ª Conferência Estadual Espírita',
    featured: false,
    batches: [
      {
        id: 'b-401',
        name: 'Inscrição Geral Sábado - 1º Lote',
        category: 'Plateia',
        price: 45.00,
        fee: 4.50,
        totalQuantity: 2600,
        soldQuantity: 13,
        courtesyQuantity: 0,
        availableQuantity: 2587,
        status: 'ativo'
      }
    ],
    metaPixel: {
      pixelId: '681920384910283',
      googleAnalyticsId: 'G-CONFERENCIA29',
      activeUtms: [
        { source: 'whatsapp_grupos', medium: 'direct', campaign: 'divulgacao_centros_sabado', clicks: 710, conversions: 13 }
      ]
    },
    facialRecognition: {
      enabled: false,
      registeredCount: 0,
      pendingCount: 0,
      validationRate: 0
    },
    createdAt: '2026-03-02T11:20:00Z'
  },
  {
    id: 5,
    code: '4190',
    title: 'CURITIBA JAZZ & BLUES FESTIVAL 2027',
    subtitle: '3 Dias de Música, Gastronomia e Arte no Bosque',
    category: 'Festival',
    venue: 'Pedreira Paulo Leminski',
    city: 'Curitiba',
    state: 'PR',
    address: 'Rua João Gava, 970 - Abranches',
    date: '22/05/2027 14:00',
    endDate: '24/05/2027 23:30',
    status: 'ativo',
    producerId: 'prod-live',
    producerName: 'Live Entretenimento',
    totalRevenue: 348900.00,
    salesCount: 2310,
    availableCount: 1690,
    courtesyCount: 150,
    totalCapacity: 4150,
    occupancyRate: 59.3,
    averageTicketPrice: 151.04,
    coverType: 'festival',
    badge: 'FESTIVAL INTERNACIONAL',
    featured: true,
    batches: [
      {
        id: 'b-501',
        name: 'Passaporte 3 Dias - Early Bird',
        category: 'Pista',
        price: 180.00,
        fee: 18.00,
        totalQuantity: 1000,
        soldQuantity: 1000,
        courtesyQuantity: 50,
        availableQuantity: 0,
        status: 'esgotado'
      },
      {
        id: 'b-502',
        name: 'Passaporte 3 Dias - 2º Lote',
        category: 'Pista',
        price: 240.00,
        fee: 24.00,
        totalQuantity: 1500,
        soldQuantity: 910,
        courtesyQuantity: 0,
        availableQuantity: 590,
        status: 'ativo'
      },
      {
        id: 'b-503',
        name: 'Camarote Open Bar & Food - Lote Único',
        category: 'Camarote',
        price: 450.00,
        fee: 45.00,
        totalQuantity: 500,
        soldQuantity: 400,
        courtesyQuantity: 100,
        availableQuantity: 100,
        status: 'ativo'
      }
    ],
    metaPixel: {
      pixelId: '901248901239012',
      conversionApiToken: 'EAAX7c9...TOKEN_CJF2027',
      googleAnalyticsId: 'G-CJF2027XX',
      tiktokPixelId: 'TT-CJF-992',
      activeUtms: [
        { source: 'instagram', medium: 'reels_ads', campaign: 'cjf_lineup_revelado', clicks: 8430, conversions: 1120 },
        { source: 'google_search', medium: 'cpc', campaign: 'jazz_festival_curitiba', clicks: 3200, conversions: 790 },
        { source: 'influenciadores', medium: 'stories', campaign: 'parceria_gastronomia_cwb', clicks: 1890, conversions: 400 }
      ]
    },
    facialRecognition: {
      enabled: true,
      registeredCount: 1890,
      pendingCount: 420,
      validationRate: 98.7
    },
    createdAt: '2026-01-10T09:00:00Z'
  },
  {
    id: 6,
    code: '4238',
    title: 'THIAGO VENTURA - MODO EFETIVO',
    subtitle: 'Novo solo de stand-up comedy em sessão dupla',
    category: 'Stand-up & Comédia',
    venue: 'Teatro Guaíra',
    city: 'Curitiba',
    state: 'PR',
    address: 'Rua XV de Novembro, 971 - Centro',
    date: '18/04/2027 21:00',
    endDate: '18/04/2027 22:45',
    status: 'ativo',
    producerId: 'prod-showmaster',
    producerName: 'ShowMaster Curitiba',
    totalRevenue: 134200.00,
    salesCount: 1840,
    availableCount: 305,
    courtesyCount: 40,
    totalCapacity: 2185,
    occupancyRate: 86.0,
    averageTicketPrice: 72.93,
    coverType: 'standup',
    badge: 'ÚLTIMOS INGRESSOS',
    featured: true,
    batches: [
      {
        id: 'b-601',
        name: 'Plateia A - 1º Lote',
        category: 'Plateia',
        price: 90.00,
        fee: 9.00,
        totalQuantity: 600,
        soldQuantity: 580,
        courtesyQuantity: 20,
        availableQuantity: 0,
        status: 'esgotado'
      },
      {
        id: 'b-602',
        name: 'Plateia B - 1º Lote',
        category: 'Plateia',
        price: 70.00,
        fee: 7.00,
        totalQuantity: 800,
        soldQuantity: 760,
        courtesyQuantity: 20,
        availableQuantity: 20,
        status: 'ativo'
      },
      {
        id: 'b-603',
        name: 'Balcão 1 e 2 - 1º Lote',
        category: 'Plateia',
        price: 50.00,
        fee: 5.00,
        totalQuantity: 785,
        soldQuantity: 500,
        courtesyQuantity: 0,
        availableQuantity: 285,
        status: 'ativo'
      }
    ],
    metaPixel: {
      pixelId: '381920391029381',
      activeUtms: [
        { source: 'instagram', medium: 'feed', campaign: 'ventura_cwb', clicks: 4200, conversions: 1200 }
      ]
    },
    facialRecognition: {
      enabled: false,
      registeredCount: 0,
      pendingCount: 0,
      validationRate: 0
    },
    createdAt: '2026-02-01T15:00:00Z'
  },
  {
    id: 7,
    code: '4502',
    title: 'VINTAGE CULTURE - SPECIAL SUNSET SET',
    subtitle: 'Apresentação exclusiva em formato long set 6 horas',
    category: 'Show & Música',
    venue: 'Live Curitiba',
    city: 'Curitiba',
    state: 'PR',
    address: 'Rua Itajubá, 143 - Novo Mundo',
    date: '10/07/2027 16:00',
    endDate: '11/07/2027 02:00',
    status: 'rascunho',
    producerId: 'prod-live',
    producerName: 'Live Entretenimento',
    totalRevenue: 0.00,
    salesCount: 0,
    availableCount: 4500,
    courtesyCount: 0,
    totalCapacity: 4500,
    occupancyRate: 0.0,
    averageTicketPrice: 160.00,
    coverType: 'electronic',
    badge: 'EM RASCUNHO',
    featured: false,
    batches: [
      {
        id: 'b-701',
        name: 'Pista Premium - Lote Promocional',
        category: 'Pista',
        price: 120.00,
        fee: 12.00,
        totalQuantity: 1500,
        soldQuantity: 0,
        courtesyQuantity: 0,
        availableQuantity: 1500,
        status: 'pausado'
      }
    ],
    metaPixel: {
      pixelId: '',
      activeUtms: []
    },
    facialRecognition: {
      enabled: true,
      registeredCount: 0,
      pendingCount: 0,
      validationRate: 0
    },
    createdAt: '2026-03-03T18:00:00Z'
  }
];
