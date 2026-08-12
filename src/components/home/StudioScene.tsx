/**
 * ฉากสตูดิโอ — เป็นพื้นห้องของทั้ง section ไม่ใช่รูปที่แปะไว้ข้าง ๆ ข้อความ
 *
 * ฉากนี้ประกอบและตรวจด้วยตาใน Figma ก่อน แล้วยกเรขาคณิตชุดเดียวกันมาเขียนเป็น SVG
 * สองรอบก่อนหน้าวาดโดยกะพิกัดเอาแล้วตรวจไม่ได้ว่าออกมาหน้าตายังไง จึงพลาดเรื่องพื้นฐาน
 *   รอบแรก ขาตั้งทะลุพื้น 26 ถึง 64px และแท่นวางของลอยเหนือพื้น 60px
 *   รอบสอง เสาขาตั้งลากผ่านกลางโคมไฟ และกรอบโคมซ้อนกันคนละมุม
 *
 * กติกาที่ยึดรอบนี้
 *   ทุกชิ้นที่ตั้งบนพื้นวัดจาก GROUND ค่าเดียว
 *   มาตราส่วน 100 หน่วยเท่ากับ 1 เมตร ความสูงทุกอย่างจึงเทียบกันได้จริง
 *   โคมไฟคำนวณในระบบพิกัดของตัวเองโดยให้จุดยึดอยู่ที่ปลายเสา แล้วหมุนตามทิศเล็ง
 *     ชิ้นส่วนของโคมจึงประกอบกันสนิทเสมอ ไม่ว่าจะเล็งไปทางไหน
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
 * จุดยึดอยู่ที่ (0,0) และหันไปทาง +x แล้วหมุนไปตามทิศที่เล็งตัวแบบ
 */
