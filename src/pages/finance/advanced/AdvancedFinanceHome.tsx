import React from 'react'; import {Box,Props} from './shared';
export default function AdvancedFinanceHome({onNavigate}:Props){const cards=[
['Spread & Simulador','fin-spread','MDR, custos, margem e comparação'],
['Split Financeiro','fin-split','Regras e beneficiários'],
['Contas Bancárias','fin-bank-accounts','Contas de liquidação e repasse'],
['Métodos de Pagamento','fin-methods','PIX, crédito, débito e boleto'],
['Operadoras & Adquirentes','fin-operators','MDR, D+, antecipação e parcelamento'],
['Gateways','fin-gateways','Ambiente, configuração e validação'],
['Inteligência Financeira','fin-inteligencia','Margem, custos e alertas'],
['Devoluções & Estornos','fin-refunds','Solicitação, aprovação e processamento']
];return <div className="fat-page"><header><small>FINANCEIRO</small><h1>Advanced & Taxas</h1><p>Central operacional das configurações financeiras avançadas.</p></header><div className="fat-grid">{cards.map(c=><button className="fat-nav-card" key={c[1]} onClick={()=>onNavigate?.(c[1])}><strong>{c[0]}</strong><span>{c[2]}</span><b>Abrir →</b></button>)}</div><Box title="Fluxo integrado"><div className="fat-flow">Gateway → Adquirente → Método → Taxas → Spread → Split → Conta → Repasse</div></Box></div>}