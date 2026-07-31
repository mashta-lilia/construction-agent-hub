import {
  Activity,
  BarChart3,
  Briefcase,
  FileText,
  GitCommitHorizontal,
  Layers,
  Mail,
} from 'lucide-react';

import type { FolderDef, MailFolderDef, NavItem, Project, ProjectFilter, TabDef } from '@/types';

/** Sidebar tree. Icons come from lucide-react, replacing the inline SVGs. */
export const NAV_TREE: NavItem[] = [
  {
    labelKey: 'nav.projects',
    icon: Briefcase,
    expandable: true,
    defaultOpen: true,
    resetsFilter: true,
    children: [
      { labelKey: 'nav.activeSites', filter: 'active' },
      { labelKey: 'nav.onHold', filter: 'onHold' },
      { labelKey: 'nav.completed', filter: 'completed' },
    ],
  },
  { labelKey: 'nav.mail', icon: Mail, expandable: false, action: 'openMail' },
  { labelKey: 'nav.activityFeed', icon: Activity, expandable: false, action: 'openActivity' },
];

/** Maps a sidebar filter onto the project list. */
export function matchesNavFilter(project: Project, navFilter: ProjectFilter | null): boolean {
  if (!navFilter) return true;
  if (navFilter === 'active') {
    return (
      project.statusKey === 'inProgress' ||
      project.statusKey === 'planning' ||
      project.statusKey === 'audit'
    );
  }
  return project.statusKey === navFilter;
}

/** Tabs of the project card. */
export const TAB_DEFS: TabDef[] = [
  { key: 'documentation', labelKey: 'tab.documentation', icon: FileText },
  { key: 'reports', labelKey: 'tab.reports', icon: BarChart3 },
  { key: 'blueprints', labelKey: 'tab.blueprints', icon: Layers },
  { key: 'revisions', labelKey: 'tab.revisions', icon: GitCommitHorizontal },
  { key: 'audit', labelKey: 'tab.audit', icon: Activity },
  { key: 'inbox', labelKey: 'tab.inbox', icon: Mail },
];

/** Folders inside the Documentation tab. */
export const FOLDER_DEFS: FolderDef[] = [
  { key: 'permits', labelKey: 'folders.permits' },
  { key: 'finance', labelKey: 'folders.finance' },
  { key: 'blueprints', labelKey: 'folders.blueprints' },
  { key: 'other', labelKey: 'folders.other' },
];

export const MAIL_FOLDERS: MailFolderDef[] = [
  { key: 'inbox', labelKey: 'mail.folderInbox' },
  { key: 'sent', labelKey: 'mail.folderSent' },
  { key: 'spam', labelKey: 'mail.folderSpam' },
];
