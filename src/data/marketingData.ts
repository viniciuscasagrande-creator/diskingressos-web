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

// 8 Modelos Prontos de Campanhas Multicanais (Templates)
export const mockCampaignTemplates: CampaignTemplate[] = [
  {
    id: 'TMPL-001',
    name: 'Lançamento Oficial do Evento',
    tagline: 'Estratégia completa de topo e meio de funil com 8 canais integrados.',
    description: 'Campanha 360° para abertura de vendas e lote promocional. Mobiliza tráfego pago, influenciadores parceiros, base de e-mail e grupos de WhatsApp simultaneamente.',
    category: 'lancamento',
    recommendedBudget: 15000,
    channelsCount: 8,
    targetAudience: 'Público amplo de Curitiba/Região, seguidores e fãs de música ao vivo.',
    expectedRoi: '320% a 450%',
    badge: 'Mais Utilizado • 360°',
    channels: [
      { id: 'ch-1', channel: 'instagram', channelName: 'Instagram (Feed & Reels)', subchannel: 'Feed & Reels', utmSource: 'instagram', utmMedium: 'feed_reels', utmCampaign: 'lancamento_oficial', budget: 4000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 4.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=instagram&utm_medium=feed_reels&utm_campaign=lancamento_oficial' },
      { id: 'ch-2', channel: 'instagram', channelName: 'Instagram Stories Ads', subchannel: 'Stories Ads', utmSource: 'instagram', utmMedium: 'stories_ads', utmCampaign: 'lancamento_oficial', budget: 2500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 5.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=instagram&utm_medium=stories_ads&utm_campaign=lancamento_oficial' },
      { id: 'ch-3', channel: 'google', channelName: 'Google Ads (Search & Discovery)', subchannel: 'Search & Discovery', utmSource: 'google', utmMedium: 'search_cpc', utmCampaign: 'lancamento_oficial', budget: 3000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 4.5, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=google&utm_medium=search_cpc&utm_campaign=lancamento_oficial' },
      { id: 'ch-4', channel: 'tiktok', channelName: 'TikTok Ads (In-Feed Video)', subchannel: 'In-Feed Video', utmSource: 'tiktok', utmMedium: 'video_views', utmCampaign: 'lancamento_oficial', budget: 2000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 4.9, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=tiktok&utm_medium=video_views&utm_campaign=lancamento_oficial' },
      { id: 'ch-5', channel: 'whatsapp', channelName: 'WhatsApp Disparo Base Ativa', subchannel: 'Transacional VIP', utmSource: 'whatsapp', utmMedium: 'disparo_vip', utmCampaign: 'lancamento_oficial', budget: 800, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 11.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=disparo_vip&utm_campaign=lancamento_oficial' },
      { id: 'ch-6', channel: 'email', channelName: 'E-mail Marketing Lançamento', subchannel: 'Newsletter Segmentada', utmSource: 'email', utmMedium: 'newsletter_lancamento', utmCampaign: 'lancamento_oficial', budget: 500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 7.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=email&utm_medium=newsletter_lancamento&utm_campaign=lancamento_oficial' },
      { id: 'ch-7', channel: 'influencer', channelName: 'Influenciadores & Embaixadores', subchannel: 'Stories & Cupom', utmSource: 'influencer', utmMedium: 'embaixador_stories', utmCampaign: 'lancamento_oficial', budget: 1500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 6.4, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=influencer&utm_medium=embaixador_stories&utm_campaign=lancamento_oficial' },
      { id: 'ch-8', channel: 'affiliate', channelName: 'Promoters & Comissários Oficiais', subchannel: 'Links de Venda Direta', utmSource: 'affiliate', utmMedium: 'promoter_link', utmCampaign: 'lancamento_oficial', budget: 700, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 8.9, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=affiliate&utm_medium=promoter_link&utm_campaign=lancamento_oficial' }
    ]
  },
  {
    id: 'TMPL-002',
    name: 'Últimos Ingressos & Virada de Lote',
    tagline: 'Foco total em gatilhos de urgência e escassez para acelerar fechamentos.',
    description: 'Campanha tática de alta conversão para os últimos dias do lote atual. Combina remarketing em Meta Ads, alertas de contagem regressiva por WhatsApp e e-mail marketing direto.',
    category: 'urgencia',
    recommendedBudget: 6500,
    channelsCount: 4,
    targetAudience: 'Visitantes recentes que não compraram e clientes de eventos similares.',
    expectedRoi: '500% a 750%',
    badge: 'Alta Conversão',
    channels: [
      { id: 'ch-201', channel: 'instagram', channelName: 'Instagram Stories (Contagem Regressiva)', subchannel: 'Stories Urgência', utmSource: 'instagram', utmMedium: 'stories_virada', utmCampaign: 'virada_de_lote', budget: 2200, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 6.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=instagram&utm_medium=stories_virada&utm_campaign=virada_de_lote' },
      { id: 'ch-202', channel: 'facebook', channelName: 'Meta Ads (Remarketing Checkout)', subchannel: 'Custom Audience', utmSource: 'facebook', utmMedium: 'remarketing_ultimos', utmCampaign: 'virada_de_lote', budget: 2000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 7.1, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=facebook&utm_medium=remarketing_ultimos&utm_campaign=virada_de_lote' },
      { id: 'ch-203', channel: 'whatsapp', channelName: 'WhatsApp Alerta de Lote', subchannel: 'Disparo Urgente', utmSource: 'whatsapp', utmMedium: 'alerta_virada', utmCampaign: 'virada_de_lote', budget: 1300, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 14.5, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=alerta_virada&utm_campaign=virada_de_lote' },
      { id: 'ch-204', channel: 'email', channelName: 'E-mail Últimas 24 Horas', subchannel: 'Automação Urgência', utmSource: 'email', utmMedium: 'ultimas_24h', utmCampaign: 'virada_de_lote', budget: 1000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 9.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=email&utm_medium=ultimas_24h&utm_campaign=virada_de_lote' }
    ]
  },
  {
    id: 'TMPL-003',
    name: 'Pesquisa & Intenção de Compra',
    tagline: 'Captura de demanda ativa nos mecanismos de busca do Google e YouTube.',
    description: 'Campanha de intenção direta para capturar usuários pesquisando o nome do artista, teatro, datas e palavras-chave de ingressos em Curitiba e cidades vizinhas.',
    category: 'midia_paga',
    recommendedBudget: 5500,
    channelsCount: 3,
    targetAudience: 'Usuários com alta intenção de busca no Google ("ingressos {artista}", "show curitiba").',
    expectedRoi: '380% a 520%',
    badge: 'Tráfego Qualificado',
    channels: [
      { id: 'ch-301', channel: 'google', channelName: 'Google Search (Termos Exatos)', subchannel: 'Search CPC', utmSource: 'google', utmMedium: 'search_exato', utmCampaign: 'intencao_compra', budget: 3500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 8.5, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=google&utm_medium=search_exato&utm_campaign=intencao_compra' },
      { id: 'ch-302', channel: 'google', channelName: 'Google Display & Discovery', subchannel: 'Banners Rede de Display', utmSource: 'google', utmMedium: 'display_banners', utmCampaign: 'intencao_compra', budget: 1200, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 2.4, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=google&utm_medium=display_banners&utm_campaign=intencao_compra' },
      { id: 'ch-303', channel: 'google', channelName: 'YouTube Ads (Vídeo Teaser)', subchannel: 'In-Stream Vídeo', utmSource: 'google', utmMedium: 'youtube_video', utmCampaign: 'intencao_compra', budget: 800, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 3.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=google&utm_medium=youtube_video&utm_campaign=intencao_compra' }
    ]
  },
  {
    id: 'TMPL-004',
    name: 'Remarketing de Checkout & Abandono',
    tagline: 'Resgate cirúrgico de usuários que iniciaram a compra mas não pagaram.',
    description: 'Campanha de máxima eficiência operacional. Conecta o pixel do Meta Ads com recuperação ativa via WhatsApp em tempo real e régua de e-mails de resgate.',
    category: 'remarketing',
    recommendedBudget: 3500,
    channelsCount: 3,
    targetAudience: 'Usuários com evento InitiateCheckout ou Cart Abandoned nos últimos 7 dias.',
    expectedRoi: '800% a 1400%',
    badge: 'ROI Máximo ⚡',
    channels: [
      { id: 'ch-401', channel: 'whatsapp', channelName: 'WhatsApp 1-a-1 Recuperação Imediata', subchannel: 'Mensagem Automática', utmSource: 'whatsapp', utmMedium: 'resgate_carrinho', utmCampaign: 'recuperacao_checkout', budget: 1000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 16.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=resgate_carrinho&utm_campaign=recuperacao_checkout' },
      { id: 'ch-402', channel: 'facebook', channelName: 'Meta Ads Retargeting Dinâmico', subchannel: 'Carrossel Dinâmico', utmSource: 'facebook', utmMedium: 'retargeting_pixel', utmCampaign: 'recuperacao_checkout', budget: 1800, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 5.9, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=facebook&utm_medium=retargeting_pixel&utm_campaign=recuperacao_checkout' },
      { id: 'ch-403', channel: 'email', channelName: 'E-mail Régua de Abandono (1h / 24h)', subchannel: 'Régua de Resgate', utmSource: 'email', utmMedium: 'regua_abandono', utmCampaign: 'recuperacao_checkout', budget: 700, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 11.4, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=email&utm_medium=regua_abandono&utm_campaign=recuperacao_checkout' }
    ]
  },
  {
    id: 'TMPL-005',
    name: 'Vídeo Lineup & Teaser Viral',
    tagline: 'Engajamento massivo com vídeos curtos no TikTok, Reels e Shorts.',
    description: 'Campanha de forte apelo audiovisual focada em visualizações de vídeo e cliques no link. Ideal para atrações de humor, festivais de música e musicais.',
    category: 'engajamento',
    recommendedBudget: 4800,
    channelsCount: 3,
    targetAudience: 'Jovens e adultos 18-40 anos consumidores de vídeos e entretenimento.',
    expectedRoi: '260% a 380%',
    badge: 'Engajamento Audiovisual',
    channels: [
      { id: 'ch-501', channel: 'tiktok', channelName: 'TikTok Spark Ads & Feed', subchannel: 'Spark Ads', utmSource: 'tiktok', utmMedium: 'spark_ads', utmCampaign: 'video_teaser', budget: 2400, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 5.1, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=tiktok&utm_medium=spark_ads&utm_campaign=video_teaser' },
      { id: 'ch-502', channel: 'instagram', channelName: 'Instagram Reels Promoted', subchannel: 'Reels Boost', utmSource: 'instagram', utmMedium: 'reels_boost', utmCampaign: 'video_teaser', budget: 1600, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 4.6, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=instagram&utm_medium=reels_boost&utm_campaign=video_teaser' },
      { id: 'ch-503', channel: 'google', channelName: 'YouTube Shorts Ads', subchannel: 'Shorts Video', utmSource: 'google', utmMedium: 'youtube_shorts', utmCampaign: 'video_teaser', budget: 800, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 3.9, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=google&utm_medium=youtube_shorts&utm_campaign=video_teaser' }
    ]
  },
  {
    id: 'TMPL-006',
    name: 'Disparo Base Ativa & Clientes VIP',
    tagline: 'Comunicação direta de altíssima conversão com a base proprietária.',
    description: 'Campanha de relacionamento para comunicar novidades, assentos preferenciais e pré-vendas aos clientes mais fiéis da produtora e de edições anteriores.',
    category: 'engajamento',
    recommendedBudget: 2200,
    channelsCount: 3,
    targetAudience: 'Compradores históricos cadastrados no banco de dados da produtora.',
    expectedRoi: '900% a 1600%',
    badge: 'Custo Baixo • Alto Retorno',
    channels: [
      { id: 'ch-601', channel: 'whatsapp', channelName: 'WhatsApp Transacional VIP', subchannel: 'Direct VIP', utmSource: 'whatsapp', utmMedium: 'base_vip', utmCampaign: 'clientes_vip', budget: 1100, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 15.2, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=base_vip&utm_campaign=clientes_vip' },
      { id: 'ch-602', channel: 'email', channelName: 'E-mail Marketing Exclusivo VIP', subchannel: 'Email VIP', utmSource: 'email', utmMedium: 'email_vip', utmCampaign: 'clientes_vip', budget: 700, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 8.9, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=email&utm_medium=email_vip&utm_campaign=clientes_vip' },
      { id: 'ch-603', channel: 'crm', channelName: 'CRM Push & Notificação App', subchannel: 'Push App', utmSource: 'crm', utmMedium: 'push_notif', utmCampaign: 'clientes_vip', budget: 400, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 12.0, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=crm&utm_medium=push_notif&utm_campaign=clientes_vip' }
    ]
  },
  {
    id: 'TMPL-007',
    name: 'Influenciadores & Afiliados VIP',
    tagline: 'Rede descentralizada de promoters com comissionamento e UTM exclusiva.',
    description: 'Campanha de marketing de influência onde cada influenciador ou promoter recebe um link rastreável com sua própria UTM e cupom exclusivo para acompanhar o retorno.',
    category: 'influencia',
    recommendedBudget: 7500,
    channelsCount: 3,
    targetAudience: 'Seguidores de nicho dos influenciadores selecionados e círculos sociais dos promoters.',
    expectedRoi: '350% a 500%',
    badge: 'Comissionamento Rastreável',
    channels: [
      { id: 'ch-701', channel: 'influencer', channelName: 'Influenciadores de Cultura & Entretenimento', subchannel: 'Stories & Reels', utmSource: 'influencer', utmMedium: 'stories_parceria', utmCampaign: 'rede_influenciadores', budget: 4500, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 6.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=influencer&utm_medium=stories_parceria&utm_campaign=rede_influenciadores' },
      { id: 'ch-702', channel: 'affiliate', channelName: 'Promoters & Embaixadores Universitários', subchannel: 'WhatsApp & Direct', utmSource: 'affiliate', utmMedium: 'promoter_comissao', utmCampaign: 'rede_influenciadores', budget: 2000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 9.4, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=affiliate&utm_medium=promoter_comissao&utm_campaign=rede_influenciadores' },
      { id: 'ch-703', channel: 'coupon', channelName: 'Cupons de Desconto dos Parceiros', subchannel: 'Cupom Trackeado', utmSource: 'coupon', utmMedium: 'cupom_parceiro', utmCampaign: 'rede_influenciadores', budget: 1000, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 8.1, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=coupon&utm_medium=cupom_parceiro&utm_campaign=rede_influenciadores' }
    ]
  },
  {
    id: 'TMPL-008',
    name: 'Pós-Evento & Reativação para Próximo Show',
    tagline: 'Fidelização de quem já assistiu para garantir vendas antecipadas.',
    description: 'Campanha de agradecimento e pesquisa de satisfação com oferta de cupom de desconto exclusivo e pré-venda antecipada para o próximo espetáculo da temporada.',
    category: 'engajamento',
    recommendedBudget: 1800,
    channelsCount: 3,
    targetAudience: 'Participantes com check-in realizado ou ingressos validados no evento anterior.',
    expectedRoi: '1100% a 1800%',
    badge: 'Fidelização & LTV',
    channels: [
      { id: 'ch-801', channel: 'email', channelName: 'E-mail Obrigado & Pré-Venda Próximo Show', subchannel: 'Email Pós-Evento', utmSource: 'email', utmMedium: 'pos_evento', utmCampaign: 'reativacao_pos_show', budget: 700, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 9.5, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=email&utm_medium=pos_evento&utm_campaign=reativacao_pos_show' },
      { id: 'ch-802', channel: 'whatsapp', channelName: 'WhatsApp Convite Exclusivo Próxima Temporada', subchannel: 'Mensagem Fidelidade', utmSource: 'whatsapp', utmMedium: 'pos_show_vip', utmCampaign: 'reativacao_pos_show', budget: 800, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 16.0, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=whatsapp&utm_medium=pos_show_vip&utm_campaign=reativacao_pos_show' },
      { id: 'ch-803', channel: 'coupon', channelName: 'Cupom de Fidelidade Pós-Show', subchannel: 'Cupom 15% OFF', utmSource: 'coupon', utmMedium: 'cupom_fidelidade', utmCampaign: 'reativacao_pos_show', budget: 300, spent: 0, salesCount: 0, revenue: 0, roi: 0, cpa: 0, ctr: 12.8, status: 'active', trackingUrl: 'https://diskingressos.com.br/evento/{slug}?utm_source=coupon&utm_medium=cupom_fidelidade&utm_campaign=reativacao_pos_show' }
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
