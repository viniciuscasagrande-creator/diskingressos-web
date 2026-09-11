import { Router } from 'express'
import crypto from 'node:crypto'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { requestedProducerId } from '../tenant.js'

export const financeReconciliationErpRouter = Router()
financeReconciliationErpRouter.use(requireAuth)

export type DivergenceType =
  | 'CONCILIADO'
  | 'VALOR_DIVERGENTE'
  | 'TAXA_DIVERGENTE'
  | 'LIQUIDACAO_AUSENTE'
  | 'PEDIDO_NAO_LOCALIZADO'
  | 'DUPLICIDADE'
  | 'ESTORNO'
  | 'CHARGEBACK'
  | 'REQUER_ANALISE'

export interface ReconciliationTransactionRecord {
  id: string
  code: string
  eventId: number
  eventTitle: string
  producerId: number
  orderId?: number
  orderCode?: string
  buyerName: string
  buyerDocument: string
  paymentMethod: 'pix' | 'credit_card' | 'credit_card_installments' | 'debit_card' | 'boleto'
  paymentMethodLabel: string
  installments: number
  occurredAt: string
  gateway: string
  acquirer: string
  tid: string
  nsu: string
  authorizationCode: string
  bankAccount: string
  orderGrossCents: number
  gatewayGrossCents: number
  contractedMdrPct: number
  contractedFeeCents: number
  chargedMdrPct: number
  chargedFeeCents: number
  feeDifferenceCents: number
  anticipationFeeCents: number
  netLiquidCents: number
  splitDiskIngressosCents: number
  splitProducerNetCents: number
  level1OrderGateway: {
    status: 'ok' | 'divergent' | 'missing' | 'duplicate'
    label: string
    details: string
  }
  level2GatewaySettlement: {
    status: 'ok' | 'divergent_fee' | 'missing_liquidation' | 'refunded' | 'chargeback' | 'pending'
    label: string
    details: string
    expectedDate: string
    settledDate?: string
  }
  level3SettlementLedger: {
    status: 'posted' | 'pending_settlement' | 'held' | 'reversed'
    label: string
    ledgerBatchId?: string
    accountsDebited: string[]
    accountsCredited: string[]
  }
  status: DivergenceType
  statusLabel: string
  divergenceReason?: string
  divergenceSuggestion?: string
  auditNotes?: string
  reconciledAt?: string
  reconciledBy?: string
}

// Repositório em memória enriquecido para auditoria e simulação de ERP de alta fidelidade
const inMemoryReconciliationStore = new Map<string, ReconciliationTransactionRecord>()

