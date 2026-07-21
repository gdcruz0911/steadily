import type { ReactNode } from "react";

import Link from "next/link";

import { AppNavigation } from "@/components/app-navigation";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex min-h-16 max-w-4xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            className="inline-flex min-h-11 items-center rounded-xl text-lg font-semibold tracking-tight text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            href="/"
          >
            Steadily
          </Link>
        </div>
      </header>
      <AppNavigation />
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</main>
    </div>
  );
}
