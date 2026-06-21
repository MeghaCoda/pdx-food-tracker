import { describe, it, expect, vi } from 'vitest'

vi.mock('next/dynamic', () => ({
  default: vi.fn(() => () => null),
}))

import LocationMap from '@/components/LocationMap'

describe('LocationMap index', () => {
  it('exports a component', () => {
    expect(LocationMap).toBeDefined()
    expect(typeof LocationMap).toBe('function')
  })
})
