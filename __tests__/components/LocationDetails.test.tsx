import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LocationDetails from '@/components/LocationDetails/LocationDetails'
import { mockResourceWithLocation } from '@/__mocks__/mockData'

const loc = mockResourceWithLocation.physical_location

describe('LocationDetails', () => {
  it('renders the address', () => {
    render(<LocationDetails item={mockResourceWithLocation} />)
    expect(screen.getByText('123 Main St')).toBeInTheDocument()
  })

  it('renders city, state and zip together', () => {
    render(<LocationDetails item={mockResourceWithLocation} />)
    expect(screen.getByText('Portland, OR 97201')).toBeInTheDocument()
  })

  it('renders phone number when provided', () => {
    render(<LocationDetails item={mockResourceWithLocation} />)
    expect(screen.getByText(/503-555-1234/)).toBeInTheDocument()
  })

  it('does not render phone number section when not provided', () => {
    render(<LocationDetails item={{ ...mockResourceWithLocation, physical_location: { ...loc, phone_number: null } }} />)
    expect(screen.queryByText(/Phone Number/)).not.toBeInTheDocument()
  })

  it('renders address2 when provided', () => {
    render(<LocationDetails item={{ ...mockResourceWithLocation, physical_location: { ...loc, address2: 'Suite 200' } }} />)
    expect(screen.getByText('Suite 200')).toBeInTheDocument()
  })

  it('does not render address2 element when not provided', () => {
    render(<LocationDetails item={{ ...mockResourceWithLocation, physical_location: { ...loc, address2: null } }} />)
    expect(screen.queryByText('Suite 200')).not.toBeInTheDocument()
  })

  it('renders neighborhood when provided', () => {
    render(<LocationDetails item={{ ...mockResourceWithLocation, physical_location: { ...loc, neighborhood: 'Pearl District' } }} />)
    expect(screen.getByText(/Pearl District/)).toBeInTheDocument()
  })

  it('does not render neighborhood section when not provided', () => {
    render(<LocationDetails item={{ ...mockResourceWithLocation, physical_location: { ...loc, neighborhood: null } }} />)
    expect(screen.queryByText(/Neighborhood/)).not.toBeInTheDocument()
  })

  it('renders verification status when provided', () => {
    render(<LocationDetails item={mockResourceWithLocation} />)
    expect(screen.getByText(/Verification Status/)).toBeInTheDocument()
    expect(screen.getByText(/pending/)).toBeInTheDocument()
  })

  it('does not render verification status section when not provided', () => {
    render(<LocationDetails item={{ ...mockResourceWithLocation, physical_location: { ...loc, verification_status: null } }} />)
    expect(screen.queryByText(/Verification Status/)).not.toBeInTheDocument()
  })
})
