export type {
  ExtraSubstitutionSeed,
  InboxMessage,
  InboxSeedListMessage,
  InboxSeedMessage,
  NotificationIconName,
  NotificationItem,
  NotificationTone,
  ProjectInboxSeed,
} from "./types";

export {
  DEFAULT_INBOX_SEED,
  EMAIL,
  EMAIL_B,
  EMAIL_B2,
  EMAIL_C,
  NOTIFICATIONS_SEED,
  PROJECT_INBOX_SEEDS,
  makeInboxMessages,
} from "./constants/data";

/* Route-level pages (`pages/MailPage.tsx`, `pages/MailProjectPage.tsx`) and
 * `features/projects`' `ProjectDetail` need these components -- per
 * CLAUDE-WORKFLOW.md §2.1, other layers only import a feature through its
 * barrel, never its internal `components/...` path directly, so they're
 * re-exported here. */
export { InboxTab } from "./components/InboxTab/InboxTab";
export type { InboxTabProps } from "./components/InboxTab/InboxTab";
export { ProjectMailboxesOverview } from "./components/ProjectMailboxesOverview/ProjectMailboxesOverview";
export type {
  ProjectMailData,
  ProjectMailboxesOverviewProps,
} from "./components/ProjectMailboxesOverview/ProjectMailboxesOverview";
export { ProjectMailboxDetail } from "./components/ProjectMailboxDetail/ProjectMailboxDetail";
export type { ProjectMailboxDetailProps } from "./components/ProjectMailboxDetail/ProjectMailboxDetail";
export type { ManualRequestPayload } from "./components/ManualRequestModal/ManualRequestModal";
