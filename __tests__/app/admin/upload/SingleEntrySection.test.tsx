import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SingleEntrySection } from '@/app/admin/upload/SingleEntrySection'

vi.mock('@/app/admin/upload/actions', () => ({
  uploadOffers: vi.fn(),
}))

import { uploadOffers } from '@/app/admin/upload/actions'

const ADMIN_ID = 'admin-123'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SingleEntrySection', () => {
  it('renders the name field and submit button', () => {
    render(<SingleEntrySection adminUserId={ADMIN_ID} />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('shows a validation error and does not submit when name is empty', async () => {
    render(<SingleEntrySection adminUserId={ADMIN_ID} />)
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(uploadOffers).not.toHaveBeenCalled()
  })

  it('shows validation errors when location fields are partially filled', async () => {
    render(<SingleEntrySection adminUserId={ADMIN_ID} />)
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Offer' } })
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText(/city is required/i)).toBeInTheDocument()
    expect(screen.getByText(/state is required/i)).toBeInTheDocument()
    expect(screen.getByText(/zip code is required/i)).toBeInTheDocument()
    expect(uploadOffers).not.toHaveBeenCalled()
  })

  it('calls uploadOffers with the correct payload on a valid submit', async () => {
    vi.mocked(uploadOffers).mockResolvedValue({ success: true, created: 1, skipped: 0 })
    render(<SingleEntrySection adminUserId={ADMIN_ID} />)

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Oregon Food Bank' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Statewide food bank' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(uploadOffers).toHaveBeenCalledOnce())
    expect(uploadOffers).toHaveBeenCalledWith(
      [expect.objectContaining({ name: 'Oregon Food Bank', description: 'Statewide food bank' })],
      ADMIN_ID
    )
  })

  it('omits location from the payload when no location fields are filled', async () => {
    vi.mocked(uploadOffers).mockResolvedValue({ success: true, created: 1, skipped: 0 })
    render(<SingleEntrySection adminUserId={ADMIN_ID} />)

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Offer' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(uploadOffers).toHaveBeenCalledOnce())
    expect(uploadOffers).toHaveBeenCalledWith(
      [expect.objectContaining({ location: undefined })],
      ADMIN_ID
    )
  })

  it('includes location in the payload when all required fields are filled', async () => {
    vi.mocked(uploadOffers).mockResolvedValue({ success: true, created: 1, skipped: 0 })
    render(<SingleEntrySection adminUserId={ADMIN_ID} />)

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Offer' } })
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '123 Main St' } })
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Portland' } })
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'OR' } })
    fireEvent.change(screen.getByLabelText('Zip Code'), { target: { value: '97201' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(uploadOffers).toHaveBeenCalledOnce())
    expect(uploadOffers).toHaveBeenCalledWith(
      [expect.objectContaining({
        location: expect.objectContaining({ address: '123 Main St', city: 'Portland', state: 'OR', zip_code: '97201' }),
      })],
      ADMIN_ID
    )
  })

  it('shows a success message and resets the form on success', async () => {
    vi.mocked(uploadOffers).mockResolvedValue({ success: true, created: 1, skipped: 0 })
    render(<SingleEntrySection adminUserId={ADMIN_ID} />)

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Oregon Food Bank' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText(/offer created successfully/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toHaveValue('')
  })

  it('shows an error message and preserves the form on failure', async () => {
    vi.mocked(uploadOffers).mockResolvedValue({ created: 0, skipped: 0, error: 'Database connection failed' })
    render(<SingleEntrySection adminUserId={ADMIN_ID} />)

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Offer' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText('Database connection failed')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toHaveValue('Test Offer')
  })

  it('toggles benefit checkboxes and includes them in the payload', async () => {
    vi.mocked(uploadOffers).mockResolvedValue({ success: true, created: 1, skipped: 0 })
    render(<SingleEntrySection adminUserId={ADMIN_ID} />)

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Offer' } })
    fireEvent.click(screen.getByLabelText('Free Food'))
    fireEvent.click(screen.getByLabelText('SNAP Accepted'))
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(uploadOffers).toHaveBeenCalledOnce())
    expect(uploadOffers).toHaveBeenCalledWith(
      [expect.objectContaining({ benefits: ['free_food', 'snap_accepted'] })],
      ADMIN_ID
    )
  })
})
