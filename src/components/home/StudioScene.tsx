/**
 * ฉากสตูดิโอ — เป็นพื้นห้องของทั้ง section ไม่ใช่รูปที่แปะไว้ข้าง ๆ ข้อความ
 *
 * ประกอบและตรวจด้วยตาใน Figma ก่อนทุกครั้ง แล้วยกเรขาคณิตชุดเดียวกันมาเขียนเป็น SVG
 * ไฟล์ออกแบบ https://www.figma.com/design/OtdCzleSb9dMY3pFQ3mJzS
 *
 * กติกาที่ยึด
 *   ทุกชิ้นที่ตั้งบนพื้นวัดจาก GROUND ค่าเดียว
 *   มาตราส่วน 100 หน่วยเท่ากับ 1 เมตร ขนาดทุกอย่างจึงเทียบกันได้จริง
 *     ช่างภาพสูง 1.77 กล้องพร้อมเลนส์ยาว 0.64 โต๊ะถ่ายสูง 0.78 ขวด 0.32
 *   โคมไฟคำนวณในระบบพิกัดของตัวเองโดยให้จุดยึดอยู่ที่ปลายเสา แล้วหมุนตามทิศเล็ง
 *   ลำแสงเริ่มจากมุมหน้ากระจายแสงที่คำนวณได้จริง ไม่ได้กะพิกัดต้นลำแสงเอง
 */

/** เส้นพื้นห้อง ทุกชิ้นที่ตั้งอยู่บนพื้นต้องจบที่ค่านี้ */
const GROUND = 296

/** ความสูงจริง หน่วยเป็นเมตร คูณ 100 เป็นหน่วยใน viewBox */
const m = (meters: number) => Math.round(GROUND - meters * 100)

type Pt = [number, number]

const poly = (pts: Pt[], close = true) =>
  `M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')}${close ? ' Z' : ''}`

/**
 * โคมไฟหนึ่งดวง คำนวณทุกชิ้นส่วนในระบบพิกัดของตัวโคม
 * จุดยึดอยู่ที่ (0,0) หันไปทาง +x แล้วหมุนไปตามทิศที่เล็งตัวแบบ
 * ชิ้นส่วนจึงประกอบกันสนิทเสมอ ไม่ว่าจะเล็งไปทางไหน และเสาไม่มีทางทะลุตัวโคม
 */
function lamp(x: number, top: number, aim: Pt, depth: number, half: number) {
  const th = Math.atan2(aim[1] - top, aim[0] - x)
  const cos = Math.cos(th)
  const sin = Math.sin(th)
  const at = (lx: number, ly: number): Pt => [x + lx * cos - ly * sin, top + lx * sin + ly * cos]

  return {
    dir: [cos, sin] as Pt,
    head: poly([at(-22, -9), at(-6, -9), at(-6, 9), at(-22, 9)]),
    ring: poly([at(-6, -13), at(0, -13), at(0, 13), at(-6, 13)]),
    body: poly([at(0, -13), at(depth, -half), at(depth, half), at(0, 13)]),
    diffuser: poly([at(depth - 9, -half + 3), at(depth, -half), at(depth, half), at(depth - 9, half - 3)]),
    faceTop: at(depth, -half),
    faceBot: at(depth, half),
    faceMid: at(depth, 0),
  }
}

/** ลากขอบลำแสงจากมุมหน้าโคมไปตามทิศเล็ง จนชนพื้นหรือครบระยะที่กำหนด */
function beamOf(faceTop: Pt, faceBot: Pt, dir: Pt, maxLen = 999) {
  const reach = ([px, py]: Pt): Pt => {
    const t = Math.min(dir[1] > 0.01 ? (GROUND - py) / dir[1] : Infinity, maxLen)
    return [px + dir[0] * t, py + dir[1] * t]
  }
  const endTop = reach(faceTop)
  const endBot = reach(faceBot)
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  return { d: poly([faceTop, endTop, endBot, faceBot]), from: mid(faceTop, faceBot), to: mid(endTop, endBot) }
}

