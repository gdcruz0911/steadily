import { RouteScaffold } from "@/components/route-scaffold";
import { StatusBadge } from "@/components/status-badge";
import { psoriasisResearchUpdates } from "@/lib/updates";

export default function UpdatesPage() {
  return (
    <RouteScaffold
      description="A small, curated pilot feed of public psoriasis research and regulatory information."
      title="Research & updates"
    >
      <section aria-labelledby="updates-boundary-heading" className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="font-semibold" id="updates-boundary-heading">Information, not personal guidance</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          This pilot is not personalized to you, does not recommend medication or care, and does not replace a conversation with a clinician.
        </p>
      </section>

      <section aria-labelledby="updates-topic-heading" className="space-y-2">
        <h2 className="text-xl font-semibold" id="updates-topic-heading">Psoriasis pilot topic</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          These are fixed local entries selected from primary or authoritative public sources. Steadily does not fetch updates in the background.
        </p>
      </section>

      <section aria-labelledby="updates-feed-heading" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold" id="updates-feed-heading">Curated feed</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Six dated items, most recent first.</p>
        </div>
        {psoriasisResearchUpdates.length ? (
          <ol className="space-y-4">
            {psoriasisResearchUpdates.map((update) => (
              <li key={update.sourceUrl}>
                <article className="rounded-xl border bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <StatusBadge>
                      {update.category}
                    </StatusBadge>
                    <span className="text-[var(--muted-foreground)]">{update.dateLabel}</span>
                  </div>
                  <h3 className="mt-4 break-words text-lg font-semibold leading-7">{update.title}</h3>
                  <p className="mt-2 break-words text-sm font-medium text-[var(--muted-foreground)]">{update.sourceOrganization}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{update.description}</p>
                  <a
                    className="mt-4 inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[var(--accent)] underline decoration-2 underline-offset-4 hover:text-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                    href={update.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open source
                  </a>
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-xl border bg-white p-4 text-[var(--muted-foreground)]">No curated updates are available right now. This pilot does not fetch content automatically.</p>
        )}
      </section>
    </RouteScaffold>
  );
}
