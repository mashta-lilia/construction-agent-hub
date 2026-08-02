import { useI18n } from "@/hooks/useI18n";
import { useSortableData } from "@/hooks/useSortableData";
import { Card } from "@/components/Card/Card";
import { SortHeader } from "@/components/SortHeader/SortHeader";
import { Layers } from "@/components/Icon/icons";
import type { Blueprint } from "@/features/documents/types";
import "@/features/documents/documents.css";

/**
 * Ported from REHUB WORK V8.html, script block 6, lines ~2905-2934.
 */
export interface BlueprintsTabProps {
  blueprints: Blueprint[];
}

export function BlueprintsTab({ blueprints }: BlueprintsTabProps) {
  const { t } = useI18n();
  /* `useSortableData<T extends Record<string, unknown>>` needs an explicit
   * index-signature-compatible type argument under project-mode `tsc -b`
   * (plain interfaces like `Blueprint` aren't structurally assignable to
   * `Record<string, unknown>` without one) -- this local cast satisfies the
   * hook's generic constraint without changing the shared `Blueprint` type
   * or the hook itself. Same pre-existing constraint mismatch is
   * independently hit by `features/reports`' `ReportsTab`. */
  const { sorted, sortKey, sortDir, requestSort } = useSortableData(
    blueprints as (Blueprint & Record<string, unknown>)[],
    "date",
    "desc",
  );

  return (
    <Card className="rh-doc-table-card">
      <div className="rh-doc-table-scroll">
        <table className="rh-doc-table">
          <thead>
            <tr>
              <SortHeader
                label={t("col.name")}
                sortKey="name"
                activeKey={sortKey}
                dir={sortDir}
                onSort={requestSort}
              />
              <SortHeader
                label={t("col.discipline")}
                sortKey="disciplineKey"
                activeKey={sortKey}
                dir={sortDir}
                onSort={requestSort}
              />
              <SortHeader
                label={t("col.revision")}
                sortKey="revision"
                activeKey={sortKey}
                dir={sortDir}
                onSort={requestSort}
              />
              <SortHeader
                label={t("col.date")}
                sortKey="date"
                activeKey={sortKey}
                dir={sortDir}
                onSort={requestSort}
              />
            </tr>
          </thead>
          <tbody>
            {sorted.map((b) => (
              <tr key={b.id}>
                <td className="rh-doc-table-cell">
                  <div className="rh-doc-table-name">
                    <Layers size={16} className="rh-doc-table-name-icon" /> {b.name}
                  </div>
                </td>
                <td className="rh-doc-table-cell rh-doc-table-muted">{t(b.disciplineKey)}</td>
                <td className="rh-doc-table-cell rh-doc-table-mono">{b.revision}</td>
                <td className="rh-doc-table-cell rh-doc-table-muted">{b.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
