import React, { useState, useEffect } from 'react'
import { X, QrCode, Copy, Check, Clock, ShieldCheck, RefreshCw } from 'lucide-react'
import { PaymentRecord } from '../../types/payments-enterprise.types'

interface PixPaymentModalProps {
  payment: PaymentRecord
  onClose: () => void
  onSimulateSuccess?: () => void
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  payment,
  onClose,
  onSimulateSuccess
}) => {
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(522) // 08:42
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const pixPayload = `00020126580014br.gov.bcb.pix0136${payment.pixTxId || 'txid_bb_92837198281_2026'}5204000053039865405${(payment.amountCents / 100).toFixed(2)}5802BR5916DiskIngressos6009CURITIBA62070503***6304`

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSimulate = () => {
    setConfirming(true)
    setTimeout(() => {
      setConfirming(false)
      onSimulateSuccess?.()
      onClose()
    }, 1200)
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      data-testid="pix-payment-modal"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp text-center">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-300" />
            <h3 className="text-sm font-black">Pagamento Instantâneo via PIX</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Valor do Pagamento</span>
            <p className="text-3xl font-black text-slate-900 mt-1">
              R$ {(payment.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-bold mt-2">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Expira em: {formatTime(secondsLeft)}</span>
            </div>
          </div>

          {/* QR Code Ilustrativo */}
          <div className="w-52 h-52 mx-auto bg-white p-3 border-2 border-slate-900 rounded-2xl shadow-inner flex flex-col items-center justify-center relative group">
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white rounded-xl p-2 relative overflow-hidden">
              <div className="grid grid-cols-6 gap-1 w-36 h-36 p-1 bg-white rounded-lg">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      [0, 1, 4, 5, 6, 7, 10, 11, 24, 25, 28, 29, 30, 31, 34, 35].includes(i)
                        ? 'bg-slate-900'
                        : i % 3 === 0
                        ? 'bg-slate-900'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent animate-scan" />
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Abra o app do seu banco, escolha <b>Pagar com PIX</b> e aponte a câmera para o QR Code acima.
          </div>

          {/* Código Copia e Cola */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Código PIX Copiado!' : 'Copiar Código PIX (Copia e Cola)'}</span>
            </button>
          </div>

          {/* Ação de Demonstração / Testbed */}
          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={handleSimulate}
              disabled={confirming}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${confirming ? 'animate-spin' : ''}`} />
              <span>{confirming ? 'Confirmando no PSP...' : 'Simular Confirmação Bancária (PSP Webhook)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
