import { useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { usePopoverPosition } from "@/hooks/usePopoverPosition";
import { ChevronsUpDown, Check } from "@/components/Icon/icons";
import "./Select.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 342-372).
 * Uses `usePopoverPosition` + `position: fixed` so the option list escapes
 * clipping by a scrollable Dialog body.
 */
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const coords = usePopoverPosition(open, btnRef);
  const current = options.find((o) => o.value === value);

  return (
    <div className={cx("rh-select", className)}>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cx("rh-select-trigger", disabled && "rh-select-trigger-disabled")}
      >
        <span className={cx("rh-select-value", !current && "rh-select-placeholder")}>
          {current ? current.label : placeholder}
        </span>
        <ChevronsUpDown size={14} className="rh-select-chevron" />
      </button>
      {open && !disabled && coords && (
        <>
          <div className="rh-select-backdrop" onClick={() => setOpen(false)} />
          <div
            style={{ top: coords.top, left: coords.left, width: coords.width }}
            onWheel={(e) => e.stopPropagation()}
            className="rh-select-panel rh-animate-fade-in"
          >
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cx("rh-select-option", o.value === value && "rh-select-option-active")}
              >
                <span className="rh-select-option-label">{o.label}</span>
                {o.value === value && <Check size={14} className="rh-select-option-check" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
