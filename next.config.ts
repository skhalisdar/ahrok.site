import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pg', 'node-app-attest', 'cbor', 'google-auth-library'],
  outputFileTracingIncludes: {
    '/kite/[[...path]]': ['./vendor/kite/www/**/*'],
    '/api/mobile/[...path]': ['./vendor/kite/www/**/*'],
  },
  compiler: {
    // Enable styled-components SSR support (Primer React uses styled-components)
    styledComponents: true,
  },
  transpilePackages: ['@primer/react', '@primer/octicons-react'],
}

export default nextConfig

