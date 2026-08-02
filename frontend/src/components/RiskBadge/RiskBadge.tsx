import { Badge, type BadgeVariant } from "@/components/Badge/Badge";
import { useI18n } from "@/hooks/useI18n";
import "./RiskBadge.css";

/**
 * Ported from REHUB WORK V8.html (~lines 1588-1593). `risk` is typed as a
 * plain `string` to avoid a dependency on `features/projects` types.
 */
export interface RiskBadgeProps {
  risk: string;
}

const RISK_VARIANT: Record<string, BadgeVariant> = {
  green: "green",
  amber: "amber",
  red: "red",
};

export function RiskBadge({ risk }: RiskBadgeProps) {
  const { t } = useI18n();
  const variant = RISK_VARIANT[risk] ?? "default";
  return (
    <Badge variant={variant}>
      <span className={`rh-risk-dot rh-risk-dot-${risk}`} /> {t(`risk.${risk}`)}
    </Badge>
  );
}
