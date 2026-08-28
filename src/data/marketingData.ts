import type { 
  MarketingCampaign, 
  CampaignTemplate,
  CampaignChannelDetail,
  ConversionFunnelData, 
  ChannelPerformance, 
  AbandonedCart, 
  UtmLink, 
  CouponPromo,
  TrackingTagConfig 
} from '../types/marketing';

export const mockMarketingFunnel: ConversionFunnelData = {
  visitors: 120450,
  views: 48320,
  checkout: 8540,
  payments: 4125,
  sales: 2847,
};

export const mockChannelsPerformance: ChannelPerformance[] = [
  { channel: 'instagram', channelLabel: 'Instagram Ads & Stories', percentage: 42, revenue: 52680, sales: 1195, color: '#E1306C' },
  { channel: 'google', channelLabel: 'Google Ads & Search', percentage: 25, revenue: 31350, sales: 712, color: '#4285F4' },
  { channel: 'whatsapp', channelLabel: 'WhatsApp Direct & Disparos', percentage: 18, revenue: 22570, sales: 512, color: '#25D366' },
  { channel: 'email', channelLabel: 'E-mail Marketing & Newsletters', percentage: 8, revenue: 10030, sales: 228, color: '#EA580C' },
  { channel: 'direct', channelLabel: 'Tráfego Orgânico & Direto', percentage: 7, revenue: 8800, sales: 200, color: '#64748B' },
];

export const mockDailyRevenue = [
  { day: 'Seg', date: '21/08', revenue: 14200, sales: 320 },
  { day: 'Ter', date: '22/08', revenue: 18500, sales: 410 },
  { day: 'Qua', date: '23/08', revenue: 22100, sales: 505 },
  { day: 'Qui', date: '24/08', revenue: 26800, sales: 612 },
  { day: 'Sex', date: '25/08', revenue: 43830, sales: 1000 },
];

