import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/reset-password/route'

const mockResetPasswordForEmail = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  })),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

describe('POST /api/auth/reset-password', () => {
  it('returns 400 when email is missing', async () => {
    const response = await POST(makeRequest({}))
    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('Email is required.')
  })

  it('returns 200 on success', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })

    const response = await POST(makeRequest({ email: 'user@example.com' }))
    expect(response.status).toBe(200)
    expect((await response.json()).success).toBe(true)
  })

  it('passes the correct redirectTo URL', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })

    await POST(makeRequest({ email: 'user@example.com' }))

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      expect.objectContaining({ redirectTo: expect.stringContaining('/auth/update-password') }),
    )
  })

  it('returns 429 when supabase returns a rate-limit error', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: 'rate limit exceeded', status: 429 },
    })

    const response = await POST(makeRequest({ email: 'user@example.com' }))
    expect(response.status).toBe(429)
    expect((await response.json()).error).toMatch(/too many attempts/i)
  })

  it('returns 500 for other supabase errors', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: 'internal error', status: 500 },
    })

    const response = await POST(makeRequest({ email: 'user@example.com' }))
    expect(response.status).toBe(500)
    expect((await response.json()).error).toMatch(/failed to send/i)
  })
})
