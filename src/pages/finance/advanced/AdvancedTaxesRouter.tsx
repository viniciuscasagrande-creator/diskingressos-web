import React from 'react';
import AdvancedFinanceHome from './AdvancedFinanceHome';
import SpreadScreen from './SpreadScreen'; import SplitScreen from './SplitScreen';
import BankAccountsScreen from './BankAccountsScreen'; import MethodsScreen from './MethodsScreen';
import OperatorsScreen from './OperatorsScreen'; import GatewaysScreen from './GatewaysScreen';
import IntelligenceScreen from './IntelligenceScreen'; import RefundsScreen from './RefundsScreen';

export default function AdvancedTaxesRouter({activeModule,onNavigate,...props}:any){
 switch(activeModule){
  case 'fin-advanced': return <AdvancedFinanceHome onNavigate={onNavigate}/>;
  case 'fin-spread': case 'simulador-spread': return <SpreadScreen {...props}/>;
  case 'fin-split': case 'split-financeiro': return <SplitScreen/>;
  case 'fin-bank-accounts': case 'contas-bancarias': return <BankAccountsScreen/>;
  case 'fin-methods': case 'metodos-pagamento': return <MethodsScreen {...props}/>;
  case 'fin-operators': case 'operadoras-cartao': return <OperatorsScreen {...props}/>;
  case 'fin-gateways': case 'gateway-pagamentos': return <GatewaysScreen {...props}/>;
  case 'fin-inteligencia': case 'inteligencia-financeira': return <IntelligenceScreen {...props}/>;
  case 'fin-refunds': case 'devolucoes-estornos': return <RefundsScreen {...props}/>;
  default:return null;
 }
}