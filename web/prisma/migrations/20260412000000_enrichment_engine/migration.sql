-- Migration: enrichment_engine
-- Adds taxonomy fields to Roaster, taxonomy fields to Cafe,
-- and new EnrichmentRun / EnrichmentProposal models.

-- Roaster: new taxonomy fields
ALTER TABLE "roasters" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "roasters" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
ALTER TABLE "roasters" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "roasters" ADD COLUMN IF NOT EXISTS "foundedYear" INTEGER;
ALTER TABLE "roasters" ADD COLUMN IF NOT EXISTS "brewingMethods" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "roasters" ADD COLUMN IF NOT EXISTS "wholesaleAvailable" BOOLEAN;
ALTER TABLE "roasters" ADD COLUMN IF NOT EXISTS "subscriptionAvailable" BOOLEAN;
ALTER TABLE "roasters" ADD COLUMN IF NOT EXISTS "openingHours" JSONB;
ALTER TABLE "roasters" ADD COLUMN IF NOT EXISTS "hasCafe" BOOLEAN;
ALTER TABLE "roasters" ADD COLUMN IF NOT EXISTS "hasTastingRoom" BOOLEAN;

-- Cafe: new taxonomy fields
ALTER TABLE "cafes" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
ALTER TABLE "cafes" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "cafes" ADD COLUMN IF NOT EXISTS "priceRange" TEXT;
ALTER TABLE "cafes" ADD COLUMN IF NOT EXISTS "seatingCapacity" INTEGER;

-- Enums for enrichment status fields
CREATE TYPE "EnrichmentRunStatus" AS ENUM ('RUNNING', 'DONE', 'FAILED');
CREATE TYPE "EnrichmentProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SKIPPED');

-- EnrichmentRun model
CREATE TABLE IF NOT EXISTS "enrichment_runs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "query" JSONB NOT NULL,
    "sources" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" "EnrichmentRunStatus" NOT NULL DEFAULT 'RUNNING'::"EnrichmentRunStatus",
    "stats" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "enrichment_runs_pkey" PRIMARY KEY ("id")
);

-- EnrichmentProposal model
CREATE TABLE IF NOT EXISTS "enrichment_proposals" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "entityName" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fieldGroup" TEXT NOT NULL,
    "fieldPriority" TEXT NOT NULL,
    "currentValue" JSONB,
    "proposedValue" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "status" "EnrichmentProposalStatus" NOT NULL DEFAULT 'PENDING'::"EnrichmentProposalStatus",
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrichment_proposals_pkey" PRIMARY KEY ("id")
);

-- EnrichmentProposal foreign key + indexes
ALTER TABLE "enrichment_proposals" ADD CONSTRAINT "enrichment_proposals_runId_fkey" FOREIGN KEY ("runId") REFERENCES "enrichment_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "enrichment_proposals_runId_idx" ON "enrichment_proposals"("runId");
CREATE INDEX IF NOT EXISTS "enrichment_proposals_entityId_idx" ON "enrichment_proposals"("entityId");
CREATE INDEX IF NOT EXISTS "enrichment_proposals_status_idx" ON "enrichment_proposals"("status");
