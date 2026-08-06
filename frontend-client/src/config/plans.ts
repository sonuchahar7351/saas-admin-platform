export interface Plan {
  id: string;
  name: string;
  price: number; // in rupees
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 499,
    period: "/month",
    description: "For individuals getting started",
    features: ["Up to 3 team members", "Core admin features", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 1499,
    period: "/month",
    description: "For growing teams",
    features: [
      "Up to 20 team members",
      "AI-powered insights",
      "Priority support",
      "Audit log access",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 4999,
    period: "/month",
    description: "For larger organizations",
    features: [
      "Unlimited team members",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
];
