import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UpdatePasswordPage } from '@/app/auth/update-password/UpdatePasswordPage'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  window.location.hash = ''
})

describe('UpdatePasswordPage', () => {
  describe('with an error_code in the hash', () => {
    it('shows the error description from the hash', () => {
      window.location.hash = '#error_code=otp_expired&error_description=Token+has+expired'
      render(<UpdatePasswordPage />)
      expect(screen.getByRole('heading', { name: 'Link Invalid' })).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Token has expired')
    })

    it('shows a fallback message when no error_description is present', () => {
      window.location.hash = '#error_code=some_error'
      render(<UpdatePasswordPage />)
      expect(screen.getByRole('alert')).toHaveTextContent(
        'The reset link is invalid or has expired.',
      )
    })

    it('navigates to /auth when "Back to sign in" is clicked', () => {
      window.location.hash = '#error_code=otp_expired'
      render(<UpdatePasswordPage />)
      fireEvent.click(screen.getByText(/back to sign in/i))
      expect(mockPush).toHaveBeenCalledWith('/auth')
    })
  })

  describe('with a missing or non-recovery token', () => {
    it('shows an invalid link message when type is not recovery', () => {
      window.location.hash = '#type=signup&access_token=sometoken'
      render(<UpdatePasswordPage />)
      expect(screen.getByRole('heading', { name: 'Link Invalid' })).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Invalid recovery link. Please request a new password reset.',
      )
    })

    it('shows an invalid link message when access_token is absent', () => {
      window.location.hash = '#type=recovery'
      render(<UpdatePasswordPage />)
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Invalid recovery link. Please request a new password reset.',
      )
    })

    it('shows an invalid link message when the hash is empty', () => {
      window.location.hash = ''
      render(<UpdatePasswordPage />)
      expect(screen.getByRole('heading', { name: 'Link Invalid' })).toBeInTheDocument()
    })
  })

  describe('with a valid recovery token', () => {
    beforeEach(() => {
      window.location.hash = '#type=recovery&access_token=abc123&refresh_token=ref456'
    })

    function fillAndSubmit(password = 'newpassword', confirm = 'newpassword') {
      fireEvent.change(screen.getByLabelText(/new password/i), {
        target: { value: password },
      })
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: confirm },
      })
      const form = screen.getByRole('button', { name: /update password/i }).closest('form')!
      fireEvent.submit(form)
    }

    it('shows the set new password form', () => {
      render(<UpdatePasswordPage />)
      expect(screen.getByRole('heading', { name: 'Set New Password' })).toBeInTheDocument()
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument()
    })

    it('shows an error and does not call the API when passwords do not match', async () => {
      render(<UpdatePasswordPage />)
      fillAndSubmit('password123', 'different')

      expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match.')
      expect(fetch).not.toHaveBeenCalled()
    })

    it('calls /api/auth/update-password with the token and new password', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)
      render(<UpdatePasswordPage />)
      fillAndSubmit()

      await waitFor(() =>
        expect(fetch).toHaveBeenCalledWith('/api/auth/update-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: 'abc123',
            refresh_token: 'ref456',
            password: 'newpassword',
          }),
        }),
      )
    })

    it('shows the success view after updating the password', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)
      render(<UpdatePasswordPage />)
      fillAndSubmit()

      expect(
        await screen.findByRole('heading', { name: 'Password Updated' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    })

    it('navigates to / when Continue is clicked after success', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)
      render(<UpdatePasswordPage />)
      fillAndSubmit()

      fireEvent.click(await screen.findByRole('button', { name: /continue/i }))
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('shows the API error message when the update fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Token expired' }),
      } as Response)
      render(<UpdatePasswordPage />)
      fillAndSubmit()

      expect(await screen.findByRole('alert')).toHaveTextContent('Token expired')
    })

    it('shows a fallback error message when the API returns no error field', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      } as Response)
      render(<UpdatePasswordPage />)
      fillAndSubmit()

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /failed to update password/i,
      )
    })

    it('disables the button and shows a loading label while submitting', async () => {
      vi.mocked(fetch).mockImplementation(() => new Promise(() => {}))
      render(<UpdatePasswordPage />)
      fillAndSubmit()

      expect(await screen.findByRole('button', { name: /updating/i })).toBeDisabled()
    })
  })
})
