export const UNIVERSAL_CONVERSION_RELEASE = '25.7.1-universal-conversion-engine-2026-09-02'

export type CanonicalMarketingEvent =
  | 'page_view'
  | 'view_content'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'add_payment_info'
  | 'purchase'
  | 'lead'
  | 'sign_up'

export type CanonicalConversion = {
  eventId: string
  eventName: CanonicalMarketingEvent
  occurredAt: string
  producerId: number
  eventEntityId?: number | null
  orderId?: number | null
  valueCents?: number
  currency?: string
  customer?: { email?: string | null; phone?: string | null; externalId?: string | null }
  attribution?: { ttclid?: string | null; fbclid?: string | null; gclid?: string | null; source?: string | null; campaign?: string | null }
}

export const providerEventMap: Record<string, Partial<Record<CanonicalMarketingEvent,string>>> = {
  meta: { page_view:'PageView', view_content:'ViewContent', add_to_cart:'AddToCart', begin_checkout:'InitiateCheckout', add_payment_info:'AddPaymentInfo', purchase:'Purchase', lead:'Lead', sign_up:'CompleteRegistration' },
  tiktok: { page_view:'PageView', view_content:'ViewContent', add_to_cart:'AddToCart', begin_checkout:'InitiateCheckout', add_payment_info:'AddPaymentInfo', purchase:'Purchase', lead:'SubmitForm', sign_up:'CompleteRegistration' },
  ga4: { page_view:'page_view', view_content:'view_item', add_to_cart:'add_to_cart', begin_checkout:'begin_checkout', add_payment_info:'add_payment_info', purchase:'purchase', lead:'generate_lead', sign_up:'sign_up' },
  google_ads: { page_view:'page_view', view_content:'view_content', add_to_cart:'add_to_cart', begin_checkout:'begin_checkout', purchase:'purchase', lead:'lead' },
  linkedin: { page_view:'PageView', view_content:'ViewContent', purchase:'Purchase', lead:'Lead', sign_up:'CompleteRegistration' },
  pinterest: { page_view:'PageVisit', view_content:'ViewCategory', add_to_cart:'AddToCart', begin_checkout:'Checkout', purchase:'Checkout', lead:'Lead', sign_up:'Signup' },
  snapchat: { page_view:'PAGE_VIEW', view_content:'VIEW_CONTENT', add_to_cart:'ADD_CART', begin_checkout:'START_CHECKOUT', purchase:'PURCHASE', sign_up:'SIGN_UP' },
  microsoft_ads: { page_view:'page_view', view_content:'view_content', add_to_cart:'add_to_cart', begin_checkout:'begin_checkout', purchase:'purchase', lead:'lead' },
  gtm: { page_view:'PageView', view_content:'ViewContent', add_to_cart:'AddToCart', begin_checkout:'InitiateCheckout', purchase:'Purchase' },
  clarity: { page_view:'PageView', view_content:'ViewContent', begin_checkout:'InitiateCheckout', purchase:'Purchase' }
}

export const mapCanonicalEvent = (provider:string,eventName:CanonicalMarketingEvent) => providerEventMap[provider]?.[eventName] || eventName
