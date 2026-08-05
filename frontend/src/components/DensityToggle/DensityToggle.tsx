import { cx } from "@/lib/cx";
import { useI18n } from "@/hooks/useI18n";
import { Icon, type IconProps } from "@/components/Icon/Icon";
import type { Density } from "@/providers/DensityProvider";
import "./DensityToggle.css";

/**
 * Ported from REHUB WORK V8.html (~lines 1996-2006). The two density
 * icons are kept alongside DensityToggle (rather than in the shared
 * Icon/icons.tsx set) because the source defines them right next to the
 * component that uses them and they aren't reused elsewhere.
 */
export function DensityComfortIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 5h18" />
      <path d="M3 12h18" />
      <path d="M3 19h18" />
    </Icon>
  );
}

export function DensityCompactIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 6h18" />
      <path d="M3 10h18" />
      <path d="M3 14h18" />
      <path d="M3 18h18" />
    </Icon>
  );
}

export interface DensityToggleProps {
  density: Density;
  onChange: (density: Density) => void;
  className?: string;
}

export function DensityToggle({ density, onChange, className }: DensityToggleProps) {
  const { t } = useI18n();
  return (
    <div className={cx("rh-density-toggle", className)}>
      <button
        type="button"
        onClick={() => onChange("comfortable")}
        title={t("density.comfortable")}
        aria-label={t("density.comfortable")}
        className={cx(
          "rh-density-toggle-btn",
          density === "comfortable" && "rh-density-toggle-btn-active",
        )}
      >
        <DensityComfortIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange("compact")}
        title={t("density.compact")}
        aria-label={t("density.compact")}
        className={cx(
          "rh-density-toggle-btn",
          density === "compact" && "rh-density-toggle-btn-active",
        )}
      >
        <DensityCompactIcon size={16} />
      </button>
    </div>
  );
}
