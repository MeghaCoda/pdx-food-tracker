import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SignOutButton } from '@/components/Header/SignOutButton'

const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SignOutButton', () => {
  it('renders a sign out button', () => {
    render(<SignOutButton />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('calls the signout endpoint when clicked', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)
    render(<SignOutButton />)

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('/api/auth/signout', { method: 'POST' }),
    )
  })

  it('calls router.refresh after signing out', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)
    render(<SignOutButton />)

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }))

    await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
  })
})
