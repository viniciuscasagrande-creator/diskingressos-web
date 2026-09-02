import { useEffect, useRef, useState, type ReactNode, type WheelEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  children: ReactNode
  ariaLabel: string
  className?: string
}

export default function FinanceOptionCarousel({ children, ariaLabel, className = '' }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const sync = () => {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    sync()
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    el.addEventListener('scroll', sync, { passive: true })
    const active = el.querySelector<HTMLElement>('button.active')
    active?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' })
    requestAnimationFrame(sync)
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', sync)
    }
  }, [children])

  const slide = (direction: -1 | 1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: direction * Math.max(260, el.clientWidth * 0.68), behavior: 'smooth' })
  }

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    const el = trackRef.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    event.preventDefault()
    el.scrollBy({ left: event.deltaY * 0.9, behavior: 'auto' })
  }

  return (
    <div className={`finance-option-carousel ${canLeft ? 'has-left' : ''} ${canRight ? 'has-right' : ''} ${className}`}>
      <button type="button" className="finance-carousel-arrow left" aria-label="Opções anteriores" disabled={!canLeft} onClick={() => slide(-1)}>
        <ChevronLeft size={18}/>
      </button>
      <div ref={trackRef} className="finance-carousel-track" role="navigation" aria-label={ariaLabel} onWheel={onWheel}>
        {children}
      </div>
      <button type="button" className="finance-carousel-arrow right" aria-label="Próximas opções" disabled={!canRight} onClick={() => slide(1)}>
        <ChevronRight size={18}/>
      </button>
    </div>
  )
}
