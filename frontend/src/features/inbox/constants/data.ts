/**
 * Ported from REHUB WORK V8.html, script block 1, ~lines 996-1151, 1224-1240.
 *
 * All bilingual `B(en, uk)` literals have been replaced by i18n keys under the
 * `inbox.seed.*` namespace (`src/i18n/locales/{en,uk}/inbox.json`). This
 * module holds IDs, keys, structure and numbers only -- render with
 * `useI18n().t(key)`.
 */
import type {
  ExtraSubstitutionSeed,
  InboxMessage,
  InboxSeedMessage,
  NotificationItem,
  ProjectInboxSeed,
} from "@/features/inbox/types";

/** Scenario A supplier email -- Kyiv Bridge / facade insulation (item 12). */
export const EMAIL: InboxSeedMessage = {
  initials: "OM",
  fromKey: "inbox.seed.ukrbudpostach.from",
  companyKey: "inbox.seed.ukrbudpostach.company",
  email: "o.marchuk@ukrbudpostach.ua",
  subjectKey: "inbox.seed.ukrbudpostach.subject",
  previewKey: "inbox.seed.ukrbudpostach.preview",
  receivedKey: "inbox.seed.ukrbudpostach.received",
  bodyKey: "inbox.seed.ukrbudpostach.body",
};

/** Scenario B supplier email -- Lviv Water Treatment Facility / radiators (item 12). */
export const EMAIL_B: InboxSeedMessage = {
  initials: "IS",
  fromKey: "inbox.seed.teplosystem.from",
  companyKey: "inbox.seed.teplosystem.company",
  email: "i.savchuk@teplosystem.ua",
  subjectKey: "inbox.seed.teplosystem.subject",
  previewKey: "inbox.seed.teplosystem.preview",
  receivedKey: "inbox.seed.teplosystem.received",
  bodyKey: "inbox.seed.teplosystem.body",
};

/**
 * Compare-mode 2nd scenario email -- Lviv Water Treatment Facility / heating
 * pipe substitution, queued ALONGSIDE Scenario B's radiator request so the
 * project has 2 simultaneous pending substitution requests (used to
 * demonstrate the "Compare requests" feature).
 */
export const EMAIL_B2: InboxSeedMessage = {
  initials: "PD",
  fromKey: "inbox.seed.polimerbud.from",
  companyKey: "inbox.seed.polimerbud.company",
  email: "p.danylenko@polimerbud.ua",
  subjectKey: "inbox.seed.polimerbud.subject",
  previewKey: "inbox.seed.polimerbud.preview",
  receivedKey: "inbox.seed.polimerbud.received",
  bodyKey: "inbox.seed.polimerbud.body",
};

/** Scenario C supplier email -- Dnipro Industrial Park / domestic basalt insulation (item 12). */
export const EMAIL_C: InboxSeedMessage = {
  initials: "NP",
  fromKey: "inbox.seed.ukrtermizol.from",
  companyKey: "inbox.seed.ukrtermizol.company",
  email: "n.poliakova@ukrtermizol.ua",
  subjectKey: "inbox.seed.ukrtermizol.subject",
  previewKey: "inbox.seed.ukrtermizol.preview",
  receivedKey: "inbox.seed.ukrtermizol.received",
  bodyKey: "inbox.seed.ukrtermizol.body",
};

/**
 * `PROJECT_INBOX_SEEDS` maps a project id to { substitution, messages }:
 *   - `messages`: fixed list of ordinary correspondence for that project
 *     (contractors/suppliers/authorities relevant to it) -- always shown.
 *   - `substitution`: an optional supplier email proposing a material
 *     substitution. It is only surfaced by makeInboxMessages() when the
 *     project is flagged `hasDemo` -- mirroring the exact pattern already
 *     used by makeRevisions() (features/norms) for its pending-substitution
 *     entry.
 * Projects without an entry here fall back to DEFAULT_INBOX_SEED so every
 * project's inbox always has some realistic content.
 */
