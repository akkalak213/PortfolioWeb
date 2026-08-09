import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/** ใช้ Link/useRouter ชุดนี้แทนของ next/link เพื่อให้ prefix ภาษาติดไปเองอัตโนมัติ */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
