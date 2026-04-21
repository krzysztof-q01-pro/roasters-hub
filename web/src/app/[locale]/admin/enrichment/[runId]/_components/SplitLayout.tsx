"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { EntityListPanel } from "./EntityListPanel";
import { EntityCard } from "./EntityCard";
import type { EntitySummary, ProposalWithMeta } from "./types";

interface SplitLayoutProps {
  runId: string;
  entities: EntitySummary[];
  proposalsByEntity: Record<string, ProposalWithMeta[]>;
  existingFieldsByEntity: Record<string, Record<string, unknown>>;
  runKeywords: string[];
}

export function SplitLayout({
  runId,
  entities,
  proposalsByEntity,
  existingFieldsByEntity,
  runKeywords,
}: SplitLayoutProps) {
  const pendingFirst = [...entities].sort((a, b) => {
    if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
    return 0;
  });

  const [selectedKey, setSelectedKey] = useState<string | null>(
    pendingFirst[0]?.key ?? null
  );

  const selectedEntity = entities.find((e) => e.key === selectedKey);

  function handleAdvance() {
    const currentIdx = pendingFirst.findIndex((e) => e.key === selectedKey);
    const next = pendingFirst.slice(currentIdx + 1).find((e) => e.pendingCount > 0);
    if (next) {
      setSelectedKey(next.key);
    } else {
      setSelectedKey("__done__");
    }
  }

  return (
    <div className="flex h-[calc(100vh-44px-56px)] overflow-hidden">
      <EntityListPanel
        entities={pendingFirst}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />
      <div className="flex-1 overflow-y-auto bg-stone-50">
        {selectedKey === "__done__" || !selectedEntity ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-stone-400">
            <div className="text-5xl">✓</div>
            <p className="text-lg font-semibold text-stone-600">Wszystkie encje przejrzane</p>
            <Link href="/admin/enrichment" className="text-sm text-amber-700 underline">
              Wróć do listy runów
            </Link>
          </div>
        ) : (
          <EntityCard
            key={selectedKey}
            runId={runId}
            entityId={selectedEntity.entityId}
            entityName={selectedEntity.entityName}
            entityType={selectedEntity.entityType}
            isNew={selectedEntity.isNew}
            proposals={selectedKey ? (proposalsByEntity[selectedKey] ?? []) : []}
            existingFields={selectedKey ? (existingFieldsByEntity[selectedKey] ?? {}) : {}}
            runKeywords={runKeywords}
            onAdvance={handleAdvance}
          />
        )}
      </div>
    </div>
  );
}
