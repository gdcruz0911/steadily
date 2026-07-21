"use client";

import { useActionState, useRef, useState } from "react";

import { createDose, type DoseFormState } from "@/app/doses/actions";
import { Button } from "@/components/ui/button";
import type { MedicationRoutine } from "@/db/medications";
import { injectionSites } from "@/lib/validation/doses";

type DoseFormProps = {
  medications: MedicationRoutine[];
  recentInjectionSites: Record<string, string[]>;
};

function toLocalDateTimeValue(date = new Date()) {
  const local = new Date(date.valueOf() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function siteLabel(site: string) {
  return site.replaceAll("-", " ");
}

export function DoseForm({ medications, recentInjectionSites }: DoseFormProps) {
  const [state, formAction, isPending] = useActionState<DoseFormState, FormData>(createDose, {});
  const [medicationId, setMedicationId] = useState(medications[0]?.id ?? "");
  const administeredAtRef = useRef<HTMLInputElement>(null);
  const isoValueRef = useRef<HTMLInputElement>(null);
  const medication = medications.find((routine) => routine.id === medicationId);
  const isSelfInjection = medication?.doseType === "self_injection";
  const recentSites = medication ? recentInjectionSites[medication.id] ?? [] : [];

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border bg-white p-4"
      noValidate
      onSubmit={() => {
        if (administeredAtRef.current && isoValueRef.current) {
          const date = new Date(administeredAtRef.current.value);
          isoValueRef.current.value = Number.isNaN(date.valueOf()) ? "" : date.toISOString();
        }
      }}
    >
      <input name="administeredAt" ref={isoValueRef} type="hidden" />
      <div className="space-y-1 border-b pb-4">
        <h2 className="text-xl font-semibold">Record a dose</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">Save a factual administration record for one of your routines.</p>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="medicationId">
          Medication routine
        </label>
        <select
          className="min-h-12 w-full rounded-xl border bg-white px-3"
          id="medicationId"
          name="medicationId"
          onChange={(event) => setMedicationId(event.target.value)}
          value={medicationId}
        >
          {medications.map((routine) => (
            <option key={routine.id} value={routine.id}>
              {routine.displayName}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium" htmlFor="administeredAtLocal">
          Date and time recorded
        </label>
        <input
          className="min-h-12 w-full rounded-xl border bg-white px-3"
          defaultValue={toLocalDateTimeValue()}
          id="administeredAtLocal"
          ref={administeredAtRef}
          required
          type="datetime-local"
        />
      </div>
      {isSelfInjection ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="injectionSite">
            Injection site
          </label>
          <select className="min-h-12 w-full rounded-xl border bg-white px-3" id="injectionSite" name="injectionSite">
            <option value="">No site selected</option>
            {injectionSites.map((site) => (
              <option key={site} value={site}>{siteLabel(site)}</option>
            ))}
          </select>
          {recentSites.length ? (
            <p className="rounded-xl border bg-[var(--surface-muted)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Recent sites: {recentSites.map(siteLabel).join(", ")}. If it works for you, consider choosing a different site. You can select any site.
            </p>
          ) : null}
        </div>
      ) : null}
      {state.error ? <p className="rounded-xl border border-[var(--error)] bg-[var(--error-soft)] p-3 text-sm font-medium text-[var(--error)]" role="alert">{state.error}</p> : null}
      <Button disabled={isPending || !medication} type="submit">{isPending ? "Saving dose" : "Save dose"}</Button>
    </form>
  );
}
