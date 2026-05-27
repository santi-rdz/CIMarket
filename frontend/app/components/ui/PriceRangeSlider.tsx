'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/app/lib/utils'

const PRICE_MIN = 0
const PRICE_MAX = 10_000
const STEP = 50

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function snap(v: number) {
  return Math.round(v / STEP) * STEP
}

function toPercent(value: number) {
  return ((value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
}

function fromPercent(pct: number) {
  return PRICE_MIN + (pct / 100) * (PRICE_MAX - PRICE_MIN)
}

function formatLabel(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
  return `$${v}`
}

type Props = {
  minPrice: number
  maxPrice: number
  onMinChange: (v: number) => void
  onMaxChange: (v: number) => void
}

export default function PriceRangeSlider({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)

  // Local state for smooth dragging — only commits on release
  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)

  // Sync from props when not dragging
  useEffect(() => {
    if (!dragging) {
      setLocalMin(minPrice)
      setLocalMax(maxPrice)
    }
  }, [minPrice, maxPrice, dragging])

  const min = clamp(localMin, PRICE_MIN, PRICE_MAX)
  const max = clamp(localMax, PRICE_MIN, PRICE_MAX)
  const leftPct = toPercent(min)
  const rightPct = toPercent(max)

  const getPercent = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return 0
    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100)
  }, [])

  const startDrag = useCallback(
    (thumb: 'min' | 'max') => (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      setDragging(thumb)
    },
    [],
  )

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      const pct = getPercent(e.clientX)
      const raw = snap(fromPercent(pct))
      if (dragging === 'min') {
        setLocalMin(clamp(raw, PRICE_MIN, max - STEP))
      } else {
        setLocalMax(clamp(raw, min + STEP, PRICE_MAX))
      }
    },
    [dragging, getPercent, min, max],
  )

  const stopDrag = useCallback(() => {
    if (dragging === 'min') {
      onMinChange(localMin)
    } else if (dragging === 'max') {
      onMaxChange(localMax)
    }
    setDragging(null)
  }, [dragging, localMin, localMax, onMinChange, onMaxChange])

  const onTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragging) return
      const pct = getPercent(e.clientX)
      const raw = snap(fromPercent(pct))
      const distMin = Math.abs(raw - min)
      const distMax = Math.abs(raw - max)
      if (distMin <= distMax) {
        const v = clamp(raw, PRICE_MIN, max - STEP)
        setLocalMin(v)
        onMinChange(v)
      } else {
        const v = clamp(raw, min + STEP, PRICE_MAX)
        setLocalMax(v)
        onMaxChange(v)
      }
    },
    [dragging, getPercent, min, max, onMinChange, onMaxChange],
  )

  return (
    <div className="px-[9px] pb-1">
      {/* Track area */}
      <div
        ref={trackRef}
        className="relative h-10 cursor-pointer"
        onClick={onTrackClick}
        onPointerMove={onMove}
        onPointerUp={stopDrag}
      >
        {/* Background track */}
        <div className="absolute top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full bg-slate-200" />

        {/* Filled track */}
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-green-600"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />

        {/* Min thumb */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${leftPct}%`, zIndex: dragging === 'min' ? 10 : 5 }}
        >
          <div
            onPointerDown={startDrag('min')}
            className={cn(
              'h-[18px] w-[18px] rounded-full border-2 border-green-600 bg-white shadow-sm transition-shadow touch-none',
              dragging === 'min'
                ? 'scale-110 shadow-md shadow-green-600/20'
                : 'hover:shadow-md hover:shadow-green-600/20',
            )}
          />
        </div>

        {/* Max thumb */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${rightPct}%`, zIndex: dragging === 'max' ? 10 : 5 }}
        >
          <div
            onPointerDown={startDrag('max')}
            className={cn(
              'h-[18px] w-[18px] rounded-full border-2 border-green-600 bg-white shadow-sm transition-shadow touch-none',
              dragging === 'max'
                ? 'scale-110 shadow-md shadow-green-600/20'
                : 'hover:shadow-md hover:shadow-green-600/20',
            )}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between txt-6 text-slate-400">
        <span>{formatLabel(min)}</span>
        <span>{formatLabel(max)}</span>
      </div>
    </div>
  )
}