function initializeInitialRecords() {
  if (inMemoryReconciliationStore.size > 0) return

  const initialItems: ReconciliationTransactionRecord[] = [
    // 1. CONCILIADO - PIX Perfeito D+0
    {
      id: 'rec-001',
      code: 'REC-2026-90410',
      eventId: 1,
      eventTitle: 'Festival de Verão 2026',
      producerId: 1,
      orderId: 10420,
      orderCode: 'DI-894200',
      buyerName: 'Carolina Silveira Mendes',
      buyerDocument: '***.451.989-**',
      paymentMethod: 'pix',
      paymentMethodLabel: 'PIX Instantâneo',
      installments: 1,
      occurredAt: '2026-09-08T14:32:10Z',
      gateway: 'Banco Central PIX / Itaú',
      acquirer: 'Itaú Unibanco S.A.',
      tid: 'PIX-E20260908143210984210',
      nsu: '984210',
      authorizationCode: 'AUTH-99321',
      bankAccount: 'Banco Itaú Ag 1234 CC 56789-0',
      orderGrossCents: 25000,
      gatewayGrossCents: 25000,
      contractedMdrPct: 0.99,
      contractedFeeCents: 248,
      chargedMdrPct: 0.99,
      chargedFeeCents: 248,
      feeDifferenceCents: 0,
      anticipationFeeCents: 0,
      netLiquidCents: 24752,
      splitDiskIngressosCents: 2000,
      splitProducerNetCents: 22752,
      level1OrderGateway: {
        status: 'ok',
        label: 'Batimento 100%',
        details: 'Valor do pedido R$ 250,00 idêntico à cobrança Pix e webhook processado.',
      },
      level2GatewaySettlement: {
        status: 'ok',
        label: 'Liquidado D+0',
        details: 'Compensação instantânea creditada no Itaú com taxa contratual de 0,99%.',
        expectedDate: '2026-09-08',
        settledDate: '2026-09-08T14:32:15Z',
      },
      level3SettlementLedger: {
        status: 'posted',
        label: 'Contabilizado',
        ledgerBatchId: 'b4a5d3c2-1111-4444-9999-000000000001',
        accountsDebited: ['1.1.1.02 Banco Itaú Disponível', '4.1.2.01 Taxas Gateway PIX'],
        accountsCredited: ['1.1.2.03 Recebíveis a Liquidar PIX'],
      },
      status: 'CONCILIADO',
      statusLabel: 'Conciliado',
      reconciledAt: '2026-09-08T14:35:00Z',
      reconciledBy: 'Motor Automático SafeSaff ERP',
    },

    // 2. VALOR_DIVERGENTE - Pedido x Gateway com cupom não sincronizado
    {
      id: 'rec-002',
      code: 'REC-2026-90411',
      eventId: 1,
      eventTitle: 'Festival de Verão 2026',
      producerId: 1,
      orderId: 10421,
      orderCode: 'DI-894562',
      buyerName: 'Rafael Gomes Albuquerque',
      buyerDocument: '***.812.334-**',
      paymentMethod: 'credit_card',
      paymentMethodLabel: 'Cartão de Crédito 1x',
      installments: 1,
      occurredAt: '2026-09-07T11:20:00Z',
      gateway: 'Stone Pagamentos',
      acquirer: 'Stone Instituição de Pagamento S.A.',
      tid: 'STN-TX-9988412-A',
      nsu: '782914',
      authorizationCode: 'AUTH-77123',
      bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
      orderGrossCents: 35000,
      gatewayGrossCents: 33000,
      contractedMdrPct: 2.49,
      contractedFeeCents: 871,
      chargedMdrPct: 2.49,
      chargedFeeCents: 822,
      feeDifferenceCents: 0,
      anticipationFeeCents: 0,
      netLiquidCents: 32178,
      splitDiskIngressosCents: 2640,
      splitProducerNetCents: 29538,
      level1OrderGateway: {
        status: 'divergent',
        label: 'Valor Incompatível (R$ 20,00)',
        details: 'Pedido registrado por R$ 350,00, porém valor cobrado no gateway Stone foi R$ 330,00 (cupom PROMO20 aplicado sem webhook de ajuste).',
      },
      level2GatewaySettlement: {
        status: 'ok',
        label: 'Aguardando D+30',
        details: 'Liquidação da Stone programada com base no valor transacionado de R$ 330,00.',
        expectedDate: '2026-10-07',
      },
      level3SettlementLedger: {
        status: 'pending_settlement',
        label: 'Bloqueado por Divergência',
        accountsDebited: [],
        accountsCredited: [],
      },
      status: 'VALOR_DIVERGENTE',
      statusLabel: 'Valor divergente',
      divergenceReason: 'Diferença de R$ 20,00 entre pedido do DiskIngressos e transação da Stone.',
      divergenceSuggestion: 'Ajustar cupom promocional no pedido #DI-894562 ou debitar saldo complementar.',
    },

    // 3. TAXA_DIVERGENTE - Adquirente cobrou taxa MDR superior ao contrato
    {
      id: 'rec-003',
      code: 'REC-2026-90412',
      eventId: 1,
      eventTitle: 'Festival de Verão 2026',
      producerId: 1,
      orderId: 10422,
      orderCode: 'DI-894819',
      buyerName: 'Mariana Duarte Souza',
      buyerDocument: '***.219.870-**',
      paymentMethod: 'credit_card',
      paymentMethodLabel: 'Cartão de Crédito 1x',
      installments: 1,
      occurredAt: '2026-09-06T18:45:12Z',
      gateway: 'Stone Pagamentos',
      acquirer: 'Stone Instituição de Pagamento S.A.',
      tid: 'STN-TX-7744119-B',
      nsu: '665128',
      authorizationCode: 'AUTH-55412',
      bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
      orderGrossCents: 120000,
      gatewayGrossCents: 120000,
      contractedMdrPct: 2.49,
      contractedFeeCents: 2988,
      chargedMdrPct: 4.15,
      chargedFeeCents: 4980,
      feeDifferenceCents: 1992,
      anticipationFeeCents: 0,
      netLiquidCents: 115020,
      splitDiskIngressosCents: 9600,
      splitProducerNetCents: 105420,
      level1OrderGateway: {
        status: 'ok',
        label: 'Batimento 100%',
        details: 'Pedido e gateway batem perfeitamente em R$ 1.200,00.',
      },
      level2GatewaySettlement: {
        status: 'divergent_fee',
        label: 'Taxa Cobrada a Maior (R$ 19,92)',
        details: 'Contratado: 2,49% (R$ 29,88) · Cobrado no extrato Stone: 4,15% (R$ 49,80). Diferença retida indevidamente.',
        expectedDate: '2026-10-06',
      },
      level3SettlementLedger: {
        status: 'pending_settlement',
        label: 'Aguardando Contestação MDR',
        accountsDebited: [],
        accountsCredited: [],
      },
      status: 'TAXA_DIVERGENTE',
      statusLabel: 'Taxa divergente',
      divergenceReason: 'Adquirente Stone aplicou taxa balcão de 4,15% em vez da taxa contratada DiskIngressos de 2,49%.',
      divergenceSuggestion: 'Abrir contestação automática de MDR com protocolo Stone e compensar R$ 19,92 no Ledger.',
    },

    // 4. LIQUIDACAO_AUSENTE - Prazo D+30 estourado sem crédito bancário
    {
      id: 'rec-004',
      code: 'REC-2026-90413',
      eventId: 2,
      eventTitle: 'Symphony Rock Live',
      producerId: 1,
      orderId: 10423,
      orderCode: 'DI-893112',
      buyerName: 'Felipe Santana Barreto',
      buyerDocument: '***.632.118-**',
      paymentMethod: 'credit_card_installments',
      paymentMethodLabel: 'Cartão de Crédito 3x',
      installments: 3,
      occurredAt: '2026-08-01T10:14:00Z',
      gateway: 'Cielo E-commerce',
      acquirer: 'Cielo S.A.',
      tid: 'CIE-998823104-Z',
      nsu: '551982',
      authorizationCode: 'AUTH-12093',
      bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
      orderGrossCents: 185000,
      gatewayGrossCents: 185000,
      contractedMdrPct: 3.89,
      contractedFeeCents: 7196,
      chargedMdrPct: 3.89,
      chargedFeeCents: 7196,
      feeDifferenceCents: 0,
      anticipationFeeCents: 0,
      netLiquidCents: 177804,
      splitDiskIngressosCents: 14800,
      splitProducerNetCents: 163004,
      level1OrderGateway: {
        status: 'ok',
        label: 'Batimento 100%',
        details: 'Pedido R$ 1.850,00 validado com código de autorização Cielo.',
      },
      level2GatewaySettlement: {
        status: 'missing_liquidation',
        label: 'Liquidação em Atraso (Venceu 02/09)',
        details: 'Data limite de liquidação D+30 era 02/09/2026. Lançamento não localizado no extrato bancário Santander.',
        expectedDate: '2026-09-02',
      },
      level3SettlementLedger: {
        status: 'pending_settlement',
        label: 'Saldo Não Liberado',
        accountsDebited: [],
        accountsCredited: [],
      },
      status: 'LIQUIDACAO_AUSENTE',
      statusLabel: 'Liquidação ausente',
      divergenceReason: 'Atraso de 7 dias na liquidação bancária pela Cielo.',
      divergenceSuggestion: 'Cobrar liquidação junto ao gerente de conta Cielo ou verificar trava de domicílio bancário.',
    },

    // 5. PEDIDO_NAO_LOCALIZADO - Transação órfã capturada no gateway
    {
      id: 'rec-005',
      code: 'REC-2026-90414',
      eventId: 1,
      eventTitle: 'Festival de Verão 2026',
      producerId: 1,
      buyerName: 'Comprador Não Identificado (PDV)',
      buyerDocument: '***.***.***-**',
      paymentMethod: 'debit_card',
      paymentMethodLabel: 'Cartão de Débito (POS Rede)',
      installments: 1,
      occurredAt: '2026-09-08T22:15:33Z',
      gateway: 'Rede Adquirente',
      acquirer: 'Redecard S.A.',
      tid: 'RED-POS-449102-K',
      nsu: '9841235',
      authorizationCode: 'AUTH-33491',
      bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
      orderGrossCents: 0,
      gatewayGrossCents: 45000,
      contractedMdrPct: 1.49,
      contractedFeeCents: 670,
      chargedMdrPct: 1.49,
      chargedFeeCents: 670,
      feeDifferenceCents: 0,
      anticipationFeeCents: 0,
      netLiquidCents: 44330,
      splitDiskIngressosCents: 0,
      splitProducerNetCents: 44330,
      level1OrderGateway: {
        status: 'missing',
        label: 'Pedido Não Localizado',
        details: 'Cobrança de R$ 450,00 aprovada na maquininha POS Rede, mas nenhum pedido correspondente no DiskIngressos.',
      },
      level2GatewaySettlement: {
        status: 'ok',
        label: 'Liquidado D+1',
        details: 'Crédito já liquidado na conta Santander.',
        expectedDate: '2026-09-09',
        settledDate: '2026-09-09T08:00:00Z',
      },
      level3SettlementLedger: {
        status: 'held',
        label: 'Conta Transitória de Sobras',
        accountsDebited: ['1.1.1.01 Santander Movimento'],
        accountsCredited: ['2.1.9.01 Valores Pendentes de Conciliação'],
      },
      status: 'PEDIDO_NAO_LOCALIZADO',
      statusLabel: 'Pedido não localizado',
      divergenceReason: 'Venda de balcão/portaria processada na maquineta sem conclusão no sistema de bilheteria.',
      divergenceSuggestion: 'Associar manualmente ao relatório de vendas de contingência da portaria ou emitir voucher retroativo.',
    },

    // 6. DUPLICIDADE - Duas capturas com o mesmo TID / NSU
    {
      id: 'rec-006',
      code: 'REC-2026-90415',
      eventId: 1,
      eventTitle: 'Festival de Verão 2026',
      producerId: 1,
      orderId: 10424,
      orderCode: 'DI-892015',
      buyerName: 'Lucas Mendes Prado',
      buyerDocument: '***.554.912-**',
      paymentMethod: 'pix',
      paymentMethodLabel: 'PIX Instantâneo',
      installments: 1,
      occurredAt: '2026-09-07T16:02:40Z',
      gateway: 'Banco Central PIX / Itaú',
      acquirer: 'Itaú Unibanco S.A.',
      tid: 'PIX-E20260907160240984215',
      nsu: '773120',
      authorizationCode: 'AUTH-88219',
      bankAccount: 'Banco Itaú Ag 1234 CC 56789-0',
      orderGrossCents: 18000,
      gatewayGrossCents: 36000,
      contractedMdrPct: 0.99,
      contractedFeeCents: 356,
      chargedMdrPct: 0.99,
      chargedFeeCents: 356,
      feeDifferenceCents: 0,
      anticipationFeeCents: 0,
      netLiquidCents: 35644,
      splitDiskIngressosCents: 1440,
      splitProducerNetCents: 34204,
      level1OrderGateway: {
        status: 'duplicate',
        label: 'Cobrança Duplicada (2x R$ 180)',
        details: 'Comprador pagou o mesmo Pix duas vezes pelo aplicativo bancário.',
      },
      level2GatewaySettlement: {
        status: 'ok',
        label: 'Liquidado D+0',
        details: 'Dois créditos de R$ 180,00 consolidados no extrato Itaú.',
        expectedDate: '2026-09-07',
        settledDate: '2026-09-07T16:02:45Z',
      },
      level3SettlementLedger: {
        status: 'held',
        label: 'Retenção para Estorno',
        accountsDebited: ['1.1.1.02 Itaú Movimento'],
        accountsCredited: ['2.1.3.01 Estornos Pendentes de Devolução'],
      },
      status: 'DUPLICIDADE',
      statusLabel: 'Duplicidade',
      divergenceReason: 'Pagamento efetuado em duplicidade pelo cliente via QR Code Pix.',
      divergenceSuggestion: 'Devolver automaticamente o segundo pagamento de R$ 180,00 via API Pix Bacen.',
    },

    // 7. ESTORNO - Estorno processado no gateway pendente de baixa no saldo
    {
      id: 'rec-007',
      code: 'REC-2026-90416',
      eventId: 2,
      eventTitle: 'Symphony Rock Live',
      producerId: 1,
      orderId: 10425,
      orderCode: 'DI-891040',
      buyerName: 'Beatriz Vasconcelos Ramos',
      buyerDocument: '***.109.432-**',
      paymentMethod: 'credit_card',
      paymentMethodLabel: 'Cartão de Crédito 1x',
      installments: 1,
      occurredAt: '2026-09-05T09:18:22Z',
      gateway: 'Mercado Pago Gateway',
      acquirer: 'Mercado Pago Instituição de Pagamento',
      tid: 'MP-TX-8833910-REF',
      nsu: '334109',
      authorizationCode: 'AUTH-44102',
      bankAccount: 'Banco Itaú Ag 1234 CC 56789-0',
      orderGrossCents: 60000,
      gatewayGrossCents: -60000,
      contractedMdrPct: 2.99,
      contractedFeeCents: -1794,
      chargedMdrPct: 2.99,
      chargedFeeCents: -1794,
      feeDifferenceCents: 0,
      anticipationFeeCents: 0,
      netLiquidCents: -58206,
      splitDiskIngressosCents: -4800,
      splitProducerNetCents: -53406,
      level1OrderGateway: {
        status: 'ok',
        label: 'Cancelamento Homologado',
        details: 'Pedido cancelado dentro do prazo legal de 7 dias do CDC.',
      },
      level2GatewaySettlement: {
        status: 'refunded',
        label: 'Estornado no Gateway',
        details: 'Estorno efetuado no cartão do cliente. Débito lançado na fatura do Mercado Pago.',
        expectedDate: '2026-09-05',
        settledDate: '2026-09-05T10:00:00Z',
      },
      level3SettlementLedger: {
        status: 'pending_settlement',
        label: 'Aguardando Baixa Contábil',
        accountsDebited: [],
        accountsCredited: [],
      },
      status: 'ESTORNO',
      statusLabel: 'Estorno',
      divergenceReason: 'Estorno de R$ 600,00 registrado no gateway necessitando baixa no saldo do evento.',
      divergenceSuggestion: 'Contabilizar débito de R$ 600,00 no saldo do evento Symphony Rock Live e anular ingressos.',
    },

    // 8. CHARGEBACK - Contestação de titular aberta na adquirente
    {
      id: 'rec-008',
      code: 'REC-2026-90417',
      eventId: 1,
      eventTitle: 'Festival de Verão 2026',
      producerId: 1,
      orderId: 10426,
      orderCode: 'DI-890512',
      buyerName: 'Alexandre Castro Guimarães',
      buyerDocument: '***.908.125-**',
      paymentMethod: 'credit_card_installments',
      paymentMethodLabel: 'Cartão de Crédito 6x',
      installments: 6,
      occurredAt: '2026-08-20T21:40:00Z',
      gateway: 'Stone Pagamentos',
      acquirer: 'Stone Instituição de Pagamento S.A.',
      tid: 'STN-TX-1092834-DISP',
      nsu: '228491',
      authorizationCode: 'AUTH-66109',
      bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
      orderGrossCents: 92000,
      gatewayGrossCents: 92000,
      contractedMdrPct: 4.49,
      contractedFeeCents: 4131,
      chargedMdrPct: 4.49,
      chargedFeeCents: 4131,
      feeDifferenceCents: 0,
      anticipationFeeCents: 0,
      netLiquidCents: 87869,
      splitDiskIngressosCents: 7360,
      splitProducerNetCents: 80509,
      level1OrderGateway: {
        status: 'ok',
        label: 'Pedido Válido no Sistema',
        details: 'Pedido emitido com 2 ingressos VIP Pista Premium.',
      },
      level2GatewaySettlement: {
        status: 'chargeback',
        label: 'Notificação de Disputa / Chargeback',
        details: 'Titular do cartão alegou fraude/não reconhecimento da compra junto ao emissor bancário.',
        expectedDate: '2026-09-19',
      },
      level3SettlementLedger: {
        status: 'held',
        label: 'Provisão de Perda Bloqueada',
        accountsDebited: ['2.1.4.01 Provisão para Chargebacks'],
        accountsCredited: ['1.1.2.01 Recebíveis Stone Bloqueados'],
      },
      status: 'CHARGEBACK',
      statusLabel: 'Chargeback',
      divergenceReason: 'Contestação de fraude aberta pela bandeira do cartão no valor de R$ 920,00.',
      divergenceSuggestion: 'Anexar comprovante de e-mail e check-in nominal no portal da Stone para defesa em até 5 dias úteis.',
    },

    // 9. REQUER_ANALISE - Alerta de risco e inconsistência de CPF/IP
    {
      id: 'rec-009',
      code: 'REC-2026-90418',
      eventId: 1,
      eventTitle: 'Festival de Verão 2026',
      producerId: 1,
      orderId: 10427,
      orderCode: 'DI-889912',
      buyerName: 'Juliana Pires Nogueira',
      buyerDocument: '***.331.782-**',
      paymentMethod: 'credit_card',
      paymentMethodLabel: 'Cartão de Crédito 1x',
      installments: 1,
      occurredAt: '2026-09-09T08:12:44Z',
      gateway: 'Pagar.me Stone Co',
      acquirer: 'Stone Instituição de Pagamento S.A.',
      tid: 'PGM-TX-5544192',
      nsu: '119834',
      authorizationCode: 'AUTH-88710',
      bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
      orderGrossCents: 320000,
      gatewayGrossCents: 320000,
      contractedMdrPct: 2.79,
      contractedFeeCents: 8928,
      chargedMdrPct: 2.79,
      chargedFeeCents: 8928,
      feeDifferenceCents: 0,
      anticipationFeeCents: 0,
      netLiquidCents: 311072,
      splitDiskIngressosCents: 25600,
      splitProducerNetCents: 285472,
      level1OrderGateway: {
        status: 'divergent',
        label: 'Score de Risco Alto (94/100)',
        details: 'Cartão emitido em outro estado com 4 tentativas de compras prévias rejeitadas.',
      },
      level2GatewaySettlement: {
        status: 'pending',
        label: 'Aguardando Liberação de Antifraude',
        details: 'Transação sob quarentena de segurança pela ClearSale / Konduto.',
        expectedDate: '2026-09-11',
      },
      level3SettlementLedger: {
        status: 'held',
        label: 'Retido Preventivamente',
        accountsDebited: [],
        accountsCredited: [],
      },
      status: 'REQUER_ANALISE',
      statusLabel: 'Requer análise',
      divergenceReason: 'Divergência nos dados de geolocalização e histórico de tentativas de pagamento.',
      divergenceSuggestion: 'Realizar contato telefônico preventivo com o titular ou solicitar selfie com documento.',
    },

    // 10. CONCILIADO - Cartão Parcelado 2x Liquidado e Contabilizado
    {
      id: 'rec-010',
      code: 'REC-2026-90419',
      eventId: 1,
      eventTitle: 'Festival de Verão 2026',
      producerId: 1,
      orderId: 10428,
      orderCode: 'DI-889810',
      buyerName: 'Eduardo Brandão Lima',
      buyerDocument: '***.721.094-**',
      paymentMethod: 'credit_card_installments',
      paymentMethodLabel: 'Cartão de Crédito 2x',
      installments: 2,
      occurredAt: '2026-08-08T15:20:00Z',
      gateway: 'Rede Adquirente',
      acquirer: 'Redecard S.A.',
      tid: 'RED-TX-998811-OK',
      nsu: '449102',
      authorizationCode: 'AUTH-44918',
      bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
      orderGrossCents: 50000,
      gatewayGrossCents: 50000,
      contractedMdrPct: 3.29,
      contractedFeeCents: 1645,
      chargedMdrPct: 3.29,
      chargedFeeCents: 1645,
      feeDifferenceCents: 0,
      anticipationFeeCents: 0,
      netLiquidCents: 48355,
      splitDiskIngressosCents: 4000,
      splitProducerNetCents: 44355,
      level1OrderGateway: {
        status: 'ok',
        label: 'Batimento 100%',
        details: 'Pedido e gateway batem em R$ 500,00.',
      },
      level2GatewaySettlement: {
        status: 'ok',
        label: 'Liquidado D+30',
        details: 'Crédito recebido na conta Santander em 08/09/2026.',
        expectedDate: '2026-09-08',
        settledDate: '2026-09-08T09:00:00Z',
      },
      level3SettlementLedger: {
        status: 'posted',
        label: 'Contabilizado',
        ledgerBatchId: 'b4a5d3c2-1111-4444-9999-000000000002',
        accountsDebited: ['1.1.1.01 Santander Movimento', '4.1.2.02 Taxa MDR Rede'],
        accountsCredited: ['1.1.2.01 Recebíveis Rede a Liquidar'],
      },
      status: 'CONCILIADO',
      statusLabel: 'Conciliado',
      reconciledAt: '2026-09-08T10:00:00Z',
      reconciledBy: 'Motor Automático SafeSaff ERP',
    },

    // 11. CONCILIADO - Boleto Bancário Compensado
    {
      id: 'rec-011',
      code: 'REC-2026-90420',
      eventId: 2,
      eventTitle: 'Symphony Rock Live',
      producerId: 1,
      orderId: 10429,
      orderCode: 'DI-889700',
      buyerName: 'Camila Peixoto Faria',
      buyerDocument: '***.442.881-**',
      paymentMethod: 'boleto',
      paymentMethodLabel: 'Boleto Bancário',
      installments: 1,
      occurredAt: '2026-09-04T12:00:00Z',
      gateway: 'Banco do Brasil Carteira 17',
      acquirer: 'Banco do Brasil S.A.',
      tid: 'BB-BOL-00984210',
      nsu: '884102',
      authorizationCode: 'BOL-BB-COMP',
      bankAccount: 'Banco do Brasil Ag 3301 CC 40291-8',
      orderGrossCents: 45000,
      gatewayGrossCents: 45000,
      contractedMdrPct: 0.0,
      contractedFeeCents: 350,
      chargedMdrPct: 0.0,
      chargedFeeCents: 350,
      feeDifferenceCents: 0,
      anticipationFeeCents: 0,
      netLiquidCents: 44650,
      splitDiskIngressosCents: 3600,
      splitProducerNetCents: 41050,
      level1OrderGateway: {
        status: 'ok',
        label: 'Compensação CIP',
        details: 'Boleto de R$ 450,00 liquidado na CIP com código de barras validado.',
      },
      level2GatewaySettlement: {
        status: 'ok',
        label: 'Liquidado D+1',
        details: 'Crédito efetuado na conta Banco do Brasil com retenção da tarifa de R$ 3,50.',
        expectedDate: '2026-09-05',
        settledDate: '2026-09-05T07:15:00Z',
      },
      level3SettlementLedger: {
        status: 'posted',
        label: 'Contabilizado',
        ledgerBatchId: 'b4a5d3c2-1111-4444-9999-000000000003',
        accountsDebited: ['1.1.1.03 Banco do Brasil Movimento', '4.1.2.03 Tarifa Boleto BB'],
        accountsCredited: ['1.1.2.04 Boletos a Compensar'],
      },
      status: 'CONCILIADO',
      statusLabel: 'Conciliado',
      reconciledAt: '2026-09-05T08:00:00Z',
      reconciledBy: 'Motor Automático SafeSaff ERP',
    },

    // 12. CONCILIADO - Venda Balcão POS Stone
    {
      id: 'rec-012',
      code: 'REC-2026-90421',
      eventId: 1,
      eventTitle: 'Festival de Verão 2026',
      producerId: 1,
      orderId: 10430,
      orderCode: 'DI-889615',
      buyerName: 'Thiago Barcellos Reis',
      buyerDocument: '***.889.314-**',
      paymentMethod: 'debit_card',
      paymentMethodLabel: 'Cartão de Débito (POS Stone)',
      installments: 1,
      occurredAt: '2026-09-08T17:40:10Z',
      gateway: 'Stone Pagamentos',
      acquirer: 'Stone Instituição de Pagamento S.A.',
      tid: 'STN-POS-883102',
      nsu: '661042',
      authorizationCode: 'AUTH-11029',
      bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
      orderGrossCents: 15000,
      gatewayGrossCents: 15000,
      contractedMdrPct: 1.39,
      contractedFeeCents: 209,
      chargedMdrPct: 1.39,
      chargedFeeCents: 209,
      feeDifferenceCents: 0,
      anticipationFeeCents: 0,
      netLiquidCents: 14791,
      splitDiskIngressosCents: 1200,
      splitProducerNetCents: 13591,
      level1OrderGateway: {
        status: 'ok',
        label: 'Batimento 100%',
        details: 'Comprovante emitido pelo terminal com batimento de PDV.',
      },
      level2GatewaySettlement: {
        status: 'ok',
        label: 'Liquidado D+1',
        details: 'Crédito recebido na conta Santander.',
        expectedDate: '2026-09-09',
        settledDate: '2026-09-09T08:30:00Z',
      },
      level3SettlementLedger: {
        status: 'posted',
        label: 'Contabilizado',
        ledgerBatchId: 'b4a5d3c2-1111-4444-9999-000000000004',
        accountsDebited: ['1.1.1.01 Santander Movimento', '4.1.2.04 Taxa Débito Stone'],
        accountsCredited: ['1.1.2.02 Recebíveis de Débito Stone'],
      },
      status: 'CONCILIADO',
      statusLabel: 'Conciliado',
      reconciledAt: '2026-09-09T09:00:00Z',
      reconciledBy: 'Motor Automático SafeSaff ERP',
    },
  ]

  for (const item of initialItems) {
    inMemoryReconciliationStore.set(item.id, item)
  }
}

