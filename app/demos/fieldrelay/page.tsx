import type { Metadata } from 'next'
import { FieldRelayDemo } from '@/components/demos/fieldrelay/demo-app'

export const metadata: Metadata = {
  title: 'FieldRelay Interactive Demo | Ahrok LLC',
  description:
    'Explore a private, sample-data demo of FieldRelay — the construction coordination workspace. Create projects and tasks, track progress, and add notes. No sign-in required.',
  robots: { index: false, follow: false },
}

export default function FieldRelayDemoPage() {
  return <FieldRelayDemo />
}
