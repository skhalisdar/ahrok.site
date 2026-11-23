import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disabled by default: redirect only after both independent services are proven ready.
  // Redirect only landing pages. Never redirect legacy API POSTs across origins.
  async redirects() {
    if (process.env.AHROK_SUBDOMAIN_CUTOVER !== 'enabled') return []
    return [
      { source: '/kite', destination: 'https://kite.ahrok.site/kite/', permanent: false },
      { source: '/nycmccompass', destination: 'https://compass.ahrok.site/nycmccompass', permanent: false },
    ]
  },
  compiler: {
    // Enable styled-components SSR support (Primer React uses styled-components)
    styledComponents: true,
  },
  transpilePackages: ['@primer/react', '@primer/octicons-react'],
}

export default nextConfig