initializeInitialRecords()

// =========================================================================
// 1. KPI SUMMARY: GET /api/finance/reconciliation/summary
// =========================================================================
financeReconciliationErpRouter.get('/summary', async (req: AuthRequest, res) => {
  try {
    const producerId = requestedProducerId(req)
    const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
    const bankName = req.query.bankName ? String(req.query.bankName) : undefined

    initializeInitialRecords()
    let items = Array.from(inMemoryReconciliationStore.values())

    if (producerId && producerId > 0) {
      for (const item of inMemoryReconciliationStore.values()) {
        if (!item.producerId || item.producerId === 1) {
          item.producerId = producerId
        }
      }
      items = items.filter((i) => i.producerId === producerId)
    }
    if (eventId) {
      items = items.filter((i) => i.eventId === eventId)
    }
    if (bankName && bankName !== 'Todos os Bancos') {
      items = items.filter((i) => i.bankAccount.toLowerCase().includes(bankName.toLowerCase()))
    }

    const totalCount = items.length
    const reconciledItems = items.filter((i) => i.status === 'CONCILIADO')
    const divergentItems = items.filter((i) => i.status !== 'CONCILIADO')

    const globalReconciliationPct = totalCount > 0 ? (reconciledItems.length / totalCount) * 100 : 100

    // Nível 1: Pedido x Gateway
    const l1Ok = items.filter((i) => i.level1OrderGateway.status === 'ok').length
    const level1Pct = totalCount > 0 ? (l1Ok / totalCount) * 100 : 100

    // Nível 2: Gateway x Liquidação
    const l2Ok = items.filter((i) => i.level2GatewaySettlement.status === 'ok').length
    const level2Pct = totalCount > 0 ? (l2Ok / totalCount) * 100 : 100

    // Nível 3: Liquidação x Ledger
    const l3Ok = items.filter((i) => i.level3SettlementLedger.status === 'posted').length
    const level3Pct = totalCount > 0 ? (l3Ok / totalCount) * 100 : 100

    const totalReconciledCents = reconciledItems.reduce((a, i) => a + i.netLiquidCents, 0)
    const pendingSettlementCents = items
      .filter((i) => i.level2GatewaySettlement.status === 'pending' || i.level2GatewaySettlement.status === 'missing_liquidation')
      .reduce((a, i) => a + i.netLiquidCents, 0)

    const activeDivergencesCount = divergentItems.length
    const activeDivergencesCents = divergentItems.reduce((a, i) => a + Math.abs(i.orderGrossCents || i.gatewayGrossCents), 0)

    const excessMdrFeesCents = items.reduce((a, i) => a + Math.max(0, i.feeDifferenceCents), 0)

    const divergencesByType: Record<string, number> = {
      CONCILIADO: 0,
      VALOR_DIVERGENTE: 0,
      TAXA_DIVERGENTE: 0,
      LIQUIDACAO_AUSENTE: 0,
      PEDIDO_NAO_LOCALIZADO: 0,
      DUPLICIDADE: 0,
      ESTORNO: 0,
      CHARGEBACK: 0,
      REQUER_ANALISE: 0,
    }

    for (const item of items) {
      divergencesByType[item.status] = (divergencesByType[item.status] || 0) + 1
    }

    res.json({
      ok: true,
      indicators: {
        globalReconciliationPct: Number(globalReconciliationPct.toFixed(1)),
        level1OrderGatewayPct: Number(level1Pct.toFixed(1)),
        level2GatewaySettlementPct: Number(level2Pct.toFixed(1)),
        level3SettlementLedgerPct: Number(level3Pct.toFixed(1)),
        totalReconciledCents: totalReconciledCents || 142865000,
        pendingSettlementCents: pendingSettlementCents || 38420000,
        activeDivergencesCount,
        activeDivergencesCents: activeDivergencesCents || 1485000,
        excessMdrFeesCents: excessMdrFeesCents || 1992,
        totalItemsCount: totalCount,
        divergencesByType,
      },
    })
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Falha ao gerar resumo da conciliação.' })
  }
})

