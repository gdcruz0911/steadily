import Link from "next/link";
import type { ReactNode } from "react";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/medications", label: "Medications" },
  { href: "/doses", label: "Doses" },
  { href: "/checkins", label: "Check-ins" },
  { href: "/report", label: "Summary" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto flex min-h-16 max-w-3xl items-center px-4">
          <Link
            className="rounded-xl text-lg font-semibold text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            href="/"
          >
            Steadily
          </Link>
        </div>
      </header>
      <nav
        aria-label="Primary navigation"
        className="border-b border-[var(--border)] bg-white"
      >
        <div className="mx-auto max-w-3xl px-4">
          <ul className="grid grid-cols-3 gap-1 py-2 sm:flex">
            {navigationItems.map((item) => (
              <li className="flex sm:block" key={item.href}>
                <Link
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl px-3 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] sm:w-auto"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
