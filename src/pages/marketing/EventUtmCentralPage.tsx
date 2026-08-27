import type { EventItem } from '../../data/events'
import UtmConversionsCenter from '../../components/UtmConversionsCenter'

interface EventUtmCentralPageProps {
  event?: EventItem
  notify?: (message: string) => void
}

/**
 * Fase 16.8.1
 *
 * Esta página é somente um adaptador para a Central UTM oficial.
 * A implementação anterior do Gemini mantinha ~2.000 linhas de dados mockados
 * neste arquivo, criando uma segunda fonte de verdade diferente da API real.
 *
 * A partir desta correção existe apenas uma implementação operacional:
 * `UtmConversionsCenter`, alimentada pelos endpoints /marketing/links e
 * /marketing/utm/dashboard.
 */
export function EventUtmCentralPage({ event, notify = () => undefined }: EventUtmCentralPageProps) {
  if (!event) {
    return (
      <section className="growth-page">
        <div className="growth-panel feature-empty">
          <h3>Selecione um evento para abrir a Central UTM</h3>
          <p>
            A análise UTM é contextual. Primeiro selecione um evento; depois escolha uma URL
            rastreável para carregar KPIs, funil, gráficos, pedidos e remarketing.
          </p>
        </div>
      </section>
    )
  }

  return <UtmConversionsCenter event={event} notify={notify} />
}

export default EventUtmCentralPage
