"use client";

import { useEffect } from "react";
import { trackCafeEvent } from "@/actions/cafe-event.actions";

export function CafeProfileTracker({ cafeId }: { cafeId: string }) {
  useEffect(() => {
    trackCafeEvent(cafeId, "PAGE_VIEW");
  }, [cafeId]);

  return null;
}
