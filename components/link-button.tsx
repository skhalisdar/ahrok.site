'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@primer/react'
import { ArrowRightIcon } from '@primer/octicons-react'

const icons = {
  arrowRight: ArrowRightIcon,
} as const

type IconName = keyof typeof icons

export function LinkButton({
  href,
  children,
  variant = 'default',
  size = 'medium',
  leadingIcon,
  trailingIcon,
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'default' | 'invisible' | 'danger'
  size?: 'small' | 'medium' | 'large'
  leadingIcon?: IconName
  trailingIcon?: IconName
}) {
  return (
    <Button
      as={Link}
      href={href}
      variant={variant}
      size={size}
      leadingVisual={leadingIcon ? icons[leadingIcon] : undefined}
      trailingVisual={trailingIcon ? icons[trailingIcon] : undefined}
    >
      {children}
    </Button>
  )
}
