import type { Metadata } from 'next'
import { YardSaleApp } from '@/components/demos/nycmc/yard-sale-app'

export const metadata: Metadata = {
  title: 'NYCMC Yard Sale — Interactive Demo',
  description:
    'Explore a working preview of the NYCMC Yard Sale inventory app. Add items, track stock, and record sales — all saved privately in your browser.',
  robots: { index: false, follow: false },
}

export default function NycmcYardSaleDemoPage() {
  return <YardSaleApp />
}
