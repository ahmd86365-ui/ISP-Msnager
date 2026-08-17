import { cn } from "@/lib/utils";

// Color carries reinforcement only (a small dot); the label text stays
// neutral/dark so legibility never depends on a status hue's own contrast
// against the card background (some of the palette's status hues — warning,
// serious — are intentionally low-contrast as flat text, per the design
// system's status palette notes).
export function StatusTag({
  color,
  tint,
  label,
}: {
  color: string;
  tint: string;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-foreground",
        tint,
      )}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
