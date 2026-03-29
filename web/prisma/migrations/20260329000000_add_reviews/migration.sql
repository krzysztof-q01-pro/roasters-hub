-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "roasterId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_roasterId_idx" ON "reviews"("roasterId");

-- CreateIndex
CREATE INDEX "reviews_roasterId_status_idx" ON "reviews"("roasterId", "status");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "roasters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
