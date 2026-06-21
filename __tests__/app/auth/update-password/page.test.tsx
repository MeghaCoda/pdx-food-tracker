import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/app/auth/update-password/UpdatePasswordPage', () => ({
  UpdatePasswordPage: () => <div data-testid="update-password-page" />,
}))

import Page from '@/app/auth/update-password/page'

describe('update-password/page', () => {
  it('renders the UpdatePasswordPage component', () => {
    render(<Page />)
    expect(screen.getByTestId('update-password-page')).toBeInTheDocument()
  })
})
