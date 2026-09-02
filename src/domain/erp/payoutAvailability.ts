/** Fase 25.5 — Repasses, Reservas e Disponibilidade Financeira */
export const PAYOUT_AVAILABILITY_RELEASE = '25.5-payouts-reserves-availability-2026-09-02'

export type ProducerFinancialPosition = {
  availableCents: number
  reservedCents: number
  committedCents: number
  receivableCents: number
  paidOutCents: number
}

export function calculatePayoutAvailability(position: ProducerFinancialPosition) {
  const requestableCents = Math.max(position.availableCents - position.committedCents, 0)
  const protectedCents = position.reservedCents + position.committedCents
  const exposureCents = Math.max(position.receivableCents + position.availableCents, 0)
  const liquidityBps = exposureCents > 0 ? Math.round((requestableCents / exposureCents) * 10000) : 0
  return { ...position, requestableCents, protectedCents, exposureCents, liquidityBps }
}

export function assertPayoutAllowed(position: ProducerFinancialPosition, requestedCents: number) {
  if (!Number.isSafeInteger(requestedCents) || requestedCents <= 0) throw new Error('Valor de repasse inválido.')
  const availability = calculatePayoutAvailability(position)
  if (requestedCents > availability.requestableCents) throw new Error('Repasse excede a disponibilidade financeira após reservas e compromissos.')
  return availability
}
