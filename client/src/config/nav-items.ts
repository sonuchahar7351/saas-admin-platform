export interface NavItem {
  label: string;
  href: string;
  roles: string[];
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
    label: "Morph Campaigns",
    href: "/dashboard/campaigns/morph",
    roles: ["SUPER_ADMIN", "SUB_ADMIN"],
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
    label: "Transactions",
    href: "/dashboard/transactions",
    roles: ["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"],
  },
  {
    label: "Recurring Donations",
    href: "/dashboard/recurring-donations",
    roles: ["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"],
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    roles: ["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"],
  },
  {
    label: "80G Applications",
    href: "/dashboard/eighty-g",
    roles: ["SUPER_ADMIN", "SUB_ADMIN"],
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
    label: "Fraud Flags",
    href: "/dashboard/fraud",
    roles: ["SUPER_ADMIN", "SUB_ADMIN", "ADMIN"],
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
