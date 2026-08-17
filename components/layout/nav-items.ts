import {
  BarChart3,
  Building2,
  Home,
  Layers,
  MapPin,
  Package,
  Router,
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
  { label: "نقاط التوزيع", href: "/network/distribution-points", icon: MapPin },
  { label: "الأبنية", href: "/network/buildings", icon: Building2 },
  { label: "الأجهزة", href: "/network/devices", icon: Router },
  { label: "الأعطال", href: "/tickets", icon: Wrench },
  { label: "التقارير", href: "/reports", icon: BarChart3 },
  { label: "الإعدادات", href: "/settings", icon: Settings },
];
