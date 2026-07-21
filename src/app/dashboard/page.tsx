import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { listMedicationHubCards } from "@/db/medication-hub";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RouteScaffold } from "@/components/route-scaffold";

export const dynamic = "force-dynamic";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function referenceStateLabel(status: "confirmed" | "needs_confirmation" | "unavailable") {
  if (status === "confirmed") {
    return "Confirmed";
  }

  if (status === "unavailable") {
    return "Unavailable";
  }

  return "Needs confirmation";
}

function referenceStateTone(status: "confirmed" | "needs_confirmation" | "unavailable") {
  if (status === "confirmed") {
    return "success";
  }

  if (status === "unavailable") {
    return "neutral";
  }

  return "warning";
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const medicationCards = await listMedicationHubCards(supabase);

  return (
    <RouteScaffold description="Your factual medication routine records in one place." title="Medication hub">
      {medicationCards.length ? (
        <section aria-labelledby="medication-hub-heading" className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold" id="medication-hub-heading">Your medication routines</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Recorded information only. This page does not assess adherence or provide medical advice.</p>
          </div>
          <ul className="space-y-4">
            {medicationCards.map((medication) => {
              const referenceHref = `/medications/${medication.id}/reference`;

              return (
                <li className="rounded-xl border bg-white p-4 shadow-sm sm:p-5" key={medication.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <h3 className="break-words text-lg font-semibold">{medication.name}</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {medication.routeOrForm ? `Route/form: ${medication.routeOrForm}` : medication.doseTypeLabel}
                      </p>
                    </div>
                    <StatusBadge tone={referenceStateTone(medication.officialInformation.status)}>
                      Official information: {referenceStateLabel(medication.officialInformation.status)}
                    </StatusBadge>
                  </div>

                  <dl className="mt-5 grid gap-4 border-t pt-4 text-sm sm:grid-cols-3">
                    <div className="space-y-1">
                      <dt className="font-medium">Most recently recorded dose</dt>
                      <dd className="text-[var(--muted-foreground)]">
                        {medication.lastDoseAt ? formatDateTime(medication.lastDoseAt) : "No dose recorded yet."}
                      </dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="font-medium">Pending check-ins</dt>
                      <dd className="text-[var(--muted-foreground)]">
                        {medication.pendingCheckinCount === 0
                          ? "No pending check-ins."
                          : medication.pendingCheckinCount === 1
                            ? "1 pending check-in."
                            : `${medication.pendingCheckinCount} pending check-ins.`}
                      </dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="font-medium">Official information</dt>
                      <dd className="text-[var(--muted-foreground)]">{referenceStateLabel(medication.officialInformation.status)}</dd>
                    </div>
                  </dl>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={`${medication.name} links`}>
                    <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3 text-center text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href="/doses">
                      Dose history
                    </Link>
                    <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3 text-center text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href="/checkins">
                      Check-ins
                    </Link>
                    <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3 text-center text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href="/visit-prep">
                      Visit Prep
                    </Link>
                    <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border px-3 text-center text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href="/updates">
                      Research &amp; Updates
                    </Link>
                  </div>

                  {medication.officialInformation.sourceUrl ? (
                    <a className="mt-3 inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[var(--accent)] underline decoration-2 underline-offset-4 hover:text-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href={medication.officialInformation.sourceUrl} rel="noreferrer" target="_blank">
                      Read official information
                    </a>
                  ) : (
                    <Link className="mt-3 inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[var(--accent)] underline decoration-2 underline-offset-4 hover:text-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href={referenceHref}>
                      Review official information
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section className="rounded-xl border bg-white p-5 shadow-sm" aria-labelledby="medication-hub-empty-heading">
          <h2 className="text-xl font-semibold" id="medication-hub-empty-heading">No medication routines yet</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Add a personal medication routine to see its recorded doses, pending check-ins, and official-information state here.</p>
          <Link className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href="/medications/new">
            Add medication routine
          </Link>
        </section>
      )}
    </RouteScaffold>
  );
}
