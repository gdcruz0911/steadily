"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section aria-labelledby="page-error-title" className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
      <h1 className="text-2xl font-semibold" id="page-error-title">This page could not be loaded</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">Your records were not changed. Try loading the page again.</p>
      <Button className="mt-5" onClick={reset} type="button">Try again</Button>
    </section>
  );
}
