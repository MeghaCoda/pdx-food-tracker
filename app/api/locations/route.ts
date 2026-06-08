import type { NextRequest } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export async function GET(_req: NextRequest) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('locations')
    .select('*, location_hours(*)')
    .eq('is_active', true);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const locations = data.map((loc) => {
    const hours = Object.fromEntries(
      DAYS.map((day) => [day, []])
    ) as Record<DayOfWeek, { start: string; end: string }[]>;

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
      website: loc.website ?? '',
      donationLink: loc.donation_link ?? '',
      deliveryAvailable: loc.delivery_available ?? false,
      volunteerLink: loc.volunteer_link ?? '',
      phoneNumber: loc.phone ?? '',
      hours,
      infoLastVerified: loc.info_last_verified ?? '',
      lastUpdated: loc.updated_at,
      notes: loc.description ?? '',
    };
  });

  return Response.json(locations);
}
