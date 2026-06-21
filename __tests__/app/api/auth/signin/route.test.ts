import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/signin/route'

const mockSignInWithPassword = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  })),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

describe('POST /api/auth/signin', () => {
  it('returns 400 when email is missing', async () => {
    const response = await POST(makeRequest({ password: 'secret' }))
    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('Email and password are required.')
  })

  it('returns 400 when password is missing', async () => {
    const response = await POST(makeRequest({ email: 'user@example.com' }))
    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('Email and password are required.')
  })

  it('returns 400 when both fields are missing', async () => {
    const response = await POST(makeRequest({}))
    expect(response.status).toBe(400)
  })

  it('returns 401 when supabase returns an error', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid credentials' },
    })

    const response = await POST(makeRequest({ email: 'user@example.com', password: 'wrong' }))
    expect(response.status).toBe(401)
    expect((await response.json()).error).toBe('Invalid email or password.')
  })

  it('returns 401 when session is null even without error', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null, user: { email: 'user@example.com' } },
      error: null,
    })

    const response = await POST(makeRequest({ email: 'user@example.com', password: 'pass' }))
    expect(response.status).toBe(401)
  })

  it('returns 200 with email and sets auth_token cookie on success', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: 'tok_abc', expires_in: 3600 },
        user: { email: 'user@example.com' },
      },
      error: null,
    })

    const response = await POST(makeRequest({ email: 'user@example.com', password: 'correct' }))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.email).toBe('user@example.com')
    expect(response.headers.get('set-cookie')).toContain('auth_token=tok_abc')
  })
})
