-- CreateEnum
CREATE TYPE "CafeStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "cafeId" TEXT,
ALTER COLUMN "roasterId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "cafeId" TEXT;

-- CreateTable
CREATE TABLE "cafes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "website" TEXT,
    "instagram" TEXT,
    "phone" TEXT,
    "logoUrl" TEXT,
    "coverImageUrl" TEXT,
    "status" "CafeStatus" NOT NULL DEFAULT 'PENDING',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cafes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cafe_roaster_relations" (
    "id" TEXT NOT NULL,
    "cafeId" TEXT NOT NULL,
    "roasterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cafe_roaster_relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cafes_slug_key" ON "cafes"("slug");

-- CreateIndex
CREATE INDEX "cafes_status_idx" ON "cafes"("status");

-- CreateIndex
CREATE INDEX "cafes_country_idx" ON "cafes"("country");

-- CreateIndex
CREATE INDEX "cafes_city_idx" ON "cafes"("city");

-- CreateIndex
CREATE INDEX "cafe_roaster_relations_cafeId_idx" ON "cafe_roaster_relations"("cafeId");

-- CreateIndex
CREATE INDEX "cafe_roaster_relations_roasterId_idx" ON "cafe_roaster_relations"("roasterId");

-- CreateIndex
CREATE UNIQUE INDEX "cafe_roaster_relations_cafeId_roasterId_key" ON "cafe_roaster_relations"("cafeId", "roasterId");

-- CreateIndex
CREATE INDEX "reviews_cafeId_idx" ON "reviews"("cafeId");

-- CreateIndex
CREATE INDEX "reviews_cafeId_status_idx" ON "reviews"("cafeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_cafeId_key" ON "user_profiles"("cafeId");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "cafes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "cafes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cafe_roaster_relations" ADD CONSTRAINT "cafe_roaster_relations_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "cafes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cafe_roaster_relations" ADD CONSTRAINT "cafe_roaster_relations_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "roasters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
