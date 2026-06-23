'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

function makeAuthClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}

function makeAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}

function makeUserClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
}

async function verifyAdminToken(token: string) {
  const auth = makeAuthClient();
  const { data: { user }, error } = await auth.auth.getUser(token);
  if (error || !user) return null;

  if (user.app_metadata?.role !== 'admin') return null;

  return user;
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  const user = await verifyAdminToken(token);
  if (!user) return null;
  return { user, token };
}

export type SignInState = { error?: string };

export async function signIn(_: SignInState, formData: FormData): Promise<SignInState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const auth = makeAuthClient();
  const { data, error } = await auth.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return { error: 'Invalid email or password.' };
  }

  if (data.user.app_metadata?.role !== 'admin') {
    return { error: 'Access denied. Admin role required.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('auth_token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.session.expires_in,
    path: '/',
  });

  redirect('/admin/upload');
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/admin/upload');
}

// ============================================================
// Offers (resources)
// ============================================================

export type OfferSummary = { id: string; name: string };

export async function getOffers(): Promise<OfferSummary[]> {
  const session = await requireAdmin();
  if (!session) return [];
  const db = makeAdminClient();
  const { data, error } = await db.from('resources').select('id, name').order('name');
  if (error || !data) return [];
  return data as OfferSummary[];
}

export type LocationHour = {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  opens_at: string;
  closes_at: string;
  notes: string | null;
  valid_from: string | null;
  valid_until: string | null;
};

export type OfferLocation = {
  id: string;
  address: string;
  address2: string | null;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  phone_number: string | null;
  notes: string | null;
  verification_status: string | null;
  hours: LocationHour[];
};

export type OfferDetail = {
  id: string;
  name: string;
  description: string | null;
  offer_desc: string | null;
  offer_source: string | null;
  benefits: string[] | null;
  verification_status: string | null;
  expires_at: string | null;
  is_active: boolean | null;
  notes: string | null;
  locations: OfferLocation[];
};

export async function getOfferWithLocations(id: string): Promise<OfferDetail | null> {
  const session = await requireAdmin();
  if (!session) return null;
  const db = makeAdminClient();
  const [offerRes, locRes] = await Promise.all([
    db.from('resources').select('*').eq('id', id).single(),
    db.from('physical_locations').select('*').eq('resource_id', id),
  ]);
  if (offerRes.error || !offerRes.data) return null;
  const o = offerRes.data;
  return {
    id: o.id,
    name: o.name,
    description: o.description ?? null,
    offer_desc: o.offer_desc ?? null,
    offer_source: o.offer_source ?? null,
    benefits: o.benefits ?? null,
    verification_status: o.verification_status ?? null,
    expires_at: o.expires_at ?? null,
    is_active: o.is_active ?? null,
    notes: o.notes ?? null,
    locations: (locRes.data ?? []).map((l: Omit<OfferLocation, 'hours'>) => ({ ...l, hours: [] })),
  };
}

export type UpdateOfferResult = { success?: true; error?: string };

export async function updateOffer(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    offer_desc?: string | null;
    offer_source?: string | null;
    benefits?: string[] | null;
    expires_at?: string | null;
    is_active?: boolean | null;
    verification_status?: string | null;
    notes?: string | null;
  }
): Promise<UpdateOfferResult> {
  const session = await requireAdmin();
  if (!session) return { error: 'Unauthorized. Please sign in as admin.' };
  const db = makeAdminClient();
  const { error } = await db.from('resources').update(data).eq('id', id);
  if (error) return { error: error.message };
  return { success: true };
}

// ============================================================
// Approval queue
// ============================================================

export type PendingResource = {
  id: string;
  name: string;
  description: string | null;
  offer_desc: string | null;
  offer_source: string | null;
  benefits: string[] | null;
  expires_at: string | null;
  is_active: boolean | null;
  notes: string | null;
  verification_status: string;
  created_at: string | null;
  locations: OfferLocation[];
};

export async function getPendingResources(): Promise<PendingResource[]> {
  const session = await requireAdmin();
  if (!session) return [];
  const db = makeAdminClient();

  const { data: resources, error } = await db
    .from('resources')
    .select('*')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true });

  if (error || !resources || resources.length === 0) return [];

  const resourceIds = resources.map((r: { id: string }) => r.id);
  const { data: locations } = await db
    .from('physical_locations')
    .select('*')
    .in('resource_id', resourceIds);

  const locationIds = (locations ?? []).map((l: { id: string }) => l.id);
  const { data: hours } = locationIds.length > 0
    ? await db.from('resource_hours').select('*').in('physical_location_id', locationIds)
    : { data: [] };

  const hoursByLocation = ((hours ?? []) as Array<LocationHour & { physical_location_id: string }>).reduce<
    Record<string, LocationHour[]>
  >((acc, h) => {
    if (!acc[h.physical_location_id]) acc[h.physical_location_id] = [];
    acc[h.physical_location_id].push(h);
    return acc;
  }, {});

  const locationsByResource = ((locations ?? []) as Array<{ resource_id: string } & Omit<OfferLocation, 'hours'>>).reduce<
    Record<string, OfferLocation[]>
  >((acc, loc) => {
    if (!acc[loc.resource_id]) acc[loc.resource_id] = [];
    acc[loc.resource_id].push({ ...loc, hours: hoursByLocation[loc.id] ?? [] });
    return acc;
  }, {});

  return resources.map((r: {
    id: string; name: string; description: string | null; offer_desc: string | null;
    offer_source: string | null; benefits: string[] | null; expires_at: string | null;
    is_active: boolean | null; notes: string | null; verification_status: string; created_at: string | null;
  }) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    offer_desc: r.offer_desc ?? null,
    offer_source: r.offer_source ?? null,
    benefits: r.benefits ?? null,
    expires_at: r.expires_at ?? null,
    is_active: r.is_active ?? null,
    notes: r.notes ?? null,
    verification_status: r.verification_status,
    created_at: r.created_at ?? null,
    locations: locationsByResource[r.id] ?? [],
  }));
}

