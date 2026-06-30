import { describe, it, expect } from 'vitest'
import {
  BenefitCategorySchema,
  PhysicalLocationsSchema,
  ResourcesSchema,
  VerificationEventsSchema,
} from '@/schemas/zodSchema'
import type { VerificationEvent } from '@/schemas/zodSchema'
import {
  PhysicalLocationInputSchema,
  PhysicalLocationUpdateSchema,
} from '@/app/api/locations/schemas'
import { mockLocation, MOCK_LOCATION_ID, MOCK_RESOURCE_ID, MOCK_HOURS_ID } from '@/__mocks__/mockData'

describe('PhysicalLocationsSchema', () => {
  it('accepts a valid location', () => {
    expect(PhysicalLocationsSchema.safeParse(mockLocation).success).toBe(true)
  })

  it('rejects missing required field: address', () => {
    const { address: _address, ...rest } = mockLocation
    expect(PhysicalLocationsSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing required field: city', () => {
    const { city: _city, ...rest } = mockLocation
    expect(PhysicalLocationsSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing required field: resource_id', () => {
    const { resource_id: _rid, ...rest } = mockLocation
    expect(PhysicalLocationsSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects non-UUID id', () => {
    expect(PhysicalLocationsSchema.safeParse({ ...mockLocation, id: 'not-a-uuid' }).success).toBe(false)
  })

  it('rejects non-UUID resource_id', () => {
    expect(PhysicalLocationsSchema.safeParse({ ...mockLocation, resource_id: 'not-a-uuid' }).success).toBe(false)
  })

  it('rejects non-number latitude', () => {
    expect(PhysicalLocationsSchema.safeParse({ ...mockLocation, latitude: '45.523' }).success).toBe(false)
  })

  it('rejects zip_code shorter than 5 characters', () => {
    expect(PhysicalLocationsSchema.safeParse({ ...mockLocation, zip_code: '9720' }).success).toBe(false)
  })

  it('rejects zip_code longer than 10 characters', () => {
    expect(PhysicalLocationsSchema.safeParse({ ...mockLocation, zip_code: '97201-12345' }).success).toBe(false)
  })

  it('accepts null for nullable optional fields', () => {
    expect(PhysicalLocationsSchema.safeParse({
      ...mockLocation,
      address2: null,
      neighborhood: null,
      phone_number: null,
      verification_status: null,
      created_at: null,
    }).success).toBe(true)
  })

  it('rejects null latitude', () => {
    expect(PhysicalLocationsSchema.safeParse({ ...mockLocation, latitude: null }).success).toBe(false)
  })

  it('rejects null longitude', () => {
    expect(PhysicalLocationsSchema.safeParse({ ...mockLocation, longitude: null }).success).toBe(false)
  })

  it('accepts optional fields when provided', () => {
    const result = PhysicalLocationsSchema.safeParse({
      ...mockLocation,
      address2: 'Suite 100',
      neighborhood: 'Pearl District',
      phone_number: '503-555-9999',
      verification_status: 'approved',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid verification_status value', () => {
    expect(PhysicalLocationsSchema.safeParse({
      ...mockLocation,
      verification_status: 'verified',
    }).success).toBe(false)
  })
})

describe('PhysicalLocationInputSchema', () => {
  it('accepts valid input without id and created_at', () => {
    const { id: _id, created_at: _ca, resource_hours: _rh, ...input } = mockLocation
    expect(PhysicalLocationInputSchema.safeParse(input).success).toBe(true)
  })

  it('rejects missing required address', () => {
    const { id: _id, created_at: _ca, address: _addr, resource_hours: _rh, ...rest } = mockLocation
    expect(PhysicalLocationInputSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing required resource_id', () => {
    const { id: _id, created_at: _ca, resource_id: _rid, resource_hours: _rh, ...rest } = mockLocation
    expect(PhysicalLocationInputSchema.safeParse(rest).success).toBe(false)
  })

  it('accepts resource_hours array', () => {
    const { id: _id, created_at: _ca, resource_hours: _rh, ...input } = mockLocation
    const result = PhysicalLocationInputSchema.safeParse({
      ...input,
      resource_hours: [
        { day: 'monday', opens_at: '08:00', closes_at: '17:00' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('accepts missing resource_hours (optional)', () => {
    const { id: _id, created_at: _ca, resource_hours: _rh, ...input } = mockLocation
    expect(PhysicalLocationInputSchema.safeParse(input).success).toBe(true)
  })

  it('rejects invalid opens_at time format in resource_hours', () => {
    const { id: _id, created_at: _ca, resource_hours: _rh, ...input } = mockLocation
    const result = PhysicalLocationInputSchema.safeParse({
      ...input,
      resource_hours: [{ day: 'monday', opens_at: '8:00', closes_at: '17:00' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('PhysicalLocationUpdateSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(PhysicalLocationUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a partial update with just address', () => {
    const result = PhysicalLocationUpdateSchema.safeParse({ address: '456 New Ave' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.address).toBe('456 New Ave')
    }
  })

  it('accepts a partial update with coordinates', () => {
    const result = PhysicalLocationUpdateSchema.safeParse({ latitude: 45.5, longitude: -122.7 })
    expect(result.success).toBe(true)
  })

  it('rejects invalid field type even in partial update', () => {
    expect(PhysicalLocationUpdateSchema.safeParse({ latitude: 'not-a-number' }).success).toBe(false)
  })

  it('accepts partial update with resource_hours', () => {
    const result = PhysicalLocationUpdateSchema.safeParse({
      resource_hours: [{ day: 'tuesday', opens_at: '09:00', closes_at: '18:00' }],
    })
    expect(result.success).toBe(true)
  })
})

// ─── BenefitCategorySchema — missing enum values (schema gaps) ───────────────
//
// The following four values are required by planned filter chips but are NOT yet
// present in BenefitCategorySchema or in the Supabase DB enum.
// These tests FAIL until the schema and DB migration are updated.

describe('BenefitCategorySchema — missing values (GAP: schema not yet updated)', () => {
  it('accepts "prepared" as a benefit category', () => {
    // GAP: needed for the "Prepared" filter chip (hot/prepared meals)
    expect(BenefitCategorySchema.safeParse('prepared').success).toBe(true)
  })

  it('accepts "groceries" as a benefit category', () => {
    // GAP: needed for the "Groceries" filter chip (pantry/market/packaged food)
    expect(BenefitCategorySchema.safeParse('groceries').success).toBe(true)
  })

  it('accepts "restaurant" as a benefit category', () => {
    // GAP: needed for the "Restaurant" filter chip (eat-in restaurant deals)
    expect(BenefitCategorySchema.safeParse('restaurant').success).toBe(true)
  })

  it('accepts "military_discount" as a benefit category', () => {
    // GAP: military discounts are a real benefit type with no current schema support
    expect(BenefitCategorySchema.safeParse('military_discount').success).toBe(true)
  })

  it('accepts a resource whose benefits array contains "prepared"', () => {
    // GAP: ResourcesSchema rejects benefits arrays containing unknown enum values
    const result = ResourcesSchema.safeParse({
      id: MOCK_RESOURCE_ID,
      name: 'Hot Meals Hub',
      created_by: MOCK_RESOURCE_ID,
      benefits: ['prepared'],
    })
    expect(result.success).toBe(true)
  })

  it('accepts a resource whose benefits array contains "groceries"', () => {
    const result = ResourcesSchema.safeParse({
      id: MOCK_RESOURCE_ID,
      name: 'Grocery Pantry',
      created_by: MOCK_RESOURCE_ID,
      benefits: ['groceries'],
    })
    expect(result.success).toBe(true)
  })

  it('accepts a resource whose benefits array contains "restaurant"', () => {
    const result = ResourcesSchema.safeParse({
      id: MOCK_RESOURCE_ID,
      name: 'Community Diner',
      created_by: MOCK_RESOURCE_ID,
      benefits: ['restaurant'],
    })
    expect(result.success).toBe(true)
  })

  it('accepts a resource whose benefits array contains "military_discount"', () => {
    const result = ResourcesSchema.safeParse({
      id: MOCK_RESOURCE_ID,
      name: 'Veterans Discount Grocer',
      created_by: MOCK_RESOURCE_ID,
      benefits: ['military_discount'],
    })
    expect(result.success).toBe(true)
  })
})

const mockVerificationEvent: VerificationEvent = {
  id: MOCK_HOURS_ID,
  resource_id: MOCK_RESOURCE_ID,
  physical_location_id: MOCK_LOCATION_ID,
  owner_id: null,
  verified_at: '2026-06-12T00:00:00Z',
  verified_by: null,
  method: 'phone',
  outcome: 'confirmed',
  notes: null,
}

describe('VerificationEventsSchema', () => {
  it('accepts a minimal valid event', () => {
    expect(VerificationEventsSchema.safeParse({ id: MOCK_HOURS_ID }).success).toBe(true)
  })

  it('accepts a fully populated event', () => {
    expect(VerificationEventsSchema.safeParse(mockVerificationEvent).success).toBe(true)
  })

  it('rejects non-UUID id', () => {
    expect(VerificationEventsSchema.safeParse({ id: 'not-a-uuid' }).success).toBe(false)
  })

  it('rejects non-UUID resource_id when provided', () => {
    expect(VerificationEventsSchema.safeParse({
      ...mockVerificationEvent,
      resource_id: 'not-a-uuid',
    }).success).toBe(false)
  })

  it('accepts null for all nullable optional fields', () => {
    expect(VerificationEventsSchema.safeParse({
      id: MOCK_HOURS_ID,
      resource_id: null,
      physical_location_id: null,
      owner_id: null,
      verified_at: null,
      verified_by: null,
      method: null,
      outcome: null,
      notes: null,
    }).success).toBe(true)
  })

  it('rejects invalid datetime for verified_at', () => {
    expect(VerificationEventsSchema.safeParse({
      ...mockVerificationEvent,
      verified_at: 'not-a-date',
    }).success).toBe(false)
  })
})
