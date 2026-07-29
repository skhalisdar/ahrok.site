import { Heading, Text, Stack, Label } from '@primer/react'
import {
  ToolsIcon,
  PackageIcon,
  WorkflowIcon,
  GoalIcon,
} from '@primer/octicons-react'
import { Container } from '@/components/container'
import { ProductCard } from '@/components/product-card'
import { LinkButton } from '@/components/link-button'
import { products } from '@/lib/products'

const focusAreas = [
  {
    icon: ToolsIcon,
    title: 'Construction operations',
    body: 'Coordination tools that keep project teams, contractors, and field crews working from the same picture.',
  },
  {
    icon: PackageIcon,
    title: 'Inventory & resale',
    body: 'Lightweight tracking for resale operations and small-item businesses that outgrow spreadsheets.',
  },
  {
    icon: WorkflowIcon,
    title: 'Local & service workflows',
    body: 'Practical software for notary, pickup-and-delivery, and other service businesses with real moving parts.',
  },
  {
    icon: GoalIcon,
    title: 'Everyday business tools',
    body: 'Focused products that solve a clear operational problem instead of adding unnecessary complexity.',
  },
]

export default function HomePage() {
  const featured = products.slice(0, 3)

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          borderBottom:
            'var(--borderWidth-thin) solid var(--borderColor-default)',
          backgroundImage:
            'radial-gradient(60% 120% at 50% -10%, var(--ahrok-accent-muted), transparent 70%)',
        }}
      >
        <Container>
          <div style={{ paddingTop: 96, paddingBottom: 96, maxWidth: 820 }}>
            <Stack direction="vertical" gap="spacious">
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
                  Independent product studio
                </Label>
                <Heading
                  as="h1"
                  style={{
                    fontSize: 'clamp(36px, 6vw, 60px)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em',
                    fontWeight: 600,
                  }}
                >
                  Practical software for businesses that keep work moving.
                </Heading>
                <Text
                  size="large"
                  style={{
                    color: 'var(--fgColor-muted)',
                    fontSize: 20,
                    lineHeight: 1.5,
                    maxWidth: 640,
                  }}
                >
                  Ahrok LLC is an independent product studio building focused
                  software for construction operations, inventory, local
                  services, and everyday business workflows.
                </Text>
              </Stack>

              <Stack
                direction="horizontal"
                gap="normal"
                wrap="wrap"
                align="center"
              >
                <LinkButton
                  href="/products"
                  variant="primary"
                  size="large"
                  trailingIcon="arrowRight"
                >
                  Explore Our Products
                </LinkButton>
                <LinkButton href="/contact" variant="default" size="large">
                  Contact Ahrok
                </LinkButton>
              </Stack>
            </Stack>
          </div>
        </Container>
      </section>

      {/* Focus areas */}
      <section>
        <Container>
          <div style={{ paddingTop: 80, paddingBottom: 80 }}>
            <Stack direction="vertical" gap="spacious">
              <div style={{ maxWidth: 640 }}>
                <Stack direction="vertical" gap="condensed">
                  <Heading
                    as="h2"
                    style={{
                      fontSize: 32,
                      letterSpacing: '-0.02em',
                      fontWeight: 600,
                    }}
                  >
                    What we build around
                  </Heading>
                  <Text
                    size="medium"
                    style={{ color: 'var(--fgColor-muted)', lineHeight: 1.5 }}
                  >
                    Ahrok products are shaped by the realities of
                    operations-heavy small businesses and service work, not by
                    feature checklists.
                  </Text>
                </Stack>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 16,
                }}
              >
                {focusAreas.map((area) => {
                  const Icon = area.icon
                  return (
                    <div
                      key={area.title}
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
                            {area.title}
                          </Heading>
                          <Text
                            size="small"
                            style={{ color: 'var(--fgColor-muted)' }}
                          >
                            {area.body}
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

      {/* Featured products */}
      <section
        style={{
          borderTop: 'var(--borderWidth-thin) solid var(--borderColor-default)',
          backgroundColor: 'var(--bgColor-muted)',
        }}
      >
        <Container>
          <div style={{ paddingTop: 80, paddingBottom: 80 }}>
            <Stack direction="vertical" gap="spacious">
              <Stack
                direction="horizontal"
                justify="space-between"
                align="end"
                wrap="wrap"
                gap="normal"
              >
                <div style={{ maxWidth: 560 }}>
                  <Stack direction="vertical" gap="condensed">
                    <Heading
                      as="h2"
                      style={{
                        fontSize: 32,
                        letterSpacing: '-0.02em',
                        fontWeight: 600,
                      }}
                    >
                      A look at the portfolio
                    </Heading>
                    <Text
                      size="medium"
                      style={{ color: 'var(--fgColor-muted)', lineHeight: 1.5 }}
                    >
                      We are building a focused set of products. Some are in
                      active development, others are still in research and
                      discovery.
                    </Text>
                  </Stack>
                </div>
                <LinkButton
                  href="/products"
                  variant="invisible"
                  trailingIcon="arrowRight"
                >
                  View all products
                </LinkButton>
              </Stack>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 16,
                }}
              >
                {featured.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            </Stack>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section>
        <Container>
          <div
            style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}
          >
            <Stack direction="vertical" gap="normal" align="center">
              <Heading
                as="h2"
                style={{
                  fontSize: 32,
                  letterSpacing: '-0.02em',
                  fontWeight: 600,
                  maxWidth: 560,
                }}
              >
                Building deliberately, one useful product at a time.
              </Heading>
              <Text
                size="medium"
                style={{
                  color: 'var(--fgColor-muted)',
                  maxWidth: 520,
                  lineHeight: 1.5,
                }}
              >
                Have a product idea, partnership opportunity, or a question
                about what we are working on? We would like to hear from you.
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