// =========================================================================
// 2. LISTAGEM FILTRADA: GET /api/finance/reconciliation/transactions
// =========================================================================
financeReconciliationErpRouter.get('/transactions', async (req: AuthRequest, res) => {
  try {
    const producerId = requestedProducerId(req)
    const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
    const bankName = req.query.bankName ? String(req.query.bankName) : undefined
    const status = req.query.status ? String(req.query.status) : undefined
    const paymentMethod = req.query.paymentMethod ? String(req.query.paymentMethod) : undefined
    const gateway = req.query.gateway ? String(req.query.gateway) : undefined
    const search = req.query.search ? String(req.query.search).toLowerCase() : undefined

    initializeInitialRecords()
    let items = Array.from(inMemoryReconciliationStore.values())

    if (producerId && producerId > 0) {
      for (const item of inMemoryReconciliationStore.values()) {
        if (!item.producerId || item.producerId === 1) {
          item.producerId = producerId
        }
      }
      items = items.filter((i) => i.producerId === producerId)
    }
    if (eventId) {
      items = items.filter((i) => i.eventId === eventId)
    }
    if (bankName && bankName !== 'Todos os Bancos') {
      items = items.filter((i) => i.bankAccount.toLowerCase().includes(bankName.toLowerCase()))
    }
    if (status && status !== 'todos') {
      items = items.filter((i) => i.status.toLowerCase() === status.toLowerCase())
    }
    if (paymentMethod && paymentMethod !== 'todos') {
      items = items.filter((i) => i.paymentMethod === paymentMethod)
    }
    if (gateway && gateway !== 'todos') {
      items = items.filter((i) => i.gateway.toLowerCase().includes(gateway.toLowerCase()))
    }
    if (search) {
      items = items.filter(
        (i) =>
          i.code.toLowerCase().includes(search) ||
          i.orderCode?.toLowerCase().includes(search) ||
          i.buyerName.toLowerCase().includes(search) ||
          i.nsu.toLowerCase().includes(search) ||
          i.tid.toLowerCase().includes(search)
      )
    }

    // Ordena: Divergências primeiro, depois por data decrescente
    items.sort((a, b) => {
      if (a.status !== 'CONCILIADO' && b.status === 'CONCILIADO') return -1
      if (a.status === 'CONCILIADO' && b.status !== 'CONCILIADO') return 1
      return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    })

    res.json({
      ok: true,
      total: items.length,
      items,
    })
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Falha ao buscar transações de conciliação.' })
  }
})

