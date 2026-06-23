'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'

export function HeaderWrapper({ isSignedIn }: { isSignedIn: boolean }) {
  const pathname = usePathname()
  if (pathname === '/') return null
  return <Header isSignedIn={isSignedIn} />
}
