export const colors = {
  primary: "#FF3737",
  primaryHover: "#E62E2E",
  primarySoft: "#FFE5E5",
  secondary: "#1A1A1A",
  secondarySoft: "#F3F4F6",
  accent: "#6B7280",
  accentSoft: "#F3F4F6",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
  success: "#16A34A",
  successSoft: "#DCFCE7",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  info: "#4B5563",
  ink: "#111111",
  inkMuted: "#52525B",
  inkFaint: "#A1A1AA",
  border: "#E4E4E7",
  borderStrong: "#A1A1AA",
  surface: "#FFFFFF",
  surfaceMuted: "#F4F4F5",
  background: "#FAFAFA",
  focus: "#FF3737",
  chipActive: "#111111",
  chipActiveText: "#FFFFFF",
} as const;

/** 8px grid */
export const space = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "24px",
  6: "32px",
  7: "48px",
} as const;

export const radii = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
} as const;

export const typography = {
  fontFamily: "IRANSans, Vazirmatn, Tahoma, sans-serif",
  fontFamilyLatin: "Inter, IRANSans, sans-serif",
  sizes: {
    h1: "28px",
    h2: "22px",
    h3: "18px",
    body: "14px",
    caption: "12px",
  },
  weights: {
    regular: 400,
    semibold: 600,
    bold: 700,
  },
} as const;
