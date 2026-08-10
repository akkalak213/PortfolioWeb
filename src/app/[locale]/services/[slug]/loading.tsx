import { getTranslations } from 'next-intl/server'
import { DetailSkeleton } from '@/components/ui/Skeleton'

export default async function Loading() {
  const t = await getTranslations('common')
  return <DetailSkeleton label={t('loading')} />
}