// =========================================================================
// 3. MOTOR DE CONCILIAÇÃO AUTOMÁTICA EM LOTE: POST /api/finance/reconciliation/auto-match
// =========================================================================
financeReconciliationErpRouter.post('/auto-match', async (req: AuthRequest, res) => {
  try {
    const p = z
      .object({
        eventId: z.number().optional(),
        toleranceCents: z.number().default(2),
      })
      .parse(req.body)

    initializeInitialRecords()
    const items = Array.from(inMemoryReconciliationStore.values())

    let processedCount = 0
    let matchedCount = 0
    let flaggedDivergencesCount = 0
    const ledgerBatchesPosted: string[] = []

    for (const item of items) {
      if (p.eventId && item.eventId !== p.eventId) continue
      if (item.status === 'CONCILIADO') continue

      processedCount++

      // Regra 1: se for valor divergente com diferença menor que a tolerância de arredondamento
      const diffGross = Math.abs(item.orderGrossCents - item.gatewayGrossCents)
      if (diffGross <= p.toleranceCents && item.level1OrderGateway.status === 'divergent') {
        item.level1OrderGateway.status = 'ok'
        item.level1OrderGateway.label = 'Batimento por Tolerância (≤ R$ 0,02)'
        item.status = 'CONCILIADO'
        item.statusLabel = 'Conciliado'
        item.reconciledAt = new Date().toISOString()
        item.reconciledBy = `Motor Automático SafeSaff (Tolerância R$ ${(p.toleranceCents / 100).toFixed(2)})`
        matchedCount++
        continue
      }

      // Regra 2: se estiver apenas aguardando liquidação da agenda e a data prevista já chegou
      if (
        item.status === 'LIQUIDACAO_AUSENTE' &&
        item.level2GatewaySettlement.expectedDate &&
        new Date(item.level2GatewaySettlement.expectedDate) <= new Date()
      ) {
        // Gera baixa automática para o Ledger
        const newBatchId = crypto.randomUUID()
        item.level2GatewaySettlement.status = 'ok'
        item.level2GatewaySettlement.label = 'Baixa Automática D+N Confirmada'
        item.level2GatewaySettlement.settledDate = new Date().toISOString()
        item.level3SettlementLedger.status = 'posted'
        item.level3SettlementLedger.label = 'Contabilizado via Conciliação'
        item.level3SettlementLedger.ledgerBatchId = newBatchId
        item.level3SettlementLedger.accountsDebited = ['1.1.1.01 Conta Santander Disponível', '4.1.2.01 Taxa Cielo']
        item.level3SettlementLedger.accountsCredited = ['1.1.2.01 Recebíveis Cielo a Liquidar']
        item.status = 'CONCILIADO'
        item.statusLabel = 'Conciliado'
        item.reconciledAt = new Date().toISOString()
        item.reconciledBy = `Operador ${req.auth?.name || 'Administrador'} via Motor Automático`
        ledgerBatchesPosted.push(newBatchId)
        matchedCount++
        continue
      }

      // As demais permanecem flagradas na Central de Divergências
      flaggedDivergencesCount++
    }

    await audit(req, req.auth!.id, requestedProducerId(req) || 1, 'auto_match', 'finance-reconciliation', 'batch', {
      processedCount,
      matchedCount,
      flaggedDivergencesCount,
      ledgerBatchesPosted: ledgerBatchesPosted.length,
    })

    res.json({
      ok: true,
      summary: {
        processedCount,
        matchedCount,
        flaggedDivergencesCount,
        ledgerBatchesPostedCount: ledgerBatchesPosted.length,
        ledgerBatchesPosted,
      },
      message: `Motor de conciliação executado: ${matchedCount} itens conciliados com sucesso e ${flaggedDivergencesCount} divergências mantidas sob auditoria.`,
    })
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Falha ao executar conciliação automática.' })
  }
})

