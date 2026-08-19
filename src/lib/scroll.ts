/**
 * เลื่อนจอไปหาส่วนที่เพิ่งเปิดขึ้นมา
 *
 * ใช้ตอนที่การกดปุ่มทำให้เนื้อหาโผล่ต่อท้ายหน้าซึ่งอยู่นอกจอ
 * ถ้าปล่อยให้หน้าจอนิ่งอยู่ที่เดิม ลูกค้าจะเข้าใจว่ากดไม่ติดแล้วกดซ้ำ
 *
 * เคารพการตั้งค่า "ลดการเคลื่อนไหว" ของระบบเสมอ — ผู้ใช้บางคนเวียนหัวกับการเลื่อนแบบลื่นไหล
 */
export function scrollIntoViewSoftly(element: HTMLElement | null) {
  if (!element) return

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // 'instant' ไม่ใช่ 'auto' — 'auto' หมายถึง "ตามที่ CSS กำหนด" ซึ่ง html ของเราตั้ง scroll-smooth ไว้
  element.scrollIntoView({
    behavior: prefersReducedMotion ? 'instant' : 'smooth',
    block: 'start',
  })
}
