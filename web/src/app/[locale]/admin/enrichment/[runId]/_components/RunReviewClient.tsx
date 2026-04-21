"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BulkActionBar } from "./BulkActionBar"
import { EntityCard } from "./EntityCard"
import type { ProposalWithMeta } from "./types"

interface EntityData {
  key: string
  entityName: string
  entityType: string
  entityId: string | null
  proposals: ProposalWithMeta[]
  completeness: { score: number; missing: string[] } | null
  hasNameChange: boolean
  minConf: number
  maxConf: number
  hasLowConf: boolean
  isNewEntity: boolean
  existingFields?: Record<string, unknown>
}

interface RunReviewClientProps {
  runId: string
  status: string
  entityType: string
  mode: string
  sources: string[]
  durationMs: number | null
  totalProposals: number
  pendingCount: number
  appliedCount: number
  entities: EntityData[]
  runKeywords?: string[]
}

const STATUS_COLORS: Record<string, string> = {
  RUNNING: "bg-blue-100 text-blue-900",
  DONE: "bg-secondary-container text-on-secondary-container",
  FAILED: "bg-error-container text-on-error-container",
}

function formatDuration(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  const m = Math.floor(ms / 60000)
  const s = Math.round((ms % 60000) / 1000)
  return `${m}m ${s}s`
}

export function RunReviewClient(props: RunReviewClientProps) {
  const router = useRouter()
  const [status] = useState(props.status)
  const [approvedIds, setApprovedIds] = useState<Set<string>>(
    new Set(props.entities.flatMap(e => e.proposals.filter(p => p.status === "APPLIED").map(p => p.id)))
  )
  const [rejectedIds] = useState<Set<string>>(
    new Set(props.entities.flatMap(e => e.proposals.filter(p => p.status === "REJECTED").map(p => p.id)))
  )
  const [skippedIds] = useState<Set<string>>(
    new Set(props.entities.flatMap(e => e.proposals.filter(p => p.status === "SKIPPED").map(p => p.id)))
  )

  // Poll for status updates when RUNNING
  useEffect(() => {
    if (status !== "RUNNING") return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/enrichment/run/${props.runId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.status !== "RUNNING") {
          router.refresh()
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [status, props.runId, router])

  const approvedCount = approvedIds.size
  const pendingCount = props.entities.flatMap(e => e.proposals).filter(
    p => !approvedIds.has(p.id) && !rejectedIds.has(p.id) && !skippedIds.has(p.id) && p.status === "PENDING"
  ).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[status] ?? "bg-surface-container text-on-surface-variant"}`}>
              {status === "RUNNING" && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
              {status}
            </span>
            <span className="text-sm text-on-surface-variant">
              {props.sources.join(" · ")}
              {props.durationMs !== null && ` · ${formatDuration(props.durationMs)}`}
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-background">
            {props.entityType} — {props.mode}
          </h1>
        </div>

        <div className="flex gap-4 text-center flex-shrink-0">
          {[
            { label: "entities", value: props.entities.length },
            { label: "proposals", value: props.totalProposals },
            { label: "pending", value: pendingCount },
            { label: "approved", value: approvedCount },
            { label: "applied", value: props.appliedCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-container-lowest rounded-xl px-4 py-2 editorial-shadow text-center min-w-[60px]">
              <div className="font-headline text-xl font-bold text-on-background">{value}</div>
              <div className="text-xs text-on-surface-variant">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      <BulkActionBar
        runId={props.runId}
        approvedCount={approvedCount}
        allProposals={props.entities.flatMap(e => e.proposals)}
        onBulkApprove={(ids) => setApprovedIds(prev => new Set([...prev, ...ids]))}
        onApplyDone={() => router.refresh()}
      />

      {/* Entity cards */}
      <div className="space-y-3 mt-6">
        {props.entities.map(entity => (
          <EntityCard
            key={entity.key}
            runId={props.runId}
            entityId={entity.entityId}
            entityName={entity.entityName}
            entityType={entity.entityType}
            isNew={entity.isNewEntity}
            proposals={entity.proposals}
            existingFields={entity.existingFields ?? {}}
            runKeywords={props.runKeywords ?? []}
            onAdvance={() => router.refresh()}
          />
        ))}
        {props.entities.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            {status === "RUNNING"
              ? "Run in progress… proposals will appear when complete."
              : "No proposals generated for this run."}
          </div>
        )}
      </div>
    </div>
  )
}
