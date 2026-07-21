export function PageLoadingState({ title }: { title: string }) {
  return (
    <section aria-busy="true" aria-label={`Loading ${title}`} className="space-y-8">
      <div className="space-y-3 border-b border-[var(--border)] pb-5 sm:pb-6">
        <div className="h-10 w-52 rounded-lg bg-[var(--surface-muted)]" />
        <div className="h-5 max-w-xl rounded bg-[var(--surface-muted)]" />
      </div>
      <div className="space-y-4">
        <div className="h-5 w-40 rounded bg-[var(--surface-muted)]" />
        <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-5">
          <div className="h-5 w-2/3 rounded bg-[var(--surface-muted)]" />
          <div className="mt-3 h-4 w-full rounded bg-[var(--surface-muted)]" />
          <div className="mt-2 h-4 w-4/5 rounded bg-[var(--surface-muted)]" />
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-5">
          <div className="h-5 w-1/2 rounded bg-[var(--surface-muted)]" />
          <div className="mt-3 h-4 w-full rounded bg-[var(--surface-muted)]" />
        </div>
      </div>
      <p className="text-sm font-medium text-[var(--muted-foreground)]">Loading your records.</p>
    </section>
  );
}
