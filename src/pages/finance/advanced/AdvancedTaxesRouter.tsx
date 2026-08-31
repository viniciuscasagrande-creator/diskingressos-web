import React from 'react';
import AdvancedFinanceHome from './AdvancedFinanceHome';
import SpreadScreen from './SpreadScreen'; import SplitScreen from './SplitScreen';
import BankAccountsScreen from './BankAccountsScreen'; import MethodsScreen from './MethodsScreen';
import OperatorsScreen from './OperatorsScreen'; import GatewaysScreen from './GatewaysScreen';
import IntelligenceScreen from './IntelligenceScreen'; import RefundsScreen from './RefundsScreen';

export default function AdvancedTaxesRouter({ activeModule, onNavigate, ...props }: any) {
  switch (activeModule) {
    case 'fin-advanced':
    case 'finance-advanced':
    case 'advanced':
      return <AdvancedFinanceHome onNavigate={onNavigate} {...props} />;
    case 'fin-spread':
    case 'simulador-spread':
    case 'finance-spread':
      return <SpreadScreen onNavigate={onNavigate} {...props} />;
    case 'fin-split':
    case 'split-financeiro':
    case 'finance-split':
      return <SplitScreen onNavigate={onNavigate} {...props} />;
    case 'fin-bank-accounts':
    case 'contas-bancarias':
    case 'finance-bank-accounts':
      return <BankAccountsScreen onNavigate={onNavigate} {...props} />;
    case 'fin-methods':
    case 'metodos-pagamento':
    case 'finance-methods':
      return <MethodsScreen onNavigate={onNavigate} {...props} />;
    case 'fin-operators':
    case 'operadoras-cartao':
    case 'finance-operators':
    case 'finance-rates':
      return <OperatorsScreen onNavigate={onNavigate} {...props} />;
    case 'fin-gateways':
    case 'gateway-pagamentos':
    case 'finance-gateways':
      return <GatewaysScreen onNavigate={onNavigate} {...props} />;
    case 'fin-inteligencia':
    case 'inteligencia-financeira':
    case 'finance-intelligence':
      return <IntelligenceScreen onNavigate={onNavigate} {...props} />;
    case 'fin-refunds':
    case 'devolucoes-estornos':
    case 'finance-refunds':
    case 'finance-disputes':
    case 'finance-chargebacks':
      return <RefundsScreen onNavigate={onNavigate} {...props} />;
    default:
      return null;
  }
}