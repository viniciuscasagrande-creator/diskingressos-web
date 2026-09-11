/**
 * FASE 28.7 — ERROR MAPPER OFICIAL SPOTIFY ADS
 * 
 * Tradução e classificação de erros da Ads API v3:
 * Erro Spotify -> Código Interno -> Título e Mensagem PT-BR -> Campo Afetado -> Ação Sugerida.
 * Separação estrita entre BLOQUEADORES (impeditivos) e AVISOS (orientações).
 */

import type { SpotifyValidationError } from './spotifyGovernance'

export function mapSpotifyValidationError(code: string, rawMessage?: string, fieldName?: string): SpotifyValidationError {
  const normalizedCode = (code || '').toUpperCase().trim()
  const rawLower = (rawMessage || '').toLowerCase()

  // 1. Erros de Criativo / Assets
  if (normalizedCode.includes('ASSET_PROCESSING') || rawLower.includes('processing')) {
    return {
      severity: 'BLOCKER',
      field: fieldName || 'creative.audioSpotUrl',
      code: 'ASSET_PROCESSING',
      titlePtBr: 'Criativo de Áudio em Processamento',
      messagePtBr: 'O arquivo de áudio enviado ainda está sendo codificado e validado pela infraestrutura do Spotify.',
      suggestedActionPtBr: 'Aguarde alguns instantes até que o status do criativo mude para PRONTO (READY).'
    }
  }

  if (normalizedCode.includes('ASSET_ERROR') || normalizedCode.includes('INVALID_AUDIO') || rawLower.includes('bitrate') || rawLower.includes('duration')) {
    return {
      severity: 'BLOCKER',
      field: fieldName || 'creative.audioSpotUrl',
      code: 'INVALID_AUDIO_FORMAT',
      titlePtBr: 'Formato ou Duração de Áudio Inválido',
      messagePtBr: 'O spot de áudio precisa ter exatamente 15 ou 30 segundos, formato MP3/WAV estéreo de alta fidelidade.',
      suggestedActionPtBr: 'Substitua o arquivo por um spot masterizado dentro das especificações de broadcast Spotify.'
    }
  }

  if (normalizedCode.includes('COMPANION_INVALID') || rawLower.includes('companion') || rawLower.includes('640x640')) {
    return {
      severity: 'BLOCKER',
      field: fieldName || 'creative.companionImageUrl',
      code: 'COMPANION_DIMENSION_ERROR',
      titlePtBr: 'Dimensão do Companion Banner Incorreta',
      messagePtBr: 'A imagem de exibição complementar (companion) deve ter proporção 1:1 com exatamente 640x640 pixels.',
      suggestedActionPtBr: 'Ajuste a imagem para 640x640 JPG/PNG de até 2MB e faça novo upload.'
    }
  }

  // 2. Erros de Orçamento
  if (normalizedCode.includes('BUDGET') || rawLower.includes('budget') || rawLower.includes('minimum_spend')) {
    return {
      severity: 'BLOCKER',
      field: fieldName || 'dailyBudgetCents',
      code: 'BUDGET_BELOW_MINIMUM',
      titlePtBr: 'Orçamento Diário Abaixo do Mínimo Permitido',
      messagePtBr: 'O investimento diário configurado não atinge o valor mínimo exigido para o objetivo e segmentação selecionados.',
      suggestedActionPtBr: 'Aumente o orçamento diário para no mínimo R$ 20,00 ou conforme sugerido pelo Copilot PDT.'
    }
  }

  // 3. Erros de URL e Destino
  if (normalizedCode.includes('URL') || rawLower.includes('destination') || rawLower.includes('https')) {
    return {
      severity: 'BLOCKER',
      field: fieldName || 'creative.destinationUrl',
      code: 'INVALID_DESTINATION_URL',
      titlePtBr: 'URL de Destino DiskIngressos Inválida',
      messagePtBr: 'A página de destino precisa utilizar protocolo HTTPS seguro e apontar para o domínio oficial de venda de ingressos.',
      suggestedActionPtBr: 'Verifique se o link possui https:// e se a página do evento está ativa e pública.'
    }
  }

  // 4. Erros de Versionamento (STALE)
  if (normalizedCode.includes('STALE_VERSION') || normalizedCode.includes('VERSION_MISMATCH') || rawLower.includes('version')) {
    return {
      severity: 'BLOCKER',
      field: 'draftHierarchyVersion',
      code: 'HIERARCHY_VERSION_CONFLICT',
      titlePtBr: 'Conflito de Versão da Campanha',
      messagePtBr: 'A hierarquia da campanha foi modificada em outra sessão ou após a última validação técnica.',
      suggestedActionPtBr: 'Sincronize a hierarquia mais recente e solicite uma nova validação antes de prosseguir.'
    }
  }

  // 5. Avisos de Audiência / Segmentação Restrita
  if (normalizedCode.includes('AUDIENCE_TOO_NARROW') || rawLower.includes('narrow') || rawLower.includes('reach')) {
    return {
      severity: 'WARNING',
      field: fieldName || 'targeting',
      code: 'AUDIENCE_TOO_NARROW',
      titlePtBr: 'Público Estimado Muito Restrito',
      messagePtBr: 'A combinação de filtros de gênero musical, idade e localização gerou um alcance potencial reduzido.',
      suggestedActionPtBr: 'Adicione gêneros musicais correlatos ou amplie a faixa etária para garantir entrega completa da verba.'
    }
  }

  // Fallback seguro
  return {
    severity: 'BLOCKER',
    field: fieldName || 'campaign',
    code: normalizedCode || 'SPOTIFY_VALIDATION_ERROR',
    titlePtBr: 'Pendência na Validação da Campanha',
    messagePtBr: rawMessage || 'A API do Spotify encontrou uma inconformidade nas configurações enviadas.',
    suggestedActionPtBr: 'Revise os dados da campanha ou contate o suporte da plataforma DiskIngressos.'
  }
}
