-- CreateTable
CREATE TABLE "cafe_events" (
    "id" TEXT NOT NULL,
    "cafeId" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cafe_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_cafes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cafeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_cafes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cafe_events_cafeId_idx" ON "cafe_events"("cafeId");

-- CreateIndex
CREATE INDEX "cafe_events_cafeId_type_idx" ON "cafe_events"("cafeId", "type");

-- CreateIndex
CREATE INDEX "cafe_events_createdAt_idx" ON "cafe_events"("createdAt");

-- CreateIndex
CREATE INDEX "saved_cafes_userId_idx" ON "saved_cafes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_cafes_userId_cafeId_key" ON "saved_cafes"("userId", "cafeId");

-- AddForeignKey
ALTER TABLE "cafe_events" ADD CONSTRAINT "cafe_events_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "cafes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_cafes" ADD CONSTRAINT "saved_cafes_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "cafes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_cafes" ADD CONSTRAINT "saved_cafes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
