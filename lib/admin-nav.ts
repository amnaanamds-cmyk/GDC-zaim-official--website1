import type { PortalLink } from '@/components/PortalShell';

/**
 * The administrator's menu, in the order a college needs it.
 *
 * Kept in one place because every admin screen shows the same menu, and a
 * screen that quietly dropped an entry would hide part of the system from the
 * person setting the college up.
 */
export const ADMIN_NAV: PortalLink[] = [
  { label: 'Dashboard', href: '/portal/admin', icon: 'grid' },
  { label: 'Academics', href: '/portal/admin/academics', icon: 'sigma' },
  { label: 'People & enrolment', href: '/portal/admin/people', icon: 'users' },
  { label: 'Campus & content', href: '/portal/admin/campus', icon: 'mosque' },
  { label: 'Website content', href: '/portal/admin/website', icon: 'image' },
  { label: 'Event media', href: '/portal/admin/media', icon: 'mic' },
  { label: 'Accounts', href: '/portal/admin/accounts', icon: 'shield' },
];

/** The same menu with one entry pulled to the front, so it reads as current. */
export function adminNav(current: string): PortalLink[] {
  const here = ADMIN_NAV.find((l) => l.href === current);
  if (!here) return ADMIN_NAV;
  return [here, ...ADMIN_NAV.filter((l) => l.href !== current)];
}
