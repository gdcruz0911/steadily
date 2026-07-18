import type { ReactNode } from "react";

export function RouteScaffold({
  children,
  description,
  title,
}: {
  children?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section aria-labelledby="page-title" className="space-y-6">
      <div className="space-y-3">
        <h1
          className="text-3xl font-semibold tracking-tight text-[var(--foreground)]"
          id="page-title"
        >
          {title}
        </h1>
        <p className="max-w-prose text-base leading-7 text-[var(--muted-foreground)]">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
