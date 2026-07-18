import { logout } from "@/app/actions/auth";
import { NonMedicalDisclaimer } from "@/components/non-medical-disclaimer";
import { RouteScaffold } from "@/components/route-scaffold";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <RouteScaffold
      description="Data and account controls will be available here after settings features are implemented."
      title="Settings"
    >
      <div className="space-y-6">
        <NonMedicalDisclaimer />
        <form action={logout}>
          <Button variant="secondary">Sign out</Button>
        </form>
      </div>
    </RouteScaffold>
  );
}
