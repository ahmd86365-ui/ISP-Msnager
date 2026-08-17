import { StatusTag } from "@/components/shared/status-tag";

export function PaymentStatusBadge({ isVoided }: { isVoided: boolean }) {
  return isVoided ? (
    <StatusTag color="var(--muted-foreground)" tint="bg-muted" label="ملغاة" />
  ) : (
    <StatusTag color="var(--status-good)" tint="bg-status-good/10" label="فعالة" />
  );
}
