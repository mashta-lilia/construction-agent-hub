import { Badge, type BadgeVariant } from "@/components/Badge/Badge";
import { useI18n } from "@/hooks/useI18n";

/**
 * Ported from REHUB WORK V8.html (~lines 1583-1587). `statusKey` is typed
 * as a plain `string` (not a project-specific union) so this component
 * has no dependency on `features/projects` types -- see the projects
 * feature's status keys for the actual domain values
 * (inProgress/onHold/planning/completed/audit).
 */
export interface StatusBadgeProps {
  statusKey: string;
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  inProgress: "blue",
  onHold: "amber",
  planning: "default",
  completed: "green",
  audit: "amber",
};

export function StatusBadge({ statusKey }: StatusBadgeProps) {
  const { t } = useI18n();
  const variant = STATUS_VARIANT[statusKey] ?? "default";
  return <Badge variant={variant}>{t(`status.${statusKey}`)}</Badge>;
}
