import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/Button/Button";
import "./CookieBanner.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 4357-4365).
 * No state ownership here -- "already dismissed" state is owned by whoever
 * mounts it (matches source, where `Dashboard` owned `cookieDismissed`).
 */
export interface CookieBannerProps {
  onAccept: () => void;
}

export function CookieBanner({ onAccept }: CookieBannerProps) {
  const { t } = useI18n();
  return (
    <div className="rh-cookie-banner rh-animate-fade-in">
      <p className="rh-cookie-banner-text">{t("cookie.text")}</p>
      <Button variant="primary" size="sm" className="rh-cookie-banner-btn" onClick={onAccept}>
        {t("cookie.accept")}
      </Button>
    </div>
  );
}
