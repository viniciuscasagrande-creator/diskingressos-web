export const ATTRIBUTION_RELEASE = '25.7.2-multichannel-attribution-center-2026-09-02'

export type AttributionModel = 'last_click' | 'first_click' | 'linear' | 'position_based' | 'data_driven'

export type AttributionTouchpoint = {
  id: string
  sessionId: string
  occurredAt: string
  source: string
  medium: string
  campaign: string
  content?: string | null
  term?: string | null
  fbclid?: string | null
  ttclid?: string | null
  gclid?: string | null
  msclkid?: string | null
  referrer?: string | null
  landingPage?: string | null
}

export type AttributedOrder = {
  orderId: string
  revenueCents: number
  occurredAt: string
  firstTouch?: AttributionTouchpoint | null
  lastTouch?: AttributionTouchpoint | null
  touchpoints: AttributionTouchpoint[]
}

export const distributeRevenue = (order: AttributedOrder, model: AttributionModel) => {
  const touches = order.touchpoints.length ? order.touchpoints : [order.lastTouch, order.firstTouch].filter(Boolean) as AttributionTouchpoint[]
  if (!touches.length) return []
  if (model === 'last_click') return [{ touchpoint: touches[touches.length - 1], revenueCents: order.revenueCents }]
  if (model === 'first_click') return [{ touchpoint: touches[0], revenueCents: order.revenueCents }]
  if (model === 'linear') {
    const base = Math.floor(order.revenueCents / touches.length)
    let remainder = order.revenueCents - base * touches.length
    return touches.map(touchpoint => ({ touchpoint, revenueCents: base + (remainder-- > 0 ? 1 : 0) }))
  }
  if (touches.length === 1) return [{ touchpoint: touches[0], revenueCents: order.revenueCents }]
  const firstWeight = model === 'position_based' ? .4 : .35
  const lastWeight = model === 'position_based' ? .4 : .45
  const middleWeight = Math.max(0, 1 - firstWeight - lastWeight)
  const middleCount = Math.max(1, touches.length - 2)
  return touches.map((touchpoint, index) => {
    const weight = index === 0 ? firstWeight : index === touches.length - 1 ? lastWeight : middleWeight / middleCount
    return { touchpoint, revenueCents: Math.round(order.revenueCents * weight) }
  })
}
