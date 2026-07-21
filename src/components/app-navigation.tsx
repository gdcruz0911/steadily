"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavigationItemActive, navigationItems } from "@/lib/app-navigation";

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="border-b border-[var(--border)] bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-1 py-2 sm:flex sm:flex-wrap sm:gap-1 lg:flex-nowrap">
          {navigationItems.map((item) => {
            const isActive = isNavigationItemActive(pathname, item.href);

            return (
              <li className="flex min-w-0 sm:block" key={item.href}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] sm:w-auto ${isActive ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"}`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
