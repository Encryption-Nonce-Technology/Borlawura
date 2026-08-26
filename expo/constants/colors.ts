const Brand = {
  appName: "BorlaWura",
  tagline: "WASTE TO WEALTH",
  heroHeadline: "Smart, On-Demand Waste Collection for Ghana",
  heroSubheadline: "Turn Waste to Wealth with Ghana's premier automated refuse pickup & recycling network.",
  currency: {
    code: "GHS",
    symbol: "₵",
    name: "Ghana Cedi",
  },
} as const;

export const WasteTiers = [
  {
    id: "small" as const,
    name: "Borla Bag",
    subtitle: "Everyday household waste (1-2 bags)",
    price: 15,
    etaMinutes: 3,
    capacity: "Up to 10kg",
    icon: "🛍️",
    badge: "Instant Bag",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "sack" as const,
    name: "Borla Sack",
    subtitle: "Heavy garden, bulk or market waste",
    price: 35,
    etaMinutes: 5,
    capacity: "Up to 35kg",
    icon: "📦",
    badge: "Heavy Sack",
    image: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "bin" as const,
    name: "Wheelie Bin",
    subtitle: "Full 240L refuse bin or commercial container",
    price: 65,
    etaMinutes: 8,
    capacity: "Up to 80kg+",
    icon: "🗑️",
    badge: "Full 240L Bin",
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "sos" as const,
    name: "SOS Express",
    subtitle: "Priority emergency collection & cleanup",
    price: 95,
    etaMinutes: 2,
    capacity: "Priority Truck",
    icon: "⚡",
    badge: "Express 2 Min",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=80",
  },
];

export const WasteCategories = [
  { id: "mixed", label: "Mixed Trash", icon: "🗑️", color: "#64748B", bg: "#F1F5F9" },
  { id: "plastic", label: "Plastics & Bottles", icon: "♻️", color: "#0284C7", bg: "#E0F2FE" },
  { id: "organic", label: "Food & Organic", icon: "🌱", color: "#2D7A4D", bg: "#DCFCE7" },
  { id: "ewaste", label: "E-Waste & Scrap", icon: "⚡", color: "#D97706", bg: "#FEF3C7" },
];

export const PresetLocations = [
  { name: "Grey Villa", address: "5th St, Grey Villa, Accra", lat: 5.6120, lng: -0.1780 },
  { name: "Spintex Rd", address: "Mango St, Spintex Rd, Accra", lat: 5.6358, lng: -0.1565 },
  { name: "East Legon", address: "Lagos Ave, East Legon, Accra", lat: 5.6358, lng: -0.1565 },
  { name: "Tema West", address: "Tema West Municipal, Greater Accra", lat: 5.6800, lng: -0.0100 },
];

const Colors = {
  light: {
    text: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    muted: "#64748B",
    background: "#F8FAFC",
    card: "#FFFFFF",
    cardHover: "#F0FDF4",
    border: "#E2E8F0",
    borderStrong: "#CBD5E1",
    // Official BorlaWura Brand Colors:
    primary: "#2D7A4D", // Forest Green
    primaryDark: "#1E5636",
    primaryLight: "#DCFCE7",
    gold: "#F5B025", // Golden Yellow (Wura)
    goldLight: "#FEF3C7",
    goldDark: "#D97706",
    accent: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
    dark: "#0B130E",
    darkSurface: "#13231B",
    black: "#000000",
  },
} as const;

export type AppColors = typeof Colors;

export { Brand };
export default Colors;
