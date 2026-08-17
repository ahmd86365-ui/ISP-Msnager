"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DistributionPointOption {
  id: string;
  name: string;
  code: string;
}

export function BuildingsFilters({
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
          placeholder="ابحث بالاسم أو العنوان أو المنطقة"
          className="ps-8"
        />
      </div>

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
