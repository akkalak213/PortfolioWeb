import Script from 'next/script'
import { clientEnv } from '@/lib/env'

/** ไม่ได้ตั้ง NEXT_PUBLIC_GA_ID = ไม่โหลดสคริปต์ใด ๆ เลย ไม่ใช่แค่ซ่อน */
export function Analytics() {
  const gaId = clientEnv.NEXT_PUBLIC_GA_ID
  if (!gaId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
      </Script>
    </>
  )
}
