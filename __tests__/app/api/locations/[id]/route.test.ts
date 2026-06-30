import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { PUT, DELETE } from '@/app/api/locations/[id]/route'
import { mockResourceWithLocation, MOCK_LOCATION_ID } from '@/__mocks__/mockData'

vi.mock('@/app/api/locations/service', () => ({
  updateLocation: vi.fn(),
  deleteLocation: vi.fn(),
}))

import { updateLocation, deleteLocation } from '@/app/api/locations/service'

beforeEach(() => {
  vi.clearAllMocks()
})

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) })

describe('PUT /api/locations/[id]', () => {
  it('returns 200 with updated location on valid input', async () => {
    vi.mocked(updateLocation).mockResolvedValue({
      ...mockResourceWithLocation,
      physical_location: { ...mockResourceWithLocation.physical_location, address: '789 New Ave' },
    })

    const req = new NextRequest(`http://localhost/api/locations/${MOCK_LOCATION_ID}`, {
      method: 'PUT',
      body: JSON.stringify({ address: '789 New Ave' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PUT(req, makeParams(MOCK_LOCATION_ID))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.physical_location.address).toBe('789 New Ave')
    expect(updateLocation).toHaveBeenCalledWith(MOCK_LOCATION_ID, { address: '789 New Ave' })
  })

  it('accepts an empty body (all fields optional in update)', async () => {
    vi.mocked(updateLocation).mockResolvedValue(mockResourceWithLocation)

    const req = new NextRequest(`http://localhost/api/locations/${MOCK_LOCATION_ID}`, {
      method: 'PUT',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PUT(req, makeParams(MOCK_LOCATION_ID))

    expect(response.status).toBe(200)
  })

  it('returns 400 when body contains invalid field types', async () => {
    const req = new NextRequest(`http://localhost/api/locations/${MOCK_LOCATION_ID}`, {
      method: 'PUT',
      body: JSON.stringify({ latitude: 'not-a-number' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PUT(req, makeParams(MOCK_LOCATION_ID))

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('returns 500 when service throws', async () => {
    vi.mocked(updateLocation).mockRejectedValue(new Error('Update failed'))

    const req = new NextRequest(`http://localhost/api/locations/${MOCK_LOCATION_ID}`, {
      method: 'PUT',
      body: JSON.stringify({ address: 'New St' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await PUT(req, makeParams(MOCK_LOCATION_ID))

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe('Update failed')
  })
})

describe('DELETE /api/locations/[id]', () => {
  it('returns 204 on successful delete', async () => {
    vi.mocked(deleteLocation).mockResolvedValue(undefined)

    const req = new NextRequest(`http://localhost/api/locations/${MOCK_LOCATION_ID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams(MOCK_LOCATION_ID))

    expect(response.status).toBe(204)
    expect(deleteLocation).toHaveBeenCalledWith(MOCK_LOCATION_ID)
  })

  it('returns 500 when service throws', async () => {
    vi.mocked(deleteLocation).mockRejectedValue(new Error('Delete failed'))

    const req = new NextRequest(`http://localhost/api/locations/${MOCK_LOCATION_ID}`, {
      method: 'DELETE',
    })
    const response = await DELETE(req, makeParams(MOCK_LOCATION_ID))

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe('Delete failed')
  })
})
