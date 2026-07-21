import Link from "next/link";
import { notFound } from "next/navigation";
import { Droplets, Pill, Syringe } from "lucide-react";

import { MedicationReferenceFlow } from "@/components/medication-reference-flow";
import { RouteScaffold } from "@/components/route-scaffold";
import { getMedicationReference } from "@/db/medication-references";
import { getMedicationRoutine } from "@/db/medications";
import { selectedFormOrRoute } from "@/lib/medication-references/dailymed";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function RouteIllustration({ doseType }: { doseType: "self_injection" | "clinic_infusion" | "oral" }) {
  const Icon = doseType === "oral" ? Pill : doseType === "clinic_infusion" ? Droplets : Syringe;
  const label = doseType === "oral" ? "Tablet" : doseType === "clinic_infusion" ? "Infusion" : "Injection pen or syringe";
  return (
    <div aria-label={label} className="flex h-28 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--accent)]" role="img">
      <Icon aria-hidden="true" size={48} strokeWidth={1.5} />
    </div>
  );
}

export default async function MedicationReferencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const medication = await getMedicationRoutine(supabase, id);

  if (!medication) {
    notFound();
  }

  const reference = await getMedicationReference(supabase, medication.id);
  return (
    <RouteScaffold
      description="A clearly identified public official source for this personal routine."
      title="Official medication reference"
    >
      <div className="space-y-6">
        <section className="space-y-4 rounded-xl border bg-white p-4" aria-labelledby="routine-name">
          <RouteIllustration doseType={medication.doseType} />
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Your routine</p>
            <h2 className="text-xl font-semibold" id="routine-name">{medication.displayName}</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Selected form or route: {selectedFormOrRoute(medication.doseType)}</p>
          </div>
        </section>
        <MedicationReferenceFlow medicationId={medication.id} reference={reference} selectedFormOrRoute={selectedFormOrRoute(medication.doseType)} />
        <p className="rounded-xl border bg-[var(--surface-muted)] p-4 text-sm text-[var(--foreground)]">Official reference information. This does not replace your pharmacist, prescriber, or the full official guide.</p>
        <Link className="inline-flex min-h-11 items-center font-semibold text-[var(--accent)] underline" href={`/medications/${medication.id}`}>Back to routine</Link>
      </div>
    </RouteScaffold>
  );
}
