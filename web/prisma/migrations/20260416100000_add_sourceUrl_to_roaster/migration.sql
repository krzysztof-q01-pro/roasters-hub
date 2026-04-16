-- Migration: add_sourceUrl_to_roaster
-- Adds sourceUrl column to roasters table for tracking data source origin

ALTER TABLE "roasters" ADD COLUMN "sourceUrl" TEXT;
