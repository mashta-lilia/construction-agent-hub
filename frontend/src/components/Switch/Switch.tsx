import { cx } from "@/lib/cx";
import "./Switch.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 309-316).
 */
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Switch({ checked, onChange, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx("rh-switch", checked && "rh-switch-checked", className)}
    >
      <span className="rh-switch-thumb" />
    </button>
  );
}
