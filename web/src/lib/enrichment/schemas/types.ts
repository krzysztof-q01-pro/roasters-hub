// web/src/lib/enrichment/schemas/types.ts

export type FieldPriority = 'REQUIRED' | 'IMPORTANT' | 'OPTIONAL'
export type FieldGroup =
  | 'IDENTITY'
  | 'LOCATION'
  | 'CONTACT'
  | 'SOCIAL'
  | 'PRODUCT'
  | 'ENRICHMENT'
  | 'VISIT'
export type EntityType = 'ROASTER' | 'CAFE'

export interface FieldDef {
  key: string
  group: FieldGroup
  priority: FieldPriority
  isArray?: boolean
}

export interface EntitySchema {
  entityType: EntityType
  fields: FieldDef[]
}
