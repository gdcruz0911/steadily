import Link from "next/link";

import { listDueCheckins } from "@/db/checkins";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RouteScaffold } from "@/components/route-scaffold";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const dueCheckins = await listDueCheckins(supabase);

  return (
    <RouteScaffold description="Your personal tracking overview." title="Dashboard">
      {dueCheckins.length ? (
        <section aria-labelledby="due-checkins-heading" className="rounded-xl border border-[var(--accent)] bg-white p-4">
          <h2 className="text-xl font-semibold" id="due-checkins-heading">Check-ins due</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {dueCheckins.length === 1 ? "One structured check-in is ready." : `${dueCheckins.length} structured check-ins are ready.`}
          </p>
          <Link className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]" href="/checkins">
            Review check-ins
          </Link>
        </section>
      ) : (
        <p className="rounded-xl border bg-white p-4 text-[var(--muted-foreground)]">No structured check-ins are due right now.</p>
      )}
    </RouteScaffold>
  );
}
