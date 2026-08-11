'use client'

import { Check } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useActionState } from 'react'
import { ServiceCategory } from '@/generated/prisma/enums'
import { Button } from '@/components/ui/Button'
import { Field, FormMessage, Honeypot, Input, Select, Textarea } from '@/components/ui/Form'
import { cn } from '@/lib/utils'
import { budgetRanges } from '@/lib/validations'
import { initialActionState } from '@/server/action-state'
import { submitLead } from '@/server/actions'

const categories = Object.values(ServiceCategory)

type Props = {
  source?: 'CONTACT' | 'QUOTE' | 'RENTAL' | 'SERVICE_PAGE'
  /** ติ๊กบริการไว้ล่วงหน้าเมื่อมาจากหน้าบริการใดบริการหนึ่ง */
  defaultService?: ServiceCategory
  /** อุปกรณ์ที่ผู้ใช้เลือกไว้จากหน้า /rental */
  equipmentIds?: string[]
  equipmentLabels?: string[]
  showServicePicker?: boolean
}

export function LeadForm({
  source = 'CONTACT',
  defaultService,
  equipmentIds = [],
  equipmentLabels = [],
  showServicePicker = true,
}: Props) {
  const t = useTranslations('forms')
  const tCat = useTranslations('serviceCategory')
  const tBudget = useTranslations('budget')
  const locale = useLocale()

  const [state, formAction, isPending] = useActionState(submitLead, initialActionState)

  const feedback: Record<string, string> = {
    rateLimited: t('rateLimited'),
    invalid: t('invalid'),
    serverError: t('serverError'),
  }

  if (state.status === 'success') {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 p-8">
        <p className="text-sm text-success">{t('leadSuccess')}</p>
        {state.refCode && (
          <p className="tabular mt-2 text-sm font-medium text-success">
            {t('leadSuccessRef', { refCode: state.refCode })}
          </p>
        )}
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <Honeypot />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value={source} />
      {equipmentIds.map((id) => (
        <input key={id} type="hidden" name="equipmentIds" value={id} />
      ))}

      {equipmentLabels.length > 0 && (
        <div className="rounded-md border border-border bg-subtle p-4">
          <p className="mb-2 text-sm font-medium">{t('selectedEquipment')}</p>
          <ul className="flex flex-wrap gap-2">
            {equipmentLabels.map((label) => (
              <li
                key={label}
                className="rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field htmlFor="name" label={t('name')} required error={state.fieldErrors?.name}>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder={t('namePlaceholder')}
            aria-invalid={Boolean(state.fieldErrors?.name)}
          />
        </Field>

        <Field htmlFor="email" label={t('email')} required error={state.fieldErrors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field htmlFor="phone" label={t('phone')} error={state.fieldErrors?.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t('phonePlaceholder')}
            aria-invalid={Boolean(state.fieldErrors?.phone)}
          />
        </Field>

        <Field htmlFor="company" label={t('company')} error={state.fieldErrors?.company}>
          <Input
            id="company"
            name="company"
            autoComplete="organization"
            placeholder={t('companyPlaceholder')}
          />
        </Field>
      </div>

      {showServicePicker && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-medium">{t('servicesInterested')}</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              // ชิปทั้งใบเป็นพื้นที่กดได้ ไม่ใช่แค่ช่องติ๊กเล็ก ๆ
              // เพิ่มเครื่องหมายถูกตอนเลือกเพื่อให้เห็นชัดว่ากดได้และกดไปแล้ว
              <label
                key={category}
                className={cn(
                  'inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border border-input py-1.5 pl-3 pr-3.5 text-sm text-muted-foreground',
                  'transition-colors hover:border-foreground/25 hover:bg-muted',
                  'has-[:checked]:border-accent has-[:checked]:bg-accent-subtle has-[:checked]:text-accent',
                  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background',
                )}
              >
                <input
                  type="checkbox"
                  name="services"
                  value={category}
                  defaultChecked={category === defaultService}
                  className="peer sr-only"
                />
                <Check
                  size={14}
                  strokeWidth={2.5}
                  aria-hidden
                  className="opacity-0 transition-opacity peer-checked:opacity-100"
                />
                {tCat(category)}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <Field htmlFor="budgetRange" label={t('budget')}>
        <Select id="budgetRange" name="budgetRange" defaultValue="">
          <option value="">{t('budgetPlaceholder')}</option>
          {budgetRanges.map((range) => (
            <option key={range} value={range}>
              {tBudget(range)}
            </option>
          ))}
        </Select>
      </Field>

      <Field htmlFor="message" label={t('message')} required error={state.fieldErrors?.message}>
        <Textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={3000}
          placeholder={t('messagePlaceholder')}
          aria-invalid={Boolean(state.fieldErrors?.message)}
        />
      </Field>

      {state.status === 'error' && (
        <FormMessage status="error">
          {feedback[state.messageKey ?? 'serverError'] ?? t('serverError')}
        </FormMessage>
      )}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? t('sending') : t('submitLead')}
      </Button>
    </form>
  )
}
