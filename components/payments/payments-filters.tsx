"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { PaymentMethod } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_METHOD_LABELS } from "@/lib/labels";

interface CustomerOption {
  id: string;
  fullName: string;
  customerNumber: string;
}

const STATUS_LABELS: Record<"active" | "voided", string> = {
  active: "فعالة",
  voided: "ملغاة",
};

export function PaymentsFilters({ customers }: { customers: CustomerOption[] }) {
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
            placeholder="ابحث باسم المشترك أو رقم العملية"
            className="ps-8"
          />
        </div>

        <Select
          value={searchParams.get("customerId") ?? "all"}
          onValueChange={(value) =>
            updateParam("customerId", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="المشترك">
              {(value: string | null) => {
                if (!value || value === "all") return "كل المشتركين";
                const selected = customers.find((c) => c.id === value);
                return selected ? selected.fullName : "كل المشتركين";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المشتركين</SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.fullName} — {customer.customerNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("method") ?? "all"}
          onValueChange={(value) =>
            updateParam("method", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="طريقة الدفع">
              {(value: string | null) =>
                value && value !== "all"
                  ? PAYMENT_METHOD_LABELS[value as PaymentMethod]
                  : "كل الطرق"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الطرق</SelectItem>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(value) =>
            updateParam("status", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="sm:w-32">
            <SelectValue placeholder="الحالة">
              {(value: string | null) =>
                value && value !== "all"
                  ? STATUS_LABELS[value as "active" | "voided"]
                  : "كل الحالات"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="active">فعالة</SelectItem>
            <SelectItem value="voided">ملغاة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="dateFrom" className="text-muted-foreground">
            تاريخ الدفع من
          </Label>
          <Input
            id="dateFrom"
            type="date"
            className="w-40"
            defaultValue={searchParams.get("dateFrom") ?? ""}
            onChange={(event) => updateParam("dateFrom", event.target.value || null)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="dateTo" className="text-muted-foreground">
            إلى
          </Label>
          <Input
            id="dateTo"
            type="date"
            className="w-40"
            defaultValue={searchParams.get("dateTo") ?? ""}
            onChange={(event) => updateParam("dateTo", event.target.value || null)}
          />
        </div>
      </div>
    </div>
  );
}
