import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import './EmptyState.css';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rehub-empty-state text-center py-5 px-4">
      <span className="rehub-empty-state__icon d-inline-flex align-items-center justify-content-center rounded-circle mb-2">
        <Icon size={20} />
      </span>
      <p className="fw-medium mb-1">{title}</p>
      {description ? <p className="text-body-secondary small mb-0">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
