"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { NetworkDeviceType } from "@prisma/client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EQUIPMENT_STATUS_LABELS, NETWORK_DEVICE_TYPE_LABELS } from "@/lib/labels";

interface DistributionPointOption {
  id: string;
  name: string;
  code: string;
}

export function DevicesFilters({
  distributionPoints,
}: {
  distributionPoints: DistributionPointOption[];
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:max-w-xs sm:flex-1">
        <Search className="pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث بالاسم أو الموديل أو IP أو MAC"
          className="ps-8"
        />
      </div>

      <Select
        value={searchParams.get("type") ?? "all"}
        onValueChange={(value) => updateParam("type", value === "all" ? null : value)}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="النوع">
            {(value: string | null) =>
              value && value !== "all"
                ? NETWORK_DEVICE_TYPE_LABELS[value as NetworkDeviceType]
                : "كل الأنواع"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الأنواع</SelectItem>
          {Object.entries(NETWORK_DEVICE_TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(value) => updateParam("status", value === "all" ? null : value)}
      >
        <SelectTrigger className="sm:w-36">
          <SelectValue placeholder="الحالة">
            {(value: string | null) =>
              value && value !== "all"
                ? EQUIPMENT_STATUS_LABELS[value as keyof typeof EQUIPMENT_STATUS_LABELS]
                : "كل الحالات"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل الحالات</SelectItem>
          {Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("distributionPointId") ?? "all"}
        onValueChange={(value) =>
          updateParam("distributionPointId", value === "all" ? null : value)
        }
      >
        <SelectTrigger className="sm:w-56">
          <SelectValue placeholder="نقطة التوزيع">
            {(value: string | null) => {
              if (!value || value === "all") return "كل نقاط التوزيع";
              const selected = distributionPoints.find((point) => point.id === value);
              return selected ? selected.name : "كل نقاط التوزيع";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">كل نقاط التوزيع</SelectItem>
          {distributionPoints.map((point) => (
            <SelectItem key={point.id} value={point.id}>
              {point.name} — {point.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
