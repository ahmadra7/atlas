import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        atlas: {
          primary: "var(--atlas-primary)",
          "primary-hover": "var(--atlas-primary-hover)",
          "primary-soft": "var(--atlas-primary-soft)",
          accent: "var(--atlas-accent)",
          "accent-soft": "var(--atlas-accent-soft)",
          danger: "var(--atlas-danger)",
          "danger-soft": "var(--atlas-danger-soft)",
          success: "var(--atlas-success)",
          "success-soft": "var(--atlas-success-soft)",
          warning: "var(--atlas-warning)",
          "warning-soft": "var(--atlas-warning-soft)",
          ink: "var(--atlas-ink)",
          "ink-muted": "var(--atlas-ink-muted)",
          "ink-faint": "var(--atlas-ink-faint)",
          border: "var(--atlas-border)",
          "border-strong": "var(--atlas-border-strong)",
          surface: "var(--atlas-surface)",
          "surface-muted": "var(--atlas-surface-muted)",
          background: "var(--atlas-background)",
          focus: "var(--atlas-focus)",
        },
      },
      borderRadius: {
        atlas: "var(--atlas-radius-md)",
        "atlas-lg": "var(--atlas-radius-lg)",
        "atlas-xl": "var(--atlas-radius-xl)",
      },
      boxShadow: {
        atlas: "var(--atlas-shadow)",
      },
      fontFamily: {
        sans: ["var(--font-vazirmatn)", "Vazirmatn", "Tahoma", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
