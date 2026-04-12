// web/src/lib/enrichment/schemas/roaster.schema.ts

import type { EntitySchema } from './types'

export const RoasterSchema: EntitySchema = {
  entityType: 'ROASTER',
  fields: [
    // IDENTITY
    { key: 'name',                 group: 'IDENTITY',  priority: 'REQUIRED'   },
    { key: 'description',          group: 'IDENTITY',  priority: 'IMPORTANT'  },
    { key: 'foundedYear',          group: 'IDENTITY',  priority: 'OPTIONAL'   },
    // LOCATION
    { key: 'country',              group: 'LOCATION',  priority: 'REQUIRED'   },
    { key: 'city',                 group: 'LOCATION',  priority: 'REQUIRED'   },
    { key: 'address',              group: 'LOCATION',  priority: 'IMPORTANT'  },
    { key: 'lat',                  group: 'LOCATION',  priority: 'IMPORTANT'  },
    { key: 'lng',                  group: 'LOCATION',  priority: 'IMPORTANT'  },
    { key: 'postalCode',           group: 'LOCATION',  priority: 'OPTIONAL'   },
    // CONTACT
    { key: 'website',              group: 'CONTACT',   priority: 'IMPORTANT'  },
    { key: 'email',                group: 'CONTACT',   priority: 'IMPORTANT'  },
    { key: 'phone',                group: 'CONTACT',   priority: 'IMPORTANT'  },
    { key: 'shopUrl',              group: 'CONTACT',   priority: 'OPTIONAL'   },
    // SOCIAL
    { key: 'instagram',            group: 'SOCIAL',    priority: 'OPTIONAL'   },
    { key: 'facebook',             group: 'SOCIAL',    priority: 'OPTIONAL'   },
    // PRODUCT
    { key: 'origins',              group: 'PRODUCT',   priority: 'IMPORTANT',  isArray: true },
    { key: 'roastStyles',          group: 'PRODUCT',   priority: 'IMPORTANT',  isArray: true },
    { key: 'certifications',       group: 'PRODUCT',   priority: 'OPTIONAL',   isArray: true },
    { key: 'brewingMethods',       group: 'PRODUCT',   priority: 'OPTIONAL',   isArray: true },
    { key: 'wholesaleAvailable',   group: 'PRODUCT',   priority: 'OPTIONAL'   },
    { key: 'subscriptionAvailable',group: 'PRODUCT',   priority: 'OPTIONAL'   },
    // VISIT
    { key: 'openingHours',         group: 'VISIT',     priority: 'OPTIONAL'   },
    { key: 'hasCafe',              group: 'VISIT',     priority: 'OPTIONAL'   },
    { key: 'hasTastingRoom',       group: 'VISIT',     priority: 'OPTIONAL'   },
  ],
}
