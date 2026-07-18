import { NonMedicalDisclaimer } from "@/components/non-medical-disclaimer";
import { RouteScaffold } from "@/components/route-scaffold";

export default function SettingsPage() {
  return (
    <RouteScaffold
      description="Data and account controls will be available here after settings features are implemented."
      title="Settings"
    >
      <NonMedicalDisclaimer />
    </RouteScaffold>
  );
}
