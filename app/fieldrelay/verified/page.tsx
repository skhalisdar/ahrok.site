import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'

export const metadata: Metadata = {
  title: 'Email Verified | FieldRelay',
  description: 'FieldRelay email verification confirmation.',
}

export default function FieldRelayVerifiedPage() {
  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '64px 20px' }}>
      <Container narrow>
        <section
          style={{
            maxWidth: 640,
            margin: '0 auto',
            border: '1px solid var(--borderColor-default)',
            borderRadius: 20,
            padding: 32,
            background: 'var(--bgColor-muted)',
          }}
        >
          <div style={{ color: '#e2632a', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            FieldRelay
          </div>
          <h1 style={{ marginTop: 12, fontSize: 38, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Your email is verified.
          </h1>
          <p style={{ marginTop: 16, color: 'var(--fgColor-muted)', fontSize: 17, lineHeight: 1.6 }}>
            Your FieldRelay account is ready. Return to the FieldRelay app and sign in with the email address and password you used during setup. Your company workspace and 7-day trial will be created when you finish onboarding.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 26 }}>
            <a
              href="fieldrelay://login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 46,
                padding: '0 18px',
                borderRadius: 10,
                background: '#e2632a',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Open FieldRelay
            </a>
            <Link
              href="/fieldrelay"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 46,
                padding: '0 18px',
                borderRadius: 10,
                border: '1px solid var(--borderColor-default)',
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              FieldRelay website
            </Link>
          </div>
          <p style={{ marginTop: 22, color: 'var(--fgColor-muted)', fontSize: 13, lineHeight: 1.5 }}>
            If the app does not open automatically, open FieldRelay manually and choose Sign In.
          </p>
        </section>
      </Container>
    </main>
  )
}
