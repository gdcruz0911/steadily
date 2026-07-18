import { createMedication } from "@/app/medications/actions";
import { MedicationRoutineForm } from "@/components/medication-routine-form";
import { RouteScaffold } from "@/components/route-scaffold";

export default function NewMedicationPage() {
  return (
    <RouteScaffold
      description="Set up a personal routine. You can change it later."
      title="Add medication routine"
    >
      <MedicationRoutineForm action={createMedication} submitLabel="Save routine" />
    </RouteScaffold>
  );
}
