// web/src/constants/cafe-services.ts

export const CAFE_SERVICES = [
  { value: 'wifi',             label: 'Wi-Fi',            group: 'amenities' },
  { value: 'workspace',        label: 'Workspace',        group: 'amenities' },
  { value: 'outdoor_seating',  label: 'Outdoor seating',  group: 'amenities' },
  { value: 'dog_friendly',     label: 'Dog friendly',     group: 'amenities' },
  { value: 'vegan',            label: 'Vegan options',    group: 'food' },
  { value: 'vegetarian',       label: 'Vegetarian',       group: 'food' },
  { value: 'food',             label: 'Food menu',        group: 'food' },
  { value: 'specialty_only',   label: 'Specialty only',   group: 'coffee' },
  { value: 'alternative_brew', label: 'Alt brew methods', group: 'coffee' },
  { value: 'takeaway',         label: 'Takeaway',         group: 'service' },
  { value: 'in_store',         label: 'Dine in',          group: 'service' },
  { value: 'events',           label: 'Events',           group: 'service' },
  { value: 'cuppings',         label: 'Cuppings',         group: 'service' },
] as const

export type CafeServiceValue = (typeof CAFE_SERVICES)[number]['value']