// 8 Modelos Prontos de Campanhas Multicanais (Fase 16.10.2)
export const mockCampaignTemplates: CampaignTemplate[] = [
  {
    id: 'TMPL-001',
    name: 'Acelerar Vendas',
    tagline: 'Pico promocional de 48 horas com oferta relâmpago e múltiplos canais.',
    description: 'Campanha de alta tração para acelerar vendas em períodos mornos. Mobiliza WhatsApp VIP, anúncios no Instagram Stories com cupom relâmpago e e-mail marketing direto.',
    category: 'urgencia',
    recommendedBudget: 6000,
    channelsCount: 4,
    targetAudience: 'Base de leads mornos, seguidores engajados e visitantes dos últimos 30 dias.',
    expectedRoi: '450% a 700%',
    badge: '⚡ Aceleração Rápida',
    channels: [
      { id: 'ch-101', channel: 'whatsapp', channelName: 'WhatsApp Disparo VIP', subchannel: 'Oferta Relâmpago', utmSource: 'whatsapp', utmMedium: 'acelerar_vendas', utmCampaign: 'acelerar_vendas', budget: 1500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 12.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=acelerar_vendas&utm_campaign=acelerar_vendas' },
      { id: 'ch-102', channel: 'instagram', channelName: 'Instagram Stories Promoted', subchannel: 'Stories Cupom', utmSource: 'instagram', utmMedium: 'stories_cupom', utmCampaign: 'acelerar_vendas', budget: 2200, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 5.4, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=instagram&utm_medium=stories_cupom&utm_campaign=acelerar_vendas' },
      { id: 'ch-103', channel: 'facebook', channelName: 'Meta Ads Retargeting', subchannel: 'Carrossel Dinâmico', utmSource: 'facebook', utmMedium: 'retargeting_feed', utmCampaign: 'acelerar_vendas', budget: 1500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 4.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=facebook&utm_medium=retargeting_feed&utm_campaign=acelerar_vendas' },
      { id: 'ch-104', channel: 'email', channelName: 'E-mail Marketing Urgência', subchannel: 'Disparo Especial', utmSource: 'email', utmMedium: 'email_acelerar', utmCampaign: 'acelerar_vendas', budget: 800, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 8.5, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=email&utm_medium=email_acelerar&utm_campaign=acelerar_vendas' }
    ]
  },
  {
    id: 'TMPL-002',
    name: 'Lançamento do Evento',
    tagline: 'Estratégia 360° de topo e meio de funil com 6 canais integrados.',
    description: 'Campanha completa para abertura oficial de vendas e lote promocional. Mobiliza tráfego pago, influenciadores parceiros, base de e-mail e grupos de WhatsApp simultaneamente.',
    category: 'lancamento',
    recommendedBudget: 15000,
    channelsCount: 6,
    targetAudience: 'Público amplo de Curitiba/Região, seguidores e fãs do artista/estilo.',
    expectedRoi: '320% a 480%',
    badge: 'Mais Utilizado • 360°',
    channels: [
      { id: 'ch-201', channel: 'instagram', channelName: 'Instagram (Feed & Reels)', subchannel: 'Feed & Reels', utmSource: 'instagram', utmMedium: 'feed_reels', utmCampaign: 'lancamento_evento', budget: 4500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 4.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=instagram&utm_medium=feed_reels&utm_campaign=lancamento_evento' },
      { id: 'ch-202', channel: 'google', channelName: 'Google Ads (Search & Discovery)', subchannel: 'Search CPC', utmSource: 'google', utmMedium: 'search_cpc', utmCampaign: 'lancamento_evento', budget: 3500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 4.5, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=google&utm_medium=search_cpc&utm_campaign=lancamento_evento' },
      { id: 'ch-203', channel: 'tiktok', channelName: 'TikTok Ads (In-Feed Video)', subchannel: 'In-Feed Video', utmSource: 'tiktok', utmMedium: 'video_views', utmCampaign: 'lancamento_evento', budget: 2500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 4.9, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=tiktok&utm_medium=video_views&utm_campaign=lancamento_evento' },
      { id: 'ch-204', channel: 'whatsapp', channelName: 'WhatsApp Disparo Base Ativa', subchannel: 'Transacional VIP', utmSource: 'whatsapp', utmMedium: 'disparo_vip', utmCampaign: 'lancamento_evento', budget: 1500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 11.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=disparo_vip&utm_campaign=lancamento_evento' },
      { id: 'ch-205', channel: 'email', channelName: 'E-mail Marketing Lançamento', subchannel: 'Newsletter Segmentada', utmSource: 'email', utmMedium: 'newsletter_lancamento', utmCampaign: 'lancamento_evento', budget: 1000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 7.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=email&utm_medium=newsletter_lancamento&utm_campaign=lancamento_evento' },
      { id: 'ch-206', channel: 'influencer', channelName: 'Influenciadores & Embaixadores', subchannel: 'Stories & Cupom', utmSource: 'influencer', utmMedium: 'embaixador_stories', utmCampaign: 'lancamento_evento', budget: 2000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 6.4, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=influencer&utm_medium=embaixador_stories&utm_campaign=lancamento_evento' }
    ]
  },
  {
    id: 'TMPL-003',
    name: 'Virada de Lote',
    tagline: 'Gatilho de urgência e escassez com contagem regressiva de 24 horas.',
    description: 'Campanha de alta conversão para os últimos dias do lote atual. Combina remarketing em Meta Ads, alertas de contagem regressiva por WhatsApp e e-mail marketing direto.',
    category: 'urgencia',
    recommendedBudget: 6500,
    channelsCount: 4,
    targetAudience: 'Visitantes recentes que não compraram e clientes de eventos similares.',
    expectedRoi: '500% a 750%',
    badge: 'Alta Conversão 🔥',
    channels: [
      { id: 'ch-301', channel: 'instagram', channelName: 'Instagram Stories (Contagem Regressiva)', subchannel: 'Stories Urgência', utmSource: 'instagram', utmMedium: 'stories_virada', utmCampaign: 'virada_de_lote', budget: 2200, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 6.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=instagram&utm_medium=stories_virada&utm_campaign=virada_de_lote' },
      { id: 'ch-302', channel: 'facebook', channelName: 'Meta Ads (Remarketing Checkout)', subchannel: 'Custom Audience', utmSource: 'facebook', utmMedium: 'remarketing_ultimos', utmCampaign: 'virada_de_lote', budget: 2000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 7.1, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=facebook&utm_medium=remarketing_ultimos&utm_campaign=virada_de_lote' },
      { id: 'ch-303', channel: 'whatsapp', channelName: 'WhatsApp Alerta de Lote', subchannel: 'Disparo Urgente', utmSource: 'whatsapp', utmMedium: 'alerta_virada', utmCampaign: 'virada_de_lote', budget: 1300, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 14.5, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=alerta_virada&utm_campaign=virada_de_lote' },
      { id: 'ch-304', channel: 'email', channelName: 'E-mail Últimas 24 Horas', subchannel: 'Automação Urgência', utmSource: 'email', utmMedium: 'ultimas_24h', utmCampaign: 'virada_de_lote', budget: 1000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 9.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=email&utm_medium=ultimas_24h&utm_campaign=virada_de_lote' }
    ]
  },
  {
    id: 'TMPL-004',
    name: 'Últimas Vagas',
    tagline: 'Reta final de esgotamento com aviso dos últimos 100 ingressos disponíveis.',
    description: 'Campanha de encerramento de vendas focada em esgotar os últimos setores do evento. Usa gatilhos visuais de setor quase cheio e remarketing pesado.',
    category: 'urgencia',
    recommendedBudget: 4500,
    channelsCount: 3,
    targetAudience: 'Público morno, indecisos que simularam assento e visitantes das últimas 48h.',
    expectedRoi: '600% a 900%',
    badge: 'Esgotamento Final',
    channels: [
      { id: 'ch-401', channel: 'instagram', channelName: 'Instagram Stories (Últimos Ingressos)', subchannel: 'Stories Esgotando', utmSource: 'instagram', utmMedium: 'stories_ultimas_vagas', utmCampaign: 'ultimas_vagas', budget: 2000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 6.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=instagram&utm_medium=stories_ultimas_vagas&utm_campaign=ultimas_vagas' },
      { id: 'ch-402', channel: 'whatsapp', channelName: 'WhatsApp Disparo Últimos Lugares', subchannel: 'Disparo Urgente', utmSource: 'whatsapp', utmMedium: 'ultimos_lugares', utmCampaign: 'ultimas_vagas', budget: 1500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 15.6, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=ultimos_lugares&utm_campaign=ultimas_vagas' },
      { id: 'ch-403', channel: 'crm', channelName: 'Notificação Push & Alerta App', subchannel: 'Push App', utmSource: 'crm', utmMedium: 'push_ultimas_vagas', utmCampaign: 'ultimas_vagas', budget: 1000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 11.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=crm&utm_medium=push_ultimas_vagas&utm_campaign=ultimas_vagas' }
    ]
  },
  {
    id: 'TMPL-005',
    name: 'Evento nesta Semana',
    tagline: 'Tração máxima nos últimos 5 dias que antecedem a data do show.',
    description: 'Campanha de conversão imediata para o público que decide a programação do final de semana na última hora. Foco em Google Search, Reels e WhatsApp.',
    category: 'midia_paga',
    recommendedBudget: 5000,
    channelsCount: 3,
    targetAudience: 'Moradores locais buscando lazer e eventos para a semana e final de semana.',
    expectedRoi: '480% a 680%',
    badge: 'Reta Final',
    channels: [
      { id: 'ch-501', channel: 'google', channelName: 'Google Search (Programação Fim de Semana)', subchannel: 'Search Imediato', utmSource: 'google', utmMedium: 'search_nesta_semana', utmCampaign: 'evento_nesta_semana', budget: 2500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 7.5, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=google&utm_medium=search_nesta_semana&utm_campaign=evento_nesta_semana' },
      { id: 'ch-502', channel: 'instagram', channelName: 'Instagram Reels & Stories (É Esta Semana!)', subchannel: 'Reels Local', utmSource: 'instagram', utmMedium: 'reels_nesta_semana', utmCampaign: 'evento_nesta_semana', budget: 1800, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 5.6, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=instagram&utm_medium=reels_nesta_semana&utm_campaign=evento_nesta_semana' },
      { id: 'ch-503', channel: 'whatsapp', channelName: 'WhatsApp Mensagem Final', subchannel: 'Lembrete Show', utmSource: 'whatsapp', utmMedium: 'lembrete_semana', utmCampaign: 'evento_nesta_semana', budget: 700, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 13.4, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=lembrete_semana&utm_campaign=evento_nesta_semana' }
    ]
  },
  {
    id: 'TMPL-006',
    name: 'Recuperar Carrinhos',
    tagline: 'Resgate cirúrgico de usuários que iniciaram a compra mas não pagaram.',
    description: 'Campanha de máxima eficiência operacional. Conecta o pixel do Meta Ads com recuperação ativa via WhatsApp em tempo real e régua de e-mails de resgate.',
    category: 'remarketing',
    recommendedBudget: 3500,
    channelsCount: 3,
    targetAudience: 'Usuários com evento InitiateCheckout ou Cart Abandoned nos últimos 7 dias.',
    expectedRoi: '800% a 1400%',
    badge: 'ROI Máximo ⚡',
    channels: [
      { id: 'ch-601', channel: 'whatsapp', channelName: 'WhatsApp 1-a-1 Recuperação Imediata', subchannel: 'Mensagem Automática', utmSource: 'whatsapp', utmMedium: 'resgate_carrinho', utmCampaign: 'recuperar_carrinhos', budget: 1200, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 16.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=resgate_carrinho&utm_campaign=recuperar_carrinhos' },
      { id: 'ch-602', channel: 'facebook', channelName: 'Meta Ads Retargeting Dinâmico', subchannel: 'Carrossel Dinâmico', utmSource: 'facebook', utmMedium: 'retargeting_pixel', utmCampaign: 'recuperar_carrinhos', budget: 1600, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 5.9, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=facebook&utm_medium=retargeting_pixel&utm_campaign=recuperar_carrinhos' },
      { id: 'ch-603', channel: 'email', channelName: 'E-mail Régua de Abandono (1h / 24h)', subchannel: 'Régua de Resgate', utmSource: 'email', utmMedium: 'regua_abandono', utmCampaign: 'recuperar_carrinhos', budget: 700, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 11.4, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=email&utm_medium=regua_abandono&utm_campaign=recuperar_carrinhos' }
    ]
  },
  {
    id: 'TMPL-007',
    name: 'Remarketing de Visitantes',
    tagline: 'Reimpacte quem visitou a página do evento mas ainda não iniciou checkout.',
    description: 'Campanha de meio de funil para lembrar e convencer pessoas interessadas. Utiliza Meta CAPI Custom Audiences e Google Display com banners comemorativos.',
    category: 'remarketing',
    recommendedBudget: 4000,
    channelsCount: 3,
    targetAudience: 'Visitantes da página do evento nos últimos 7 a 14 dias sem conversão.',
    expectedRoi: '550% a 850%',
    badge: 'Meio de Funil',
    channels: [
      { id: 'ch-701', channel: 'instagram', channelName: 'Instagram Stories Remarketing', subchannel: 'Stories Lembrança', utmSource: 'instagram', utmMedium: 'stories_remarketing', utmCampaign: 'remarketing_visitantes', budget: 1800, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 5.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=instagram&utm_medium=stories_remarketing&utm_campaign=remarketing_visitantes' },
      { id: 'ch-702', channel: 'google', channelName: 'Google Display & Discovery', subchannel: 'Banners Rede Display', utmSource: 'google', utmMedium: 'display_visitantes', utmCampaign: 'remarketing_visitantes', budget: 1400, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 3.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=google&utm_medium=display_visitantes&utm_campaign=remarketing_visitantes' },
      { id: 'ch-703', channel: 'facebook', channelName: 'Facebook Feed Retargeting', subchannel: 'Feed Depoimentos', utmSource: 'facebook', utmMedium: 'feed_visitantes', utmCampaign: 'remarketing_visitantes', budget: 800, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 4.1, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=facebook&utm_medium=feed_visitantes&utm_campaign=remarketing_visitantes' }
    ]
  },
  {
    id: 'TMPL-008',
    name: 'Reativar Compradores',
    tagline: 'Fidelização e recompra com base de compradores de edições anteriores.',
    description: 'Campanha de relacionamento para comunicar novidades, assentos preferenciais e pré-vendas aos clientes mais fiéis da produtora e de edições anteriores.',
    category: 'engajamento',
    recommendedBudget: 2800,
    channelsCount: 3,
    targetAudience: 'Compradores históricos cadastrados no banco de dados da produtora.',
    expectedRoi: '900% a 1600%',
    badge: 'Fidelização VIP 💎',
    channels: [
      { id: 'ch-801', channel: 'whatsapp', channelName: 'WhatsApp Transacional VIP', subchannel: 'Direct VIP', utmSource: 'whatsapp', utmMedium: 'base_vip', utmCampaign: 'reativar_compradores', budget: 1400, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 15.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=base_vip&utm_campaign=reativar_compradores' },
      { id: 'ch-802', channel: 'email', channelName: 'E-mail Marketing Exclusivo VIP', subchannel: 'Email VIP', utmSource: 'email', utmMedium: 'email_vip', utmCampaign: 'reativar_compradores', budget: 900, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 8.9, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=email&utm_medium=email_vip&utm_campaign=reativar_compradores' },
      { id: 'ch-803', channel: 'coupon', channelName: 'Cupom de Reativação VIP', subchannel: 'Cupom Fidelidade', utmSource: 'coupon', utmMedium: 'cupom_reativacao', utmCampaign: 'reativar_compradores', budget: 500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 12.0, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=coupon&utm_medium=cupom_reativacao&utm_campaign=reativar_compradores' }
    ]
  }
];

// Campanhas Multicanais Ativas no Sistema
export const mockMarketingCampaigns: MarketingCampaign[] = [
  {
    id: 'CMP-001',
    code: 'CMP-001',
    name: 'Lançamento Oficial — Marcos & Belutti 18 Anos',
    objective: 'lancamento',
    objectiveLabel: 'Lançamento & Pré-Venda',
    eventId: 1,
    eventName: 'MARCOS & BELUTTI • Tour 18 Anos',
    status: 'active',
    budget: 18500,
    spent: 12400,
    salesCount: 312,
    revenue: 68400,
    roi: 451.6,
    cpa: 39.74,
    ctr: 4.8,
    startDate: '10/08/2026',
    endDate: '18/09/2026',
    utmCampaign: 'lancamento_marcos_belutti',
    channels: [
      { id: 'cmp1-ch1', channel: 'instagram', channelName: 'Instagram (Feed & Reels)', subchannel: 'Feed / Reels', utmSource: 'instagram', utmMedium: 'feed_reels', utmCampaign: 'lancamento_marcos_belutti', budget: 6000, spent: 4200, salesCount: 112, revenue: 24640, roi: 486.6, cpa: 37.5, ctr: 4.5, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/3064?utm_source=instagram&utm_medium=feed_reels&utm_campaign=lancamento_marcos_belutti' },
      { id: 'cmp1-ch2', channel: 'instagram', channelName: 'Instagram Stories Ads', subchannel: 'Stories Patrocinados', utmSource: 'instagram', utmMedium: 'stories_ads', utmCampaign: 'lancamento_marcos_belutti', budget: 3500, spent: 2600, salesCount: 68, revenue: 14960, roi: 475.3, cpa: 38.23, ctr: 5.9, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/3064?utm_source=instagram&utm_medium=stories_ads&utm_campaign=lancamento_marcos_belutti' },
      { id: 'cmp1-ch3', channel: 'google', channelName: 'Google Ads (Search & Discovery)', subchannel: 'Search CPC', utmSource: 'google', utmMedium: 'search_cpc', utmCampaign: 'lancamento_marcos_belutti', budget: 4000, spent: 2800, salesCount: 54, revenue: 11880, roi: 324.2, cpa: 51.85, ctr: 4.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/3064?utm_source=google&utm_medium=search_cpc&utm_campaign=lancamento_marcos_belutti' },
      { id: 'cmp1-ch4', channel: 'whatsapp', channelName: 'WhatsApp Base VIP', subchannel: 'Disparo Transacional', utmSource: 'whatsapp', utmMedium: 'base_vip', utmCampaign: 'lancamento_marcos_belutti', budget: 1500, spent: 950, salesCount: 38, revenue: 8360, roi: 780.0, cpa: 25.0, ctr: 12.4, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/3064?utm_source=whatsapp&utm_medium=base_vip&utm_campaign=lancamento_marcos_belutti' },
      { id: 'cmp1-ch5', channel: 'email', channelName: 'E-mail Marketing Newsletter', subchannel: 'Newsletter Oficial', utmSource: 'email', utmMedium: 'newsletter', utmCampaign: 'lancamento_marcos_belutti', budget: 1000, spent: 550, salesCount: 22, revenue: 4840, roi: 780.0, cpa: 25.0, ctr: 7.6, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/3064?utm_source=email&utm_medium=newsletter&utm_campaign=lancamento_marcos_belutti' },
      { id: 'cmp1-ch6', channel: 'influencer', channelName: 'Influenciadores do Sertanejo', subchannel: 'Stories Parceria', utmSource: 'influencer', utmMedium: 'stories_influencer', utmCampaign: 'lancamento_marcos_belutti', budget: 2500, spent: 1300, salesCount: 18, revenue: 3720, roi: 186.1, cpa: 72.22, ctr: 5.1, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/3064?utm_source=influencer&utm_medium=stories_influencer&utm_campaign=lancamento_marcos_belutti' }
    ]
  },
  {
    id: 'CMP-002',
    code: 'CMP-002',
    name: 'Virada de Lote & Urgência — Toquinho 60 Anos',
    objective: 'urgencia',
    objectiveLabel: 'Virada de Lote / Escassez',
    eventId: 3,
    eventName: 'TOQUINHO • 60 Anos de Carreira',
    status: 'active',
    budget: 8500,
    spent: 5600,
    salesCount: 164,
    revenue: 36080,
    roi: 544.2,
    cpa: 34.14,
    ctr: 6.8,
    startDate: '18/08/2026',
    endDate: '29/08/2026',
    utmCampaign: 'virada_lote_toquinho',
    channels: [
      { id: 'cmp2-ch1', channel: 'facebook', channelName: 'Meta Ads (Remarketing Checkout)', subchannel: 'Remarketing Pixel', utmSource: 'facebook', utmMedium: 'remarketing_checkout', utmCampaign: 'virada_lote_toquinho', budget: 3500, spent: 2400, salesCount: 72, revenue: 15840, roi: 560.0, cpa: 33.33, ctr: 7.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/3116?utm_source=facebook&utm_medium=remarketing_checkout&utm_campaign=virada_lote_toquinho' },
      { id: 'cmp2-ch2', channel: 'instagram', channelName: 'Instagram Stories (Últimos Lugares)', subchannel: 'Stories Escassez', utmSource: 'instagram', utmMedium: 'stories_escassez', utmCampaign: 'virada_lote_toquinho', budget: 2500, spent: 1700, salesCount: 48, revenue: 10560, roi: 521.1, cpa: 35.41, ctr: 6.4, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/3116?utm_source=instagram&utm_medium=stories_escassez&utm_campaign=virada_lote_toquinho' },
      { id: 'cmp2-ch3', channel: 'whatsapp', channelName: 'WhatsApp Disparo Urgência', subchannel: 'Alerta Contagem', utmSource: 'whatsapp', utmMedium: 'alerta_virada', utmCampaign: 'virada_lote_toquinho', budget: 1500, spent: 900, salesCount: 30, revenue: 6600, roi: 633.3, cpa: 30.0, ctr: 13.5, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/3116?utm_source=whatsapp&utm_medium=alerta_virada&utm_campaign=virada_lote_toquinho' },
      { id: 'cmp2-ch4', channel: 'email', channelName: 'E-mail Alerta de Virada', subchannel: 'Régua de Urgência', utmSource: 'email', utmMedium: 'regua_virada', utmCampaign: 'virada_lote_toquinho', budget: 1000, spent: 600, salesCount: 14, revenue: 3080, roi: 413.3, cpa: 42.85, ctr: 8.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/3116?utm_source=email&utm_medium=regua_virada&utm_campaign=virada_lote_toquinho' }
    ]
  },
  {
    id: 'CMP-003',
    code: 'CMP-003',
    name: 'Remarketing de Checkout & Carrinho Abandonado',
    objective: 'remarketing',
    objectiveLabel: 'Recuperação de Vendas',
    eventId: 2,
    eventName: 'ED MOTTA • Manual Prático 30 Anos',
    status: 'active',
    budget: 4200,
    spent: 2150,
    salesCount: 88,
    revenue: 21120,
    roi: 882.3,
    cpa: 24.43,
    ctr: 8.9,
    startDate: '15/08/2026',
    endDate: '29/08/2026',
    utmCampaign: 'recuperacao_carrinho_edmotta',
    channels: [
      { id: 'cmp3-ch1', channel: 'whatsapp', channelName: 'WhatsApp 1-a-1 Recuperação Imediata', subchannel: 'Mensagem Resgate', utmSource: 'whatsapp', utmMedium: 'recuperacao_direta', utmCampaign: 'recuperacao_carrinho_edmotta', budget: 1500, spent: 780, salesCount: 44, revenue: 10560, roi: 1253.8, cpa: 17.72, ctr: 16.5, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/2920?utm_source=whatsapp&utm_medium=recuperacao_direta&utm_campaign=recuperacao_carrinho_edmotta' },
      { id: 'cmp3-ch2', channel: 'facebook', channelName: 'Meta Ads Retargeting de Carrinho', subchannel: 'Carrossel Dinâmico', utmSource: 'facebook', utmMedium: 'retargeting_carrinho', utmCampaign: 'recuperacao_carrinho_edmotta', budget: 1800, spent: 980, salesCount: 28, revenue: 6720, roi: 585.7, cpa: 35.0, ctr: 6.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/2920?utm_source=facebook&utm_medium=retargeting_carrinho&utm_campaign=recuperacao_carrinho_edmotta' },
      { id: 'cmp3-ch3', channel: 'email', channelName: 'E-mail Régua de Abandono (1h / 24h)', subchannel: 'Régua Automática', utmSource: 'email', utmMedium: 'email_abandono', utmCampaign: 'recuperacao_carrinho_edmotta', budget: 900, spent: 390, salesCount: 16, revenue: 3840, roi: 884.6, cpa: 24.37, ctr: 11.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/2920?utm_source=email&utm_medium=email_abandono&utm_campaign=recuperacao_carrinho_edmotta' }
    ]
  },
  {
    id: 'CMP-004',
    code: 'CMP-004',
    name: 'Pesquisa Ativa no Google — Mateus Asato Tour',
    objective: 'vendas',
    objectiveLabel: 'Intenção & Busca Direta',
    eventId: 5,
    eventName: 'MATEUS ASATO • World Tour 2026',
    status: 'active',
    budget: 5200,
    spent: 3100,
    salesCount: 78,
    revenue: 17160,
    roi: 453.5,
    cpa: 39.74,
    ctr: 7.4,
    startDate: '12/08/2026',
    endDate: '18/09/2026',
    utmCampaign: 'google_search_asato',
    channels: [
      { id: 'cmp4-ch1', channel: 'google', channelName: 'Google Search (Termos Oficiais)', subchannel: 'Search CPC', utmSource: 'google', utmMedium: 'search_oficial', utmCampaign: 'google_search_asato', budget: 3500, spent: 2200, salesCount: 56, revenue: 12320, roi: 460.0, cpa: 39.28, ctr: 8.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/270?utm_source=google&utm_medium=search_oficial&utm_campaign=google_search_asato' },
      { id: 'cmp4-ch2', channel: 'google', channelName: 'YouTube Ads (Vídeo Solo de Guitarra)', subchannel: 'YouTube Video', utmSource: 'google', utmMedium: 'youtube_video', utmCampaign: 'google_search_asato', budget: 1700, spent: 900, salesCount: 22, revenue: 4840, roi: 437.7, cpa: 40.9, ctr: 4.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/270?utm_source=google&utm_medium=youtube_video&utm_campaign=google_search_asato' }
    ]
  }
];

export const mockAbandonedCarts: AbandonedCart[] = [
  {
    id: 'CRT-981',
    buyerName: 'Lucas Henrique Silva',
    buyerEmail: 'lucas.silva@gmail.com',
    buyerPhone: '(41) 99876-5432',
    eventId: 1,
    eventName: 'MARCOS & BELUTTI • Tour 18 Anos',
    batchName: 'Plateia Premium - Lote 2',
    ticketCount: 2,
    totalValue: 560,
    abandonedAt: 'Há 25 minutos',
    status: 'abandoned',
  },
  {
    id: 'CRT-980',
    buyerName: 'Carolina Mendes',
    buyerEmail: 'carol.mendes@hotmail.com',
    buyerPhone: '(41) 99123-8899',
    eventId: 3,
    eventName: 'TOQUINHO • 60 Anos de Carreira',
    batchName: 'Guairão Plateia Central',
    ticketCount: 1,
    totalValue: 240,
    abandonedAt: 'Há 1 hora',
    status: 'in_recovery',
    recoveryChannel: 'whatsapp',
  },
  {
    id: 'CRT-979',
    buyerName: 'Roberto Almeida Jr.',
    buyerEmail: 'roberto.almeida@empresa.com.br',
    buyerPhone: '(41) 98844-1122',
    eventId: 2,
    eventName: 'ED MOTTA • Manual Prático 30 Anos',
    batchName: 'Plateia Baixa',
    ticketCount: 2,
    totalValue: 360,
    abandonedAt: 'Há 3 horas',
    status: 'recovered',
    recoveryChannel: 'whatsapp',
  },
];

export const mockUtmLinks: UtmLink[] = [
  {
    id: 'UTM-101',
    title: 'Instagram Stories — Swipe Up Oficial',
    baseUrl: 'https://diskingressos.com.br/evento/3064',
    utmSource: 'instagram',
    utmMedium: 'stories_ads',
    utmCampaign: 'lancamento_marcos_belutti',
    fullUrl: 'https://diskingressos.com.br/evento/3064?utm_source=instagram&utm_medium=stories_ads&utm_campaign=lancamento_marcos_belutti',
    clicks: 4520,
    conversions: 180,
    revenue: 39600,
    createdAt: '10/08/2026',
  },
  {
    id: 'UTM-102',
    title: 'Google Search — Palavras Chave Exatas',
    baseUrl: 'https://diskingressos.com.br/evento/3116',
    utmSource: 'google',
    utmMedium: 'search_cpc',
    utmCampaign: 'virada_lote_toquinho',
    fullUrl: 'https://diskingressos.com.br/evento/3116?utm_source=google&utm_medium=search_cpc&utm_campaign=virada_lote_toquinho',
    clicks: 2980,
    conversions: 102,
    revenue: 22440,
    createdAt: '18/08/2026',
  },
  {
    id: 'UTM-103',
    title: 'WhatsApp VIP — Disparo Base de Fãs',
    baseUrl: 'https://diskingressos.com.br/evento/2920',
    utmSource: 'whatsapp',
    utmMedium: 'base_vip',
    utmCampaign: 'recuperacao_carrinho_edmotta',
    fullUrl: 'https://diskingressos.com.br/evento/2920?utm_source=whatsapp&utm_medium=base_vip&utm_campaign=recuperacao_carrinho_edmotta',
    clicks: 1420,
    conversions: 88,
    revenue: 21120,
    createdAt: '15/08/2026',
  }
];

export const mockCoupons: CouponPromo[] = [
  {
    id: 'CPN-01',
    code: 'PRIMEIRACOMPRA10',
    discountType: 'percentage',
    value: 10,
    eventId: null,
    eventName: 'Todos os Eventos',
    usageLimit: 1000,
    usageCount: 342,
    revenueGenerated: 45200,
    status: 'active',
    expiresAt: '31/12/2026',
  },
  {
    id: 'CPN-02',
    code: 'VIPCLUB50',
    discountType: 'fixed',
    value: 50,
    eventId: 1,
    eventName: 'MARCOS & BELUTTI • Tour 18 Anos',
    usageLimit: 200,
    usageCount: 98,
    revenueGenerated: 28400,
    status: 'active',
    expiresAt: '18/09/2026',
  }
];

export const mockTrackingConfigs: TrackingTagConfig[] = [
  { id: 'TRK-01', name: 'Meta Pixel Produção', type: 'meta-pixel', token: '984712093847129', mode: 'inherit', status: 'active' },
  { id: 'TRK-02', name: 'Google Analytics 4 (GA4)', type: 'google-analytics', token: 'G-7X9827B910', mode: 'inherit', status: 'active' },
  { id: 'TRK-03', name: 'Google Tag Manager (GTM)', type: 'google-tag-manager', token: 'GTM-K98L241', mode: 'inherit', status: 'active' },
  { id: 'TRK-04', name: 'TikTok Ads Pixel', type: 'tiktok-pixel', token: 'TT-984712098', mode: 'custom', status: 'active' },
];
