import type { Metadata } from 'next'
import { Heading, Text, Stack, Label } from '@primer/react'
import { GoalIcon, ChecklistIcon, LightBulbIcon } from '@primer/octicons-react'
import { Container } from '@/components/container'
import { LinkButton } from '@/components/link-button'

export const metadata: Metadata = {
  title: 'About Ahrok | Ahrok LLC',
  description:
    'Ahrok LLC is an independent software company focused on practical technology for real-world businesses, built around clarity, useful workflows, and operational discipline.',
}

const principles = [
  {
    icon: GoalIcon,
    title: 'Clarity over complexity',
    body: 'We design products that are direct and understandable, so the software gets out of the way of the work.',
  },
  {
    icon: ChecklistIcon,
    title: 'Useful workflows',
    body: 'Every feature should map to a real task someone needs to complete, not a line on a spec sheet.',
  },
  {
    icon: LightBulbIcon,
    title: 'Operational discipline',
    body: 'We build deliberately and validate problems before committing a product to the portfolio.',
  },
]

export default function AboutPage() {
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
          <div style={{ paddingTop: 80, paddingBottom: 64, maxWidth: 760 }}>
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
                About
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
                About Ahrok
              </Heading>
              <Text
                size="large"
                style={{
                  color: 'var(--fgColor-muted)',
                  fontSize: 18,
                  lineHeight: 1.5,
                }}
              >
                Ahrok LLC is an independent software company focused on
                practical technology for real-world businesses. We build
                products around clarity, useful workflows, and operational
                discipline&mdash;not unnecessary complexity.
              </Text>
              <Text size="medium" style={{ color: 'var(--fgColor-muted)' }}>
                Based in New York. Building for businesses everywhere.
              </Text>
            </Stack>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div style={{ paddingTop: 56, paddingBottom: 72 }}>
            <Stack direction="vertical" gap="spacious">
              <Heading
                as="h2"
                style={{
                  fontSize: 28,
                  letterSpacing: '-0.02em',
                  fontWeight: 600,
                }}
              >
                How we work
              </Heading>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 16,
                }}
              >
                {principles.map((p) => {
                  const Icon = p.icon
                  return (
                    <div
                      key={p.title}
                      style={{
                        border:
                          'var(--borderWidth-thin) solid var(--borderColor-default)',
                        borderRadius: 'var(--borderRadius-large)',
                        padding: 24,
                        backgroundColor: 'var(--bgColor-default)',
                        height: '100%',
                      }}
                    >
                      <Stack direction="vertical" gap="normal">
                        <span
                          aria-hidden="true"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--borderRadius-medium)',
                            backgroundColor: 'var(--ahrok-accent-muted)',
                          }}
                        >
                          <Icon size={20} fill="var(--ahrok-accent)" />
                        </span>
                        <Stack direction="vertical" gap="condensed">
                          <Heading as="h3" variant="small">
                            {p.title}
                          </Heading>
                          <Text
                            size="small"
                            style={{ color: 'var(--fgColor-muted)' }}
                          >
                            {p.body}
                          </Text>
                        </Stack>
                      </Stack>
                    </div>
                  )
                })}
              </div>
            </Stack>
          </div>
        </Container>
      </section>

      <section
        style={{
          borderTop: 'var(--borderWidth-thin) solid var(--borderColor-default)',
          backgroundColor: 'var(--bgColor-muted)',
        }}
      >
        <Container>
          <div
            style={{ paddingTop: 72, paddingBottom: 72, textAlign: 'center' }}
          >
            <Stack direction="vertical" gap="normal" align="center">
              <Heading
                as="h2"
                style={{
                  fontSize: 30,
                  letterSpacing: '-0.02em',
                  fontWeight: 600,
                  maxWidth: 560,
                }}
              >
                Want to talk about an idea?
              </Heading>
              <Text
                size="medium"
                style={{
                  color: 'var(--fgColor-muted)',
                  maxWidth: 480,
                  lineHeight: 1.5,
                }}
              >
                We are always interested in real operational problems worth
                solving.
              </Text>
              <div style={{ marginTop: 8 }}>
                <LinkButton
                  href="/contact"
                  variant="primary"
                  size="large"
                  trailingIcon="arrowRight"
                >
                  Contact Ahrok
                </LinkButton>
              </div>
            </Stack>
          </div>
        </Container>
      </section>
    </main>
  )
}
