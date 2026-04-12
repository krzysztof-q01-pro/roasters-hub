// web/src/lib/enrichment/schemas/cafe.schema.ts

import type { EntitySchema } from './types'

export const CafeSchema: EntitySchema = {
  entityType: 'CAFE',
  fields: [
    // IDENTITY
    { key: 'name',          group: 'IDENTITY',    priority: 'REQUIRED'   },
    { key: 'description',   group: 'IDENTITY',    priority: 'IMPORTANT'  },
    // LOCATION
    { key: 'country',       group: 'LOCATION',    priority: 'REQUIRED'   },
    { key: 'city',          group: 'LOCATION',    priority: 'REQUIRED'   },
    { key: 'address',       group: 'LOCATION',    priority: 'REQUIRED'   },
    { key: 'lat',           group: 'LOCATION',    priority: 'IMPORTANT'  },
    { key: 'lng',           group: 'LOCATION',    priority: 'IMPORTANT'  },
    { key: 'postalCode',    group: 'LOCATION',    priority: 'OPTIONAL'   },
    // CONTACT
    { key: 'website',       group: 'CONTACT',     priority: 'IMPORTANT'  },
    { key: 'phone',         group: 'CONTACT',     priority: 'IMPORTANT'  },
    { key: 'email',         group: 'CONTACT',     priority: 'OPTIONAL'   },
    // SOCIAL
    { key: 'instagram',     group: 'SOCIAL',      priority: 'OPTIONAL'   },
    // ENRICHMENT
    { key: 'openingHours',  group: 'ENRICHMENT',  priority: 'IMPORTANT'  },
    { key: 'serving',       group: 'ENRICHMENT',  priority: 'IMPORTANT',  isArray: true },
    { key: 'services',      group: 'ENRICHMENT',  priority: 'OPTIONAL',   isArray: true },
    { key: 'priceRange',    group: 'ENRICHMENT',  priority: 'OPTIONAL'   },
    { key: 'seatingCapacity', group: 'ENRICHMENT', priority: 'OPTIONAL'  },
  ],
}
