import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // COMPASS retains its independent browser origin. Kite now uses /kite on root.
  async redirects() {
    if (process.env.AHROK_SUBDOMAIN_CUTOVER !== 'enabled') return []
    return [
      { source: '/nycmccompass', destination: 'https://compass.ahrok.site/nycmccompass', permanent: false },
    ]
  },
  // The Kite application stays in its own Vercel project and Neon database.
  // Proxy only its dedicated URL prefix; never import Kite backend code into root.
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/kite', destination: 'https://kite-five-wine.vercel.app/kite/' },
        { source: '/kite/:path*', destination: 'https://kite-five-wine.vercel.app/kite/:path*' },
      ],
    }
  },
  compiler: {
    // Enable styled-components SSR support (Primer React uses styled-components)
    styledComponents: true,
  },
  transpilePackages: ['@primer/react', '@primer/octicons-react'],
}

export default nextConfig

