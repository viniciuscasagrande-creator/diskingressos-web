import React from 'react'
import FinanceSimulatorPage from '../FinanceSimulatorPage'
import FinanceConciliationPage from '../FinanceConciliationPage'
import FinanceSpreadPage from '../FinanceSpreadPage'
import FinanceBankAccountsPage from '../../FinanceBankAccountsPage'
import FinancePayMethodsPage from '../FinancePayMethodsPage'
import FinanceCustomPayPage from '../FinanceCustomPayPage'
import FinanceNegotiationsPage from '../FinanceNegotiationsPage'
import FinanceOperatorsGatewaysPage from '../FinanceOperatorsGatewaysPage'
import FinanceIntelligencePage from '../FinanceIntelligencePage'
import FinanceRefundsPage from '../FinanceRefundsPage'
import FinanceAdvancedPage from '../FinanceAdvancedPage'
import FinanceSplitPage from '../FinanceSplitPage'
import FinancePDVPage from '../FinancePDVPage'
import FinanceReportsExecutivePage from '../FinanceReportsExecutivePage'

export default function AdvancedTaxesRouter({ activeModule, onNavigate, onBack, ...props }: any) {
  const handleBack = onBack || (() => onNavigate?.('finance-dashboard'))

  switch (activeModule) {
    case 'fin-advanced':
    case 'finance-advanced':
    case 'advanced':
      return <FinanceAdvancedPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'fin-pdv':
    case 'finance-pdv':
    case 'pdv':
      return <FinancePDVPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'fin-spread':
    case 'finance-spread':
    case 'spread':
      return <FinanceSpreadPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'simulador-spread':
    case 'finance-spread-simulator':
    case 'simulador':
      return <FinanceSimulatorPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'fin-conciliacao':
    case 'conciliacao-bancaria':
    case 'finance-reconciliation':
    case 'conciliacao':
      return <FinanceConciliationPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'fin-split':
    case 'split-financeiro':
    case 'finance-split':
    case 'split':
      return <FinanceSplitPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'fin-bank-accounts':
    case 'contas-bancarias':
    case 'finance-bank-accounts':
    case 'fin-contas':
      return <FinanceBankAccountsPage events={props.events || []} notify={props.notify} onNavigate={onNavigate} />

    case 'fin-methods':
    case 'metodos-pagamento':
    case 'finance-methods':
      return <FinancePayMethodsPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'fin-custom':
    case 'pagamentos-customizados':
    case 'finance-custom':
      return <FinanceCustomPayPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'fin-negotiations':
    case 'negociacoes-financeiras':
    case 'finance-negotiations':
      return <FinanceNegotiationsPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'fin-operators':
    case 'operadoras-cartao':
    case 'finance-operators':
    case 'finance-rates':
    case 'fin-gateways':
    case 'gateway-pagamentos':
    case 'finance-gateways':
      return <FinanceOperatorsGatewaysPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'fin-inteligencia':
    case 'inteligencia-financeira':
    case 'finance-intelligence':
      return <FinanceIntelligencePage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'fin-refunds':
    case 'devolucoes-estornos':
    case 'finance-refunds':
    case 'finance-disputes':
    case 'finance-chargebacks':
      return <FinanceRefundsPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />

    case 'fin-reports':
    case 'relatorios-financeiros':
    case 'finance-reports':
      return <FinanceReportsExecutivePage events={props.events || []} producerId={props.producerId} notify={props.notify} onBack={handleBack} />

    default:
      return <FinanceAdvancedPage notify={props.notify} onBack={handleBack} onNavigate={onNavigate} />
  }
}
