"use client";

import type { EventType } from "@prisma/client";
import { trackCafeEvent } from "@/actions/cafe-event.actions";

interface CafeTrackedLinkProps {
  href: string;
  cafeId: string;
  eventType: EventType;
  className?: string;
  children: React.ReactNode;
}

export function CafeTrackedLink({
  href,
  cafeId,
  eventType,
  className,
  children,
}: CafeTrackedLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackCafeEvent(cafeId, eventType)}
    >
      {children}
    </a>
  );
}
