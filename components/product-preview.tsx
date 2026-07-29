// A crisp, vector mock of an app dashboard used as the card preview.
// Tinted by an accent color so each product reads as its own interface.
function Bar({
  w,
  h = 7,
  color = 'rgba(255,255,255,0.12)',
}: {
  w: number | string
  h?: number
  color?: string
}) {
  return (
    <div
      style={{
        width: typeof w === 'number' ? `${w}%` : w,
        height: h,
        borderRadius: 999,
        backgroundColor: color,
      }}
    />
  )
}

export function ProductPreview({ accent }: { accent: string }) {
  const accentSoft = `${accent}26`
  return (
    <div className="product-preview" aria-hidden="true">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: accent,
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.18)',
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.18)',
            }}
          />
          <div
            style={{
              marginLeft: 8,
              flex: 1,
              height: 12,
              borderRadius: 6,
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          />
        </div>

        {/* Body: sidebar + content */}
        <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
          <div
            style={{
              width: '30%',
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.04)',
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Bar w={70} color={accentSoft} />
            <Bar w={90} />
            <Bar w={60} />
            <Bar w={80} />
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
              }}
            >
              <Bar w={50} />
              <div
                style={{
                  height: 7,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '66%',
                    height: '100%',
                    backgroundColor: accent,
                  }}
                />
              </div>
            </div>
            <div
              style={{
                flex: 1,
                borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                justifyContent: 'center',
              }}
            >
              <Bar w={85} />
              <Bar w={70} />
              <Bar w={78} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
