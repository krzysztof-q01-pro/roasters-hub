export const CAFE_SERVICES = [
  "Free Wi-Fi",
  "Laptop Friendly",
  "Kids Friendly",
  "Vegan Options",
  "Dog Friendly",
  "Outdoor Seating",
  "Accept Credit Cards",
  "Wheelchair access",
] as const;

export type CafeService = (typeof CAFE_SERVICES)[number];

export const CAFE_SERVICE_LABELS: Record<CafeService, string> = {
  "Free Wi-Fi": "Free Wi-Fi",
  "Laptop Friendly": "Laptop Friendly",
  "Kids Friendly": "Kids Friendly",
  "Vegan Options": "Vegan Options",
  "Dog Friendly": "Dog Friendly",
  "Outdoor Seating": "Outdoor Seating",
  "Accept Credit Cards": "Accept Credit Cards",
  "Wheelchair access": "Wheelchair access",
};

export const CAFE_SERVICE_ICONS: Record<CafeService, string> = {
  "Free Wi-Fi": "wifi",
  "Laptop Friendly": "laptop_mac",
  "Kids Friendly": "child_friendly",
  "Vegan Options": "eco",
  "Dog Friendly": "pets",
  "Outdoor Seating": "park",
  "Accept Credit Cards": "credit_card",
  "Wheelchair access": "accessible",
};
