import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...(props as object)} />
  ),
}))

describe('Home page', () => {
  it('renders the Next.js logo', () => {
    render(<Home />)
    expect(screen.getByAltText('Next.js logo')).toBeInTheDocument()
  })

  it('renders the getting started heading', () => {
    render(<Home />)
    expect(screen.getByText(/to get started/i)).toBeInTheDocument()
  })

  it('renders the Deploy Now link', () => {
    render(<Home />)
    expect(screen.getByText(/deploy now/i)).toBeInTheDocument()
  })

  it('renders the Documentation link', () => {
    render(<Home />)
    expect(screen.getByText(/documentation/i)).toBeInTheDocument()
  })
})
