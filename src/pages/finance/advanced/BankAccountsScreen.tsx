import React from 'react';
import FinanceBankAccountsPage from '../../FinanceBankAccountsPage';

export default function BankAccountsScreen(props: any) {
  return (
    <FinanceBankAccountsPage
      events={props.events || []}
      notify={props.notify || (() => {})}
      onNavigate={props.onNavigate}
    />
  );
}
