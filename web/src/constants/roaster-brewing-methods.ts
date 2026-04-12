// web/src/constants/roaster-brewing-methods.ts

export const ROASTER_BREWING_METHODS = [
  { value: 'espresso',    label: 'Espresso' },
  { value: 'filter',      label: 'Filter' },
  { value: 'pour_over',   label: 'Pour over' },
  { value: 'french_press',label: 'French press' },
  { value: 'cold_brew',   label: 'Cold brew' },
  { value: 'aeropress',   label: 'AeroPress' },
  { value: 'moka_pot',    label: 'Moka pot' },
] as const

export type BrewingMethodValue = (typeof ROASTER_BREWING_METHODS)[number]['value']
