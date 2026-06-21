import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockGet = vi.hoisted(() => vi.fn())

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: mockGet }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/Header/SignOutButton', () => ({
  SignOutButton: () => <button>Sign out</button>,
}))

import { Header } from '@/components/Header/Header'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Header', () => {
  it('renders the app title', async () => {
    mockGet.mockReturnValue(undefined)
    render(await Header())
    expect(screen.getByText('Food Map')).toBeInTheDocument()
  })

  it('shows a sign in link when not authenticated', async () => {
    mockGet.mockReturnValue(undefined)
    render(await Header())
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    expect(screen.queryByText(/sign out/i)).not.toBeInTheDocument()
  })

  it('shows the sign out button when authenticated', async () => {
    mockGet.mockReturnValue({ value: 'auth-token' })
    render(await Header())
    expect(screen.getByText(/sign out/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
  })

  it('links the title to the home page', async () => {
    mockGet.mockReturnValue(undefined)
    render(await Header())
    expect(screen.getByRole('link', { name: 'Food Map' })).toHaveAttribute('href', '/')
  })
})
