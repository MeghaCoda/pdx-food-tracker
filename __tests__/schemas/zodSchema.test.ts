import { describe, it, expect } from 'vitest'
import { LocationSchema, LocationInputSchema, LocationUpdateSchema, VerificationEventSchema, VerificationEventInputSchema, VerificationEventUpdateSchema } from '@/schemas/zodSchema'
import type { VerificationEvent } from '@/schemas/zodSchema'
import { mockLocation, mockHours } from '@/__mocks__/mockData'

describe('LocationSchema', () => {
  it('accepts a valid location', () => {
    expect(LocationSchema.safeParse(mockLocation).success).toBe(true)
  })

  it('rejects missing required field: name', () => {
    const { name: _name, ...rest } = mockLocation
    expect(LocationSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing required field: address', () => {
    const { address: _address, ...rest } = mockLocation
    expect(LocationSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects non-string id', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, id: 123 }).success).toBe(false)
  })

  it('rejects non-number latitude', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, latitude: '45.523' }).success).toBe(false)
  })

  it('rejects invalid HH:MM time format in hours', () => {
    const result = LocationSchema.safeParse({
      ...mockLocation,
      hours: { ...mockHours, monday: [{ start: '8:00', end: '17:00' }] },
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields when provided', () => {
    const result = LocationSchema.safeParse({
      ...mockLocation,
      address2: 'Suite 100',
      website: 'https://example.com',
      donationLink: 'https://donate.example.com',
      volunteerLink: 'https://volunteer.example.com',
      phoneNumber: '503-555-1234',
      notes: 'Some notes',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional fields when omitted', () => {
    const result = LocationSchema.safeParse(mockLocation)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.address2).toBeUndefined()
      expect(result.data.website).toBeUndefined()
    }
  })

  it('accepts empty string for website', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, website: '' }).success).toBe(true)
  })

  it('rejects invalid URL for website', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, website: 'not-a-url' }).success).toBe(false)
  })

  it('accepts empty string for donationLink', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, donationLink: '' }).success).toBe(true)
  })

  it('rejects non-boolean deliveryAvailable', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, deliveryAvailable: 'yes' }).success).toBe(false)
  })

  it('accepts multiple time slots per day', () => {
    const result = LocationSchema.safeParse({
      ...mockLocation,
      hours: {
        ...mockHours,
        monday: [
          { start: '08:00', end: '12:00' },
          { start: '13:00', end: '17:00' },
        ],
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing verificationStatus', () => {
    const { verificationStatus: _vs, ...rest } = mockLocation
    expect(LocationSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects invalid verificationStatus', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, verificationStatus: 'verified' }).success).toBe(false)
  })

  it('accepts all valid verificationStatus values', () => {
    for (const status of ['pending', 'confirmed', 'unverified'] as const) {
      expect(LocationSchema.safeParse({ ...mockLocation, verificationStatus: status }).success).toBe(true)
    }
  })

  it('accepts null ownerClaimed', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, ownerClaimed: null }).success).toBe(true)
  })

  it('accepts boolean ownerClaimed', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, ownerClaimed: true }).success).toBe(true)
  })

  it('accepts null ownerVerifiedAt', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, ownerVerifiedAt: null }).success).toBe(true)
  })

  it('accepts a timestamp string for ownerVerifiedAt', () => {
    expect(LocationSchema.safeParse({ ...mockLocation, ownerVerifiedAt: '2026-06-12T00:00:00Z' }).success).toBe(true)
  })
})

describe('LocationInputSchema', () => {
  it('accepts valid input without id and lastUpdated', () => {
    const { id: _id, lastUpdated: _lastUpdated, ...input } = mockLocation
    expect(LocationInputSchema.safeParse(input).success).toBe(true)
  })

  it('rejects missing required name', () => {
    const { id: _id, lastUpdated: _lastUpdated, name: _name, ...rest } = mockLocation
    expect(LocationInputSchema.safeParse(rest).success).toBe(false)
  })

  it('defaults verificationStatus to unverified when omitted', () => {
    const { id: _id, lastUpdated: _lastUpdated, verificationStatus: _vs, ...rest } = mockLocation
    const result = LocationInputSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.verificationStatus).toBe('unverified')
    }
  })
})

