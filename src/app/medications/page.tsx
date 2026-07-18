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
      <div className="space-y-4">
        <Link className="inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white" href="/medications/new">
          Add routine
        </Link>
        {medications.length ? (
          <ul className="space-y-3">
            {medications.map((medication) => (
              <li className="rounded-xl border bg-white p-4" key={medication.id}>
                <Link className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href={`/medications/${medication.id}`}>
                  <p className="font-semibold">{medication.displayName}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Every {medication.intervalDays} day{medication.intervalDays === 1 ? "" : "s"} · {medication.doseType.replaceAll("_", " ")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border bg-white p-4 text-[var(--muted-foreground)]">
            No routines yet.
          </p>
        )}
      </div>
    </RouteScaffold>
  );
}
