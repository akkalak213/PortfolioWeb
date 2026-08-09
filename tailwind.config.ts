import type { Config } from 'tailwindcss'

/** อ่านค่าจาก CSS variable ใน globals.css เพื่อให้ opacity modifier (เช่น bg-accent/20) ยังใช้ได้ */
const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1360px' },
    },
    extend: {
      colors: {
        background: token('background'),
        foreground: token('foreground'),
        surface: { DEFAULT: token('surface'), foreground: token('surface-foreground') },
        subtle: token('subtle'),
        muted: { DEFAULT: token('muted'), foreground: token('muted-foreground') },
        border: token('border'),
        input: token('input'),
        ring: token('ring'),
        primary: { DEFAULT: token('primary'), foreground: token('primary-foreground') },
        accent: {
          DEFAULT: token('accent'),
          foreground: token('accent-foreground'),
          subtle: token('accent-subtle'),
        },
        success: token('success'),
        warning: token('warning'),
        destructive: { DEFAULT: token('destructive'), foreground: token('destructive-foreground') },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'var(--font-sans-th)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-display-th)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // สเกลหัวข้อสำหรับหน้าแบบ editorial — clamp ให้ย่อขยายตามจอโดยไม่ต้องเขียน breakpoint
        'display-sm': ['clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem)', { lineHeight: '1.15' }],
        'display-md': ['clamp(2.25rem, 1.6rem + 3vw, 3.75rem)', { lineHeight: '1.1' }],
        'display-lg': ['clamp(2.75rem, 1.8rem + 4.5vw, 5rem)', { lineHeight: '1.05' }],
        'display-xl': ['clamp(3.25rem, 1.9rem + 6vw, 6.5rem)', { lineHeight: '1' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
      },
      boxShadow: {
        soft: '0 1px 2px hsl(var(--shadow-color) / 0.04), 0 4px 16px hsl(var(--shadow-color) / 0.06)',
        lift: '0 2px 4px hsl(var(--shadow-color) / 0.05), 0 12px 32px hsl(var(--shadow-color) / 0.10)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        marquee: 'marquee 60s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
