import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('next/font/google', () => ({
  Geist: vi.fn(() => ({ variable: '--font-geist-sans' })),
  Geist_Mono: vi.fn(() => ({ variable: '--font-geist-mono' })),
  Inter: vi.fn(() => ({ variable: '--font-sans' })),
}))

vi.mock('@/components/Header/Header', () => ({
  Header: () => <header data-testid="header" />,
}))

vi.mock('@/app/providers', () => ({
  Providers: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import RootLayout, { metadata } from '@/app/layout'

describe('metadata', () => {
  it('has a title', () => {
    expect(metadata.title).toBeDefined()
  })

  it('has a description', () => {
    expect(metadata.description).toBeDefined()
  })
})

describe('RootLayout', () => {
  it('renders without crashing', () => {
    expect(() => render(<RootLayout>test content</RootLayout>)).not.toThrow()
  })

  it('includes children in the rendered output', () => {
    render(<RootLayout>test content</RootLayout>)
    expect(document.body.textContent).toContain('test content')
  })
})
