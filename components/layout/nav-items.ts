import {
  BarChart3,
  Home,
  Layers,
  Network,
  Package,
  Settings,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "الرئيسية", href: "/dashboard", icon: Home },
  { label: "المشتركين", href: "/customers", icon: Users },
  { label: "الباقات", href: "/plans", icon: Package },
  { label: "الاشتراكات", href: "/subscriptions", icon: Layers },
  { label: "الدفعات", href: "/payments", icon: Wallet },
  { label: "الشبكة", href: "/network", icon: Network },
  { label: "الأعطال", href: "/tickets", icon: Wrench },
  { label: "التقارير", href: "/reports", icon: BarChart3 },
  { label: "الإعدادات", href: "/settings", icon: Settings },
];
