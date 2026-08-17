import { Calendar, ChevronDown } from "lucide-react";

// Visual placeholder matching the reference design — the dashboard doesn't
// filter by date yet, so this isn't wired to anything (no date-range query
// exists behind it). Always shows today's real date.
export function DateSelector() {
  const today = new Date().toLocaleDateString("en-CA");

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-foreground shadow-sm">
      <Calendar className="size-4 text-muted-foreground" />
      <span className="tabular-nums">{today}</span>
      <ChevronDown className="size-3.5 text-muted-foreground" />
    </div>
  );
}
