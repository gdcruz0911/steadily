import { CheckinCompletionForm } from "@/components/checkin-completion-form";
import { RouteScaffold } from "@/components/route-scaffold";
import { StatusBadge } from "@/components/status-badge";
import { listCheckinHistory, listDueCheckins, type CheckinRecord } from "@/db/checkins";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function isOverdue(checkin: CheckinRecord) {
  return checkin.status === "pending" && new Date(checkin.scheduledAt).valueOf() < Date.now();
}

function checkinStatusTone(status: CheckinRecord["status"]) {
  if (status === "completed") {
    return "success";
  }

  if (status === "pending") {
    return "warning";
  }

  return "neutral";
}

export default async function CheckinsPage() {
  const supabase = await createSupabaseServerClient();
  const [dueCheckins, history] = await Promise.all([
    listDueCheckins(supabase),
    listCheckinHistory(supabase),
  ]);

  return (
    <RouteScaffold
      description="Record structured follow-up check-ins connected to your dose records."
      title="Check-ins"
    >
      <section aria-labelledby="due-checkins-heading" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold" id="due-checkins-heading">Due check-ins</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Due means the scheduled time has arrived. Overdue is shown here only and is not saved.</p>
        </div>
        {dueCheckins.length ? (
          <div className="space-y-4">
            {dueCheckins.map((checkin) => (
              <div className="space-y-2" key={checkin.id}>
                <StatusBadge tone={isOverdue(checkin) ? "warning" : "accent"}>
                  {isOverdue(checkin) ? `Overdue since ${formatDateTime(checkin.scheduledAt)}` : `Due ${formatDateTime(checkin.scheduledAt)}`}
                </StatusBadge>
                <CheckinCompletionForm checkin={checkin} />
              </div>
            ))}
          </div>
        ) : (
          <section className="rounded-xl border bg-white p-5 shadow-sm" aria-labelledby="due-checkins-empty-heading">
            <h3 className="text-lg font-semibold" id="due-checkins-empty-heading">No check-ins are due right now</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Any pending check-ins whose scheduled time arrives will appear here.</p>
          </section>
        )}
      </section>
      <section aria-labelledby="checkin-history-heading" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold" id="checkin-history-heading">Check-in history</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Grouped by dose record.</p>
        </div>
        {history.length ? (
          <div className="space-y-4">
            {history.map((group) => (
              <article className="rounded-xl border bg-white p-4 shadow-sm" key={group.doseId}>
                <h3 className="break-words font-semibold">{group.medicationName}</h3>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Dose recorded {formatDateTime(group.administeredAt)}</p>
                <ul className="mt-4 space-y-3">
                  {group.checkins.map((checkin) => (
                    <li className="space-y-2 border-l-2 border-[var(--border)] pl-3" key={checkin.id}>
                      <StatusBadge tone={checkinStatusTone(checkin.status)}>{checkin.window} check-in: {checkin.status}</StatusBadge>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">Scheduled {formatDateTime(checkin.scheduledAt)}</p>
                      {checkin.completedAt ? <p className="mt-1 text-sm text-[var(--muted-foreground)]">Completed {formatDateTime(checkin.completedAt)}</p> : null}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        ) : (
          <section className="rounded-xl border bg-white p-5 shadow-sm" aria-labelledby="checkin-history-empty-heading">
            <h3 className="text-lg font-semibold" id="checkin-history-empty-heading">No check-in history yet</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Check-ins will appear here after you record a dose.</p>
          </section>
        )}
      </section>
    </RouteScaffold>
  );
}