export type ApproveResult = { success?: true; error?: string };

export async function setResourceVerificationStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<ApproveResult> {
  const session = await requireAdmin();
  if (!session) return { error: 'Unauthorized.' };
  const db = makeAdminClient();
  const { error } = await db.from('resources').update({ verification_status: status }).eq('id', id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function setLocationVerificationStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<ApproveResult> {
  const session = await requireAdmin();
  if (!session) return { error: 'Unauthorized.' };
  const db = makeAdminClient();
  const { error } = await db.from('physical_locations').update({ verification_status: status }).eq('id', id);
  if (error) return { error: error.message };
  return { success: true };
}

// ============================================================
// CSV batch upload
// ============================================================

export type CSVOfferRow = {
  name: string;
  description?: string;
  offer_desc?: string;
  offer_source?: string;
  benefits?: string[];
  expires_at?: string;
  is_active?: boolean;
  notes?: string;
  location?: {
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip_code: string;
    neighborhood?: string;
    phone_number?: string;
    notes?: string;
    hours?: Array<{
      day: string;
      opens_at: string;
      closes_at: string;
      notes?: string;
    }>;
  };
};

export type BatchUploadResult = {
  success?: true;
  created: number;
  skipped: number;
  error?: string;
};

export async function uploadOffers(
  rows: CSVOfferRow[],
  adminUserId: string
): Promise<BatchUploadResult> {
  const session = await requireAdmin();
  if (!session) return { created: 0, skipped: 0, error: 'Unauthorized. Please sign in as admin.' };

  const db = makeUserClient(session.token);
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const { data: existingResource } = await db
      .from('resources')
      .select('id')
      .ilike('name', row.name)
      .maybeSingle();

    if (existingResource) {
      skipped++;
      continue;
    }

    if (row.location) {
      let locQuery = db
        .from('physical_locations')
        .select('id')
        .ilike('address', row.location.address)
        .ilike('city', row.location.city);

      locQuery = row.location.address2
        ? locQuery.ilike('address2', row.location.address2)
        : locQuery.is('address2', null);

      const { data: existingLoc } = await locQuery.maybeSingle();
      if (existingLoc) {
        skipped++;
        continue;
      }
    }

    const { data: resource, error: resError } = await db
      .from('resources')
      .insert({
        name: row.name,
        description: row.description ?? null,
        offer_desc: row.offer_desc ?? null,
        offer_source: row.offer_source ?? null,
        benefits: row.benefits ?? null,
        expires_at: row.expires_at ?? null,
        is_active: row.is_active ?? null,
        notes: row.notes ?? null,
        verification_status: 'pending',
        created_by: adminUserId,
      })
      .select('id')
      .single();

    if (resError || !resource) {
      return { created, skipped, error: `Failed to create offer "${row.name}": ${resError?.message}` };
    }

    if (row.location) {
      const { data: location, error: locError } = await db.from('physical_locations').insert({
        resource_id: resource.id,
        address: row.location.address,
        address2: row.location.address2 ?? null,
        city: row.location.city,
        state: row.location.state,
        zip_code: row.location.zip_code,
        neighborhood: row.location.neighborhood ?? null,
        phone_number: row.location.phone_number ?? null,
        notes: row.location.notes ?? null,
        verification_status: 'pending',
        created_by: adminUserId,
      }).select('id').single();
      if (locError) {
        return {
          created,
          skipped,
          error: `Created offer "${row.name}" but failed to add its location: ${locError.message}`,
        };
      }

      if (row.location.hours && row.location.hours.length > 0) {
        const { error: hoursError } = await db.from('resource_hours').insert(
          row.location.hours.map((h) => ({
            physical_location_id: location.id,
            day: h.day,
            opens_at: h.opens_at,
            closes_at: h.closes_at,
            notes: h.notes ?? null,
          }))
        );
        if (hoursError) {
          return {
            created,
            skipped,
            error: `Created offer "${row.name}" but failed to add its hours: ${hoursError.message}`,
          };
        }
      }
    }

    created++;
  }

  return { success: true, created, skipped };
}
