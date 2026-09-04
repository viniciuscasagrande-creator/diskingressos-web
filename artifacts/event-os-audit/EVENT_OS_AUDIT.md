# RELATÓRIO DE AUDITORIA AUTOMÁTICA — EVENT OS 360º

**Release:** `26.17.1-event-os-auditoria-automatica-2026-09-04`  
**Data da Auditoria:** 04/09/2026, 14:01:54  
**Resultado Geral:** `COMPLETED_WITH_FINDINGS`  

## Resumo Executivo

- **Módulos Analisados:** 18
- **Operacionais (>=90):** 8
- **Quase Prontos (75-89):** 10
- **Parciais (50-74):** 0
- **Críticos (25-49):** 0
- **Não Operacionais (<25):** 0
- **Ocorrências de Mock Detectadas:** 232
- **Botões sem Ação / Quebrados:** 99
- **APIs com Contrato Quebrado:** 3

## Matriz de Maturidade dos Módulos

| Módulo | Score | Status | UI | Nav | Botões | API | Dados | Tenant/RBAC | Erros | Teste |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Central de Eventos** | **96/100** | `OPERACIONAL` | 15/15 | 15/15 | 6/10 | 15/15 | 15/15 | 15/15 | 5/5 | 10/10 |
| **Cockpit 360** | **78/100** | `QUASE_PRONTO` | 15/15 | 15/15 | 8/10 | 10/15 | 15/15 | 10/15 | 5/5 | 0/10 |
| **Global Search** | **80/100** | `QUASE_PRONTO` | 15/15 | 15/15 | 10/10 | 10/15 | 15/15 | 10/15 | 5/5 | 0/10 |
| **Inventário** | **98/100** | `OPERACIONAL` | 15/15 | 15/15 | 8/10 | 15/15 | 15/15 | 15/15 | 5/5 | 10/10 |
| **Customer 360** | **88/100** | `QUASE_PRONTO` | 15/15 | 15/15 | 8/10 | 15/15 | 15/15 | 15/15 | 5/5 | 0/10 |
| **Live Operations** | **79/100** | `QUASE_PRONTO` | 15/15 | 15/15 | 6/10 | 8/15 | 15/15 | 15/15 | 5/5 | 0/10 |
| **Incident Center** | **75/100** | `QUASE_PRONTO` | 15/15 | 15/15 | 2/10 | 8/15 | 15/15 | 15/15 | 5/5 | 0/10 |
| **Event Day Command** | **83/100** | `QUASE_PRONTO` | 15/15 | 15/15 | 0/10 | 8/15 | 15/15 | 15/15 | 5/5 | 10/10 |
| **Revenue & Pricing** | **84/100** | `QUASE_PRONTO` | 15/15 | 15/15 | 4/10 | 15/15 | 15/15 | 15/15 | 5/5 | 0/10 |
| **Readiness / Go-Live** | **80/100** | `QUASE_PRONTO` | 15/15 | 15/15 | 10/10 | 10/15 | 15/15 | 10/15 | 5/5 | 0/10 |
| **Forecast Center** | **93/100** | `OPERACIONAL` | 15/15 | 15/15 | 10/10 | 8/15 | 15/15 | 15/15 | 5/5 | 10/10 |
| **Disk Intelligence** | **98/100** | `OPERACIONAL` | 15/15 | 15/15 | 8/10 | 15/15 | 15/15 | 15/15 | 5/5 | 10/10 |
| **Executive Dashboard** | **100/100** | `OPERACIONAL` | 15/15 | 15/15 | 10/10 | 15/15 | 15/15 | 15/15 | 5/5 | 10/10 |
| **Platform Operations / NOC** | **80/100** | `QUASE_PRONTO` | 15/15 | 15/15 | 10/10 | 10/15 | 15/15 | 10/15 | 5/5 | 0/10 |
| **Financeiro** | **80/100** | `QUASE_PRONTO` | 15/15 | 15/15 | 0/10 | 15/15 | 15/15 | 15/15 | 5/5 | 0/10 |
| **Estornos** | **93/100** | `OPERACIONAL` | 15/15 | 15/15 | 10/10 | 8/15 | 15/15 | 15/15 | 5/5 | 10/10 |
| **Marketing** | **90/100** | `OPERACIONAL` | 15/15 | 15/15 | 10/10 | 15/15 | 15/15 | 15/15 | 5/5 | 0/10 |
| **SAC** | **90/100** | `OPERACIONAL` | 15/15 | 15/15 | 10/10 | 15/15 | 15/15 | 15/15 | 5/5 | 0/10 |

## Achados Críticos e Bloqueadores (102)

- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "accounting-dashboard"
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "accounting-dashboard"
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "admin-hub"
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "profile-dashboard"
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "profile-dashboard"
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "finance-payouts"
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "accounting-dashboard"
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "finance-payouts"
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "marketing-create"
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "profile-dashboard"
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "admin-hub"
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "profile-dashboard"
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "admin-hub"
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "profile-dashboard"
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "remarketing-carts"
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "remarketing-dashboard"
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "profile-dashboard"
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "remarketing-flows"
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "admin-hub"
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "profile-dashboard"
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `NAV_TARGET_MISSING` em **Global**: Navegação para PageKey desconhecida: "admin-hub"
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `BUTTON_WITHOUT_ACTION` em **Global**: Elemento <button> sem handler onClick nem type="submit".
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[HIGH]** `EMPTY_CLICK_HANDLER` em **Global**: Handler onClick vazio detectado: onClick={() => {}}
- **[CRITICAL]** `API_CONTRACT_BROKEN` em **live-operations**: Endpoint GET /events/:id/live-ops/overview com contrato quebrado.
- **[CRITICAL]** `API_CONTRACT_BROKEN` em **event-day-command**: Endpoint GET /events/:id/day-command/overview com contrato quebrado.
- **[CRITICAL]** `API_CONTRACT_BROKEN` em **estornos**: Endpoint GET /refunds com contrato quebrado.
