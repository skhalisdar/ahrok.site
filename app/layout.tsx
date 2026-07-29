import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ChromeGate } from '@/components/chrome-gate'

export const metadata: Metadata = {
  title: 'Ahrok LLC | Practical Software for Real-World Businesses',
  description:
    'Ahrok LLC is an independent product studio building practical software for construction operations, inventory, local services, and business workflows.',
  keywords: [
    'product studio',
    'construction operations software',
    'inventory management',
    'small business software',
    'local services software',
  ],
}

export const viewport = {
  themeColor: '#0d1117',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      data-color-mode="dark"
      data-light-theme="light"
      data-dark-theme="dark"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Providers>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <ChromeGate>
              <SiteHeader />
            </ChromeGate>
            <div style={{ flex: 1 }}>{children}</div>
            <ChromeGate>
              <SiteFooter />
            </ChromeGate>
          </div>
        </Providers>
      </body>
    </html>
  )
}
