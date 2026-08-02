/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 996-1151, 1224-1240.
 *
 * Every bilingual `B(en, uk)` literal (from/company/subject/preview/received/body)
 * has been replaced by an i18n key resolved via `useI18n().t(key)` -- see
 * `src/i18n/locales/{en,uk}/inbox.json` under the `inbox.seed.*` namespace.
 */

/**
 * Base shape shared by every supplier/correspondence email in the source
 * prototype. No `id` field -- matches EMAIL/EMAIL_B/EMAIL_B2/EMAIL_C exactly,
 * which never carried one (an id was only synthesized once a message was
 * placed into a project's message list). Kept id-less at the type level
 * (rather than `id?: string` on a single shared type) so that every place
 * that DOES require an id -- {@link InboxSeedListMessage}, {@link InboxMessage}
 * -- gets a real compile-time guarantee instead of an unchecked optional.
 */
export interface InboxSeedMessage {
  initials: string;
  fromKey: string;
  companyKey: string;
  /** Plain, locale-independent email address (not translated). */
  email: string;
  subjectKey: string;
  previewKey: string;
  receivedKey: string;
  bodyKey: string;
}

/** A message inside a project's fixed `messages` list -- always has an id
 * (used as the React key / read receipt target), unlike the standalone
 * supplier-email constants. */
export interface InboxSeedListMessage extends InboxSeedMessage {
  id: string;
}

/**
 * Compare-mode (item 12): an additional SIMULTANEOUS pending substitution
 * request beyond a project's primary `substitution`. `scenarioKey` looks up
 * `SUBSTITUTION_SCENARIOS_EXTRA` (features/norms) -- keyed by this arbitrary
 * string, NOT by project id, since a project can have more than one active
 * scenario at once.
 */
export interface ExtraSubstitutionSeed {
  email: InboxSeedMessage;
  scenarioKey: string;
}

export interface ProjectInboxSeed {
  /** Present only for projects with a demo substitution scenario wired up. */
  substitution?: InboxSeedMessage;
  extraSubstitutions?: ExtraSubstitutionSeed[];
  messages: InboxSeedListMessage[];
}

/** The shape `makeInboxMessages()` actually renders in the Inbox tab -- a seed
 * message plus the flags that mark it as a live substitution request. `id` is
 * always present here (assigned to every message by `makeInboxMessages`,
 * including ones derived from the id-less `substitution`/`extraSubstitutions`
 * supplier emails). */
export interface InboxMessage extends InboxSeedMessage {
  id: string;
  hasSubstitution?: boolean;
  unread?: boolean;
  /** Only set on Compare-mode "extra" substitution messages -- see
   * {@link ExtraSubstitutionSeed}. */
  scenarioKey?: string;
}

/**
 * Icon name for the notification/activity feed -- a plain string identifier
 * rather than a Lucide-style component reference, so this data-only module
 * never imports from `components/`. Consuming UI maps this to an actual icon
 * component (see `components/Icon/icons.tsx`, which exports components of
 * these exact names).
 */
export type NotificationIconName =
  "Sparkles" | "CheckCircle2" | "Mail" | "AlertTriangle" | "BarChart3" | "FileText";

export type NotificationTone = "blue" | "green" | "red" | "amber" | "slate";

/** Mock cross-project notification feed item (bell dropdown) / activity feed item. */
export interface NotificationItem {
  id: number;
  /** i18n key, already ported in Part A (`common.json`, `notif.item*`). */
  textKey: string;
  /** i18n key, already ported in Part A (`common.json`, `notif.time*`). */
  timeKey: string;
  icon: NotificationIconName;
  tone: NotificationTone;
}
