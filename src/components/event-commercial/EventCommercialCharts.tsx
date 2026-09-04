import React, { useState } from 'react'
import type {
  SalesEvolutionPoint,
  SalesVelocityStats,
  PaymentMethodItem,
  OccupancyBreakdown,
  WeekdayDistributionItem
} from '../../types/event-commercial'

const formatMoney = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

// 1. Gráfico de Evolução de Vendas (Dual: Barras de Receita + Linha de Ingressos)
export function SalesEvolutionChart({
  points,
  viewMode = 'both'
}: {
  points: SalesEvolutionPoint[]
  viewMode?: 'both' | 'revenue' | 'tickets'
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  if (!points || points.length === 0) {
    return <div className="ecc-empty-chart">Sem dados de evolução temporal.</div>
  }

  const width = 640
  const height = 260
  const padLeft = 45
  const padRight = 45
  const padTop = 30
  const padBottom = 40

  const chartW = width - padLeft - padRight
  const chartH = height - padTop - padBottom

  const maxRevenue = Math.max(...points.map(p => p.revenueCents), 100000)
  const maxTickets = Math.max(...points.map(p => p.ticketsCount), 20)

  // Step spacing
  const stepX = points.length > 1 ? chartW / (points.length - 1) : chartW

  // Coordenadas dos pontos
  const coords = points.map((p, i) => {
    const x = padLeft + i * stepX
    const yRev = padTop + chartH - (p.revenueCents / maxRevenue) * chartH
    const yTick = padTop + chartH - (p.ticketsCount / maxTickets) * chartH
    return { x, yRev, yTick, ...p }
  })

  // Gerador de curva suave SVG (Catmull-Rom / Bezier)
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return ''
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    }
    return d
  }

  const linePath = generateSmoothPath(coords.map(c => ({ x: c.x, y: c.yTick })))

  return (
    <div className="ecc-chart-container" style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="ecc-svg"
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2563EB" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Linhas horizontais de grade */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padTop + chartH * (1 - ratio)
          const revVal = (maxRevenue * ratio) / 100
          const tickVal = Math.round(maxTickets * ratio)
          return (
            <g key={`grid-${idx}`}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              {/* Eixo Esquerdo: Receita */}
              <text x={padLeft - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#64748B" fontWeight="600">
                {ratio === 0 ? '0' : `${Math.round(revVal / 1000)}k`}
              </text>
              {/* Eixo Direito: Ingressos */}
              <text x={width - padRight + 8} y={y + 3} textAnchor="start" fontSize="10" fill="#0284C7" fontWeight="600">
                {tickVal}
              </text>
            </g>
          )
        })}

        {/* Eixo X labels */}
        {coords.map((c, i) => (
          <text
            key={`xlabel-${i}`}
            x={c.x}
            y={height - 12}
            textAnchor="middle"
            fontSize="10"
            fill="#64748B"
            fontWeight={hoveredIdx === i ? '700' : '500'}
          >
            {c.formattedDate}
          </text>
        ))}

        {/* Barras de Receita */}
        {(viewMode === 'both' || viewMode === 'revenue') &&
          coords.map((c, i) => {
            const barW = Math.max(14, stepX * 0.42)
            const barH = padTop + chartH - c.yRev
            const isHov = hoveredIdx === i
            return (
              <g key={`bar-${i}`} onMouseEnter={() => setHoveredIdx(i)} style={{ cursor: 'pointer' }}>
                <rect
                  x={c.x - barW / 2}
                  y={c.yRev}
                  width={barW}
                  height={barH}
                  rx="4"
                  fill={isHov ? '#60A5FA' : 'url(#revBarGrad)'}
                  stroke={isHov ? '#2563EB' : '#93C5FD'}
                  strokeWidth={isHov ? 1.5 : 1}
                  style={{ transition: 'all 0.2s ease' }}
                />
              </g>
            )
          })}

        {/* Linha e Pontos de Ingressos Vendidos */}
        {(viewMode === 'both' || viewMode === 'tickets') && (
          <>
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {coords.map((c, i) => {
              const isHov = hoveredIdx === i
              return (
                <g key={`dot-${i}`} onMouseEnter={() => setHoveredIdx(i)} style={{ cursor: 'pointer' }}>
                  <circle
                    cx={c.x}
                    cy={c.yTick}
                    r={isHov ? 6.5 : 4}
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth={isHov ? 3 : 2}
                    filter="url(#dotGlow)"
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  {isHov && (
                    <circle cx={c.x} cy={c.yTick} r={10} fill="#0284C7" fillOpacity="0.15" />
                  )}
                </g>
              )
            })}
          </>
        )}
      </svg>

      {/* Floating Tooltip Moderno */}
      {hoveredIdx !== null && coords[hoveredIdx] && (
        <div
          className="ecc-tooltip"
          style={{
            position: 'absolute',
            left: `${(coords[hoveredIdx].x / width) * 100}%`,
            top: `${Math.min(coords[hoveredIdx].yRev, coords[hoveredIdx].yTick) - 25}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <div className="ecc-tooltip-box">
            <div className="ecc-tooltip-date">{coords[hoveredIdx].date}</div>
            <div className="ecc-tooltip-row text-blue-600">
              <span>Receita:</span> <b>{formatMoney(coords[hoveredIdx].revenueCents)}</b>
            </div>
            <div className="ecc-tooltip-row text-sky-600">
              <span>Ingressos:</span> <b>{coords[hoveredIdx].ticketsCount}</b>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 2. Gráfico de Ritmo de Vendas (Realizado com Área + Projeção Pontilhada)
export function SalesVelocityChart({ stats }: { stats: SalesVelocityStats }) {
  const width = 480
  const height = 210
  const padLeft = 40
  const padRight = 35
  const padTop = 30
  const padBottom = 35

  const chartW = width - padLeft - padRight
  const chartH = height - padTop - padBottom

  const allPoints = [...stats.realizedHistory, ...stats.projectedHistory.slice(1)]
  const maxVal = Math.max(...allPoints.map(p => p.amountCents), stats.projectedFinalCents, 100000)

  const stepX = allPoints.length > 1 ? chartW / (allPoints.length - 1) : chartW

  const realizedCoords = stats.realizedHistory.map((p, i) => ({
    x: padLeft + i * stepX,
    y: padTop + chartH - (p.amountCents / maxVal) * chartH,
    ...p
  }))

  const lastRealizedIdx = stats.realizedHistory.length - 1
  const projectedCoords = stats.projectedHistory.map((p, i) => ({
    x: padLeft + (lastRealizedIdx + i) * stepX,
    y: padTop + chartH - (p.amountCents / maxVal) * chartH,
    ...p
  }))

  const makeSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const cx = (p1.x + p2.x) / 2
      d += ` C ${cx} ${p1.y}, ${cx} ${p2.y}, ${p2.x} ${p2.y}`
    }
    return d
  }

  const realizedLine = makeSmoothPath(realizedCoords)
  const projectedLine = makeSmoothPath(projectedCoords)

  const areaPath = realizedCoords.length
    ? `${realizedLine} L ${realizedCoords[realizedCoords.length - 1].x} ${padTop + chartH} L ${realizedCoords[0].x} ${padTop + chartH} Z`
    : ''

  const lastProjected = projectedCoords[projectedCoords.length - 1]

  return (
    <div className="ecc-chart-container" style={{ position: 'relative', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="ecc-svg" style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Linhas de grade sutis */}
        {[0, 0.5, 1].map((r, i) => {
          const y = padTop + chartH * (1 - r)
          const val = Math.round((maxVal * r) / 100000)
          return (
            <g key={`vel-grid-${i}`}>
              <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="#F1F5F9" strokeWidth="1" />
              <text x={padLeft - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94A3B8">
                {r === 0 ? 'R$ 0' : `R$ ${val}k`}
              </text>
            </g>
          )
        })}

        {/* Datas no eixo X */}
        {allPoints.map((p, i) => (
          <text
            key={`vel-date-${i}`}
            x={padLeft + i * stepX}
            y={height - 10}
            textAnchor="middle"
            fontSize="9"
            fill="#94A3B8"
          >
            {p.formattedDate}
          </text>
        ))}

        {/* Área preenchida do Realizado */}
        {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}

        {/* Linha Realizado */}
        {realizedLine && (
          <path d={realizedLine} fill="none" stroke="#0284C7" strokeWidth="2.8" strokeLinecap="round" />
        )}

        {/* Linha Projeção (pontilhada) */}
        {projectedLine && (
          <path
            d={projectedLine}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        )}

        {/* Ponto final realizado */}
        {realizedCoords.length > 0 && (
          <circle
            cx={realizedCoords[realizedCoords.length - 1].x}
            cy={realizedCoords[realizedCoords.length - 1].y}
            r="4.5"
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth="2.5"
          />
        )}

        {/* Ponto final projetado */}
        {lastProjected && (
          <circle cx={lastProjected.x} cy={lastProjected.y} r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
        )}
      </svg>

      {/* Floating Badge de Projeção */}
      {lastProjected && (
        <div
          className="ecc-projection-badge"
          style={{
            position: 'absolute',
            left: `${(lastProjected.x / width) * 100}%`,
            top: `${(lastProjected.y / height) * 100}%`,
            transform: 'translate(-85%, -135%)'
          }}
        >
          <small>Projeção</small>
          <strong>{formatMoney(stats.projectedFinalCents)}</strong>
        </div>
      )}
    </div>
  )
}

// 3. Gráfico de Formas de Pagamento (Donut Chart Moderno em SVG)
export function PaymentDonutChart({
  items,
  totalCount,
  selectedMethod,
  onSelectMethod
}: {
  items: PaymentMethodItem[]
  totalCount: number
  selectedMethod?: string | null
  onSelectMethod?: (id: string) => void
}) {
  const size = 180
  const strokeWidth = 26
  const radius = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * radius
  let accumulatedAngle = 0

  return (
    <div className="ecc-donut-wrap">
      <div className="ecc-donut-svg-wrap" style={{ width: size, height: size, position: 'relative' }}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          {/* Fundo do anel */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {items.map(item => {
            if (item.percentage <= 0) return null
            const strokeDash = (item.percentage / 100) * circ
            const strokeGap = circ - strokeDash
            const offset = -accumulatedAngle
            accumulatedAngle += strokeDash

            const isSel = selectedMethod === item.id

            return (
              <circle
                key={item.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={isSel ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${strokeDash} ${strokeGap}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  opacity: selectedMethod && !isSel ? 0.35 : 1
                }}
                onClick={() => onSelectMethod?.(item.id)}
              />
            )
          })}
        </svg>

        {/* Centro com total de vendas */}
        <div className="ecc-donut-center">
          <strong className="ecc-donut-total">{totalCount}</strong>
          <span className="ecc-donut-sub">vendas</span>
        </div>
      </div>

      {/* Legenda com percentuais */}
      <div className="ecc-donut-legend">
        {items.map(item => {
          const isSel = selectedMethod === item.id
          return (
            <div
              key={item.id}
              className={`ecc-legend-row ${isSel ? 'selected' : ''}`}
              onClick={() => onSelectMethod?.(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <span className="ecc-legend-dot" style={{ backgroundColor: item.color }} />
              <span className="ecc-legend-name">{item.name}</span>
              <span className="ecc-legend-pct">{item.percentage.toFixed(1).replace('.', ',')}%</span>
              <b className="ecc-legend-count">{item.count}</b>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 4. Medidor de Ocupação do Evento (Gauge Semicircular em SVG)
export function OccupancyGaugeChart({ data }: { data: OccupancyBreakdown }) {
  const size = 190
  const strokeWidth = 20
  const radius = (size - strokeWidth * 2) / 2
  const arcLength = Math.PI * radius
  const filledLength = (Math.min(100, Math.max(0, data.occupancyPercent)) / 100) * arcLength

  return (
    <div className="ecc-gauge-wrap">
      <div className="ecc-gauge-svg-wrap" style={{ width: size, height: size / 2 + 30, position: 'relative' }}>
        <svg viewBox={`0 0 ${size} ${size / 2 + 20}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>

          {/* Arco de fundo (180 graus) */}
          <path
            d={`M ${strokeWidth} ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${size / 2 + 10}`}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Arco preenchido de progresso */}
          <path
            d={`M ${strokeWidth} ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - strokeWidth} ${size / 2 + 10}`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${arcLength}`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>

        {/* Texto central da porcentagem e proporção */}
        <div className="ecc-gauge-center" style={{ top: '48%' }}>
          <strong className="ecc-gauge-pct">{data.occupancyPercent.toFixed(1).replace('.', ',')}%</strong>
          <span className="ecc-gauge-ratio">
            {data.sold} / {data.totalCapacity}
          </span>
        </div>
      </div>

      {/* Legenda de detalhes */}
      <div className="ecc-gauge-legend">
        <div className="ecc-g-item">
          <span className="ecc-g-dot" style={{ backgroundColor: '#10B981' }} />
          <span>Vendidos:</span>
          <b>{data.sold}</b>
        </div>
        <div className="ecc-g-item">
          <span className="ecc-g-dot" style={{ backgroundColor: '#06B6D4' }} />
          <span>Disponíveis:</span>
          <b>{data.available}</b>
        </div>
        <div className="ecc-g-item">
          <span className="ecc-g-dot" style={{ backgroundColor: '#F59E0B' }} />
          <span>Cortesias:</span>
          <b>{data.courtesy}</b>
        </div>
        <div className="ecc-g-item">
          <span className="ecc-g-dot" style={{ backgroundColor: '#EF4444' }} />
          <span>Bloqueados:</span>
          <b>{data.blocked}</b>
        </div>
      </div>
    </div>
  )
}

// 5. Gráfico de Vendas por Dia da Semana (Colunas em SVG)
export function WeekdayBarChart({ items }: { items: WeekdayDistributionItem[] }) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  const width = 420
  const height = 170
  const padLeft = 20
  const padRight = 20
  const padTop = 25
  const padBottom = 28

  const chartW = width - padLeft - padRight
  const chartH = height - padTop - padBottom

  const maxVal = Math.max(...items.map(i => i.count), 1)
  const colW = 28
  const stepX = chartW / items.length

  return (
    <div className="ecc-weekday-chart" style={{ width: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>

        {items.map((item, idx) => {
          const x = padLeft + idx * stepX + (stepX - colW) / 2
          const colH = (item.count / maxVal) * chartH
          const y = padTop + chartH - colH
          const isHov = hoveredDay === idx

          return (
            <g
              key={item.weekdayShort}
              onMouseEnter={() => setHoveredDay(idx)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Valor acima da barra */}
              <text
                x={x + colW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="10"
                fill={isHov ? '#1E40AF' : '#475569'}
                fontWeight={isHov ? '800' : '600'}
              >
                {item.count}
              </text>

              {/* Coluna */}
              <rect
                x={x}
                y={y}
                width={colW}
                height={colH}
                rx="5"
                fill={isHov ? '#1D4ED8' : 'url(#colGrad)'}
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* Rótulo do dia */}
              <text
                x={x + colW / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize="11"
                fill="#64748B"
                fontWeight={isHov ? '700' : '500'}
              >
                {item.weekdayShort}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
