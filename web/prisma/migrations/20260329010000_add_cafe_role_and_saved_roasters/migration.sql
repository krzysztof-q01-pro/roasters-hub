-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'CAFE';

-- CreateTable
CREATE TABLE "saved_roasters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roasterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_roasters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_roasters_userId_idx" ON "saved_roasters"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_roasters_userId_roasterId_key" ON "saved_roasters"("userId", "roasterId");

-- AddForeignKey
ALTER TABLE "saved_roasters" ADD CONSTRAINT "saved_roasters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_roasters" ADD CONSTRAINT "saved_roasters_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "roasters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
