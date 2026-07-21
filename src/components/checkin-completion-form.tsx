"use client";

import { useActionState, useState, type FormEvent } from "react";

import { completeCheckin, type CompleteCheckinState, skipCheckin } from "@/app/checkins/actions";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import type { CheckinRecord } from "@/db/checkins";
import { checkinScoreFields, checkinScoreLabels } from "@/lib/validation/checkins";

export function CheckinCompletionForm({ checkin }: { checkin: CheckinRecord }) {
  const [state, formAction, isPending] = useActionState<CompleteCheckinState, FormData>(completeCheckin, {});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<(typeof checkinScoreFields)[number], string>>>({});

  function validateScores(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const errors: Partial<Record<(typeof checkinScoreFields)[number], string>> = {};

    for (const field of checkinScoreFields) {
      const value = new FormData(form).get(field);
      if (typeof value !== "string" || !/^[0-5]$/.test(value)) {
        errors[field] = "Choose a score from 0 to 5.";
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      event.preventDefault();
    }
  }

  return (
    <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <StatusBadge tone="accent">Due check-in</StatusBadge>
        <h3 className="break-words font-semibold">{checkin.medicationName} · {checkin.window}</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Choose a 0–5 score for each structured item.</p>
      </div>
      <form action={formAction} className="space-y-4" noValidate onSubmit={validateScores}>
        <input name="checkinId" type="hidden" value={checkin.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          {checkinScoreFields.map((field) => (
            <div className="space-y-2" key={field}>
              <label className="block text-sm font-medium" htmlFor={`${checkin.id}-${field}`}>
                {checkinScoreLabels[field]}
              </label>
              <select
                className="min-h-12 w-full rounded-xl border bg-white px-3"
                id={`${checkin.id}-${field}`}
                name={field}
                aria-describedby={fieldErrors[field] ? `${checkin.id}-${field}-error` : undefined}
                required
              >
                <option value="">Choose 0–5</option>
                {[0, 1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
              {fieldErrors[field] ? <p className="text-sm font-medium text-[var(--error)]" id={`${checkin.id}-${field}-error`}>{fieldErrors[field]}</p> : null}
            </div>
          ))}
        </div>
        {state.error ? <p className="rounded-xl border border-[var(--error)] bg-[var(--error-soft)] p-3 text-sm font-medium text-[var(--error)]" role="alert">{state.error}</p> : null}
        <Button disabled={isPending} type="submit">{isPending ? "Saving check-in" : "Complete check-in"}</Button>
      </form>
      <form action={skipCheckin}>
        <input name="checkinId" type="hidden" value={checkin.id} />
        <Button type="submit" variant="secondary">Skip check-in</Button>
      </form>
    </div>
  );
}
