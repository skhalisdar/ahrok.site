import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disabled by default: redirect only after both independent services are proven ready.
  // Paths remain compatible on the new browser origins during the first cutover.
  async redirects() {
    if (process.env.AHROK_SUBDOMAIN_CUTOVER !== 'enabled') return []
    return [
      { source: '/kite', destination: 'https://kite.ahrok.site/kite/', permanent: false },
      { source: '/kite/:path*', destination: 'https://kite.ahrok.site/kite/:path*', permanent: false },
      { source: '/nycmccompass', destination: 'https://compass.ahrok.site/nycmccompass', permanent: false },
      { source: '/nycmccompass/:path*', destination: 'https://compass.ahrok.site/nycmccompass/:path*', permanent: false },
    ]
  },
  // COMPASS runs as a separate Vercel project; forward only its URL prefix.
  // beforeFiles takes precedence over the legacy local COMPASS route.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/nycmccompass', destination: 'https://nycmc-compass.vercel.app/nycmccompass' },
        { source: '/nycmccompass/:path*', destination: 'https://nycmc-compass.vercel.app/nycmccompass/:path*' },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
  serverExternalPackages: ['pg', 'node-app-attest', 'cbor', 'google-auth-library', 'pdfkit'],
  outputFileTracingIncludes: {
    '/nycmccompass/[[...path]]': ['./vendor/compass/www/**/*'],
    '/kite/[[...path]]': ['./vendor/kite/www/**/*', './vendor/kite/fonts/**/*', './vendor/kite/report-assets/**/*'],
    '/api/mobile/[...path]': ['./vendor/kite/www/**/*', './vendor/kite/fonts/**/*', './vendor/kite/report-assets/**/*'],
  },
  compiler: {
    // Enable styled-components SSR support (Primer React uses styled-components)
    styledComponents: true,
  },
  transpilePackages: ['@primer/react', '@primer/octicons-react'],
}

export default nextConfig

