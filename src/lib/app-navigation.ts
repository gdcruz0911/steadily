export const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/medications", label: "Medications" },
  { href: "/doses", label: "Doses" },
  { href: "/checkins", label: "Check-ins" },
  { href: "/visit-prep", label: "Visit prep" },
  { href: "/updates", label: "Updates" },
  { href: "/report", label: "Summary" },
  { href: "/settings", label: "Settings" },
];

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
