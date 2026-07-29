import type { CSSProperties, ReactNode } from 'react'

export function Container({
  children,
  style,
  narrow,
}: {
  children: ReactNode
  style?: CSSProperties
  narrow?: boolean
}) {
  return (
    <div
      style={{
        maxWidth: narrow ? 760 : 1120,
        margin: '0 auto',
        padding: '0 24px',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
