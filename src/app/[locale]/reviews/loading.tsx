import { getTranslations } from 'next-intl/server'
import { ListingSkeleton } from '@/components/ui/Skeleton'

export default async function Loading() {
  const t = await getTranslations('common')
  return <ListingSkeleton label={t('loading')} count={6} aspect="aspect-[3/2]" showFilters={false} />
}
