"use client"

import { useTransition } from "react"
import { updateProposalStatus } from "../../actions"
import { slugify } from "@/lib/slug"
import type { ProposalWithMeta } from "./types"

interface NameChangeModalProps {
  proposal: ProposalWithMeta
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}

export function NameChangeModal({ proposal: p, onClose, onApprove, onReject }: NameChangeModalProps) {
  const [isPending, startTransition] = useTransition()

  const currentName = typeof p.currentValue === "string" ? p.currentValue : String(p.currentValue ?? "")
  const proposedName = typeof p.proposedValue === "string" ? p.proposedValue : String(p.proposedValue ?? "")

  const currentSlug = slugify(currentName)
  const newSlug = slugify(proposedName)

  const similarity = p.nameSimilarity ?? 0
  const isFormatting = similarity >= 0.85
  const similarityPct = Math.round(similarity * 100)
  const entityPath = p.entityType === "ROASTER" ? "roasters" : "cafes"

  function handleApprove() {
    startTransition(async () => {
      await updateProposalStatus(p.id, "APPROVED")
      onApprove()
    })
  }

  function handleReject() {
    startTransition(async () => {
      await updateProposalStatus(p.id, "REJECTED")
      onReject()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 editorial-shadow"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <h2 className="font-headline text-xl font-bold text-on-background">⚠ Name change — review impact</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-background text-xl leading-none">×</button>
        </div>

        {/* Comparison */}
        <div className="space-y-3 mb-5">
          <div className="bg-surface-container rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">Current</div>
            <div className="font-bold text-on-background">{currentName}</div>
            <div className="text-xs text-on-surface-variant font-mono mt-1">/{entityPath}/{currentSlug}</div>
          </div>
          <div className="bg-primary-container rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-on-primary-container/70 font-bold mb-1">Proposed</div>
            <div className="font-bold text-on-primary-container">{proposedName}</div>
            <div className="text-xs text-on-primary-container/70 font-mono mt-1">/{entityPath}/{newSlug}</div>
          </div>
        </div>

        {/* Similarity */}
        <div className={`rounded-xl px-4 py-3 mb-5 text-sm ${isFormatting ? "bg-secondary-container text-on-secondary-container" : "bg-amber-100 text-amber-900"}`}>
          <span className="font-bold">Similarity: {similarityPct}%</span>
          {" — "}
          {isFormatting ? "Likely formatting fix (capitalization/punctuation)" : "Significant change — verify manually"}
        </div>

        {/* Source */}
        <div className="flex items-center gap-3 text-sm text-on-surface-variant mb-5">
          <span>Source: <span className="font-mono bg-surface-container px-1.5 py-0.5 rounded">{p.sourceId}</span></span>
          <span>Confidence: {Math.round(p.confidence * 100)}%</span>
          {p.sourceUrl && (
            <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View source ↗</a>
          )}
        </div>

        {/* Consequences */}
        <div className="bg-surface-container rounded-xl px-4 py-3 text-sm text-on-surface-variant mb-6">
          <p className="font-bold text-on-background mb-1">If approved:</p>
          <ul className="space-y-0.5">
            <li>• URL <span className="font-mono">/{entityPath}/{currentSlug}</span> → <span className="font-mono">/{entityPath}/{newSlug}</span></li>
            <li>• Slug redirect created automatically (301)</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Approve name change"}
          </button>
          <button
            onClick={handleReject}
            disabled={isPending}
            className="bg-error-container text-on-error-container px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
