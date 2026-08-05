import type { ComponentType } from "react";
import { cx } from "@/lib/cx";
import { Card } from "@/components/Card/Card";
import type { IconProps } from "@/components/Icon/Icon";
import "./KpiCard.css";

/**
 * Ported from REHUB WORK V8.html (~lines 1933-1941).
 */
export type KpiTone = "blue" | "red" | "amber";

export interface KpiCardProps {
  icon: ComponentType<IconProps>;
  label: string;
  value: string | number;
  tone?: KpiTone;
}

export function KpiCard({ icon: IconCmp, label, value, tone = "blue" }: KpiCardProps) {
  return (
    <Card className="rh-kpi-card">
      <div className={cx("rh-kpi-icon", `rh-kpi-icon-${tone}`)}>
        <IconCmp size={20} />
      </div>
      <div className="rh-kpi-text">
        <div className="rh-kpi-label">{label}</div>
        <div className="rh-kpi-value">{value}</div>
      </div>
    </Card>
  );
}
