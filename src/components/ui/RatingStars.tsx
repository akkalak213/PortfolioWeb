import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type RatingStarsProps = {
  rating: number
  size?: number
  className?: string
  /** ข้อความสำหรับ screen reader — ถ้าไม่ส่งมาจะถือว่ามีคำอธิบายอยู่รอบ ๆ แล้ว */
  label?: string
}

export function RatingStars({ rating, size = 15, className, label }: RatingStarsProps) {
  const rounded = Math.round(rating)

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          aria-hidden
          className={
            star <= rounded ? 'fill-accent text-accent' : 'fill-transparent text-muted-foreground/35'
          }
        />
      ))}
    </span>
  )
}
