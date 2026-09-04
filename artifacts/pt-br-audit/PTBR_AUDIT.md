# RELATÓRIO DE PADRONIZAÇÃO PT-BR — DISKINGRESSOS PDT

**Release:** `26.17.3.1-padronizacao-total-pt-br-2026-09-04`  
**Data:** 04/09/2026, 17:20:49  
**Status:** `FINDINGS_DETECTED`  

### Resumo da Varredura

- **Arquivos Analisados:** ~184
- **Ocorrências de Inglês Visível:** 326

### Ocorrências que Exigem Tradução (Top 50)

| Arquivo | Linha | Texto Encontrado | Sugestão PT-BR | Trecho |
| :--- | :---: | :--- | :--- | :--- |
| `AccountingDashboardPage.tsx` | 104 | **Dashboard** | `Painel` | `<h1>Dashboard Contábil Integrado</h1>` |
| `AccountingJournalPage.tsx` | 80 | **Dashboard** | `Painel` | `onClick={() => (onNavigate ? onNavigate('accounting-dashboard') : window.history.back())}` |
| `AccountingLedgerPage.tsx` | 74 | **Dashboard** | `Painel` | `onClick={() => (onNavigate ? onNavigate('accounting-dashboard') : window.history.back())}` |
| `AdminHubPage.tsx` | 67 | **Dashboard** | `Painel` | `onClick={() => (onNavigate ? onNavigate('profile-dashboard' as any) : window.history.back())}` |
| `AdminHubPage.tsx` | 71 | **Dashboard** | `Painel` | `<span>Voltar ao Dashboard</span>` |
| `AuditLogsPage.tsx` | 18 | **Details** | `Detalhes` | `const matchSearch = `${log.action} ${log.userName} ${log.producerName} ${log.details} ${log.ipAddress}`` |
| `PermissionsPage.tsx` | 34 | **Edit** | `Editar` | `{ key: 'edit', label: 'Editar' },` |
| `PermissionsPage.tsx` | 35 | **Delete** | `Excluir` | `{ key: 'delete', label: 'Excluir' },` |
| `PermissionsPage.tsx` | 51 | **Delete** | `Excluir` | `initial[key] = a.key !== 'delete' // m.key === 'events';` |
| `PermissionsPage.tsx` | 57 | **Delete** | `Excluir` | `initial[key] = ['events', 'pos', 'participants'].includes(m.key) && a.key !== 'delete';` |
| `PermissionsPage.tsx` | 59 | **Delete** | `Excluir` | `initial[key] = (m.key === 'marketing' && a.key !== 'delete') // (m.key === 'events' && a.key === 'view');` |
| `UserManagerPage.tsx` | 361 | **Edit** | `Editar` | `onChange={() => togglePermission('events', 'edit')}` |
| `CommunicationPage.tsx` | 8 | **Dashboard** | `Painel` | `onClick={()=>onNavigate?onNavigate('marketing-dashboard'):window.history.back()}` |
| `CommunicationPage.tsx` | 15 | **Loading** | `Carregando` | `<div className="growth-context"><div><span>Produtora</span><strong>{producerName}</strong></div><div><span>Arquitetura</` |
| `Dashboard.tsx` | 81 | **Dashboard** | `Painel` | `title={isGlobalAdminView ? "Dashboard Administrativo Master" : `Dashboard — ${selectedProducer?.name}`}` |
| `EventContextPage.tsx` | 38 | **Search** | `Pesquisar` | `if(page==='event-global-search') return <EventGlobalSearchPage event={event} onNavigate={onNavigate} notify={notify}/>` |
| `EventContextPage.tsx` | 46 | **Readiness** | `Preparação do Evento` | `if(['event-permission-engine','event-compliance','event-readiness','event-platform-noc'].includes(page)) return <EventOS` |
| `EventContextPage.tsx` | 47 | **Dashboard** | `Painel` | `if(page==='event-dashboard') return <EventCommercialDashboardPage event={event} onNavigate={onNavigate} notify={notify}/` |
| `EventContextPage.tsx` | 51 | **Details** | `Detalhes` | `if(page==='event-details') return <Details event={event} notify={notify}/>` |
| `EventContextPage.tsx` | 171 | **Search** | `Pesquisar` | `const channels=[['Organic Search','38%'],['Social','27%'],['Direct','18%'],['Paid Search','11%'],['Referral','6%']]` |
| `EventContextPage.tsx` | 245 | **Dashboard** | `Painel` | `function Generic({event,page,onNavigate,notify}:{event:EventItem;page:PageKey;onNavigate:(p:PageKey)=>void;notify:(m:str` |
| `EventContextPage.tsx` | 247 | **Details** | `Detalhes` | `function Dashboard({event,participants,onNavigate}:{event:EventItem;participants:Participant[];onNavigate:(p:PageKey)=>v` |
| `EventContextPage.tsx` | 253 | **Details** | `Detalhes` | `function iconFor(page:PageKey){const map:Partial<Record<PageKey,any>>={'event-tickets':Ticket,'event-courtesy':CheckCirc` |
| `EventCustomer360Page.tsx` | 27 | **Customer 360** | `Cliente 360°` | `const load=useCallback(async()=>{setLoading(true);setError('');try{setData(await getEventCustomer360(event.id))}catch(e:` |
| `EventCustomer360Page.tsx` | 41 | **Customer 360** | `Cliente 360°` | `const exportCsv=()=>{if(!rows.length){notify('Nenhum cliente para exportar.');return}const csv=['Nome;Email;Telefone;Doc` |
| `EventCustomer360Page.tsx` | 48 | **Customer 360** | `Cliente 360°` | `<header className="customer360-head"><div><span>CRM · FASE 26.16.4</span><h2>Customer 360 Operacional</h2><p>Busca, segm` |
| `EventCustomer360Page.tsx` | 64 | **Customer 360** | `Cliente 360°` | `{selected&&<div className="crm-modal-bg" onClick={close}><div className="crm-modal crm-modal-wide" onClick={e=>e.stopPro` |
| `EventCustomer360Page.tsx` | 65 | **Dashboard** | `Painel` | `<div className="crm-actions"><button onClick={()=>selected.email&&copy(selected.email,'E-mail')} disabled={!selected.ema` |
| `EventCustomer360Page.tsx` | 75 | **Search** | `Pesquisar` | `<div className="crm-modal-footer"><button onClick={close}>Fechar</button><button className="primary" onClick={()=>go('ev` |
| `EventFormPage.tsx` | 6 | **Edit** | `Editar` | `mode: 'new'/'edit'` |
| `EventInventoryPage.tsx` | 238 | **Save** | `Salvar` | `<div className="inventory-modal-actions"><button className="btn secondary" onClick={()=>setShowLot(false)} disabled={sav` |
| `EventCommercialDashboardPage.tsx` | 170 | **Edit** | `Editar` | `onClick={() => onNavigate?.('edit-event')}` |
| `EventCommercialDashboardPage.tsx` | 215 | **Dashboard** | `Painel` | `onClick={() => onNavigate?.('finance-dashboard')}` |
| `EventCommercialDashboardPage.tsx` | 229 | **Dashboard** | `Painel` | `onClick={() => onNavigate?.('marketing-dashboard')}` |
| `EventCommercialDashboardPage.tsx` | 236 | **Details** | `Detalhes` | `onClick={() => onNavigate?.('event-details')}` |
| `EventCommercialDashboardPage.tsx` | 516 | **Search** | `Pesquisar` | `onClick={() => onNavigate?.('event-global-search')}` |
| `EventDayCommandPage.tsx` | 158 | **Event Day Command** | `Central do Dia do Evento` | `if (!res.ok) throw new Error('Falha ao carregar Event Day Command.')` |
| `EventDayCommandPage.tsx` | 211 | **Live Operations** | `Operação ao Vivo` | `{ id: 481, code: 'INC-00481', title: 'Falha de scanners — Portão C', category: 'Equipamento / Rede', severity: 'critical` |
| `EventDayCommandPage.tsx` | 212 | **Live Operations** | `Operação ao Vivo` | `{ id: 482, code: 'INC-00482', title: 'QR Code duplicado em catraca do Portão A', category: 'Acesso / Portaria', severity` |
| `EventDayCommandPage.tsx` | 305 | **Event Day Command** | `Central do Dia do Evento` | `<span data-testid="edc-eyebrow-badge">EVENT DAY COMMAND · FASE 26.16.7</span>` |
| `EventDayCommandPage.tsx` | 438 | **Live Operations** | `Operação ao Vivo` | `title="Clique para abrir Live Operations"` |
| `EventDayCommandPage.tsx` | 449 | **Live Operations** | `Operação ao Vivo` | `title="Clique para abrir Live Operations"` |
| `EventDayCommandPage.tsx` | 471 | **Live Operations** | `Operação ao Vivo` | `title="Clique para abrir Live Operations"` |
| `EventDayCommandPage.tsx` | 515 | **Incident Center** | `Central de Incidentes` | `title="Clique para abrir Incident Center"` |
| `EventDayCommandPage.tsx` | 650 | **Dashboard** | `Painel` | `onClick={() => onNavigate('finance-dashboard')}` |
| `EventDayCommandPage.tsx` | 766 | **Incident Center** | `Central de Incidentes` | `<h3><ShieldAlert size={16} className="text-rose-500" /> Incident Center Integrado</h3>` |
| `EventDayCommandPage.tsx` | 839 | **Activity Stream** | `Histórico de Atividades` | `<h3><Clock size={16} /> Activity Stream Operacional</h3>` |
| `EventDiskIntelligencePage.tsx` | 109 | **Revenue Intelligence** | `Inteligência de Receita` | `{ label: 'Revenue Intelligence', targetModule: 'event-revenue-intel' }` |
| `EventDiskIntelligencePage.tsx` | 143 | **Dashboard** | `Painel` | `{ label: 'Marketing', targetModule: 'marketing-dashboard' }` |
| `EventDiskIntelligencePage.tsx` | 175 | **Live Operations** | `Operação ao Vivo` | `{ label: 'Live Operations', targetModule: 'event-live-ops' },` |
