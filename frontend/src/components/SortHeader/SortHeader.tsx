import { cx } from "@/lib/cx";
import { ChevronDown, ChevronsUpDown } from "@/components/Icon/icons";
import "./SortHeader.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 508-515).
 */
export type SortAlign = "left" | "right";

export interface SortHeaderProps {
  label: string;
  sortKey: string;
  activeKey: string | null;
  dir: "asc" | "desc";
  onSort: (key: string) => void;
  align?: SortAlign;
}

export function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = "left",
}: SortHeaderProps) {
  const active = activeKey === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={cx(
        "rh-sort-header",
        align === "right" ? "rh-sort-header-right" : "rh-sort-header-left",
        active && "rh-sort-header-active",
      )}
    >
      <span
        className={cx("rh-sort-header-inner", align === "right" && "rh-sort-header-inner-reverse")}
      >
        {label}
        {active ? (
          <ChevronDown
            size={12}
            className={cx("rh-sort-header-icon", dir === "asc" && "rh-sort-header-icon-asc")}
          />
        ) : (
          <ChevronsUpDown size={12} className="rh-sort-header-icon-idle" />
        )}
      </span>
    </th>
  );
}
