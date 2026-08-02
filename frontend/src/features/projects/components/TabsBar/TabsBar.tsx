import type { ComponentType } from "react";
import { useI18n } from "@/hooks/useI18n";
import { cx } from "@/lib/cx";
import {
  Activity,
  BarChart3,
  FileText,
  GitCommitIcon,
  Layers,
  Mail,
} from "@/components/Icon/icons";
import type { IconProps } from "@/components/Icon/Icon";
import type { ProjectDetailTab } from "@/routes/paths";
import "@/features/projects/projects.css";

/**
 * Ported from REHUB WORK V8.html, script block 6, ~lines 2220-2238
 * (`TAB_DEFS`, `TabsBar`).
 */
interface TabDef {
  key: ProjectDetailTab;
  labelKey: string;
  icon: ComponentType<IconProps>;
}

const TAB_DEFS: TabDef[] = [
  { key: "documentation", labelKey: "tab.documentation", icon: FileText },
  { key: "reports", labelKey: "tab.reports", icon: BarChart3 },
  { key: "blueprints", labelKey: "tab.blueprints", icon: Layers },
  { key: "revisions", labelKey: "tab.revisions", icon: GitCommitIcon },
  { key: "audit", labelKey: "tab.audit", icon: Activity },
  { key: "inbox", labelKey: "tab.inbox", icon: Mail },
];

export interface TabsBarProps {
  active: ProjectDetailTab;
  onChange: (tab: ProjectDetailTab) => void;
  inboxDot?: boolean;
}

export function TabsBar({ active, onChange, inboxDot }: TabsBarProps) {
  const { t } = useI18n();
  return (
    <div className="rh-tabs-bar">
      {TAB_DEFS.map((tb) => {
        const on = active === tb.key;
        const IconCmp = tb.icon;
        return (
          <button
            key={tb.key}
            type="button"
            onClick={() => onChange(tb.key)}
            className={cx("rh-tabs-bar-btn", on && "rh-tabs-bar-btn-active")}
          >
            <IconCmp size={16} /> {t(tb.labelKey)}
            {tb.key === "inbox" && inboxDot && <span className="rh-tabs-bar-dot" />}
          </button>
        );
      })}
    </div>
  );
}
