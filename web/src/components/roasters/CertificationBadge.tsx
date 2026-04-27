import { CERTIFICATION_LABELS, type Certification } from "@/types/certifications";
import { cn } from "@/lib/utils";

interface CertificationBadgeProps {
  certification: string;
  className?: string;
}

export function CertificationBadge({ certification, className }: CertificationBadgeProps) {
  const label = CERTIFICATION_LABELS[certification as Certification] ?? certification;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 bg-surface-container-high text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-[0.2em]",
        className
      )}
    >
      {label}
    </span>
  );
}