export const PROJECT_INBOX_SEEDS: Readonly<Record<string, ProjectInboxSeed>> = {
  "PRJ-1042": {
    substitution: EMAIL, // Kyiv Bridge / Ukrbudpostach substitution scenario -- kept intact
    messages: [
      {
        id: "m2",
        initials: "КО",
        fromKey: "inbox.seed.byProject.prj1042.messages.m2.from",
        companyKey: "inbox.seed.byProject.prj1042.messages.m2.company",
        email: "office@kmda.gov.ua",
        subjectKey: "inbox.seed.byProject.prj1042.messages.m2.subject",
        previewKey: "inbox.seed.byProject.prj1042.messages.m2.preview",
        receivedKey: "inbox.seed.byProject.prj1042.messages.m2.received",
        bodyKey: "inbox.seed.byProject.prj1042.messages.m2.body",
      },
      {
        id: "m3",
        initials: "ДІ",
        fromKey: "inbox.seed.byProject.prj1042.messages.m3.from",
        companyKey: "inbox.seed.byProject.prj1042.messages.m3.company",
        email: "inspection@dabi.gov.ua",
        subjectKey: "inbox.seed.byProject.prj1042.messages.m3.subject",
        previewKey: "inbox.seed.byProject.prj1042.messages.m3.preview",
        receivedKey: "inbox.seed.byProject.prj1042.messages.m3.received",
        bodyKey: "inbox.seed.byProject.prj1042.messages.m3.body",
      },
    ],
  },
  "PRJ-1038": {
    substitution: EMAIL_B, // Lviv Water Treatment Facility / TeploSystem Ukraine radiator substitution (Scenario B)
    extraSubstitutions: [
      { email: EMAIL_B2, scenarioKey: "lviv-pipes-ppr" }, // Compare-mode: 2nd simultaneous pending substitution
    ],
    messages: [
      {
        id: "m2",
        initials: "ЛМ",
        fromKey: "inbox.seed.byProject.prj1038.messages.m2.from",
        companyKey: "inbox.seed.byProject.prj1038.messages.m2.company",
        email: "office@lviv.gov.ua",
        subjectKey: "inbox.seed.byProject.prj1038.messages.m2.subject",
        previewKey: "inbox.seed.byProject.prj1038.messages.m2.preview",
        receivedKey: "inbox.seed.byProject.prj1038.messages.m2.received",
        bodyKey: "inbox.seed.byProject.prj1038.messages.m2.body",
      },
      {
        id: "m3",
        initials: "ЕІ",
        fromKey: "inbox.seed.byProject.prj1038.messages.m3.from",
        companyKey: "inbox.seed.byProject.prj1038.messages.m3.company",
        email: "inspection@eco.gov.ua",
        subjectKey: "inbox.seed.byProject.prj1038.messages.m3.subject",
        previewKey: "inbox.seed.byProject.prj1038.messages.m3.preview",
        receivedKey: "inbox.seed.byProject.prj1038.messages.m3.received",
        bodyKey: "inbox.seed.byProject.prj1038.messages.m3.body",
      },
    ],
  },
  "PRJ-1019": {
    substitution: EMAIL_C, // Dnipro Industrial Park / Ukrterm Izolyatsiya domestic basalt insulation (Scenario C)
    messages: [
      {
        id: "m2",
        initials: "ДОДА",
        fromKey: "inbox.seed.byProject.prj1019.messages.m2.from",
        companyKey: "inbox.seed.byProject.prj1019.messages.m2.company",
        email: "office@dnipro-oda.gov.ua",
        subjectKey: "inbox.seed.byProject.prj1019.messages.m2.subject",
        previewKey: "inbox.seed.byProject.prj1019.messages.m2.preview",
        receivedKey: "inbox.seed.byProject.prj1019.messages.m2.received",
        bodyKey: "inbox.seed.byProject.prj1019.messages.m2.body",
      },
      {
        id: "m3",
        initials: "БІ",
        fromKey: "inbox.seed.byProject.prj1019.messages.m3.from",
        companyKey: "inbox.seed.byProject.prj1019.messages.m3.company",
        email: "inspection@dnipro-build.gov.ua",
        subjectKey: "inbox.seed.byProject.prj1019.messages.m3.subject",
        previewKey: "inbox.seed.byProject.prj1019.messages.m3.preview",
        receivedKey: "inbox.seed.byProject.prj1019.messages.m3.received",
        bodyKey: "inbox.seed.byProject.prj1019.messages.m3.body",
      },
    ],
  },
};

