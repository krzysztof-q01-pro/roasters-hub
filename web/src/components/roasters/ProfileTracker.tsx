"use client";

import { useEffect } from "react";
import { trackEvent } from "@/actions/event.actions";

export function ProfileTracker({ roasterId }: { roasterId: string }) {
  useEffect(() => {
    trackEvent(roasterId, "PAGE_VIEW");
  }, [roasterId]);

  return null;
}
