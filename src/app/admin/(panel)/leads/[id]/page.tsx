import { ArrowLeft, Building2, Mail, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LeadNoteForm } from '@/components/admin/LeadNoteForm'
import { LeadStatusForm } from '@/components/admin/LeadStatusForm'
import {
  budgetLabels,
  leadSourceLabels,
  quoteStatusLabels,
  serviceCategoryLabels,
} from '@/lib/admin-labels'
import { formatPrice } from '@/lib/format'
import { getLeadById } from '@/server/admin-queries'

export const metadata: Metadata = { title: 'รายละเอียดคำขอ' }

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = await getLeadById(id)
  if (!lead) notFound()

  const dateTime = new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/leads"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
        กลับไปรายการคำขอ
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="tabular text-sm text-accent">{lead.refCode}</p>
          <h1 className="mt-1 font-display text-4xl">{lead.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ส่งเข้ามาเมื่อ {dateTime.format(lead.createdAt)} · ผ่าน{' '}
            {leadSourceLabels[lead.source]}
          </p>
        </div>
        <div className="w-56">
          <LeadStatusForm leadId={lead.id} current={lead.status} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-3 font-medium">ข้อความจากลูกค้า</h2>
            <p className="whitespace-pre-line rounded-md bg-subtle p-4 text-sm leading-relaxed">
              {lead.message}
            </p>
          </section>

          {lead.items.length > 0 && (
            <section className="rounded-lg border border-border bg-surface p-5">
              <h2 className="mb-3 font-medium">อุปกรณ์ที่สนใจเช่า</h2>
              <ul className="space-y-2">
                {lead.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-md bg-subtle px-3 py-2 text-sm"
                  >
                    <span>{item.labelSnapshot}</span>
                    {item.equipment ? (
                      <Link
                        href={`/admin/equipment?highlight=${item.equipment.slug}`}
                        className="text-xs text-accent hover:underline"
                      >
                        ดูอุปกรณ์
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">อุปกรณ์ถูกลบแล้ว</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-4 font-medium">บันทึกภายใน</h2>
            <LeadNoteForm leadId={lead.id} />

            {lead.notes.length > 0 && (
              <ul className="mt-6 space-y-4 border-t border-border pt-5">
                {lead.notes.map((note) => (
                  <li key={note.id}>
                    <p className="whitespace-pre-line text-sm leading-relaxed">{note.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {note.author?.name ?? 'ทีมงาน'} · {dateTime.format(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-4 font-medium">ข้อมูลติดต่อ</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5">
                <Mail size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-accent" />
                <a href={`mailto:${lead.email}`} className="break-all hover:text-accent">
                  {lead.email}
                </a>
              </li>
              {lead.phone && (
                <li className="flex gap-2.5">
                  <Phone size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-accent" />
                  <a href={`tel:${lead.phone}`} className="hover:text-accent">
                    {lead.phone}
                  </a>
                </li>
              )}
              {lead.company && (
                <li className="flex gap-2.5">
                  <Building2 size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-accent" />
                  {lead.company}
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-4 font-medium">รายละเอียดคำขอ</h2>
            <dl className="space-y-3 text-sm">
              {lead.services.length > 0 && (
                <div>
                  <dt className="text-xs text-muted-foreground">บริการที่สนใจ</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {lead.services.map((service) => (
                      <span key={service} className="rounded bg-muted px-2 py-0.5 text-xs">
                        {serviceCategoryLabels[service]}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {lead.budgetRange && (
                <div>
                  <dt className="text-xs text-muted-foreground">งบประมาณ</dt>
                  <dd className="mt-0.5">{budgetLabels[lead.budgetRange] ?? lead.budgetRange}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted-foreground">ภาษาที่ลูกค้าใช้</dt>
                <dd className="mt-0.5">{lead.locale === 'th' ? 'ไทย' : 'อังกฤษ'}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="mb-4 font-medium">ใบเสนอราคา</h2>
            {lead.quotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่ได้ออกใบเสนอราคาให้คำขอนี้</p>
            ) : (
              <ul className="space-y-2">
                {lead.quotes.map((quote) => (
                  <li key={quote.id}>
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="flex items-center justify-between gap-3 rounded-md bg-subtle px-3 py-2 text-sm hover:bg-muted"
                    >
                      <span className="tabular">{quote.quoteNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {quoteStatusLabels[quote.status]} ·{' '}
                        {formatPrice(quote.total, 'th') ?? '—'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              ระบบออกใบเสนอราคาอยู่ระหว่างพัฒนา
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
