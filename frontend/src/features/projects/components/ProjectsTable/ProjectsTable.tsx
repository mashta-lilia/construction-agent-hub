import { useEffect, useMemo, useState, type DragEvent } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useToast } from "@/providers/ToastProvider";
import { useDensity } from "@/providers/DensityProvider";
import { useSortableData } from "@/hooks/useSortableData";
import { cx } from "@/lib/cx";
import { formatCurrency, formatBudget } from "@/lib/format";
import { downloadBlob } from "@/lib/download";
import { Card } from "@/components/Card/Card";
import { Badge } from "@/components/Badge/Badge";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { Select, type SelectOption } from "@/components/Select/Select";
import { SortHeader } from "@/components/SortHeader/SortHeader";
import { KpiCard } from "@/components/KpiCard/KpiCard";
import { DensityToggle } from "@/components/DensityToggle/DensityToggle";
import { StatusBadge } from "@/components/StatusBadge/StatusBadge";
import { Download, DollarSign, Filter, Mail, Pin, Plus, Search, X } from "@/components/Icon/icons";
import { matchesNavFilter, type NavFilter } from "@/store/uiStore";
import { STAGE_KEYS, type Project } from "@/features/projects";
import "@/features/projects/projects.css";

/**
 * Ported from REHUB WORK V8.html, script block 6, ~lines 2009-2219
 * (`ProjectsTable`).
 *
 * `query` is the global TopBar search box value (`store/uiStore`'s
 * `searchQuery`); `tableQuery` below is the table's OWN local search input,
 * matching source's two independent-but-ANDed search inputs exactly.
 */
export interface ProjectsTableProps {
  projects: Project[];
  onOpen: (project: Project) => void;
  query: string;
  navFilter: NavFilter;
  onClearNavFilter?: () => void;
  onNewProject: () => void;
  onBulkUpdateProjects: (
    idsOrPairs: string[] | Array<{ id: string; patch: Partial<Project> }>,
    patch?: Partial<Project>,
  ) => void;
}

const NAV_FILTER_LABEL_KEY: Record<NonNullable<NavFilter>, string> = {
  active: "nav.activeSites",
  onHold: "nav.onHold",
  completed: "nav.completed",
};

