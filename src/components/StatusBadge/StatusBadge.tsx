import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { ProjectStage, RiskLevel } from '@/types';

import './StatusBadge.css';

/** Bootstrap badge variants, keeping the prototype's colour mapping. */
const STAGE_VARIANT: Record<ProjectStage, string> = {
  planning: 'text-bg-secondary',
  inProgress: 'text-bg-primary',
  audit: 'text-bg-warning',
  onHold: 'text-bg-warning',
  completed: 'text-bg-success',
};

export function StatusBadge({ status }: { status: ProjectStage }) {
  const { t } = useTranslation();
  return (
    <span className={cn('badge rehub-badge', STAGE_VARIANT[status])}>{t(`status.${status}`)}</span>
  );
}

const RISK_VARIANT: Record<RiskLevel, string> = {
  green: 'text-bg-success',
  amber: 'text-bg-warning',
  red: 'text-bg-danger',
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const { t } = useTranslation();
  return <span className={cn('badge rehub-badge', RISK_VARIANT[risk])}>{t(`risk.${risk}`)}</span>;
}
