-- Migration 001: Add missing location fields
-- Date: 2026-06-05

ALTER TABLE locations ADD COLUMN address2 TEXT;
ALTER TABLE locations ADD COLUMN offer_desc TEXT;
ALTER TABLE locations ADD COLUMN offer_source TEXT;
ALTER TABLE locations ADD COLUMN donation_link TEXT;
ALTER TABLE locations ADD COLUMN volunteer_link TEXT;
ALTER TABLE locations ADD COLUMN delivery_available BOOLEAN DEFAULT FALSE;
ALTER TABLE locations ADD COLUMN info_last_verified DATE;
ALTER TABLE locations ADD COLUMN zip_code TEXT;