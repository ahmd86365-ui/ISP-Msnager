"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
} from "@/lib/labels";

interface TechnicianOption {
  id: string;
  name: string;
}

export function TicketsFilters({
  technicians,
  showDateFilter = false,
  keepTechnicianIdInUrl = false,
}: {
  technicians: TechnicianOption[];
  showDateFilter?: boolean;
  // When true, picking "كل الفنيين" writes the literal "all" value instead
  // of removing the param — lets a caller (the technician work-queue page)
  // tell "explicitly chose all" apart from "no choice made yet" in the URL,
  // which it uses to redirect to a default technician only on first visit.
  keepTechnicianIdInUrl?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const isFirstRender = useRef(true);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => updateParam("q", search || null), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث بالعنوان أو اسم المشترك"
            className="ps-8"
          />
        </div>

        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(value) => updateParam("status", value === "all" ? null : value)}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="الحالة">
              {(value: string | null) =>
                value && value !== "all"
                  ? TICKET_STATUS_LABELS[value as TicketStatus]
                  : "كل الحالات"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("priority") ?? "all"}
          onValueChange={(value) => updateParam("priority", value === "all" ? null : value)}
        >
          <SelectTrigger className="sm:w-36">
            <SelectValue placeholder="الأولوية">
              {(value: string | null) =>
                value && value !== "all"
                  ? TICKET_PRIORITY_LABELS[value as TicketPriority]
                  : "كل الأولويات"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأولويات</SelectItem>
            {Object.entries(TICKET_PRIORITY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("category") ?? "all"}
          onValueChange={(value) => updateParam("category", value === "all" ? null : value)}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="التصنيف">
              {(value: string | null) =>
                value && value !== "all"
                  ? TICKET_CATEGORY_LABELS[value as TicketCategory]
                  : "كل التصنيفات"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {Object.entries(TICKET_CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("technicianId") ?? "all"}
          onValueChange={(value) =>
            updateParam(
              "technicianId",
              value === "all" ? (keepTechnicianIdInUrl ? "all" : null) : value,
            )
          }
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="الفني المسؤول">
              {(value: string | null) => {
                if (!value || value === "all") return "كل الفنيين";
                const selected = technicians.find((t) => t.id === value);
                return selected ? selected.name : "كل الفنيين";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفنيين</SelectItem>
            {technicians.map((technician) => (
              <SelectItem key={technician.id} value={technician.id}>
                {technician.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showDateFilter && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="createdFrom" className="text-muted-foreground">
              تاريخ الإنشاء من
            </Label>
            <Input
              id="createdFrom"
              type="date"
              className="w-40"
              defaultValue={searchParams.get("createdFrom") ?? ""}
              onChange={(event) => updateParam("createdFrom", event.target.value || null)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="createdTo" className="text-muted-foreground">
              إلى
            </Label>
            <Input
              id="createdTo"
              type="date"
              className="w-40"
              defaultValue={searchParams.get("createdTo") ?? ""}
              onChange={(event) => updateParam("createdTo", event.target.value || null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
