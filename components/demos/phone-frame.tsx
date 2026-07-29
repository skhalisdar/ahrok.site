import type { ReactNode } from 'react'

/**
 * Renders its children inside a realistic phone frame on desktop, and as a
 * full-bleed app on mobile (the decorative frame is removed below 600px via
 * CSS in globals.css). The children are expected to be a `.demo-app` flex
 * column: a sticky header, a scrollable `.demo-body`, and a bottom nav.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="demo-stage">
      <div className="demo-phone">
        <div className="demo-notch" aria-hidden="true" />
        <div className="demo-screen">{children}</div>
      </div>
    </div>
  )
}
