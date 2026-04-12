// web/src/app/api/enrichment/run/[runId]/route.ts

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { runId } = await params

  const run = await db.enrichmentRun.findUnique({
    where: { id: runId },
    include: {
      proposals: {
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  })

  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 })
  }

  const summary = {
    id: run.id,
    entityType: run.entityType,
    status: run.status,
    sources: run.sources,
    stats: run.stats,
    createdAt: run.createdAt,
    completedAt: run.completedAt,
    proposalCount: run.proposals.length,
    proposals: run.proposals.map((p) => ({
      id: p.id,
      entityName: p.entityName,
      changeType: p.changeType,
      fieldKey: p.fieldKey,
      fieldGroup: p.fieldGroup,
      fieldPriority: p.fieldPriority,
      currentValue: p.currentValue,
      proposedValue: p.proposedValue,
      confidence: p.confidence,
      sourceId: p.sourceId,
      sourceUrl: p.sourceUrl,
      status: p.status,
    })),
  }

  return NextResponse.json(summary)
}
