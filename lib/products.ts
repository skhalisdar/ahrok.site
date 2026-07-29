export type ProductStatus =
  | 'In Development'
  | 'Pre-Release'
  | 'In Discovery'
  | 'Product Pipeline'

export type DemoBadge =
  | 'Interactive Demo'
  | 'Preview'
  | 'In Development'
  | 'Coming Soon'

export interface Product {
  slug: string
  name: string
  category: string
  description: string
  status: ProductStatus
  /** Accent color used to tint the card's mock app preview. */
  previewAccent?: string
  /** Short badge shown over the preview (e.g. "Interactive Demo"). */
  demoBadge?: DemoBadge
  /** Primary call-to-action label for the product showcase. */
  ctaLabel?: string
  /** Where the primary CTA links. Omit when the demo is not live yet. */
  ctaHref?: string
  /** When true, the CTA renders as a disabled "coming soon" affordance. */
  ctaComingSoon?: boolean
  /** Secondary "Learn more" destination. */
  learnMoreHref?: string
}

export const products: Product[] = [
  {
    slug: 'fieldrelay',
    name: 'FieldRelay',
    category: 'Construction Operations',
    description:
      'A construction coordination platform designed to help project teams, contractors, clients, and field crews stay aligned.',
    status: 'In Development',
    previewAccent: '#e2632a',
    demoBadge: 'Interactive Demo',
    ctaLabel: 'Explore Interactive Demo',
    ctaHref: '/demos/fieldrelay',
    learnMoreHref: '/fieldrelay',
  },
  {
    slug: 'nycmc-yard-sale',
    name: 'NYCMC Yard Sale',
    category: 'Inventory Management',
    description:
      'A simple inventory and sales-tracking tool for resale operations, yard sales, and small-item businesses.',
    status: 'Pre-Release',
    previewAccent: '#3fb950',
    demoBadge: 'Interactive Demo',
    ctaLabel: 'Try Inventory Demo',
    ctaHref: '/demos/nycmc-yard-sale',
    learnMoreHref: '/roadmap',
  },
  {
    slug: 'i-need-notary',
    name: 'I Need Notary Platform',
    category: 'Notary & Document Workflow',
    description:
      'A future platform for organizing notary requests, document workflows, appointments, and client communication.',
    status: 'In Discovery',
    previewAccent: '#a371f7',
    demoBadge: 'Coming Soon',
    ctaLabel: 'Preview Booking Flow',
    ctaComingSoon: true,
    learnMoreHref: '/roadmap',
  },
  {
    slug: 'purefolds-operations',
    name: 'Purefolds Operations',
    category: 'Service Business Operations',
    description:
      'A future operations tool for pickup-and-delivery service businesses, workflow visibility, and customer coordination.',
    status: 'In Discovery',
  },
  {
    slug: 'upcoming-05',
    name: 'Upcoming Product 05',
    category: 'Roadmap',
    description:
      'A future Ahrok product currently being evaluated and developed.',
    status: 'Product Pipeline',
  },
  {
    slug: 'upcoming-06',
    name: 'Upcoming Product 06',
    category: 'Roadmap',
    description:
      'A future Ahrok product currently being evaluated and developed.',
    status: 'Product Pipeline',
  },
  {
    slug: 'upcoming-07',
    name: 'Upcoming Product 07',
    category: 'Roadmap',
    description:
      'A future Ahrok product currently being evaluated and developed.',
    status: 'Product Pipeline',
  },
  {
    slug: 'upcoming-08',
    name: 'Upcoming Product 08',
    category: 'Roadmap',
    description:
      'A future Ahrok product currently being evaluated and developed.',
    status: 'Product Pipeline',
  },
  {
    slug: 'upcoming-09',
    name: 'Upcoming Product 09',
    category: 'Roadmap',
    description:
      'A future Ahrok product currently being evaluated and developed.',
    status: 'Product Pipeline',
  },
  {
    slug: 'upcoming-10',
    name: 'Upcoming Product 10',
    category: 'Roadmap',
    description:
      'A future Ahrok product currently being evaluated and developed.',
    status: 'Product Pipeline',
  },
]
