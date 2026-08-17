import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Accent = "blue" | "orange" | "aqua" | "violet";

const ACCENT_CLASSES: Record<Accent, string> = {
  blue: "bg-chart-1/10 text-chart-1",
  orange: "bg-chart-2/10 text-chart-2",
  aqua: "bg-chart-3/10 text-chart-3",
  violet: "bg-chart-4/10 text-chart-4",
};

const ACCENT_TEXT: Record<Accent, string> = {
  blue: "text-chart-1",
  orange: "text-chart-2",
  aqua: "text-chart-3",
  violet: "text-chart-4",
};

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: Accent;
  delta?: { text: string; tone: "good" | "bad" | "neutral" };
}

export function StatCard({ label, value, icon: Icon, accent, delta }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-sm font-medium", ACCENT_TEXT[accent])}>{label}</p>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            ACCENT_CLASSES[accent],
          )}
        >
          <Icon className="size-4.5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-foreground">
        {value}
      </p>
      {delta && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            delta.tone === "good" && "text-status-good",
            delta.tone === "bad" && "text-status-critical",
            delta.tone === "neutral" && "text-muted-foreground",
          )}
        >
          {delta.text}
        </p>
      )}
    </div>
  );
}
