/**
 * Tests for /results (ResultsPage)
 *
 * Mock data mirrors the seed.sql dataset so every filter chip, benefit category,
 * and data edge-case that exists in development is exercised here.
 *
 * KNOWN GAPS (tests marked with a comment) document behaviour that the UI does NOT
 * yet implement — they will fail until the gap is closed. Each gap is also
 * summarised in the "UI Gaps" section at the bottom of this file.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import type { ResourceWithLocation } from '@/schemas/zodSchema'

// ─── Next.js navigation mocks ────────────────────────────────────────────────

const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/results',
}))

// ─── React-query mock ─────────────────────────────────────────────────────────

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return { ...actual, useQuery: vi.fn() }
})

import { useQuery } from '@tanstack/react-query'

// ─── LocationMap dynamic-import mock ─────────────────────────────────────────

vi.mock('@/components/LocationMap/LocationMap', () => ({
  default: ({ data }: { data: ResourceWithLocation[] }) => (
    <div data-testid="location-map" data-count={data.length} />
  ),
}))

import { ResultsPage } from '@/app/results/ResultsPage'

// ─── Seed-derived mock data ───────────────────────────────────────────────────
//
// IDs mirror seed.sql so they are easy to cross-reference.
// Resource IDs (r*_id) live at the top level; physical-location IDs (pl*_id)
// live inside physical_location.id.

const ADMIN_ID = '00000000-0000-4000-8000-000000000001'

// resource ids
const R1_ID  = '00000000-0000-4000-8000-000000000010'
const R2_ID  = '00000000-0000-4000-8000-000000000011'
const R3_ID  = '00000000-0000-4000-8000-000000000012'
const R4_ID  = '00000000-0000-4000-8000-000000000013'
const R5_ID  = '00000000-0000-4000-8000-000000000014'
const R6_ID  = '00000000-0000-4000-8000-000000000015'
const R7_ID  = '00000000-0000-4000-8000-000000000016'
const R8_ID  = '00000000-0000-4000-8000-000000000017'
const R9_ID  = '00000000-0000-4000-8000-000000000018'
const R10_ID = '00000000-0000-4000-8000-000000000019'
const R11_ID = '00000000-0000-4000-8000-000000000020'
const R12_ID = '00000000-0000-4000-8000-000000000021'
const R16_ID = '00000000-0000-4000-8000-000000000025'

// physical location ids
const PL1_ID  = '00000000-0000-4000-8000-000000000030'
const PL2_ID  = '00000000-0000-4000-8000-000000000031'
const PL3_ID  = '00000000-0000-4000-8000-000000000032'
const PL4_ID  = '00000000-0000-4000-8000-000000000033'
const PL5_ID  = '00000000-0000-4000-8000-000000000034'
const PL6_ID  = '00000000-0000-4000-8000-000000000035'
const PL7_ID  = '00000000-0000-4000-8000-000000000036'
const PL8_ID  = '00000000-0000-4000-8000-000000000037'
const PL9_ID  = '00000000-0000-4000-8000-000000000038'
const PL10_ID = '00000000-0000-4000-8000-000000000039'
const PL11_ID = '00000000-0000-4000-8000-000000000040'
const PL12_ID = '00000000-0000-4000-8000-000000000041'
const PL13_ID = '00000000-0000-4000-8000-000000000042'
const PL16_ID = '00000000-0000-4000-8000-000000000044'

type MakeOpts = Omit<Partial<ResourceWithLocation>, 'physical_location'> & {
  physical_location?: Partial<ResourceWithLocation['physical_location']>
}

function makeResource(
  id: string,
  name: string,
  locId: string,
  opts: MakeOpts = {}
): ResourceWithLocation {
  const { physical_location: locOverrides, ...topOverrides } = opts
  return {
    id,
    name,
    description: `Description for ${name}`,
    offer_desc: null,
    offer_source: null,
    benefits: null,
    verification_status: 'approved',
    expires_at: null,
    is_active: true,
    created_by: ADMIN_ID,
    created_at: '2025-01-01T00:00:00+00:00',
    updated_at: '2025-01-01T00:00:00+00:00',
    ...topOverrides,
    physical_location: {
      id: locId,
      resource_id: id,
      address: '100 SE Test Ave',
      address2: null,
      city: 'Portland',
      state: 'OR',
      zip_code: '97201',
      neighborhood: 'Test District',
      latitude: 45.523,
      longitude: -122.676,
      phone_number: '(503) 555-0000',
      verification_status: 'approved',
      created_at: '2025-01-01T00:00:00+00:00',
      resource_hours: [],
      ...locOverrides,
    },
  }
}

// ── r1: Hawthorne Community Pantry — free_food, location 1 (has address2) ────
const r1_location1 = makeResource(R1_ID, 'Hawthorne Community Pantry', PL1_ID, {
  benefits: ['free_food'],
  description:
    'A community-run food pantry serving the Hawthorne and Richmond neighborhoods.',
  physical_location: {
    address: '3425 SE Hawthorne Blvd',
    address2: 'Suite 101',
    city: 'Portland',
    state: 'OR',
    zip_code: '97214',
    neighborhood: 'Hawthorne',
    latitude: 45.5122,
    longitude: -122.6257,
    phone_number: '(503) 555-0101',
    resource_hours: [
      { id: 'h1a', day: 'monday',    opens_at: '09:00', closes_at: '17:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h1b', day: 'tuesday',   opens_at: '09:00', closes_at: '17:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h1c', day: 'wednesday', opens_at: '09:00', closes_at: '17:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h1d', day: 'thursday',  opens_at: '09:00', closes_at: '17:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h1e', day: 'friday',    opens_at: '09:00', closes_at: '17:00', notes: 'Extended to 7pm on last Friday of the month', valid_from: null, valid_until: null },
      { id: 'h1f', day: 'saturday',  opens_at: '10:00', closes_at: '14:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h1g', day: 'sunday',    opens_at: '12:00', closes_at: '15:00', notes: 'Volunteer-only hours, limited supply', valid_from: null, valid_until: null },
    ],
  },
})

// ── r1: Hawthorne Community Pantry — location 2 (no address2, no phone) ──────
//
// GAP: r1 has two locations. The service returns BOTH as separate ResourceWithLocation
// entries, both with id === R1_ID. React will emit a "duplicate key" warning and
// <ResultListItem key={item.id}> will de-duplicate them incorrectly.
const r1_location2 = makeResource(R1_ID, 'Hawthorne Community Pantry', PL2_ID, {
  benefits: ['free_food'],
  physical_location: {
    address: '6710 SE Foster Rd',
    address2: null,
    city: 'Portland',
    state: 'OR',
    zip_code: '97206',
    neighborhood: 'Woodstock',
    latitude: 45.4858,
    longitude: -122.6122,
    phone_number: null,
    resource_hours: [
      { id: 'h2a', day: 'tuesday',  opens_at: '10:00', closes_at: '14:00', notes: null, valid_from: '2026-09-01', valid_until: '2027-05-31' },
      { id: 'h2b', day: 'thursday', opens_at: '10:00', closes_at: '14:00', notes: null, valid_from: '2026-09-01', valid_until: '2027-05-31' },
    ],
  },
})

// ── r2: Division Street Discount Grocer — discounted_food ────────────────────
const r2_discounted = makeResource(R2_ID, 'Division Street Discount Grocer', PL3_ID, {
  benefits: ['discounted_food'],
  description: 'A worker-owned cooperative grocery store offering steeply discounted food.',
  physical_location: {
    address: '4233 SE Division St',
    city: 'Portland',
    state: 'OR',
    zip_code: '97202',
    neighborhood: 'Division',
    latitude: 45.5019,
    longitude: -122.6370,
    phone_number: '(503) 555-0202',
    resource_hours: [],
  },
})

// ── r3: Lents SNAP Market — snap_accepted + discounted_food ──────────────────
const r3_snap = makeResource(R3_ID, 'Lents SNAP Market', PL4_ID, {
  benefits: ['snap_accepted', 'discounted_food'],
  offer_source: null,
  physical_location: {
    address: '9101 SE Holgate Blvd',
    city: 'Portland',
    state: 'OR',
    zip_code: '97266',
    neighborhood: 'Lents',
    latitude: 45.4812,
    longitude: -122.5710,
    phone_number: '(503) 555-0303',
    resource_hours: [
      { id: 'h4a', day: 'saturday', opens_at: '09:00', closes_at: '14:00', notes: 'Outdoor market', valid_from: null, valid_until: null },
    ],
  },
})

// ── r4: PSU Student Food Collective — student_discount + free_food ────────────
const r4_student = makeResource(R4_ID, 'PSU Student Food Collective', PL5_ID, {
  benefits: ['student_discount', 'free_food'],
  expires_at: '2027-06-15',
  physical_location: {
    address: '1825 SW Broadway',
    address2: 'Smith Memorial Union Rm 120',
    city: 'Portland',
    state: 'OR',
    zip_code: '97201',
    neighborhood: 'South Park Blocks',
    latitude: 45.5118,
    longitude: -122.6830,
    phone_number: '(503) 555-0404',
    resource_hours: [
      { id: 'h5a', day: 'monday',    opens_at: '11:00', closes_at: '18:00', notes: null, valid_from: '2026-09-22', valid_until: '2027-06-13' },
      { id: 'h5b', day: 'tuesday',   opens_at: '11:00', closes_at: '18:00', notes: null, valid_from: '2026-09-22', valid_until: '2027-06-13' },
      { id: 'h5c', day: 'wednesday', opens_at: '11:00', closes_at: '18:00', notes: null, valid_from: '2026-09-22', valid_until: '2027-06-13' },
      { id: 'h5d', day: 'thursday',  opens_at: '11:00', closes_at: '18:00', notes: null, valid_from: '2026-09-22', valid_until: '2027-06-13' },
      { id: 'h5e', day: 'friday',    opens_at: '11:00', closes_at: '15:00', notes: null, valid_from: '2026-09-22', valid_until: '2027-06-13' },
    ],
  },
})

// ── r5: Richmond Senior Dining Hall — senior_discount + free_food ─────────────
const r5_senior = makeResource(R5_ID, 'Richmond Senior Dining Hall', PL6_ID, {
  benefits: ['senior_discount', 'free_food'],
  physical_location: {
    address: '2913 SE 28th Ave',
    city: 'Portland',
    state: 'OR',
    zip_code: '97202',
    neighborhood: 'Richmond',
    latitude: 45.5056,
    longitude: -122.6399,
    phone_number: '(503) 555-0505',
    resource_hours: [
      { id: 'h6a', day: 'tuesday',   opens_at: '11:00', closes_at: '13:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h6b', day: 'wednesday', opens_at: '11:00', closes_at: '13:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h6c', day: 'thursday',  opens_at: '11:00', closes_at: '13:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h6d', day: 'friday',    opens_at: '11:00', closes_at: '13:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h6e', day: 'saturday',  opens_at: '11:00', closes_at: '13:00', notes: 'Reservations encouraged', valid_from: null, valid_until: null },
    ],
  },
})

// ── r6: Sellwood Kids Eat Free Diner — kids_eat_free ──────────────────────────
const r6_kids = makeResource(R6_ID, 'Sellwood Kids Eat Free Diner', PL7_ID, {
  benefits: ['kids_eat_free'],
  offer_source: null,
  description: 'A diner in Sellwood where children under 12 eat free with a paying adult.',
  physical_location: {
    address: '1132 SE Tacoma St',
    city: 'Portland',
    state: 'OR',
    zip_code: '97202',
    neighborhood: 'Sellwood',
    latitude: 45.4699,
    longitude: -122.6600,
    phone_number: '(503) 555-0606',
    resource_hours: [],
  },
})

// ── r7: Alberta BOGO Bakery — bogo ────────────────────────────────────────────
const r7_bogo = makeResource(R7_ID, 'Alberta BOGO Bakery', PL8_ID, {
  benefits: ['bogo'],
  physical_location: {
    address: '2544 NE Alberta St',
    city: 'Portland',
    state: 'OR',
    zip_code: '97211',
    neighborhood: 'Alberta Arts District',
    latitude: 45.5603,
    longitude: -122.6381,
    phone_number: '(503) 555-0707',
    resource_hours: [],
  },
})

// ── r8: Woodstock Coupon Exchange Network — coupon ────────────────────────────
const r8_coupon = makeResource(R8_ID, 'Woodstock Coupon Exchange Network', PL9_ID, {
  benefits: ['coupon'],
  physical_location: {
    address: '7192 SE Woodstock Blvd',
    city: 'Portland',
    state: 'OR',
    zip_code: '97206',
    neighborhood: 'Woodstock',
    latitude: 45.4856,
    longitude: -122.6218,
    phone_number: '(503) 555-0808',
    resource_hours: [],
  },
})

// ── r9: St. Johns Free Breakfast Club — free_breakfast ────────────────────────
const r9_breakfast = makeResource(R9_ID, 'St. Johns Free Breakfast Club', PL10_ID, {
  benefits: ['free_breakfast'],
  physical_location: {
    address: '8517 N Central St',
    city: 'Portland',
    state: 'OR',
    zip_code: '97203',
    neighborhood: 'St. Johns',
    latitude: 45.5958,
    longitude: -122.7471,
    phone_number: '(503) 555-0909',
    resource_hours: [
      { id: 'h10a', day: 'sunday', opens_at: '08:00', closes_at: '11:00', notes: 'No sign-up required', valid_from: null, valid_until: null },
    ],
  },
})

// ── r10: Kenton Community Services Hub — other ────────────────────────────────
const r10_other = makeResource(R10_ID, 'Kenton Community Services Hub', PL11_ID, {
  benefits: ['other'],
  physical_location: {
    address: '2135 N Killingsworth St',
    city: 'Portland',
    state: 'OR',
    zip_code: '97217',
    neighborhood: 'Kenton',
    latitude: 45.5601,
    longitude: -122.6929,
    phone_number: '(503) 555-1010',
    resource_hours: [
      { id: 'h11a', day: 'monday',    opens_at: '09:00', closes_at: '17:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h11b', day: 'tuesday',   opens_at: '09:00', closes_at: '17:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h11c', day: 'wednesday', opens_at: '09:00', closes_at: '17:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h11d', day: 'thursday',  opens_at: '09:00', closes_at: '17:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h11e', day: 'friday',    opens_at: '09:00', closes_at: '17:00', notes: null, valid_from: null, valid_until: null },
    ],
  },
})

// ── r11: Pearl District Meal Depot — approved but is_active=false ─────────────
//
// EDGE CASE / GAP: The DB query only filters on physical_location.verification_status.
// It does NOT filter on resources.is_active. This location leaks into results.
const r11_inactive = makeResource(R11_ID, 'Pearl District Meal Depot', PL12_ID, {
  benefits: ['free_food', 'discounted_food'],
  is_active: false,
  physical_location: {
    address: '535 NW 12th Ave',
    address2: 'Floor 1',
    city: 'Portland',
    state: 'OR',
    zip_code: '97209',
    neighborhood: 'Pearl District',
    latitude: 45.5250,
    longitude: -122.6820,
    phone_number: '(503) 555-1111',
    resource_hours: [],
  },
})

// ── r12: Concordia Summer Lunch Program — expires_at in the past ──────────────
//
// EDGE CASE / GAP: expires_at is '2025-08-31' (past). The service does not
// filter these out, so they appear in results alongside active resources.
const r12_expired = makeResource(R12_ID, 'Concordia Summer Lunch Program', PL13_ID, {
  benefits: ['free_food', 'kids_eat_free'],
  expires_at: '2025-08-31',
  physical_location: {
    address: '4828 NE 33rd Ave',
    city: 'Portland',
    state: 'OR',
    zip_code: '97211',
    neighborhood: 'Concordia',
    latitude: 45.5628,
    longitude: -122.6441,
    phone_number: '(503) 555-1212',
    resource_hours: [],
  },
})

// ── r16: Columbia Gorge Veterans Market — military_discount + discounted_food ──
const r16_military = makeResource(R16_ID, 'Columbia Gorge Veterans Market', PL16_ID, {
  benefits: ['military_discount', 'discounted_food'],
  description:
    'A military-friendly grocery market offering verified discounts to active duty service members, veterans, and their families.',
  physical_location: {
    address: '4821 NE Sandy Blvd',
    city: 'Portland',
    state: 'OR',
    zip_code: '97213',
    neighborhood: 'Hollywood',
    latitude: 45.5282,
    longitude: -122.6163,
    phone_number: '(503) 555-1616',
    resource_hours: [
      { id: 'h16a', day: 'monday',    opens_at: '08:00', closes_at: '20:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h16b', day: 'tuesday',   opens_at: '08:00', closes_at: '20:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h16c', day: 'wednesday', opens_at: '08:00', closes_at: '20:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h16d', day: 'thursday',  opens_at: '08:00', closes_at: '20:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h16e', day: 'friday',    opens_at: '08:00', closes_at: '20:00', notes: null, valid_from: null, valid_until: null },
      { id: 'h16f', day: 'saturday',  opens_at: '09:00', closes_at: '18:00', notes: null, valid_from: null, valid_until: null },
    ],
  },
})

// Full seed-derived dataset as the API currently returns it (14 items)
const ALL_SEED_LOCATIONS: ResourceWithLocation[] = [
  r1_location1,
  r1_location2,    // same resource, second physical location
  r2_discounted,
  r3_snap,
  r4_student,
  r5_senior,
  r6_kids,
  r7_bogo,
  r8_coupon,
  r9_breakfast,
  r10_other,
  r11_inactive,   // EDGE: is_active=false, still returned by API
  r12_expired,    // EDGE: expires_at in past, still returned by API
  r16_military,
]

// ─── Helper ───────────────────────────────────────────────────────────────────

function mockLocations(items: ResourceWithLocation[]) {
  vi.mocked(useQuery).mockReturnValue({
    data: items,
    isLoading: false,
  } as ReturnType<typeof useQuery>)
}

function setSearchParams(params: Record<string, string>) {
  // Reset then apply new params
  ;[...mockSearchParams.keys()].forEach((k) => mockSearchParams.delete(k))
  Object.entries(params).forEach(([k, v]) => mockSearchParams.set(k, v))
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  ;[...mockSearchParams.keys()].forEach((k) => mockSearchParams.delete(k))
  mockLocations([])
})

// ── Loading / empty state ─────────────────────────────────────────────────────

describe('empty / loading state', () => {
  it('shows loading text when the query returns no data', () => {
    mockLocations([])
    render(<ResultsPage />)
    expect(screen.getByText('Loading resources…')).toBeInTheDocument()
  })

  it('does not show loading text when results are present', () => {
    mockLocations([r1_location1])
    render(<ResultsPage />)
    expect(screen.queryByText('Loading resources…')).not.toBeInTheDocument()
  })
})

// ── Filter chips ──────────────────────────────────────────────────────────────

describe('filter chips', () => {
  it('renders all 7 filter chips', () => {
    render(<ResultsPage />)
    const labels = ['Free', 'Discount', 'Prepared', 'Groceries', 'Restaurant', 'Pickup', 'Delivery']
    for (const label of labels) {
      expect(screen.getByRole('button', { name: new RegExp(label, 'i') })).toBeInTheDocument()
    }
  })

  it('no chip is selected by default', () => {
    render(<ResultsPage />)
    // A selected chip gains a "✕" close indicator.
    // When no chip is selected none of the chips contain a visible ✕.
    const closeIcons = screen.queryAllByText('✕')
    const visibleClose = closeIcons.filter(
      (el) => !el.classList.contains('opacity-0')
    )
    expect(visibleClose).toHaveLength(0)
  })

  it('chip appears selected when its param is in the URL', () => {
    setSearchParams({ price: 'free' })
    render(<ResultsPage />)
    // The selected chip has opacity-0 removed from its ✕
    const freeChip = screen.getByRole('button', { name: /free/i })
    const closeIcon = within(freeChip).queryByText('✕')
    expect(closeIcon).not.toHaveClass('opacity-0')
  })

  it('clicking a chip adds its param to the URL', () => {
    render(<ResultsPage />)
    fireEvent.click(screen.getByRole('button', { name: /^free/i }))
    expect(mockPush).toHaveBeenCalledWith('/results?price=free')
  })

  it('clicking an active chip removes its param from the URL', () => {
    setSearchParams({ price: 'free' })
    render(<ResultsPage />)
    fireEvent.click(screen.getByRole('button', { name: /^free/i }))
    expect(mockPush).toHaveBeenCalledWith('/results?')
  })

  it('multiple chips with the same key accumulate comma-separated values', () => {
    setSearchParams({ price: 'free' })
    render(<ResultsPage />)
    fireEvent.click(screen.getByRole('button', { name: /discount/i }))
    const call = mockPush.mock.calls[0][0] as string
    const params = new URLSearchParams(call.split('?')[1])
    const priceValues = params.get('price')?.split(',') ?? []
    expect(priceValues).toContain('free')
    expect(priceValues).toContain('discount')
  })

  it('chips with different keys are stored under separate params', () => {
    render(<ResultsPage />)
    fireEvent.click(screen.getByRole('button', { name: /^free/i }))
    const firstCall = mockPush.mock.calls[0][0] as string
    // Simulate the URL update by setting searchParams before next render
    setSearchParams({ price: 'free' })
    fireEvent.click(screen.getByRole('button', { name: /pickup/i }))
    const secondCall = mockPush.mock.calls[1][0] as string
    const params = new URLSearchParams(secondCall.split('?')[1])
    expect(params.get('price')).toBe('free')
    expect(params.get('accessType')).toBe('pickup')
    void firstCall // suppress unused warning
  })
})

// ── List rendering ────────────────────────────────────────────────────────────

describe('list rendering', () => {
  it('renders a list item for each location in the dataset', () => {
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    // 14 items (r1 appears twice — once per physical location)
    const items = screen.getAllByRole('paragraph').filter((el) => {
      // ResultListItem renders resource name in the first <p> (font-medium)
      return el.classList.contains('font-medium')
    })
    expect(items).toHaveLength(ALL_SEED_LOCATIONS.length)
  })

  it('renders each resource name', () => {
    mockLocations([r1_location1, r2_discounted, r9_breakfast])
    render(<ResultsPage />)
    expect(screen.getByText('Hawthorne Community Pantry')).toBeInTheDocument()
    expect(screen.getByText('Division Street Discount Grocer')).toBeInTheDocument()
    expect(screen.getByText('St. Johns Free Breakfast Club')).toBeInTheDocument()
  })

  it('renders address without address2 when address2 is null', () => {
    mockLocations([r1_location2]) // pl2: no address2
    render(<ResultsPage />)
    expect(screen.getByText('6710 SE Foster Rd')).toBeInTheDocument()
    expect(screen.queryByText(/null/i)).not.toBeInTheDocument()
  })

  it('renders address with address2 when both are present', () => {
    mockLocations([r1_location1]) // pl1: address2 = 'Suite 101'
    render(<ResultsPage />)
    expect(screen.getByText('3425 SE Hawthorne Blvd, Suite 101')).toBeInTheDocument()
  })

  it('renders address2 as room number (PSU campus address)', () => {
    mockLocations([r4_student]) // address2 = 'Smith Memorial Union Rm 120'
    render(<ResultsPage />)
    expect(screen.getByText('1825 SW Broadway, Smith Memorial Union Rm 120')).toBeInTheDocument()
  })

  it('renders description when present', () => {
    mockLocations([r6_kids])
    render(<ResultsPage />)
    expect(screen.getByText(/children under 12 eat free/i)).toBeInTheDocument()
  })

  it('does not render a description element when description is null', () => {
    const noDesc = makeResource(R1_ID, 'No Description Resource', PL1_ID, { description: null })
    mockLocations([noDesc])
    render(<ResultsPage />)
    // Only the name and address paragraphs should render, not a third one
    const nameEl = screen.getByText('No Description Resource')
    const container = nameEl.closest('[class*="px-4"]')!
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(2) // name + address only
  })

  it('passes data to the LocationMap component', () => {
    mockLocations([r1_location1, r2_discounted])
    render(<ResultsPage />)
    // LocationMap is hidden on mobile list view; we check data attribute count
    const mapEl = screen.getByTestId('location-map')
    expect(mapEl.getAttribute('data-count')).toBe('2')
  })
})

// ── Edge cases from seed data ─────────────────────────────────────────────────

describe('edge cases from seed data', () => {
  it('renders both physical locations for a resource that has two locations', () => {
    // r1 has pl1 (Hawthorne) and pl2 (Foster Rd) — both should appear
    mockLocations([r1_location1, r1_location2])
    render(<ResultsPage />)
    expect(screen.getByText('3425 SE Hawthorne Blvd, Suite 101')).toBeInTheDocument()
    expect(screen.getByText('6710 SE Foster Rd')).toBeInTheDocument()
  })

  it('handles a resource with no phone number without crashing', () => {
    // r1 location 2 has phone_number: null
    mockLocations([r1_location2])
    expect(() => render(<ResultsPage />)).not.toThrow()
  })

  it('handles a location with null lat/lon (cannot show map pin)', () => {
    // r10 Kenton Hub has latitude: null, longitude: null
    mockLocations([r10_other])
    expect(() => render(<ResultsPage />)).not.toThrow()
    expect(screen.getByText('Kenton Community Services Hub')).toBeInTheDocument()
  })

  it('renders a resource with multiple benefits in its array', () => {
    // r3 has ['snap_accepted', 'discounted_food']
    mockLocations([r3_snap])
    expect(() => render(<ResultsPage />)).not.toThrow()
    expect(screen.getByText('Lents SNAP Market')).toBeInTheDocument()
  })

  it('renders a resource with a future expires_at without crashing', () => {
    // r4 PSU Collective: expires_at = '2027-06-15' (future)
    mockLocations([r4_student])
    expect(() => render(<ResultsPage />)).not.toThrow()
    expect(screen.getByText('PSU Student Food Collective')).toBeInTheDocument()
  })

  it('renders hours with valid_from/valid_until bounds (seasonal hours) without crashing', () => {
    // r4 and r1 location 2 have date-bounded hours
    mockLocations([r4_student, r1_location2])
    expect(() => render(<ResultsPage />)).not.toThrow()
  })

  // ── GAP: inactive resources leak through ────────────────────────────────────
  //
  // The /api/locations DB query only checks physical_location.verification_status.
  // It does NOT filter on resources.is_active. When is_active=false (r11), the
  // location still appears in the list and map.
  it('does not show resources where is_active is false', () => {
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    // GAP: this assertion currently FAILS because the inactive resource leaks through
    expect(screen.queryByText('Pearl District Meal Depot')).not.toBeInTheDocument()
  })

  // ── GAP: expired resources leak through ─────────────────────────────────────
  //
  // resources.expires_at is not checked — r12 (Concordia Summer, expired 2025-08-31)
  // still appears in results even though the program has ended.
  it('does not show resources whose expires_at is in the past', () => {
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    // GAP: this assertion currently FAILS because the expired resource leaks through
    expect(screen.queryByText('Concordia Summer Lunch Program')).not.toBeInTheDocument()
  })
})

// ── Filter chip → result filtering ───────────────────────────────────────────
//
// GAP: All tests in this describe block currently FAIL.
//
// The ResultsPage reads filter params from the URL (via useSearchParams) and
// toggles chips, but it NEVER applies those params to filter the `locations` array.
// Every chip state shows the full unfiltered list.
//
// Additionally:
// - The chip keys/values (price, foodType, accessType) have no defined mapping to
//   the benefit_category enum values used in the data model.
// - 'prepared', 'groceries', 'restaurant', and 'military_discount' do not exist in
//   BenefitCategorySchema or the DB enum (schema gap — see zodSchema.test.ts).

describe('filter chip → result filtering (GAP: not yet implemented)', () => {
  it('price=free shows only free_food and free_breakfast resources', () => {
    setSearchParams({ price: 'free' })
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    // Expected: r1 (free_food), r4 (free_food+student), r5 (free_food+senior),
    //           r9 (free_breakfast) — NOT r2 (discount), r7 (bogo), etc.
    expect(screen.getByText('Hawthorne Community Pantry')).toBeInTheDocument()
    expect(screen.getByText('St. Johns Free Breakfast Club')).toBeInTheDocument()
    // GAP: currently shows all results; discount-only resources should be hidden
    expect(screen.queryByText('Alberta BOGO Bakery')).not.toBeInTheDocument()
    expect(screen.queryByText('Woodstock Coupon Exchange Network')).not.toBeInTheDocument()
  })

  it('price=discount shows only discounted resources', () => {
    setSearchParams({ price: 'discount' })
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    // Expected: r2 (discounted_food), r3 (snap_accepted+discounted), r4 (student_discount),
    //           r5 (senior_discount), r6 (kids_eat_free), r7 (bogo), r8 (coupon)
    expect(screen.getByText('Division Street Discount Grocer')).toBeInTheDocument()
    expect(screen.getByText('Alberta BOGO Bakery')).toBeInTheDocument()
    // GAP: free-only resources should be hidden
    expect(screen.queryByText('St. Johns Free Breakfast Club')).not.toBeInTheDocument()
  })

  it('price=free,discount (OR) shows both free and discounted resources', () => {
    setSearchParams({ price: 'free,discount' })
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    expect(screen.getByText('Hawthorne Community Pantry')).toBeInTheDocument()
    expect(screen.getByText('Division Street Discount Grocer')).toBeInTheDocument()
    // GAP: "other" category only resource should still be excluded
    expect(screen.queryByText('Kenton Community Services Hub')).not.toBeInTheDocument()
  })

  it('foodType=prepared shows resources serving prepared/hot food', () => {
    setSearchParams({ foodType: 'prepared' })
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    // Expected: r5 (senior dining — hot lunches), r6 (diner — kids eat free),
    //           r9 (free_breakfast — hot breakfast)
    expect(screen.getByText('Richmond Senior Dining Hall')).toBeInTheDocument()
    expect(screen.getByText('St. Johns Free Breakfast Club')).toBeInTheDocument()
    // GAP: library / coupon resources are not prepared food
    expect(screen.queryByText('Woodstock Coupon Exchange Network')).not.toBeInTheDocument()
  })

  it('foodType=groceries shows pantry / market / grocery resources', () => {
    setSearchParams({ foodType: 'groceries' })
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    // Expected: r1 (pantry), r2 (discount grocer), r3 (SNAP market), r4 (PSU pantry).
    // r1 appears twice (two physical locations), so use getAllByText.
    expect(screen.getAllByText('Hawthorne Community Pantry')).toHaveLength(2)
    expect(screen.getByText('Division Street Discount Grocer')).toBeInTheDocument()
    expect(screen.getByText('Lents SNAP Market')).toBeInTheDocument()
    // GAP: diner / restaurant resources are not groceries
    expect(screen.queryByText('Sellwood Kids Eat Free Diner')).not.toBeInTheDocument()
  })

  it('foodType=restaurant shows restaurant / diner resources', () => {
    setSearchParams({ foodType: 'restaurant' })
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    // Expected: r6 (diner — kids_eat_free), r7 (bakery — bogo)
    expect(screen.getByText('Sellwood Kids Eat Free Diner')).toBeInTheDocument()
    expect(screen.getByText('Alberta BOGO Bakery')).toBeInTheDocument()
    // GAP: pantry resources are not restaurants
    expect(screen.queryByText('Hawthorne Community Pantry')).not.toBeInTheDocument()
  })

  it('accessType=pickup shows resources with a physical pickup location', () => {
    setSearchParams({ accessType: 'pickup' })
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    // All seed locations with physical_locations should show
    expect(screen.getByText('Hawthorne Community Pantry')).toBeInTheDocument()
    expect(screen.getByText('Kenton Community Services Hub')).toBeInTheDocument()
  })

  it('accessType=delivery shows delivery/online resources', () => {
    setSearchParams({ accessType: 'delivery' })
    // No seed resources have delivery — result should be empty
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    // GAP: no delivery resources in seed data; list should be empty
    // This also surfaces that online-only resources (r15) are invisible — they
    // have no physical location and are not returned by /api/locations at all.
    const nameEls = screen.queryAllByRole('paragraph').filter((el) =>
      el.classList.contains('font-medium')
    )
    expect(nameEls).toHaveLength(0)
  })

  it('cross-key filter (price=free AND foodType=groceries) narrows results', () => {
    setSearchParams({ price: 'free', foodType: 'groceries' })
    mockLocations(ALL_SEED_LOCATIONS)
    render(<ResultsPage />)
    // Expected: r1 (free pantry groceries), r4 (free student pantry)
    expect(screen.getByText('Hawthorne Community Pantry')).toBeInTheDocument()
    // GAP: bogo bakery is not free AND groceries
    expect(screen.queryByText('Alberta BOGO Bakery')).not.toBeInTheDocument()
    // GAP: senior dining is free but prepared, not groceries
    expect(screen.queryByText('Richmond Senior Dining Hall')).not.toBeInTheDocument()
  })

  it('snap_accepted (Lents SNAP Market) appears with price=discount filter', () => {
    // snap_accepted conceptually belongs under "discount" in the UI
    setSearchParams({ price: 'discount' })
    mockLocations([r3_snap])
    render(<ResultsPage />)
    expect(screen.getByText('Lents SNAP Market')).toBeInTheDocument()
  })

  // ── GAP: military_discount filter not implemented ───────────────────────────
  //
  // 'military_discount' is now a valid BenefitCategorySchema value and DB enum.
  // The resource renders correctly, but the price=military_discount URL param is
  // not wired to any filtering logic, so other resources still appear.
  it('price=military_discount shows only military-discount resources', () => {
    setSearchParams({ price: 'military_discount' })
    mockLocations([r16_military, r2_discounted, r9_breakfast])
    render(<ResultsPage />)
    // GAP: filtering not yet implemented — non-military resources still appear
    expect(screen.getByText('Columbia Gorge Veterans Market')).toBeInTheDocument()
    expect(screen.queryByText('Division Street Discount Grocer')).not.toBeInTheDocument()
    expect(screen.queryByText('St. Johns Free Breakfast Club')).not.toBeInTheDocument()
  })
})

// ── View toggle (List / Map) ───────────────────────────────────────────────────

describe('List / Map view toggle', () => {
  it('shows "List" and "Map" tab buttons', () => {
    render(<ResultsPage />)
    expect(screen.getByRole('button', { name: /list/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^map$/i })).toBeInTheDocument()
  })

  it('renders the location map element', () => {
    render(<ResultsPage />)
    expect(screen.getByTestId('location-map')).toBeInTheDocument()
  })
})

// ─── UI GAPS SUMMARY ──────────────────────────────────────────────────────────
//
// The following gaps were identified by cross-referencing the seed data against
// the current ResultsPage implementation. Tests that expose gaps are marked
// above with a "GAP:" comment and are expected to fail with the current code.
//
// 1. FILTERING NOT IMPLEMENTED
//    ResultsPage reads URL params (price, foodType, accessType) and toggles
//    chips, but the `locations` array from useQuery is never filtered.
//    All results display regardless of active filters.
//
// 2. FILTER CHIP KEYS NOT MAPPED TO benefit_category
//    The chip keys (price/foodType/accessType) and values (free/discount/prepared/
//    groceries/restaurant/pickup/delivery) have no defined mapping to the
//    benefit_category enum (free_food, discounted_food, snap_accepted,
//    student_discount, senior_discount, kids_eat_free, bogo, coupon,
//    free_breakfast, other). Without this mapping, even implementing filtering
//    will require a design decision about which benefits belong under each chip.
//
// 3. INACTIVE RESOURCES (is_active=false) LEAK INTO RESULTS
//    /api/locations only filters physical_location.verification_status='approved'.
//    It does not check resources.is_active. r11 (Pearl District Meal Depot,
//    is_active=false) appears in the list and map.
//    Fix: add .eq('resources.is_active', true) to the Supabase query.
//
// 4. EXPIRED RESOURCES LEAK INTO RESULTS
//    resources.expires_at is not checked. r12 (Concordia Summer Lunch Program,
//    expires_at='2025-08-31') appears in results after the program ended.
//    Fix: add .or('resources.expires_at.is.null,resources.expires_at.gt.now()')
//    to the Supabase query.
//
// 5. ONLINE-ONLY RESOURCES ARE COMPLETELY INVISIBLE
//    r15 has online_access only — no physical location — so it is never returned
//    by /api/locations and cannot be found or displayed by users. If online
//    delivery/access is a supported concept, the API and UI need a separate
//    data fetch and rendering path for these resources.
//
// 6. DUPLICATE REACT KEYS FOR MULTI-LOCATION RESOURCES
//    r1 (Hawthorne Community Pantry) has two physical locations (pl1, pl2).
//    Both are returned as ResourceWithLocation entries with id=R1_ID (the
//    resource id). <ResultListItem key={item.id}> will receive the same key
//    for both rows, causing a React "duplicate key" warning and potentially
//    incorrect rendering. Fix: use physical_location.id as the key instead.
//
// 7. MAP MARKERS FOR NULL LAT/LON LOCATIONS
//    r10 (Kenton Community Services Hub) has latitude=null, longitude=null.
//    The map must skip or specially handle this case to avoid a crash or
//    misplaced marker at [0, 0]. Currently untested in the LocationMap component.
