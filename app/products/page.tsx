import type { Metadata } from 'next'
import { Heading, Text, Stack, Label } from '@primer/react'
import { Container } from '@/components/container'
import { ProductsGrid } from '@/components/products-grid'

export const metadata: Metadata = {
  title: 'Products in Development | Ahrok LLC',
  description:
    'Ahrok is building a focused portfolio of practical software products for construction operations, inventory, notary workflows, and local services.',
}

export default function ProductsPage() {
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
                Portfolio
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
                Products in Development
              </Heading>
              <Text
                size="large"
                style={{
                  color: 'var(--fgColor-muted)',
                  fontSize: 18,
                  lineHeight: 1.5,
                }}
              >
                Ahrok is building a focused portfolio of practical software
                products. Some are actively being developed, while others are
                in research and product-discovery stages.
              </Text>
            </Stack>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div style={{ paddingTop: 48, paddingBottom: 80 }}>
            <ProductsGrid />
          </div>
        </Container>
      </section>
    </main>
  )
}
