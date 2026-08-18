"use client";

import { useState, useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignTicketAction } from "@/lib/tickets/actions";

const NO_TECHNICIAN_VALUE = "__none__";

export interface TechnicianOption {
  id: string;
  name: string;
}

export function TicketAssignSelect({
  ticketId,
  assignedTechnicianId,
  technicians,
}: {
  ticketId: string;
  assignedTechnicianId: string | null;
  technicians: TechnicianOption[];
}) {
  const [current, setCurrent] = useState(assignedTechnicianId ?? NO_TECHNICIAN_VALUE);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: string | null) {
    const value = next ?? NO_TECHNICIAN_VALUE;
    if (value === current) return;
    const previous = current;
    setCurrent(value);
    setError(null);
    startTransition(async () => {
      const result = await assignTicketAction(
        ticketId,
        value === NO_TECHNICIAN_VALUE ? "" : value,
      );
      if (!result.ok) {
        setCurrent(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Select value={current} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue>
            {(value: string | null) => {
              if (!value || value === NO_TECHNICIAN_VALUE) return "بدون إسناد";
              const selected = technicians.find((t) => t.id === value);
              return selected ? selected.name : "بدون إسناد";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_TECHNICIAN_VALUE}>بدون إسناد</SelectItem>
          {technicians.map((technician) => (
            <SelectItem key={technician.id} value={technician.id}>
              {technician.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
