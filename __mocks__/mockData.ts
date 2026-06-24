import type { PhysicalLocationWithHours } from "@/app/api/locations/service";

export const MOCK_LOCATION_ID = '11111111-1111-1111-8111-111111111111';
export const MOCK_RESOURCE_ID = '22222222-2222-2222-8222-222222222222';
export const MOCK_HOURS_ID = '33333333-3333-3333-8333-333333333333';

export const mockDbRow = {
  id: MOCK_LOCATION_ID,
  resource_id: MOCK_RESOURCE_ID,
  address: '123 Main St',
  address2: null,
  city: 'Portland',
  state: 'OR',
  zip_code: '97201',
  neighborhood: null,
  latitude: 45.523,
  longitude: -122.6765,
  phone_number: '503-555-1234',
  verification_status: 'pending' as const,
  created_at: '2025-01-01T00:00:00Z',
  resource_hours: [
    {
      id: MOCK_HOURS_ID,
      physical_location_id: MOCK_LOCATION_ID,
      day: 'monday' as const,
      opens_at: '08:00:00',
      closes_at: '17:00:00',
      notes: null,
      valid_from: null,
      valid_until: null,
    },
  ],
};

export const mockLocation: PhysicalLocationWithHours = {
  id: MOCK_LOCATION_ID,
  resource_id: MOCK_RESOURCE_ID,
  address: '123 Main St',
  address2: null,
  city: 'Portland',
  state: 'OR',
  zip_code: '97201',
  neighborhood: null,
  latitude: 45.523,
  longitude: -122.6765,
  phone_number: '503-555-1234',
  verification_status: 'pending',
  created_at: '2025-01-01T00:00:00Z',
  resource_hours: [
    {
      id: MOCK_HOURS_ID,
      day: 'monday',
      opens_at: '08:00:00',
      closes_at: '17:00:00',
      notes: null,
      valid_from: null,
      valid_until: null,
    },
  ],
};
