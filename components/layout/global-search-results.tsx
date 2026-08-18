import Link from "next/link";
import { Layers, Network, Users, Wallet, Wrench, type LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { GlobalSearchResults } from "@/lib/search/actions";
import type { SearchResultItem } from "@/lib/search/queries";

interface GroupDef {
  key: keyof GlobalSearchResults;
  label: string;
  icon: LucideIcon;
}

const GROUPS: GroupDef[] = [
  { key: "customers", label: "المشتركون", icon: Users },
  { key: "subscriptions", label: "الاشتراكات", icon: Layers },
  { key: "payments", label: "الدفعات", icon: Wallet },
  { key: "tickets", label: "الأعطال", icon: Wrench },
  { key: "network", label: "الشبكة", icon: Network },
];

function ResultRow({ item, onSelect }: { item: SearchResultItem; onSelect: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onSelect}
      className="flex flex-col gap-0.5 rounded-lg px-2.5 py-2 text-start hover:bg-muted/70"
    >
      <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
      <span className="truncate text-xs text-muted-foreground">{item.subtitle}</span>
    </Link>
  );
}

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function GlobalSearchResultsList({
  query,
  results,
  isPending,
  onSelect,
}: {
  query: string;
  results: GlobalSearchResults | null;
  isPending: boolean;
  onSelect: () => void;
}) {
  if (query.trim().length < 2) {
    return (
      <p className="px-2 py-10 text-center text-sm text-muted-foreground">
        اكتب حرفين على الأقل للبحث في المشتركين، الاشتراكات، الدفعات، الأعطال، والشبكة.
      </p>
    );
  }

  if (isPending || !results) {
    return <ResultsSkeleton />;
  }

  const nonEmptyGroups = GROUPS.filter((group) => results[group.key].length > 0);

  if (nonEmptyGroups.length === 0) {
    return (
      <p className="px-2 py-10 text-center text-sm text-muted-foreground">
        لا توجد نتائج مطابقة لـ &quot;{query}&quot;
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {nonEmptyGroups.map((group) => (
        <div key={group.key} className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground">
            <group.icon className="size-3.5" />
            {group.label}
          </div>
          {results[group.key].map((item) => (
            <ResultRow key={item.id} item={item} onSelect={onSelect} />
          ))}
        </div>
      ))}
    </div>
  );
}
