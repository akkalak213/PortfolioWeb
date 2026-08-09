'use client'

import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { buttonClasses } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { LocaleSwitcher } from './LocaleSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { Wordmark } from './Wordmark'

const navItems = [
  { key: 'services', href: '/services' },
  { key: 'work', href: '/work' },
  { key: 'rental', href: '/rental' },
  { key: 'reviews', href: '/reviews' },
  { key: 'blog', href: '/blog' },
  { key: 'about', href: '/about' },
] as const

export function SiteHeader() {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ล็อกการเลื่อนพื้นหลังตอนเมนูเปิด (การปิดเมนูเมื่อเปลี่ยนหน้าทำที่ onClick ของลิงก์)
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md transition-shadow duration-300 no-print',
        isScrolled ? 'border-b border-border shadow-soft' : 'border-b border-transparent',
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" className="shrink-0" aria-label={t('home')}>
          <Wordmark />
        </Link>

        <nav aria-label={t('menu')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'relative rounded-md px-3 py-2 text-sm transition-colors',
                    isActive(item.href)
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t(item.key)}
                  {isActive(item.href) && (
                    <span className="absolute inset-x-3 -bottom-px h-px bg-accent" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher className="hidden sm:inline-flex" />
          <ThemeToggle />
          <Link href="/contact" className={buttonClasses('primary', 'sm', 'hidden md:inline-flex')}>
            {tc('getQuote')}
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label={isOpen ? t('closeMenu') : t('openMenu')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted lg:hidden"
          >
            {isOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* เมนูมือถือ — เต็มจอ ปุ่มใหญ่พอสำหรับนิ้ว (ขั้นต่ำ 44px) */}
      <div
        id="mobile-nav"
        hidden={!isOpen}
        className="fixed inset-x-0 top-16 z-40 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background md:top-20 md:h-[calc(100dvh-5rem)] lg:hidden"
      >
        <nav aria-label={t('menu')} className="container flex flex-col py-4">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setIsOpen(false)}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'flex min-h-[52px] items-center border-b border-border/60 text-lg transition-colors',
                isActive(item.href) ? 'text-accent' : 'text-foreground hover:text-accent',
              )}
            >
              {t(item.key)}
            </Link>
          ))}

          <div className="mt-6 flex flex-col gap-4">
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className={buttonClasses('primary', 'lg', 'w-full')}
            >
              {tc('getQuote')}
            </Link>
            <LocaleSwitcher className="self-start sm:hidden" />
          </div>
        </nav>
      </div>
    </header>
  )
}
