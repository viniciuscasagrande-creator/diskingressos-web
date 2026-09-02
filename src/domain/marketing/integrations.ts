export const MARKETING_INTEGRATIONS_RELEASE = '25.7-marketing-integrations-360-2026-09-02'

export type MarketingIntegrationProvider =
  | 'meta'
  | 'tiktok'
  | 'google_ads'
  | 'ga4'
  | 'gtm'
  | 'linkedin'
  | 'pinterest'
  | 'snapchat'
  | 'microsoft_ads'
  | 'clarity'

export type MarketingIntegrationDefinition = {
  key: MarketingIntegrationProvider
  name: string
  family: 'ads' | 'analytics' | 'tracking'
  integrationType: string
  identifierLabel: string
  identifierPlaceholder: string
  tokenLabel: string
  description: string
  capabilities: string[]
  recommendedEvents: string[]
}

export const marketingIntegrationCatalog: MarketingIntegrationDefinition[] = [
  { key:'meta', name:'Meta Ads / Meta Pixel', family:'ads', integrationType:'pixel_capi', identifierLabel:'Pixel ID', identifierPlaceholder:'123456789012345', tokenLabel:'Token Conversion API', description:'Facebook e Instagram Ads com Pixel + Conversions API.', capabilities:['Meta Pixel','Conversions API','Ads attribution','Remarketing'], recommendedEvents:['PageView','ViewContent','AddToCart','InitiateCheckout','AddPaymentInfo','Purchase','Lead','CompleteRegistration'] },
  { key:'tiktok', name:'TikTok Ads / TikTok Pixel', family:'ads', integrationType:'pixel_events_api', identifierLabel:'Pixel Code', identifierPlaceholder:'CXXXXXXXXXXXXXXXXX', tokenLabel:'Access Token Events API', description:'TikTok Ads, Spark Ads, Pixel e Events API server-side.', capabilities:['TikTok Pixel','Events API','Spark Ads','Attribution'], recommendedEvents:['PageView','ViewContent','AddToCart','InitiateCheckout','AddPaymentInfo','Purchase','CompleteRegistration','SubmitForm'] },
  { key:'google_ads', name:'Google Ads', family:'ads', integrationType:'conversion_api', identifierLabel:'Conversion / Customer ID', identifierPlaceholder:'AW-000000000', tokenLabel:'API / OAuth secret', description:'Pesquisa, Display, Performance Max e YouTube com conversões.', capabilities:['Google Ads','Enhanced Conversions','YouTube','Remarketing'], recommendedEvents:['PageView','ViewContent','AddToCart','InitiateCheckout','Purchase','Lead'] },
  { key:'ga4', name:'Google Analytics 4', family:'analytics', integrationType:'measurement_protocol', identifierLabel:'Measurement ID', identifierPlaceholder:'G-XXXXXXXXXX', tokenLabel:'Measurement Protocol API Secret', description:'Analytics 4 para sessões, eventos, receita e funil.', capabilities:['GA4','Measurement Protocol','E-commerce','Attribution'], recommendedEvents:['page_view','view_item','add_to_cart','begin_checkout','purchase','generate_lead','sign_up'] },
  { key:'gtm', name:'Google Tag Manager', family:'tracking', integrationType:'container', identifierLabel:'Container ID', identifierPlaceholder:'GTM-XXXXXXX', tokenLabel:'Server container / credential', description:'Orquestração de tags web e server-side.', capabilities:['Web Container','Server-side GTM','Consent Mode','Data Layer'], recommendedEvents:['PageView','ViewContent','AddToCart','InitiateCheckout','Purchase'] },
  { key:'linkedin', name:'LinkedIn Insight Tag', family:'ads', integrationType:'insight_conversions', identifierLabel:'Partner ID', identifierPlaceholder:'0000000', tokenLabel:'Conversions API token', description:'Insight Tag, conversões e públicos profissionais.', capabilities:['Insight Tag','Conversions API','Audiences','Campaign attribution'], recommendedEvents:['PageView','ViewContent','Lead','Purchase','CompleteRegistration'] },
  { key:'pinterest', name:'Pinterest Tag', family:'ads', integrationType:'tag_conversions', identifierLabel:'Tag ID', identifierPlaceholder:'0000000000000', tokenLabel:'Conversions API token', description:'Pinterest Ads, Tag e conversões server-side.', capabilities:['Pinterest Tag','Conversions API','Audiences','Shopping intent'], recommendedEvents:['PageVisit','ViewCategory','AddToCart','Checkout','Lead','Signup'] },
  { key:'snapchat', name:'Snap Pixel', family:'ads', integrationType:'pixel_capi', identifierLabel:'Pixel ID', identifierPlaceholder:'xxxxxxxx-xxxx-xxxx-xxxx', tokenLabel:'Conversions API token', description:'Snap Ads, Pixel e Conversions API.', capabilities:['Snap Pixel','Conversions API','Audiences','Attribution'], recommendedEvents:['PAGE_VIEW','VIEW_CONTENT','ADD_CART','START_CHECKOUT','PURCHASE','SIGN_UP'] },
  { key:'microsoft_ads', name:'Microsoft Advertising', family:'ads', integrationType:'uet_conversions', identifierLabel:'UET Tag ID', identifierPlaceholder:'00000000', tokenLabel:'API / OAuth secret', description:'Bing/Microsoft Ads com UET e conversões.', capabilities:['UET','Microsoft Ads','Conversion goals','Remarketing'], recommendedEvents:['page_view','view_content','add_to_cart','begin_checkout','purchase','lead'] },
  { key:'clarity', name:'Microsoft Clarity', family:'analytics', integrationType:'analytics', identifierLabel:'Project ID', identifierPlaceholder:'xxxxxxxxxx', tokenLabel:'API credential (opcional)', description:'Heatmaps, gravações de sessão e diagnóstico UX.', capabilities:['Heatmaps','Session recordings','UX insights','Funnels'], recommendedEvents:['PageView','ViewContent','InitiateCheckout','Purchase'] }
]

export const integrationByKey = (key: string) => marketingIntegrationCatalog.find(p => p.key === key) || marketingIntegrationCatalog[0]
