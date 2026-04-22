"use client"

import { useState, useTransition } from "react"
import { updateProposalStatus } from "../../actions"
import { NameChangeModal } from "./NameChangeModal"
import type { ProposalWithMeta } from "./types"

const WARNING_LABELS: Record<string, string> = {
  INVALID_PHONE: "⚠ Invalid phone",
  INVALID_URL: "⚠ Invalid URL",
  YEAR_SUSPICIOUS: "⚠ Suspicious year",
  ARRAY_DOWNGRADE: "⚠ Array shorter",
  URL_CHANGED: "⚠ URL changed",
}

function detectWarning(p: ProposalWithMeta): string | null {
  const proposed = p.proposedValue
  if (p.fieldKey === "phone") {
    const s = String(proposed ?? "")
    if (s && !/^\+?[\d\s\-()]{7,20}$/.test(s)) return "INVALID_PHONE"
  }
  if (p.fieldKey === "website" || p.fieldKey === "shopUrl") {
    const s = String(proposed ?? "")
    if (s && !s.startsWith("http")) return "INVALID_URL"
    // Different domain than current
    if (p.currentValue && s && p.changeType === "UPDATE") {
      const curr = String(p.currentValue)
      const currDomain = curr.replace(/^https?:\/\//, "").split("/")[0]
      const newDomain = s.replace(/^https?:\/\//, "").split("/")[0]
      if (currDomain !== newDomain) return "URL_CHANGED"
    }
  }
  if (p.fieldKey === "foundedYear") {
    const y = Number(proposed)
    if (y && (y < 1800 || y > new Date().getFullYear())) return "YEAR_SUSPICIOUS"
  }
  if (Array.isArray(p.currentValue) && Array.isArray(proposed)) {
    if ((p.currentValue as unknown[]).length > (proposed as unknown[]).length) return "ARRAY_DOWNGRADE"
  }
  return null
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (Array.isArray(value)) return value.join(", ") || "—"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100)
  const color = pct >= 80 ? "bg-secondary" : pct >= 60 ? "bg-amber-400" : "bg-error"
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-on-surface-variant">{pct}%</span>
    </div>
  )
}

interface ProposalRowProps {
  proposal: ProposalWithMeta
  status: "PENDING" | "APPLIED" | "REJECTED" | "SKIPPED"
  onApprove: () => void
  onReject: () => void
  onSkip: () => void
}

function ProposalRow({ proposal: p, status, onApprove, onReject, onSkip }: ProposalRowProps) {
  const [isPending, startTransition] = useTransition()
  const [showNameModal, setShowNameModal] = useState(false)
  const warning = detectWarning(p)
  const isNameChange = p.fieldKey === "name" && p.changeType === "UPDATE"

  function act(action: "APPLIED" | "REJECTED" | "SKIPPED", cb: () => void) {
    startTransition(async () => {
      await updateProposalStatus(p.id, action)
      cb()
    })
  }

  const rowBg = status === "APPLIED"
    ? "bg-secondary-container/30"
    : status === "REJECTED"
    ? "bg-error-container/20"
    : status === "SKIPPED"
    ? "bg-surface-container/50"
    : ""

  return (
    <>
      <tr className={`border-t border-outline-variant/10 text-sm ${rowBg}`}>
        <td className="px-4 py-2.5">
          <div className="font-mono text-xs text-on-background">{p.fieldKey}</div>
          <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">{p.fieldGroup}</div>
        </td>
        <td className="px-4 py-2.5 text-on-surface-variant text-xs max-w-[160px] truncate" title={formatValue(p.currentValue)}>
          {formatValue(p.currentValue)}
        </td>
        <td className="px-4 py-2.5 text-on-background text-xs font-medium max-w-[180px] truncate" title={formatValue(p.proposedValue)}>
          {formatValue(p.proposedValue)}
        </td>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] font-mono uppercase">{p.sourceId}</span>
            {p.sourceUrl && (
              <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-[10px] hover:underline">↗</a>
            )}
          </div>
        </td>
        <td className="px-4 py-2.5">
          <ConfidenceBar confidence={p.confidence} />
        </td>
        <td className="px-4 py-2.5">
          {warning && (
            <span className="text-amber-700 text-[10px] font-bold whitespace-nowrap">
              {WARNING_LABELS[warning] ?? warning}
            </span>
          )}
        </td>
        <td className="px-4 py-2.5">
          {isNameChange ? (
            <button
              onClick={() => setShowNameModal(true)}
              className="text-amber-700 text-xs font-bold hover:underline whitespace-nowrap"
            >
              → Review
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => act("APPLIED", onApprove)}
                disabled={isPending || status === "APPLIED"}
                className={`w-7 h-7 rounded text-sm font-bold transition-colors ${status === "APPLIED" ? "bg-secondary text-on-secondary" : "bg-surface-container hover:bg-secondary-container text-on-surface-variant"}`}
                title="Approve"
              >✓</button>
              <button
                onClick={() => act("REJECTED", onReject)}
                disabled={isPending || status === "REJECTED"}
                className={`w-7 h-7 rounded text-sm font-bold transition-colors ${status === "REJECTED" ? "bg-error text-on-error" : "bg-surface-container hover:bg-error-container text-on-surface-variant"}`}
                title="Reject"
              >✗</button>
              <button
                onClick={() => act("SKIPPED", onSkip)}
                disabled={isPending || status === "SKIPPED"}
                className={`w-7 h-7 rounded text-sm font-bold transition-colors ${status === "SKIPPED" ? "bg-surface-container-high text-on-surface-variant" : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"}`}
                title="Skip"
              >–</button>
            </div>
          )}
        </td>
      </tr>
      {showNameModal && (
        <tr>
          <td colSpan={7} className="p-0">
            <NameChangeModal
              proposal={p}
              onClose={() => setShowNameModal(false)}
              onApprove={() => { onApprove(); setShowNameModal(false) }}
              onReject={() => { onReject(); setShowNameModal(false) }}
            />
          </td>
        </tr>
      )}
    </>
  )
}

interface ProposalTableProps {
  proposals: ProposalWithMeta[]
  approvedIds: Set<string>
  rejectedIds: Set<string>
  skippedIds: Set<string>
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onSkip: (id: string) => void
}

export function ProposalTable({ proposals, approvedIds, rejectedIds, skippedIds, onApprove, onReject, onSkip }: ProposalTableProps) {
  function getStatus(id: string, originalStatus: string): "PENDING" | "APPLIED" | "REJECTED" | "SKIPPED" {
    if (approvedIds.has(id)) return "APPLIED"
    if (rejectedIds.has(id)) return "REJECTED"
    if (skippedIds.has(id)) return "SKIPPED"
    return originalStatus as "PENDING" | "APPLIED" | "REJECTED" | "SKIPPED"
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-surface-container-low text-left text-[10px] uppercase tracking-widest text-on-surface-variant">
          <tr>
            <th className="px-4 py-2 font-bold">Field</th>
            <th className="px-4 py-2 font-bold">Current</th>
            <th className="px-4 py-2 font-bold">Proposed</th>
            <th className="px-4 py-2 font-bold">Source</th>
            <th className="px-4 py-2 font-bold">Confidence</th>
            <th className="px-4 py-2 font-bold">Warning</th>
            <th className="px-4 py-2 font-bold">Action</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map(p => (
            <ProposalRow
              key={p.id}
              proposal={p}
              status={getStatus(p.id, p.status)}
              onApprove={() => onApprove(p.id)}
              onReject={() => onReject(p.id)}
              onSkip={() => onSkip(p.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
