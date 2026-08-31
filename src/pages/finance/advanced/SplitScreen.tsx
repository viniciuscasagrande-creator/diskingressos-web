import React from 'react';
import FinanceSettlementHubPage from '../FinanceSettlementHubPage';

export default function SplitScreen(props: any) {
  return <FinanceSettlementHubPage {...props} initialTab="split" />;
}
