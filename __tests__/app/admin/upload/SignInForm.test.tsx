import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/app/admin/upload/actions', () => ({
  signIn: vi.fn(),
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, useActionState: vi.fn() }
})

import { useActionState } from 'react'
import { SignInForm } from '@/app/admin/upload/SignInForm'

const mockFormAction = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useActionState).mockReturnValue([{}, mockFormAction, false] as never)
})

describe('SignInForm', () => {
  it('renders email and password fields', () => {
    render(<SignInForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders the sign in button', () => {
    render(<SignInForm />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows an error alert when state has an error', () => {
    vi.mocked(useActionState).mockReturnValue(
      [{ error: 'Invalid email or password.' }, mockFormAction, false] as never,
    )
    render(<SignInForm />)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.')
  })

  it('does not show an error alert when state has no error', () => {
    render(<SignInForm />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('disables the submit button when isPending', () => {
    vi.mocked(useActionState).mockReturnValue([{}, mockFormAction, true] as never)
    render(<SignInForm />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows loading text when isPending', () => {
    vi.mocked(useActionState).mockReturnValue([{}, mockFormAction, true] as never)
    render(<SignInForm />)
    expect(screen.getByRole('button')).toHaveTextContent(/signing in/i)
  })

  it('calls formAction when the form is submitted', () => {
    render(<SignInForm />)
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form')!
    fireEvent.submit(form)
    expect(mockFormAction).toHaveBeenCalled()
  })
})
