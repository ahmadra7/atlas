export const colors = {
  primary: "#D4022F",
  primaryHover: "#B80128",
  primarySoft: "#FBE6EA",
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
  focus: "#D4022F",
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
  fontFamily: "Dana, sans-serif",
  fontFamilyLatin: "Dana, sans-serif",
  sizes: {
    h1: "30px",
    h2: "24px",
    h3: "19px",
    body: "16px",
    caption: "14px",
  },
  weights: {
    thin: 100,
    ultralight: 200,
    light: 300,
    regular: 400,
    medium: 500,
    demibold: 600,
    bold: 700,
    extrabold: 800,
    heavy: 850,
    black: 900,
    extrablack: 950,
  },
} as const;