export const DEFAULT_INBOX_SEED: ProjectInboxSeed = {
  messages: [
    {
      id: "gen1",
      initials: "ЛГ",
      fromKey: "inbox.seed.default.messages.gen1.from",
      companyKey: "inbox.seed.default.messages.gen1.company",
      email: "office@sitecontractor.ua",
      subjectKey: "inbox.seed.default.messages.gen1.subject",
      previewKey: "inbox.seed.default.messages.gen1.preview",
      receivedKey: "inbox.seed.default.messages.gen1.received",
      bodyKey: "inbox.seed.default.messages.gen1.body",
    },
    {
      id: "gen2",
      initials: "ПС",
      fromKey: "inbox.seed.default.messages.gen2.from",
      companyKey: "inbox.seed.default.messages.gen2.company",
      email: "permits@localgov.ua",
      subjectKey: "inbox.seed.default.messages.gen2.subject",
      previewKey: "inbox.seed.default.messages.gen2.preview",
      receivedKey: "inbox.seed.default.messages.gen2.received",
      bodyKey: "inbox.seed.default.messages.gen2.body",
    },
  ],
};

function extraSubstitutionMessage(es: ExtraSubstitutionSeed, index: number): InboxMessage {
  return {
    ...es.email,
    id: `sub-extra-${index}`,
    hasSubstitution: true,
    unread: true,
    scenarioKey: es.scenarioKey,
  };
}

export function makeInboxMessages(project: { id: string; hasDemo: boolean }): InboxMessage[] {
  const seed = PROJECT_INBOX_SEEDS[project.id] ?? DEFAULT_INBOX_SEED;
  const messages: InboxMessage[] = seed.messages.map((m) => ({ ...m }));
  if (project.hasDemo && seed.substitution) {
    messages.unshift({ ...seed.substitution, id: "sub", hasSubstitution: true, unread: true });
  }
  /* Compare-mode: any additional simultaneous pending substitution requests for this
     project get their own message, tagged with the scenarioKey that resolves their
     distinct SUBSTITUTION_SCENARIOS_EXTRA entry (features/norms). */
  if (project.hasDemo && seed.extraSubstitutions) {
    seed.extraSubstitutions.forEach((es, i) => messages.unshift(extraSubstitutionMessage(es, i)));
  }
  return messages;
}

/** Mock cross-project notification feed (bell dropdown). `textKey`/`timeKey` reference
 * i18n keys already ported in Part A (`common.json`, `notif.*`). */
export const NOTIFICATIONS_SEED: readonly NotificationItem[] = [
  { id: 1, textKey: "notif.item1", timeKey: "notif.time1", icon: "Sparkles", tone: "blue" },
  { id: 2, textKey: "notif.item2", timeKey: "notif.time2", icon: "CheckCircle2", tone: "green" },
  { id: 3, textKey: "notif.item3", timeKey: "notif.time3", icon: "Mail", tone: "blue" },
  { id: 4, textKey: "notif.item4", timeKey: "notif.time4", icon: "AlertTriangle", tone: "red" },
  { id: 5, textKey: "notif.item5", timeKey: "notif.time5", icon: "BarChart3", tone: "amber" },
  { id: 6, textKey: "notif.item6", timeKey: "notif.time6", icon: "FileText", tone: "slate" },
];
