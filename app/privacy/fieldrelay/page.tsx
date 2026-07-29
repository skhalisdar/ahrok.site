import type { Metadata } from 'next'
import Link from 'next/link'
import { Text } from '@primer/react'
import { AlertIcon } from '@primer/octicons-react'
import { Container } from '@/components/container'
import {
  PrivacyHero,
  PrivacyBody,
  P,
  type PrivacySection,
} from '@/components/privacy/privacy-doc'

export const metadata: Metadata = {
  title: 'FieldRelay Privacy Policy | Ahrok LLC',
  description:
    'Privacy policy for FieldRelay, a construction coordination platform in development by Ahrok LLC. This policy will be finalized before public release.',
}

const detailsNote =
  'Details will be added before public release based on the final FieldRelay feature set and service providers.'

const sectionTitles = [
  ['information-collected', 'Information We Collect'],
  ['how-used', 'How We Use Information'],
  ['project-team-data', 'Project and Team Data'],
  ['photos-documents', 'Photos and Documents'],
  ['service-providers', 'Service Providers'],
  ['retention-deletion', 'Retention and Deletion'],
  ['childrens-privacy', "Children's Privacy"],
] as const

const sections: PrivacySection[] = [
  ...sectionTitles.map(([id, title]) => ({
    id,
    title,
    content: <P>{detailsNote}</P>,
  })),
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <P>
        You may contact{' '}
        <Link
          href="mailto:privacy@ahrok.site"
          style={{ color: 'var(--ahrok-accent)' }}
        >
          privacy@ahrok.site
        </Link>{' '}
        with privacy questions or requests.
      </P>
    ),
  },
]

export default function FieldRelayPrivacyPage() {
  return (
    <main>
      <PrivacyHero
        eyebrow="Product Privacy Policy"
        title="FieldRelay Privacy Policy"
        intro="FieldRelay is a construction coordination platform in active development. This page outlines the structure of its privacy policy."
      />
      <Container>
        <div style={{ paddingTop: 32 }}>
          <div
            role="note"
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              border:
                'var(--borderWidth-thin) solid var(--ahrok-accent-border)',
              backgroundColor: 'var(--ahrok-accent-muted)',
              borderRadius: 'var(--borderRadius-large, 12px)',
              padding: 16,
            }}
          >
            <span style={{ flexShrink: 0, marginTop: 2 }}>
              <AlertIcon size={18} fill="var(--ahrok-accent)" />
            </span>
            <Text style={{ lineHeight: 1.55 }}>
              FieldRelay is currently in development. This policy will be
              finalized and updated before public release to reflect the app&apos;s
              actual data practices.
            </Text>
          </div>
        </div>
      </Container>
      <div style={{ paddingTop: 8 }}>
        <PrivacyBody sections={sections} />
      </div>
    </main>
  )
}
