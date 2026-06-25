-- ============================================================
-- seed.sql
-- Local development seed data
-- Admin user + 3 sample resources (2 with physical locations)
-- ============================================================

-- Fixed UUIDs for predictable local dev
DO $$
DECLARE
  admin_id uuid := '00000000-0000-0000-0000-000000000001';
  resource_1_id uuid := '00000000-0000-0000-0000-000000000010';
  resource_2_id uuid := '00000000-0000-0000-0000-000000000011';
  resource_3_id uuid := '00000000-0000-0000-0000-000000000012';
  location_1_id uuid := '00000000-0000-0000-0000-000000000020';
  location_2_id uuid := '00000000-0000-0000-0000-000000000021';
BEGIN

-- ============================================================
-- ADMIN USER
-- Email: admin@test.com / Password: adminpassword123
-- app_metadata role=admin makes is_admin() return true
-- ============================================================
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  admin_id,
  '00000000-0000-0000-0000-000000000000',
  'admin@test.com',
  crypt('adminpassword123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"], "role": "admin"}',
  '{"username": "testadmin"}',
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Identity record required for GoTrue email/password auth to work
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  admin_id,
  admin_id,
  jsonb_build_object('sub', admin_id::text, 'email', 'admin@test.com'),
  'email',
  'admin@test.com',
  now(),
  now(),
  now()
);

-- ============================================================
-- RESOURCES
-- ============================================================

-- Resource 1: food pantry with physical location
INSERT INTO resources (id, name, description, offer_desc, benefits, verification_status, is_active, created_by)
VALUES (
  resource_1_id,
  'Test Fake Food Pantry 1',
  'A completely made-up food pantry for testing purposes. Provides free groceries to anyone in need.',
  'Free groceries, no income verification required. Limit one visit per week per household.',
  ARRAY['free_food']::benefit_category[],
  'approved',
  true,
  admin_id
);

-- Resource 2: senior meals with physical location
INSERT INTO resources (id, name, description, offer_desc, benefits, verification_status, is_active, created_by)
VALUES (
  resource_2_id,
  'Test Fake Senior Meal Program 2',
  'A completely made-up senior meal program for testing purposes. Hot meals served daily.',
  'Free hot lunch for adults 60+. Suggested donation $3, no one turned away.',
  ARRAY['free_food', 'senior_discount']::benefit_category[],
  'approved',
  true,
  admin_id
);

-- Resource 3: online-only coupon program (no physical location)
INSERT INTO resources (id, name, description, offer_desc, benefits, verification_status, is_active, created_by)
VALUES (
  resource_3_id,
  'Test Fake Online Coupon Program 3',
  'A completely made-up digital coupon program for testing purposes. Weekly discount codes for grocery stores.',
  'Sign up with your email to receive weekly coupon codes for 20-40% off at participating stores.',
  ARRAY['coupon', 'snap_accepted']::benefit_category[],
  'approved',
  true,
  admin_id
);

-- ============================================================
-- PHYSICAL LOCATIONS
-- Real Portland coordinates, fake business details
-- ============================================================

-- Location 1: near Pearl District / NW 23rd (45.5290, -122.6970)
INSERT INTO physical_locations (
  id, resource_id, address, city, state, zip_code,
  neighborhood, latitude, longitude, phone_number,
  verification_status, created_by
) VALUES (
  location_1_id,
  resource_1_id,
  '742 NW Everett St',
  'Portland',
  'OR',
  '97209',
  'Pearl District',
  45.5290,
  -122.6820,
  '(503) 555-0101',
  'approved',
  admin_id
);

-- Location 2: near Alberta Arts District (45.5601, -122.6481)
INSERT INTO physical_locations (
  id, resource_id, address, city, state, zip_code,
  neighborhood, latitude, longitude, phone_number,
  verification_status, created_by
) VALUES (
  location_2_id,
  resource_2_id,
  '1847 NE Alberta St',
  'Portland',
  'OR',
  '97211',
  'Alberta Arts District',
  45.5601,
  -122.6481,
  '(503) 555-0202',
  'approved',
  admin_id
);

-- ============================================================
-- RESOURCE HOURS
-- ============================================================

-- Food Pantry 1: Mon/Wed/Fri 9am-4pm, Sat 10am-2pm
INSERT INTO resource_hours (physical_location_id, day, opens_at, closes_at)
VALUES
  (location_1_id, 'monday',    '09:00', '16:00'),
  (location_1_id, 'wednesday', '09:00', '16:00'),
  (location_1_id, 'friday',    '09:00', '16:00'),
  (location_1_id, 'saturday',  '10:00', '14:00');

-- Senior Meals 2: Tue-Sat 11am-1pm
INSERT INTO resource_hours (physical_location_id, day, opens_at, closes_at)
VALUES
  (location_2_id, 'tuesday',   '11:00', '13:00'),
  (location_2_id, 'wednesday', '11:00', '13:00'),
  (location_2_id, 'thursday',  '11:00', '13:00'),
  (location_2_id, 'friday',    '11:00', '13:00'),
  (location_2_id, 'saturday',  '11:00', '13:00');

-- ============================================================
-- ONLINE ACCESS (resource 3 only)
-- ============================================================
INSERT INTO online_access (resource_id, url, instructions)
VALUES (
  resource_3_id,
  'https://example-fake-coupons.test',
  'Visit the link and enter your email address. Coupon codes are delivered every Monday morning.'
);

-- ============================================================
-- RESOURCE ELIGIBILITY
-- ============================================================
INSERT INTO resource_eligibility (resource_id, income_limit, id_required, residency_required, referral_required, notes)
VALUES
  (resource_1_id, NULL,      false, false, false, 'No requirements — open to all.'),
  (resource_2_id, NULL,      false, false, false, 'Must be 60 or older. No ID required.'),
  (resource_3_id, NULL,      false, false, false, 'Open to all Oregon residents.');

END $$;
