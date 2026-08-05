import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "@/lib/cx";
import { useI18n } from "@/hooks/useI18n";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { PROJECTS, type Project } from "@/features/projects";
import { makeDocuments, type ProjectDocument } from "@/features/documents";
import { Search, X, Briefcase, FileText } from "@/components/Icon/icons";
import "./CommandPalette.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 1831-1930). This
 * is a bespoke overlay (not built on `Dialog`), so -- unlike every other
 * component in this pass -- it calls `useFocusTrap` itself directly
 * (source ~line 1837). The global Cmd/Ctrl+K listener that flips `open`
 * lives in AppShell (a later agent), not here.
 */
export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenProject: (project: Project, tab?: string) => void;
}

interface ProjectResult {
  type: "project";
  project: Project;
}
interface DocumentResult {
  type: "document";
  project: Project;
  doc: ProjectDocument;
}
type PaletteResult = ProjectResult | DocumentResult;

/**
 * Placeholder cross-project document index: `features/documents` has no
 * per-project persisted state yet (documents haven't been wired to a
 * store -- a known, flagged gap, not a bug to fix here). `makeDocuments()`
 * returns the same static seed list regardless of project, so it's called
 * once and paired against every project to approximate the source's
 * per-project `projectDataById[p.id].documents` search. Replace this once
 * `features/documents` gains real per-project document state.
 */
const DOCUMENT_SEED = makeDocuments();

export function CommandPalette({ open, onClose, onOpenProject }: CommandPaletteProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef, onClose);
  const listboxId = useId();
  /* Keyed by flatResults index rather than a plain array so a ref never
     goes stale across the two separately-mapped project/document
     sections -- each option's DOM node is looked up by the same `idx`
     used for aria-selected/active-state below. */
  const optionRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      const tm = setTimeout(() => {
        inputRef.current?.focus();
      }, 20);
      return () => clearTimeout(tm);
    }
    return undefined;
  }, [open]);

  const q = query.trim().toLowerCase();

  const projectResults = useMemo<Project[]>(() => {
    if (!q) return [];
    return PROJECTS.filter(
      (p) => t(p.nameKey).toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [q, t]);

  const documentResults = useMemo<Array<{ project: Project; doc: ProjectDocument }>>(() => {
    if (!q) return [];
    const out: Array<{ project: Project; doc: ProjectDocument }> = [];
    for (const p of PROJECTS) {
      for (const d of DOCUMENT_SEED) {
        if (d.name.toLowerCase().includes(q)) out.push({ project: p, doc: d });
      }
    }
    return out.slice(0, 8);
  }, [q]);

  const flatResults = useMemo<PaletteResult[]>(
    () => [
      ...projectResults.map((project): ProjectResult => ({ type: "project", project })),
      ...documentResults.map((r): DocumentResult => ({
        type: "document",
        project: r.project,
        doc: r.doc,
      })),
    ],
    [projectResults, documentResults],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const optionId = (idx: number) => `${listboxId}-option-${idx}`;

  const selectResult = (r: PaletteResult | undefined) => {
    if (!r) return;
    if (r.type === "project") onOpenProject(r.project);
    else onOpenProject(r.project, "documentation");
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectResult(flatResults[activeIndex]);
    }
  };

  if (!open) return null;

  return (
    <div className="rh-palette-overlay rh-animate-fade-in" onMouseDown={onClose}>
      <div className="rh-palette-backdrop" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        className="rh-palette-panel rh-animate-scale-in"
      >
        <div className="rh-palette-input-row">
          <Search size={16} className="rh-palette-input-icon" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("palette.placeholder")}
            aria-label={t("palette.placeholder")}
            role="combobox"
            aria-expanded={flatResults.length > 0}
            // Conditional to match the results container, which only carries
            // `id={listboxId}` while it actually has the `listbox` role. An
            // unconditional `aria-controls` pointed at a non-existent id
            // whenever the palette had no results.
            aria-controls={flatResults.length > 0 ? listboxId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={flatResults.length > 0 ? optionId(activeIndex) : undefined}
            className="rh-palette-input"
          />
          <button onClick={onClose} aria-label={t("action.close")} className="rh-palette-close">
            <X size={16} />
          </button>
        </div>
        <div
          className="rh-palette-results"
          role={flatResults.length > 0 ? "listbox" : undefined}
          id={flatResults.length > 0 ? listboxId : undefined}
        >
          {!q ? (
            <div className="rh-palette-message">{t("palette.hint")}</div>
          ) : flatResults.length === 0 ? (
            <div className="rh-palette-message">{t("palette.noResults")}</div>
          ) : (
            <>
              {projectResults.length > 0 && (
                <div className="rh-palette-section">
                  <div className="rh-palette-section-label">{t("palette.projects")}</div>
                  {projectResults.map((p) => {
                    const idx = flatResults.findIndex(
                      (r) => r.type === "project" && r.project.id === p.id,
                    );
                    return (
                      <button
                        key={p.id}
                        id={optionId(idx)}
                        role="option"
                        aria-selected={idx === activeIndex}
                        ref={(el) => {
                          optionRefs.current[idx] = el;
                        }}
                        onClick={() => selectResult({ type: "project", project: p })}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cx(
                          "rh-palette-item",
                          idx === activeIndex && "rh-palette-item-active",
                        )}
                      >
                        <Briefcase size={16} className="rh-palette-item-icon" />
                        <span className="rh-palette-item-label">{t(p.nameKey)}</span>
                        <span className="rh-palette-item-meta">{p.id}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {documentResults.length > 0 && (
                <div className="rh-palette-section rh-palette-section-bordered">
                  <div className="rh-palette-section-label">{t("palette.documents")}</div>
                  {documentResults.map((r) => {
                    const idx = flatResults.findIndex(
                      (x) =>
                        x.type === "document" &&
                        x.doc.id === r.doc.id &&
                        x.project.id === r.project.id,
                    );
                    return (
                      <button
                        key={r.project.id + "-" + r.doc.id}
                        id={optionId(idx)}
                        role="option"
                        aria-selected={idx === activeIndex}
                        ref={(el) => {
                          optionRefs.current[idx] = el;
                        }}
                        onClick={() =>
                          selectResult({ type: "document", project: r.project, doc: r.doc })
                        }
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cx(
                          "rh-palette-item",
                          idx === activeIndex && "rh-palette-item-active",
                        )}
                      >
                        <FileText size={16} className="rh-palette-item-icon" />
                        <span className="rh-palette-item-label">{r.doc.name}</span>
                        <span className="rh-palette-item-meta rh-palette-item-meta-truncate">
                          {t(r.project.nameKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
