-- CreateEnum
CREATE TYPE "RoasterStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ROASTER', 'ADMIN');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PAGE_VIEW', 'CONTACT_CLICK', 'SHOP_CLICK', 'WEBSITE_CLICK', 'MAP_CLICK', 'SHARE_CLICK');

-- CreateEnum
CREATE TYPE "NewsletterSegment" AS ENUM ('CAFE', 'CONSUMER', 'ROASTER');

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ROASTER',
    "roasterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roasters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "website" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "shopUrl" TEXT,
    "certifications" TEXT[],
    "origins" TEXT[],
    "roastStyles" TEXT[],
    "status" "RoasterStatus" NOT NULL DEFAULT 'PENDING',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roasters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roaster_images" (
    "id" TEXT NOT NULL,
    "roasterId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "roaster_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_events" (
    "id" TEXT NOT NULL,
    "roasterId" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_notes" (
    "id" TEXT NOT NULL,
    "roasterId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "segment" "NewsletterSegment" NOT NULL DEFAULT 'CONSUMER',
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_roasterId_key" ON "user_profiles"("roasterId");

-- CreateIndex
CREATE UNIQUE INDEX "roasters_slug_key" ON "roasters"("slug");

-- CreateIndex
CREATE INDEX "roasters_status_idx" ON "roasters"("status");

-- CreateIndex
CREATE INDEX "roasters_country_idx" ON "roasters"("country");

-- CreateIndex
CREATE INDEX "roasters_countryCode_idx" ON "roasters"("countryCode");

-- CreateIndex
CREATE INDEX "roasters_city_idx" ON "roasters"("city");

-- CreateIndex
CREATE INDEX "roasters_featured_idx" ON "roasters"("featured");

-- CreateIndex
CREATE INDEX "roasters_status_featured_idx" ON "roasters"("status", "featured");

-- CreateIndex
CREATE INDEX "roaster_images_roasterId_idx" ON "roaster_images"("roasterId");

-- CreateIndex
CREATE INDEX "profile_events_roasterId_idx" ON "profile_events"("roasterId");

-- CreateIndex
CREATE INDEX "profile_events_roasterId_type_idx" ON "profile_events"("roasterId", "type");

-- CreateIndex
CREATE INDEX "profile_events_createdAt_idx" ON "profile_events"("createdAt");

-- CreateIndex
CREATE INDEX "admin_notes_roasterId_idx" ON "admin_notes"("roasterId");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "roasters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roaster_images" ADD CONSTRAINT "roaster_images_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "roasters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_events" ADD CONSTRAINT "profile_events_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "roasters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "roasters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
