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
          secondary: "var(--atlas-secondary)",
          "secondary-soft": "var(--atlas-secondary-soft)",
          accent: "var(--atlas-accent)",
          "accent-soft": "var(--atlas-accent-soft)",
          danger: "var(--atlas-danger)",
          "danger-soft": "var(--atlas-danger-soft)",
          success: "var(--atlas-success)",
          "success-soft": "var(--atlas-success-soft)",
          warning: "var(--atlas-warning)",
          "warning-soft": "var(--atlas-warning-soft)",
          info: "var(--atlas-info)",
          ink: "var(--atlas-ink)",
          "ink-muted": "var(--atlas-ink-muted)",
          "ink-faint": "var(--atlas-ink-faint)",
          border: "var(--atlas-border)",
          "border-strong": "var(--atlas-border-strong)",
          surface: "var(--atlas-surface)",
          "surface-muted": "var(--atlas-surface-muted)",
          background: "var(--atlas-background)",
          focus: "var(--atlas-focus)",
          "chip-active": "var(--atlas-chip-active)",
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
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "24px",
        6: "32px",
        7: "48px",
      },
      fontSize: {
        h1: ["28px", { lineHeight: "1.35", fontWeight: "700" }],
        h2: ["22px", { lineHeight: "1.4", fontWeight: "700" }],
        h3: ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.7", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      fontFamily: {
        sans: ["IRANSans", "Vazirmatn", "Tahoma", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
