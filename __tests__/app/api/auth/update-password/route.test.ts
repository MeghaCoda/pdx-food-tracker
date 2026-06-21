import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/update-password/route'

const mockSetSession = vi.fn()
const mockUpdateUser = vi.fn()
const mockGetSession = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      setSession: mockSetSession,
      updateUser: mockUpdateUser,
      getSession: mockGetSession,
    },
  })),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/auth/update-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

describe('POST /api/auth/update-password', () => {
  it('returns 400 when access_token is missing', async () => {
    const response = await POST(makeRequest({ password: 'newpass' }))
    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('Missing required fields.')
  })

  it('returns 400 when password is missing', async () => {
    const response = await POST(makeRequest({ access_token: 'tok' }))
    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('Missing required fields.')
  })

  it('returns 400 when both fields are missing', async () => {
    const response = await POST(makeRequest({}))
    expect(response.status).toBe(400)
  })

  it('returns 401 when setSession returns an error', async () => {
    mockSetSession.mockResolvedValue({ error: { message: 'expired token' } })

    const response = await POST(makeRequest({ access_token: 'bad_tok', password: 'newpass' }))
    expect(response.status).toBe(401)
    expect((await response.json()).error).toBe('Invalid or expired token.')
  })

  it('returns 500 when updateUser returns an error', async () => {
    mockSetSession.mockResolvedValue({ error: null })
    mockUpdateUser.mockResolvedValue({ error: { message: 'update failed' } })
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const response = await POST(makeRequest({ access_token: 'tok', password: 'newpass' }))
    expect(response.status).toBe(500)
    expect((await response.json()).error).toBe('Failed to update password.')
  })

  it('returns 200 on success and sets auth_token cookie when session exists', async () => {
    mockSetSession.mockResolvedValue({ error: null })
    mockUpdateUser.mockResolvedValue({ error: null })
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'new_tok', expires_in: 3600 } },
    })

    const response = await POST(makeRequest({ access_token: 'tok', password: 'newpass' }))
    expect(response.status).toBe(200)
    expect((await response.json()).success).toBe(true)
    expect(response.headers.get('set-cookie')).toContain('auth_token=new_tok')
  })

  it('returns 200 without setting cookie when getSession returns no session', async () => {
    mockSetSession.mockResolvedValue({ error: null })
    mockUpdateUser.mockResolvedValue({ error: null })
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const response = await POST(makeRequest({ access_token: 'tok', password: 'newpass' }))
    expect(response.status).toBe(200)
    expect((await response.json()).success).toBe(true)
    expect(response.headers.get('set-cookie')).toBeNull()
  })

  it('uses empty string for refresh_token when not provided', async () => {
    mockSetSession.mockResolvedValue({ error: null })
    mockUpdateUser.mockResolvedValue({ error: null })
    mockGetSession.mockResolvedValue({ data: { session: null } })

    await POST(makeRequest({ access_token: 'tok', password: 'newpass' }))

    expect(mockSetSession).toHaveBeenCalledWith({ access_token: 'tok', refresh_token: '' })
  })

  it('passes refresh_token when provided', async () => {
    mockSetSession.mockResolvedValue({ error: null })
    mockUpdateUser.mockResolvedValue({ error: null })
    mockGetSession.mockResolvedValue({ data: { session: null } })

    await POST(makeRequest({ access_token: 'tok', refresh_token: 'ref_tok', password: 'newpass' }))

    expect(mockSetSession).toHaveBeenCalledWith({ access_token: 'tok', refresh_token: 'ref_tok' })
  })
})
