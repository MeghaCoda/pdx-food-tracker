import { createSupabaseClient } from '@/lib/supabase';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type ResourceHoursRow = {
  id: string;
  physical_location_id: string;
  day: DayOfWeek;
  opens_at: string;
  closes_at: string;
  notes: string | null;
  valid_from: string | null;
  valid_until: string | null;
};

export type ResourceRow = {
  id: string;
  name: string;
  description: string | null;
  offer_desc: string | null;
  offer_source: string | null;
  benefits: string[] | null;
  verification_status: 'pending' | 'approved' | 'rejected' | null;
  expires_at: string | null;
  is_active: boolean | null;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
};

export type PhysicalLocationRow = {
  id: string;
  resource_id: string;
  address: string;
  address2: string | null;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
  phone_number: string | null;
  verification_status: 'pending' | 'approved' | 'rejected' | null;
  created_at: string | null;
  resources: ResourceRow | null;
  resource_hours: ResourceHoursRow[];
};

type PhysicalLocationInsert = Omit<PhysicalLocationRow, 'id' | 'created_at' | 'resource_hours' | 'resources'>;
type ResourceHoursInsert = Omit<ResourceHoursRow, 'id'>;

export async function fetchPhysicalLocationById(id: string): Promise<PhysicalLocationRow> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('physical_locations')
    .select('*, resources(*), resource_hours(*)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as PhysicalLocationRow;
}

export async function fetchPhysicalLocations(): Promise<PhysicalLocationRow[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('physical_locations')
    .select('*, resources(*), resource_hours(*)')
    .eq('verification_status', 'approved');
  if (error) throw new Error(error.message);
  return data as PhysicalLocationRow[];
}

export async function insertPhysicalLocation(row: PhysicalLocationInsert): Promise<{ id: string }> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('physical_locations')
    .insert(row)
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return data as { id: string };
}

export async function insertResourceHours(rows: ResourceHoursInsert[]): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from('resource_hours').insert(rows);
  if (error) throw new Error(error.message);
}

export async function updatePhysicalLocationRow(
  id: string,
  row: Partial<PhysicalLocationInsert>
): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('physical_locations')
    .update(row)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteResourceHours(physicalLocationId: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('resource_hours')
    .delete()
    .eq('physical_location_id', physicalLocationId);
  if (error) throw new Error(error.message);
}

export async function deletePhysicalLocation(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('physical_locations')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}
