'use client'

import { Star } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useActionState, useState } from 'react'
import { ServiceCategory } from '@/generated/prisma/enums'
import { Field, FormMessage, Honeypot, Input, Select, Textarea } from '@/components/ui/Form'
import { Button } from '@/components/ui/Button'
import { initialActionState } from '@/server/action-state'
import { submitReview } from '@/server/actions'
import { cn } from '@/lib/utils'

const categories = Object.values(ServiceCategory)

export function ReviewForm() {
  const t = useTranslations('forms')
  const tReviews = useTranslations('reviews')
  const tCat = useTranslations('serviceCategory')
  const locale = useLocale()

  const [state, formAction, isPending] = useActionState(submitReview, initialActionState)
  const [rating, setRating] = useState(5)

  // แปลง messageKey ที่ action ส่งกลับมาให้เป็นข้อความตามภาษา
  // เขียนเป็น map ตายตัวเพื่อให้ TypeScript ตรวจได้ว่าคีย์มีอยู่จริงในไฟล์แปล
  const feedback: Record<string, string> = {
    rateLimited: t('rateLimited'),
    invalid: t('invalid'),
    serverError: t('serverError'),
  }

  if (state.status === 'success') {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 p-8 text-center">
        <p className="text-sm text-success">{t('reviewSuccess')}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <Honeypot />
      <input type="hidden" name="locale" value={locale} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          {t('rating')} <span className="text-destructive">*</span>
        </legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              className="cursor-pointer p-1"
              title={tReviews('ratingLabel', { rating: star })}
            >
              <input
                type="radio"
                name="rating"
                value={star}
                checked={rating === star}
                onChange={() => setRating(star)}
                className="sr-only peer"
              />
              <Star
                size={28}
                aria-hidden
                className={cn(
                  'transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                  star <= rating
                    ? 'fill-accent text-accent'
                    : 'fill-transparent text-muted-foreground/35',
                )}
              />
              <span className="sr-only">{tReviews('ratingLabel', { rating: star })}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field htmlFor="authorName" label={t('yourName')} required error={state.fieldErrors?.authorName}>
          <Input
            id="authorName"
            name="authorName"
            required
            maxLength={80}
            autoComplete="name"
            placeholder={t('namePlaceholder')}
            aria-invalid={Boolean(state.fieldErrors?.authorName)}
          />
        </Field>

        <Field htmlFor="authorRole" label={t('yourRole')} error={state.fieldErrors?.authorRole}>
          <Input
            id="authorRole"
            name="authorRole"
            maxLength={120}
            placeholder={t('yourRolePlaceholder')}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          htmlFor="submitterEmail"
          label={t('email')}
          hint={t('emailPrivateNote')}
          error={state.fieldErrors?.submitterEmail}
        >
          <Input
            id="submitterEmail"
            name="submitterEmail"
            type="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            aria-invalid={Boolean(state.fieldErrors?.submitterEmail)}
          />
        </Field>

        <Field htmlFor="serviceCategory" label={t('serviceUsed')}>
          <Select id="serviceCategory" name="serviceCategory" defaultValue="">
            <option value="">{t('selectService')}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {tCat(category)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        htmlFor="content"
        label={t('reviewContent')}
        required
        error={state.fieldErrors?.content}
      >
        <Textarea
          id="content"
          name="content"
          required
          minLength={20}
          maxLength={1500}
          placeholder={t('reviewContentPlaceholder')}
          aria-invalid={Boolean(state.fieldErrors?.content)}
        />
      </Field>

      {state.status === 'error' && (
        <FormMessage status="error">
          {feedback[state.messageKey ?? 'serverError'] ?? t('serverError')}
        </FormMessage>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? t('sending') : t('submitReview')}
        </Button>
        <p className="text-xs text-muted-foreground">{tReviews('formNote')}</p>
      </div>
    </form>
  )
}
