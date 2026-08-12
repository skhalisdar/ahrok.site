import type { ReactNode } from 'react'
import { Heading, Text, Stack, Label } from '@primer/react'
import { Container } from '@/components/container'

export interface PrivacySection {
  id: string
  title: string
  content: ReactNode
}

export function PrivacyHero({
  eyebrow,
  title,
  intro,
  lastUpdated = 'June 26, 2026',
}: {
  eyebrow: string
  title: string
  intro: ReactNode
  lastUpdated?: string
}) {
  return (
    <section
      style={{
        borderBottom:
          'var(--borderWidth-thin) solid var(--borderColor-default)',
        backgroundImage:
          'radial-gradient(60% 120% at 50% -10%, var(--ahrok-accent-muted), transparent 70%)',
      }}
    >
      <Container narrow>
        <div style={{ paddingTop: 80, paddingBottom: 48 }}>
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
              {eyebrow}
            </Label>
            <Heading
              as="h1"
              style={{
                fontSize: 'clamp(30px, 5vw, 44px)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                fontWeight: 600,
                textWrap: 'balance',
              }}
            >
              {title}
            </Heading>
            <Text
              size="large"
              style={{
                color: 'var(--fgColor-muted)',
                fontSize: 18,
                lineHeight: 1.55,
              }}
            >
              {intro}
            </Text>
            <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>
              Last updated: {lastUpdated}.
            </Text>
          </Stack>
        </div>
      </Container>
    </section>
  )
}

export function TableOfContents({ sections }: { sections: PrivacySection[] }) {
  return (
    <nav
      aria-label="Table of contents"
      style={{
        border: 'var(--borderWidth-thin) solid var(--borderColor-default)',
        borderRadius: 'var(--borderRadius-large, 12px)',
        backgroundColor: 'var(--bgColor-muted)',
        padding: 20,
        position: 'sticky',
        top: 88,
      }}
    >
      <Text
        size="small"
        weight="semibold"
        style={{ display: 'block', marginBottom: 12 }}
      >
        On this page
      </Text>
      <Stack direction="vertical" gap="condensed">
        {sections.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{
              textDecoration: 'none',
              fontSize: 14,
              lineHeight: 1.4,
              color: 'var(--fgColor-muted)',
            }}
          >
            {i + 1}. {s.title}
          </a>
        ))}
      </Stack>
    </nav>
  )
}

export function PrivacyBody({
  sections,
  children,
}: {
  sections: PrivacySection[]
  children?: ReactNode
}) {
  return (
    <Container>
      <div className="privacy-layout">
        <div className="privacy-toc">
          <TableOfContents sections={sections} />
        </div>
        <div style={{ minWidth: 0, maxWidth: 720 }}>
          <Stack direction="vertical" gap="spacious">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                style={{ scrollMarginTop: 88 }}
                aria-labelledby={`${s.id}-heading`}
              >
                <Heading
                  as="h2"
                  id={`${s.id}-heading`}
                  style={{
                    fontSize: 22,
                    letterSpacing: '-0.01em',
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  {i + 1}. {s.title}
                </Heading>
                <Stack direction="vertical" gap="normal">
                  {s.content}
                </Stack>
              </section>
            ))}
          </Stack>
          {children}
        </div>
      </div>
    </Container>
  )
}

export function P({ children }: { children: ReactNode }) {
  return (
    <Text
      as="p"
      style={{
        color: 'var(--fgColor-default)',
        fontSize: 16,
        lineHeight: 1.65,
      }}
    >
      {children}
    </Text>
  )
}

export function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            color: 'var(--fgColor-default)',
            fontSize: 16,
            lineHeight: 1.6,
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}
