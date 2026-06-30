import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchPhysicalLocations,
  fetchPhysicalLocationById,
  insertPhysicalLocation,
  insertResourceHours,
  updatePhysicalLocationRow,
  deleteResourceHours,
  deletePhysicalLocation,
} from '@/app/api/locations/db'
import { mockDbRow, MOCK_LOCATION_ID, MOCK_RESOURCE_ID } from '@/__mocks__/mockData'

// Builds a chainable, awaitable Supabase query builder mock.
function makeBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {}
  const chain = () => builder
  builder.select = vi.fn(chain)
  builder.insert = vi.fn(chain)
  builder.update = vi.fn(chain)
  builder.delete = vi.fn(chain)
  builder.eq = vi.fn(chain)
  builder.single = vi.fn(() => Promise.resolve(result))
  // Make the builder itself awaitable (supabase-js query builders are PromiseLike).
  builder.then = (
    resolve: (v: unknown) => unknown,
    reject: (e: unknown) => unknown
  ) => Promise.resolve(result).then(resolve, reject)
  return builder
}

const mockFrom = vi.fn()

vi.mock('@/lib/supabase', () => ({
  createSupabaseClient: () => ({ from: mockFrom }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchPhysicalLocations', () => {
  it('returns rows on success', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: [mockDbRow], error: null }))

    const result = await fetchPhysicalLocations()

    expect(result).toEqual([mockDbRow])
    expect(mockFrom).toHaveBeenCalledWith('physical_locations')
  })

  it('selects with resource_hours join', async () => {
    const builder = makeBuilder({ data: [mockDbRow], error: null })
    mockFrom.mockReturnValue(builder)

    await fetchPhysicalLocations()

    expect(builder.select).toHaveBeenCalledWith('*, resource_hours(*)')
  })

  it('filters by approved verification_status', async () => {
    const builder = makeBuilder({ data: [mockDbRow], error: null })
    mockFrom.mockReturnValue(builder)

    await fetchPhysicalLocations()

    expect(builder.eq).toHaveBeenCalledWith('verification_status', 'approved')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'DB error' } }))

    await expect(fetchPhysicalLocations()).rejects.toThrow('DB error')
  })
})

describe('fetchPhysicalLocationById', () => {
  it('returns a single row on success', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: mockDbRow, error: null }))

    const result = await fetchPhysicalLocationById(MOCK_LOCATION_ID)

    expect(result).toEqual(mockDbRow)
    expect(mockFrom).toHaveBeenCalledWith('physical_locations')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Not found' } }))

    await expect(fetchPhysicalLocationById('bad-id')).rejects.toThrow('Not found')
  })
})

describe('insertPhysicalLocation', () => {
  it('returns the new row id on success', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { id: 'new-uuid' }, error: null }))

    const result = await insertPhysicalLocation({
      resource_id: MOCK_RESOURCE_ID,
      address: '123 St',
      city: 'Portland',
      state: 'OR',
      zip_code: '97201',
      address2: null,
      neighborhood: null,
      latitude: 45.523,
      longitude: -122.6765,
      phone_number: null,
      verification_status: null,
    })

    expect(result).toEqual({ id: 'new-uuid' })
    expect(mockFrom).toHaveBeenCalledWith('physical_locations')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Insert failed' } }))

    await expect(insertPhysicalLocation({} as never)).rejects.toThrow('Insert failed')
  })
})

describe('insertResourceHours', () => {
  it('inserts hours without throwing on success', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: null }))

    await expect(
      insertResourceHours([{
        physical_location_id: MOCK_LOCATION_ID,
        day: 'monday',
        opens_at: '08:00:00',
        closes_at: '17:00:00',
        notes: null,
        valid_from: null,
        valid_until: null,
      }])
    ).resolves.toBeUndefined()

    expect(mockFrom).toHaveBeenCalledWith('resource_hours')
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Hours insert failed' } }))

    await expect(insertResourceHours([])).rejects.toThrow('Hours insert failed')
  })
})

describe('updatePhysicalLocationRow', () => {
  it('updates without throwing on success', async () => {
    const builder = makeBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)

    await updatePhysicalLocationRow(MOCK_LOCATION_ID, { address: 'New Address' })

    expect(mockFrom).toHaveBeenCalledWith('physical_locations')
    expect(builder.update).toHaveBeenCalledWith({ address: 'New Address' })
    expect(builder.eq).toHaveBeenCalledWith('id', MOCK_LOCATION_ID)
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Update failed' } }))

    await expect(updatePhysicalLocationRow('bad-id', {})).rejects.toThrow('Update failed')
  })
})

describe('deleteResourceHours', () => {
  it('deletes hours without throwing on success', async () => {
    const builder = makeBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)

    await deleteResourceHours(MOCK_LOCATION_ID)

    expect(mockFrom).toHaveBeenCalledWith('resource_hours')
    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('physical_location_id', MOCK_LOCATION_ID)
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Delete failed' } }))

    await expect(deleteResourceHours('bad-id')).rejects.toThrow('Delete failed')
  })
})

describe('deletePhysicalLocation', () => {
  it('deletes the location without throwing on success', async () => {
    const builder = makeBuilder({ data: null, error: null })
    mockFrom.mockReturnValue(builder)

    await deletePhysicalLocation(MOCK_LOCATION_ID)

    expect(mockFrom).toHaveBeenCalledWith('physical_locations')
    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('id', MOCK_LOCATION_ID)
  })

  it('throws when Supabase returns an error', async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: { message: 'Delete failed' } }))

    await expect(deletePhysicalLocation('bad-id')).rejects.toThrow('Delete failed')
  })
})
