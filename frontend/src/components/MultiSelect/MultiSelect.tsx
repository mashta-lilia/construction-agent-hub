import { useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { usePopoverPosition } from "@/hooks/usePopoverPosition";
import { ChevronsUpDown, Check } from "@/components/Icon/icons";
import "./MultiSelect.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 373-408).
 */
export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  values,
  onChange,
  options,
  placeholder,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const coords = usePopoverPosition(open, btnRef);

  const toggleValue = (v: string) => {
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  };

  const labelText = values.length
    ? values.map((v) => options.find((o) => o.value === v)?.label ?? v).join(", ")
    : placeholder;

  return (
    <div className={cx("rh-multiselect", className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rh-multiselect-trigger"
      >
        <span
          className={cx("rh-multiselect-value", !values.length && "rh-multiselect-placeholder")}
        >
          {labelText}
        </span>
        <ChevronsUpDown size={14} className="rh-multiselect-chevron" />
      </button>
      {open && coords && (
        <>
          <div className="rh-multiselect-backdrop" onClick={() => setOpen(false)} />
          <div
            style={{ top: coords.top, left: coords.left, width: coords.width }}
            onWheel={(e) => e.stopPropagation()}
            className="rh-multiselect-panel rh-animate-fade-in"
          >
            {options.map((o) => {
              const checked = values.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggleValue(o.value)}
                  className={cx("rh-multiselect-option", checked && "rh-multiselect-option-active")}
                >
                  <span
                    className={cx(
                      "rh-multiselect-checkbox",
                      checked && "rh-multiselect-checkbox-checked",
                    )}
                  >
                    {checked && <Check size={10} className="rh-multiselect-checkbox-icon" />}
                  </span>
                  <span className="rh-multiselect-option-label">{o.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
