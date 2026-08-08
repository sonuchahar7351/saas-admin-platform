export interface NavItem {
  label: string;
  href: string;
  roles: string[]; // which roles see this nav item
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: ["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"],
  },
  {
    label: "Campaigns",
    href: "/dashboard/campaigns",
    roles: ["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"],
  },
  {
    label: "Categories",
    href: "/dashboard/categories",
    roles: ["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"],
  },
  {
    label: "NGOs",
    href: "/dashboard/ngos",
    roles: ["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"],
  },
  {
    label: "Users",
    href: "/dashboard/users",
    roles: ["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"],
  },
  {
    label: "Permissions",
    href: "/dashboard/permissions",
    roles: ["SUPER_ADMIN"],
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit-logs",
    roles: ["SUPER_ADMIN"],
  },
  {
    label: "AI Insights",
    href: "/dashboard/ai-insights",
    roles: ["SUPER_ADMIN"],
  },
  {
    label: "Media Library",
    href: "/dashboard/media",
    roles: ["SUPER_ADMIN", "SUB_ADMIN"],
  },
];
