/**
 * ฉากสตูดิโอ — เป็นพื้นห้องของทั้ง section ไม่ใช่รูปที่แปะไว้ข้าง ๆ ข้อความ
 *
 * บทเรียนจากสองรอบก่อน
 *
 * รอบแรก วางแต่ละชิ้นด้วยพิกัดที่กะเอาทีละตัว ขาตั้งไฟทะลุพื้น 26px
 * ขาตั้งกล้องทะลุ 64px และแท่นวางสินค้าลอยเหนือพื้น 60px
 * แก้ด้วยการยึด GROUND เป็นค่าคงที่เดียวและแปลงความสูงจากเมตรผ่านฟังก์ชันเดียว
 *
 * รอบสอง วาดหัวโคมเป็นสี่เหลี่ยมด้านขนานด้วยมือ แล้ววาดขายึดเป็นเส้นแยกอีกชุด
 * สองชิ้นจึงไม่ตรงกันและมองเห็นเป็นกรอบซ้อนคนละมุม ซ้ำร้ายเสาขาตั้งลากผ่านกลางโคม
 * เพราะไม่ได้กันพื้นที่ให้หัวโคมไว้
 *
 * รอบนี้หัวโคมทุกตัวเป็น rect จริงที่หมุนด้วย transform รอบจุดศูนย์กลางของมันเอง
 * รูปทรงจึงเป๊ะเสมอโดยไม่ต้องคำนวณมุมเอง และวางจุดศูนย์กลางให้สูงกว่าปลายเสา
 * ครึ่งหนึ่งของเส้นทแยง ขอบล่างของโคมจึงมาจบที่ปลายเสาพอดี ไม่มีเสาโผล่ทะลุ
 */

/** เส้นพื้นห้อง ทุกชิ้นที่ตั้งอยู่บนพื้นต้องจบที่ค่านี้ */
const GROUND = 296

/**
 * ความสูงจริงของอุปกรณ์ หน่วยเป็นเมตร คูณ 100 เป็นหน่วยใน viewBox
 * ปัดเศษเพราะทศนิยมลอยตัวทำให้ค่าอย่าง 2.2 เมตร ออกมาเป็น 75.99999999999997 ในมาร์กอัป
 */
const m = (meters: number) => Math.round(GROUND - meters * 100)

/**
 * โคมไฟหนึ่งตัว = เสา + ขาสามขา + หัวโคมที่หมุนได้
 *
 * พิกัดมุมของหน้าโคมหลังหมุนถูกส่งเข้ามาเป็น prop เพราะลำแสงต้องเริ่มจากตรงนั้นพอดี
 * ถ้าปล่อยให้เดาเอา ลำแสงจะลอยออกมาจากที่ว่างข้างโคมแบบรอบที่แล้ว
 */
type FixtureProps = {
  /** ตำแหน่งเสาในแนวนอน */
  x: number
  /** ปลายบนของเสา หัวโคมจะมานั่งพอดีตรงนี้ */
  poleTop: number
  /** ขนาดหน้าโคม */
  w: number
  h: number
  /** มุมเอียง องศา บวกคือเอียงตามเข็ม */
  angle: number
  /** ครึ่งหนึ่งของเส้นทแยงมุม ใช้ยกจุดศูนย์กลางขึ้นให้ขอบล่างจบที่ปลายเสา */
  lift: number
  face: 'warm' | 'cool' | 'flag'
  className?: string
}

