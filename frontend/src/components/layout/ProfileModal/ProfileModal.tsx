import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/providers/ThemeProvider";
import { useDensity } from "@/providers/DensityProvider";
import { Dialog, DialogHeader } from "@/components/Dialog/Dialog";
import { Button } from "@/components/Button/Button";
import { Avatar } from "@/components/Avatar/Avatar";
import { Label } from "@/components/Label/Label";
import { Input } from "@/components/Input/Input";
import { Textarea } from "@/components/Textarea/Textarea";
import { StatusBadge } from "@/components/StatusBadge/StatusBadge";
import { DensityToggle } from "@/components/DensityToggle/DensityToggle";
import { UploadCloud, Sun, Moon } from "@/components/Icon/icons";
import { cx } from "@/lib/cx";
import { PROJECTS, CURRENT_USER_NAME_KEY } from "@/features/projects";
import { SettingsRow } from "@/components/layout/SettingsModal/SettingsModal";
import "./ProfileModal.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 3792-3875).
 * Drops the `projects` prop the source had -- imports `PROJECTS` directly
 * from `@/features/projects`, matching this codebase's convention
 * elsewhere (e.g. Sidebar.tsx).
 */
export interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { density, setDensity } = useDensity();
  const isDark = theme === "dark";
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(t(CURRENT_USER_NAME_KEY));
      setBio(t("profile.bioDefault"));
      setWorkEmail("v.kuzemko@rehub.org.ua");
      setPhotoUrl(null);
    }
  }, [open, t]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    }
  };

  const initials = (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("") || "U"
  ).toUpperCase();

  /* Projects where the current user is Lead Engineer or on the Team --
     matched by CURRENT_USER_NAME_KEY against the project's key-based
     leadEngineerKey/teamKeys fields (source matched bilingual {en,uk}
     objects by `.en`; this codebase's model is key-based instead). */
  const assignedProjects = useMemo(
    () =>
      PROJECTS.filter(
        (p) =>
          p.leadEngineerKey === CURRENT_USER_NAME_KEY || p.teamKeys.includes(CURRENT_USER_NAME_KEY),
      ),
    [],
  );

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <DialogHeader
        title={t("profile.title")}
        description={t("profile.subtitle")}
        onClose={onClose}
      />
      <div className="rh-profile-body">
        <div className="rh-profile-photo-row">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="rh-profile-photo" />
          ) : (
            <Avatar initials={initials} className="rh-profile-photo" />
          )}
          <div>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <UploadCloud size={14} /> {t("profile.uploadPhoto")}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="rh-profile-photo-input"
              onChange={handlePhotoChange}
            />
          </div>
        </div>
        <div>
          <Label>{t("profile.name")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>{t("profile.bio")}</Label>
          <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div>
          <Label>{t("profile.workEmail")}</Label>
          <Input type="email" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} />
        </div>
        <div>
          <Label>{t("profile.preferences")}</Label>
          <div className="rh-profile-prefs">
            <SettingsRow title={t("settings.theme")}>
              <div className="rh-profile-theme-toggle">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cx("rh-profile-theme-btn", !isDark && "rh-profile-theme-btn-active")}
                >
                  <Sun size={14} /> {t("settings.themeLight")}
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cx("rh-profile-theme-btn", isDark && "rh-profile-theme-btn-active")}
                >
                  <Moon size={14} /> {t("settings.themeDark")}
                </button>
              </div>
            </SettingsRow>
            <SettingsRow title={t("density.label")}>
              <DensityToggle density={density} onChange={setDensity} />
            </SettingsRow>
          </div>
        </div>
        <div>
          <Label>{t("profile.assignedProjects")}</Label>
          <div className="rh-profile-assigned-list">
            {assignedProjects.map((p) => (
              <div key={p.id} className="rh-profile-assigned-item">
                <div className="rh-profile-assigned-text">
                  <div className="rh-profile-assigned-name">{t(p.nameKey)}</div>
                  <div className="rh-profile-assigned-id">{p.id}</div>
                </div>
                <StatusBadge statusKey={p.statusKey} />
              </div>
            ))}
            {assignedProjects.length === 0 && (
              <div className="rh-profile-no-projects">{t("profile.noProjects")}</div>
            )}
          </div>
        </div>
      </div>
      <div className="rh-profile-footer">
        <Button variant="secondary" onClick={onClose}>
          {t("settings.done")}
        </Button>
      </div>
    </Dialog>
  );
}
