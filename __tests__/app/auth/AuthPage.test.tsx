import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthPage } from '@/app/auth/AuthPage'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AuthPage', () => {
  describe('when signed in', () => {
    it('shows the signed-in view', () => {
      render(<AuthPage isSignedIn={true} />)
      expect(screen.getByText("You're signed in")).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    })

    it('calls signout and refreshes when sign out is clicked', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)
      render(<AuthPage isSignedIn={true} />)

      fireEvent.click(screen.getByRole('button', { name: /sign out/i }))

      await waitFor(() =>
        expect(fetch).toHaveBeenCalledWith('/api/auth/signout', { method: 'POST' }),
      )
      expect(mockRefresh).toHaveBeenCalled()
    })

    it('disables the sign-out button while signing out', async () => {
      vi.mocked(fetch).mockResolvedValue(new Promise(() => {}))
      render(<AuthPage isSignedIn={true} />)

      fireEvent.click(screen.getByRole('button', { name: /sign out/i }))

      expect(await screen.findByRole('button', { name: /signing out/i })).toBeDisabled()
    })
  })

  describe('when signed out', () => {
    it('shows the sign-in form by default', () => {
      render(<AuthPage isSignedIn={false} />)
      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('switches to the reset password form when "Forgot your password?" is clicked', () => {
      render(<AuthPage isSignedIn={false} />)
      fireEvent.click(screen.getByText(/forgot your password/i))
      expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Sign In' })).not.toBeInTheDocument()
    })

    it('switches back to the sign-in form when "Back to sign in" is clicked', () => {
      render(<AuthPage isSignedIn={false} />)
      fireEvent.click(screen.getByText(/forgot your password/i))
      fireEvent.click(screen.getByText(/back to sign in/i))
      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    })
  })

  describe('SignInForm', () => {
    function submitSignInForm() {
      const form = screen.getByRole('button', { name: /sign in/i }).closest('form')!
      fireEvent.submit(form)
    }

    it('submits credentials to /api/auth/signin and redirects on success', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)
      render(<AuthPage isSignedIn={false} />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      })
      submitSignInForm()

      await waitFor(() =>
        expect(fetch).toHaveBeenCalledWith('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        }),
      )
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('shows the error from the API on failed sign in', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      } as Response)
      render(<AuthPage isSignedIn={false} />)

      submitSignInForm()

      expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials')
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('shows a fallback error message when the API returns no error field', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      } as Response)
      render(<AuthPage isSignedIn={false} />)

      submitSignInForm()

      expect(await screen.findByRole('alert')).toHaveTextContent('Sign in failed.')
    })

    it('disables the button and shows a loading label while submitting', async () => {
      vi.mocked(fetch).mockResolvedValue(new Promise(() => {}))
      render(<AuthPage isSignedIn={false} />)

      submitSignInForm()

      expect(await screen.findByRole('button', { name: /signing in/i })).toBeDisabled()
    })

    it('clears a previous error when a new submission begins', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Bad credentials' }),
        } as Response)
        .mockResolvedValueOnce(new Promise(() => {}))

      render(<AuthPage isSignedIn={false} />)

      submitSignInForm()
      expect(await screen.findByRole('alert')).toBeInTheDocument()

      submitSignInForm()
      await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    })
  })

  describe('ResetPasswordForm', () => {
    function submitResetForm() {
      const form = screen.getByRole('button', { name: /send reset link/i }).closest('form')!
      fireEvent.submit(form)
    }

    beforeEach(() => {
      render(<AuthPage isSignedIn={false} />)
      fireEvent.click(screen.getByText(/forgot your password/i))
    })

    it('shows an email field and send reset link button', () => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
    })

    it('submits the email to /api/auth/reset-password and shows a success message', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      submitResetForm()

      await waitFor(() =>
        expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        }),
      )
      expect(await screen.findByRole('status')).toHaveTextContent(/check your email/i)
      expect(screen.queryByRole('button', { name: /send reset link/i })).not.toBeInTheDocument()
    })

    it('shows the error from the API when reset fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Email not found' }),
      } as Response)

      submitResetForm()

      expect(await screen.findByRole('alert')).toHaveTextContent('Email not found')
    })

    it('shows a fallback error message when the API returns no error field', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      } as Response)

      submitResetForm()

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /failed to send reset email/i,
      )
    })

    it('disables the button and shows a loading label while submitting', async () => {
      vi.mocked(fetch).mockResolvedValue(new Promise(() => {}))

      submitResetForm()

      expect(await screen.findByRole('button', { name: /sending/i })).toBeDisabled()
    })
  })
})
