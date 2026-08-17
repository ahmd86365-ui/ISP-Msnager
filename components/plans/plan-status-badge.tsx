import { StatusTag } from "@/components/shared/status-tag";

export function PlanStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <StatusTag
      color="var(--status-good)"
      tint="bg-status-good/10"
      label="مفعّلة"
    />
  ) : (
    <StatusTag color="var(--muted-foreground)" tint="bg-muted" label="معطّلة" />
  );
}
