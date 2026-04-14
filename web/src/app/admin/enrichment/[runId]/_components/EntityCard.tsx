"use client"

import { useState } from "react"
import { ProposalTable } from "./ProposalTable"
import { CompletenessBar } from "./CompletenessBar"
import { updateProposalStatus } from "../../actions"
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
}

interface EntityCardProps {
  entity: EntityData
  approvedIds: Set<string>
  rejectedIds: Set<string>
  skippedIds: Set<string>
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSkip: (id: string) => void
}

export function EntityCard({ entity, approvedIds, rejectedIds, skippedIds, onApprove, onReject, onSkip }: EntityCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [approveAllPending, setApproveAllPending] = useState(false)
  const [skipAllPending, setSkipAllPending] = useState(false)

  const pendingProposals = entity.proposals.filter(p =>
    !approvedIds.has(p.id) && !rejectedIds.has(p.id) && !skippedIds.has(p.id) && p.status === "PENDING"
  )
  async function handleApproveAll() {
    if (entity.hasNameChange) return
    setApproveAllPending(true)
    const pending = pendingProposals.filter(p => !(p.fieldKey === "name" && p.changeType === "UPDATE"))
    await Promise.all(pending.map(p => updateProposalStatus(p.id, "APPLIED")))
    pending.forEach(p => onApprove(p.id))
    setApproveAllPending(false)
  }

  async function handleSkipAll() {
    setSkipAllPending(true)
    await Promise.all(pendingProposals.map(p => updateProposalStatus(p.id, "SKIPPED")))
    pendingProposals.forEach(p => onSkip(p.id))
    setSkipAllPending(false)
  }

  const confDisplay = entity.minConf === entity.maxConf
    ? `${Math.round(entity.minConf * 100)}%`
    : `${Math.round(entity.minConf * 100)}–${Math.round(entity.maxConf * 100)}%`

  return (
    <div className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-4 px-5 py-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-on-surface-variant hover:text-on-background transition-colors text-sm flex-shrink-0"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? "▼" : "▶"}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setExpanded(!expanded)}
              className="font-bold text-on-background hover:text-primary transition-colors text-left"
            >
              {entity.entityName}
            </button>
            <span className="bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-xs font-mono">
              {entity.entityType}
            </span>
            <span className="text-on-surface-variant text-xs">
              {entity.proposals.length} proposals · conf {confDisplay}
            </span>
          </div>

          {/* Flags */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {entity.isNewEntity && (
              <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-xs font-bold">NEW ENTITY</span>
            )}
            {entity.hasNameChange && (
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">⚠ NAME CHANGE</span>
            )}
            {entity.hasLowConf && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">LOW CONF</span>
            )}
          </div>
        </div>

        {/* Completeness */}
        {entity.completeness && (
          <div className="flex-shrink-0 w-32">
            <CompletenessBar score={entity.completeness.score} missing={entity.completeness.missing} />
          </div>
        )}

        {/* Bulk actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleApproveAll}
            disabled={entity.hasNameChange || approveAllPending || pendingProposals.length === 0}
            title={entity.hasNameChange ? "Cannot bulk approve — entity has a name change" : "Approve all pending"}
            className="text-xs px-3 py-1.5 rounded-lg bg-secondary-container text-on-secondary-container font-bold hover:opacity-80 transition-opacity disabled:opacity-30"
          >
            {approveAllPending ? "…" : "Approve all"}
          </button>
          <button
            onClick={handleSkipAll}
            disabled={skipAllPending || pendingProposals.length === 0}
            className="text-xs px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-bold hover:bg-surface-container-high transition-colors disabled:opacity-30"
          >
            {skipAllPending ? "…" : "Skip all"}
          </button>
        </div>
      </div>

      {/* Expanded proposals */}
      {expanded && (
        <div className="border-t border-outline-variant/20">
          <ProposalTable
            proposals={entity.proposals}
            approvedIds={approvedIds}
            rejectedIds={rejectedIds}
            skippedIds={skippedIds}
            onApprove={onApprove}
            onReject={onReject}
            onSkip={onSkip}
          />
        </div>
      )}
    </div>
  )
}
