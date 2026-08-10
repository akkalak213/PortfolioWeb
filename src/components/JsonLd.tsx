/**
 * ฝัง JSON-LD ลงหน้า
 *
 * ใช้ JSON.stringify แล้วหนี '<' เพื่อกันการปิดแท็ก script ก่อนกำหนด
 * ซึ่งเป็นช่องโหว่ XSS คลาสสิกเวลาข้อมูลมาจากสิ่งที่ผู้ใช้กรอก
 */
export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
