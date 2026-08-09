import { Plus } from 'lucide-react'

export type FaqItem = { question: string; answer: string }

/**
 * ใช้ <details>/<summary> ของเบราว์เซอร์แทนการเขียน accordion เอง
 * ได้คีย์บอร์ด, screen reader และการค้นหาในหน้า (Ctrl+F เจอข้อความที่พับอยู่) มาฟรีทั้งหมด
 */
export function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null

  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item, index) => (
        <details key={index} name="faq" className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left font-medium transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
            <span className="text-pretty">{item.question}</span>
            <Plus
              size={18}
              strokeWidth={1.75}
              aria-hidden
              className="mt-0.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-open:rotate-45"
            />
          </summary>
          <p className="max-w-2xl pb-6 text-sm leading-relaxed text-muted-foreground text-pretty">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  )
}
