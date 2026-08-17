"use client";

import { useTransition } from "react";
import { Power } from "lucide-react";

import { Button } from "@/components/ui/button";
import { togglePlanActiveAction } from "@/lib/plans/actions";

export function TogglePlanActiveButton({
  planId,
  isActive,
}: {
  planId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => togglePlanActiveAction(planId));
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleClick}
      disabled={isPending}
      title={isActive ? "تعطيل الباقة" : "تفعيل الباقة"}
    >
      <Power className="size-4" />
      <span className="sr-only">{isActive ? "تعطيل الباقة" : "تفعيل الباقة"}</span>
    </Button>
  );
}
