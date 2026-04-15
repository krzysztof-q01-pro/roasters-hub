// web/src/app/api/enrichment/run/route.ts

import { after } from 'next/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import {
  initEnrichmentRun,
  executeEnrichmentRun,
  type EnrichmentRunParams,
} from '@/lib/enrichment/engine/engine'
import { getAdapters } from '@/lib/enrichment/registry'

// Apify actors can take 2–5 minutes; after() runs post-response within this budget
export const maxDuration = 300

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: EnrichmentRunParams
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { entityType, country, city, sources, mode, limit, consent, keywords } = body

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

  const params: EnrichmentRunParams = {
    entityType,
    country,
    city,
    sources,
    mode,
    limit: limit ?? 10,
    consent,
    keywords: keywords ?? [],
  }

  let runId: string
  try {
    // Create the DB record immediately so we can redirect without waiting for Apify
    runId = await initEnrichmentRun(params, adapters)
  } catch (error) {
    console.error('[POST /api/enrichment/run] init failed:', error)
    return NextResponse.json({ error: 'Failed to start enrichment run' }, { status: 500 })
  }

  // Execute asynchronously after response is sent (uses remaining maxDuration budget)
  after(async () => {
    await executeEnrichmentRun(runId, params, adapters).catch((error) => {
      console.error('[POST /api/enrichment/run] background execution failed:', error)
    })
  })

  return NextResponse.json({ runId }, { status: 200 })
}
