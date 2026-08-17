"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PaginationControls({
  page,
  pageCount,
  total,
  pageSize,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefForPage(targetPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    return `${pathname}?${params.toString()}`;
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 border-t px-1 pt-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        عرض {from}–{to} من {total}
      </p>
      <div className="flex items-center gap-2">
        {page <= 1 ? (
          <Button variant="outline" size="sm" disabled>
            <ChevronRight className="size-4" />
            السابق
          </Button>
        ) : (
          <Button variant="outline" size="sm" nativeButton={false} render={<a href={hrefForPage(page - 1)} />}>
            <ChevronRight className="size-4" />
            السابق
          </Button>
        )}
        <span className="px-1 text-sm text-muted-foreground">
          صفحة {page} من {pageCount}
        </span>
        {page >= pageCount ? (
          <Button variant="outline" size="sm" disabled>
            التالي
            <ChevronLeft className="size-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" nativeButton={false} render={<a href={hrefForPage(page + 1)} />}>
            التالي
            <ChevronLeft className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
