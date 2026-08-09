import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type BadgeProps = ComponentProps<'span'> & {
  variant?: 'default' | 'accent' | 'outline'
}

const variants = {
  default: 'bg-muted text-muted-foreground',
  accent: 'bg-accent-subtle text-accent',
  outline: 'border border-border text-muted-foreground',
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-tight',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
