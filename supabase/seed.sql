-- ============================================================
-- seed.sql  –  Comprehensive fake dataset for local development
--
-- Covers every table, every enum value (benefit_category ×10,
-- submission_status ×3, edit_status ×3, day_of_week ×7,
-- owner verification_method ×3, owner verification_status ×3),
-- every nullable field both populated and NULL, and a variety
-- of edge cases. Edge-case rows carry an -- EDGE: comment.
--
-- All passwords: Password123!
-- Admin logins: admin@test.com / admin2@test.com
-- Regular users: user1–user4@test.com
-- ============================================================

DO $$
DECLARE
  -- ── Users ──────────────────────────────────────────────────
  admin_id    uuid := '00000000-0000-4000-8000-000000000001';
  admin_2_id  uuid := '00000000-0000-4000-8000-000000000002';
  user_1_id   uuid := '00000000-0000-4000-8000-000000000003';
  user_2_id   uuid := '00000000-0000-4000-8000-000000000004';
  user_3_id   uuid := '00000000-0000-4000-8000-000000000005';
  user_4_id   uuid := '00000000-0000-4000-8000-000000000006';

  -- ── Resources ──────────────────────────────────────────────
  r1_id  uuid := '00000000-0000-4000-8000-000000000010'; -- free_food
  r2_id  uuid := '00000000-0000-4000-8000-000000000011'; -- discounted_food
  r3_id  uuid := '00000000-0000-4000-8000-000000000012'; -- snap_accepted
  r4_id  uuid := '00000000-0000-4000-8000-000000000013'; -- student_discount
  r5_id  uuid := '00000000-0000-4000-8000-000000000014'; -- senior_discount
  r6_id  uuid := '00000000-0000-4000-8000-000000000015'; -- kids_eat_free
  r7_id  uuid := '00000000-0000-4000-8000-000000000016'; -- bogo
  r8_id  uuid := '00000000-0000-4000-8000-000000000017'; -- coupon
  r9_id  uuid := '00000000-0000-4000-8000-000000000018'; -- free_breakfast
  r10_id uuid := '00000000-0000-4000-8000-000000000019'; -- other
  r16_id uuid := '00000000-0000-4000-8000-000000000025'; -- military_discount
  r11_id uuid := '00000000-0000-4000-8000-000000000020'; -- EDGE: approved but is_active=false
  r12_id uuid := '00000000-0000-4000-8000-000000000021'; -- EDGE: approved, expires_at in past
  r13_id uuid := '00000000-0000-4000-8000-000000000022'; -- EDGE: pending, multiple benefits
  r14_id uuid := '00000000-0000-4000-8000-000000000023'; -- EDGE: rejected
  r15_id uuid := '00000000-0000-4000-8000-000000000024'; -- EDGE: pending, max nulls, online-only

  -- ── Physical Locations ─────────────────────────────────────
  pl1_id  uuid := '00000000-0000-4000-8000-000000000030';
  pl2_id  uuid := '00000000-0000-4000-8000-000000000031'; -- second location for r1
  pl3_id  uuid := '00000000-0000-4000-8000-000000000032';
  pl4_id  uuid := '00000000-0000-4000-8000-000000000033';
  pl5_id  uuid := '00000000-0000-4000-8000-000000000034';
  pl6_id  uuid := '00000000-0000-4000-8000-000000000035';
  pl7_id  uuid := '00000000-0000-4000-8000-000000000036';
  pl8_id  uuid := '00000000-0000-4000-8000-000000000037';
  pl9_id  uuid := '00000000-0000-4000-8000-000000000038';
  pl10_id uuid := '00000000-0000-4000-8000-000000000039';
  pl11_id uuid := '00000000-0000-4000-8000-000000000040';
  pl16_id uuid := '00000000-0000-4000-8000-000000000044';
  pl12_id uuid := '00000000-0000-4000-8000-000000000041'; -- EDGE: inactive resource location
  pl13_id uuid := '00000000-0000-4000-8000-000000000042'; -- EDGE: expired resource location
  pl14_id uuid := '00000000-0000-4000-8000-000000000043'; -- EDGE: pending location status

  -- ── Online / Other Access ──────────────────────────────────
  oa1_id   uuid := '00000000-0000-4000-8000-000000000050';
  oa2_id   uuid := '00000000-0000-4000-8000-000000000051';
  oa3_id   uuid := '00000000-0000-4000-8000-000000000052';
  otha1_id uuid := '00000000-0000-4000-8000-000000000060';
  otha2_id uuid := '00000000-0000-4000-8000-000000000061';

  -- ── Owners ────────────────────────────────────────────────
  o1_id uuid := '00000000-0000-4000-8000-000000000070';
  o2_id uuid := '00000000-0000-4000-8000-000000000071';
  o3_id uuid := '00000000-0000-4000-8000-000000000072';
  o4_id uuid := '00000000-0000-4000-8000-000000000073';
  o5_id uuid := '00000000-0000-4000-8000-000000000074';

  -- ── Submissions ───────────────────────────────────────────
  sub1_id uuid := '00000000-0000-4000-8000-000000000080';
  sub2_id uuid := '00000000-0000-4000-8000-000000000081';
  sub3_id uuid := '00000000-0000-4000-8000-000000000082';

  -- ── Edits ─────────────────────────────────────────────────
  e1_id uuid := '00000000-0000-4000-8000-000000000090';
  e2_id uuid := '00000000-0000-4000-8000-000000000091';
  e3_id uuid := '00000000-0000-4000-8000-000000000092';

