import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useTranslations('common')

  return (
    <nav aria-label={t('breadcrumb')} className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-accent">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="text-foreground">
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight size={14} aria-hidden className="text-muted-foreground/50" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
