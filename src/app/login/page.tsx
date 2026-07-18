import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { RouteScaffold } from "@/components/route-scaffold";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <RouteScaffold
      description="Sign in or create an account to begin personal tracking."
      title="Sign in"
    >
      <AuthForm />
    </RouteScaffold>
  );
}
