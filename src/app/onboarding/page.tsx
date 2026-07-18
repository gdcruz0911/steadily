import { createMedication } from "@/app/medications/actions";
import { MedicationRoutineForm } from "@/components/medication-routine-form";
import { RouteScaffold } from "@/components/route-scaffold";

export default function OnboardingPage() {
  return (
    <RouteScaffold
      description="Start with one personal medication routine. You can add or update routines later."
      title="Welcome"
    >
      <MedicationRoutineForm
        action={createMedication}
        returnTo="dashboard"
        submitLabel="Continue"
      />
    </RouteScaffold>
  );
}
