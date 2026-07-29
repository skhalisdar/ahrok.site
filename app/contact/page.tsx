import type { Metadata } from 'next'
import { Heading, Text, Stack, Label, Link } from '@primer/react'
import { MailIcon, LocationIcon } from '@primer/octicons-react'
import { Container } from '@/components/container'
import { ContactForm } from '@/components/contact-form'

export const metadata: Metadata = {
  title: 'Contact | Ahrok LLC',
  description:
    'Have a product idea, partnership opportunity, or question about an Ahrok product? Reach out at hello@ahrok.site.',
}

const details = [
  {
    icon: MailIcon,
    title: 'Email',
    body: 'hello@ahrok.site',
    href: 'mailto:hello@ahrok.site',
  },
  {
    icon: LocationIcon,
    title: 'Based in',
    body: 'New York. Building for businesses everywhere.',
  },
]

export default function ContactPage() {
  return (
    <main>
      <section
        style={{
          borderBottom:
            'var(--borderWidth-thin) solid var(--borderColor-default)',
          backgroundImage:
            'radial-gradient(60% 120% at 50% -10%, var(--ahrok-accent-muted), transparent 70%)',
        }}
      >
        <Container>
          <div style={{ paddingTop: 80, paddingBottom: 64, maxWidth: 680 }}>
            <Stack direction="vertical" gap="normal">
              <Label
                variant="secondary"
                size="large"
                style={{
                  alignSelf: 'start',
                  borderColor: 'var(--ahrok-accent-border)',
                  color: 'var(--ahrok-accent)',
                }}
              >
                Contact
              </Label>
              <Heading
                as="h1"
                style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  fontWeight: 600,
                }}
              >
                Start a conversation.
              </Heading>
              <Text
                size="large"
                style={{
                  color: 'var(--fgColor-muted)',
                  fontSize: 18,
                  lineHeight: 1.5,
                }}
              >
                Have a product idea, partnership opportunity, or question about
                an Ahrok product? Reach out.
              </Text>
            </Stack>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div style={{ paddingTop: 48, paddingBottom: 80 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)',
                gap: 32,
                alignItems: 'start',
              }}
            >
              {/* Details */}
              <Stack direction="vertical" gap="normal">
                {details.map((d) => {
                  const Icon = d.icon
                  return (
                    <div
                      key={d.title}
                      style={{
                        border:
                          'var(--borderWidth-thin) solid var(--borderColor-default)',
                        borderRadius: 'var(--borderRadius-large)',
                        padding: 20,
                      }}
                    >
                      <Stack direction="horizontal" gap="normal" align="center">
                        <span
                          aria-hidden="true"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 36,
                            height: 36,
                            borderRadius: 'var(--borderRadius-medium)',
                            backgroundColor: 'var(--ahrok-accent-muted)',
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={18} fill="var(--ahrok-accent)" />
                        </span>
                        <div
                          style={{ display: 'flex', flexDirection: 'column' }}
                        >
                          <Text size="small" weight="semibold">
                            {d.title}
                          </Text>
                          {d.href ? (
                            <Link href={d.href} style={{ fontSize: 14 }}>
                              {d.body}
                            </Link>
                          ) : (
                            <Text
                              size="small"
                              style={{ color: 'var(--fgColor-muted)' }}
                            >
                              {d.body}
                            </Text>
                          )}
                        </div>
                      </Stack>
                    </div>
                  )
                })}
              </Stack>

              {/* Form */}
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </main>
  )
}
