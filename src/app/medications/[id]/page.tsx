import { notFound } from "next/navigation";
import Link from "next/link";

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
        <Link
          className="inline-flex min-h-12 items-center rounded-xl border bg-white px-4 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          href={`/medications/${medication.id}/reference`}
        >
          Official reference
        </Link>
        <MedicationRoutineForm
          action={updateMedication.bind(null, medication.id)}
          initialMedication={medication}
          submitLabel="Save changes"
        />
        <section className="space-y-3 border-t pt-6" aria-labelledby="remove-routine-heading">
          <div>
            <h2 className="text-lg font-semibold" id="remove-routine-heading">Remove routine</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">This removes this personal routine from your records.</p>
          </div>
          <form action={deleteMedication.bind(null, medication.id)}>
            <Button variant="destructive">Delete routine</Button>
          </form>
        </section>
      </div>
    </RouteScaffold>
  );
}
