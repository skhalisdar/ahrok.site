'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

// Hides the Ahrok site chrome (header/footer) on immersive routes like the
// product demos, which render their own self-contained brand shell.
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const bare = pathname?.startsWith('/demos')
  if (bare) return null
  return <>{children}</>
}
