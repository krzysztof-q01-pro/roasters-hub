-- Migration: enrichment_ux
-- Adds EnrichmentTag model, Roaster.coverImageUrl, removes APPROVED from EnrichmentProposalStatus

-- AlterEnum: Remove APPROVED, keep PENDING | REJECTED | SKIPPED | APPLIED
BEGIN;
CREATE TYPE "EnrichmentProposalStatus_new" AS ENUM ('PENDING', 'REJECTED', 'SKIPPED', 'APPLIED');
ALTER TABLE "public"."enrichment_proposals" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "enrichment_proposals" ALTER COLUMN "status" TYPE "EnrichmentProposalStatus_new" USING ("status"::text::"EnrichmentProposalStatus_new");
ALTER TYPE "EnrichmentProposalStatus" RENAME TO "EnrichmentProposalStatus_old";
ALTER TYPE "EnrichmentProposalStatus_new" RENAME TO "EnrichmentProposalStatus";
DROP TYPE "public"."EnrichmentProposalStatus_old";
ALTER TABLE "enrichment_proposals" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable: Add coverImageUrl to roasters
ALTER TABLE "roasters" ADD COLUMN     "coverImageUrl" TEXT;

-- CreateTable: EnrichmentTag
CREATE TABLE "enrichment_tags" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrichment_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique constraint on entityType + value
CREATE UNIQUE INDEX "enrichment_tags_entityType_value_key" ON "enrichment_tags"("entityType", "value");
