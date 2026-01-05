import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // --- ส่วนที่ทำให้ Grid ขยับ ---
      animation: {
        "grid-flow": "grid-flow 20s linear infinite",
      },
      keyframes: {
        "grid-flow": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
      // --------------------------
    },
  },
  plugins: [],
};
export default config;