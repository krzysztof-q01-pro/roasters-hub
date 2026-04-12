// web/src/app/api/enrichment/run/route.ts

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { runEnrichment, type EnrichmentRunParams } from '@/lib/enrichment/engine/engine'
import { getAdapters } from '@/lib/enrichment/registry'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 401 })
  }

  let body: EnrichmentRunParams
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { entityType, country, city, sources, mode, limit, consent } = body

  if (entityType !== 'CAFE' && entityType !== 'ROASTER') {
    return NextResponse.json(
      { error: 'entityType must be CAFE or ROASTER' },
      { status: 400 },
    )
  }

  const adapters = getAdapters(sources, consent ?? false)
  if (adapters.length === 0) {
    return NextResponse.json(
      { error: 'No adapters available for given sources. Check source IDs or consent flag.' },
      { status: 400 },
    )
  }

  try {
    const runId = await runEnrichment(
      { entityType, country, city, sources, mode, limit: limit ?? 10, consent },
      adapters,
    )
    return NextResponse.json({ runId }, { status: 200 })
  } catch (error) {
    console.error('[POST /api/enrichment/run]', error)
    return NextResponse.json({ error: 'Enrichment run failed' }, { status: 500 })
  }
}
