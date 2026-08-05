import type { ComponentType, ReactNode } from "react";
import { Card } from "@/components/Card/Card";
import type { IconProps } from "@/components/Icon/Icon";
import "./InfoCard.css";

/**
 * Ported from REHUB WORK V8.html script block 1 (~lines 3877-3885).
 *
 * Shared (not feature-owned) because two independent consumers need it:
 * this layout-port task (unused directly here, but required by sibling
 * consumers) and `features/projects`'s `ProjectDetail` -- hence
 * `src/components/InfoCard/` rather than living inside a feature.
 */
export interface InfoCardProps {
  icon?: ComponentType<IconProps>;
  label: ReactNode;
  value: string;
  sub?: ReactNode;
}

export function InfoCard({ icon: IconCmp, label, value, sub }: InfoCardProps) {
  return (
    <Card className="rh-info-card">
      <div className="rh-info-card-label-row">
        {IconCmp && <IconCmp size={14} className="rh-info-card-label-icon" />}
        <span className="rh-info-card-label">{label}</span>
      </div>
      <div className="rh-info-card-value" title={value}>
        {value}
      </div>
      {sub}
    </Card>
  );
}
