"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlobalSearchResultsList } from "./global-search-results";
import { globalSearchAction, type GlobalSearchResults } from "@/lib/search/actions";

const DEBOUNCE_MS = 350;

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ctrl/Cmd+K opens the palette from anywhere in the dashboard.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (query.trim().length < 2) {
      // Nothing to clear here: GlobalSearchResultsList already ignores
      // `results` and shows the "type more" prompt whenever the query is
      // under 2 characters, regardless of stale state from a prior search.
      return;
    }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const result = await globalSearchAction(query);
        setResults(result);
      });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
      setResults(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="بحث شامل"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4.5" />
      </Button>
      <DialogContent className="top-24 flex max-h-[70vh] translate-y-0 flex-col overflow-hidden sm:max-w-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>بحث شامل</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن مشترك، اشتراك، دفعة، بلاغ، أو عنصر شبكة..."
            className="h-10 ps-8"
          />
        </div>
        <div className="overflow-y-auto pe-1">
          <GlobalSearchResultsList
            query={query}
            results={results}
            isPending={isPending}
            onSelect={() => handleOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
