import { cx } from "@/lib/cx";
import { useI18n } from "@/hooks/useI18n";
import "./LangToggle.css";

/**
 * Ported from REHUB WORK V8.html (~lines 1596-1605).
 */
const LOCALES = ["en", "uk"] as const;

export function LangToggle() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="rh-lang-toggle">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={cx("rh-lang-toggle-btn", locale === l && "rh-lang-toggle-btn-active")}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