function lamp(x: number, top: number, aim: Pt, depth: number, half: number) {
  const th = Math.atan2(aim[1] - top, aim[0] - x)
  const cos = Math.cos(th)
  const sin = Math.sin(th)
  const at = (lx: number, ly: number): Pt => [x + lx * cos - ly * sin, top + lx * sin + ly * cos]

  return {
    dir: [cos, sin] as Pt,
    /** หัวไฟหลังสปีดริง */
    head: poly([at(-22, -9), at(-6, -9), at(-6, 9), at(-22, 9)]),
    /** สปีดริงที่ผ้ายึดเข้ากับหัวไฟ ทำให้ฐานกล่องไม่แหลมเป็นปลายกรวย */
    ring: poly([at(-6, -13), at(0, -13), at(0, 13), at(-6, 13)]),
    /** ผ้าคลุมทรงพีระมิดตัดปลาย */
    body: poly([at(0, -13), at(depth, -half), at(depth, half), at(0, 13)]),
    /** หน้ากระจายแสงเป็นแผงหนามีขอบของตัวเอง จุดนี้คือสิ่งที่ทำให้อ่านออกว่าเป็นซอฟต์บ็อกซ์ */
    diffuser: poly([
      at(depth - 9, -half + 3),
      at(depth, -half),
      at(depth, half),
      at(depth - 9, half - 3),
    ]),
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

  return {
    d: poly([faceTop, endTop, endBot, faceBot]),
    from: mid(faceTop, faceBot),
    to: mid(endTop, endBot),
  }
}

const key = lamp(560, 96, [830, 236], 58, 44)
const fill = lamp(1330, 100, [886, 240], 48, 34)
const keyBeam = beamOf(key.faceTop, key.faceBot, key.dir)
const fillBeam = beamOf(fill.faceTop, fill.faceBot, fill.dir)

// แผ่นสะท้อนแสงเป็นแผ่นแบนบนขาตั้ง วาดต่างจากซอฟต์บ็อกซ์เพื่อให้อ่านออกว่าคนละอย่าง
const REF_X = 1150
const REF_TOP = 188
const refTh = Math.atan2(248 - REF_TOP, 890 - REF_X)
const refAt = (lx: number, ly: number): Pt => [
  REF_X + lx * Math.cos(refTh) - ly * Math.sin(refTh),
  REF_TOP + lx * Math.sin(refTh) + ly * Math.cos(refTh),
]
const refPanel = poly([refAt(0, -48), refAt(8, -48), refAt(8, 48), refAt(0, 48)])
const bounce = beamOf(refAt(8, -48), refAt(8, 48), [Math.cos(refTh), Math.sin(refTh)], 210)

/** ขาตั้งสามขา ปลายขาจบที่เส้นพื้นทุกเส้น */
const standOf = (x: number, top: number) =>
  `M ${x} ${top} V ${GROUND} M ${x - 26} ${GROUND} L ${x} ${GROUND - 28} L ${x + 26} ${GROUND}`

const CAM_X = 350
const CAM_Y = m(1.5)
const TABLE = m(0.78)

export function StudioScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="ภาพจำลองสตูดิโอถ่ายภาพ มีกล้องบนขาตั้ง ซอฟต์บ็อกซ์สองดวง แผ่นสะท้อนแสง ฉากหลังกระดาษโค้ง และสินค้าบนโต๊ะถ่าย"
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="ss-cyc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.012" />
          <stop offset="55%" stopColor="hsl(var(--foreground))" stopOpacity="0.035" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.065" />
        </linearGradient>

        {/*
          ขอบตั้งซ้ายขวาของฉากหลังจะมองเห็นเป็นเส้นตรง เพราะแผ่นสว่างกว่าพื้นหลังราวหกเปอร์เซ็นต์
          ครอบด้วยหน้ากากที่จางหายทางด้านข้าง ผนังจึงค่อย ๆ กลืนเข้าไปในความมืด
        */}
        <linearGradient id="ss-cyc-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="26%" stopColor="#fff" stopOpacity="1" />
          <stop offset="74%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="ss-cyc-mask">
          <rect x="600" y="-10" width="572" height="330" fill="url(#ss-cyc-fade)" />
        </mask>

        <linearGradient id="ss-edge-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--border))" stopOpacity="0" />
          <stop offset="22%" stopColor="hsl(var(--border))" stopOpacity="1" />
          <stop offset="78%" stopColor="hsl(var(--border))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--border))" stopOpacity="0" />
        </linearGradient>

        {/*
          ลำแสงไล่ตามแกนจากกลางหน้าโคมไปหาจุดที่แสงตกพื้น ไม่ใช่แกนบนลงล่างตายตัว
          ถ้าใช้แกนตายตัว ขอบกรอบของรูปทรงจะกลายเป็นแถบสว่างตัดคมที่ไม่เกี่ยวกับตัวไฟเลย
        */}
        <linearGradient
          id="ss-beam-key"
          gradientUnits="userSpaceOnUse"
          x1={keyBeam.from[0]}
          y1={keyBeam.from[1]}
          x2={keyBeam.to[0]}
          y2={keyBeam.to[1]}
        >
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
          <stop offset="30%" stopColor="hsl(var(--accent))" stopOpacity="0.22" />
          <stop offset="65%" stopColor="hsl(var(--accent))" stopOpacity="0.07" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="ss-beam-fill"
          gradientUnits="userSpaceOnUse"
          x1={fillBeam.from[0]}
          y1={fillBeam.from[1]}
          x2={fillBeam.to[0]}
          y2={fillBeam.to[1]}
        >
          <stop offset="0%" stopColor="hsl(206 72% 70%)" stopOpacity="0.27" />
          <stop offset="30%" stopColor="hsl(206 72% 70%)" stopOpacity="0.15" />
          <stop offset="65%" stopColor="hsl(206 72% 70%)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="hsl(206 72% 70%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="ss-beam-bounce"
          gradientUnits="userSpaceOnUse"
          x1={bounce.from[0]}
          y1={bounce.from[1]}
          x2={bounce.to[0]}
          y2={bounce.to[1]}
        >
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.08" />
          <stop offset="70%" stopColor="hsl(var(--accent))" stopOpacity="0.02" />
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
        <radialGradient id="ss-shadow">
          <stop offset="0%" stopColor="hsl(240 20% 2%)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="hsl(240 20% 2%)" stopOpacity="0" />
        </radialGradient>

        {/* เบลอเฉพาะชั้นแสง ทำให้ขอบลำแสงนุ่มแทนที่จะเป็นรูปทรงเรขาคณิตขอบคม */}
        <filter id="ss-soft" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="ss-soft-sm" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* ─── ฉากหลังกระดาษโค้ง ผนังไหลลงมาต่อเป็นพื้นโดยไม่มีมุมหัก ─── */}
      <g mask="url(#ss-cyc-mask)">
        <path
          d="M 636 0 L 1132 0 L 1132 232 C 1132 272 1096 292 1046 296 L 722 296 C 672 292 636 272 636 232 Z"
          fill="url(#ss-cyc)"
        />
      </g>
      <path
        d="M 636 232 C 636 272 672 292 722 296 M 1132 232 C 1132 272 1096 292 1046 296"
        stroke="url(#ss-edge-fade)"
        strokeWidth="1.5"
      />

      <ellipse cx="830" cy={GROUND} rx="300" ry="34" fill="url(#ss-pool)" />

      {/* ─── ลำแสง ─── */}
      <g filter="url(#ss-soft)">
        <path className="beam beam-key" d={keyBeam.d} fill="url(#ss-beam-key)" />
        <path className="beam beam-fill" d={fillBeam.d} fill="url(#ss-beam-fill)" />
        <path className="beam beam-bounce" d={bounce.d} fill="url(#ss-beam-bounce)" />
      </g>
      <g filter="url(#ss-soft-sm)">
        <ellipse
          className="lamp lamp-key"
          cx={key.faceMid[0]}
          cy={key.faceMid[1]}
          rx="86"
          ry="73"
          fill="url(#ss-hot-key)"
        />
        <ellipse
          className="lamp lamp-fill"
          cx={fill.faceMid[0]}
          cy={fill.faceMid[1]}
          rx="66"
          ry="56"
          fill="url(#ss-hot-fill)"
        />
      </g>

      {/* ─── เงาบนพื้น วางก่อนวัตถุ ─── */}
      <g>
        {([
          [152, 52],
          [CAM_X, 56],
          [560, 44],
          [830, 110],
          [REF_X, 38],
          [1330, 36],
        ] as Pt[]).map(([cx, rx]) => (
          <ellipse key={cx} cx={cx} cy={GROUND} rx={rx} ry="7" fill="url(#ss-shadow)" />
        ))}
      </g>

      {/* ─── กล่องแอปเปิลซ้อนกัน ของประจำสตูดิโอ กันไม่ให้ฝั่งซ้ายโล่ง ─── */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="108" y={m(0.26)} width="88" height="26" rx="2" fill="hsl(var(--foreground) / 0.05)" />
        <rect x="116" y={m(0.5)} width="72" height="24" rx="2" fill="hsl(var(--foreground) / 0.05)" />
        <rect x="126" y={m(0.72)} width="52" height="22" rx="2" fill="hsl(var(--foreground) / 0.05)" />
      </g>

      {/* ─── กล้องบนขาตั้ง สูง 1.5 เมตร ─── */}
      <path
        d={`M ${CAM_X - 38} ${GROUND} L ${CAM_X} ${CAM_Y} L ${CAM_X + 38} ${GROUND} M ${CAM_X} ${CAM_Y} V ${GROUND} M ${CAM_X - 24} ${CAM_Y} H ${CAM_X + 24}`}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g className="camera" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinejoin="round">
        <rect x={CAM_X - 30} y={CAM_Y - 34} width="64" height="34" rx="3" fill="hsl(var(--foreground) / 0.08)" />
        <rect x={CAM_X - 14} y={CAM_Y - 46} width="26" height="12" rx="2" fill="hsl(var(--foreground) / 0.08)" />
        <rect x={CAM_X + 34} y={CAM_Y - 27} width="32" height="19" rx="3" fill="hsl(var(--accent) / 0.18)" />
      </g>
      <circle className="rec-dot" cx={CAM_X + 22} cy={CAM_Y - 26} r="4" fill="hsl(var(--accent))" />

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
        {/* ขวดสูง 0.32 เมตร กล่อง 0.2 เมตร เป็นขนาดของจริงตามมาตราส่วนเดียวกัน */}
        <path
          d={`M 828 ${TABLE} V ${TABLE - 20} C 828 ${TABLE - 27} 834 ${TABLE - 30} 834 ${TABLE - 36} V ${TABLE - 46} H 830 V ${TABLE - 52} H 852 V ${TABLE - 46} H 848 V ${TABLE - 36} C 848 ${TABLE - 30} 854 ${TABLE - 27} 854 ${TABLE - 20} V ${TABLE} Z`}
          fill="hsl(var(--accent) / 0.2)"
        />
        <rect x="786" y={TABLE - 20} width="34" height="20" rx="2" fill="hsl(var(--accent) / 0.1)" />
        <rect x="762" y={TABLE - 9} width="18" height="9" rx="2" fill="hsl(var(--foreground) / 0.08)" />
      </g>
      <path
        d={`M 754 ${TABLE + 12} V ${GROUND} M 906 ${TABLE + 12} V ${GROUND} M 754 ${GROUND - 26} H 906`}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* ─── แผ่นสะท้อนแสง ─── */}
      <path
        d={standOf(REF_X, REF_TOP)}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={refPanel} fill="hsl(var(--foreground) / 0.12)" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinejoin="round" />

      {/* ─── ซอฟต์บ็อกซ์ฟิลล์ ยกสูงกว่าคีย์เล็กน้อย ─── */}
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
