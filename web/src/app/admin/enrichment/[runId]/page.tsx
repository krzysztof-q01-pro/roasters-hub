import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { db } from "@/lib/db"
import { RunReviewClient } from "./_components/RunReviewClient"
import { getCompleteness } from "@/lib/enrichment/completeness"
import { stringSimilarity } from "@/lib/enrichment/similarity"

export const revalidate = 0

export default async function RunReviewPage({ params }: { params: Promise<{ runId: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const user = await currentUser()
  if (user?.publicMetadata?.role !== "ADMIN") redirect("/")

  const { runId } = await params

  const run = await db.enrichmentRun.findUnique({
    where: { id: runId },
    include: {
      proposals: {
        orderBy: [{ entityName: "asc" }, { fieldPriority: "asc" }],
      },
    },
  })

  if (!run) notFound()

  const query = run.query as Record<string, unknown>

  // Group proposals by entity
  const entityMap = new Map<string, {
    entityName: string
    entityType: string
    entityId: string | null
    proposals: typeof run.proposals
    completeness: { score: number; missing: string[] } | null
  }>()

  for (const p of run.proposals) {
    const key = p.entityId ?? `new:${p.entityName}:${p.entityType}`
    if (!entityMap.has(key)) {
      entityMap.set(key, {
        entityName: p.entityName,
        entityType: p.entityType,
        entityId: p.entityId ?? null,
        proposals: [],
        completeness: null,
      })
    }
    entityMap.get(key)!.proposals.push(p)
  }

  // Fetch completeness data for existing entities
  const roasterIds = [...entityMap.values()]
    .filter(e => e.entityType === "ROASTER" && e.entityId)
    .map(e => e.entityId!)

  const cafeIds = [...entityMap.values()]
    .filter(e => e.entityType === "CAFE" && e.entityId)
    .map(e => e.entityId!)

  const [roasters, cafes] = await Promise.all([
    roasterIds.length > 0
      ? db.roaster.findMany({ where: { id: { in: roasterIds } } })
      : Promise.resolve([]),
    cafeIds.length > 0
      ? db.cafe.findMany({ where: { id: { in: cafeIds } } })
      : Promise.resolve([]),
  ])

  const roasterMap = new Map(roasters.map(r => [r.id, r]))
  const cafeMap = new Map(cafes.map(c => [c.id, c]))

  // Compute completeness and add flags per entity
  const entities = [...entityMap.entries()].map(([key, entity]) => {
    let completeness = null
    if (entity.entityId) {
      if (entity.entityType === "ROASTER") {
        const r = roasterMap.get(entity.entityId)
        if (r) completeness = getCompleteness(r as Record<string, unknown>, "ROASTER")
      } else {
        const c = cafeMap.get(entity.entityId)
        if (c) completeness = getCompleteness(c as Record<string, unknown>, "CAFE")
      }
    }

    const hasNameChange = entity.proposals.some(p => p.fieldKey === "name" && p.changeType === "UPDATE")
    const minConf = Math.min(...entity.proposals.map(p => p.confidence))
    const maxConf = Math.max(...entity.proposals.map(p => p.confidence))
    const hasLowConf = minConf < 0.6
    const isNewEntity = entity.proposals.some(p => p.changeType === "NEW_PLACE")

    // Compute similarity for NAME_CHANGE proposals
    const proposalsWithMeta = entity.proposals.map(p => {
      let nameSimilarity: number | null = null
      if (p.fieldKey === "name" && p.changeType === "UPDATE") {
        const curr = typeof p.currentValue === "string" ? p.currentValue : String(p.currentValue ?? "")
        const prop = typeof p.proposedValue === "string" ? p.proposedValue : String(p.proposedValue ?? "")
        nameSimilarity = stringSimilarity(curr, prop)
      }
      return { ...p, nameSimilarity }
    })

    return {
      key,
      entityName: entity.entityName,
      entityType: entity.entityType,
      entityId: entity.entityId,
      proposals: proposalsWithMeta,
      completeness,
      hasNameChange,
      minConf,
      maxConf,
      hasLowConf,
      isNewEntity,
    }
  })

  const pendingCount = run.proposals.filter(p => p.status === "PENDING").length
  const appliedCount = run.proposals.filter(p => p.status === "APPLIED").length

  const durationMs = run.completedAt
    ? run.completedAt.getTime() - run.createdAt.getTime()
    : null

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/admin/enrichment" className="text-on-surface-variant hover:text-on-background text-sm">← Back to runs</Link>
        </div>

        <RunReviewClient
          runId={runId}
          status={run.status}
          entityType={String(query.entityType ?? "")}
          mode={String(query.mode ?? "")}
          sources={run.sources}
          durationMs={durationMs}
          totalProposals={run.proposals.length}
          pendingCount={pendingCount}
          appliedCount={appliedCount}
          entities={entities}
        />
      </main>
      <Footer />
    </>
  )
}
