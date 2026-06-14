-- ============================================================
--  portland_food_db.sql  |  Portland Community Food Resource DB
--  PostgreSQL schema with user roles, edit queue, and history
-- ============================================================


-- ── EXTENSIONS ──────────────────────────────────────────────

-- For UUID primary keys (more secure than sequential IDs for public-facing records)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- For geographic distance queries (find locations near me)
CREATE EXTENSION IF NOT EXISTS "earthdistance" CASCADE;


-- ── ENUMS ───────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('admin', 'reviewer', 'contributor');
CREATE TYPE edit_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE benefit_category AS ENUM (
    'snap_accepted',       -- Accepts SNAP/EBT
    'wic_accepted',        -- Accepts WIC
    'free_food',           -- No cost food
    'food_pantry',         -- Food pantry / food bank
    'community_fridge',    -- Free community fridge
    'senior_discount',     -- Discount for seniors
    'coupon_deal',         -- Notable coupon / deal
    'sliding_scale',       -- Pay what you can
    'other'
);
CREATE TYPE day_of_week AS ENUM (
    'monday','tuesday','wednesday','thursday','friday','saturday','sunday'
);


-- ── USERS ───────────────────────────────────────────────────

CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    username        TEXT        UNIQUE NOT NULL,
    email           TEXT        UNIQUE NOT NULL,
    password_hash   TEXT        NOT NULL,   -- store bcrypt hash, never plaintext
    role            user_role   NOT NULL DEFAULT 'contributor',
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ
);

COMMENT ON TABLE users IS 'Accounts for contributors, reviewers, and admins.';
COMMENT ON COLUMN users.role IS 'admin = full access; reviewer = can approve edits; contributor = can add/edit locations';


-- ── LOCATIONS ───────────────────────────────────────────────

CREATE TABLE locations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    address         TEXT        NOT NULL,
    city            TEXT        NOT NULL DEFAULT 'Portland',
    state           TEXT        NOT NULL DEFAULT 'OR',
    zip             TEXT,
    neighborhood    TEXT,                   -- e.g. "Buckman", "St. Johns"
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    phone           TEXT,
    website         TEXT,
    description     TEXT,                   -- general description
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,   -- currently operating?
    is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,  -- verified by reviewer/admin?
    verified_at     TIMESTAMPTZ,
    verified_by     UUID        REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID        REFERENCES users(id),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE locations IS 'Core location records for food resources in Portland area.';
COMMENT ON COLUMN locations.is_verified IS 'Set to TRUE by a reviewer or admin after confirming the info is accurate.';


-- ── BENEFIT TYPES ───────────────────────────────────────────

-- Each location can have multiple benefit types
CREATE TABLE location_benefits (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id     UUID            NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    benefit         benefit_category NOT NULL,
    notes           TEXT,           -- e.g. "10% senior discount on Tuesdays"
    UNIQUE (location_id, benefit)
);


-- ── HOURS OF OPERATION ──────────────────────────────────────

CREATE TABLE location_hours (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id     UUID        NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    day             day_of_week NOT NULL,
    opens_at        TIME,                   -- NULL = closed that day
    closes_at       TIME,
    notes           TEXT,                   -- e.g. "First Sunday of month only"
    UNIQUE (location_id, day)
);


-- ── ELIGIBILITY REQUIREMENTS ────────────────────────────────

CREATE TABLE location_eligibility (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id         UUID    NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    income_limit        TEXT,   -- e.g. "At or below 185% federal poverty level"
    id_required         BOOLEAN DEFAULT FALSE,
    residency_required  BOOLEAN DEFAULT FALSE,  -- must live in certain area?
    residency_details   TEXT,
    referral_required   BOOLEAN DEFAULT FALSE,
    referral_details    TEXT,
    other_requirements  TEXT,
    notes               TEXT
);


-- ── COMMUNITY NOTES & RATINGS ───────────────────────────────

