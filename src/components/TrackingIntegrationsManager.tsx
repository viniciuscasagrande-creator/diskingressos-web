import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Activity, CircleCheck, Eye, EyeOff, KeyRound, Plus, RefreshCw, Save, ScanLine, Trash2, X, PlugZap, ShieldCheck, Sliders, CheckCircle2 } from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  createTrackingIntegration,
  deleteTrackingIntegration,
  getTrackingIntegrations,
  testTrackingIntegration,
  updateTrackingIntegration,
  updateEventTrackingAssignment,
  type TrackingIntegration,
  type TrackingIntegrationEvent
} from '../services/api'
import {
  integrationByKey,
  marketingIntegrationCatalog,
  MARKETING_INTEGRATIONS_RELEASE,
  friendlyIntegrationTypeLabel,
  TRACKING_MODE_LABELS,
  TRACKING_EVENT_LABELS,
  type TrackingMode
} from '../domain/marketing/integrations'
import { UNIVERSAL_CONVERSION_RELEASE } from '../domain/marketing/conversionEngine'

type Props = { producerId: number | null; events: EventItem[]; fixedEventId?: number; notify: (m: string) => void }
const defaultProvider = 'meta'
const makeBlank = (provider = defaultProvider) => {
  const p = integrationByKey(provider)
  return {
    name: '',
    provider: p.key,
    integrationType: p.integrationType,
    pixelId: '',
    apiToken: '',
    trackingMode: 'HYBRID' as TrackingMode,
    isPrimary: false,
    applyToAllEvents: false,
    eventIds: [] as number[],
    enabledEvents: [...p.recommendedEvents]
  }
}