describe('LocationUpdateSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(LocationUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a partial update with just name', () => {
    const result = LocationUpdateSchema.safeParse({ name: 'Updated Name' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Updated Name')
    }
  })

  it('accepts a partial update with coordinates', () => {
    const result = LocationUpdateSchema.safeParse({ latitude: 45.5, longitude: -122.7 })
    expect(result.success).toBe(true)
  })

  it('rejects invalid field type even in partial update', () => {
    expect(LocationUpdateSchema.safeParse({ latitude: 'not-a-number' }).success).toBe(false)
  })

  it('accepts partial hours update', () => {
    const result = LocationUpdateSchema.safeParse({
      hours: { ...mockHours, monday: [{ start: '09:00', end: '18:00' }] },
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid verificationStatus in partial update', () => {
    expect(LocationUpdateSchema.safeParse({ verificationStatus: 'invalid' }).success).toBe(false)
  })
})

const mockVerificationEvent: VerificationEvent = {
  id: 'event-uuid-123',
  locationId: 'test-uuid-123',
  verifiedAt: '2026-06-12T00:00:00Z',
}

describe('VerificationEventSchema', () => {
  it('accepts a minimal valid event', () => {
    expect(VerificationEventSchema.safeParse(mockVerificationEvent).success).toBe(true)
  })

  it('accepts a fully populated event', () => {
    expect(VerificationEventSchema.safeParse({
      ...mockVerificationEvent,
      verifiedBy: 'admin@example.com',
      method: 'phone',
      outcome: 'confirmed',
      notes: 'Called and confirmed hours',
      isOwner: false,
    }).success).toBe(true)
  })

  it('rejects missing locationId', () => {
    const { locationId: _lid, ...rest } = mockVerificationEvent
    expect(VerificationEventSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing verifiedAt', () => {
    const { verifiedAt: _va, ...rest } = mockVerificationEvent
    expect(VerificationEventSchema.safeParse(rest).success).toBe(false)
  })

  it('accepts all valid method values', () => {
    for (const method of ['phone', 'website', 'email', 'in-person', 'owner-portal'] as const) {
      expect(VerificationEventSchema.safeParse({ ...mockVerificationEvent, method }).success).toBe(true)
    }
  })

  it('rejects invalid method', () => {
    expect(VerificationEventSchema.safeParse({ ...mockVerificationEvent, method: 'fax' }).success).toBe(false)
  })

  it('accepts all valid outcome values', () => {
    for (const outcome of ['confirmed', 'no-answer', 'info-updated', 'closed', 'unverifiable'] as const) {
      expect(VerificationEventSchema.safeParse({ ...mockVerificationEvent, outcome }).success).toBe(true)
    }
  })

  it('rejects invalid outcome', () => {
    expect(VerificationEventSchema.safeParse({ ...mockVerificationEvent, outcome: 'maybe' }).success).toBe(false)
  })

  it('accepts null for nullable optional fields', () => {
    expect(VerificationEventSchema.safeParse({
      ...mockVerificationEvent,
      verifiedBy: null,
      method: null,
      outcome: null,
      notes: null,
      isOwner: null,
    }).success).toBe(true)
  })
})

describe('VerificationEventInputSchema', () => {
  it('accepts valid input without id', () => {
    expect(VerificationEventInputSchema.safeParse({
      locationId: 'test-uuid-123',
      verifiedAt: '2026-06-12T00:00:00Z',
    }).success).toBe(true)
  })

  it('rejects missing locationId', () => {
    expect(VerificationEventInputSchema.safeParse({
      verifiedAt: '2026-06-12T00:00:00Z',
    }).success).toBe(false)
  })

  it('uses default verifiedAt when omitted', () => {
    const result = VerificationEventInputSchema.safeParse({
      locationId: 'test-uuid-123',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.verifiedAt).toBeDefined()
    }
  })
})

describe('VerificationEventUpdateSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(VerificationEventUpdateSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a partial update with just outcome', () => {
    const result = VerificationEventUpdateSchema.safeParse({ outcome: 'confirmed' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.outcome).toBe('confirmed')
    }
  })

  it('rejects invalid outcome in partial update', () => {
    expect(VerificationEventUpdateSchema.safeParse({ outcome: 'invalid' }).success).toBe(false)
  })

  it('rejects invalid method in partial update', () => {
    expect(VerificationEventUpdateSchema.safeParse({ method: 'fax' }).success).toBe(false)
  })
})
