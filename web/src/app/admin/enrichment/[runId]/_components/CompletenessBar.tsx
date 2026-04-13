"use client"

import { useState } from "react"

interface CompletenessBarProps {
  score: number
  missing: string[]
}

export function CompletenessBar({ score, missing }: CompletenessBarProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const color = score >= 80 ? "bg-secondary" : score >= 50 ? "bg-amber-400" : "bg-error"

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-xs text-on-surface-variant font-bold w-8 text-right">{score}%</span>
      </div>

      {showTooltip && missing.length > 0 && (
        <div className="absolute bottom-full right-0 mb-2 z-20 bg-surface-container-highest text-on-background text-xs rounded-xl px-3 py-2 shadow-lg min-w-[160px] max-w-[240px]">
          <p className="font-bold mb-1 text-on-surface-variant uppercase tracking-wider text-[10px]">Missing fields</p>
          <p className="text-on-background leading-relaxed">{missing.join(", ")}</p>
        </div>
      )}
    </div>
  )
}
