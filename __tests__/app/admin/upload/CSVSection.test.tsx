import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CSVSection } from '@/app/admin/upload/CSVSection'

vi.mock('@/app/admin/upload/actions', () => ({
  uploadOffers: vi.fn(),
}))

import { uploadOffers } from '@/app/admin/upload/actions'

const ADMIN_ID = 'admin-123'

const VALID_CSV = [
  'name,description,benefits,is_active,address,city,state,zip_code',
  'Oregon Food Bank,A food bank,free_food,true,7900 NE 33rd Dr,Portland,OR,97211',
  'Community Fridge,A fridge,free_food,true,3534 SE Main St,Portland,OR,97214',
].join('\n')

const INVALID_CSV = [
  'name,benefits',
  ',bad_benefit',  // missing name and invalid benefit
].join('\n')

function simulateFileUpload(input: HTMLElement, content: string, name = 'test.csv') {
  const file = new File([content], name, { type: 'text/csv' })
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  fireEvent.change(input)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CSVSection', () => {
  it('renders the file input and description', () => {
    render(<CSVSection adminUserId={ADMIN_ID} />)
    expect(screen.getByLabelText('CSV File')).toBeInTheDocument()
    expect(screen.getByText(/download example csv/i)).toBeInTheDocument()
  })

  it('shows parse errors after uploading an invalid CSV', async () => {
    render(<CSVSection adminUserId={ADMIN_ID} />)
    simulateFileUpload(screen.getByLabelText('CSV File'), INVALID_CSV)

    expect(await screen.findByText(/fix these before uploading/i)).toBeInTheDocument()
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
  })

  it('shows a preview table after uploading a valid CSV', async () => {
    render(<CSVSection adminUserId={ADMIN_ID} />)
    simulateFileUpload(screen.getByLabelText('CSV File'), VALID_CSV)

    expect(await screen.findByText('Oregon Food Bank')).toBeInTheDocument()
    expect(screen.getByText('Community Fridge')).toBeInTheDocument()
    expect(screen.getByText('2 offers ready to upload:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit 2 offers/i })).toBeInTheDocument()
  })

  it('calls uploadOffers with parsed rows when submit is clicked', async () => {
    vi.mocked(uploadOffers).mockResolvedValue({ success: true, created: 2, skipped: 0 })
    render(<CSVSection adminUserId={ADMIN_ID} />)
    simulateFileUpload(screen.getByLabelText('CSV File'), VALID_CSV)

    fireEvent.click(await screen.findByRole('button', { name: /submit 2 offers/i }))

    await waitFor(() => expect(uploadOffers).toHaveBeenCalledOnce())
    expect(uploadOffers).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Oregon Food Bank' }),
        expect.objectContaining({ name: 'Community Fridge' }),
      ]),
      ADMIN_ID
    )
  })

  it('shows a success message and clears the preview after a successful upload', async () => {
    vi.mocked(uploadOffers).mockResolvedValue({ success: true, created: 2, skipped: 0 })
    render(<CSVSection adminUserId={ADMIN_ID} />)
    simulateFileUpload(screen.getByLabelText('CSV File'), VALID_CSV)

    fireEvent.click(await screen.findByRole('button', { name: /submit 2 offers/i }))

    expect(await screen.findByText(/successfully created 2 offers/i)).toBeInTheDocument()
    expect(screen.queryByText('Oregon Food Bank')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
  })

  it('shows an error message and preserves the preview on a failed upload', async () => {
    vi.mocked(uploadOffers).mockResolvedValue({ created: 0, skipped: 0, error: 'Insert failed' })
    render(<CSVSection adminUserId={ADMIN_ID} />)
    simulateFileUpload(screen.getByLabelText('CSV File'), VALID_CSV)

    fireEvent.click(await screen.findByRole('button', { name: /submit 2 offers/i }))

    expect(await screen.findByText('Insert failed')).toBeInTheDocument()
    expect(screen.getByText('Oregon Food Bank')).toBeInTheDocument()
  })

  it('clears parse errors when a new file is selected', async () => {
    render(<CSVSection adminUserId={ADMIN_ID} />)
    const input = screen.getByLabelText('CSV File')

    simulateFileUpload(input, INVALID_CSV)
    expect(await screen.findByText(/fix these before uploading/i)).toBeInTheDocument()

    simulateFileUpload(input, VALID_CSV)
    await waitFor(() => {
      expect(screen.queryByText(/fix these before uploading/i)).not.toBeInTheDocument()
    })
    expect(screen.getByText('Oregon Food Bank')).toBeInTheDocument()
  })
})
