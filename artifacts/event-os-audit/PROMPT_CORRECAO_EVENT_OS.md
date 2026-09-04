# PROMPT DE CORREÇÃO CIRÚRGICA — EVENT OS (GERADO VIA AUDITORIA 26.17.1)

Baseado no relatório congelado da Fase 26.17.1, execute exclusivamente as correções listadas abaixo:

### 1. Botões sem Ação e Handlers Vazios
- **AccountingJournalPage.tsx:80**: `NAV_TARGET_MISSING` em `onClick={() => (onNavigate ? onNavigate('accounting-dashboard') : window.history.back())}`
- **AccountingJournalPage.tsx:326**: `EMPTY_CLICK_HANDLER` em `<button className="btn primary" onClick={() => { setShowTermModal(false); notify('Certificado SPED e`
- **AccountingLedgerPage.tsx:74**: `NAV_TARGET_MISSING` em `onClick={() => (onNavigate ? onNavigate('accounting-dashboard') : window.history.back())}`
- **AuditPage.tsx:13**: `NAV_TARGET_MISSING` em `onClick={()=>onNavigate?onNavigate('admin-hub'):window.history.back()}`
- **AutomationCenterPage.tsx:18**: `BUTTON_WITHOUT_ACTION` em `const isEmail=mode==='email';return <section className="growth-page"><div className="growth-intro"><`
- **EventCommandCenterPage.tsx:257**: `EMPTY_CLICK_HANDLER` em `onClick={() => { loadData(); notify('Cockpit 360 atualizado com sucesso!') }}`
- **EventContextPage.tsx:124**: `EMPTY_CLICK_HANDLER` em `<button type="button" className="btn primary" onClick={() => { notify(`Ingresso #${selectedPerson.or`
- **EventContextPage.tsx:148**: `EMPTY_CLICK_HANDLER` em `return <div className="event-context-page"><HeaderBlock eyebrow="CORTESIAS" title="Cortesias" descri`
- **EventCustomer360Page.tsx:57**: `EMPTY_CLICK_HANDLER` em `<div className="crm-filters"><select aria-label="Segmento" value={segment} onChange={e=>setSegment(e`
- **EventInventoryPage.tsx:198**: `EMPTY_CLICK_HANDLER` em `{data.recommendations.length?data.recommendations.map((r,i)=><div key={`${r.code}-${i}`} className={`
- **EventsPage.tsx:32**: `NAV_TARGET_MISSING` em `onClick={()=>onNavigate?onNavigate('profile-dashboard'):window.history.back()}`
- **EventsPage.tsx:42**: `BUTTON_WITHOUT_ACTION` em `<button className="tool-btn events-compare-btn"><ArrowLeftRight size={18}/><span>Comparar</span></bu`
- **FacialPage.tsx:11**: `NAV_TARGET_MISSING` em `onClick={()=>onNavigate?onNavigate('profile-dashboard'):window.history.back()}`
- **FacialPage.tsx:20**: `BUTTON_WITHOUT_ACTION` em `<section className="table-card"><div className="table-toolbar"><div><h2>Base facial</h2><p>Visualiza`
- **FinanceBalancesPage.tsx:320**: `EMPTY_CLICK_HANDLER` em `onClick={() => {`

### 2. Contratos de API Pendentes
- **live-operations**: `GET /events/:id/live-ops/overview` -> Função `getEventLiveOpsOverview`
- **event-day-command**: `GET /events/:id/day-command/overview` -> Função `getEventDayCommandOverview`
- **estornos**: `GET /refunds` -> Função `getRefundRequests`

### 3. Regras e Contratos Estritamente Proibidos de Alterar:
- NUNCA alterar menus, sidebars ou rotas protegidas sem aprovação explícita.
- O módulo de Estornos (/app/finance-refunds · FinanceDisputesHubPage) deve permanecer 100% canônico e independente.
- NÃO apagar testes de regressão existentes.
- NÃO substituir APIs existentes por novos mocks.
