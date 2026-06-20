'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

function makeAuthClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
}

function makeAdminClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
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
  return verifyAdminToken(token);
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
  const user = await requireAdmin();
  if (!user) return [];
  const db = makeAdminClient();
  const { data, error } = await db.from('resources').select('id, name').order('name');
  if (error || !data) return [];
  return data as OfferSummary[];
}

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
  const user = await requireAdmin();
  if (!user) return null;
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
    locations: (locRes.data ?? []) as OfferLocation[],
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
  const user = await requireAdmin();
  if (!user) return { error: 'Unauthorized. Please sign in as admin.' };
  const db = makeAdminClient();
  const { error } = await db.from('resources').update(data).eq('id', id);
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
  };
};

export type BatchUploadResult = {
  success?: true;
  created: number;
  error?: string;
};

export async function uploadOffers(
  rows: CSVOfferRow[],
  adminUserId: string
): Promise<BatchUploadResult> {
  const user = await requireAdmin();
  if (!user) return { created: 0, error: 'Unauthorized. Please sign in as admin.' };

  const db = makeAdminClient();
  let created = 0;

  for (const row of rows) {
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
      return { created, error: `Failed to create offer "${row.name}": ${resError?.message}` };
    }

    if (row.location) {
      const { error: locError } = await db.from('physical_locations').insert({
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
      });
      if (locError) {
        return {
          created,
          error: `Created offer "${row.name}" but failed to add its location: ${locError.message}`,
        };
      }
    }

    created++;
  }

  return { success: true, created };
}
