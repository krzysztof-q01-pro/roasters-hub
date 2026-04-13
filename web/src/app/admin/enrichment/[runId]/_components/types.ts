export interface ProposalWithMeta {
  id: string
  entityType: string
  entityId: string | null
  entityName: string
  changeType: string
  fieldKey: string
  fieldGroup: string
  fieldPriority: string
  currentValue: unknown
  proposedValue: unknown
  confidence: number
  sourceId: string
  sourceUrl: string | null
  status: string
  nameSimilarity: number | null
}