export default function TrackingIntegrationsManager({ producerId, events, fixedEventId, notify }: Props) {
  const [rows, setRows] = useState<TrackingIntegration[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TrackingIntegration | null>(null)
  const [form, setForm] = useState(makeBlank())
  const [showToken, setShowToken] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmedGlobal, setConfirmedGlobal] = useState(false)
  const [ruleModalAssignment, setRuleModalAssignment] = useState<{ integration: TrackingIntegration; assignment: TrackingIntegrationEvent } | null>(null)

  const contextEvent = useMemo(() => events.find(e => e.id === fixedEventId), [events, fixedEventId])
  const provider = integrationByKey(form.provider)

  const load = () => getTrackingIntegrations(producerId || undefined, fixedEventId).then(setRows).catch(e => notify(e.message))
  useEffect(() => { load() }, [producerId, fixedEventId])

  const startNew = (providerKey = defaultProvider) => {
    const next = makeBlank(providerKey)
    setEditing(null)
    setForm({ ...next, applyToAllEvents: false, eventIds: fixedEventId ? [fixedEventId] : [] })
    setShowToken(false)
    setConfirmedGlobal(false)
    setOpen(true)
  }

  const startEdit = (r: TrackingIntegration) => {
    const p = integrationByKey(r.provider)
    const currentAssignment = fixedEventId ? r.events?.find(e => e.eventId === fixedEventId) : r.events?.[0]
    setEditing(r)
    setForm({
      name: r.name,
      provider: r.provider as any,
      integrationType: r.integrationType || p.integrationType,
      pixelId: r.pixelId,
      apiToken: '',
      trackingMode: currentAssignment?.trackingMode || 'HYBRID',
      isPrimary: currentAssignment?.isPrimary || false,
      applyToAllEvents: r.applyToAllEvents,
      eventIds: r.events.map(x => x.eventId),
      enabledEvents: r.enabledEvents
    })
    setShowToken(false)
    setConfirmedGlobal(r.applyToAllEvents)
    setOpen(true)
  }

  const changeProvider = (providerKey: string) => {
    const p = integrationByKey(providerKey)
    setForm(f => ({ ...f, provider: p.key, integrationType: p.integrationType, enabledEvents: [...p.recommendedEvents] }))
  }

  const toggleEvent = (id: number) => setForm(f => ({ ...f, eventIds: f.eventIds.includes(id) ? f.eventIds.filter(x => x !== id) : [...f.eventIds, id] }))
  const toggleConversion = (name: string) => setForm(f => ({ ...f, enabledEvents: f.enabledEvents.includes(name) ? f.enabledEvents.filter(x => x !== name) : [...f.enabledEvents, name] }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!producerId) { notify('Selecione uma produtora.'); return }
    if (!form.applyToAllEvents && !form.eventIds.length) { notify('Selecione pelo menos um evento.'); return }
    if (form.applyToAllEvents && !confirmedGlobal) { notify('Confirme a ciência da aplicação em todos os eventos da produtora.'); return }
    setBusy(true)
    try {
      const payload = { ...form, producerId, apiToken: form.apiToken || undefined }
      const saved = editing
        ? await updateTrackingIntegration(editing.id, payload)
        : await createTrackingIntegration(payload)

      // Se editando ou criando com evento único/específico, atualizar flags da associação
      if (fixedEventId && saved.id) {
        await updateEventTrackingAssignment(fixedEventId, saved.id, {
          trackingMode: form.trackingMode,
          isPrimary: form.isPrimary
        }).catch(() => null)
      }

      notify(editing ? 'Integração atualizada.' : `${provider.name} adicionado com sucesso.`)
      setOpen(false)
      load()
    } catch (err: any) {
      notify(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (r: TrackingIntegration) => {
    if (!confirm(`Desativar integração ${r.name}? O histórico de logs e conversões será preservado.`)) return
    try {
      await deleteTrackingIntegration(r.id)
      notify('Integração desativada com sucesso.')
      load()
    } catch (e: any) {
      notify(e.message)
    }
  }

  const test = async (r: TrackingIntegration) => {
    try {
      const out = await testTrackingIntegration(r.id)
      notify(out.message)
      load()
    } catch (e: any) {
      notify(e.message)
    }
  }

  const saveAssignmentRule = async (assignment: TrackingIntegrationEvent, eventName: string, field: 'enabled' | 'browserEnabled' | 'serverEnabled', val: boolean) => {
    const currentRules = assignment.rules || []
    const updatedRules = currentRules.map(r => r.eventName === eventName ? { ...r, [field]: val } : r)
    if (!currentRules.some(r => r.eventName === eventName)) {
      updatedRules.push({
        id: 0,
        assignmentId: assignment.id,
        eventName,
        enabled: field === 'enabled' ? val : true,
        browserEnabled: field === 'browserEnabled' ? val : true,
        serverEnabled: field === 'serverEnabled' ? val : true
      })
    }
    try {
      await updateEventTrackingAssignment(assignment.eventId, assignment.integrationId, {
        rules: updatedRules.map(r => ({
          eventName: r.eventName,
          enabled: r.enabled,
          browserEnabled: r.browserEnabled,
          serverEnabled: r.serverEnabled
        }))
      })
      notify('Regra de disparo atualizada.')
      load()
      if (ruleModalAssignment) {
        setRuleModalAssignment({
          ...ruleModalAssignment,
          assignment: {
            ...ruleModalAssignment.assignment,
            rules: updatedRules
          }
        })
      }
    } catch (err: any) {
      notify(err.message)
    }
  }

  const connected = new Set(rows.filter(r => r.status === 'ativo').map(r => r.provider))

  return (
    <div className="multi-tracking" data-release={MARKETING_INTEGRATIONS_RELEASE}>
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow">MARKETING INTEGRATIONS 360 · FASE 28.14</p>
          <h2>{fixedEventId ? 'Pixels e Conversões do Evento' : 'Pixels e Conversões'}</h2>
          <p>
            {contextEvent
              ? `Tracking multi-pixel e conversões associados a ${contextEvent.title}. Permite múltiplos pixels por parceiro, agência e regras individuais por evento.`
              : 'Central consolidada para Meta Pixel/CAPI, TikTok Events API, Google Ads/GA4/GTM, Spotify Ads CAPI e mensuração 360°.'}
          </p>
        </div>
        <button className="btn primary" onClick={() => startNew()}>
          <Plus size={17} /> Nova integração
        </button>
      </div>

      <section className="growth-panel conversion-engine-panel" data-release={UNIVERSAL_CONVERSION_RELEASE}>
        <div className="integration-card-head">
          <span className="integration-icon"><Activity size={22} /></span>
          <div>
            <strong>Motor Universal de Conversões & Multi-Pixel por Evento</strong>
            <small>Associação N:N · Disparo seletivo Híbrido, Navegador ou Server-side (CAPI) · Deduplicação garantida</small>
          </div>
          <span className="status-badge green">Fase 28.14</span>
        </div>
        <div className="conversion-engine-flow">
          <span>Venda / Jornada</span>
          <b>→</b>
          <span>Evento canônico</span>
          <b>→</b>
          <span>Regras por Evento</span>
          <b>→</b>
          <span>Fan-out Multi-Pixel (Meta · TikTok · Google · Spotify)</span>
        </div>
        <div className="integration-events">
          <small>Eventos canônicos rastreados</small>
          <div>
            {['page_view', 'view_content', 'add_to_cart', 'begin_checkout', 'add_payment_info', 'purchase', 'lead', 'sign_up'].map(name => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
        <p className="conversion-engine-note">
          Transações pagas disparam conversão de compra automaticamente. Pixels configurados como "Apenas Navegador" são executados exclusivamente no front-end, protegendo o servidor e respeitando a governança do produtor.
        </p>
      </section>

      <div className="multi-tracking-summary">
        <article>
          <PlugZap size={20} />
          <span><b>{rows.length}</b><small>Conexões cadastradas</small></span>
        </article>
        <article>
          <CircleCheck size={20} />
          <span><b>{rows.filter(r => r.status === 'ativo').length}</b><small>Ativas</small></span>
        </article>
        <article>
          <Activity size={20} />
          <span><b>{rows.reduce((n, r) => n + (r._count?.deliveryLogs || 0), 0)}</b><small>Logs registrados</small></span>
        </article>
        <article>
          <ShieldCheck size={20} />
          <span><b>{marketingIntegrationCatalog.length}</b><small>Provedores suportados</small></span>
        </article>
      </div>

      <div className="marketing-provider-grid">
        {marketingIntegrationCatalog.map(p => (
          <button
            type="button"
            key={p.key}
            className={`marketing-provider-card ${connected.has(p.key) ? 'connected' : ''}`}
            onClick={() => startNew(p.key)}
          >
            <span className="marketing-provider-status">
              {connected.has(p.key) ? '● Conectado' : '○ Configurar'}
            </span>
            <strong>{p.name}</strong>
            <small>{p.description}</small>
            <div>
              {p.capabilities.slice(0, 3).map(x => (
                <span key={x}>{x}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="multi-tracking-grid">
        {rows.map(r => {
          const p = integrationByKey(r.provider)
          const targetAssignment = fixedEventId ? r.events?.find(e => e.eventId === fixedEventId) : undefined
          return (
            <article className="growth-panel integration-card" key={r.id}>
              <div className="integration-card-head">
                <span className="integration-icon"><ScanLine size={22} /></span>
                <div>
                  <strong>{r.name}</strong>
                  <small>{p.name} · {friendlyIntegrationTypeLabel(r.integrationType)}</small>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {targetAssignment?.isPrimary && (
                    <span className="status-badge green" style={{ fontSize: '10px' }}>Principal</span>
                  )}
                  {targetAssignment?.trackingMode && (
                    <span className="status-badge blue" style={{ fontSize: '10px' }}>
                      {TRACKING_MODE_LABELS[targetAssignment.trackingMode]?.badge || targetAssignment.trackingMode}
                    </span>
                  )}
                  <span className={`status-badge ${r.status === 'ativo' ? 'green' : 'gray'}`}>{r.status}</span>
                </div>
              </div>

              <dl>
                <div>
                  <dt>{p.identifierLabel}</dt>
                  <dd>{r.pixelId}</dd>
                </div>
                <div>
                  <dt>Credencial</dt>
                  <dd>{r.apiTokenMasked || 'Não configurada'}</dd>
                </div>
                <div>
                  <dt>Abrangência</dt>
                  <dd>
                    {r.applyToAllEvents
                      ? 'Todos os eventos da produtora'
                      : r.events?.map(e => e.event?.title || `Evento #${e.eventId}`).join(', ') || 'Nenhum evento associado'}
                  </dd>
                </div>
                <div>
                  <dt>Último teste</dt>
                  <dd>
                    {r.lastTestAt ? new Date(r.lastTestAt).toLocaleString('pt-BR') : 'Ainda não testado'}{' '}
                    {r.lastTestStatus && (
                      <span className={`mini-status ${r.lastTestStatus === 'ok' ? 'ativo' : 'inativo'}`}>
                        {r.lastTestStatus}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>

              {r.events && r.events.length > 0 && !r.applyToAllEvents && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #edf0f4' }}>
                  <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                    Associações & Governança por Evento:
                  </small>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {r.events.map(ev => (
                      <div
                        key={ev.eventId}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <strong>{ev.event?.title || `Evento #${ev.eventId}`}</strong>
                        <span style={{ fontSize: '10px', color: ev.isPrimary ? '#15803d' : '#64748b', fontWeight: 'bold' }}>
                          {ev.isPrimary ? '● Principal' : '○ Parceiro'}
                        </span>
                        <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '4px' }}>
                          {TRACKING_MODE_LABELS[ev.trackingMode]?.badge || ev.trackingMode}
                        </span>
                        <button
                          type="button"
                          title="Configurar regras individuais deste evento"
                          style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#2563eb', padding: '0 2px' }}
                          onClick={() => setRuleModalAssignment({ integration: r, assignment: ev })}
                        >
                          <Sliders size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="integration-events">
                <small>Eventos monitorados globalmente</small>
                <div>
                  {r.enabledEvents.map(x => (
                    <span key={x}>{TRACKING_EVENT_LABELS[x] || x}</span>
                  ))}
                </div>
              </div>

              <div className="page-actions">
                <button className="btn secondary" onClick={() => startEdit(r)}>
                  Editar
                </button>
                <button className="btn secondary" onClick={() => test(r)}>
                  <RefreshCw size={15} /> Testar
                </button>
                <button className="icon-action danger" title="Desativar" onClick={() => remove(r)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {!rows.length && (
        <article className="growth-panel feature-empty">
          <PlugZap size={34} />
          <h3>Nenhuma integração cadastrada</h3>
          <p>Escolha Meta, TikTok, Google ou outro provedor acima para iniciar.</p>
        </article>
      )}

      {open && (
        <div className="integration-editor">
          <form className="growth-panel integration-editor-card" onSubmit={submit}>
            <div className="integration-editor-head">
              <div>
                <p className="eyebrow">{editing ? 'EDITAR INTEGRAÇÃO' : 'NOVA INTEGRAÇÃO'}</p>
                <h3>{editing ? editing.name : provider.name}</h3>
              </div>
              <button type="button" className="icon-action" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="context-form-grid">
              <label>
                Plataforma
                <select disabled={!!editing} value={form.provider} onChange={e => changeProvider(e.target.value)}>
                  {marketingIntegrationCatalog.map(p => (
                    <option key={p.key} value={p.key}>{p.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Nome da integração
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder={`Ex.: ${provider.name} Principal`}
                />
              </label>
              <label>
                {provider.identifierLabel}
                <input
                  required
                  value={form.pixelId}
                  onChange={e => setForm({ ...form, pixelId: e.target.value })}
                  placeholder={provider.identifierPlaceholder}
                />
              </label>
              <label>
                Modo de Disparo
                <select
                  value={form.trackingMode}
                  onChange={e => setForm({ ...form, trackingMode: e.target.value as TrackingMode })}
                >
                  <option value="HYBRID">Híbrido 360° (Navegador + Server-side CAPI)</option>
                  <option value="BROWSER">Apenas Navegador (Client-side)</option>
                  <option value="SERVER">Apenas Servidor (Server-side / CAPI)</option>
                </select>
              </label>
            </div>

            <label className="token-field">
              <span>{editing ? `${provider.tokenLabel} (vazio = manter atual)` : provider.tokenLabel}</span>
              <div>
                <input
                  required={!editing}
                  type={showToken ? 'text' : 'password'}
                  value={form.apiToken}
                  onChange={e => setForm({ ...form, apiToken: e.target.value })}
                  placeholder={editing ? '•••••••••••• — manter atual' : 'Cole a credencial/token do provedor'}
                />
                <button type="button" onClick={() => setShowToken(v => !v)}>
                  {showToken ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <small>
                <KeyRound size={13} /> Credenciais são criptografadas via AES-256-GCM no backend e nunca expostas na interface.
              </small>
            </label>

            <div className="integration-scope">
              <strong>Aplicação nos Eventos</strong>
              {!fixedEventId && (
                <label>
                  <input
                    type="radio"
                    checked={form.applyToAllEvents}
                    onChange={() => setForm({ ...form, applyToAllEvents: true, eventIds: [] })}
                  />{' '}
                  Todos os eventos da produtora (Global)
                </label>
              )}
              <label>
                <input
                  type="radio"
                  checked={!form.applyToAllEvents}
                  onChange={() => setForm({ ...form, applyToAllEvents: false, eventIds: fixedEventId ? [fixedEventId] : form.eventIds })}
                />{' '}
                {fixedEventId ? 'Apenas o evento atual' : 'Eventos selecionados'}
              </label>
            </div>

            {form.applyToAllEvents && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '10px 14px', borderRadius: '8px', margin: '8px 0', fontSize: '12px', color: '#92400E' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>⚠️ Atenção à governança de audiências:</strong>
                <span>Esta integração receberá dados de conversão de <em>todos os eventos</em> desta produtora. Para evitar vazamento de público entre diferentes atrações, confirme:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  <input type="checkbox" checked={confirmedGlobal} onChange={e => setConfirmedGlobal(e.target.checked)} />
                  Estou ciente e confirmo a aplicação global nesta produtora
                </label>
              </div>
            )}

            {!form.applyToAllEvents && !fixedEventId && (
              <div className="integration-event-picker">
                {events.map(ev => (
                  <label key={ev.id}>
                    <input
                      type="checkbox"
                      checked={form.eventIds.includes(ev.id)}
                      onChange={() => toggleEvent(ev.id)}
                    />
                    <span>
                      <strong>{ev.title}</strong>
                      <small>{ev.code}</small>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {fixedEventId && (
              <div style={{ margin: '10px 0', padding: '10px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                  <input
                    type="checkbox"
                    checked={form.isPrimary}
                    onChange={e => setForm({ ...form, isPrimary: e.target.checked })}
                  />
                  Definir como Pixel Principal deste evento ({contextEvent?.title})
                </label>
                <small style={{ display: 'block', marginTop: '4px', color: '#64748B', fontSize: '11px' }}>
                  Pixels principais são a fonte primária de atribuição; outros pixels cadastrados no evento recebem dados como parceiros/agência.
                </small>
              </div>
            )}

            <div className="integration-meta-events">
              <strong>Eventos de conversão habilitados</strong>
              <div>
                {provider.recommendedEvents.map(name => (
                  <label key={name}>
                    <input
                      type="checkbox"
                      checked={form.enabledEvents.includes(name)}
                      onChange={() => toggleConversion(name)}
                    />
                    {TRACKING_EVENT_LABELS[name] || name}
                  </label>
                ))}
              </div>
            </div>

            <div className="page-actions editor-actions">
              <button type="button" className="btn secondary" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button className="btn primary" disabled={busy}>
                <Save size={16} />
                {busy ? 'Salvando...' : 'Salvar integração'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Regras Granulares por Evento */}
      {ruleModalAssignment && (
        <div className="integration-editor" style={{ zIndex: 1100 }}>
          <div className="growth-panel integration-editor-card" style={{ maxWidth: '640px' }}>
            <div className="integration-editor-head">
              <div>
                <p className="eyebrow">REGRAS GRANULARES POR EVENTO</p>
                <h3>{ruleModalAssignment.integration.name} → {ruleModalAssignment.assignment.event?.title || `Evento #${ruleModalAssignment.assignment.eventId}`}</h3>
              </div>
              <button type="button" className="icon-action" onClick={() => setRuleModalAssignment(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ margin: '14px 0', padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <strong>Modo Atual:</strong>
                <span className="status-badge blue">{TRACKING_MODE_LABELS[ruleModalAssignment.assignment.trackingMode]?.badge || ruleModalAssignment.assignment.trackingMode}</span>
                {ruleModalAssignment.assignment.isPrimary && <span className="status-badge green">Principal</span>}
              </div>
              <p style={{ margin: 0 }}>
                Configure individualmente quais etapas do funil acionam disparo no navegador ou no servidor para este evento específico.
              </p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', margin: '14px 0' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>Etapa / Evento</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Ativo</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Navegador</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Servidor (CAPI)</th>
                </tr>
              </thead>
              <tbody>
                {['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'].map(evtName => {
                  const r = ruleModalAssignment.assignment.rules?.find(x => x.eventName === evtName) || {
                    enabled: true,
                    browserEnabled: true,
                    serverEnabled: true
                  }
                  return (
                    <tr key={evtName} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '9px 10px' }}>
                        <strong>{TRACKING_EVENT_LABELS[evtName] || evtName}</strong>
                        <small style={{ display: 'block', color: '#64748B', fontSize: '11px' }}>{evtName}</small>
                      </td>
                      <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={r.enabled}
                          onChange={e => saveAssignmentRule(ruleModalAssignment.assignment, evtName, 'enabled', e.target.checked)}
                        />
                      </td>
                      <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          disabled={!r.enabled || ruleModalAssignment.assignment.trackingMode === 'SERVER'}
                          checked={r.browserEnabled && ruleModalAssignment.assignment.trackingMode !== 'SERVER'}
                          onChange={e => saveAssignmentRule(ruleModalAssignment.assignment, evtName, 'browserEnabled', e.target.checked)}
                        />
                      </td>
                      <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          disabled={!r.enabled || ruleModalAssignment.assignment.trackingMode === 'BROWSER'}
                          checked={r.serverEnabled && ruleModalAssignment.assignment.trackingMode !== 'BROWSER'}
                          onChange={e => saveAssignmentRule(ruleModalAssignment.assignment, evtName, 'serverEnabled', e.target.checked)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="page-actions editor-actions">
              <button type="button" className="btn primary" onClick={() => setRuleModalAssignment(null)}>
                <CheckCircle2 size={16} /> Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

