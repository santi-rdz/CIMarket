'use client'

const PRICE_MIN = 0
const PRICE_MAX = 10_000
const STEP = 100

function toPercent(value: number) {
  return ((value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
}

type Props = {
  minPrice: number
  maxPrice: number
  onMinChange: (v: number) => void
  onMaxChange: (v: number) => void
}

export default function PriceRangeSlider({ minPrice, maxPrice, onMinChange, onMaxChange }: Props) {
  const clampedMin = Math.max(PRICE_MIN, Math.min(minPrice, PRICE_MAX))
  const clampedMax = Math.max(PRICE_MIN, Math.min(maxPrice, PRICE_MAX))
  const leftPct = toPercent(clampedMin)
  const rightPct = toPercent(clampedMax)

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.min(Number(e.target.value), maxPrice - STEP)
    onMinChange(v)
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Math.max(Number(e.target.value), minPrice + STEP)
    onMaxChange(v)
  }

  return (
    <div>
      {/* Track + thumbs */}
      <div className="relative h-5">
        {/* Background track */}
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-slate-200" />

        {/* Filled track */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-green-600"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={STEP}
          value={clampedMin}
          onChange={handleMinChange}
          className="price-range-slider"
          style={{ zIndex: clampedMin >= clampedMax - STEP ? 5 : 3 }}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={STEP}
          value={clampedMax}
          onChange={handleMaxChange}
          className="price-range-slider"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Labels */}
      <div className="mt-1.5 flex justify-between text-xs text-slate-400">
        <span>$0</span>
        <span>$10,000</span>
      </div>
    </div>
  )
}
