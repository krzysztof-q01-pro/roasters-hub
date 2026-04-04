"use client";

import { useState, useTransition } from "react";
import { saveCafe, unsaveCafe } from "@/actions/saved-cafe.actions";

export function SaveCafeButton({
  cafeId,
  initialSaved,
}: {
  cafeId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = saved
        ? await unsaveCafe(cafeId)
        : await saveCafe(cafeId);

      if (result.success) {
        setSaved(!saved);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`w-full py-3.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
        saved
          ? "bg-primary/10 text-primary border border-primary/20"
          : "border border-outline text-on-surface-variant hover:bg-surface-container-low"
      } disabled:opacity-50`}
      title={saved ? "Remove from saved" : "Save this cafe"}
    >
      <svg
        className="w-4 h-4"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {isPending ? "..." : saved ? "Saved" : "Save Cafe"}
    </button>
  );
}
