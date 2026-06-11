import { createSupabaseClient } from '@/lib/supabase';
import { DAYS } from '@/lib/constants';
import { DayOfWeek } from '@/types/utils';
import type { Database } from '@/types/supabase';
import { LocationSchema } from '@/schemas/zodSchema';
import type { Location, LocationInput, LocationUpdate } from '@/schemas/zodSchema';

type LocationRow = Database['public']['Tables']['locations']['Row'] & {
  location_hours: Database['public']['Tables']['location_hours']['Row'][];
};

function formatLocation(loc: LocationRow): unknown {
  const hours = Object.fromEntries(
    DAYS.map((day) => [day, []])
  ) as unknown as Record<DayOfWeek, { start: string; end: string }[]>;

  for (const h of loc.location_hours ?? []) {
    if (h.opens_at && h.closes_at) {
      hours[h.day as DayOfWeek].push({
        start: h.opens_at.slice(0, 5),
        end: h.closes_at.slice(0, 5),
      });
    }
  }

  return {
    id: loc.id,
    name: loc.name,
    address: loc.address,
    address2: loc.address2 ?? '',
    city: loc.city,
    state: loc.state,
    zipCode: loc.zip_code ?? loc.zip ?? '',
    latitude: loc.latitude ?? 0,
    longitude: loc.longitude ?? 0,
    offerDesc: loc.offer_desc ?? '',
    offerSource: loc.offer_source ?? '',
    website: loc.website ?? undefined,
    donationLink: loc.donation_link ?? undefined,
    deliveryAvailable: loc.delivery_available ?? false,
    volunteerLink: loc.volunteer_link ?? undefined,
    phoneNumber: loc.phone ?? '',
    hours,
    infoLastVerified: loc.info_last_verified ?? '',
    lastUpdated: loc.updated_at,
    notes: loc.description ?? '',
  };
}

function locationInputToRow(data: LocationInput | LocationUpdate) {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.address !== undefined && { address: data.address }),
    ...(data.address2 !== undefined && { address2: data.address2 ?? null }),
    ...(data.city !== undefined && { city: data.city }),
    ...(data.state !== undefined && { state: data.state }),
    ...(data.zipCode !== undefined && { zip_code: data.zipCode }),
    ...(data.latitude !== undefined && { latitude: data.latitude }),
    ...(data.longitude !== undefined && { longitude: data.longitude }),
    ...(data.offerDesc !== undefined && { offer_desc: data.offerDesc }),
    ...(data.offerSource !== undefined && { offer_source: data.offerSource }),
    ...(data.website !== undefined && { website: data.website ?? null }),
    ...(data.donationLink !== undefined && { donation_link: data.donationLink ?? null }),
    ...(data.deliveryAvailable !== undefined && { delivery_available: data.deliveryAvailable }),
    ...(data.volunteerLink !== undefined && { volunteer_link: data.volunteerLink ?? null }),
    ...(data.phoneNumber !== undefined && { phone: data.phoneNumber ?? null }),
    ...(data.infoLastVerified !== undefined && { info_last_verified: data.infoLastVerified }),
    ...(data.notes !== undefined && { description: data.notes ?? null }),
  };
}

function hoursToRows(locationId: string, hours: Location['hours']) {
  const rows: Database['public']['Tables']['location_hours']['Insert'][] = [];
  for (const [day, slots] of Object.entries(hours)) {
    for (const slot of slots) {
      rows.push({
        location_id: locationId,
        day: day as DayOfWeek,
        opens_at: `${slot.start}:00`,
        closes_at: `${slot.end}:00`,
      });
    }
  }
  return rows;
}

async function getLocationById(id: string): Promise<Location> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*, location_hours(*)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  const result = LocationSchema.safeParse(formatLocation(data as LocationRow));
  if (!result.success) {
    throw new Error(`Invalid location data: ${JSON.stringify(result.error.flatten())}`);
  }
  return result.data;
}

export async function getLocations(): Promise<Location[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('locations')
    .select('*, location_hours(*)')
    .eq('is_active', true);

  if (error) {
    throw new Error(error.message);
  }

  return data.reduce<Location[]>((acc, loc) => {
    const result = LocationSchema.safeParse(formatLocation(loc));
    if (result.success) {
      acc.push(result.data);
    } else {
      console.error(`Invalid location ${loc.id}:`, result.error.flatten());
    }
    return acc;
  }, []);
}

export async function createLocation(data: LocationInput): Promise<Location> {
  const supabase = createSupabaseClient();

  const { data: loc, error } = await supabase
    .from('locations')
    .insert(locationInputToRow(data) as Database['public']['Tables']['locations']['Insert'])
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  if (data.hours) {
    const hoursRows = hoursToRows(loc.id, data.hours);
    if (hoursRows.length > 0) {
      const { error: hoursError } = await supabase.from('location_hours').insert(hoursRows);
      if (hoursError) throw new Error(hoursError.message);
    }
  }

  return getLocationById(loc.id);
}

export async function updateLocation(id: string, data: LocationUpdate): Promise<Location> {
  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from('locations')
    .update(locationInputToRow(data))
    .eq('id', id);

  if (error) throw new Error(error.message);

  if (data.hours) {
    const { error: deleteError } = await supabase
      .from('location_hours')
      .delete()
      .eq('location_id', id);
    if (deleteError) throw new Error(deleteError.message);

    const hoursRows = hoursToRows(id, data.hours);
    if (hoursRows.length > 0) {
      const { error: insertError } = await supabase.from('location_hours').insert(hoursRows);
      if (insertError) throw new Error(insertError.message);
    }
  }

  return getLocationById(id);
}

export async function deleteLocation(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('locations')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw new Error(error.message);
}