BEGIN

-- ============================================================
-- AUTH USERS
-- ============================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, role, aud,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  (admin_id,   '00000000-0000-0000-0000-000000000000', 'admin@test.com',
   crypt('Password123!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"],"role":"admin"}', '{"username":"testadmin"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  (admin_2_id, '00000000-0000-0000-0000-000000000000', 'admin2@test.com',
   crypt('Password123!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"],"role":"admin"}', '{"username":"testadmin2"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  (user_1_id,  '00000000-0000-0000-0000-000000000000', 'user1@test.com',
   crypt('Password123!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"username":"portlander_priya"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  (user_2_id,  '00000000-0000-0000-0000-000000000000', 'user2@test.com',
   crypt('Password123!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"username":"rose_city_rick"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  (user_3_id,  '00000000-0000-0000-0000-000000000000', 'user3@test.com',
   crypt('Password123!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"username":"nw_neighbor_nadia"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', ''),

  (user_4_id,  '00000000-0000-0000-0000-000000000000', 'user4@test.com',
   crypt('Password123!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"username":"division_dweller_dex"}',
   'authenticated', 'authenticated', now(), now(), '', '', '', '');

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES
  (admin_id,   admin_id,   jsonb_build_object('sub', admin_id::text,   'email', 'admin@test.com'),  'email', 'admin@test.com',  now(), now(), now()),
  (admin_2_id, admin_2_id, jsonb_build_object('sub', admin_2_id::text, 'email', 'admin2@test.com'), 'email', 'admin2@test.com', now(), now(), now()),
  (user_1_id,  user_1_id,  jsonb_build_object('sub', user_1_id::text,  'email', 'user1@test.com'),  'email', 'user1@test.com',  now(), now(), now()),
  (user_2_id,  user_2_id,  jsonb_build_object('sub', user_2_id::text,  'email', 'user2@test.com'),  'email', 'user2@test.com',  now(), now(), now()),
  (user_3_id,  user_3_id,  jsonb_build_object('sub', user_3_id::text,  'email', 'user3@test.com'),  'email', 'user3@test.com',  now(), now(), now()),
  (user_4_id,  user_4_id,  jsonb_build_object('sub', user_4_id::text,  'email', 'user4@test.com'),  'email', 'user4@test.com',  now(), now(), now());


-- ============================================================
-- RESOURCES
-- All 10 benefit_category values represented across rows.
-- All 3 submission_status values represented.
-- offer_source, description, notes: mix of populated and NULL.
-- ============================================================

INSERT INTO resources (
  id, name, description, offer_desc, offer_source, benefits,
  verification_status, expires_at, is_active, notes, created_by, created_at, updated_at
) VALUES

  -- benefit: free_food — fully populated
  (r1_id,
   'Hawthorne Community Pantry',
   'A community-run food pantry serving the Hawthorne and Richmond neighborhoods. Open to all Portland residents regardless of income.',
   'Free groceries including produce, canned goods, bread, and dairy. No income verification required. Limit one visit per week per household.',
   'Community referral from SE Uplift',
   ARRAY['free_food']::benefit_category[],
   'approved', NULL, true,
   'Offers extra supplies on the last Friday of each month. Wheelchair accessible entrance on SE 35th.',
   admin_id, now() - interval '90 days', now() - interval '5 days'),

  -- benefit: discounted_food — notes NULL
  (r2_id,
   'Division Street Discount Grocer',
   'A worker-owned cooperative grocery store offering steeply discounted food to community members. Prices are 30–60% below retail.',
   'Membership required ($10/year or volunteer 2 hours/month). Members pay cost+10% on all items.',
   'Listed in Oregon Food Bank partner directory',
   ARRAY['discounted_food']::benefit_category[],
   'approved', NULL, true,
   NULL, -- EDGE: notes NULL
   admin_id, now() - interval '60 days', now() - interval '2 days'),

  -- benefit: snap_accepted — offer_source NULL, two benefits in array
  (r3_id,
   'Lents SNAP Market',
   'A small farmers market running year-round in Lents that accepts SNAP/EBT. Participating vendors offer fresh produce and pantry staples.',
   'Bring your EBT card. Most vendors accept SNAP. Double Up Food Bucks program doubles your value on Oregon-grown produce.',
   NULL, -- EDGE: offer_source NULL
   ARRAY['snap_accepted', 'discounted_food']::benefit_category[],
   'approved', NULL, true,
   'Runs every Saturday. Parking available in the Lents Town Center lot.',
   admin_id, now() - interval '45 days', now() - interval '1 day'),

  -- benefit: student_discount — expires_at in future
  (r4_id,
   'PSU Student Food Collective',
   'Student-run food pantry and discount buying club based out of Portland State University. Open to all enrolled PSU students.',
   'Free groceries from the pantry with valid student ID. Buying club offers 20% off bulk dry goods.',
   'PSU Student Affairs office',
   ARRAY['student_discount', 'free_food']::benefit_category[],
   'approved',
   '2027-06-15', -- EDGE: expires_at in future (end of academic year)
   true,
   'Pantry is located in Smith Memorial Student Union, Room 120.',
   admin_id, now() - interval '30 days', now()),

  -- benefit: senior_discount — user-submitted, fully populated
  (r5_id,
   'Richmond Senior Dining Hall',
   'Hot lunches served five days a week for Portland seniors at the Richmond Community Center. Operated by Multnomah County Aging Services.',
   'Suggested donation $4 for adults 60+. No one turned away for inability to pay.',
   'Multnomah County Aging Services program listing',
   ARRAY['senior_discount', 'free_food']::benefit_category[],
   'approved', NULL, true,
   'Reservations encouraged but not required. Transportation assistance available.',
   user_1_id, now() - interval '120 days', now() - interval '10 days'),

  -- benefit: kids_eat_free — offer_source NULL, notes NULL
  (r6_id,
   'Sellwood Kids Eat Free Diner',
   'A diner in Sellwood where children under 12 eat free with a paying adult at every meal, every day.',
   'Kids 12 and under eat free from the children''s menu with each adult entrée purchase. No limit on number of kids per adult.',
   NULL, -- EDGE: offer_source NULL
   ARRAY['kids_eat_free']::benefit_category[],
   'approved', NULL, true,
   NULL, -- EDGE: notes NULL
   user_1_id, now() - interval '200 days', now() - interval '30 days'),

  -- benefit: bogo — user-submitted
  (r7_id,
   'Alberta BOGO Bakery',
   'Artisan bakery on Alberta Street with a buy-one-get-one deal on all day-old baked goods. Excess inventory is donated to local shelters.',
   'BOGO on all day-old breads, pastries, and bagels after 4pm daily. No limit. Must be purchased in store.',
   'Alberta Arts District business directory',
   ARRAY['bogo']::benefit_category[],
   'approved', NULL, true,
   'Day-old selection varies. Call ahead to check availability.',
   user_2_id, now() - interval '75 days', now() - interval '7 days'),

  -- benefit: coupon — user-submitted
  (r8_id,
   'Woodstock Coupon Exchange Network',
   'A neighborhood coupon-clipping cooperative. Members share coupons via an online portal and a physical binder at the Woodstock library.',
   'Free to join. Browse and claim coupons online or at the library binder. New coupons added weekly.',
   'Self-submitted by organizer',
   ARRAY['coupon']::benefit_category[],
   'approved', NULL, true,
   'Physical binder is available during library open hours. Ask at the front desk.',
   user_2_id, now() - interval '14 days', now()),

  -- benefit: free_breakfast — oldest resource, user-submitted
  (r9_id,
   'St. Johns Free Breakfast Club',
   'Weekly community breakfast served every Sunday morning at the St. Johns Community Center. Volunteer-run, open to everyone.',
   'Free hot breakfast every Sunday from 8am to 11am. Pancakes, eggs, fruit, coffee, and juice. No sign-up required.',
   'St. Johns Neighborhood Coalition',
   ARRAY['free_breakfast']::benefit_category[],
   'approved', NULL, true,
   'Donations of non-perishable food items gratefully accepted.',
   user_3_id, now() - interval '365 days', now() - interval '2 days'),

  -- benefit: other — multi-service hub
  (r10_id,
   'Kenton Community Services Hub',
   'A multi-service hub in Kenton offering food referrals, utility assistance, and community resource navigation.',
   'Walk-in services Mon–Fri. Food referrals to partnering pantries, help applying for SNAP and WIC, utility bill assistance.',
   'Oregon 211 network',
   ARRAY['other']::benefit_category[],
   'approved', NULL, true,
   'Interpreters available for Spanish, Somali, and Vietnamese. Bring ID if available but not required.',
   user_3_id, now() - interval '500 days', now() - interval '15 days'),

  -- benefit: military_discount — fully populated
  (r16_id,
   'Columbia Gorge Veterans Market',
   'A military-friendly grocery market in Northeast Portland offering verified discounts to active duty service members, veterans, and their families.',
   '10% discount on all items with valid military ID, VA card, or DD-214. No membership required. Discount applies every day.',
   'Oregon Department of Veterans Affairs partner directory',
   ARRAY['military_discount', 'discounted_food']::benefit_category[],
   'approved', NULL, true,
   'Ask at the customer service desk to verify military status. Cashiers can also verify at checkout.',
   admin_id, now() - interval '20 days', now() - interval '3 days'),

  -- EDGE: approved but is_active=false (suspended — should not appear in public results)
  (r11_id,
   'Pearl District Meal Depot',
   'Formerly active meal delivery service in the Pearl District. Temporarily suspended due to building renovation.',
   'Service suspended until further notice.',
   NULL,
   ARRAY['free_food', 'discounted_food']::benefit_category[],
   'approved', NULL,
   false, -- EDGE: is_active=false on an approved resource
   'Service expected to resume Q1 2027. Contact organizers for updates.',
   admin_id, now() - interval '400 days', now() - interval '60 days'),

  -- EDGE: expires_at in the past (program ended)
  (r12_id,
   'Concordia Summer Lunch Program',
   'A summer-only free lunch program for children in the Concordia neighborhood, funded by a seasonal grant.',
   'Free lunch for kids 18 and under, Monday through Friday throughout the summer.',
   'Portland Public Schools summer meals partnership',
   ARRAY['free_food', 'kids_eat_free']::benefit_category[],
   'approved',
   '2025-08-31', -- EDGE: expires_at in the past
   true,
   'Program ran June–August only. Closed for the season.',
   admin_id, now() - interval '400 days', now() - interval '300 days'),

  -- EDGE: pending verification_status — submitted but not yet reviewed
  (r13_id,
   'Mississippi Ave Pop-Up Food Hub',
   'A new pop-up food hub on Mississippi Ave offering a variety of benefits. Submitted by community member, pending admin review.',
   'SNAP accepted, free produce on Tuesdays, and a weekly BOGO bread sale.',
   'Community submission',
   ARRAY['snap_accepted', 'free_food', 'bogo', 'coupon']::benefit_category[],
   'pending', -- EDGE: pending status
   NULL, true, NULL,
   user_4_id, now() - interval '3 days', now() - interval '3 days'),

  -- EDGE: rejected — fraudulent submission
  (r14_id,
   'Fake Discount Voucher Scheme',
   'This submission was rejected for failing to provide verifiable information.',
   'Free groceries for everyone, no questions asked!!!',
   NULL,
   ARRAY['coupon', 'free_food']::benefit_category[],
   'rejected', -- EDGE: rejected status
   NULL,
   false, -- EDGE: inactive + rejected
   'Rejected: unable to verify business existence. No phone number or address provided.',
   user_4_id, now() - interval '20 days', now() - interval '18 days'),

  -- EDGE: pending with maximum nullable fields set to NULL + very long name
  (r15_id,
   'A Very Long Resource Name That Is Testing Our Display Layout For Resources With Excessively Long Titles In The User Interface Components', -- EDGE: max-length string
   NULL, -- EDGE: description NULL
   NULL, -- EDGE: offer_desc NULL
   NULL, -- EDGE: offer_source NULL
   NULL, -- EDGE: benefits NULL
   'pending', NULL, true, NULL,
   user_4_id, now() - interval '1 day', now() - interval '1 day');


-- ============================================================
-- PHYSICAL LOCATIONS
-- Covers: address2 populated vs NULL, phone_number populated vs NULL,
--         neighborhood populated vs NULL, lat/lon populated vs NULL,
--         notes populated vs NULL, multiple locations for one resource,
--         pending verification_status, locations for inactive/expired resources.
-- ============================================================

INSERT INTO physical_locations (
  id, resource_id, address, address2, city, state, zip_code,
  neighborhood, latitude, longitude, phone_number,
  verification_status, notes, created_by, created_at
) VALUES

  -- r1 location 1: all optional fields populated, has address2
  (pl1_id, r1_id,
   '3425 SE Hawthorne Blvd', 'Suite 101', -- EDGE: address2 populated
   'Portland', 'OR', '97214',
   'Hawthorne', 45.5122, -122.6257, '(503) 555-0101',
   'approved',
   'Entrance is on the side street. Buzzer required after 3pm.',
   admin_id, now() - interval '90 days'),

  -- r1 location 2: same resource, second location — no address2, no phone, no notes
  (pl2_id, r1_id,
   '6710 SE Foster Rd', NULL, -- EDGE: address2 NULL; second location for same resource
   'Portland', 'OR', '97206',
   'Woodstock', 45.4858, -122.6122,
   NULL, -- EDGE: phone_number NULL
   'approved',
   NULL, -- EDGE: notes NULL
   admin_id, now() - interval '45 days'),

  -- r2 location: standard
  (pl3_id, r2_id,
   '4233 SE Division St', NULL,
   'Portland', 'OR', '97202',
   'Division', 45.5019, -122.6370, '(503) 555-0202',
   'approved', NULL,
   admin_id, now() - interval '60 days'),

  -- r3 location: outdoor market, with notes
  (pl4_id, r3_id,
   '9101 SE Holgate Blvd', NULL,
   'Portland', 'OR', '97266',
   'Lents', 45.4812, -122.5710, '(503) 555-0303',
   'approved',
   'Outdoor market — dress for weather. Covered vendor stalls available.',
   admin_id, now() - interval '45 days'),

  -- r4 location: campus address with address2
  (pl5_id, r4_id,
   '1825 SW Broadway', 'Smith Memorial Union Rm 120',
   'Portland', 'OR', '97201',
   'South Park Blocks', 45.5118, -122.6830, '(503) 555-0404',
   'approved',
   'Student ID required at entrance to building.',
   user_1_id, now() - interval '30 days'),

  -- r5 location: standard
  (pl6_id, r5_id,
   '2913 SE 28th Ave', NULL,
   'Portland', 'OR', '97202',
   'Richmond', 45.5056, -122.6399, '(503) 555-0505',
   'approved',
   'Accessible entrance via the parking lot on SE 28th.',
   admin_id, now() - interval '120 days'),

  -- r6 location: no notes
  (pl7_id, r6_id,
   '1132 SE Tacoma St', NULL,
   'Portland', 'OR', '97202',
   'Sellwood', 45.4699, -122.6600, '(503) 555-0606',
   'approved', NULL,
   user_1_id, now() - interval '200 days'),

  -- r7 location: no neighborhood
  (pl8_id, r7_id,
   '2544 NE Alberta St', NULL,
   'Portland', 'OR', '97211',
   'Alberta Arts District', 45.5603, -122.6381, '(503) 555-0707',
   'approved',
   'Look for the hand-painted sign. Parking on side streets.',
   user_2_id, now() - interval '75 days'),

  -- r8 location: library branch
  (pl9_id, r8_id,
   '7192 SE Woodstock Blvd', NULL,
   'Portland', 'OR', '97206',
   'Woodstock', 45.4856, -122.6218, '(503) 555-0808',
   'approved',
   'Coupon binder is at the reference desk.',
   user_2_id, now() - interval '14 days'),

  -- r9 location: community center
  (pl10_id, r9_id,
   '8517 N Central St', NULL,
   'Portland', 'OR', '97203',
   'St. Johns', 45.5958, -122.7471, '(503) 555-0909',
   'approved',
   'Enter through the main gymnasium doors.',
   user_3_id, now() - interval '365 days'),

  -- r10 location: Kenton Hub
  (pl11_id, r10_id,
   '2135 N Killingsworth St', NULL,
   'Portland', 'OR', '97217',
   'Kenton',
   45.5601, -122.6929,
   '(503) 555-1010',
   'approved', NULL,
   user_3_id, now() - interval '500 days'),

  -- r16 location: NE Portland, full details
  (pl16_id, r16_id,
   '4821 NE Sandy Blvd', NULL,
   'Portland', 'OR', '97213',
   'Hollywood', 45.5282, -122.6163, '(503) 555-1616',
   'approved',
   'Free parking lot on NE 49th. Accessible entrance from Sandy Blvd.',
   admin_id, now() - interval '20 days'),

  -- r11 location: EDGE — belongs to inactive resource
  (pl12_id, r11_id,
   '535 NW 12th Ave', 'Floor 1',
   'Portland', 'OR', '97209',
   'Pearl District', 45.5250, -122.6820, '(503) 555-1111',
   'approved',
   'Building undergoing renovation — location temporarily closed.', -- EDGE: location for inactive resource
   admin_id, now() - interval '400 days'),

  -- r12 location: EDGE — belongs to expired resource
  (pl13_id, r12_id,
   '4828 NE 33rd Ave', NULL,
   'Portland', 'OR', '97211',
   'Concordia', 45.5628, -122.6441, '(503) 555-1212',
   'approved',
   'Location used during summer season only.', -- EDGE: location for expired resource
   admin_id, now() - interval '400 days'),

  -- r13 location: EDGE — pending verification_status (unverified entry)
  (pl14_id, r13_id,
   '3822 N Mississippi Ave', NULL,
   'Portland', 'OR', '97227',
   'Mississippi', 45.5504, -122.6778,
   NULL, -- EDGE: phone_number NULL
   'pending', -- EDGE: pending location on a pending resource
   NULL,
   user_4_id, now() - interval '3 days');


-- ============================================================
-- ONLINE ACCESS
-- instructions: populated, NULL.
-- ============================================================

INSERT INTO online_access (id, resource_id, url, instructions) VALUES

  -- r8 coupon network: with instructions
  (oa1_id, r8_id,
   'https://example-woodstock-coupons.test',
   'Create a free account with your email. New coupons are posted every Monday by 9am. Print or show on your phone at checkout.'),

  -- r4 student collective: instructions NULL
  (oa2_id, r4_id,
   'https://example-psu-foodcollective.test',
   NULL), -- EDGE: instructions NULL

  -- r15 (pending, online-only, no physical location): has instructions
  (oa3_id, r15_id,
   'https://example-online-only-resource.test/apply',
   'Fill out the online intake form. A coordinator will contact you within 3 business days.'); -- EDGE: online-only resource (no physical location)


-- ============================================================
-- OTHER ACCESS
-- url: populated vs NULL.
-- ============================================================

INSERT INTO other_access (id, resource_id, notes, url) VALUES

  -- r10 services hub: call-ahead access, no URL
  (otha1_id, r10_id,
   'Call (503) 555-1010 during business hours to be connected with a resource navigator. Walk-in also welcome.',
   NULL), -- EDGE: url NULL

  -- r13 pop-up (pending): both notes and URL
  (otha2_id, r13_id,
   'Follow the organizers on social media for pop-up schedule updates.',
   'https://example-mississippi-popup.test');


-- ============================================================
-- RESOURCE BENEFITS
-- Every benefit_category enum value used at least once.
-- notes: mix of populated and NULL.
-- ============================================================

INSERT INTO resource_benefits (resource_id, benefit, notes) VALUES
  (r1_id,  'free_food',        'No ID or income verification needed. Limit one bag per household per week.'),
  (r2_id,  'discounted_food',  NULL), -- EDGE: notes NULL
  (r3_id,  'snap_accepted',    'Double Up Food Bucks active — EBT dollars doubled on Oregon produce.'),
  (r3_id,  'discounted_food',  'Non-SNAP shoppers also welcome; most items priced below retail.'),
  (r4_id,  'student_discount', 'Valid PSU student ID required. Discount does not apply to guest purchases.'),
  (r4_id,  'free_food',        'Pantry access included with student ID — separate from buying club.'),
  (r5_id,  'senior_discount',  'Intended for adults 60+. Suggested donation only — no one turned away.'),
  (r5_id,  'free_food',        NULL), -- EDGE: notes NULL
  (r6_id,  'kids_eat_free',    'Children 12 and under only. Must be accompanied by a paying adult.'),
  (r7_id,  'bogo',             'Day-old stock only. Selection varies daily. Offer applies after 4pm.'),
  (r8_id,  'coupon',           'Both print and digital coupons available. Updated weekly.'),
  (r9_id,  'free_breakfast',   NULL), -- EDGE: notes NULL
  (r10_id, 'other',            'Covers utility assistance, SNAP enrollment help, and food referrals.'),
  (r11_id, 'free_food',        'Currently suspended — resource is inactive.'), -- EDGE: inactive resource
  (r12_id, 'free_food',        'Summer season only. Program ended August 2025.'),  -- EDGE: expired resource
  (r12_id, 'kids_eat_free',    NULL),
  (r13_id, 'snap_accepted',    NULL), -- EDGE: pending resource benefits
  (r13_id, 'free_food',        NULL),
  (r13_id, 'bogo',             NULL),
  (r13_id, 'coupon',           NULL),
  (r16_id, 'military_discount', 'Valid military ID, VA card, or DD-214 accepted as proof of service.'),
  (r16_id, 'discounted_food',   NULL);


-- ============================================================
-- RESOURCE HOURS
-- All 7 day_of_week enum values used.
-- valid_from/valid_until: seasonal/academic hours vs NULL.
-- notes: populated vs NULL.
-- ============================================================

INSERT INTO resource_hours (
  physical_location_id, day, opens_at, closes_at, notes, valid_from, valid_until
) VALUES

  -- pl1 (Hawthorne Pantry loc 1): all 7 days of the week
  (pl1_id, 'monday',    '09:00', '17:00', NULL, NULL, NULL),
  (pl1_id, 'tuesday',   '09:00', '17:00', NULL, NULL, NULL),
  (pl1_id, 'wednesday', '09:00', '17:00', NULL, NULL, NULL),
  (pl1_id, 'thursday',  '09:00', '17:00', NULL, NULL, NULL),
  (pl1_id, 'friday',    '09:00', '17:00', 'Extended to 7pm on last Friday of the month', NULL, NULL), -- EDGE: notes populated
  (pl1_id, 'saturday',  '10:00', '14:00', NULL, NULL, NULL),
  (pl1_id, 'sunday',    '12:00', '15:00', 'Volunteer-only hours, limited supply', NULL, NULL), -- EDGE: sunday with notes

  -- pl2 (Hawthorne Pantry loc 2): seasonal hours with valid_from/valid_until
  (pl2_id, 'tuesday',  '10:00', '14:00', NULL, '2026-09-01', '2027-05-31'), -- EDGE: date-bounded seasonal hours
  (pl2_id, 'thursday', '10:00', '14:00', NULL, '2026-09-01', '2027-05-31'),

  -- pl4 (Lents SNAP Market): Saturday outdoor market only
  (pl4_id, 'saturday', '09:00', '14:00', 'Outdoor market — check website if weather is severe', NULL, NULL),

  -- pl5 (PSU Collective): weekdays, bounded by academic year
  (pl5_id, 'monday',    '11:00', '18:00', NULL, '2026-09-22', '2027-06-13'), -- EDGE: academic-year bounded
  (pl5_id, 'tuesday',   '11:00', '18:00', NULL, '2026-09-22', '2027-06-13'),
  (pl5_id, 'wednesday', '11:00', '18:00', NULL, '2026-09-22', '2027-06-13'),
  (pl5_id, 'thursday',  '11:00', '18:00', NULL, '2026-09-22', '2027-06-13'),
  (pl5_id, 'friday',    '11:00', '15:00', NULL, '2026-09-22', '2027-06-13'),

  -- pl6 (Senior Dining): Tue–Sat with a notes-bearing Saturday
  (pl6_id, 'tuesday',   '11:00', '13:00', NULL, NULL, NULL),
  (pl6_id, 'wednesday', '11:00', '13:00', NULL, NULL, NULL),
  (pl6_id, 'thursday',  '11:00', '13:00', NULL, NULL, NULL),
  (pl6_id, 'friday',    '11:00', '13:00', NULL, NULL, NULL),
  (pl6_id, 'saturday',  '11:00', '13:00', 'Reservations strongly encouraged on Saturdays', NULL, NULL),

  -- pl10 (St. Johns Breakfast): Sunday only
  (pl10_id, 'sunday', '08:00', '11:00', 'No sign-up required. Come as you are.', NULL, NULL),

  -- pl11 (Kenton Hub): Mon–Fri business hours
  (pl11_id, 'monday',    '09:00', '17:00', NULL, NULL, NULL),
  (pl11_id, 'tuesday',   '09:00', '17:00', NULL, NULL, NULL),
  (pl11_id, 'wednesday', '09:00', '17:00', NULL, NULL, NULL),
  (pl11_id, 'thursday',  '09:00', '17:00', NULL, NULL, NULL),
  (pl11_id, 'friday',    '09:00', '17:00', NULL, NULL, NULL),

  -- pl16 (Veterans Market): Mon–Sat
  (pl16_id, 'monday',    '08:00', '20:00', NULL, NULL, NULL),
  (pl16_id, 'tuesday',   '08:00', '20:00', NULL, NULL, NULL),
  (pl16_id, 'wednesday', '08:00', '20:00', NULL, NULL, NULL),
  (pl16_id, 'thursday',  '08:00', '20:00', NULL, NULL, NULL),
  (pl16_id, 'friday',    '08:00', '20:00', NULL, NULL, NULL),
  (pl16_id, 'saturday',  '09:00', '18:00', NULL, NULL, NULL);


-- ============================================================
-- RESOURCE ELIGIBILITY
-- All boolean flag combinations covered.
-- income_limit, other_requirements, notes: populated vs NULL.
-- ============================================================

INSERT INTO resource_eligibility (
  resource_id, income_limit, id_required, residency_required,
  referral_required, other_requirements, notes
) VALUES

  -- r1: no requirements — all false, all text fields NULL or minimal
  (r1_id, NULL, false, false, false, NULL, 'Open to all — no documentation needed.'),

  -- r2: income limit text set, id_required=true
  (r2_id,
   'No formal income limit, but membership is intended for low-to-moderate income households.',
   true, -- EDGE: id_required=true
   false, false, NULL,
   'Photo ID required to establish membership. Library card, school ID, or state ID accepted.'),

  -- r3: residency_required=true
  (r3_id, NULL, false,
   true, -- EDGE: residency_required=true
   false,
   'Must reside within the Portland metro area.',
   'Any proof of address accepted (utility bill, lease agreement, etc.).'),

  -- r4: id_required + referral_required both true
  (r4_id, NULL,
   true,  -- EDGE: id_required=true
   false,
   true,  -- EDGE: referral_required=true
   'Must be enrolled PSU student for current term.',
   'Bring your student ID and enrollment confirmation.'),

  -- r5: other_requirements set, age restriction
  (r5_id, NULL, false, false, false,
   'Must be 60 years of age or older.', -- EDGE: other_requirements populated
   'Age verification may be requested. ORCA/senior ID or any government ID accepted.'),

  -- r9: all flags true + income_limit — maximum restriction row
  (r9_id,
   'Below 200% federal poverty level preferred but not strictly enforced.', -- EDGE: income_limit set
   true,  -- EDGE: all boolean flags true
   true,
   false,
   'Priority given to St. Johns and Cathedral Park neighborhood residents.',
   'All eligibility requirements are loosely enforced — no one turned away.'),

  -- r10: all false, only notes
  (r10_id, NULL, false, false, false, NULL,
   'Walk-in welcome. Bring any documentation you have, but nothing is strictly required.');


-- ============================================================
-- OWNERS
-- verification_method values: 'phone', 'document', 'email_domain' — all three used.
-- verification_status values:  'pending', 'verified', 'rejected' — all three used.
-- ============================================================

INSERT INTO owners (
  id, user_id, resource_id,
  verification_status, verification_method, verification_notes,
  verified_at, verified_by, created_at
) VALUES

  -- verified via phone
  (o1_id, user_1_id, r1_id,
   'verified', 'phone', -- EDGE: verification_method=phone
   'Called (503) 555-0101. Spoke with coordinator who confirmed ownership.',
   now() - interval '85 days', admin_id,
   now() - interval '88 days'),

  -- verified via document
  (o2_id, user_2_id, r2_id,
   'verified', 'document', -- EDGE: verification_method=document
   'Reviewed articles of incorporation and Oregon Secretary of State registration.',
   now() - interval '55 days', admin_id,
   now() - interval '58 days'),

  -- verified via email_domain
  (o3_id, user_1_id, r9_id,
   'verified', 'email_domain', -- EDGE: verification_method=email_domain
   'Organizer confirmed via stjohns-coalition.org domain email.',
   now() - interval '360 days', admin_id,
   now() - interval '363 days'),

  -- pending — all verification fields NULL
  (o4_id, user_4_id, r13_id,
   'pending', NULL, -- EDGE: pending owner, no method, no notes, no verified_at
   NULL, NULL, NULL,
   now() - interval '3 days'),

  -- rejected — verified_at NULL despite reviewed_by being set
  (o5_id, user_4_id, r14_id,
   'rejected', 'phone', -- EDGE: rejected owner
   'Phone number disconnected. No response to email follow-up. Unable to verify.',
   NULL, admin_id, -- EDGE: verified_at NULL (rejected, never successfully verified)
   now() - interval '19 days');


-- ============================================================
-- VERIFICATION EVENTS
-- Covers all three nullable FK targets:
--   resource_id only, physical_location_id only, owner_id only.
-- outcome: 'verified' and 'rejected'.
-- ============================================================

INSERT INTO verification_events (
  resource_id, physical_location_id, owner_id,
  verified_at, verified_by, method, outcome, notes
) VALUES

  -- resource-level verification event
  (r1_id, NULL, NULL,
   now() - interval '85 days', admin_id,
   'phone', 'verified',
   'Admin called listed phone number. Confirmed hours, address, and pantry operation.'),

  -- location-level verification event — resource_id and owner_id NULL
  (NULL, pl1_id, NULL, -- EDGE: physical_location_id set, resource_id NULL
   now() - interval '84 days', admin_id,
   'document', 'verified',
   'Verified address via county property records and street-level imagery.'),

  -- owner-level verification event — resource_id and physical_location_id NULL
  (NULL, NULL, o2_id, -- EDGE: owner_id set, resource_id and physical_location_id NULL
   now() - interval '55 days', admin_id,
   'document', 'verified',
   'Reviewed business registration documents submitted by owner.'),

  -- rejection event — all three FKs NULL except resource_id
  (r14_id, NULL, NULL,
   now() - interval '18 days', admin_id,
   'phone',
   'rejected', -- EDGE: rejected outcome
   'Phone not in service. Business address does not exist per county records. Flagged as fraudulent.');


-- ============================================================
-- COMMUNITY NOTES
-- rating: 1 (min), 3, 4, 5 (max), NULL.
-- is_flagged: true and false.
-- ============================================================

INSERT INTO community_notes (
  resource_id, author_id, body, rating, is_flagged, created_at
) VALUES

  -- rating 5, not flagged
  (r1_id, user_1_id,
   'This pantry is amazing. The volunteers are so kind and the selection is always fresh. I bring my whole family.',
   5, false, now() - interval '10 days'),

  -- rating 1, not flagged — EDGE: minimum rating
  (r1_id, user_2_id,
   'Showed up at 2pm on a Wednesday and they were already out of most items. Went home empty-handed.',
   1, false, now() - interval '20 days'), -- EDGE: rating=1 (minimum)

  -- rating NULL, not flagged — EDGE: informational note, no rating
  (r1_id, user_3_id,
   'Just leaving a note: they have a new entrance — use the side door on SE 35th, not the main street door.',
   NULL, false, now() - interval '5 days'), -- EDGE: rating NULL

  -- rating 1, flagged — EDGE: flagged community note
  (r2_id, user_4_id,
   'This place is actually not a co-op, it is a scam. Do not give them money.',
   1, true, now() - interval '8 days'), -- EDGE: is_flagged=true

  -- rating 3, not flagged
  (r5_id, user_1_id,
   'Reliable hot lunch, volunteers are friendly. Parking can be tricky on weekday afternoons.',
   3, false, now() - interval '30 days'),

  -- rating 4, not flagged
  (r9_id, user_2_id,
   'Great community vibe on Sunday mornings. Pancakes are excellent. Bring cash to donate if you can.',
   4, false, now() - interval '45 days'),

  -- note on expired resource — EDGE: comment left on a past-expiry resource
  (r12_id, user_3_id,
   'This program ended in August — it was excellent while it ran. Hope it comes back next summer!',
   5, false, now() - interval '280 days'); -- EDGE: note on expired resource


-- ============================================================
-- SUBMISSIONS
-- All 3 submission_status values: pending, approved, rejected.
-- reviewed_by: NULL (pending), populated (approved/rejected).
-- benefits: populated and NULL.
-- EDGE: one submission contains all 10 benefit_category values.
-- ============================================================

INSERT INTO submissions (
  id, submitted_by, status, reviewed_by,
  name, description, benefits, access_notes, created_at
) VALUES

  -- pending: reviewed_by NULL, access_notes populated
  (sub1_id, user_3_id,
   'pending',
   NULL, -- EDGE: reviewed_by NULL (not yet reviewed)
   'Montavilla Free Produce Stand',
   'A volunteer-run produce stand in Montavilla offering surplus vegetables from local community gardens.',
   ARRAY['free_food']::benefit_category[],
   'Located in the Montavilla park parking lot. Open Saturdays 9am–noon.',
   now() - interval '2 days'),

  -- approved: reviewed_by admin, description NULL
  (sub2_id, user_4_id,
   'approved', admin_id,
   'Cully Neighborhood Food Swap',
   'Monthly food swap in Cully where neighbors trade homemade preserves, garden produce, and dry goods.',
   ARRAY['free_food', 'other']::benefit_category[],
   NULL, -- EDGE: access_notes NULL
   now() - interval '40 days'),

  -- rejected: description NULL + all 10 benefit_category values in one array
  (sub3_id, user_4_id,
   'rejected', admin_id,
   'Free Pizza Every Day',
   NULL, -- EDGE: description NULL
   ARRAY['free_food','discounted_food','snap_accepted','student_discount','senior_discount',
         'kids_eat_free','bogo','coupon','free_breakfast','other']::benefit_category[], -- EDGE: all 10 enum values
   'Just show up.',
   now() - interval '15 days');


-- ============================================================
-- EDITS
-- All 3 edit_status values: pending, approved, rejected.
-- old_value: NULL (adding a new value) vs populated.
-- reviewed_by: NULL (pending) vs populated.
-- ============================================================

INSERT INTO edits (
  id, resource_id, submitted_by, status, reviewed_by,
  field_name, old_value, new_value, created_at
) VALUES

  -- pending: reviewed_by NULL, correcting a phone number
  (e1_id, r1_id, user_2_id,
   'pending',
   NULL, -- EDGE: reviewed_by NULL
   'phone_number', '(503) 555-0101', '(503) 555-9999',
   now() - interval '1 day'),

  -- approved: description expansion
  (e2_id, r5_id, user_1_id,
   'approved', admin_id,
   'description',
   'Hot lunches served five days a week for Portland seniors.',
   'Hot lunches served five days a week for Portland seniors at the Richmond Community Center. Operated by Multnomah County Aging Services.',
   now() - interval '50 days'),

  -- rejected: bad-faith edit attempt; old_value NULL (field was empty)
  (e3_id, r9_id, user_4_id,
   'rejected', admin_id,
   'offer_desc',
   'Free hot breakfast every Sunday from 8am to 11am.',
   'Closed permanently.', -- EDGE: rejected bad-faith edit
   now() - interval '10 days');


-- ============================================================
-- EDIT HISTORY
-- edit_id: populated (linked to approved edit) and NULL (direct admin change).
-- approved_by: populated and NULL.
-- ============================================================

INSERT INTO edit_history (
  resource_id, edit_id, changed_by, approved_by,
  field_name, old_value, new_value, changed_at
) VALUES

  -- from approved edit e2
  (r5_id, e2_id, user_1_id, admin_id,
   'description',
   'Hot lunches served five days a week for Portland seniors.',
   'Hot lunches served five days a week for Portland seniors at the Richmond Community Center. Operated by Multnomah County Aging Services.',
   now() - interval '49 days'),

  -- direct admin change — edit_id NULL, approved_by NULL, old_value NULL
  (r1_id, NULL, admin_id, NULL, -- EDGE: edit_id NULL (direct admin write, no corresponding edits row)
   'notes',
   NULL, -- EDGE: old_value NULL (field was previously empty)
   'Offers extra supplies on the last Friday of each month. Wheelchair accessible entrance on SE 35th.',
   now() - interval '5 days');

END $$;
