import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockClient = { auth: {}, from: vi.fn() }

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockClient),
}))

import { createClient } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabase'

beforeEach(() => {
  vi.clearAllMocks()
  process.env.SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key'
})

describe('createSupabaseClient', () => {
  it('calls createClient with env vars', () => {
    createSupabaseClient()
    expect(createClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-publishable-key',
    )
  })

  it('returns the Supabase client', () => {
    const client = createSupabaseClient()
    expect(client).toBe(mockClient)
  })
})
