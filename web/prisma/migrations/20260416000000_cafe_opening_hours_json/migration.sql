-- Migration: cafe_opening_hours_json
-- Changes Cafe.openingHours from String? (TEXT) to Json? (JSONB)

ALTER TABLE "cafes" ALTER COLUMN "openingHours" TYPE JSONB USING
  CASE
    WHEN "openingHours" IS NULL THEN NULL
    WHEN "openingHours" ~ '^[\[\{]' THEN "openingHours"::jsonb
    ELSE to_jsonb("openingHours")
  END;
