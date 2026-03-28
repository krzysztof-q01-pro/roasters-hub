"use client";

import type { EventType } from "@prisma/client";
import { trackEvent } from "@/actions/event.actions";

interface TrackedLinkProps {
  href: string;
  roasterId: string;
  eventType: EventType;
  className?: string;
  children: React.ReactNode;
}

export function TrackedLink({
  href,
  roasterId,
  eventType,
  className,
  children,
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackEvent(roasterId, eventType)}
    >
      {children}
    </a>
  );
}
