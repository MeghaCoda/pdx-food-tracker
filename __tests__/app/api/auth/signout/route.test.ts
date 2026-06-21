import { describe, it, expect } from 'vitest'
import { POST } from '@/app/api/auth/signout/route'

describe('POST /api/auth/signout', () => {
  it('returns 200 with success true', async () => {
    const response = await POST()
    expect(response.status).toBe(200)
    expect((await response.json()).success).toBe(true)
  })

  it('deletes the auth_token cookie', async () => {
    const response = await POST()
    const setCookie = response.headers.get('set-cookie')
    expect(setCookie).toMatch(/auth_token=;|auth_token=($|;)/)
  })
})
