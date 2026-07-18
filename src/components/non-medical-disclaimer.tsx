import { Info } from "lucide-react";

export function NonMedicalDisclaimer() {
  return (
    <aside
      aria-labelledby="non-medical-disclaimer"
      className="rounded-xl border border-[var(--border)] bg-white p-4"
    >
      <div className="flex gap-3">
        <Info
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-[var(--accent)]"
          strokeWidth={2}
        />
        <div className="space-y-2">
          <h2
            className="font-semibold text-[var(--foreground)]"
            id="non-medical-disclaimer"
          >
            Personal tracking only
          </h2>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Steadily does not diagnose conditions, recommend treatment, estimate
            disease or flare risk, or replace a clinician.
          </p>
        </div>
      </div>
    </aside>
  );
}
