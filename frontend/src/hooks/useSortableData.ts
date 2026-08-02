import { useMemo, useState } from "react";

/**
 * Ported from REHUB WORK V8.html, script block 1 (~lines 199-217).
 * Generic over the row type `T`; original relied on JS duck-typing to
 * special-case bilingual `{ en, uk }` values (sorts by `.en`) and to
 * lowercase plain strings before comparing.
 */
export type SortDirection = "asc" | "desc";

interface BilingualLike {
  en: string;
}

function isBilingualLike(value: unknown): value is BilingualLike {
  return typeof value === "object" && value !== null && "en" in value;
}

function comparableValue(value: unknown): string | number | boolean | null {
  if (isBilingualLike(value)) return value.en;
  if (typeof value === "string") return value.toLowerCase();
  if (typeof value === "number" || typeof value === "boolean") return value;
  return null;
}

export interface UseSortableDataResult<T> {
  sorted: T[];
  sortKey: keyof T | null;
  sortDir: SortDirection;
  requestSort: (key: keyof T) => void;
}

export function useSortableData<T extends Record<string, unknown>>(
  items: T[],
  initialKey: keyof T | null = null,
  initialDir: SortDirection = "asc",
): UseSortableDataResult<T> {
  const [sortKey, setSortKey] = useState<keyof T | null>(initialKey);
  const [sortDir, setSortDir] = useState<SortDirection>(initialDir);

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    const copy = [...items];
    copy.sort((a, b) => {
      const av = comparableValue(a[sortKey]);
      const bv = comparableValue(b[sortKey]);
      if (av === null || bv === null) return 0;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [items, sortKey, sortDir]);

  const requestSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return { sorted, sortKey, sortDir, requestSort };
}
