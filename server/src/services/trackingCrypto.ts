import crypto from 'node:crypto'

/**
 * Retorna a chave secreta oficial para criptografia de tokens e credenciais de tracking.
 * Em produção, é OBRIGATÓRIO definir TRACKING_TOKEN_SECRET (ou JWT_SECRET).
 */
export function getTrackingSecret(): string {
  const secret = process.env.TRACKING_TOKEN_SECRET || process.env.JWT_SECRET

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[SEGURANÇA CRÍTICA] TRACKING_TOKEN_SECRET é obrigatório em ambiente de produção para proteção de credenciais de marketing (Meta, Google, TikTok, Spotify).'
      )
    }
    console.warn(
      '[AVISO DE SEGURANÇA] TRACKING_TOKEN_SECRET não configurado. Utilizando segredo padrão temporário em ambiente de desenvolvimento.'
    )
    return 'diskingressos-tracking-dev-secret-2026'
  }

  return secret
}

/**
 * Cifra um token de API (Meta CAPI, TikTok Events API, Spotify CAPI) utilizando AES-256-GCM.
 */
export function encryptTrackingToken(token: string) {
  const secret = getTrackingSecret()
  const key = crypto.createHash('sha256').update(secret).digest()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    last4: token.slice(-4)
  }
}

/**
 * Decifra um token de API cifrado com AES-256-GCM.
 */
export function decryptTrackingToken(ciphertext: string, iv: string, tag: string): string | null {
  try {
    const secret = getTrackingSecret()
    const key = crypto.createHash('sha256').update(secret).digest()
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'))
    decipher.setAuthTag(Buffer.from(tag, 'base64'))
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8')
  } catch (err) {
    console.error('[trackingCrypto] Falha ao decifrar credencial de tracking:', err)
    return null
  }
}

/**
 * Formata um token para exibição segura na interface (ex: ••••••••••••4F8A).
 */
export function maskToken(tokenLast4?: string | null): string {
  if (!tokenLast4) return 'Não configurado'
  return `••••••••••••${tokenLast4}`
}