export function ProjectsTable({
  projects,
  onOpen,
  query,
  navFilter,
  onClearNavFilter,
  onNewProject,
  onBulkUpdateProjects,
}: ProjectsTableProps) {
  const { t } = useI18n();
  const { density, setDensity } = useDensity();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [tableQuery, setTableQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  /* Pinned-to-top projects: in-memory only (ephemeral for this session), same lifetime as
     `selectedIds`/`density` -- pinned rows always render above unpinned ones regardless of
     the active column sort. */
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => new Set());

  const togglePin = (id: string) =>
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const statusOptions: SelectOption[] = [
    { value: "all", label: t("filter.all") },
    ...STAGE_KEYS.map((k) => ({ value: k, label: t(`status.${k}`) })),
  ];
  const stageBulkOptions: SelectOption[] = STAGE_KEYS.map((k) => ({
    value: k,
    label: t(`status.${k}`),
  }));

  const totalBudget = useMemo(
    () => projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    [projects],
  );
  const openRequests = useMemo(() => projects.filter((p) => p.hasAlert).length, [projects]);

  const q = (query || "").trim().toLowerCase();
  const tq = tableQuery.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    const name = t(p.nameKey).toLowerCase();
    const matchesQuery = !q || name.includes(q) || p.id.toLowerCase().includes(q);
    const matchesTableQuery = !tq || name.includes(tq) || p.id.toLowerCase().includes(tq);
    const matchesStatus = statusFilter === "all" || p.statusKey === statusFilter;
    return matchesQuery && matchesTableQuery && matchesStatus && matchesNavFilter(p, navFilter);
  });

  /* `useSortableData` is generic and locale-independent -- it can only compare the RAW field
     value it's given. `nameKey`/`deadlineKey`/`updatedKey` are i18n KEYS (e.g.
     "projects.seed.prj1042.name"), not real content, so sorting directly on them would sort by
     key string rather than by what's actually displayed (unlike, say, `ProjectDocument.name`,
     which IS the real filename). Precomputing resolved `_name`/`_deadline`/`_updated` fields
     and sorting on THOSE instead reproduces source's `L(p.name)` sort-by-display-text behavior. */
  const sortableRows = filtered.map((p) => ({
    ...p,
    _name: t(p.nameKey),
    _deadline: t(p.deadlineKey),
    _updated: t(p.updatedKey),
  }));

  const { sorted, sortKey, sortDir, requestSort } = useSortableData(sortableRows, "_name", "asc");
  /* Pinned rows always render above unpinned ones, preserving the active sort WITHIN each
     group -- pinning never overrides the user's chosen column sort, only groups on top of it. */
  const displayRows = useMemo(
    () => [
      ...sorted.filter((p) => pinnedIds.has(p.id)),
      ...sorted.filter((p) => !pinnedIds.has(p.id)),
    ],
    [sorted, pinnedIds],
  );
  const hasActiveFilters = statusFilter !== "all" || !!navFilter;

  /* Drop any selected id no longer present in the currently filtered/visible row set (e.g.
     the Stage filter or search query changed and hid some previously-selected rows) --
     otherwise a bulk action could silently apply to rows the user can no longer see. */
  const visibleIdsKey = sorted.map((p) => p.id).join(",");
  useEffect(() => {
    const visibleIds = new Set(visibleIdsKey ? visibleIdsKey.split(",") : []);
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (visibleIds.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [visibleIdsKey]);

  const allSelected = sorted.length > 0 && sorted.every((p) => selectedIds.has(p.id));
  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(sorted.map((p) => p.id)));
  const toggleSelectRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleBulkStageChange = (newStatusKey: string) => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    const priorPairs = projects
      .filter((p) => selectedIds.has(p.id))
      .map((p) => ({ id: p.id, patch: { statusKey: p.statusKey } }));
    onBulkUpdateProjects(ids, { statusKey: newStatusKey as Project["statusKey"] });
    toast(t("toast.bulkStageChanged", { n: ids.length }), "success", () => {
      onBulkUpdateProjects(priorPairs);
    });
    setSelectedIds(new Set());
  };

  const handleExportSelected = () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    const selectedProjects = projects.filter((p) => selectedIds.has(p.id));
    const rows = selectedProjects
      .map(
        (p) =>
          `<tr><td>${t(p.nameKey)}</td><td>${p.id}</td><td>${t(`status.${p.statusKey}`)}</td><td>${formatBudget(p.budget, t)}</td><td>${t(p.deadlineKey)}</td></tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${t("bulk.export")}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;color:#1e293b;padding:32px;} table{border-collapse:collapse;width:100%;} td,th{padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:left;}</style></head>
<body><h1>${t("bulk.export")}</h1><table><thead><tr><th>${t("col.name")}</th><th>${t("col.projectId")}</th><th>${t("col.stage")}</th><th>${t("col.budget")}</th><th>${t("col.deadline")}</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    downloadBlob(`projects_export_${ids.length}.html`, html, "text/html");
    toast(t("toast.bulkExported", { n: ids.length }), "success");
    setSelectedIds(new Set());
  };

  const handleRowDragStart = (e: DragEvent<HTMLTableRowElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  return (
    <div className="rh-projects-page">
      <div className="rh-projects-header">
        <div>
          <div className="rh-projects-header-title-row">
            <h1 className="rh-projects-title">{t("projects.title")}</h1>
            {navFilter && <Badge variant="blue">{t(NAV_FILTER_LABEL_KEY[navFilter])}</Badge>}
          </div>
          <p className="rh-projects-subtitle">{t("projects.subtitle", { n: projects.length })}</p>
        </div>
        <Button variant="primary" size="sm" onClick={onNewProject}>
          <Plus size={14} /> {t("projects.new")}
        </Button>
      </div>

      <div className="rh-projects-kpis">
        <KpiCard
          icon={DollarSign}
          label={t("kpi.totalBudget")}
          value={formatCurrency(totalBudget)}
          tone="blue"
        />
        <KpiCard icon={Mail} label={t("kpi.openRequests")} value={openRequests} tone="amber" />
      </div>

      <div className="rh-projects-toolbar">
        <div>
          <div className="rh-projects-filter-label">
            <Filter size={14} /> {t("filter.stageLabel")}
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            className="rh-projects-stage-select"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              onClearNavFilter?.();
            }}
          >
            <X size={14} /> {t("filter.clear")}
          </Button>
        )}
      </div>

      <div className="rh-projects-search-row">
        <div className="rh-projects-search">
          <Search size={14} className="rh-projects-search-icon" />
          <Input
            value={tableQuery}
            onChange={(e) => setTableQuery(e.target.value)}
            placeholder={t("table.searchPlaceholder")}
            className="rh-projects-search-input"
          />
        </div>
        <DensityToggle density={density} onChange={setDensity} />
      </div>

      {selectedIds.size > 0 && (
        <div className="rh-projects-bulk-bar rh-animate-fade-in">
          <span className="rh-projects-bulk-count">
            {t("bulk.selected", { n: selectedIds.size })}
          </span>
          <div className="rh-projects-bulk-stage">
            <span className="rh-projects-bulk-stage-label">{t("bulk.changeStage")}</span>
            <Select
              value=""
              onChange={handleBulkStageChange}
              options={stageBulkOptions}
              placeholder={t("filter.stageLabel")}
              className="rh-projects-bulk-stage-select"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExportSelected}>
            <Download size={14} /> {t("bulk.export")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rh-projects-bulk-clear"
            onClick={() => setSelectedIds(new Set())}
          >
            <X size={14} /> {t("filter.clear")}
          </Button>
        </div>
      )}

      <Card className="rh-projects-table-card">
        <div className="rh-projects-table-scroll">
          <table
            className={cx(
              "rh-projects-table",
              density === "compact" && "rh-projects-table-compact",
            )}
          >
            <thead>
              <tr className="rh-projects-table-head-row">
                <th className="rh-projects-table-head rh-projects-table-head-checkbox">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label={t("bulk.selectAllAria")}
                    className="rh-projects-checkbox"
                  />
                </th>
                <th className="rh-projects-table-head rh-projects-table-head-pin" />
                <SortHeader
                  label={t("col.projectId")}
                  sortKey="id"
                  activeKey={sortKey as string | null}
                  dir={sortDir}
                  onSort={(k) => requestSort(k as keyof Project)}
                />
                <SortHeader
                  label={t("col.name")}
                  sortKey="_name"
                  activeKey={sortKey as string | null}
                  dir={sortDir}
                  onSort={(k) => requestSort(k as never)}
                />
                <SortHeader
                  label={t("col.stage")}
                  sortKey="statusKey"
                  activeKey={sortKey as string | null}
                  dir={sortDir}
                  onSort={(k) => requestSort(k as keyof Project)}
                />
                <SortHeader
                  label={t("col.budget")}
                  sortKey="budget"
                  activeKey={sortKey as string | null}
                  dir={sortDir}
                  onSort={(k) => requestSort(k as keyof Project)}
                  align="right"
                />
                <SortHeader
                  label={t("col.deadline")}
                  sortKey="_deadline"
                  activeKey={sortKey as string | null}
                  dir={sortDir}
                  onSort={(k) => requestSort(k as never)}
                />
                <SortHeader
                  label={t("col.lastUpdated")}
                  sortKey="_updated"
                  activeKey={sortKey as string | null}
                  dir={sortDir}
                  onSort={(k) => requestSort(k as never)}
                />
              </tr>
            </thead>
            <tbody>
              {displayRows.map((p) => {
                const pinned = pinnedIds.has(p.id);
                return (
                  <tr
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, p.id)}
                    onClick={() => onOpen(p)}
                    className={cx(
                      "rh-projects-table-row",
                      pinned && "rh-projects-table-row-pinned",
                    )}
                  >
                    <td
                      className="rh-projects-table-cell rh-projects-table-cell-checkbox"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={() => toggleSelectRow(p.id)}
                        aria-label={t("bulk.selectRowAria", { p: t(p.nameKey) })}
                        className="rh-projects-checkbox"
                      />
                    </td>
                    <td
                      className="rh-projects-table-cell rh-projects-table-cell-pin"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => togglePin(p.id)}
                        aria-label={pinned ? t("pin.unpinAria") : t("pin.pinAria")}
                        className={cx(
                          "rh-projects-pin-btn",
                          pinned && "rh-projects-pin-btn-active",
                        )}
                      >
                        <Pin size={14} />
                      </button>
                    </td>
                    <td className="rh-projects-table-cell rh-projects-table-cell-id">{p.id}</td>
                    <td className="rh-projects-table-cell">
                      <div className="rh-projects-name-cell">
                        <span className="rh-projects-name-text">{t(p.nameKey)}</span>
                        {p.hasAlert && (
                          <span className="rh-projects-alert-badge">
                            <span className="rh-projects-alert-dot rh-animate-pulse-dot" />
                            {t("badge.newSupplierEmail")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="rh-projects-table-cell">
                      <StatusBadge statusKey={p.statusKey} />
                    </td>
                    <td className="rh-projects-table-cell rh-projects-table-cell-budget">
                      {formatBudget(p.budget, t)}
                    </td>
                    <td className="rh-projects-table-cell rh-projects-table-cell-muted">
                      {t(p.deadlineKey)}
                    </td>
                    <td className="rh-projects-table-cell rh-projects-table-cell-muted">
                      {t(p.updatedKey)}
                    </td>
                  </tr>
                );
              })}
              {displayRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="rh-projects-table-empty">
                    {t("filter.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
