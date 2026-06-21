import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCookiesGet = vi.hoisted(() => vi.fn())
const mockCookiesSet = vi.hoisted(() => vi.fn())
const mockCookiesDelete = vi.hoisted(() => vi.fn())
const mockGetUser = vi.hoisted(() => vi.fn())
const mockSignInWithPassword = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())
const mockRedirect = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: mockCookiesGet,
    set: mockCookiesSet,
    delete: mockCookiesDelete,
  }),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser, signInWithPassword: mockSignInWithPassword },
    from: mockFrom,
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

import {
  signIn,
  signOut,
  getOffers,
  getOfferWithLocations,
  updateOffer,
  uploadOffers,
} from '@/app/admin/upload/actions'

const ADMIN_USER = {
  id: 'admin-1',
  email: 'admin@example.com',
  app_metadata: { role: 'admin' },
}

function mockAdminSession() {
  mockCookiesGet.mockReturnValue({ value: 'admin-token' })
  mockGetUser.mockResolvedValue({ data: { user: ADMIN_USER }, error: null })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── signIn ──────────────────────────────────────────────────────────────────

describe('signIn', () => {
  it('returns an error when email is missing', async () => {
    const formData = new FormData()
    formData.set('password', 'pass')
    const result = await signIn({}, formData)
    expect(result.error).toMatch(/required/i)
  })

  it('returns an error when password is missing', async () => {
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    const result = await signIn({}, formData)
    expect(result.error).toMatch(/required/i)
  })

  it('returns an error when supabase auth fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials' },
    })
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'wrong')
    const result = await signIn({}, formData)
    expect(result.error).toMatch(/invalid email or password/i)
  })

  it('returns an error when user does not have admin role', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: 'tok', expires_in: 3600 },
        user: { id: '1', app_metadata: { role: 'user' } },
      },
      error: null,
    })
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', 'pass')
    const result = await signIn({}, formData)
    expect(result.error).toMatch(/admin role required/i)
  })

  it('sets the auth cookie and redirects on successful admin sign in', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: 'my-token', expires_in: 3600 },
        user: { id: 'admin-1', app_metadata: { role: 'admin' } },
      },
      error: null,
    })
    const formData = new FormData()
    formData.set('email', 'admin@example.com')
    formData.set('password', 'adminpass')
    await signIn({}, formData)
    expect(mockCookiesSet).toHaveBeenCalledWith(
      'auth_token',
      'my-token',
      expect.objectContaining({ httpOnly: true }),
    )
    expect(mockRedirect).toHaveBeenCalledWith('/admin/upload')
  })
})

// ─── signOut ─────────────────────────────────────────────────────────────────

describe('signOut', () => {
  it('deletes the auth cookie', async () => {
    await signOut()
    expect(mockCookiesDelete).toHaveBeenCalledWith('auth_token')
  })

  it('redirects to /admin/upload', async () => {
    await signOut()
    expect(mockRedirect).toHaveBeenCalledWith('/admin/upload')
  })
})

// ─── getOffers ───────────────────────────────────────────────────────────────

describe('getOffers', () => {
  it('returns an empty array when not authenticated', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    const result = await getOffers()
    expect(result).toEqual([])
  })

  it('returns offers when authenticated as admin', async () => {
    mockAdminSession()
    const offerRows = [{ id: '1', name: 'Food Bank' }]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: offerRows, error: null }),
      }),
    })
    const result = await getOffers()
    expect(result).toEqual(offerRows)
  })

  it('returns an empty array when the db query fails', async () => {
    mockAdminSession()
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
      }),
    })
    const result = await getOffers()
    expect(result).toEqual([])
  })
})

// ─── getOfferWithLocations ────────────────────────────────────────────────────

describe('getOfferWithLocations', () => {
  it('returns null when not authenticated', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    const result = await getOfferWithLocations('offer-1')
    expect(result).toBeNull()
  })

  it('returns null when the offer is not found', async () => {
    mockAdminSession()
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      })
    const result = await getOfferWithLocations('bad-id')
    expect(result).toBeNull()
  })

  it('returns the offer with its locations when found', async () => {
    mockAdminSession()
    const offerData = {
      id: 'offer-1',
      name: 'Food Bank',
      description: 'A food bank',
      offer_desc: null,
      offer_source: null,
      benefits: null,
      verification_status: 'pending',
      expires_at: null,
      is_active: true,
      notes: null,
    }
    const locationData = [{ id: 'loc-1', address: '123 Main St' }]

    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: offerData, error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: locationData, error: null }),
        }),
      })

    const result = await getOfferWithLocations('offer-1')
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Food Bank')
    expect(result!.locations).toEqual(locationData)
  })
})

// ─── updateOffer ─────────────────────────────────────────────────────────────

describe('updateOffer', () => {
  it('returns an error when not authenticated', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    const result = await updateOffer('offer-1', { name: 'New Name' })
    expect(result.error).toMatch(/unauthorized/i)
  })

  it('returns success when the update succeeds', async () => {
    mockAdminSession()
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })
    const result = await updateOffer('offer-1', { name: 'New Name' })
    expect(result.success).toBe(true)
  })

  it('returns an error when the db update fails', async () => {
    mockAdminSession()
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'update failed' } }),
      }),
    })
    const result = await updateOffer('offer-1', { name: 'New Name' })
    expect(result.error).toBe('update failed')
  })
})

// ─── uploadOffers ─────────────────────────────────────────────────────────────

describe('uploadOffers', () => {
  it('returns an error when not authenticated', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    const result = await uploadOffers([{ name: 'Food Bank' }], 'admin-1')
    expect(result.error).toMatch(/unauthorized/i)
    expect(result.created).toBe(0)
  })

  it('returns success with count when all rows are created', async () => {
    mockAdminSession()
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'new-1' }, error: null }),
        }),
      }),
    })
    const result = await uploadOffers(
      [{ name: 'Food Bank' }, { name: 'Community Fridge' }],
      'admin-1',
    )
    expect(result.success).toBe(true)
    expect(result.created).toBe(2)
  })

  it('returns an error when a resource insert fails', async () => {
    mockAdminSession()
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } }),
        }),
      }),
    })
    const result = await uploadOffers([{ name: 'Food Bank' }], 'admin-1')
    expect(result.error).toMatch(/failed to create offer/i)
    expect(result.created).toBe(0)
  })

  it('inserts a location when the row includes location data', async () => {
    mockAdminSession()
    const mockResourceInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'new-1' }, error: null }),
      }),
    })
    const mockLocationInsert = vi.fn().mockResolvedValue({ error: null })

    mockFrom
      .mockReturnValueOnce({ insert: mockResourceInsert })
      .mockReturnValueOnce({ insert: mockLocationInsert })

    const result = await uploadOffers(
      [{
        name: 'Food Bank',
        location: { address: '123 Main St', city: 'Portland', state: 'OR', zip_code: '97201' },
      }],
      'admin-1',
    )
    expect(result.success).toBe(true)
    expect(result.created).toBe(1)
    expect(mockLocationInsert).toHaveBeenCalledWith(
      expect.objectContaining({ resource_id: 'new-1', address: '123 Main St' }),
    )
  })
})
