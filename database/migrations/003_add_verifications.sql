-- Migration 003: Replace legacy verification columns on locations, add verification_events table
-- Date: 2026-06-12
--
-- Context from existing schema:
--   locations already has: is_verified (boolean), verified_by (uuid FK), verified_at (timestamptz)
--   Migration 001 added:   address2, offer_desc, offer_source, donation_link, volunteer_link,
--                          delivery_available, info_last_verified, zip_code

-- Drop legacy verification columns from locations
ALTER TABLE locations DROP COLUMN IF EXISTS is_verified;
ALTER TABLE locations DROP COLUMN IF EXISTS verified_by;

-- verified_at already exists — no ADD needed

-- Add new verification summary columns to locations
ALTER TABLE locations
  ADD COLUMN verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('pending', 'confirmed', 'unverified'));

ALTER TABLE locations ADD COLUMN owner_claimed     boolean     DEFAULT false;
ALTER TABLE locations ADD COLUMN owner_verified_at timestamptz;

-- New verification_events table
CREATE TABLE verification_events (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid        NOT NULL REFERENCES locations(id),
  verified_at timestamptz NOT NULL DEFAULT now(),
  verified_by text,
  method      text        CHECK (method IN ('phone', 'website', 'email', 'in-person', 'owner-portal')),
  outcome     text        CHECK (outcome IN ('confirmed', 'no-answer', 'info-updated', 'closed', 'unverifiable')),
  notes       text,
  is_owner    boolean     DEFAULT false
);
