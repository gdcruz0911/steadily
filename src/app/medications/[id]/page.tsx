import { notFound } from "next/navigation";

import { deleteMedication, updateMedication } from "@/app/medications/actions";
import { Button } from "@/components/ui/button";
import { MedicationRoutineForm } from "@/components/medication-routine-form";
import { RouteScaffold } from "@/components/route-scaffold";
import { getMedicationRoutine } from "@/db/medications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MedicationPage({
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

  return (
    <RouteScaffold
      description="Update or remove this personal medication routine."
      title="Edit medication routine"
    >
      <div className="space-y-8">
        <a
          className="inline-flex min-h-12 items-center rounded-xl border bg-white px-4 text-sm font-semibold text-[var(--foreground)]"
          href={`/medications/${medication.id}/reference`}
        >
          Official reference
        </a>
        <MedicationRoutineForm
          action={updateMedication.bind(null, medication.id)}
          initialMedication={medication}
          submitLabel="Save changes"
        />
        <form action={deleteMedication.bind(null, medication.id)}>
          <Button variant="secondary">Delete routine</Button>
        </form>
      </div>
    </RouteScaffold>
  );
}
