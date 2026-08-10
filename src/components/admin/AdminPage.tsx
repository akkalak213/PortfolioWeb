import Link from 'next/link'
import type { ReactNode } from 'react'
import { buttonClasses } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: { href: string; label: string }
}) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className={buttonClasses('primary', 'md')}>
          {action.label}
        </Link>
      )}
    </header>
  )
}

export function AdminCard({
  title,
  description,
  children,
  className,
}: {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border border-border bg-surface p-5 md:p-6', className)}>
      {title && <h2 className="font-medium">{title}</h2>}
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className={cn(title && 'mt-5')}>{children}</div>
    </section>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
      {children}
    </p>
  )
}

export function StatusPill({
  children,
  tone = 'muted',
}: {
  children: ReactNode
  tone?: 'muted' | 'accent' | 'success' | 'warning'
}) {
  const tones = {
    muted: 'bg-muted text-muted-foreground',
    accent: 'bg-accent-subtle text-accent',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
  }
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  )
}
