"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubscriptionStatus } from "@prisma/client";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/labels";

interface PlanOption {
  id: string;
  name: string;
}

export function SubscriptionsFilters({ plans }: { plans: PlanOption[] }) {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ابحث بالاسم أو الهاتف أو رقم المشترك"
            className="ps-8"
          />
        </div>

        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(value) =>
            updateParam("status", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="sm:w-40">
            {/* Render-prop children: Base UI's SelectValue can only derive
                a label from a matching <SelectItem>'s mounted content, which
                doesn't happen until the popup has been opened once — so a
                controlled value would otherwise render as the raw "all" /
                enum string on first paint. */}
            <SelectValue placeholder="الحالة">
              {(value: string | null) =>
                value && value !== "all"
                  ? SUBSCRIPTION_STATUS_LABELS[value as SubscriptionStatus]
                  : "كل الحالات"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {Object.entries(SUBSCRIPTION_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("planId") ?? "all"}
          onValueChange={(value) =>
            updateParam("planId", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="الباقة">
              {(value: string | null) => {
                if (!value || value === "all") return "كل الباقات";
                return plans.find((plan) => plan.id === value)?.name ?? "كل الباقات";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الباقات</SelectItem>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="endDateFrom" className="text-muted-foreground">
            تاريخ الانتهاء من
          </Label>
          <Input
            id="endDateFrom"
            type="date"
            className="w-40"
            defaultValue={searchParams.get("endDateFrom") ?? ""}
            onChange={(event) => updateParam("endDateFrom", event.target.value || null)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="endDateTo" className="text-muted-foreground">
            إلى
          </Label>
          <Input
            id="endDateTo"
            type="date"
            className="w-40"
            defaultValue={searchParams.get("endDateTo") ?? ""}
            onChange={(event) => updateParam("endDateTo", event.target.value || null)}
          />
        </div>
      </div>
    </div>
  );
}
