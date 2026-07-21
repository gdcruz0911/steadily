import Link from "next/link";

import { RouteScaffold } from "@/components/route-scaffold";
import { StatusBadge } from "@/components/status-badge";
import { VisitPrepCopyButton } from "@/components/visit-prep-copy-button";
import { getVisitPrepData } from "@/db/visit-prep";
import {
  getRecordedScores,
  parseVisitPrepRange,
  visitPrepRangeOptions,
} from "@/lib/visit-prep";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function checkinStatusTone(status: "completed" | "pending" | "skipped") {
  if (status === "completed") {
    return "success";
  }

  if (status === "pending") {
    return "warning";
  }

  return "neutral";
}

export default async function VisitPrepPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const rangeDays = parseVisitPrepRange((await searchParams).range);
  const supabase = await createSupabaseServerClient();
  const visitPrep = await getVisitPrepData(supabase, rangeDays);

  return (
    <RouteScaffold
      description="Review a factual record from your selected time range and copy it for a visit discussion."
      title="Visit prep"
    >
      <section className="rounded-xl border bg-white p-4 shadow-sm" aria-labelledby="visit-prep-boundary-heading">
        <h2 className="font-semibold" id="visit-prep-boundary-heading">For your visit discussion</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          This is a personal record for discussion with a clinician, not medical advice.
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="visit-prep-range-heading">
        <div>
          <h2 className="text-xl font-semibold" id="visit-prep-range-heading">Date range</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Choose the records you want to review.</p>
        </div>
        <div aria-label="Date range options" className="flex flex-wrap gap-2">
          {visitPrepRangeOptions.map((option) => {
            const isSelected = option === rangeDays;

            return (
              <Link
                aria-current={isSelected ? "page" : undefined}
                className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${isSelected ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "bg-white text-[var(--foreground)] hover:bg-[var(--surface-muted)]"}`}
                href={`/visit-prep?range=${option}`}
                key={option}
              >
                Last {option} days
              </Link>
            );
          })}
        </div>
      </section>

      <VisitPrepCopyButton data={visitPrep} />

      <section className="space-y-4" aria-labelledby="visit-prep-medications-heading">
        <div>
          <h2 className="text-xl font-semibold" id="visit-prep-medications-heading">Medication routines</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Your saved routine labels.</p>
        </div>
        {visitPrep.medications.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {visitPrep.medications.map((medication) => (
              <li className="break-words rounded-xl border bg-white p-4 font-semibold shadow-sm" key={medication.id}>{medication.name}</li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border bg-white p-4 text-sm text-[var(--muted-foreground)]">No medication routines are available in your records.</p>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="visit-prep-doses-heading">
        <div>
          <h2 className="text-xl font-semibold" id="visit-prep-doses-heading">Recorded doses</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Administration times in the selected range.</p>
        </div>
        {visitPrep.doses.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {visitPrep.doses.map((dose) => (
              <li className="rounded-xl border bg-white p-4 shadow-sm" key={dose.id}>
                <p className="break-words font-semibold">{dose.medicationName}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Administration time {formatDateTime(dose.administeredAt)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border bg-white p-4 text-[var(--muted-foreground)]">No doses were recorded in this range.</p>
        )}
      </section>

      <section className="space-y-4" aria-labelledby="visit-prep-checkins-heading">
        <div>
          <h2 className="text-xl font-semibold" id="visit-prep-checkins-heading">Check-ins</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Completed, skipped, and pending check-ins scheduled in the selected range.</p>
        </div>
        {visitPrep.checkins.length ? (
          <ul className="space-y-3">
            {visitPrep.checkins.map((checkin) => {
              const scores = getRecordedScores(checkin.scores);

              return (
                <li className="rounded-xl border bg-white p-4 shadow-sm" key={checkin.id}>
                  <p className="break-words font-semibold">{checkin.medicationName}</p>
                  <div className="mt-2"><StatusBadge tone={checkinStatusTone(checkin.status)}>{checkin.window} check-in: {checkin.status}</StatusBadge></div>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Dose recorded {formatDateTime(checkin.administeredAt)}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Scheduled {formatDateTime(checkin.scheduledAt)}</p>
                  {checkin.completedAt ? <p className="mt-1 text-sm text-[var(--muted-foreground)]">Completed {formatDateTime(checkin.completedAt)}</p> : null}
                  {scores.length ? (
                      <dl className="mt-4 space-y-2 border-t pt-3 text-sm">
                        <dt className="font-medium">Recorded scores</dt>
                        {scores.map((score) => (
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4" key={score.label}>
                          <dd className="text-[var(--muted-foreground)]">{score.label}</dd>
                          <dd>{score.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-xl border bg-white p-4 text-[var(--muted-foreground)]">No check-ins were scheduled in this range.</p>
        )}
      </section>
    </RouteScaffold>
  );
}
