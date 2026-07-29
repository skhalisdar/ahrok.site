import type { CSSProperties, ReactNode } from 'react'

/* ------------------------------------------------------------------ */
/* Realistic miniature mobile-app previews for the portfolio cards.    */
/* Each one is a small, on-brand phone mock that resembles the actual  */
/* product's mobile UI. Purely decorative (aria-hidden).               */
/* ------------------------------------------------------------------ */

function PhoneShell({
  backdrop,
  frame,
  screen,
  children,
}: {
  backdrop: string
  frame: string
  screen: string
  children: ReactNode
}) {
  return (
    <div
      className="product-preview"
      aria-hidden="true"
      style={{ background: backdrop }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 96,
            height: '86%',
            marginBottom: '-6%',
            borderRadius: '16px 16px 6px 6px',
            background: frame,
            padding: 4,
            paddingBottom: 0,
            boxShadow: '0 12px 26px -12px rgba(0,0,0,0.55)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              borderRadius: '12px 12px 3px 3px',
              background: screen,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function Line({
  w,
  h = 4,
  color,
  radius = 999,
}: {
  w: number | string
  h?: number
  color: string
  radius?: number
}) {
  return (
    <div
      style={{
        width: typeof w === 'number' ? `${w}%` : w,
        height: h,
        borderRadius: radius,
        backgroundColor: color,
      }}
    />
  )
}

const dotStyle = (color: string): CSSProperties => ({
  width: 5,
  height: 5,
  borderRadius: 999,
  backgroundColor: color,
  flexShrink: 0,
})

const navRow = (
  dots: string[],
  border: string,
  bg: string,
): ReactNode => (
  <div
    style={{
      marginTop: 'auto',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '5px 4px',
      borderTop: `1px solid ${border}`,
      background: bg,
    }}
  >
    {dots.map((c, i) => (
      <span key={i} style={dotStyle(c)} />
    ))}
  </div>
)

/* -------------------------------- FieldRelay -------------------------------- */
/* Construction operations app: charcoal, burnt-orange, warm off-white.        */
export function FieldRelayPreview() {
  const orange = '#e2632a'
  const offwhite = '#f4efe7'
  const muted = '#9a8f7f'
  const surface = '#29251f'
  return (
    <PhoneShell
      backdrop="linear-gradient(155deg, #2c261f 0%, #171310 100%)"
      frame="#0b0a09"
      screen="#1f1c19"
    >
      {/* App header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '7px 7px 5px',
        }}
      >
        <span style={dotStyle(orange)} />
        <Line w={44} h={4} color={offwhite} />
        <span style={{ ...dotStyle(muted), marginLeft: 'auto' }} />
      </div>

      {/* Project card with progress */}
      <div style={{ padding: '0 7px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            background: surface,
            borderRadius: 6,
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <Line w={70} h={4} color={offwhite} />
          <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ width: '64%', height: '100%', background: orange }} />
          </div>
          <Line w={40} h={3} color={muted} />
        </div>

        {/* Task rows */}
        {[
          { done: true, pill: '#5cc46a', pillBg: 'rgba(63,185,80,0.18)' },
          { done: false, pill: '#dcc070', pillBg: 'rgba(217,189,106,0.18)' },
          { done: false, pill: '#9a8f7f', pillBg: 'rgba(255,255,255,0.08)' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 3,
                border: `1.5px solid ${t.done ? orange : 'rgba(255,255,255,0.28)'}`,
                background: t.done ? orange : 'transparent',
                flexShrink: 0,
              }}
            />
            <Line w={t.done ? 42 : 54} h={3.5} color={t.done ? muted : offwhite} />
            <span
              style={{
                marginLeft: 'auto',
                width: 16,
                height: 6,
                borderRadius: 999,
                background: t.pillBg,
                borderBottom: `2px solid ${t.pill}`,
                flexShrink: 0,
              }}
            />
          </div>
        ))}
      </div>

      {navRow([orange, muted, muted, muted], 'rgba(255,255,255,0.08)', '#29251f')}
    </PhoneShell>
  )
}

/* -------------------------------- NYCMC Yard Sale -------------------------------- */
/* Friendly inventory app: warm cream, light-green, leaf/teal green from logo.     */
export function NycmcPreview() {
  const green = '#3f8f3e'
  const greenDeep = '#2f6b4f'
  const amber = '#c0772a'
  const text = '#2c2e26'
  const muted = '#8f8a78'
  const thumbs = ['#e6c79a', '#bcd39a', '#a7cbc0']
  return (
    <PhoneShell
      backdrop="linear-gradient(155deg, #eef3df 0%, #e3ddca 100%)"
      frame="#2f3b33"
      screen="#ffffff"
    >
      {/* App header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '7px 7px 5px',
        }}
      >
        <span style={dotStyle(green)} />
        <Line w={40} h={4} color={text} />
        <span style={{ ...dotStyle('#d7d0bd'), marginLeft: 'auto' }} />
      </div>

      {/* Inventory rows */}
      <div style={{ padding: '0 7px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[
          { low: false },
          { low: true },
          { low: false },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: '#f6f3e9',
              border: '1px solid #e6ddc9',
              borderRadius: 6,
              padding: 4,
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: thumbs[i],
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
              <Line w={70} h={3.5} color={text} />
              <Line w={34} h={3} color={green} />
            </div>
            {row.low ? (
              <span
                style={{
                  fontSize: 5,
                  fontWeight: 700,
                  color: amber,
                  background: '#f6e8d4',
                  borderRadius: 999,
                  padding: '1px 4px',
                  flexShrink: 0,
                }}
              >
                LOW
              </span>
            ) : (
              <span style={dotStyle('#d7d0bd')} />
            )}
          </div>
        ))}

        {/* Primary action hint */}
        <div
          style={{
            marginTop: 1,
            height: 12,
            borderRadius: 5,
            background: green,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Line w={44} h={3} color="rgba(255,255,255,0.9)" />
        </div>
      </div>

      {navRow([greenDeep, '#c7c1ae', '#c7c1ae', '#c7c1ae'], '#eae3d2', '#ffffff')}
    </PhoneShell>
  )
}

/* -------------------------------- I Need Notary -------------------------------- */
/* Intentional "in discovery" concept: booking-flow wireframe, not a built app.  */
export function NotaryPreview() {
  const purple = '#a371f7'
  const offwhite = '#e9e4f2'
  const muted = '#8a83a0'
  return (
    <PhoneShell
      backdrop="linear-gradient(155deg, #241f2e 0%, #16131c 100%)"
      frame="#0b0910"
      screen="#1b1822"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '7px 7px 5px',
        }}
      >
        <span style={dotStyle(purple)} />
        <Line w={50} h={4} color={offwhite} />
      </div>

      <div style={{ padding: '0 7px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {/* Booking flow stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {[true, false, false].map((active, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, flex: i < 2 ? 1 : 0 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: active ? purple : 'transparent',
                  border: `1.5px solid ${active ? purple : 'rgba(163,113,247,0.4)'}`,
                  flexShrink: 0,
                }}
              />
              {i < 2 && <Line w="100%" h={1.5} color="rgba(163,113,247,0.25)" />}
            </div>
          ))}
        </div>

        {/* Mini calendar grid (appointment picker concept) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 3,
          }}
        >
          {Array.from({ length: 15 }).map((_, i) => (
            <span
              key={i}
              style={{
                height: 6,
                borderRadius: 2,
                background: i === 7 ? purple : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>

        {/* Dashed "concept" placeholder to signal it is still in discovery */}
        <div
          style={{
            marginTop: 'auto',
            marginBottom: 8,
            border: '1px dashed rgba(163,113,247,0.5)',
            borderRadius: 6,
            padding: '6px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 6,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: muted,
              textTransform: 'uppercase',
            }}
          >
            Concept
          </span>
        </div>
      </div>
    </PhoneShell>
  )
}
