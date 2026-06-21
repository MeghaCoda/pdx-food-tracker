import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { User } from '@supabase/supabase-js'

const mockGet = vi.hoisted(() => vi.fn())
const mockGetUser = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: mockGet }),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/app/auth/AuthPage', () => ({
  AuthPage: ({ user }: { user: User | null }) => (
    <div data-testid="auth-page" data-signed-in={String(user !== null)} />
  ),
}))

import Page from '@/app/auth/page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('auth/page', () => {
  it('renders AuthPage with user=null when no auth cookie', async () => {
    mockGet.mockReturnValue(undefined)
    render(await Page())
    expect(screen.getByTestId('auth-page')).toHaveAttribute('data-signed-in', 'false')
    expect(mockGetUser).not.toHaveBeenCalled()
  })

  it('renders AuthPage with user=null when token fails validation', async () => {
    mockGet.mockReturnValue({ value: 'bad-token' })
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid token' } })
    render(await Page())
    expect(screen.getByTestId('auth-page')).toHaveAttribute('data-signed-in', 'false')
  })

  it('renders AuthPage with user set when token is valid', async () => {
    mockGet.mockReturnValue({ value: 'valid-token' })
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'test@example.com' } },
      error: null,
    })
    render(await Page())
    expect(screen.getByTestId('auth-page')).toHaveAttribute('data-signed-in', 'true')
  })
})
