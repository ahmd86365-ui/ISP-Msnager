"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Applies only to the "خلال الفترة المحددة" figures on the reports page —
// current-snapshot figures (totals, status breakdowns, network counts) and
// the fixed trailing trends (revenue/tickets over time) are unaffected, and
// the page labels each section accordingly so the two never get confused.
export function ReportsDateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function clearRange() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
      <span className="text-sm font-medium text-foreground">الفترة الزمنية للتقارير</span>
      <div className="flex items-center gap-2">
        <Label htmlFor="reportsFrom" className="text-muted-foreground">
          من
        </Label>
        <Input
          id="reportsFrom"
          type="date"
          className="w-40"
          value={from}
          onChange={(event) => updateParam("from", event.target.value || null)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="reportsTo" className="text-muted-foreground">
          إلى
        </Label>
        <Input
          id="reportsTo"
          type="date"
          className="w-40"
          value={to}
          onChange={(event) => updateParam("to", event.target.value || null)}
        />
      </div>
      {(from || to) && (
        <Button variant="ghost" size="sm" onClick={clearRange}>
          <X className="size-4" />
          إعادة التعيين (كل الفترة)
        </Button>
      )}
    </div>
  );
}
