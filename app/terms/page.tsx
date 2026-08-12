import type { Metadata } from 'next'
import Link from 'next/link'
import { Heading, Text, Stack } from '@primer/react'
import { ChevronRightIcon, LawIcon } from '@primer/octicons-react'
import { Container } from '@/components/container'
import { PrivacyHero, P } from '@/components/privacy/privacy-doc'

export const metadata: Metadata = {
  title: 'Terms Center | Ahrok LLC',
  description:
    'Terms of Use for Ahrok LLC products, including FieldRelay, iNeedNotary, and NYCMC Yard Sale.',
}

const terms = [
  {
    href: '/terms/fieldrelay',
    name: 'FieldRelay Terms of Use',
    description: 'Construction coordination and project-management platform.',
  },
  {
    href: '/terms/ineednotary',
    name: 'iNeedNotary Terms of Use',
    description: 'Remote notarization and apostille service platform.',
  },
  {
    href: '/terms/nycmc-yard-sale',
    name: 'NYCMC Yard Sale Terms of Use',
    description: 'Inventory, storefront, ordering, and event-pickup app.',
  },
]

export default function TermsCenterPage() {
  return (
    <main>
      <PrivacyHero
        eyebrow="Legal"
        title="Terms Center"
        intro="Ahrok LLC products serve different purposes, so each product has its own Terms of Use. Select the product you use to review the terms that apply."
        lastUpdated="August 11, 2026"
      />

      <Container narrow>
        <div style={{ paddingTop: 48, paddingBottom: 80 }}>
          <Stack direction="vertical" gap="spacious">
            <section aria-labelledby="terms-heading">
              <Heading
                as="h2"
                id="terms-heading"
                style={{
                  fontSize: 22,
                  letterSpacing: '-0.01em',
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                Product terms
              </Heading>
              <Stack direction="vertical" gap="normal">
                {terms.map((item) => (
                  <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
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
                          <Text weight="semibold" style={{ display: 'block' }}>
                            {item.name}
                          </Text>
                          <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
                            {item.description}
                          </Text>
                        </div>
                      </div>
                      <ChevronRightIcon size={16} fill="var(--fgColor-muted)" />
                    </div>
                  </Link>
                ))}
              </Stack>
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
                Legal contact
              </Heading>
              <P>
                Questions about these terms may be submitted through the{' '}
                <Link href="/contact" style={{ color: 'var(--ahrok-accent)' }}>
                  Ahrok contact page
                </Link>{' '}
                or by email at{' '}
                <Link href="mailto:hello@ahrok.site" style={{ color: 'var(--ahrok-accent)' }}>
                  hello@ahrok.site
                </Link>
                .
              </P>
            </section>
          </Stack>
        </div>
      </Container>
    </main>
  )
}
