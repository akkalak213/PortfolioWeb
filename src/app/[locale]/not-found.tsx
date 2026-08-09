import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buttonClasses } from '@/components/ui/Button'

export default async function NotFound() {
  const [t, tc] = await Promise.all([getTranslations('notFound'), getTranslations('common')])

  return (
    <section className="flex min-h-[60dvh] items-center py-20">
      <div className="container text-center">
        <p className="tabular font-display text-display-xl text-accent/25">404</p>
        <h1 className="mt-2 font-display text-display-sm text-balance">{t('title')}</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground text-pretty">{t('description')}</p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonClasses('primary', 'lg')}>
            {t('backHome')}
          </Link>
          <Link href="/work" className={buttonClasses('outline', 'lg')}>
            {tc('viewWork')}
          </Link>
        </div>
      </div>
    </section>
  )
}
