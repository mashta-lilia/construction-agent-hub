'use client';

import { useCallback, useMemo, useState } from 'react';

import { isBilingual } from '@/lib/bilingual';
import type { SortDirection } from '@/types';

/** Keys of `T` whose value can be ordered (string, number, or bilingual). */
type SortableKey<T> = {
  [K in keyof T]: T[K] extends string | number | { en: string; uk: string } | null | undefined
    ? K
    : never;
}[keyof T];

interface SortableData<T, K extends SortableKey<T>> {
  sorted: readonly T[];
  sortKey: K | null;
  sortDir: SortDirection;
  requestSort: (key: K) => void;
}

/**
 * Port of the prototype's `useSortableData`, now generic. Bilingual values sort
 * by their English form so the order does not jump when the locale changes;
 * strings compare case-insensitively.
 */
export function useSortableData<T, K extends SortableKey<T>>(
  items: readonly T[],
  initialKey: K | null = null,
  initialDir: SortDirection = 'asc',
): SortableData<T, K> {
  const [sortKey, setSortKey] = useState<K | null>(initialKey);
  const [sortDir, setSortDir] = useState<SortDirection>(initialDir);

  const sorted = useMemo(() => {
    if (!sortKey) return items;

    const comparableOf = (item: T): string | number => {
      const value = item[sortKey];
      if (isBilingual(value)) return value.en.toLowerCase();
      if (typeof value === 'string') return value.toLowerCase();
      if (typeof value === 'number') return value;
      return '';
    };

    return [...items].sort((a, b) => {
      const left = comparableOf(a);
      const right = comparableOf(b);
      if (left < right) return sortDir === 'asc' ? -1 : 1;
      if (left > right) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortKey, sortDir]);

  const requestSort = useCallback((key: K) => {
    setSortKey((current) => {
      if (current === key) {
        setSortDir((direction) => (direction === 'asc' ? 'desc' : 'asc'));
        return current;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  return { sorted, sortKey, sortDir, requestSort };
}
