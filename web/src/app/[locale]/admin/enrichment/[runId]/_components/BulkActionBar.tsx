"use client"

import { useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { bulkApplyByConfidence, applyEnrichmentRun } from "../../actions"
import type { ProposalWithMeta } from "./types"

interface BulkActionBarProps {
  runId: string
  approvedCount: number
  allProposals: ProposalWithMeta[]
  onBulkApprove: (ids: string[]) => void
  onApplyDone: () => void
}

export function BulkActionBar({ runId, approvedCount, allProposals, onBulkApprove, onApplyDone }: BulkActionBarProps) {
  const t = useTranslations("admin")
  const [threshold, setThreshold] = useState(75)
  const [isPending, startTransition] = useTransition()
  const [applyPending, startApply] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleBulkApprove() {
    startTransition(async () => {
      setMessage(null)
      setError(null)
      const result = await bulkApplyByConfidence(runId, threshold)
      if (result.success) {
        // Optimistically mark proposals that qualify as APPLIED
        const eligibleIds = allProposals
          .filter(p =>
            p.status === "PENDING" &&
            p.confidence >= threshold / 100 &&
            p.fieldKey !== "name"
          )
          .map(p => p.id)
        onBulkApprove(eligibleIds)
        setMessage(t("appliedProposals", { count: result.data.applied }))
      } else {
        setError(result.error ?? t("failedBulkApply"))
      }
    })
  }

  function handleApply() {
    startApply(async () => {
      setMessage(null)
      setError(null)
      const result = await applyEnrichmentRun(runId)
      if (result.success) {
        setMessage(t("appliedChanges", { count: result.data.applied }))
        onApplyDone()
      } else {
        setError(result.error ?? t("failedApplyChanges"))
      }
    })
  }

  // Count proposals that would be approved at current threshold
  const eligibleCount = allProposals.filter(p =>
    p.status === "PENDING" &&
    p.confidence >= threshold / 100 &&
    !(p.fieldKey === "name" && p.changeType === "UPDATE")
  ).length

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 editorial-shadow sticky top-4 z-10">
      <div className="flex items-center gap-6 flex-wrap">
        {/* Threshold slider */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <span className="text-xs text-on-surface-variant whitespace-nowrap">{t("confidence")}</span>
          <input
            type="range"
            min={50}
            max={100}
            step={5}
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-sm font-bold text-on-background w-10 text-right">{threshold}%</span>
        </div>

        <button
          onClick={handleBulkApprove}
          disabled={isPending || eligibleCount === 0}
          className="bg-surface-container text-on-background px-4 py-2 rounded-lg text-sm font-bold hover:bg-surface-container-high transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isPending ? t("applying") : t("applyAboveThreshold", { count: eligibleCount })}
        </button>

        <button
          onClick={handleApply}
          disabled={applyPending || approvedCount === 0}
          className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
        >
          {applyPending ? t("applying") : t("applyApproved", { count: approvedCount })}
        </button>
      </div>

      {(message || error) && (
        <div className={`mt-3 text-sm px-3 py-2 rounded-lg ${error ? "bg-error-container text-on-error-container" : "bg-secondary-container text-on-secondary-container"}`}>
          {error ?? message}
        </div>
      )}
    </div>
  )
}
