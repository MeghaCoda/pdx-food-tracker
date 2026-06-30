import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Map from '@/components/Map/Map'
import { mockResourceWithLocation } from '@/__mocks__/mockData'

// Mock LocationMap so tests don't require Leaflet (a DOM canvas library).
// The mock exposes a button that calls onSelect with the mock location.
vi.mock('@/components/LocationMap', async () => {
  const { mockResourceWithLocation } = await import('@/__mocks__/mockData')
  return {
    default: ({ onSelect }: { onSelect: (loc: unknown) => void }) => (
      <button data-testid="map-select-btn" onClick={() => onSelect(mockResourceWithLocation)}>
        Select Location
      </button>
    ),
  }
})

// Mock useQuery to avoid needing a QueryClientProvider and real fetch calls.
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  const { mockResourceWithLocation } = await import('@/__mocks__/mockData')
  return {
    ...actual,
    useQuery: vi.fn().mockReturnValue({ data: [mockResourceWithLocation], isLoading: false }),
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Map', () => {
  it('renders the search bar', () => {
    render(<Map />)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('renders the map component', () => {
    render(<Map />)
    expect(screen.getByTestId('map-select-btn')).toBeInTheDocument()
  })

  it('does not show the location address before a location is selected', () => {
    render(<Map />)
    expect(screen.queryByText('Portland, OR 97201')).not.toBeInTheDocument()
  })

  it('shows LocationDetails after selecting a location', () => {
    render(<Map />)
    fireEvent.click(screen.getByTestId('map-select-btn'))
    expect(screen.getByText('Portland, OR 97201')).toBeInTheDocument()
  })

  it('shows the selected location address', () => {
    render(<Map />)
    fireEvent.click(screen.getByTestId('map-select-btn'))
    expect(screen.getByText('123 Main St')).toBeInTheDocument()
  })
})
