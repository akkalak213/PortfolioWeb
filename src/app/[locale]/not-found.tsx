import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buttonClasses } from '@/components/ui/Button'

export default async function LocaleNotFound() {
  const [t, tc, tNav] = await Promise.all([
    getTranslations('notFound'),
    getTranslations('common'),
    getTranslations('nav'),
  ])

  return (
    <div className="container flex min-h-[60dvh] flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-sm tracking-widest text-accent">404</p>
      <h1 className="mt-4 font-display text-display-md text-balance">{t('title')}</h1>
      <p className="mt-4 max-w-md text-muted-foreground text-pretty">{t('description')}</p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonClasses('primary', 'lg')}>
          {t('backHome')}
        </Link>
        <Link href="/work" className={buttonClasses('outline', 'lg')}>
          {tc('viewWork')}
        </Link>
        <Link href="/contact" className={buttonClasses('ghost', 'lg')}>
          {tNav('contact')}
        </Link>
      </div>
    </div>
  )
}
