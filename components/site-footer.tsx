import Link from 'next/link'
import { Stack, Text } from '@primer/react'

const columns = [
  {
    title: 'Explore',
    links: [
      { href: '/products', label: 'Products' },
      { href: '/roadmap', label: 'Roadmap' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: 'var(--borderWidth-thin) solid var(--borderColor-default)',
        backgroundColor: 'var(--bgColor-muted)',
        marginTop: 64,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        <Stack
          direction="horizontal"
          justify="space-between"
          gap="spacious"
          wrap="wrap"
        >
          <Stack direction="vertical" gap="condensed" style={{ maxWidth: 360 }}>
            <Stack direction="horizontal" gap="condensed" align="center">
              <img
                src="/brand/ahrok-logo.png"
                alt="Ahrok LLC logo"
                width={24}
                height={24}
                style={{ display: 'block' }}
              />
              <span style={{ fontWeight: 600 }}>Ahrok LLC</span>
            </Stack>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              Practical software for businesses that keep work moving.
            </Text>
            <Link
              href="mailto:hello@ahrok.site"
              style={{
                textDecoration: 'none',
                fontSize: 14,
                color: 'var(--ahrok-accent)',
              }}
            >
              hello@ahrok.site
            </Link>
          </Stack>

          <Stack direction="horizontal" gap="spacious" wrap="wrap">
            {columns.map((col) => (
              <Stack key={col.title} direction="vertical" gap="condensed">
                <Text
                  size="small"
                  weight="semibold"
                  style={{ color: 'var(--fgColor-default)' }}
                >
                  {col.title}
                </Text>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      fontSize: 14,
                      color: 'var(--fgColor-muted)',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>

        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop:
              'var(--borderWidth-thin) solid var(--borderColor-default)',
          }}
        >
          <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
            © 2026 Ahrok LLC
          </Text>
        </div>
      </div>
    </footer>
  )
}
