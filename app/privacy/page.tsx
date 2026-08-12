import type { Metadata } from 'next'
import Link from 'next/link'
import { Heading, Text, Stack } from '@primer/react'
import { ChevronRightIcon, LawIcon } from '@primer/octicons-react'
import { Container } from '@/components/container'
import { PrivacyHero, P } from '@/components/privacy/privacy-doc'

export const metadata: Metadata = {
  title: 'Privacy Center | Ahrok LLC',
  description:
    'The Ahrok LLC Privacy Center explains how privacy information applies to Ahrok and its products, with links to product-specific privacy policies.',
}

const policies = [
  {
    href: '/privacy/fieldrelay',
    name: 'FieldRelay Privacy Policy',
    description: 'Construction coordination and project-management platform.',
  },
  {
    href: '/privacy/ineednotary',
    name: 'iNeedNotary Privacy Policy',
    description: 'Remote notarization and apostille service platform.',
  },
  {
    href: '/privacy/nycmc-yard-sale',
    name: 'NYCMC Yard Sale Privacy Policy',
    description: 'Inventory, storefront, ordering, and event-pickup app.',
  },
]

export default function PrivacyCenterPage() {
  return (
    <main>
      <PrivacyHero
        eyebrow="Privacy"
        title="Privacy Center"
        intro="Ahrok LLC develops practical software products for real-world businesses. Each product has its own privacy policy because the information it handles and the services it provides are different."
        lastUpdated="August 11, 2026"
      />

      <Container narrow>
        <div style={{ paddingTop: 48, paddingBottom: 80 }}>
          <Stack direction="vertical" gap="spacious">
            <section aria-labelledby="policies-heading">
              <Heading
                as="h2"
                id="policies-heading"
                style={{
                  fontSize: 22,
                  letterSpacing: '-0.01em',
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                Product privacy policies
              </Heading>
              <Stack direction="vertical" gap="normal">
                {policies.map((policy) => (
                  <Link
                    key={policy.href}
                    href={policy.href}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        border:
                          'var(--borderWidth-thin) solid var(--borderColor-default)',
                        borderRadius: 'var(--borderRadius-large, 12px)',
                        backgroundColor: 'var(--bgColor-muted)',
                        padding: 20,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            borderRadius: 'var(--borderRadius-medium, 8px)',
                            backgroundColor: 'var(--ahrok-accent-muted)',
                          }}
                        >
                          <LawIcon size={20} fill="var(--ahrok-accent)" />
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <Text
                            weight="semibold"
                            style={{ display: 'block', color: 'var(--fgColor-default)' }}
                          >
                            {policy.name}
                          </Text>
                          <Text
                            size="small"
                            style={{ color: 'var(--fgColor-muted)' }}
                          >
                            {policy.description}
                          </Text>
                        </div>
                      </div>
                      <ChevronRightIcon size={16} fill="var(--fgColor-muted)" />
                    </div>
                  </Link>
                ))}
              </Stack>
            </section>

            <section aria-labelledby="scope-heading">
              <Heading
                as="h2"
                id="scope-heading"
                style={{
                  fontSize: 22,
                  letterSpacing: '-0.01em',
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                How these policies apply
              </Heading>
              <P>
                The product-specific policy for the Ahrok product you use controls
                how personal information is handled for that product. If a product
                links to a third-party service, that provider may also have its own
                privacy policy.
              </P>
            </section>

            <section aria-labelledby="contact-heading">
              <Heading
                as="h2"
                id="contact-heading"
                style={{
                  fontSize: 22,
                  letterSpacing: '-0.01em',
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                Privacy contact
              </Heading>
              <P>
                Contact{' '}
                <Link
                  href="mailto:privacy@ahrok.site"
                  style={{ color: 'var(--ahrok-accent)' }}
                >
                  privacy@ahrok.site
                </Link>{' '}
                with privacy questions, access requests, or deletion requests.
              </P>
            </section>
          </Stack>
        </div>
      </Container>
    </main>
  )
}
