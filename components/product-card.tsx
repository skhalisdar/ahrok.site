import Link from 'next/link'
import { Heading, Text, Stack, Label, Button } from '@primer/react'
import type { LabelColorOptions } from '@primer/react'
import type { Product } from '@/lib/products'
import { ProductPreview } from '@/components/product-preview'
import { LinkButton } from '@/components/link-button'

const statusVariant: Record<Product['status'], LabelColorOptions> = {
  'In Development': 'accent',
  'Pre-Release': 'success',
  'In Discovery': 'attention',
  'Product Pipeline': 'secondary',
}

export function ProductCard({ product }: { product: Product }) {
  const pipeline = product.status === 'Product Pipeline'
  const hasPreview = Boolean(product.previewAccent)
  const accent = product.previewAccent ?? '#e2632a'
  const hasActions =
    Boolean(product.ctaLabel) || Boolean(product.learnMoreHref)

  return (
    <article
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: pipeline
          ? 'var(--bgColor-muted)'
          : 'var(--bgColor-default)',
        border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
        borderRadius: 'var(--borderRadius-large)',
        boxShadow: 'var(--shadow-resting-small)',
      }}
    >
      {hasPreview && (
        <div style={{ position: 'relative' }}>
          <ProductPreview accent={accent} />
          {product.demoBadge && (
            <span
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                backgroundColor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: 999,
                padding: '4px 10px',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: accent,
                }}
              />
              {product.demoBadge}
            </span>
          )}
        </div>
      )}

      <div
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          flex: 1,
        }}
      >
        <Stack direction="vertical" gap="normal">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Label variant="secondary">{product.category}</Label>
            <Label variant={statusVariant[product.status]}>
              {product.status}
            </Label>
          </Stack>

          <Stack direction="vertical" gap="condensed">
            <Heading as="h3" variant="small">
              {product.name}
            </Heading>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              {product.description}
            </Text>
          </Stack>
        </Stack>

        {hasActions && (
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            {product.ctaLabel && product.ctaHref && !product.ctaComingSoon && (
              <LinkButton
                href={product.ctaHref}
                variant="primary"
                trailingIcon="arrowRight"
              >
                {product.ctaLabel}
              </LinkButton>
            )}

            {product.ctaLabel && product.ctaComingSoon && (
              <Button variant="default" disabled>
                {product.ctaLabel} — soon
              </Button>
            )}

            {product.learnMoreHref && (
              <Link
                href={product.learnMoreHref}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--fgColor-accent)',
                  textDecoration: 'none',
                }}
              >
                Learn more
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
