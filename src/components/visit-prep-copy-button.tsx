"use client";

import { useState } from "react";

import { createVisitPrepCopy, type VisitPrepData } from "@/lib/visit-prep";

export function VisitPrepCopyButton({ data }: { data: VisitPrepData }) {
  const [message, setMessage] = useState("");

  async function copyForVisit() {
    try {
      await navigator.clipboard.writeText(createVisitPrepCopy(data));
      setMessage("Copied to your clipboard.");
    } catch {
      setMessage("Copy was not available. You can select the records on this page instead.");
    }
  }

  return (
    <div className="space-y-2">
      <button
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        onClick={copyForVisit}
        type="button"
      >
        Copy for my visit
      </button>
      <p aria-live="polite" className="min-h-5 text-sm text-[var(--muted-foreground)]">
        {message}
      </p>
    </div>
  );
}
