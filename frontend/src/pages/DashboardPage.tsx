import { HardHat } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LocaleSwitcher } from '@/components/LocaleSwitcher/LocaleSwitcher';
import { RiskBadge, StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { useBilingual } from '@/hooks/useBilingual';
import { useSortableData } from '@/hooks/useSortableData';
import { formatBudget } from '@/lib/format';
import { PROJECTS } from '@/lib/mock-data';
import { matchesNavFilter } from '@/lib/navigation';
import { useUiStore } from '@/store/uiStore';
import type { Project, ProjectFilter } from '@/types';

/**
 * Route entry point. Composition only — no business logic of its own, which
 * moves into `features/projects` as the port continues. Today it doubles as the
 * foundation smoke test: dictionaries, bilingual data, sorting, theme and the
 * Zustand filter all have to work for this page to render correctly.
 */
const FILTERS: {
  value: ProjectFilter | null;
  labelKey: 'nav.projects' | 'nav.activeSites' | 'nav.onHold' | 'nav.completed';
}[] = [
  { value: null, labelKey: 'nav.projects' },
  { value: 'active', labelKey: 'nav.activeSites' },
  { value: 'onHold', labelKey: 'nav.onHold' },
  { value: 'completed', labelKey: 'nav.completed' },
];

export function DashboardPage() {
  const { t } = useTranslation();
  const L = useBilingual();
  const projectFilter = useUiStore((state) => state.projectFilter);
  const setProjectFilter = useUiStore((state) => state.setProjectFilter);

  const visible = PROJECTS.filter((project) => matchesNavFilter(project, projectFilter));
  const { sorted, sortKey, sortDir, requestSort } = useSortableData<Project, 'name' | 'budget'>(
    visible,
    'name',
    'asc',
  );

  const sortIndicator = (key: 'name' | 'budget') =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <main className="rehub-app container py-4">
      <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <span className="rehub-brand__mark d-inline-flex align-items-center justify-content-center rounded-3 text-bg-primary">
            <HardHat size={20} />
          </span>
          <div>
            <h1 className="h5 mb-0">REHUB</h1>
            <p className="text-body-secondary small mb-0">{t('brand.tagline')}</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <div className="btn-group btn-group-sm mb-3" role="group" aria-label={t('nav.projects')}>
        {FILTERS.map((filter) => (
          <button
            key={filter.labelKey}
            type="button"
            className={`btn btn-outline-primary${filter.value === projectFilter ? ' active' : ''}`}
            onClick={() => {
              setProjectFilter(filter.value);
            }}
          >
            {t(filter.labelKey)}
          </button>
        ))}
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-body-tertiary">
          <h2 className="h6 mb-0">{t('nav.projects')}</h2>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr className="text-body-secondary small text-uppercase">
                <th
                  scope="col"
                  className="rehub-sortable"
                  onClick={() => {
                    requestSort('name');
                  }}
                >
                  {t('col.name')}
                  {sortIndicator('name')}
                </th>
                <th scope="col">{t('col.status')}</th>
                <th scope="col">{t('risk.label')}</th>
                <th
                  scope="col"
                  className="rehub-sortable text-end"
                  onClick={() => {
                    requestSort('budget');
                  }}
                >
                  {t('col.budget')}
                  {sortIndicator('budget')}
                </th>
                <th scope="col">{t('card.deadline')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((project) => (
                <tr key={project.id}>
                  <td>
                    <div className="fw-medium">{L(project.name)}</div>
                    <div className="text-body-secondary small">{project.id}</div>
                  </td>
                  <td>
                    <StatusBadge status={project.statusKey} />
                  </td>
                  <td>
                    <RiskBadge risk={project.risk} />
                  </td>
                  <td className="text-end rehub-numeric">{formatBudget(project.budget, t)}</td>
                  <td className="text-body-secondary">{L(project.deadline)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-body-secondary small mt-3 mb-0">
        Foundation smoke test — replaced by features/projects as the port continues.
      </p>
    </main>
  );
}
