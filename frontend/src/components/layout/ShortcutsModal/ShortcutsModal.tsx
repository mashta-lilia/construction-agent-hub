import { useI18n } from "@/hooks/useI18n";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import { Button } from "@/components/Button/Button";
import "./ShortcutsModal.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 1966-1993). Does
 * NOT own the `?` key listener that opens it -- that lives in AppShell
 * (built by a later agent); this only renders given `open`.
 */
export interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutRow {
  keys: string;
  desc: string;
}

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  const { t } = useI18n();
  const rows: ShortcutRow[] = [
    { keys: "Cmd/Ctrl + K", desc: t("shortcuts.openPalette") },
    { keys: "Esc", desc: t("shortcuts.closeModal") },
    { keys: "↑ / ↓", desc: t("shortcuts.navigate") },
    { keys: "Enter", desc: t("shortcuts.select") },
    { keys: "?", desc: t("shortcuts.openPanel") },
  ];

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogHeader
        title={t("shortcuts.title")}
        description={t("shortcuts.subtitle")}
        onClose={onClose}
      />
      <div className="rh-shortcuts-body">
        <div className="rh-shortcuts-rows">
          {rows.map((r, i) => (
            <div key={i} className="rh-shortcuts-row">
              <span className="rh-shortcuts-desc">{r.desc}</span>
              <kbd className="rh-shortcuts-kbd">{r.keys}</kbd>
            </div>
          ))}
        </div>
      </div>
      <div className="rh-shortcuts-footer">
        <Button variant="secondary" onClick={onClose}>
          {t("settings.done")}
        </Button>
      </div>
    </Dialog>
  );
}
