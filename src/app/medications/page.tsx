import Link from "next/link";

import { RouteScaffold } from "@/components/route-scaffold";
import { listMedicationRoutines } from "@/db/medications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MedicationsPage() {
  const supabase = await createSupabaseServerClient();
  const medications = await listMedicationRoutines(supabase);

  return (
    <RouteScaffold
      description="Create and manage your personal medication routines."
      title="Medications"
    >
      <div className="space-y-5">
        <Link className="inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href="/medications/new">
          Add routine
        </Link>
        {medications.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {medications.map((medication) => (
              <li className="rounded-xl border bg-white shadow-sm" key={medication.id}>
                <Link className="block min-h-28 rounded-xl p-4 hover:bg-[var(--surface-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href={`/medications/${medication.id}`}>
                  <p className="break-words font-semibold">{medication.displayName}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Every {medication.intervalDays} day{medication.intervalDays === 1 ? "" : "s"} · {medication.doseType.replaceAll("_", " ")}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-[var(--accent)]">Review routine</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <section className="rounded-xl border bg-white p-5 shadow-sm" aria-labelledby="medications-empty-heading">
            <h2 className="text-lg font-semibold" id="medications-empty-heading">No routines yet</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Add a personal routine when you are ready to begin recording doses and check-ins.</p>
          </section>
        )}
      </div>
    </RouteScaffold>
  );
}
