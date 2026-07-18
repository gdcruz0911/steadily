"use client";

import { useActionState, useState } from "react";

import type { MedicationFormState } from "@/app/medications/actions";
import { Button } from "@/components/ui/button";
import type { MedicationRoutine } from "@/db/medications";
import {
  medicationColorLabels,
  medicationDoseTypes,
} from "@/lib/validation/medications";

type MedicationRoutineFormProps = {
  action: (
    previousState: MedicationFormState,
    formData: FormData,
  ) => Promise<MedicationFormState>;
  initialMedication?: MedicationRoutine;
  returnTo?: "dashboard";
  submitLabel: string;
};

export function MedicationRoutineForm({
  action,
  initialMedication,
  returnTo,
  submitLabel,
}: MedicationRoutineFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [hasLoadingPhase, setHasLoadingPhase] = useState(
    initialMedication?.hasLoadingPhase ?? false,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {returnTo ? <input name="returnTo" type="hidden" value={returnTo} /> : null}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="displayName">
          Routine name
        </label>
        <input
          className="min-h-12 w-full rounded-xl border bg-white px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          defaultValue={initialMedication?.displayName}
          id="displayName"
          maxLength={100}
          name="displayName"
          required
        />
        <p className="text-sm text-[var(--muted-foreground)]">
          Use a name that is meaningful to you. This is not a clinical medication record.
        </p>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="colorLabel">
          Color label
        </label>
        <select className="min-h-12 w-full rounded-xl border bg-white px-3" defaultValue={initialMedication?.colorLabel ?? "teal"} id="colorLabel" name="colorLabel">
          {medicationColorLabels.map((colorLabel) => <option key={colorLabel} value={colorLabel}>{colorLabel}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="doseType">
          Dose type
        </label>
        <select className="min-h-12 w-full rounded-xl border bg-white px-3" defaultValue={initialMedication?.doseType ?? "self_injection"} id="doseType" name="doseType">
          {medicationDoseTypes.map((doseType) => <option key={doseType} value={doseType}>{doseType.replaceAll("_", " ")}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="intervalDays">
          Routine interval in days
        </label>
        <input className="min-h-12 w-full rounded-xl border bg-white px-3" defaultValue={initialMedication?.intervalDays} id="intervalDays" min="1" name="intervalDays" required type="number" />
      </div>
      <label className="flex min-h-12 items-center gap-3 rounded-xl border bg-white px-3 text-sm font-medium">
        <input checked={hasLoadingPhase} name="hasLoadingPhase" onChange={(event) => setHasLoadingPhase(event.target.checked)} type="checkbox" />
        Include a loading phase
      </label>
      {hasLoadingPhase ? (
        <div className="space-y-5 rounded-xl border bg-[var(--surface-muted)] p-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="loadingDoseCount">Loading dose count</label>
            <input className="min-h-12 w-full rounded-xl border bg-white px-3" defaultValue={initialMedication?.loadingDoseCount} id="loadingDoseCount" min="1" name="loadingDoseCount" required type="number" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium" htmlFor="loadingIntervalDays">Loading interval in days</label>
            <input className="min-h-12 w-full rounded-xl border bg-white px-3" defaultValue={initialMedication?.loadingIntervalDays} id="loadingIntervalDays" min="1" name="loadingIntervalDays" required type="number" />
          </div>
        </div>
      ) : null}
      {state.error ? <p aria-live="polite" className="text-sm font-medium text-[var(--error)]" role="alert">{state.error}</p> : null}
      <Button disabled={isPending} type="submit">{isPending ? "Saving" : submitLabel}</Button>
    </form>
  );
}