CREATE TABLE community_notes (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id     UUID        NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    author_id       UUID        REFERENCES users(id),    -- NULL = anonymous
    body            TEXT        NOT NULL,
    rating          SMALLINT    CHECK (rating BETWEEN 1 AND 5),
    is_flagged      BOOLEAN     NOT NULL DEFAULT FALSE,
    flagged_reason  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN community_notes.author_id IS 'NULL means the note was left anonymously.';


-- ── NEW LOCATION SUBMISSIONS ─────────────────────────────────
-- New locations go here first; approved ones get copied to locations

CREATE TABLE submissions (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_by    UUID                REFERENCES users(id),   -- NULL = anonymous
    status          submission_status   NOT NULL DEFAULT 'pending',
    reviewed_by     UUID                REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    reviewer_note   TEXT,               -- reason for rejection, etc.

    -- Mirrors the locations fields
    name            TEXT        NOT NULL,
    address         TEXT        NOT NULL,
    city            TEXT        NOT NULL DEFAULT 'Portland',
    state           TEXT        NOT NULL DEFAULT 'OR',
    zip             TEXT,
    neighborhood    TEXT,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    phone           TEXT,
    website         TEXT,
    description     TEXT,
    benefits        benefit_category[],  -- array of benefit types
    hours_notes     TEXT,                -- freeform hours until approved & structured
    eligibility_notes TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE submissions IS 'New location proposals. Approved submissions are promoted to the locations table.';


-- ── EDIT QUEUE ───────────────────────────────────────────────
-- Any edit to an existing location lands here for reviewer/admin approval

CREATE TABLE edits (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id     UUID        NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    submitted_by    UUID        REFERENCES users(id),   -- NULL = anonymous
    status          edit_status NOT NULL DEFAULT 'pending',
    reviewed_by     UUID        REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    reviewer_note   TEXT,

    -- What field is being changed?
    field_name      TEXT        NOT NULL,   -- e.g. 'address', 'phone', 'is_active'
    old_value       TEXT,                   -- snapshot of value before edit
    new_value       TEXT        NOT NULL,   -- proposed new value

    reason          TEXT,                   -- submitter's explanation
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE edits IS 'All proposed edits to existing locations. Reviewers and admins approve or reject from this queue.';
COMMENT ON COLUMN edits.field_name IS 'Name of the field being changed, e.g. address, phone, is_active, hours.';


-- ── EDIT HISTORY ────────────────────────────────────────────
-- Permanent audit log of every approved change

CREATE TABLE edit_history (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id     UUID        NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    edit_id         UUID        REFERENCES edits(id),
    changed_by      UUID        REFERENCES users(id),
    approved_by     UUID        REFERENCES users(id),
    field_name      TEXT        NOT NULL,
    old_value       TEXT,
    new_value       TEXT,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE edit_history IS 'Immutable audit log. Every approved change to a location is recorded here.';


-- ── INDEXES ─────────────────────────────────────────────────

-- Fast lookup by neighborhood or zip
CREATE INDEX idx_locations_neighborhood ON locations(neighborhood);
CREATE INDEX idx_locations_zip ON locations(zip);

-- Find active, verified locations quickly
CREATE INDEX idx_locations_active_verified ON locations(is_active, is_verified);

-- Edit queue: find pending items fast
CREATE INDEX idx_edits_pending ON edits(status) WHERE status = 'pending';
CREATE INDEX idx_submissions_pending ON submissions(status) WHERE status = 'pending';

-- Notes flagged for review
CREATE INDEX idx_notes_flagged ON community_notes(is_flagged) WHERE is_flagged = TRUE;

-- Location benefits lookup
CREATE INDEX idx_location_benefits_type ON location_benefits(benefit);


-- ── HELPER FUNCTION: auto-update updated_at ─────────────────

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();


-- ── SAMPLE DATA ─────────────────────────────────────────────

-- Admin account (you) — replace password_hash with a real bcrypt hash
INSERT INTO users (username, email, password_hash, role) VALUES
    ('admin', 'admin@example.com', 'REPLACE_WITH_BCRYPT_HASH', 'admin');

-- A sample reviewer
INSERT INTO users (username, email, password_hash, role) VALUES
    ('reviewer_jane', 'jane@example.com', 'REPLACE_WITH_BCRYPT_HASH', 'reviewer');

-- Sample locations
INSERT INTO locations (name, address, neighborhood, zip, phone, website, description, is_verified, created_by)
VALUES
    (
        'Oregon Food Bank',
        '7900 NE 33rd Dr',
        'Parkrose',
        '97211',
        '503-282-0555',
        'https://www.oregonfoodbank.org',
        'Large regional food bank serving the Portland metro area. Accepts SNAP and distributes free food.',
        TRUE,
        (SELECT id FROM users WHERE username = 'admin')
    ),
    (
        'Blanchet House',
        '310 NW Glisan St',
        'Old Town',
        '97209',
        '503-241-4340',
        'https://blanchethouse.org',
        'Free meals served daily. No ID or referral required.',
        TRUE,
        (SELECT id FROM users WHERE username = 'admin')
    ),
    (
        'Hollywood Farmers Market',
        '4343 NE Hancock St',
        'Hollywood',
        '97213',
        NULL,
        'https://www.hollywoodfarmersmarket.org',
        'Accepts SNAP/EBT. Double Up Food Bucks program doubles SNAP value on Oregon-grown produce.',
        TRUE,
        (SELECT id FROM users WHERE username = 'admin')
    );

-- Benefits for each location
INSERT INTO location_benefits (location_id, benefit, notes)
VALUES
    ((SELECT id FROM locations WHERE name = 'Oregon Food Bank'), 'food_pantry', NULL),
    ((SELECT id FROM locations WHERE name = 'Oregon Food Bank'), 'snap_accepted', NULL),
    ((SELECT id FROM locations WHERE name = 'Oregon Food Bank'), 'free_food', NULL),
    ((SELECT id FROM locations WHERE name = 'Blanchet House'), 'free_food', 'Free meals daily, no questions asked'),
    ((SELECT id FROM locations WHERE name = 'Hollywood Farmers Market'), 'snap_accepted', 'Double Up Food Bucks: SNAP dollars doubled on Oregon produce');

-- Hours for Blanchet House
INSERT INTO location_hours (location_id, day, opens_at, closes_at)
VALUES
    ((SELECT id FROM locations WHERE name = 'Blanchet House'), 'monday',    '06:30', '09:00'),
    ((SELECT id FROM locations WHERE name = 'Blanchet House'), 'tuesday',   '06:30', '09:00'),
    ((SELECT id FROM locations WHERE name = 'Blanchet House'), 'wednesday', '06:30', '09:00'),
    ((SELECT id FROM locations WHERE name = 'Blanchet House'), 'thursday',  '06:30', '09:00'),
    ((SELECT id FROM locations WHERE name = 'Blanchet House'), 'friday',    '06:30', '09:00'),
    ((SELECT id FROM locations WHERE name = 'Blanchet House'), 'saturday',  '06:30', '09:00'),
    ((SELECT id FROM locations WHERE name = 'Blanchet House'), 'sunday',    '06:30', '09:00');

-- Hollywood Farmers Market (Saturday only)
INSERT INTO location_hours (location_id, day, opens_at, closes_at, notes)
VALUES
    ((SELECT id FROM locations WHERE name = 'Hollywood Farmers Market'), 'saturday', '08:00', '13:00', 'May through November');


-- ── USEFUL QUERIES ──────────────────────────────────────────

-- 1. All active, verified locations with their benefit types
SELECT
    l.name,
    l.neighborhood,
    l.address,
    array_agg(lb.benefit ORDER BY lb.benefit) AS benefits
FROM locations l
JOIN location_benefits lb ON lb.location_id = l.id
WHERE l.is_active = TRUE AND l.is_verified = TRUE
GROUP BY l.id
ORDER BY l.neighborhood, l.name;

-- 2. Pending edit queue for reviewers
SELECT
    e.id,
    l.name AS location_name,
    e.field_name,
    e.old_value,
    e.new_value,
    e.reason,
    u.username AS submitted_by,
    e.created_at
FROM edits e
JOIN locations l ON l.id = e.location_id
LEFT JOIN users u ON u.id = e.submitted_by
WHERE e.status = 'pending'
ORDER BY e.created_at ASC;

-- 3. Pending new location submissions
SELECT
    s.id,
    s.name,
    s.address,
    s.neighborhood,
    s.benefits,
    u.username AS submitted_by,
    s.created_at
FROM submissions s
LEFT JOIN users u ON u.id = s.submitted_by
WHERE s.status = 'pending'
ORDER BY s.created_at ASC;

-- 4. All locations that accept SNAP
SELECT l.name, l.address, l.neighborhood, lb.notes
FROM locations l
JOIN location_benefits lb ON lb.location_id = l.id
WHERE lb.benefit = 'snap_accepted'
  AND l.is_active = TRUE
ORDER BY l.neighborhood;

-- 5. Edit history for a specific location
SELECT
    eh.field_name,
    eh.old_value,
    eh.new_value,
    u_changed.username AS changed_by,
    u_approved.username AS approved_by,
    eh.changed_at
FROM edit_history eh
LEFT JOIN users u_changed  ON u_changed.id  = eh.changed_by
LEFT JOIN users u_approved ON u_approved.id = eh.approved_by
WHERE eh.location_id = (SELECT id FROM locations WHERE name = 'Blanchet House')
ORDER BY eh.changed_at DESC;

-- 6. Flagged community notes needing review
SELECT
    cn.id,
    l.name AS location,
    cn.body,
    cn.flagged_reason,
    u.username AS author,
    cn.created_at
FROM community_notes cn
JOIN locations l ON l.id = cn.location_id
LEFT JOIN users u ON u.id = cn.author_id
WHERE cn.is_flagged = TRUE
ORDER BY cn.created_at ASC;
