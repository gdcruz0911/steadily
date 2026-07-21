import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const toneClasses = {
  accent: "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-hover)]",
  neutral: "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]",
  success: "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]",
  warning: "border-[#d8b36a] bg-[var(--warning-soft)] text-[var(--warning)]",
} as const;

export function StatusBadge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-4",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
