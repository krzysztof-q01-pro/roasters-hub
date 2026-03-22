export const CERTIFICATIONS = [
  "FAIR_TRADE",
  "ORGANIC",
  "RAINFOREST_ALLIANCE",
  "UTZ",
  "BIRD_FRIENDLY",
  "DIRECT_TRADE",
  "SCA_MEMBER",
  "DEMETER",
] as const;

export type Certification = (typeof CERTIFICATIONS)[number];

export const CERTIFICATION_LABELS: Record<Certification, string> = {
  FAIR_TRADE: "Fair Trade",
  ORGANIC: "Organic",
  RAINFOREST_ALLIANCE: "Rainforest Alliance",
  UTZ: "UTZ Certified",
  BIRD_FRIENDLY: "Bird Friendly",
  DIRECT_TRADE: "Direct Trade",
  SCA_MEMBER: "SCA Member",
  DEMETER: "Demeter",
};

export const CERTIFICATION_ICONS: Record<Certification, string> = {
  FAIR_TRADE: "handshake",
  ORGANIC: "eco",
  RAINFOREST_ALLIANCE: "forest",
  UTZ: "verified_user",
  BIRD_FRIENDLY: "flutter_dash",
  DIRECT_TRADE: "swap_horiz",
  SCA_MEMBER: "workspace_premium",
  DEMETER: "agriculture",
};

export const ROAST_STYLES = [
  "Light",
  "Medium",
  "Dark",
  "Espresso",
  "Filter",
] as const;

export type RoastStyle = (typeof ROAST_STYLES)[number];

export const ORIGINS = [
  "Ethiopia",
  "Kenya",
  "Colombia",
  "Brazil",
  "Guatemala",
  "Costa Rica",
  "Honduras",
  "Peru",
  "Rwanda",
  "Burundi",
  "Indonesia",
  "India",
  "Panama",
  "El Salvador",
  "Mexico",
  "Yemen",
  "Congo",
  "Uganda",
] as const;
