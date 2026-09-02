const STORAGE_KEY = 'safesaff.finance.drilldown.v1'
const MAX_AGE_MS = 60_000

export type FinanceDrilldown = {
  target: string
  status?: string
  method?: string
  category?: string
  eventName?: string
  source?: string
  label?: string
  createdAt: number
}

export function setFinanceDrilldown(input: Omit<FinanceDrilldown, 'createdAt'>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...input, createdAt: Date.now() }))
  } catch {
    // Navegação continua funcionando mesmo se o storage estiver indisponível.
  }
}

export function consumeFinanceDrilldown(target: string): FinanceDrilldown | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as FinanceDrilldown
    const expired = !parsed.createdAt || Date.now() - parsed.createdAt > MAX_AGE_MS
    if (expired) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    if (parsed.target !== target) return null
    sessionStorage.removeItem(STORAGE_KEY)
    return parsed
  } catch {
    return null
  }
}

export function navigateWithFinanceDrilldown(
  onNavigate: (page: any) => void,
  target: string,
  filters: Omit<FinanceDrilldown, 'target' | 'createdAt'> = {}
) {
  setFinanceDrilldown({ target, ...filters })
  onNavigate(target)
}
