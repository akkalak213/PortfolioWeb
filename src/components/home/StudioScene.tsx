/**
 * ฉากสตูดิโอ — วาดด้วย SVG ในโค้ด ไม่ใช่ไฟล์รูป
 *
 * เลือกวาดเองเพราะยังไม่มีรูปสตูดิโอจริง และรูปสต็อกจากที่อื่นลูกค้าดูออกทันที
 * ภาพวาดเส้นแบบนี้ตรงไปตรงมากว่า ปรับสีตามธีมได้ ขยายแล้วไม่แตก
 * และน้ำหนักไฟล์เกือบเป็นศูนย์เพราะเป็นมาร์กอัปในหน้าเลย
 *
 * องค์ประกอบมาจากการจัดไฟจริง คีย์ไลต์ซอฟต์บ็อกซ์ใหญ่เยื้องซ้าย
 * ฟิลล์เล็กกว่าฝั่งขวายกสูงกว่า กล้องอยู่กลาง ฉากหลังเป็นกระดาษโค้ง
 * ทุกอย่างที่ขยับใช้แค่ opacity กับ transform จึงรันบน compositor
 */
export function StudioScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 460"
      role="img"
      aria-label="ภาพจำลองสตูดิโอถ่ายภาพ มีซอฟต์บ็อกซ์สองดวง กล้องบนขาตั้ง และฉากหลังกระดาษโค้ง"
      className={className}
      fill="none"
    >
      <defs>
        {/* ลำแสงจากซอฟต์บ็อกซ์ เข้มตรงปากไฟแล้วจางลงเมื่อออกห่าง */}
        <linearGradient id="beam-key" x1="0" y1="0" x2="1" y2="0.55">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
          <stop offset="55%" stopColor="hsl(var(--accent))" stopOpacity="0.12" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="beam-fill" x1="1" y1="0" x2="0" y2="0.6">
          <stop offset="0%" stopColor="hsl(206 70% 68%)" stopOpacity="0.34" />
          <stop offset="60%" stopColor="hsl(206 70% 68%)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="hsl(206 70% 68%)" stopOpacity="0" />
        </linearGradient>

        {/* หน้าซอฟต์บ็อกซ์เรืองแสง สว่างกลางบานแล้วหรี่ลงที่ขอบ */}
        <radialGradient id="face-key">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.95" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id="face-fill">
          <stop offset="0%" stopColor="hsl(206 75% 78%)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(206 75% 78%)" stopOpacity="0.4" />
        </radialGradient>

        {/* แสงตกพื้นใต้ตัวแบบ */}
        <radialGradient id="floor-pool">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </radialGradient>

        <clipPath id="scene-clip">
          <rect width="640" height="460" rx="12" />
        </clipPath>
      </defs>

      <g clipPath="url(#scene-clip)">
        {/* ฉากหลังกระดาษโค้ง เส้นโค้งคือรอยต่อผนังกับพื้น */}
        <path
          d="M56 40 H584 V300 C584 340 520 356 452 360 H188 C120 356 56 340 56 300 Z"
          fill="hsl(var(--foreground) / 0.03)"
        />
        <path
          d="M56 300 C56 340 120 356 188 360 H452 C520 356 584 340 584 300"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />
        <rect
          x="56"
          y="40"
          width="528"
          height="320"
          rx="8"
          stroke="hsl(var(--border))"
          strokeWidth="1.5"
        />

        {/* แสงตกพื้น วางไว้ใต้ทุกอย่างเพื่อให้ดูเหมือนแสงอาบพื้นจริง */}
        <ellipse cx="330" cy="366" rx="150" ry="26" fill="url(#floor-pool)" />

        {/* ลำแสงคีย์จากซ้าย */}
        <path className="beam beam-key" d="M150 132 L470 246 L470 330 L150 214 Z" fill="url(#beam-key)" />
        {/* ลำแสงฟิลล์จากขวา อ่อนกว่าและมุมแคบกว่า */}
        <path className="beam beam-fill" d="M512 108 L360 250 L400 316 L536 176 Z" fill="url(#beam-fill)" />

        {/* ─── ซอฟต์บ็อกซ์คีย์ ฝั่งซ้าย ─── */}
        <g stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round">
          <path d="M112 196 V352" />
          <path d="M112 352 L86 386 M112 352 L138 386 M112 352 V386" />
        </g>
        <g className="lamp lamp-key">
          <path
            d="M104 118 L152 136 L152 208 L104 226 Z"
            fill="url(#face-key)"
            stroke="hsl(var(--accent))"
            strokeWidth="1.5"
          />
          <path
            d="M104 118 L82 152 L82 192 L104 226"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* ─── ซอฟต์บ็อกซ์ฟิลล์ ฝั่งขวา ยกสูงกว่า ─── */}
        <g stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round">
          <path d="M536 150 V352" />
          <path d="M536 352 L514 386 M536 352 L558 386" />
        </g>
        <g className="lamp lamp-fill">
          <path
            d="M556 92 L520 106 L520 158 L556 172 Z"
            fill="url(#face-fill)"
            stroke="hsl(206 70% 68%)"
            strokeWidth="1.5"
          />
          <path
            d="M556 92 L574 118 L574 146 L556 172"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>

        {/* ─── ตัวแบบบนแท่นถ่ายสินค้า ─── */}
        <g stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinejoin="round">
          <rect x="286" y="286" width="88" height="14" rx="3" fill="hsl(var(--foreground) / 0.06)" />
          <path
            d="M304 286 V236 C304 224 314 216 330 216 C346 216 356 224 356 236 V286"
            fill="hsl(var(--accent) / 0.14)"
          />
          <path d="M304 244 H356" strokeWidth="1.5" opacity="0.55" />
        </g>

        {/* ─── กล้องบนขาตั้ง ─── */}
        <g stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round">
          <path d="M330 404 V368" />
          <path d="M330 368 L300 420 M330 368 L360 420 M330 368 V424" />
        </g>
        <g className="camera">
          <rect
            x="288"
            y="330"
            width="84"
            height="42"
            rx="6"
            fill="hsl(var(--surface))"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
          <rect
            x="306"
            y="318"
            width="30"
            height="14"
            rx="3"
            fill="hsl(var(--surface))"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
          <circle
            cx="330"
            cy="351"
            r="15"
            fill="hsl(var(--accent) / 0.16)"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
          <circle cx="330" cy="351" r="6" fill="hsl(var(--accent))" />
          {/* ไฟแสดงสถานะกะพริบช้า ๆ เหมือนกล้องที่เปิดอยู่ */}
          <circle className="rec-dot" cx="358" cy="340" r="3.5" fill="hsl(var(--accent))" />
        </g>

        {/* ─── ฝุ่นลอยในลำแสง ─── */}
        <g fill="hsl(var(--accent))">
          <circle className="mote mote-1" cx="212" cy="250" r="2" opacity="0.5" />
          <circle className="mote mote-2" cx="286" cy="212" r="1.6" opacity="0.4" />
          <circle className="mote mote-3" cx="376" cy="268" r="2.4" opacity="0.45" />
          <circle className="mote mote-4" cx="452" cy="196" r="1.8" opacity="0.35" />
          <circle className="mote mote-5" cx="168" cy="300" r="1.5" opacity="0.4" />
        </g>
      </g>
    </svg>
  )
}
