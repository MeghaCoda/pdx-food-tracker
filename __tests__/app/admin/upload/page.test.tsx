import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockCookiesGet = vi.hoisted(() => vi.fn())
const mockGetUser = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: mockCookiesGet }),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/app/admin/upload/SignInForm', () => ({
  SignInForm: () => <div data-testid="sign-in-form" />,
}))

vi.mock('@/app/admin/upload/UploadForm', () => ({
  UploadForm: ({ adminUserId }: { adminUserId: string }) => (
    <div data-testid="upload-form" data-user-id={adminUserId} />
  ),
}))

vi.mock('@/app/admin/upload/actions', () => ({
  signOut: vi.fn(),
}))

import AdminUploadPage from '@/app/admin/upload/page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AdminUploadPage', () => {
  it('shows the sign in form when no auth cookie is present', async () => {
    mockCookiesGet.mockReturnValue(undefined)
    render(await AdminUploadPage())
    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument()
    expect(screen.queryByTestId('upload-form')).not.toBeInTheDocument()
  })

  it('shows the sign in form when the token is invalid', async () => {
    mockCookiesGet.mockReturnValue({ value: 'bad-token' })
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'invalid' } })
    render(await AdminUploadPage())
    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument()
  })

  it('shows access denied when the user is not an admin', async () => {
    mockCookiesGet.mockReturnValue({ value: 'valid-token' })
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'user@example.com', app_metadata: { role: 'user' } },
      },
      error: null,
    })
    render(await AdminUploadPage())
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    expect(screen.queryByTestId('upload-form')).not.toBeInTheDocument()
  })

  it('shows the upload form when the user is an admin', async () => {
    mockCookiesGet.mockReturnValue({ value: 'admin-token' })
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'admin-1', email: 'admin@example.com', app_metadata: { role: 'admin' } },
      },
      error: null,
    })
    render(await AdminUploadPage())
    expect(screen.getByTestId('upload-form')).toBeInTheDocument()
    expect(screen.getByTestId('upload-form')).toHaveAttribute('data-user-id', 'admin-1')
  })

  it('shows the admin email when signed in as admin', async () => {
    mockCookiesGet.mockReturnValue({ value: 'admin-token' })
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'admin-1', email: 'admin@example.com', app_metadata: { role: 'admin' } },
      },
      error: null,
    })
    render(await AdminUploadPage())
    expect(screen.getByText(/admin@example\.com/)).toBeInTheDocument()
  })
})
