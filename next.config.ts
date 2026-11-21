import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
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

