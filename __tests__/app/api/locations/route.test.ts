import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/locations/route'
import { mockResourceWithLocation, MOCK_RESOURCE_ID } from '@/__mocks__/mockData'

vi.mock('@/app/api/locations/service', () => ({
  getLocations: vi.fn(),
  createLocation: vi.fn(),
}))

import { getLocations, createLocation } from '@/app/api/locations/service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/locations', () => {
  it('returns 200 with locations array on success', async () => {
    vi.mocked(getLocations).mockResolvedValue([mockResourceWithLocation])

    const req = new NextRequest('http://localhost/api/locations')
    const response = await GET(req)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe(MOCK_RESOURCE_ID)
  })

  it('returns 200 with empty array when no locations exist', async () => {
    vi.mocked(getLocations).mockResolvedValue([])

    const req = new NextRequest('http://localhost/api/locations')
    const response = await GET(req)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([])
  })

  it('returns 500 with error message when service throws', async () => {
    vi.mocked(getLocations).mockRejectedValue(new Error('DB connection failed'))

    const req = new NextRequest('http://localhost/api/locations')
    const response = await GET(req)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe('DB connection failed')
  })

  it('returns 500 with "Unknown error" when a non-Error is thrown', async () => {
    vi.mocked(getLocations).mockRejectedValue('plain string throw')

    const req = new NextRequest('http://localhost/api/locations')
    const response = await GET(req)

    expect(response.status).toBe(500)
    expect((await response.json()).error).toBe('Unknown error')
  })
})

describe('POST /api/locations', () => {
  const validInput = {
    resource_id: MOCK_RESOURCE_ID,
    address: '456 Oak Ave',
    city: 'Portland',
    state: 'OR',
    zip_code: '97202',
    latitude: 45.5,
    longitude: -122.7,
    phone_number: '503-555-9999',
    verification_status: 'pending',
  }

  it('returns 201 with created location on valid input', async () => {
    vi.mocked(createLocation).mockResolvedValue({
      ...mockResourceWithLocation,
      physical_location: { ...mockResourceWithLocation.physical_location, address: '456 Oak Ave' },
    })

    const req = new NextRequest('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify(validInput),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.physical_location.address).toBe('456 Oak Ave')
  })

  it('returns 400 when required fields are missing', async () => {
    const req = new NextRequest('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify({ address: 'Incomplete' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('returns 400 when body contains invalid field types', async () => {
    const req = new NextRequest('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify({ ...validInput, latitude: 'not-a-number' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)

    expect(response.status).toBe(400)
  })

  it('returns 500 when service throws', async () => {
    vi.mocked(createLocation).mockRejectedValue(new Error('Insert failed'))

    const req = new NextRequest('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify(validInput),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error).toBe('Insert failed')
  })

  it('returns 500 with "Unknown error" when a non-Error is thrown', async () => {
    vi.mocked(createLocation).mockRejectedValue('plain string throw')

    const req = new NextRequest('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify(validInput),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(req)

    expect(response.status).toBe(500)
    expect((await response.json()).error).toBe('Unknown error')
  })
})
