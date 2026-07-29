'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button, Stack } from '@primer/react'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bgColor-default)',
        borderBottom:
          'var(--borderWidth-thin) solid var(--borderColor-default)',
      }}
    >
      <nav
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '12px 24px',
        }}
      >
        <Stack direction="horizontal" align="center" justify="space-between">
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              color: 'var(--fgColor-default)',
            }}
          >
            <Stack direction="horizontal" gap="condensed" align="center">
              <img
                src="/brand/ahrok-logo.png"
                alt="Ahrok LLC logo"
                width={28}
                height={28}
                style={{ display: 'block' }}
              />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 'var(--text-title-size-medium, 16px)',
                  letterSpacing: '-0.01em',
                }}
              >
                Ahrok
                <span style={{ color: 'var(--fgColor-muted)' }}> LLC</span>
              </span>
            </Stack>
          </Link>

          <Stack
            direction="horizontal"
            gap="normal"
            align="center"
            style={{ display: 'flex' }}
          >
            <Stack
              direction="horizontal"
              gap="spacious"
              align="center"
              wrap="wrap"
            >
              {navItems.map((item) => {
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    style={{
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: active ? 600 : 400,
                      color: active
                        ? 'var(--fgColor-default)'
                        : 'var(--fgColor-muted)',
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </Stack>
            <Button as={Link} href="/contact" variant="primary" size="small">
              Contact Ahrok
            </Button>
          </Stack>
        </Stack>
      </nav>
    </header>
  )
}