function Fixture({ x, poleTop, w, h, angle, lift, face, className }: FixtureProps) {
  const cy = poleTop - lift
  const fills = {
    warm: 'url(#scene-face-key)',
    cool: 'url(#scene-face-fill)',
    flag: 'hsl(var(--foreground) / 0.07)',
  }
  const strokes = {
    warm: 'hsl(var(--accent))',
    cool: 'hsl(206 72% 70%)',
    flag: 'hsl(var(--muted-foreground))',
  }

  return (
    <g>
      {/* เสาและขาสามขา ปลายขาจบที่เส้นพื้นทุกเส้น */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round">
        <path d={`M${x} ${poleTop} V${GROUND}`} />
        <path d={`M${x} ${GROUND - 26} L${x - 26} ${GROUND}`} />
        <path d={`M${x} ${GROUND - 26} L${x + 26} ${GROUND}`} />
      </g>
      {/* หัวหมุนตรงปลายเสา */}
      <circle cx={x} cy={poleTop} r="4" fill="hsl(var(--muted-foreground))" />

      <g className={className} transform={`rotate(${angle} ${x} ${cy})`}>
        <rect
          x={x - w / 2}
          y={cy - h / 2}
          width={w}
          height={h}
          rx="3"
          fill={fills[face]}
          stroke={strokes[face]}
          strokeWidth="2"
        />
        {/* เส้นแบ่งผ้ากระจายแสงกลางบาน ให้อ่านออกว่าเป็นซอฟต์บ็อกซ์ ไม่ใช่แผ่นทึบ */}
        {face !== 'flag' && (
          <path
            d={`M${x - w / 2 + 7} ${cy} H${x + w / 2 - 7}`}
            stroke={strokes[face]}
            strokeWidth="1.5"
            opacity="0.55"
          />
        )}
      </g>
    </g>
  )
}

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
        <linearGradient id="scene-beam-key" x1="0.25" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.32" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="scene-beam-fill" x1="0.8" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="hsl(206 72% 70%)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="hsl(206 72% 70%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="scene-bounce" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.12" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="scene-face-key" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.42" />
        </linearGradient>
        <linearGradient id="scene-face-fill" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(206 78% 80%)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="hsl(206 78% 80%)" stopOpacity="0.38" />
        </linearGradient>

        <radialGradient id="scene-pool">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.22" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </radialGradient>

        {/*
          ฉากหลังใช้ไล่สีแบบรัศมีที่จางหายก่อนถึงขอบรูปทรง
          รอบที่แล้วใช้สีทึบ ขอบตั้งสองข้างเลยกลายเป็นแผ่นสี่เหลี่ยมลอยอยู่กลางฉาก
        */}
        <radialGradient id="scene-cyc" cx="0.5" cy="0.9" r="0.72">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.1" />
          <stop offset="65%" stopColor="hsl(var(--foreground))" stopOpacity="0.045" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="scene-floor-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--border))" stopOpacity="0" />
          <stop offset="20%" stopColor="hsl(var(--border))" stopOpacity="1" />
          <stop offset="80%" stopColor="hsl(var(--border))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(var(--border))" stopOpacity="0" />
        </linearGradient>

        {/* เส้นโค้งของฉากหลังจางหายที่ปลายทั้งสองข้าง ไม่ตัดจบห้วน ๆ */}
        <linearGradient id="scene-cyc-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--border))" stopOpacity="0" />
          <stop offset="35%" stopColor="hsl(var(--border))" stopOpacity="0.9" />
          <stop offset="65%" stopColor="hsl(var(--border))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--border))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ─── ฉากหลังกระดาษโค้ง ─── */}
      <path
        d="M620 0 H1160 V228 C1160 268 1122 292 1072 296 H708 C658 292 620 268 620 228 Z"
        fill="url(#scene-cyc)"
      />
      <path
        d="M620 228 C620 268 658 292 708 296 H1072 C1122 292 1160 268 1160 228"
        stroke="url(#scene-cyc-line)"
        strokeWidth="1.5"
      />

      <ellipse cx="830" cy={GROUND} rx="300" ry="34" fill="url(#scene-pool)" />

      {/*
        ลำแสง พิกัดต้นทางคือมุมของหน้าโคมหลังหมุนแล้ว คำนวณจากค่าเดียวกับที่ส่งให้ Fixture
        คีย์ ศูนย์กลาง (455,98) ขนาด 56x84 หมุน 30 องศา ขอบขวาอยู่ที่ (500,76) ถึง (458,148)
      */}
      <path className="beam beam-key" d="M500 76 L1030 296 L700 296 L458 148 Z" fill="url(#scene-beam-key)" />
      {/* ฟิลล์ ศูนย์กลาง (1330,66) ขนาด 48x72 หมุน -28 องศา ขอบซ้ายอยู่ที่ (1292,46) ถึง (1326,109) */}
      <path className="beam beam-fill" d="M1292 46 L1326 109 L1060 296 L900 296 Z" fill="url(#scene-beam-fill)" />
      {/* แสงสะท้อนกลับจากแผ่นรีเฟลกซ์ ศูนย์กลาง (1180,146) ขนาด 44x88 หมุน -20 องศา */}
      <path className="beam beam-bounce" d="M1144 112 L1174 195 L940 296 L862 296 Z" fill="url(#scene-bounce)" />

      {/* ─── เงาบนพื้น วางก่อนวัตถุ ─── */}
      <g fill="hsl(240 20% 2%)" opacity="0.45">
        <ellipse cx="96" cy={GROUND} rx="52" ry="6" />
        <ellipse cx="250" cy={GROUND} rx="54" ry="6" />
        <ellipse cx="455" cy={GROUND} rx="46" ry="6" />
        <ellipse cx="830" cy={GROUND} rx="98" ry="9" />
        <ellipse cx="1180" cy={GROUND} rx="42" ry="6" />
        <ellipse cx="1330" cy={GROUND} rx="38" ry="6" />
      </g>

      {/* ─── กล่องแอปเปิลซ้อนกัน ของประจำสตูดิโอ ช่วยไม่ให้ฝั่งซ้ายโล่ง ─── */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="52" y={m(0.26)} width="88" height="26" rx="3" fill="hsl(var(--foreground) / 0.05)" />
        <rect x="60" y={m(0.5)} width="72" height="24" rx="3" fill="hsl(var(--foreground) / 0.05)" />
        <rect x="70" y={m(0.72)} width="52" height="22" rx="3" fill="hsl(var(--foreground) / 0.05)" />
      </g>

      {/* ─── กล้องบนขาตั้ง สูง 1.44 เมตร ─── */}
      <g stroke="hsl(var(--muted-foreground))" strokeWidth="2.5" strokeLinecap="round">
        <path d={`M250 ${m(1.44)} L212 ${GROUND}`} />
        <path d={`M250 ${m(1.44)} L288 ${GROUND}`} />
        <path d={`M250 ${m(1.44)} L250 ${GROUND}`} />
        <path d={`M226 ${m(1.44)} H274`} />
      </g>
      <g className="camera">
        <rect
          x="222"
          y={m(1.72)}
          width="62"
          height="32"
          rx="5"
          fill="hsl(var(--surface))"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
        />
        <rect
          x="236"
          y={m(1.84)}
          width="26"
          height="12"
          rx="3"
          fill="hsl(var(--surface))"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
        />
        <rect
          x="284"
          y={m(1.66)}
          width="30"
          height="20"
          rx="4"
          fill="hsl(var(--accent) / 0.18)"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
        />
        <circle className="rec-dot" cx="274" cy={m(1.78)} r="4" fill="hsl(var(--accent))" />
      </g>

      {/* ─── ซอฟต์บ็อกซ์คีย์ เสาสูงถึง y=148 หัวโคมนั่งพอดีบนปลายเสา ─── */}
      <Fixture x={455} poleTop={148} w={56} h={84} angle={30} lift={50} face="warm" className="lamp lamp-key" />

      {/* ─── สินค้าบนแท่นถ่าย สูง 0.34 เมตร ─── */}
      <g stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="760" y={m(0.34)} width="140" height="34" rx="4" fill="hsl(var(--foreground) / 0.07)" />
        <rect x="800" y={m(1)} width="62" height="66" rx="4" fill="hsl(var(--accent) / 0.16)" />
        <rect x="764" y={m(0.68)} width="30" height="34" rx="3" fill="hsl(var(--accent) / 0.09)" />
      </g>

      {/* ─── แผ่นสะท้อนแสง เอียงเข้าหาตัวแบบ ─── */}
      <Fixture x={1180} poleTop={195} w={44} h={88} angle={-20} lift={49} face="flag" />

      {/* ─── ซอฟต์บ็อกซ์ฟิลล์ ยกสูงกว่าคีย์ ─── */}
      <Fixture x={1330} poleTop={109} w={48} h={72} angle={-28} lift={43} face="cool" className="lamp lamp-fill" />

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
