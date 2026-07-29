import type { Metadata } from 'next'
import { Heading, Text, Stack, Label } from '@primer/react'
import { RocketIcon, TelescopeIcon, HourglassIcon } from '@primer/octicons-react'
import { Container } from '@/components/container'

export const metadata: Metadata = {
  title: 'Roadmap | Ahrok LLC',
  description:
    'How Ahrok builds: products in active development now, defined next through research and prototypes, and planned later for real-world business operations.',
}

const phases = [
  {
    key: 'Now',
    icon: RocketIcon,
    title: 'Now',
    body: 'Products in active development and pre-release testing.',
  },
  {
    key: 'Next',
    icon: TelescopeIcon,
    title: 'Next',
    body: 'Products being defined through research, prototype work, and customer feedback.',
  },
  {
    key: 'Later',
    icon: HourglassIcon,
    title: 'Later',
    body: 'Additional tools for real-world business operations and local service workflows.',
  },
]

export default function RoadmapPage() {
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
                Roadmap
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
                Built with intention.
              </Heading>
              <Text
                size="large"
                style={{
                  color: 'var(--fgColor-muted)',
                  fontSize: 18,
                  lineHeight: 1.5,
                }}
              >
                We move products through clear stages, from active build work to
                early research. Nothing ships before it earns its place.
              </Text>
            </Stack>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div style={{ paddingTop: 56, paddingBottom: 56 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 16,
              }}
            >
              {phases.map((phase) => {
                const Icon = phase.icon
                return (
                  <div
                    key={phase.key}
                    style={{
                      border:
                        'var(--borderWidth-thin) solid var(--borderColor-default)',
                      borderRadius: 'var(--borderRadius-large)',
                      padding: 28,
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
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--borderRadius-medium)',
                          backgroundColor: 'var(--ahrok-accent-muted)',
                        }}
                      >
                        <Icon size={22} fill="var(--ahrok-accent)" />
                      </span>
                      <Stack direction="vertical" gap="condensed">
                        <Heading as="h2" variant="small">
                          {phase.title}
                        </Heading>
                        <Text
                          size="medium"
                          style={{
                            color: 'var(--fgColor-muted)',
                            lineHeight: 1.5,
                          }}
                        >
                          {phase.body}
                        </Text>
                      </Stack>
                    </Stack>
                  </div>
                )
              })}
            </div>
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
            <Text
              as="p"
              style={{
                fontSize: 'clamp(22px, 3.5vw, 30px)',
                lineHeight: 1.35,
                letterSpacing: '-0.01em',
                fontWeight: 500,
                maxWidth: 760,
                marginLeft: 'auto',
                marginRight: 'auto',
                textWrap: 'balance',
              }}
            >
              Ahrok is building deliberately. Every product must solve a clear
              operational problem before it earns a place in the portfolio.
            </Text>
          </div>
        </Container>
      </section>
    </main>
  )
}
