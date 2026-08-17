import type {
  BillingPeriod,
  EquipmentStatus,
  NetworkDeviceType,
  PaymentMethod,
  Role,
  SubscriptionStatus,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "المالك",
  ADMIN: "مدير",
  ACCOUNTANT: "محاسب",
  SUPPORT: "دعم فني",
  TECHNICIAN: "فني",
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  INTERNET_DOWN: "انقطاع تام عن الخدمة",
  SLOW_SPEED: "سرعة إنترنت منخفضة",
  SIGNAL: "مشكلة إشارة",
  DEVICE: "عطل بجهاز",
  CABLE: "مشكلة كابل",
  BILLING: "مشكلة فوترة",
  INSTALLATION: "طلب تركيب",
  OTHER: "أخرى",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "منخفضة",
  MEDIUM: "متوسطة",
  HIGH: "عالية",
  CRITICAL: "حرجة",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "مفتوحة",
  IN_PROGRESS: "قيد المعالجة",
  WAITING: "بانتظار الرد",
  RESOLVED: "تم الحل",
  CLOSED: "مغلقة",
};

interface StatusStyle {
  color: string;
  tint: string;
}

export const TICKET_PRIORITY_STYLE: Record<TicketPriority, StatusStyle> = {
  LOW: { color: "var(--status-good)", tint: "bg-status-good/10" },
  MEDIUM: { color: "var(--status-warning)", tint: "bg-status-warning/15" },
  HIGH: { color: "var(--status-serious)", tint: "bg-status-serious/15" },
  CRITICAL: { color: "var(--status-critical)", tint: "bg-status-critical/10" },
};

export const TICKET_STATUS_STYLE: Record<TicketStatus, StatusStyle> = {
  OPEN: { color: "var(--status-critical)", tint: "bg-status-critical/10" },
  IN_PROGRESS: { color: "var(--chart-1)", tint: "bg-chart-1/10" },
  WAITING: { color: "var(--status-warning)", tint: "bg-status-warning/15" },
  RESOLVED: { color: "var(--status-good)", tint: "bg-status-good/10" },
  CLOSED: { color: "var(--muted-foreground)", tint: "bg-muted" },
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: "فعال",
  EXPIRED: "منتهي",
  SUSPENDED: "موقوف",
  CANCELLED: "ملغى",
  PENDING: "قيد الانتظار",
};

export const SUBSCRIPTION_STATUS_STYLE: Record<SubscriptionStatus, StatusStyle> = {
  ACTIVE: { color: "var(--status-good)", tint: "bg-status-good/10" },
  EXPIRED: { color: "var(--status-warning)", tint: "bg-status-warning/15" },
  SUSPENDED: { color: "var(--status-critical)", tint: "bg-status-critical/10" },
  CANCELLED: { color: "var(--muted-foreground)", tint: "bg-muted" },
  PENDING: { color: "var(--chart-1)", tint: "bg-chart-1/10" },
};

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  MONTHLY: "شهري",
  QUARTERLY: "ربع سنوي",
  SEMI_ANNUAL: "نصف سنوي",
  ANNUAL: "سنوي",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "نقداً",
  TRANSFER: "تحويل بنكي",
  WALLET: "محفظة إلكترونية",
  OTHER: "أخرى",
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  ACTIVE: "فعال",
  INACTIVE: "غير فعال",
  MAINTENANCE: "قيد الصيانة",
  DISABLED: "معطّل",
};

export const EQUIPMENT_STATUS_STYLE: Record<EquipmentStatus, StatusStyle> = {
  ACTIVE: { color: "var(--status-good)", tint: "bg-status-good/10" },
  INACTIVE: { color: "var(--muted-foreground)", tint: "bg-muted" },
  MAINTENANCE: { color: "var(--status-warning)", tint: "bg-status-warning/15" },
  DISABLED: { color: "var(--status-critical)", tint: "bg-status-critical/10" },
};

export const NETWORK_DEVICE_TYPE_LABELS: Record<NetworkDeviceType, string> = {
  ROUTER: "راوتر",
  SWITCH: "سويتش",
  ACCESS_POINT: "نقطة وصول لاسلكية",
  CPE: "جهاز مشترك (CPE)",
  OTHER: "أخرى",
};