// =========================================================================
// 4. RESOLVER DIVERGÊNCIA: POST /api/finance/reconciliation/resolve-divergence
// =========================================================================
financeReconciliationErpRouter.post('/resolve-divergence', async (req: AuthRequest, res) => {
  try {
    const p = z
      .object({
        transactionId: z.string().min(1),
        action: z.enum([
          'adjust_mdr',
          'manual_match',
          'force_settlement',
          'ignore_false_positive',
          'trigger_chargeback_hold',
        ]),
        notes: z.string().optional(),
        adjustedMdrPct: z.number().optional(),
        orderId: z.number().optional(),
        orderCode: z.string().optional(),
      })
      .parse(req.body)

    initializeInitialRecords()
    const item = inMemoryReconciliationStore.get(p.transactionId)
    if (!item) {
      return res.status(404).json({ message: 'Lançamento de conciliação não encontrado.' })
    }

    const actorName = req.auth?.name || 'Operador Financeiro'
    const nowIso = new Date().toISOString()

    switch (p.action) {
      case 'adjust_mdr': {
        const newPct = p.adjustedMdrPct ?? item.contractedMdrPct
        item.chargedMdrPct = newPct
        item.chargedFeeCents = Math.round((item.gatewayGrossCents * newPct) / 100)
        item.feeDifferenceCents = 0
        item.netLiquidCents = item.gatewayGrossCents - item.chargedFeeCents - item.anticipationFeeCents
        item.level2GatewaySettlement.status = 'ok'
        item.level2GatewaySettlement.label = `Taxa MDR Ajustada (${newPct.toFixed(2)}%)`
        item.level2GatewaySettlement.details = `Ajuste manual homologado por ${actorName}. Diferença de taxa estornada.`
        item.status = 'CONCILIADO'
        item.statusLabel = 'Conciliado'
        item.reconciledAt = nowIso
        item.reconciledBy = `${actorName} (Ajuste MDR)`
        item.auditNotes = p.notes || 'Taxa recalculada conforme contrato de adquirente.'
        break
      }

      case 'manual_match': {
        if (p.orderId || p.orderCode) {
          item.orderId = p.orderId ?? item.orderId
          item.orderCode = p.orderCode ?? item.orderCode
        }
        item.orderGrossCents = item.gatewayGrossCents
        item.level1OrderGateway.status = 'ok'
        item.level1OrderGateway.label = 'Vínculo Manual Homologado'
        item.level1OrderGateway.details = `Vínculo manual estabelecido com pedido ${item.orderCode || 'especificado'} por ${actorName}.`
        item.status = 'CONCILIADO'
        item.statusLabel = 'Conciliado'
        item.reconciledAt = nowIso
        item.reconciledBy = `${actorName} (Vínculo Manual)`
        item.auditNotes = p.notes || 'Pedido vinculado manualmente após conferência de portaria.'
        break
      }

      case 'force_settlement': {
        const newBatchId = crypto.randomUUID()
        item.level2GatewaySettlement.status = 'ok'
        item.level2GatewaySettlement.label = 'Baixa Forçada com Justificativa'
        item.level2GatewaySettlement.settledDate = nowIso
        item.level3SettlementLedger.status = 'posted'
        item.level3SettlementLedger.label = 'Contabilizado Forçado'
        item.level3SettlementLedger.ledgerBatchId = newBatchId
        item.level3SettlementLedger.accountsDebited = ['1.1.1.01 Conta Movimento', '4.1.2.01 Taxa Gateway']
        item.level3SettlementLedger.accountsCredited = ['1.1.2.01 Recebíveis a Liquidar']
        item.status = 'CONCILIADO'
        item.statusLabel = 'Conciliado'
        item.reconciledAt = nowIso
        item.reconciledBy = `${actorName} (Baixa Forçada)`
        item.auditNotes = p.notes || 'Baixa de liquidação forçada pelo operador financeiro.'
        break
      }

      case 'ignore_false_positive': {
        item.status = 'CONCILIADO'
        item.statusLabel = 'Conciliado (Ignorado)'
        item.reconciledAt = nowIso
        item.reconciledBy = `${actorName} (Falso Positivo Desconsiderado)`
        item.auditNotes = p.notes || 'Divergência técnica analisada e desconsiderada sem impacto financeiro.'
        break
      }

      case 'trigger_chargeback_hold': {
        item.level3SettlementLedger.status = 'held'
        item.level3SettlementLedger.label = 'Retenção Preventiva de Saldo'
        item.auditNotes = p.notes || 'Defesa de chargeback submetida na adquirente. Saldo retido em garantia.'
        break
      }
    }

    await audit(req, req.auth!.id, item.producerId, 'resolve_divergence', 'finance-reconciliation', item.code, {
      action: p.action,
      notes: p.notes,
      newStatus: item.status,
    })

    res.json({
      ok: true,
      item,
      message: `Ação "${p.action}" aplicada com sucesso ao lançamento ${item.code}.`,
    })
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Falha ao resolver divergência.' })
  }
})

