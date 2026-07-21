import { DoseForm } from "@/components/dose-form";
import { RouteScaffold } from "@/components/route-scaffold";
import { getCalculatedNextDose, getLastTwoInjectionSites, listDoseRecords } from "@/db/doses";
import { listMedicationRoutines } from "@/db/medications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function siteLabel(site: string) {
  return site.replaceAll("-", " ");
}

export default async function DosesPage() {
  const supabase = await createSupabaseServerClient();
  const [medications, doses] = await Promise.all([
    listMedicationRoutines(supabase),
    listDoseRecords(supabase),
  ]);
  const injectionMedications = medications.filter((medication) => medication.doseType === "self_injection");
  const recentSitesByMedication = Object.fromEntries(
    await Promise.all(
      injectionMedications.map(async (medication) => [
        medication.id,
        await getLastTwoInjectionSites(supabase, medication.id),
      ]),
    ),
  );

  return (
    <RouteScaffold
      description="Record a dose for your personal routine and review your own history."
      title="Doses"
    >
      {medications.length ? (
        <div className="space-y-8">
          <DoseForm medications={medications} recentInjectionSites={recentSitesByMedication} />
          <section className="space-y-4" aria-labelledby="dose-history-heading">
            <div>
              <h2 className="text-xl font-semibold" id="dose-history-heading">Dose history</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Most recent first.</p>
            </div>
            {doses.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {doses.map((dose) => (
                  <li className="rounded-xl border bg-white p-4 shadow-sm" key={dose.id}>
                    <p className="break-words font-semibold">{dose.medicationName}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{formatDateTime(dose.administeredAt)}</p>
                    {dose.injectionSite ? <p className="mt-1 text-sm text-[var(--muted-foreground)]">Injection site: {siteLabel(dose.injectionSite)}</p> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <section className="rounded-xl border bg-white p-5 shadow-sm" aria-labelledby="dose-history-empty-heading">
                <h3 className="text-lg font-semibold" id="dose-history-empty-heading">No doses recorded yet</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Your saved dose records will appear here, most recent first.</p>
              </section>
            )}
          </section>
          <section className="space-y-3" aria-labelledby="routine-timing-heading">
            <h2 className="text-xl font-semibold" id="routine-timing-heading">Routine timing</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Calculated from your most recent record and saved routine interval. This is not medical guidance.</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {medications.map((medication) => {
                const nextDose = getCalculatedNextDose(medication, doses);
                return (
                  <li className="rounded-xl border bg-white p-4 shadow-sm" key={medication.id}>
                    <p className="break-words font-semibold">{medication.displayName}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {nextDose ? `Next calculated date: ${formatDateTime(nextDose)}` : "Record a dose to calculate a routine date."}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      ) : (
        <section className="rounded-xl border bg-white p-5 shadow-sm" aria-labelledby="doses-empty-heading">
          <h2 className="text-lg font-semibold" id="doses-empty-heading">A routine is needed first</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Add a personal medication routine before recording a dose.</p>
        </section>
      )}
    </RouteScaffold>
  );
}
