/**
 * ฉากสตูดิโอ — เป็นพื้นห้องของทั้ง section ไม่ใช่รูปที่แปะไว้ข้าง ๆ ข้อความ
 *
 * ฉบับแรกวางแต่ละชิ้นด้วยพิกัดที่กะเอาทีละตัว ผลคือขาตั้งไฟทะลุพื้นลงไป 26px
 * ขาตั้งกล้องทะลุ 64px และแท่นวางสินค้าลอยเหนือพื้น 60px
 * ทุกอย่างเลยดูไม่อยู่ในห้องเดียวกัน
 *
 * รอบนี้ยึดค่าคงที่ชุดเดียว ทุกชิ้นวัดจาก GROUND และใช้มาตราส่วนเดียวกันหมด
 * 100 หน่วย = 1 เมตร ความสูงของขาตั้งไฟ ขาตั้งกล้อง และโต๊ะ
 * จึงเป็นสัดส่วนที่ตรงกับของจริง
 *
 * วางเป็นแถบเต็มความกว้างที่ก้นแผง เส้นพื้นอยู่ขอบล่างพอดี
 * ข้อความและการ์ดด้านบนจึงอ่านเป็นของที่อยู่ในห้องเดียวกับฉาก
 */

/** เส้นพื้นห้อง ทุกชิ้นที่ตั้งอยู่บนพื้นต้องจบที่ค่านี้ */
const GROUND = 296

/**
 * ความสูงจริงของอุปกรณ์ หน่วยเป็นเมตร คูณ 100 เป็นหน่วยใน viewBox
 * ปัดเศษเพราะทศนิยมลอยตัวทำให้ค่าอย่าง 2.2 เมตร ออกมาเป็น 75.99999999999997 ในมาร์กอัป
 */
const m = (meters: number) => Math.round(GROUND - meters * 100)