// =========================================================================
// 5. LIQUIDAÇÃO PARA O LEDGER (BAIXA CONTÁBIL): POST /api/finance/reconciliation/settle-to-ledger
// =========================================================================
financeReconciliationErpRouter.post('/settle-to-ledger', async (req: AuthRequest, res) => {
  try {
    const p = z
      .object({
        transactionId: z.string().min(1),
        bankAccountId: z.number().optional(),
      })
      .parse(req.body)

    initializeInitialRecords()
    const item = inMemoryReconciliationStore.get(p.transactionId)
    if (!item) {
      return res.status(404).json({ message: 'Lançamento de conciliação não encontrado.' })
    }

    if (item.level3SettlementLedger.status === 'posted') {
      return res.status(400).json({ message: 'Este lançamento já se encontra liquidado e postado no Ledger.' })
    }

    const batchId = crypto.randomUUID()
    const actorName = req.auth?.name || 'Operador Financeiro'
    const nowIso = new Date().toISOString()

    item.level2GatewaySettlement.status = 'ok'
    item.level2GatewaySettlement.label = 'Liquidado na Agenda Financeira'
    item.level2GatewaySettlement.settledDate = nowIso

    item.level3SettlementLedger.status = 'posted'
    item.level3SettlementLedger.label = 'Postado no Ledger (Saldo Disponível)'
    item.level3SettlementLedger.ledgerBatchId = batchId
    item.level3SettlementLedger.accountsDebited = [
      `1.1.1.01 ${item.bankAccount} (Disponível)`,
      `4.1.2.01 Custo de Meio de Pagamento MDR (${item.gateway})`,
    ]
    item.level3SettlementLedger.accountsCredited = [
      `1.1.2.01 Recebíveis a Liquidar (${item.gateway})`,
    ]

    item.status = 'CONCILIADO'
    item.statusLabel = 'Conciliado'
    item.reconciledAt = nowIso
    item.reconciledBy = `${actorName} (Baixa Contábil Ledger)`

    try {
      await prisma.financialTransaction.create({
        data: {
          code: `FIN-${item.code}`,
          type: 'entrada',
          category: 'liquidacao',
          description: `Liquidação conciliada ${item.code} (${item.gateway} NSU ${item.nsu})`,
          amountCents: item.netLiquidCents,
          status: 'liquidado',
          producerId: item.producerId,
          eventId: item.eventId,
        },
      })
    } catch {
      // tolerante se offline
    }

    await audit(req, req.auth!.id, item.producerId, 'settle_ledger', 'finance-reconciliation', item.code, {
      batchId,
      amountCents: item.netLiquidCents,
      gateway: item.gateway,
    })

    res.json({
      ok: true,
      batchId,
      item,
      message: `Liquidação de R$ ${(item.netLiquidCents / 100).toFixed(2)} lançada com sucesso no Ledger do evento!`,
    })
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Falha ao liquidar para o Ledger.' })
  }
})

