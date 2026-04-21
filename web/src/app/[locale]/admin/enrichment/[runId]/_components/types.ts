export interface EntitySummary {
  key: string;            // entityId or entityName (for NEW_PLACE)
  entityId: string | null;
  entityName: string;
  entityType: string;
  isNew: boolean;
  hasNameChange: boolean;
  proposalCount: number;
  pendingCount: number;
  appliedCount: number;
  minConf: number;        // 0-1
  sources: string[];
  city: string | null;
}

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
