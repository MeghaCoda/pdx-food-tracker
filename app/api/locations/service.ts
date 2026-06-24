import { PhysicalLocationsSchema } from '@/schemas/zodSchema';
import type { PhysicalLocation, ResourceHours } from '@/schemas/zodSchema';
import type { PhysicalLocationRow } from './db';
import type { PhysicalLocationInput, PhysicalLocationUpdate } from './schemas';
import {
  fetchPhysicalLocationById,
  fetchPhysicalLocations,
  insertPhysicalLocation,
  insertResourceHours,
  updatePhysicalLocationRow,
  deleteResourceHours,
  deletePhysicalLocation,
} from './db';

export type PhysicalLocationWithHours = PhysicalLocation & {
  resource_hours: Array<Omit<ResourceHours, 'physical_location_id'>>;
};

function formatLocation(row: PhysicalLocationRow): unknown {
  return {
    id: row.id,
    resource_id: row.resource_id,
    address: row.address,
    address2: row.address2,
    city: row.city,
    state: row.state,
    zip_code: row.zip_code,
    neighborhood: row.neighborhood,
    latitude: row.latitude,
    longitude: row.longitude,
    phone_number: row.phone_number,
    verification_status: row.verification_status,
    created_at: row.created_at,
    resource_hours: (row.resource_hours ?? []).map((h) => ({
      id: h.id,
      day: h.day,
      opens_at: h.opens_at,
      closes_at: h.closes_at,
      notes: h.notes,
      valid_from: h.valid_from,
      valid_until: h.valid_until,
    })),
  };
}

function inputToRow(data: Partial<PhysicalLocationInput>) {
  return {
    ...(data.resource_id !== undefined && { resource_id: data.resource_id }),
    ...(data.address !== undefined && { address: data.address }),
    ...(data.address2 !== undefined && { address2: data.address2 ?? null }),
    ...(data.city !== undefined && { city: data.city }),
    ...(data.state !== undefined && { state: data.state }),
    ...(data.zip_code !== undefined && { zip_code: data.zip_code }),
    ...(data.neighborhood !== undefined && { neighborhood: data.neighborhood ?? null }),
    ...(data.latitude !== undefined && { latitude: data.latitude ?? null }),
    ...(data.longitude !== undefined && { longitude: data.longitude ?? null }),
    ...(data.phone_number !== undefined && { phone_number: data.phone_number ?? null }),
    ...(data.verification_status !== undefined && {
      verification_status: data.verification_status ?? null,
    }),
  };
}

async function getById(id: string): Promise<PhysicalLocationWithHours> {
  const row = await fetchPhysicalLocationById(id);
  const formatted = formatLocation(row);
  const result = PhysicalLocationsSchema.safeParse(formatted);
  if (!result.success) {
    throw new Error(`Invalid location data: ${JSON.stringify(result.error.flatten())}`);
  }
  return formatted as PhysicalLocationWithHours;
}

export async function getLocations(): Promise<PhysicalLocationWithHours[]> {
  const rows = await fetchPhysicalLocations();
  return rows.reduce<PhysicalLocationWithHours[]>((acc, row) => {
    const formatted = formatLocation(row);
    const result = PhysicalLocationsSchema.safeParse(formatted);
    if (result.success) {
      acc.push(formatted as PhysicalLocationWithHours);
    } else {
      console.error(`Invalid location ${row.id}:`, result.error.flatten());
    }
    return acc;
  }, []);
}

export async function createLocation(
  data: PhysicalLocationInput
): Promise<PhysicalLocationWithHours> {
  const { resource_hours, ...locationData } = data;
  const loc = await insertPhysicalLocation(
    inputToRow(locationData) as Parameters<typeof insertPhysicalLocation>[0]
  );

  if (resource_hours && resource_hours.length > 0) {
    await insertResourceHours(
      resource_hours.map((h) => ({
        ...h,
        physical_location_id: loc.id,
        notes: h.notes ?? null,
        valid_from: h.valid_from ?? null,
        valid_until: h.valid_until ?? null,
      }))
    );
  }

  return getById(loc.id);
}

export async function updateLocation(
  id: string,
  data: PhysicalLocationUpdate
): Promise<PhysicalLocationWithHours> {
  const { resource_hours, ...locationData } = data;
  await updatePhysicalLocationRow(id, inputToRow(locationData));

  if (resource_hours !== undefined) {
    await deleteResourceHours(id);
    if (resource_hours.length > 0) {
      await insertResourceHours(
        resource_hours.map((h) => ({
          ...h,
          physical_location_id: id,
          notes: h.notes ?? null,
          valid_from: h.valid_from ?? null,
          valid_until: h.valid_until ?? null,
        }))
      );
    }
  }

  return getById(id);
}

export async function deleteLocation(id: string): Promise<void> {
  await deletePhysicalLocation(id);
}
