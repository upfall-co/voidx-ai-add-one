// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        sky: "var(--color-sky)",
        "btn-blue": "var(--color-btn-blue)",
        beige: "var(--color-beige)",
        black: "var(--color-black)",
      },
      animation: {
        "rotate-slow": "var(--animate-rotate-slow)",
        slosh: "var(--animate-slosh)",
        "slosh-reverse": "var(--animate-slosh-reverse)",
        lightning: "var(--animate-lightning)",
        walk: "var(--animate-walk)",
        irregular: "var(--animate-irregular)",
        "small-bounce": "var(--animate-small-bounce)",
        fluffy: "var(--animate-fluffy)",
        zigzag: "var(--animate-zigzag)",
        heartbeat: "var(--animate-heartbeat)",
        "plus-glow": "var(--animate-plus-glow)",
      },
      screens: {
        sm: "var(--breakpoint-sm)",
        md: "var(--breakpoint-md)",
        lg: "var(--breakpoint-lg)",
      },
    },
  },
  plugins: [],
} satisfies Config;
