import React from 'react'
import FinanceSpread360Page from '../../FinanceSpread360Page'
import FinanceBankAccountsPage from '../../FinanceBankAccountsPage'
import FinancePayments360Page from '../../FinancePayments360Page'
import FinanceOperations360Page from '../../FinanceOperations360Page'
import FinanceSettlementHubPage from '../FinanceSettlementHubPage'
import FinanceDisputesHubPage from '../FinanceDisputesHubPage'
import FinanceAdvancedCommandPage from '../FinanceAdvancedCommandPage'
import FinanceReportsExecutivePage from '../FinanceReportsExecutivePage'

export default function AdvancedTaxesRouter({ activeModule, onNavigate, ...props }: any) {
  switch (activeModule) {
    case 'fin-advanced':
    case 'finance-advanced':
    case 'advanced':
      return <FinanceAdvancedCommandPage onNavigate={onNavigate} {...props} />
    case 'fin-spread':
    case 'simulador-spread':
    case 'finance-spread':
      return <FinanceSpread360Page onNavigate={onNavigate} {...props} />
    case 'fin-split':
    case 'split-financeiro':
    case 'finance-split':
      return <FinanceSettlementHubPage initialTab="split" onNavigate={onNavigate} {...props} />
    case 'fin-bank-accounts':
    case 'contas-bancarias':
    case 'finance-bank-accounts':
      return <FinanceBankAccountsPage events={props.events || []} notify={props.notify} onNavigate={onNavigate} />
    case 'fin-methods':
    case 'metodos-pagamento':
    case 'finance-methods':
      return <FinancePayments360Page initialTab="methods" notify={props.notify} {...props} />
    case 'fin-custom':
    case 'pagamentos-customizados':
    case 'finance-custom':
      return <FinancePayments360Page initialTab="custom" notify={props.notify} {...props} />
    case 'fin-negotiations':
    case 'negociacoes-financeiras':
    case 'finance-negotiations':
      return <FinancePayments360Page initialTab="negotiations" notify={props.notify} {...props} />
    case 'fin-operators':
    case 'operadoras-cartao':
    case 'finance-operators':
    case 'finance-rates':
      return <FinancePayments360Page initialTab="operators" notify={props.notify} {...props} />
    case 'fin-gateways':
    case 'gateway-pagamentos':
    case 'finance-gateways':
      return <FinancePayments360Page initialTab="gateways" notify={props.notify} {...props} />
    case 'fin-inteligencia':
    case 'inteligencia-financeira':
    case 'finance-intelligence':
      return <FinanceOperations360Page initialTab="intelligence" notify={props.notify} {...props} />
    case 'fin-refunds':
    case 'devolucoes-estornos':
    case 'finance-refunds':
    case 'finance-disputes':
    case 'finance-chargebacks':
      return <FinanceDisputesHubPage initialTab="refunds" notify={props.notify} {...props} />
    case 'fin-reports':
    case 'relatorios-financeiros':
    case 'finance-reports':
      return <FinanceReportsExecutivePage events={props.events || []} producerId={props.producerId} notify={props.notify} onBack={() => onNavigate?.('finance-dashboard')} />
    default:
      return null
  }
}