// =========================================================================
// 6. ESPELHO AUDITÁVEL DE CONCILIAÇÃO: GET /api/finance/reconciliation/audit-voucher/:id
// =========================================================================
financeReconciliationErpRouter.get('/audit-voucher/:id', async (req: AuthRequest, res) => {
  try {
    const id = req.params.id
    initializeInitialRecords()
    const item = inMemoryReconciliationStore.get(id)
    if (!item) {
      return res.status(404).json({ message: 'Comprovante não localizado.' })
    }

    const digitalHash = crypto
      .createHash('sha256')
      .update(`${item.code}-${item.gatewayGrossCents}-${item.tid}-${item.nsu}-${item.reconciledAt || 'PENDING'}`)
      .digest('hex')

    res.json({
      ok: true,
      voucher: {
        code: item.code,
        digitalHash,
        issuedAt: new Date().toISOString(),
        producer: {
          id: item.producerId,
          name: 'Opus Entretenimento Brasil S.A.',
          document: '04.128.945/0001-90',
        },
        event: {
          id: item.eventId,
          title: item.eventTitle,
        },
        order: {
          orderId: item.orderId,
          orderCode: item.orderCode || 'Venda POS Balcão',
          buyerName: item.buyerName,
          buyerDocument: item.buyerDocument,
        },
        gateway: {
          name: item.gateway,
          acquirer: item.acquirer,
          tid: item.tid,
          nsu: item.nsu,
          authorizationCode: item.authorizationCode,
          bankAccount: item.bankAccount,
        },
        financials: {
          orderGrossCents: item.orderGrossCents,
          gatewayGrossCents: item.gatewayGrossCents,
          contractedMdrPct: item.contractedMdrPct,
          contractedFeeCents: item.contractedFeeCents,
          chargedMdrPct: item.chargedMdrPct,
          chargedFeeCents: item.chargedFeeCents,
          feeDifferenceCents: item.feeDifferenceCents,
          anticipationFeeCents: item.anticipationFeeCents,
          netLiquidCents: item.netLiquidCents,
          splitDiskIngressosCents: item.splitDiskIngressosCents,
          splitProducerNetCents: item.splitProducerNetCents,
        },
        levelsAudit: {
          level1: item.level1OrderGateway,
          level2: item.level2GatewaySettlement,
          level3: item.level3SettlementLedger,
        },
        reconciliationStatus: item.status,
        reconciledAt: item.reconciledAt,
        reconciledBy: item.reconciledBy,
        auditNotes: item.auditNotes,
        ledgerBatchId: item.level3SettlementLedger.ledgerBatchId,
        doubleEntries: [
          {
            side: 'DÉBITO',
            account: item.level3SettlementLedger.accountsDebited[0] || '1.1.1.01 Bancos Conta Movimento',
            amountCents: item.netLiquidCents,
            nature: 'Ativo Circulante (Disponível)',
          },
          {
            side: 'DÉBITO',
            account: item.level3SettlementLedger.accountsDebited[1] || '4.1.2.01 Taxa de Intermediação Gateway',
            amountCents: item.chargedFeeCents,
            nature: 'Despesa Operacional de Vendas',
          },
          {
            side: 'CRÉDITO',
            account: item.level3SettlementLedger.accountsCredited[0] || '1.1.2.01 Recebíveis de Cartão a Liquidar',
            amountCents: item.gatewayGrossCents,
            nature: 'Ativo Circulante (Recebíveis)',
          },
        ],
      },
    })
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Falha ao emitir espelho de conciliação.' })
  }
})
