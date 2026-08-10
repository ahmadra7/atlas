export const colors = {
  primary: "#2F5D50",
  primaryHover: "#254A40",
  primarySoft: "#E4F0EC",
  accent: "#C9782A",
  accentSoft: "#F8EBD8",
  danger: "#B42318",
  dangerSoft: "#FEE4E2",
  success: "#2F7D4A",
  successSoft: "#E4F5EA",
  warning: "#B54708",
  warningSoft: "#FEF0C7",
  ink: "#1C2421",
  inkMuted: "#5C6B65",
  inkFaint: "#8A968F",
  border: "#D7E0DB",
  borderStrong: "#B7C5BE",
  surface: "#FFFFFF",
  surfaceMuted: "#F3F6F4",
  background: "#EEF3F0",
  focus: "#3A7A68",
} as const;

export const radii = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
} as const;

export const space = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
} as const;

export const typography = {
  fontFamily:
    "var(--font-vazirmatn), Vazirmatn, Tahoma, 'Segoe UI', sans-serif",
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
} as const;
