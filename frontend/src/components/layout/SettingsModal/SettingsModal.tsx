import { useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/providers/ThemeProvider";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import { Button } from "@/components/Button/Button";
import { Switch } from "@/components/Switch/Switch";
import { LangToggle } from "@/components/LangToggle/LangToggle";
import { Sun, Moon } from "@/components/Icon/icons";
import "./SettingsModal.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 3744-3789).
 * `SettingsRow` is a local, non-exported-by-default helper colocated here
 * exactly as source does (right above `SettingsModal`), but exported too
 * since `ProfileModal` reuses the same row layout for its embedded
 * theme/density preferences block.
 */
export interface SettingsRowProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

export function SettingsRow({ title, description, children }: SettingsRowProps) {
  return (
    <div className="rh-settings-row">
      <div className="rh-settings-row-text">
        <div className="rh-settings-row-title">{title}</div>
        {description && <div className="rh-settings-row-desc">{description}</div>}
      </div>
      <div className="rh-settings-row-control">{children}</div>
    </div>
  );
}

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const isDark = theme === "dark";

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <DialogHeader
        title={t("settings.title")}
        description={t("settings.subtitle")}
        onClose={onClose}
      />
      <div className="rh-settings-body">
        <div className="rh-settings-section-label">{t("settings.appearance")}</div>
        <div className="rh-settings-rows">
          <SettingsRow title={t("settings.theme")}>
            <div className="rh-settings-theme-toggle">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cx("rh-settings-theme-btn", !isDark && "rh-settings-theme-btn-active")}
              >
                <Sun size={14} /> {t("settings.themeLight")}
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cx("rh-settings-theme-btn", isDark && "rh-settings-theme-btn-active")}
              >
                <Moon size={14} /> {t("settings.themeDark")}
              </button>
            </div>
          </SettingsRow>
          <SettingsRow title={t("settings.language")}>
            <LangToggle />
          </SettingsRow>
        </div>

        <div className="rh-settings-section-label rh-settings-section-label-spaced">
          {t("settings.notifications")}
        </div>
        <div className="rh-settings-rows">
          <SettingsRow title={t("settings.emailNotif")} description={t("settings.emailNotifDesc")}>
            <Switch checked={emailNotif} onChange={setEmailNotif} />
          </SettingsRow>
        </div>
      </div>
      <div className="rh-settings-footer">
        <Button variant="secondary" onClick={onClose}>
          {t("settings.done")}
        </Button>
      </div>
    </Dialog>
  );
}
