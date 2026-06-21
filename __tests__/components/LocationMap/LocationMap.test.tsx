import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { mockLocation } from '@/__mocks__/mockData'

vi.mock('leaflet/dist/leaflet.css', () => ({}))

vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn(),
      },
    },
  },
}))

const mockFlyTo = vi.fn()

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => null,
  Marker: ({
    children,
    eventHandlers,
  }: {
    children: React.ReactNode
    eventHandlers?: { click?: () => void }
  }) => (
    <div data-testid="marker" onClick={eventHandlers?.click}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  useMap: vi.fn(() => ({ flyTo: mockFlyTo })),
}))

vi.mock('react-leaflet-markercluster', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="cluster-group">{children}</div>
  ),
}))

import ResourceMap from '@/components/LocationMap/LocationMap'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ResourceMap', () => {
  it('renders the map container', () => {
    render(<ResourceMap onSelect={vi.fn()} data={[]} />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('renders a marker for each location', () => {
    render(<ResourceMap onSelect={vi.fn()} data={[mockLocation, mockLocation]} />)
    expect(screen.getAllByTestId('marker')).toHaveLength(2)
  })

  it('renders no markers when data is empty', () => {
    render(<ResourceMap onSelect={vi.fn()} data={[]} />)
    expect(screen.queryByTestId('marker')).not.toBeInTheDocument()
  })

  it('calls onSelect with the location when a marker is clicked', () => {
    const onSelect = vi.fn()
    render(<ResourceMap onSelect={onSelect} data={[mockLocation]} />)
    fireEvent.click(screen.getByTestId('marker'))
    expect(onSelect).toHaveBeenCalledWith(mockLocation)
  })

  it('renders the location name in the popup', () => {
    render(<ResourceMap onSelect={vi.fn()} data={[mockLocation]} />)
    expect(screen.getByTestId('popup')).toBeInTheDocument()
  })

  it('renders location address in the popup', () => {
    render(<ResourceMap onSelect={vi.fn()} data={[mockLocation]} />)
    expect(screen.getByText(mockLocation.address)).toBeInTheDocument()
  })
})

describe('GeolocationController', () => {
  it('calls geolocation when available', () => {
    const mockGetCurrentPosition = vi.fn()
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    render(<ResourceMap onSelect={vi.fn()} data={[]} />)

    expect(mockGetCurrentPosition).toHaveBeenCalled()
  })

  it('flies to the user location on geolocation success', () => {
    const mockGetCurrentPosition = vi.fn().mockImplementation((successFn: PositionCallback) => {
      successFn({ coords: { latitude: 45.5, longitude: -122.7 } } as GeolocationPosition)
    })
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    render(<ResourceMap onSelect={vi.fn()} data={[]} />)

    expect(mockFlyTo).toHaveBeenCalledWith([45.5, -122.7], 15, { animate: true, duration: 1.5 })
  })

  it('logs a warning when geolocation fails', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const mockGetCurrentPosition = vi.fn().mockImplementation(
      (_success: unknown, errorFn: PositionErrorCallback) => {
        errorFn({ message: 'Permission denied' } as GeolocationPositionError)
      },
    )
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    })

    render(<ResourceMap onSelect={vi.fn()} data={[]} />)

    expect(consoleWarn).toHaveBeenCalledWith('Geolocation unavailable:', 'Permission denied')
    consoleWarn.mockRestore()
  })

  it('does nothing when geolocation is unavailable', () => {
    vi.stubGlobal('navigator', { geolocation: undefined })

    expect(() => render(<ResourceMap onSelect={vi.fn()} data={[]} />)).not.toThrow()
  })
})
