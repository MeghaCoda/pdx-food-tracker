import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getLocations, deleteLocation } from '@/app/api/locations/service'
import { mockDbRow, MOCK_LOCATION_ID, MOCK_RESOURCE_ID } from '@/__mocks__/mockData'

vi.mock('@/app/api/locations/db', () => ({
  fetchPhysicalLocations: vi.fn(),
  fetchPhysicalLocationById: vi.fn(),
  insertPhysicalLocation: vi.fn(),
  insertResourceHours: vi.fn(),
  updatePhysicalLocationRow: vi.fn(),
  deleteResourceHours: vi.fn(),
  deletePhysicalLocation: vi.fn(),
}))

import {
  fetchPhysicalLocations,
  deletePhysicalLocation,
} from '@/app/api/locations/db'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getLocations', () => {
  it('returns formatted locations on success', async () => {
    vi.mocked(fetchPhysicalLocations).mockResolvedValue([mockDbRow])

    const result = await getLocations()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(MOCK_RESOURCE_ID)
    expect(result[0].physical_location.id).toBe(MOCK_LOCATION_ID)
    expect(result[0].physical_location.address).toBe('123 Main St')
    expect(result[0].physical_location.zip_code).toBe('97201')
    expect(result[0].physical_location.resource_hours).toHaveLength(1)
    expect(result[0].physical_location.resource_hours[0].day).toBe('monday')
    expect(result[0].physical_location.resource_hours[0].opens_at).toBe('08:00:00')
  })

  it('passes through nullable optional fields as-is', async () => {
    vi.mocked(fetchPhysicalLocations).mockResolvedValue([mockDbRow])

    const [loc] = await getLocations()

    expect(loc.physical_location.address2).toBeNull()
    expect(loc.physical_location.neighborhood).toBeNull()
    expect(loc.physical_location.phone_number).toBe('503-555-1234')
    expect(loc.physical_location.latitude).toBe(45.523)
  })

  it('filters out rows that fail schema validation', async () => {
    const invalidRow = { ...mockDbRow, address: null }
    vi.mocked(fetchPhysicalLocations).mockResolvedValue([invalidRow, mockDbRow] as never)

    const result = await getLocations()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(MOCK_RESOURCE_ID)
  })

  it('throws when db returns an error', async () => {
    vi.mocked(fetchPhysicalLocations).mockRejectedValue(new Error('DB error'))

    await expect(getLocations()).rejects.toThrow('DB error')
  })
})

describe('deleteLocation', () => {
  it('delegates to deletePhysicalLocation', async () => {
    vi.mocked(deletePhysicalLocation).mockResolvedValue(undefined)

    await deleteLocation(MOCK_LOCATION_ID)

    expect(deletePhysicalLocation).toHaveBeenCalledWith(MOCK_LOCATION_ID)
  })

  it('throws when db returns an error', async () => {
    vi.mocked(deletePhysicalLocation).mockRejectedValue(new Error('Delete failed'))

    await expect(deleteLocation(MOCK_LOCATION_ID)).rejects.toThrow('Delete failed')
  })
})
