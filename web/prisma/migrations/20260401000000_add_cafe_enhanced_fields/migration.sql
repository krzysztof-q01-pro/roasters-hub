-- AlterTable
ALTER TABLE "cafes" ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "openingHours" TEXT,
ADD COLUMN     "serving" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "cafes_serving_idx" ON "cafes" USING GIN ("serving");

-- CreateIndex
CREATE INDEX "cafes_services_idx" ON "cafes" USING GIN ("services");