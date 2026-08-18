"use client";

import { useState, useTransition } from "react";
import type { TicketStatus } from "@prisma/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TICKET_STATUS_LABELS } from "@/lib/labels";
import { updateTicketStatusAction } from "@/lib/tickets/actions";

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];

export function TicketStatusSelect({
  ticketId,
  status,
}: {
  ticketId: string;
  status: TicketStatus;
}) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: string | null) {
    if (!next || next === current) return;
    const previous = current;
    setCurrent(next as TicketStatus);
    setError(null);
    startTransition(async () => {
      const result = await updateTicketStatusAction(ticketId, next);
      if (!result.ok) {
        setCurrent(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Select value={current} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue>
            {(value: TicketStatus | null) => (value ? TICKET_STATUS_LABELS[value] : null)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {TICKET_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