export function StudioScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="ภาพจำลองสตูดิโอถ่ายภาพ มีกล้องบนขาตั้ง ซอฟต์บ็อกซ์ แผ่นสะท้อนแสง ฉากหลังกระดาษโค้ง และสินค้าบนแท่นถ่าย"
      className={className}
      fill="none"
    >
      <defs>
        {/* ลำแสง เข้มตรงปากไฟแล้วจางลงเมื่อตกถึงพื้น */}
        <linearGradient id="scene-beam-key" x1="0.25" y1="0" x2="0.75" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="scene-beam-fill" x1="0.8" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="hsl(206 72% 70%)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="hsl(206 72% 70%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="scene-bounce" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.14" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="scene-face-key">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.95" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id="scene-face-eq">
          <stop offset="0%" stopColor="hsl(206 78% 80%)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(206 78% 80%)" stopOpacity="0.42" />
        </radialGradient>

        {/* แสงกองบนพื้นใต้ตัวแบบ */}
        <radialGradient id="scene-pool">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.24" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </radialGradient>

        {/* เส้นพื้นจางหายที่ขอบซ้ายขวา ฉากจึงกลืนไปกับความกว้างของ section */}
        <linearGradient id="scene-floor-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--border))" stopOpacity="0" />
          <stop offset="22%" stopColor="hsl(var(--border))" stopOpacity="1" />
          <stop offset="78%" stopColor="hsl(var(--border))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--border))" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="scene-cyc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.02" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.07" />
        </linearGradient>
      </defs>

      {/* ─── ฉากหลังกระดาษโค้ง อยู่หลังสุด ─── */}
      <path
        d="M660 0 H1120 V232 C1120 270 1086 292 1040 296 H740 C694 292 660 270 660 232 Z"
        fill="url(#scene-cyc)"
      />
      <path
        d="M660 232 C660 270 694 292 740 296 M1120 232 C1120 270 1086 292 1040 296"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />

      {/* แสงกองบนพื้น วางก่อนวัตถุเพื่อให้ดูเหมือนแสงอาบพื้นอยู่ใต้ของ */}
      <ellipse cx="830" cy={GROUND} rx="300" ry="34" fill="url(#scene-pool)" />

      {/* ─── ลำแสง ─── */}
      <path className="beam beam-key" d="M468 58 L536 88 L1010 296 L636 296 Z" fill="url(#scene-beam-key)" />
      <path className="beam beam-fill" d="M1292 80 L1340 100 L1030 296 L878 296 Z" fill="url(#scene-beam-fill)" />
      <path className="beam beam-bounce" d="M1132 204 L1178 220 L950 296 L872 296 Z" fill="url(#scene-bounce)" />

      {/* ─── เงาบนพื้น วางก่อนวัตถุ ─── */}
      <g fill="hsl(240 20% 2%)" opacity="0.5">
        <ellipse cx="210" cy={GROUND} rx="54" ry="6" />
        <ellipse cx="455" cy={GROUND} rx="46" ry="6" />
        <ellipse cx="830" cy={GROUND} rx="98" ry="9" />
        <ellipse cx="1180" cy={GROUND} rx="42" ry="6" />
        <ellipse cx="1330" cy={GROUND} rx="38" ry="6" />
      </g>

      {/* ─── กล้องบนขาตั้ง สูง 1.44 เมตร ─── */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round">
        <path d={`M210 ${m(1.44)} L172 ${GROUND}`} />
        <path d={`M210 ${m(1.44)} L248 ${GROUND}`} />
        <path d={`M210 ${m(1.44)} L210 ${GROUND}`} />
        <path d={`M186 ${m(1.44)} H234`} />
      </g>
      <g className="camera">
        <rect
          x="182"
          y={m(1.72)}
          width="62"
          height="32"
          rx="5"
          fill="hsl(var(--surface))"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
        />
        <rect
          x="196"
          y={m(1.84)}
          width="26"
          height="12"
          rx="3"
          fill="hsl(var(--surface))"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
        />
        <rect
          x="244"
          y={m(1.66)}
          width="30"
          height="20"
          rx="4"
          fill="hsl(var(--accent) / 0.18)"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
        />
        <circle className="rec-dot" cx="234" cy={m(1.78)} r="4" fill="hsl(var(--accent))" />
      </g>

      {/* ─── ซอฟต์บ็อกซ์คีย์ ขาตั้งสูง 1.92 เมตร เอียงส่องลงมาที่ตัวแบบ ─── */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round">
        <path d={`M455 ${m(1.92)} V${GROUND}`} />
        <path d={`M455 ${m(0.26)} L424 ${GROUND}`} />
        <path d={`M455 ${m(0.26)} L486 ${GROUND}`} />
      </g>
      <g className="lamp lamp-key">
        <path d={`M455 ${m(1.92)} L468 96`} stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" />
        <path
          d="M468 58 L536 88 L514 140 L446 110 Z"
          fill="url(#scene-face-key)"
          stroke="hsl(var(--accent))"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M446 110 L432 74 L468 58"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      {/* ─── สินค้าบนแท่นถ่าย สูง 0.34 เมตร ─── */}
      <g stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinejoin="round">
        <rect
          x="760"
          y={m(0.34)}
          width="140"
          height="34"
          rx="4"
          fill="hsl(var(--foreground) / 0.07)"
        />
        <rect
          x="800"
          y={m(1)}
          width="62"
          height="66"
          rx="4"
          fill="hsl(var(--accent) / 0.16)"
        />
        <rect
          x="764"
          y={m(0.68)}
          width="30"
          height="34"
          rx="3"
          fill="hsl(var(--accent) / 0.09)"
        />
      </g>

      {/* ─── แผ่นสะท้อนแสง ขาตั้งสูง 1.46 เมตร หันเข้าหาตัวแบบ ─── */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round">
        <path d={`M1180 ${m(1.46)} V${GROUND}`} />
        <path d={`M1180 ${m(0.22)} L1156 ${GROUND}`} />
        <path d={`M1180 ${m(0.22)} L1204 ${GROUND}`} />
      </g>
      <path
        d="M1150 120 L1196 136 L1178 220 L1132 204 Z"
        fill="hsl(var(--foreground) / 0.06)"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* ─── ซอฟต์บ็อกซ์ฟิลล์ ขาตั้งสูง 2.2 เมตร ยกสูงกว่าคีย์ ─── */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round">
        <path d={`M1330 ${m(2.2)} V${GROUND}`} />
        <path d={`M1330 ${m(0.24)} L1306 ${GROUND}`} />
        <path d={`M1330 ${m(0.24)} L1354 ${GROUND}`} />
      </g>
      <g className="lamp lamp-fill">
        <path d={`M1330 ${m(2.2)} L1316 82`} stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" />
        <path
          d="M1300 40 L1352 60 L1338 104 L1286 84 Z"
          fill="url(#scene-face-eq)"
          stroke="hsl(206 72% 70%)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>

      {/* ─── เส้นพื้น จางหายที่ขอบทั้งสองข้าง ─── */}
      <rect x="0" y={GROUND} width="1440" height="1.5" fill="url(#scene-floor-line)" />

      {/* ─── ฝุ่นลอยในลำแสง ─── */}
      <g fill="hsl(var(--accent))">
        <circle className="mote mote-1" cx="640" cy="210" r="2.4" opacity="0.5" />
        <circle className="mote mote-2" cx="742" cy="160" r="1.8" opacity="0.4" />
        <circle className="mote mote-3" cx="884" cy="238" r="2.8" opacity="0.45" />
        <circle className="mote mote-4" cx="1004" cy="182" r="2" opacity="0.34" />
        <circle className="mote mote-5" cx="560" cy="132" r="1.6" opacity="0.42" />
        <circle className="mote mote-6" cx="1128" cy="252" r="2.2" opacity="0.3" />
      </g>
    </svg>
  )
}
