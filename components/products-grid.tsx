'use client'

import { useState } from 'react'
import { Button, Stack } from '@primer/react'
import { ProductCard } from '@/components/product-card'
import { products, type ProductStatus } from '@/lib/products'

type Filter = 'All' | ProductStatus

const filters: Filter[] = [
  'All',
  'In Development',
  'Pre-Release',
  'In Discovery',
  'Product Pipeline',
]

export function ProductsGrid() {
  const [filter, setFilter] = useState<Filter>('All')

  const visible =
    filter === 'All'
      ? products
      : products.filter((p) => p.status === filter)

  return (
    <Stack direction="vertical" gap="spacious">
      <Stack direction="horizontal" gap="condensed" wrap="wrap" align="center">
        {filters.map((f) => (
          <Button
            key={f}
            size="small"
            variant={filter === f ? 'primary' : 'default'}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </Stack>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {visible.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </Stack>
  )
}
