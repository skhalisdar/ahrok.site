import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
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