const key = lamp(560, 96, [830, 236], 58, 44)
const fill = lamp(1330, 100, [886, 240], 48, 34)
const keyBeam = beamOf(key.faceTop, key.faceBot, key.dir)
const fillBeam = beamOf(fill.faceTop, fill.faceBot, fill.dir)

const REF_X = 1150
const REF_TOP = 188
const refTh = Math.atan2(248 - REF_TOP, 890 - REF_X)
const refAt = (lx: number, ly: number): Pt => [
  REF_X + lx * Math.cos(refTh) - ly * Math.sin(refTh),
  REF_TOP + lx * Math.sin(refTh) + ly * Math.cos(refTh),
]
const bounce = beamOf(refAt(8, -48), refAt(8, 48), [Math.cos(refTh), Math.sin(refTh)], 210)

/** ขาตั้งสามขา ปลายขาจบที่เส้นพื้นทุกเส้น */
const standOf = (x: number, top: number) =>
  `M ${x} ${top} V ${GROUND} M ${x - 26} ${GROUND} L ${x} ${GROUND - 28} L ${x + 26} ${GROUND}`

const TABLE = m(0.78)
const BOOM_X = 1020
const PERSON_X = 280

export function StudioScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="ภาพจำลองสตูดิโอถ่ายภาพ ช่างภาพยืนกดชัตเตอร์ที่กล้องซึ่งติดแฟลชหัวกลม มีซอฟต์บ็อกซ์สองดวง ไฟบูมเหนือสินค้า แผ่นสะท้อนแสง และฉากหลังกระดาษโค้ง"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="ss-cyc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.012" />
          <stop offset="55%" stopColor="hsl(var(--foreground))" stopOpacity="0.035" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.065" />
        </linearGradient>
        <linearGradient id="ss-cyc-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="26%" stopColor="#fff" stopOpacity="1" />
          <stop offset="74%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="ss-cyc-mask">
          <rect x="546" y="-10" width="572" height="330" fill="url(#ss-cyc-fade)" />
        </mask>

        <linearGradient id="ss-edge-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--border))" stopOpacity="0" />
          <stop offset="22%" stopColor="hsl(var(--border))" stopOpacity="1" />
          <stop offset="78%" stopColor="hsl(var(--border))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--border))" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="ss-beam-key" gradientUnits="userSpaceOnUse"
          x1={keyBeam.from[0]} y1={keyBeam.from[1]} x2={keyBeam.to[0]} y2={keyBeam.to[1]}>
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
          <stop offset="30%" stopColor="hsl(var(--accent))" stopOpacity="0.22" />
          <stop offset="65%" stopColor="hsl(var(--accent))" stopOpacity="0.07" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ss-beam-fill" gradientUnits="userSpaceOnUse"
          x1={fillBeam.from[0]} y1={fillBeam.from[1]} x2={fillBeam.to[0]} y2={fillBeam.to[1]}>
          <stop offset="0%" stopColor="hsl(206 72% 70%)" stopOpacity="0.27" />
          <stop offset="30%" stopColor="hsl(206 72% 70%)" stopOpacity="0.15" />
          <stop offset="65%" stopColor="hsl(206 72% 70%)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="hsl(206 72% 70%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ss-beam-bounce" gradientUnits="userSpaceOnUse"
          x1={bounce.from[0]} y1={bounce.from[1]} x2={bounce.to[0]} y2={bounce.to[1]}>
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.08" />
          <stop offset="70%" stopColor="hsl(var(--accent))" stopOpacity="0.02" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </linearGradient>
        {/* ไฟบูมส่องลงตรง ๆ แกนไล่สีจึงเป็นแนวดิ่ง */}
        <linearGradient id="ss-beam-boom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
          <stop offset="35%" stopColor="hsl(var(--accent))" stopOpacity="0.15" />
          <stop offset="72%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="ss-pool">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
          <stop offset="60%" stopColor="hsl(var(--accent))" stopOpacity="0.06" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ss-hot-key">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.34" />
          <stop offset="45%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ss-hot-fill">
          <stop offset="0%" stopColor="hsl(206 72% 70%)" stopOpacity="0.3" />
          <stop offset="45%" stopColor="hsl(206 72% 70%)" stopOpacity="0.09" />
          <stop offset="100%" stopColor="hsl(206 72% 70%)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ss-hot-boom">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.26" />
          <stop offset="45%" stopColor="hsl(var(--accent))" stopOpacity="0.08" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ss-shadow">
          <stop offset="0%" stopColor="hsl(240 20% 2%)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="hsl(240 20% 2%)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ss-burst">
          <stop offset="0%" stopColor="#fff7ea" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#ffe6c4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffe6c4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ss-spill">
          <stop offset="0%" stopColor="#fff4e2" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff4e2" stopOpacity="0" />
        </radialGradient>

        <filter id="ss-soft" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="ss-soft-sm" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* ─── ฉากหลังกระดาษโค้ง กึ่งกลางตรงกับสินค้า ─── */}
      <g mask="url(#ss-cyc-mask)">
        <path
          d="M 582 0 L 1078 0 L 1078 232 C 1078 272 1042 292 992 296 L 668 296 C 618 292 582 272 582 232 Z"
          fill="url(#ss-cyc)"
        />
      </g>
      <path
        d="M 582 232 C 582 272 618 292 668 296 M 1078 232 C 1078 272 1042 292 992 296"
        stroke="url(#ss-edge-fade)"
        strokeWidth="1.5"
      />

      <ellipse cx="830" cy={GROUND} rx="300" ry="34" fill="url(#ss-pool)" />

      {/* ─── ลำแสง ─── */}
      <g filter="url(#ss-soft)">
        <path className="beam beam-key" d={keyBeam.d} fill="url(#ss-beam-key)" />
        <path className="beam beam-fill" d={fillBeam.d} fill="url(#ss-beam-fill)" />
        <path className="beam beam-bounce" d={bounce.d} fill="url(#ss-beam-bounce)" />
        <path className="beam beam-boom" d={poly([[768, 92], [896, 92], [936, 236], [724, 236]])} fill="url(#ss-beam-boom)" />
      </g>
      <g filter="url(#ss-soft-sm)">
        <ellipse className="lamp lamp-key" cx={key.faceMid[0]} cy={key.faceMid[1]} rx="86" ry="73" fill="url(#ss-hot-key)" />
        <ellipse className="lamp lamp-fill" cx={fill.faceMid[0]} cy={fill.faceMid[1]} rx="66" ry="56" fill="url(#ss-hot-fill)" />
        <ellipse className="lamp lamp-boom" cx="830" cy="92" rx="88" ry="48" fill="url(#ss-hot-boom)" />
      </g>

      {/* ─── เงาบนพื้น วางก่อนวัตถุ ─── */}
      <g>
        {([[PERSON_X, 44], [350, 50], [560, 44], [830, 110], [BOOM_X, 40], [REF_X, 38], [1330, 36]] as Pt[]).map(
          ([cx, rx]) => <ellipse key={cx} cx={cx} cy={GROUND} rx={rx} ry="7" fill="url(#ss-shadow)" />,
        )}
      </g>

      {/*
        ช่างภาพยืนหลังกล้องในระยะที่เอื้อมถึงปุ่มชัตเตอร์จริง ระยะไหล่ถึงมือ 0.5 เมตร
        วาดก่อนกล้อง ตัวกล้องกับขาตั้งจึงบังทับด้านหน้าตามความเป็นจริง
      */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx={PERSON_X} cy="132" r="13" fill="hsl(var(--foreground) / 0.14)" />
        <path
          d={`M ${PERSON_X} 145 V 152 C ${PERSON_X - 14} 156 ${PERSON_X - 16} 168 ${PERSON_X - 15} 182 L ${PERSON_X - 13} 208 L ${PERSON_X + 13} 208 L ${PERSON_X + 15} 182 C ${PERSON_X + 16} 168 ${PERSON_X + 14} 156 ${PERSON_X} 152 Z`}
          fill="hsl(var(--foreground) / 0.09)"
        />
        <path d={`M ${PERSON_X - 10} 208 L ${PERSON_X - 14} ${GROUND} M ${PERSON_X + 12} 208 L ${PERSON_X + 16} ${GROUND}`} />
        <path d={`M ${PERSON_X - 12} 162 L ${PERSON_X - 22} 186 L ${PERSON_X - 8} 196`} opacity="0.65" />
        {/* แขนกดชัตเตอร์ หมุนรอบหัวไหล่ตอนกด จึงแยกเป็นชิ้นของตัวเอง */}
        <path className="shutter-arm" d={`M ${PERSON_X + 14} 162 L ${PERSON_X + 40} 176 L 359 148`} />
      </g>

      {/* ─── กล้องมิเรอร์เลสบนขาตั้ง ทั้งชุดพร้อมเลนส์และฮูดยาว 0.64 เมตร ─── */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M 310 ${GROUND} L 350 176 L 390 ${GROUND} M 350 176 V ${GROUND}`} />
        <path d={poly([[342, 168], [358, 168], [356, 176], [344, 176]])} fill="hsl(var(--muted-foreground) / 0.4)" strokeWidth="2" />
      </g>
      <g stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M 332 150 C 332 148 333 146 336 146 L 360 146 C 363 146 364 148 364 151 L 364 164 C 364 166 363 168 360 168 L 336 168 C 333 168 332 166 332 164 Z" fill="hsl(var(--foreground) / 0.12)" />
        <path d={poly([[340, 140], [354, 140], [355, 146], [339, 146]])} fill="hsl(var(--foreground) / 0.12)" />
        <path d="M 358 147 C 366 147 370 151 370 157 L 370 172 C 370 175 368 176 365 176 L 358 176 Z" fill="hsl(var(--foreground) / 0.16)" />
        <path d={poly([[364, 151], [386, 151], [386, 165], [364, 165]])} fill="hsl(var(--foreground) / 0.07)" />
        <path d={poly([[386, 148], [396, 146], [396, 170], [386, 168]])} fill="hsl(var(--accent) / 0.16)" />
        {/* แฟลช Godox V1 หัวกลมคือจุดจำของรุ่นนี้ จึงวาดหัวเป็นวงกลมเต็มใบ */}
        <path d={poly([[341, 136], [353, 136], [353, 140], [341, 140]])} fill="hsl(var(--foreground) / 0.14)" strokeWidth="2" />
        <path d={poly([[342, 122], [352, 122], [352, 136], [342, 136]])} fill="hsl(var(--foreground) / 0.12)" />
        <circle cx="347" cy="113" r="9" fill="hsl(var(--foreground) / 0.14)" />
      </g>
      <circle cx="361" cy="143" r="2.5" fill="hsl(var(--accent))" />
      <circle className="flash-tube" cx="347" cy="113" r="5" fill="hsl(var(--accent) / 0.55)" stroke="hsl(var(--accent))" strokeWidth="1.5" />

      {/* แสงตอนแฟลชทำงาน ซ่อนไว้แล้วสว่างวาบเดียวหลังกดชัตเตอร์ */}
      <g className="flash-pop">
        <ellipse cx="347" cy="113" rx="54" ry="54" fill="url(#ss-burst)" filter="url(#ss-soft-sm)" />
        <path
          d="M 366 100 L 384 92 M 370 113 L 392 113 M 366 126 L 384 134 M 358 92 L 366 76"
          stroke="#fff4e2"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.75"
        />
      </g>
      {/* แสงแฟลชที่ตกถึงตัวสินค้า ทำให้อ่านออกว่าแฟลชยิงไปที่ของบนโต๊ะ */}
      <ellipse className="flash-pop" cx="820" cy="196" rx="150" ry="76" fill="url(#ss-spill)" filter="url(#ss-soft)" />

      {/* ─── ซอฟต์บ็อกซ์คีย์ ─── */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={standOf(560, 96)} />
        <path d={key.head} fill="hsl(var(--muted-foreground) / 0.3)" />
        <path d={key.ring} fill="hsl(var(--muted-foreground) / 0.45)" />
      </g>
      <path d={key.body} fill="hsl(var(--accent) / 0.07)" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinejoin="round" />
      <path d={key.diffuser} fill="hsl(var(--accent) / 0.8)" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinejoin="round" />

      {/* ─── โต๊ะถ่ายสินค้า สูง 0.78 เมตร ระดับเอวตามโต๊ะจริง ─── */}
      <g stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="734" y={TABLE} width="192" height="12" rx="2" fill="hsl(var(--foreground) / 0.1)" />
        <path
          d={`M 828 ${TABLE} V ${TABLE - 20} C 828 ${TABLE - 27} 834 ${TABLE - 30} 834 ${TABLE - 36} V ${TABLE - 46} H 830 V ${TABLE - 52} H 852 V ${TABLE - 46} H 848 V ${TABLE - 36} C 848 ${TABLE - 30} 854 ${TABLE - 27} 854 ${TABLE - 20} V ${TABLE} Z`}
          fill="hsl(var(--accent) / 0.2)"
        />
        <rect x="786" y={TABLE - 20} width="34" height="20" rx="2" fill="hsl(var(--accent) / 0.1)" />
        <rect x="762" y={TABLE - 9} width="18" height="9" rx="2" fill="hsl(var(--foreground) / 0.08)" />
      </g>
      <path
        d={`M 754 ${TABLE + 12} V ${GROUND} M 906 ${TABLE + 12} V ${GROUND} M 754 ${GROUND - 26} H 906`}
        stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round"
      />

      {/*
        ขาบูม เสาตั้งทางขวาแล้วยื่นแขนข้ามมาเหนือสินค้า ปลายอีกข้างถ่วงน้ำหนัก
        ตั้งทางขวาเพราะถ้าตั้งทางซ้ายเสาจะไปขวางลำแสงของไฟคีย์พอดี
      */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={standOf(BOOM_X, 104)} />
        <path d={`M 830 58 L ${BOOM_X} 104 L 1076 122`} strokeWidth="3" />
        <circle cx={BOOM_X} cy="104" r="7" fill="hsl(var(--muted-foreground) / 0.5)" strokeWidth="2" />
        <path d={poly([[1064, 113], [1088, 113], [1088, 133], [1064, 133]])} fill="hsl(var(--muted-foreground) / 0.5)" />
        <path d="M 830 58 V 48 M 812 48 H 848" />
        <path d={poly([[772, 56], [892, 56], [900, 84], [764, 84]])} fill="hsl(var(--accent) / 0.07)" />
      </g>
      <path d={poly([[764, 84], [900, 84], [898, 92], [766, 92]])} fill="hsl(var(--accent) / 0.8)" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinejoin="round" />

      {/* ─── แผ่นสะท้อนแสง ─── */}
      <path d={standOf(REF_X, REF_TOP)} stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={poly([refAt(0, -48), refAt(8, -48), refAt(8, 48), refAt(0, 48)])} fill="hsl(var(--foreground) / 0.12)" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinejoin="round" />

      {/* ─── ซอฟต์บ็อกซ์ฟิลล์ ─── */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={standOf(1330, 100)} />
        <path d={fill.head} fill="hsl(var(--muted-foreground) / 0.3)" />
        <path d={fill.ring} fill="hsl(var(--muted-foreground) / 0.45)" />
      </g>
      <path d={fill.body} fill="hsl(206 72% 70% / 0.07)" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinejoin="round" />
      <path d={fill.diffuser} fill="hsl(206 72% 70% / 0.8)" stroke="hsl(206 72% 70%)" strokeWidth="2" strokeLinejoin="round" />

      {/* ─── เส้นพื้น จางหายที่ขอบทั้งสองข้าง ─── */}
      <rect x="0" y={GROUND} width="1440" height="1.5" fill="url(#ss-edge-fade)" />

      {/* ─── ฝุ่นลอยในลำแสง ─── */}
      <g fill="hsl(var(--accent))">
        <circle className="mote mote-1" cx="700" cy="184" r="2.4" opacity="0.5" />
        <circle className="mote mote-2" cx="780" cy="140" r="1.8" opacity="0.4" />
        <circle className="mote mote-3" cx="900" cy="216" r="2.6" opacity="0.42" />
        <circle className="mote mote-4" cx="1044" cy="168" r="2" opacity="0.32" />
        <circle className="mote mote-5" cx="646" cy="126" r="1.6" opacity="0.42" />
        <circle className="mote mote-6" cx="1160" cy="228" r="2.2" opacity="0.28" />
      </g>
    </svg>
  )
}
