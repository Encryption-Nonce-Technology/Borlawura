const Brand = {
  appName: "BorlaWura",
  tagline: "Snap it. Request it. It\u2019s gone.",
  currency: {
    code: "GHS",
    symbol: "₵",
    name: "Ghana cedi",
  },
} as const;

const Colors = {
  light: {
    text: "#0B1220",
    background: "#FFFFFF",
    card: "#FFFFFF",
    muted: "#6B7280",
    border: "#E5E7EB",
    primary: "#10B981",
    primaryDark: "#059669",
    accent: "#0EA5E9",
    danger: "#EF4444",
    warning: "#F59E0B",
  },
} as const;

export type AppColors = typeof Colors;

export { Brand };
export default Colors;
