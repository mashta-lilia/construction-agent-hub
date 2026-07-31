/* =============================================================================
 * Mock data — ported verbatim from the REHUB_WORK_V6 prototype.
 * ---------------------------------------------------------------------------
 * Replace this module with real API calls; the exported shapes are the
 * contract every feature component is written against.
 * Icon references come from lucide-react (no hand-rolled SVG components).
 * ========================================================================== */

import { AlertTriangle, BarChart3, CheckCircle2, FileText, Mail, Sparkles } from 'lucide-react';

import { B } from '@/lib/bilingual';
import type {
  AuditEntry,
  BilingualOption,
  BilingualString,
  Blueprint,
  BudgetMaterialRow,
  DocSentence,
  DocumentCategory,
  FeedItem,
  Funnel,
  InboxMessage,
  InboxSeed,
  Project,
  ProjectData,
  ProjectDocument,
  ProjectStage,
  Report,
  ReportTemplate,
  Revision,
  SubstitutionScenario,
  SupplierEmail,
} from '@/types';

/* ===== Engineer directory =================================================
   Named constants instead of the prototype's `PROJECTS[n].team = [ENGINEERS[i]]`
   post-assignment: no module-level mutation, and no possibly-undefined index
   access under `noUncheckedIndexedAccess`. */
const IVAN_FRANKO = B('Ivan Franko', 'Іван Франко');
const TARAS_SHEVCHENKO = B('Taras Shevchenko', 'Тарас Шевченко');
const LESYA_UKRAINKA = B('Lesya Ukrainka', 'Леся Українка');
const VOLODYMYR_KUZMENKO = B('Volodymyr Kuzmenko', 'Володимир Кузьменко');
const OKSANA_ZABUZHKO = B('Oksana Zabuzhko', 'Оксана Забужко');

/** Dummy engineer directory backing the New / Edit Project pickers. */
export const ENGINEERS: BilingualString[] = [
  IVAN_FRANKO,
  TARAS_SHEVCHENKO,
  LESYA_UKRAINKA,
  VOLODYMYR_KUZMENKO,
  OKSANA_ZABUZHKO,
];

/** The logged-in user — matched against `leadEngineer` / `team` to derive
 * the "My Profile" assigned-projects list. */
export const CURRENT_USER: BilingualString = B('Volodymyr Kuzemko', 'Володимир Куземко');

export const PROJECTS: Project[] = [
  {
    id: 'PRJ-1042',
    name: B('Kyiv Bridge Reconstruction', 'Реконструкція Київського мосту'),
    statusKey: 'inProgress',
    budget: 4820000,
    updated: B('2 hours ago', '2 години тому'),
    hasAlert: true,
    client: B('Ministry of Infrastructure', 'Міністерство інфраструктури'),
    leadEngineer: B('Volodymyr Kuzemko', 'Володимир Куземко'),
    location: B('Kyiv, Ukraine', 'Київ, Україна'),
    deadline: B('Nov 2026', 'Листопад 2026'),
    risk: 'amber',
    phase: B('Facade Insulation', 'Утеплення фасаду'),
    hasDemo: true,
    team: [IVAN_FRANKO, LESYA_UKRAINKA],
  },
  {
    id: 'PRJ-1038',
    name: B('Lviv Water Treatment Facility', 'Львівська водоочисна станція'),
    statusKey: 'inProgress',
    budget: 2150000,
    updated: B('1 day ago', '1 день тому'),
    hasAlert: true,
    client: B('Lviv City Council', 'Львівська міськрада'),
    leadEngineer: B('Iryna Kovalenko', 'Ірина Коваленко'),
    location: B('Lviv, Ukraine', 'Львів, Україна'),
    deadline: B('Mar 2027', 'Березень 2027'),
    risk: 'green',
    phase: B('Filtration Install', 'Монтаж фільтрації'),
    hasDemo: true,
    team: [TARAS_SHEVCHENKO, OKSANA_ZABUZHKO],
  },
  {
    id: 'PRJ-1031',
    name: B('Odesa Port Terminal Expansion', 'Розширення терміналу порту Одеси'),
    statusKey: 'onHold',
    budget: 9100000,
    updated: B('3 days ago', '3 дні тому'),
    hasAlert: false,
    client: B('Odesa Port Authority', 'Адміністрація порту Одеси'),
    leadEngineer: B('Mykola Semenko', 'Микола Семенко'),
    location: B('Odesa, Ukraine', 'Одеса, Україна'),
    deadline: B('Jul 2027', 'Липень 2027'),
    risk: 'red',
    phase: B('Site Clearance', 'Розчищення ділянки'),
    hasDemo: false,
    team: [VOLODYMYR_KUZMENKO],
  },
  {
    id: 'PRJ-1027',
    name: B('Kharkiv Metro Line 3 Extension', 'Продовження 3-ї лінії метро Харкова'),
    statusKey: 'inProgress',
    budget: 15400000,
    updated: B('5 days ago', '5 днів тому'),
    hasAlert: false,
    client: B('Kharkiv Metro Authority', 'Управління метро Харкова'),
    leadEngineer: B('Andriy Boyko', 'Андрій Бойко'),
    location: B('Kharkiv, Ukraine', 'Харків, Україна'),
    deadline: B('Jan 2028', 'Січень 2028'),
    risk: 'green',
    phase: B('Tunnel Boring', 'Прохідка тунелю'),
    hasDemo: false,
    team: [IVAN_FRANKO, OKSANA_ZABUZHKO],
  },
  {
    id: 'PRJ-1019',
    name: B('Dnipro Industrial Park — Phase 2', 'Дніпровський індустріальний парк — Фаза 2'),
    statusKey: 'planning',
    budget: 3300000,
    updated: B('1 week ago', '1 тиждень тому'),
    hasAlert: true,
    client: B('Dnipro Regional Admin', 'Дніпровська ОДА'),
    leadEngineer: B('Kateryna Moroz', 'Катерина Мороз'),
    location: B('Dnipro, Ukraine', 'Дніпро, Україна'),
    deadline: B('May 2027', 'Травень 2027'),
    risk: 'green',
    phase: B('Design Review', 'Перегляд проєкту'),
    hasDemo: true,
    team: [LESYA_UKRAINKA],
  },
  {
    id: 'PRJ-1004',
    name: B('Vinnytsia District Heating Upgrade', 'Модернізація теплопостачання Вінниці'),
    statusKey: 'completed',
    budget: 1780000,
    updated: B('2 weeks ago', '2 тижні тому'),
    hasAlert: false,
    client: B('Vinnytsia City Council', 'Вінницька міськрада'),
    leadEngineer: B('Pavlo Tkachenko', 'Павло Ткаченко'),
    location: B('Vinnytsia, Ukraine', 'Вінниця, Україна'),
    deadline: B('Completed', 'Завершено'),
    risk: 'green',
    phase: B('Handover', 'Передача'),
    hasDemo: false,
    team: [TARAS_SHEVCHENKO, VOLODYMYR_KUZMENKO],
  },
  {
    id: 'PRJ-1061',
    name: B('Depot Reconstruction', 'Реконструкція депо'),
    statusKey: 'planning',
    budget: null,
    updated: B('4 hours ago', '4 години тому'),
    hasAlert: false,
    client: B('Ukrzaliznytsia', 'Укрзалізниця'),
    leadEngineer: B('Andriy Boyko', 'Андрій Бойко'),
    location: B('Fastiv, Ukraine', 'Фастів, Україна'),
    deadline: B('TBD', 'Визначається'),
    risk: 'green',
    phase: B('Cost Estimation', 'Кошторисні розрахунки'),
    hasDemo: false,
    team: [OKSANA_ZABUZHKO],
  },
];

/* Fixed "Stage of Work" options — these values ARE the project's statusKey, so picking a
   stage in Edit Project drives the exact same field that the ProjectsTable's Stage column
   and StatusBadge already read from. Labels are sourced from the existing status.* I18N
   keys (single source of truth) rather than duplicated bilingual strings. */
export const STAGE_KEYS: ProjectStage[] = [
  'planning',
  'inProgress',
  'audit',
  'onHold',
  'completed',
];

/* ===== Supplier emails (one per substitution scenario) ================== */
export const EMAIL: SupplierEmail = {
  from: B('Oleh Marchuk', 'Олег Марчук'),
  company: B('Ukrbudpostach Supply Co.', 'Укрбудпостач'),
  email: 'o.marchuk@ukrbudpostach.ua',
  initials: 'OM',
  subject: B(
    'Substitution proposal: Mineral wool → Polystyrene EPS',
    'Пропозиція заміни: Мінеральна вата → Пінополістирол',
  ),
  preview: B(
    'We propose substituting the facade insulation to reduce costs...',
    'Пропонуємо розглянути заміну утеплювача фасаду для здешевлення...',
  ),
  received: B('Today, 09:14', 'Сьогодні, 09:14'),
  body: B(
    `Good morning,\n\nDue to cost optimization on the facade works of the Kyiv Bridge Reconstruction project, we propose substituting the specified mineral wool insulation with polystyrene EPS.\n\nEPS is cheaper and available immediately from our Dnipro warehouse. Please review the attached spec sheet and confirm.\n\nBest regards,\nOleh Marchuk`,
    `Доброго ранку,\n\nЗ метою оптимізації витрат на фасадних роботах проєкту «Реконструкція Київського мосту» пропонуємо замінити передбачену проєктом мінеральну вату на пінополістирол ЕПС.\n\nЕПС дешевший та доступний одразу зі складу в Дніпрі. Просимо переглянути специфікацію у вкладенні та підтвердити.\n\nЗ повагою,\nОлег Марчук`,
  ),
};

/* Scenario B supplier email — Lviv Water Treatment Facility / radiators (item 12) */
export const EMAIL_B: SupplierEmail = {
  from: B('Ihor Savchuk', 'Ігор Савчук'),
  company: B('TeploSystem Ukraine LLC', 'ТОВ «ТеплоСистема Україна»'),
  email: 'i.savchuk@teplosystem.ua',
  initials: 'IS',
  subject: B(
    'Substitution proposal: Bimetallic radiators → Steel panel radiators',
    'Пропозиція заміни: Біметалеві радіатори → Стальні панельні радіатори',
  ),
  preview: B(
    'We propose substituting the specified heating radiators to reduce costs...',
    'Пропонуємо розглянути заміну передбачених радіаторів опалення для здешевлення...',
  ),
  received: B('Today, 08:52', 'Сьогодні, 08:52'),
  body: B(
    `Good morning,\n\nDue to cost optimization on the heating system works of the Lviv Water Treatment Facility project, we propose substituting the specified bimetallic radiators with steel panel radiators.\n\nSteel panel units are available immediately and reduce unit cost significantly. Please review the attached technical sheet and confirm.\n\nBest regards,\nIhor Savchuk`,
    `Доброго ранку,\n\nЗ метою оптимізації витрат на роботах із опалення проєкту «Львівська водоочисна станція» пропонуємо замінити передбачені біметалеві радіатори на стальні панельні.\n\nПанельні радіатори доступні одразу та суттєво знижують вартість одиниці. Просимо переглянути технічний лист у вкладенні та підтвердити.\n\nЗ повагою,\nІгор Савчук`,
  ),
};

/* Scenario C supplier email — Dnipro Industrial Park / domestic basalt insulation (item 12) */
export const EMAIL_C: SupplierEmail = {
  from: B('Nadiya Poliakova', 'Надія Полякова'),
  company: B('Ukrterm Izolyatsiya PJSC', 'ПрАТ «Укртермоізоляція»'),
  email: 'n.poliakova@ukrtermizol.ua',
  initials: 'NP',
  subject: B(
    'Substitution proposal: Imported mineral wool → Domestic basalt insulation',
    'Пропозиція заміни: Імпортна мінеральна вата → Вітчизняний базальтовий утеплювач',
  ),
  preview: B(
    'We propose an equivalent certified domestic insulation to reduce costs...',
    'Пропонуємо еквівалентний сертифікований вітчизняний утеплювач для здешевлення...',
  ),
  received: B('Today, 10:03', 'Сьогодні, 10:03'),
  body: B(
    `Good morning,\n\nFor the facade insulation package of the Dnipro Industrial Park — Phase 2 project, we propose substituting the specified imported mineral wool with our certified domestic basalt insulation board (Termobazalt-M).\n\nThe product is fully certified per DSTU and matches all thermal and fire-safety parameters at a lower price. Please review the attached certificate and specification.\n\nBest regards,\nNadiya Poliakova`,
    `Доброго ранку,\n\nДля пакету фасадного утеплення проєкту «Дніпровський індустріальний парк — Фаза 2» пропонуємо замінити передбачену імпортну мінеральну вату на наш сертифікований вітчизняний базальтовий утеплювач «Термобазальт-M».\n\nПродукція повністю сертифікована згідно з ДСТУ та відповідає усім теплотехнічним і протипожежним параметрам за нижчою ціною. Просимо переглянути сертифікат та специфікацію у вкладенні.\n\nЗ повагою,\nНадія Полякова`,
  ),
};

/* ===== Per-project inbox architecture =====================================
   `PROJECT_INBOX_SEEDS` maps a project id to { substitution, messages }:
     - `messages`: fixed list of ordinary correspondence for that project
       (contractors/suppliers/authorities relevant to it) — always shown.
     - `substitution`: an optional supplier email proposing a material
       substitution. It is only surfaced by makeInboxMessages() when the
       project is flagged `hasDemo` — mirroring the exact pattern already
       used by makeRevisions() for its pending-substitution entry. To seed
       another project with its own substitution scenario: add a
       `substitution` entry here (same shape as EMAIL above) and set
       `hasDemo: true` on that project in PROJECTS.
   Projects without an entry here fall back to DEFAULT_INBOX_SEED so every
   project's inbox always has some realistic content. */
export const PROJECT_INBOX_SEEDS: Record<string, InboxSeed> = {
  'PRJ-1042': {
    substitution: EMAIL, // Kyiv Bridge / Ukrbudpostach substitution scenario — kept intact
    messages: [
      {
        id: 'm2',
        initials: 'КО',
        from: B('Kyiv City Design Office', 'Проєктний офіс КМДА'),
        company: B('Kyiv City State Administration', 'КМДА'),
        email: 'office@kmda.gov.ua',
        subject: B('Q3 work schedule approval', 'Погодження графіка робіт на III квартал'),
        preview: B(
          'We are sending the updated schedule of works for approval...',
          'Надсилаємо оновлений графік виконання робіт на погодження...',
        ),
        received: B('Yesterday', 'Вчора'),
        body: B(
          `Dear Volodymyr,\n\nPlease find attached the updated Q3 work schedule for the Kyiv Bridge Reconstruction project. Kindly review and confirm your approval by the end of the week.\n\nBest regards,\nKyiv City Design Office`,
          `Шановний Володимире,\n\nНадсилаємо оновлений графік робіт на III квартал по проєкту «Реконструкція Київського мосту». Просимо розглянути та підтвердити погодження до кінця тижня.\n\nЗ повагою,\nПроєктний офіс КМДА`,
        ),
      },
      {
        id: 'm3',
        initials: 'ДІ',
        from: B('State Architectural & Construction Inspection', 'Держархбудінспекція'),
        company: B('State Inspection Authority', 'Держархбудінспекція'),
        email: 'inspection@dabi.gov.ua',
        subject: B('Scheduled site inspection', "Планова перевірка об'єкта"),
        preview: B(
          'We hereby notify you of a scheduled inspection...',
          'Повідомляємо про проведення планової перевірки...',
        ),
        received: B('22 Jul', '22.07'),
        body: B(
          `Dear Sir/Madam,\n\nWe hereby notify you that a scheduled inspection of the construction site will take place on August 3, 2026. Please ensure all safety documentation is available on site.\n\nRegards,\nState Architectural and Construction Inspection`,
          `Шановні,\n\nПовідомляємо, що 3 серпня 2026 року відбудеться планова перевірка будівельного майданчика. Просимо забезпечити наявність усієї документації з техніки безпеки на об'єкті.\n\nЗ повагою,\nДержархбудінспекція`,
        ),
      },
    ],
  },
  'PRJ-1038': {
    substitution: EMAIL_B, // Lviv Water Treatment Facility / TeploSystem Ukraine radiator substitution scenario (item 12, Scenario B)
    messages: [
      {
        id: 'm2',
        initials: 'ЛМ',
        from: B('Lviv City Council', 'Львівська міськрада'),
        company: B('Lviv City State Administration', 'Львівська міськрада'),
        email: 'office@lviv.gov.ua',
        subject: B(
          'Filtration equipment delivery confirmation',
          'Підтвердження постачання фільтраційного обладнання',
        ),
        preview: B(
          'This confirms the delivery date for the filtration modules...',
          'Підтверджуємо дату постачання фільтраційних модулів...',
        ),
        received: B('2 days ago', '2 дні тому'),
        body: B(
          `Dear Iryna,\n\nThis is to confirm that the filtration modules for the Lviv Water Treatment Facility will be delivered on schedule next week.\n\nBest regards,\nLviv City Council`,
          `Шановна Ірино,\n\nПідтверджуємо, що фільтраційні модулі для Львівської водоочисної станції буде доставлено згідно з графіком наступного тижня.\n\nЗ повагою,\nЛьвівська міськрада`,
        ),
      },
      {
        id: 'm3',
        initials: 'ЕІ',
        from: B('State Ecological Inspectorate', 'Державна екологічна інспекція'),
        company: B('Ecological Inspectorate', 'Держекоінспекція'),
        email: 'inspection@eco.gov.ua',
        subject: B('Water discharge compliance check', 'Перевірка відповідності скидів води'),
        preview: B(
          'We are scheduling a routine compliance check of discharge parameters...',
          'Плануємо планову перевірку показників скидів...',
        ),
        received: B('19 Jul', '19.07'),
        body: B(
          `Dear team,\n\nA routine compliance check of water discharge parameters is scheduled for early August. Please have the latest lab reports ready.\n\nRegards,\nState Ecological Inspectorate`,
          `Шановна команда,\n\nНа початок серпня заплановано планову перевірку показників скидів води. Просимо підготувати останні лабораторні звіти.\n\nЗ повагою,\nДержавна екологічна інспекція`,
        ),
      },
    ],
  },
  'PRJ-1019': {
    substitution: EMAIL_C, // Dnipro Industrial Park / Ukrterm Izolyatsiya domestic basalt insulation scenario (item 12, Scenario C)
    messages: [
      {
        id: 'm2',
        initials: 'ДОДА',
        from: B('Dnipro Regional Admin', 'Дніпровська ОДА'),
        company: B('Dnipro Regional State Administration', 'Дніпровська ОДА'),
        email: 'office@dnipro-oda.gov.ua',
        subject: B('Phase 2 design review comments', 'Зауваження до перегляду проєкту Фази 2'),
        preview: B(
          'Attached are the design review comments for Phase 2...',
          'У вкладенні зауваження до перегляду проєкту Фази 2...',
        ),
        received: B('3 days ago', '3 дні тому'),
        body: B(
          `Dear Kateryna,\n\nPlease find attached our design review comments for Phase 2 of the Dnipro Industrial Park project. Kindly address them before the next milestone.\n\nBest regards,\nDnipro Regional Admin`,
          `Шановна Катерино,\n\nНадсилаємо зауваження до перегляду проєкту Фази 2 Дніпровського індустріального парку. Просимо врахувати їх до наступного етапу.\n\nЗ повагою,\nДніпровська ОДА`,
        ),
      },
      {
        id: 'm3',
        initials: 'БІ',
        from: B('Local Building Inspectorate', 'Місцева будівельна інспекція'),
        company: B('Building Inspectorate', 'Будівельна інспекція'),
        email: 'inspection@dnipro-build.gov.ua',
        subject: B('Site access permit renewal', 'Продовження дозволу на доступ до майданчика'),
        preview: B(
          'Your site access permit requires renewal ahead of Phase 2 works...',
          'Дозвіл на доступ до майданчика потребує продовження перед роботами Фази 2...',
        ),
        received: B('6 days ago', '6 днів тому'),
        body: B(
          `Dear team,\n\nYour site access permit requires renewal before Phase 2 works commence. Please submit the renewal form at your earliest convenience.\n\nRegards,\nLocal Building Inspectorate`,
          `Шановна команда,\n\nДозвіл на доступ до майданчика потребує продовження перед початком робіт Фази 2. Просимо якнайшвидше подати заяву на продовження.\n\nЗ повагою,\nМісцева будівельна інспекція`,
        ),
      },
    ],
  },
};

export const DEFAULT_INBOX_SEED: InboxSeed = {
  messages: [
    {
      id: 'gen1',
      initials: 'ЛГ',
      from: B('Local General Contractor', 'Місцевий генпідрядник'),
      company: B('Site Works LLC', 'ТОВ «Будмайданчик»'),
      email: 'office@sitecontractor.ua',
      subject: B('Weekly progress update', 'Тижневий звіт про хід робіт'),
      preview: B(
        "Attached is this week's progress summary and photos...",
        'У вкладенні тижневий звіт про прогрес та фото...',
      ),
      received: B('2 days ago', '2 дні тому'),
      body: B(
        "Good day,\n\nPlease find this week's progress summary attached, along with site photos. No blocking issues to report.\n\nBest regards,\nSite Works LLC",
        "Доброго дня,\n\nНадсилаємо тижневий звіт про хід робіт та фото з об'єкта. Блокуючих питань немає.\n\nЗ повагою,\nТОВ «Будмайданчик»",
      ),
    },
    {
      id: 'gen2',
      initials: 'ПС',
      from: B('Regional Permits Office', 'Регіональний дозвільний офіс'),
      company: B('Local Administration', 'Місцева адміністрація'),
      email: 'permits@localgov.ua',
      subject: B('Permit renewal reminder', 'Нагадування про продовження дозволу'),
      preview: B(
        'Your construction permit is due for renewal next month...',
        'Термін дії вашого дозволу на будівництво спливає наступного місяця...',
      ),
      received: B('5 days ago', '5 днів тому'),
      body: B(
        'Dear project team,\n\nThis is a reminder that your construction permit for this site requires renewal next month. Please submit updated documentation in advance.\n\nRegards,\nRegional Permits Office',
        "Шановна команда проєкту,\n\nНагадуємо, що дозвіл на будівництво для цього об'єкта потребує продовження наступного місяця. Просимо завчасно подати оновлені документи.\n\nЗ повагою,\nРегіональний дозвільний офіс",
      ),
    },
  ],
};

export function makeInboxMessages(project: Project): InboxMessage[] {
  const seed = PROJECT_INBOX_SEEDS[project.id] ?? DEFAULT_INBOX_SEED;
  const messages = seed.messages.map((m) => ({ ...m }));
  if (project.hasDemo && seed.substitution)
    messages.unshift({ ...seed.substitution, id: 'sub', hasSubstitution: true, unread: true });
  return messages;
}

/* ===== Legacy Scenario A defaults ======================================= */
export const DOC_SENTENCES: DocSentence[] = [
  {
    key: 'material',
    text: B(
      '5.1 Mineral wool with a density of 145 kg/m³ is used for the insulation of external facade walls.',
      '5.1 Мінеральна вата щільністю 145 кг/м³ застосовується для утеплення зовнішніх стін фасадної системи.',
    ),
  },
  {
    key: 'conductivity',
    text: B(
      '5.2 The design thermal conductivity coefficient λ is 0.041 W/(m·K) under operating conditions «B».',
      '5.2 Розрахунковий коефіцієнт теплопровідності λ становить 0.041 Вт/(м·К) за умов експлуатації «Б».',
    ),
  },
  {
    key: 'fire',
    text: B(
      '5.3 The material fire class is NG (non-combustible) per DBN V.1.1-7 «Fire safety of construction objects».',
      "5.3 Група горючості матеріалу — НГ (негорючий) відповідно до ДБН В.1.1-7 «Пожежна безпека об'єктів будівництва».",
    ),
  },
  {
    key: 'thickness',
    text: B(
      '5.4 The insulation layer thickness is 150 mm per the thermal calculation.',
      '5.4 Товщина шару утеплювача — 150 мм згідно з теплотехнічним розрахунком.',
    ),
  },
  {
    key: 'extra',
    text: B(
      '5.5 The design installation density ensures geometric stability throughout the service life.',
      '5.5 Проєктна щільність укладання забезпечує стабільність геометрії протягом усього терміну експлуатації.',
    ),
  },
];

/* ===== Material taxonomy =============================================== */
export const FUNNEL: Funnel = {
  sections: [
    { value: 'utep', label: B('Insulation', 'Утеплення') },
    { value: 'found', label: B('Foundations', 'Фундаменти') },
    { value: 'roof', label: B('Roofing', 'Покрівля') },
    { value: 'heating', label: B('Heating Systems', 'Системи опалення') },
  ],
  nodes: {
    utep: [
      { value: 'facade', label: B('Facade', 'Фасад') },
      { value: 'cokol', label: B('Plinth', 'Цоколь') },
    ],
    found: [{ value: 'plyta', label: B('Foundation slab', 'Фундаментна плита') }],
    roof: [{ value: 'krov', label: B('Roof pie', 'Покрівельний пиріг') }],
    heating: [{ value: 'radiators', label: B('Radiators', 'Радіатори') }],
  },
  materials: {
    facade: [
      { value: 'minvata', label: B('Mineral wool', 'Мінеральна вата') },
      { value: 'basalt', label: B('Basalt insulation', 'Базальтовий утеплювач') },
    ],
    cokol: [{ value: 'xps', label: B('Extruded polystyrene', 'Екструдований пінополістирол') }],
    plyta: [{ value: 'beton', label: B('Concrete B25', 'Бетон B25') }],
    krov: [{ value: 'pinovata', label: B('Roof mineral wool', 'Покрівельна мінвата') }],
    radiators: [
      { value: 'bimetal', label: B('Bimetallic radiator', 'Біметалевий радіатор') },
      { value: 'steel_panel', label: B('Steel panel radiator', 'Стальний панельний радіатор') },
    ],
  },
};

/* AI auto-detected category options (derived from the FUNNEL taxonomy) */
export const CATEGORY_OPTIONS: BilingualOption[] = FUNNEL.sections.flatMap((section) =>
  (FUNNEL.nodes[section.value] ?? []).flatMap((node) =>
    (FUNNEL.materials[node.value] ?? []).map((material) => ({
      value: `${node.value}-${material.value}`,
      label: B(
        `${node.label.en} / ${material.label.en}`,
        `${node.label.uk} / ${material.label.uk}`,
      ),
    })),
  ),
);

export const AI_DETECTED_CATEGORY = 'facade-minvata';

/* ===== Substitution scenarios (item 12) ===================================
   Each entry is a fully self-contained scenario used by SubstitutionFlow and
   ProjectDetail.handleResolve — keyed by project id. Replaces the previous
   single hardcoded module-level scenario (DOC_SENTENCES/
   costDelta/AI_DETECTED_CATEGORY), which are kept above only as legacy/default
   data feeding Scenario A so nothing else that may reference them breaks. */
const SCENARIOS = {
  /* Scenario A — Critical DBN violation: Kyiv Bridge, mineral wool → EPS */
  'PRJ-1042': {
    key: 'eps_facade',
    email: EMAIL,
    category: 'facade-minvata',
    materialShortName: B('Facade Insulation', 'Утеплення фасаду'),
    fromMaterial: B('Mineral wool', 'Мінеральна вата'),
    toMaterial: B('Polystyrene EPS', 'Пінополістирол ЕПС'),
    supplierName: B('Ukrbudpostach', 'Укрбудпостач'),
    costDelta: -18500,
    verdict: {
      tone: 'critical',
      title: B(
        'Critical: Violation of DBN V.1.1-7. Substitution is NOT recommended.',
        'Критично: Порушення ДБН В.1.1-7. Заміну НЕ рекомендовано.',
      ),
      desc: B(
        'The proposed polystyrene EPS (fire class G3, combustible) does not meet the project requirement of NG (non-combustible) per DBN V.1.1-7. Rejection recommended.',
        'Запропонований пінополістирол ЕПС (група горючості Г3, горючий) не відповідає проєктній вимозі НГ (негорючий) згідно з ДБН В.1.1-7. Рекомендовано відхилення.',
      ),
    },
    sources: [
      {
        key: 'dbn',
        name: 'ДБН_В.2.6-31.pdf',
        title: B(
          'Section 5. Thermal insulation materials of facade systems',
          'Розділ 5. Теплоізоляційні матеріали фасадних систем',
        ),
        sentences: DOC_SENTENCES,
      },
      {
        key: 'specman',
        name: 'Специфікація_Виробника_EPS.pdf',
        title: B(
          "Manufacturer's technical specification — Polystyrene EPS",
          'Технічна специфікація виробника — Пінополістирол ЕПС',
        ),
        sentences: [
          {
            key: 'eps1',
            text: B(
              '2.1 Polystyrene EPS board, density 25 kg/m³, is offered as a substitute for facade wall insulation.',
              '2.1 Плита пінополістиролу ЕПС щільністю 25 кг/м³ пропонується як заміна утеплення стін фасаду.',
            ),
          },
          {
            key: 'eps2',
            text: B(
              '2.2 Declared thermal conductivity coefficient λ is 0.038 W/(m·K).',
              '2.2 Заявлений коефіцієнт теплопровідності λ становить 0.038 Вт/(м·К).',
            ),
          },
          {
            key: 'eps3',
            text: B(
              '2.3 Fire classification per manufacturer testing: G3 (moderately combustible).',
              '2.3 Класифікація горючості за випробуваннями виробника: Г3 (помірногорючий).',
            ),
          },
          {
            key: 'eps4',
            text: B(
              '2.4 Recommended board thickness: 120 mm.',
              '2.4 Рекомендована товщина плити: 120 мм.',
            ),
          },
        ],
      },
      {
        key: 'dstu_fire',
        name: 'ДСТУ_Б_В.1.1-4.pdf',
        title: B(
          'Fire resistance classification of construction materials',
          'Класифікація будівельних матеріалів за пожежною небезпекою',
        ),
        sentences: [
          {
            key: 'fs1',
            text: B(
              '3.4 Facade insulation systems on public infrastructure objects must use materials of combustibility group NG or G1.',
              "3.4 Системи утеплення фасадів об'єктів публічної інфраструктури повинні використовувати матеріали груп горючості НГ або Г1.",
            ),
          },
          {
            key: 'fs2',
            text: B(
              '3.5 Materials of group G3 or lower are prohibited on facades exceeding 26.5 m in height.',
              '3.5 Матеріали груп Г3 та нижче заборонені на фасадах висотою понад 26.5 м.',
            ),
          },
        ],
      },
    ],
    fields: [
      {
        key: 'material',
        labelKey: 'field.material',
        value: B('Mineral wool', 'Мінеральна вата'),
        sourceDoc: 'dbn',
        sourceKey: 'material',
      },
      {
        key: 'conductivity',
        labelKey: 'field.conductivity',
        value: '0.041',
        sourceDoc: 'dbn',
        sourceKey: 'conductivity',
      },
      {
        key: 'fire',
        labelKey: 'field.fire',
        value: B('NG (non-combustible)', 'НГ (негорючий)'),
        sourceDoc: 'dbn',
        sourceKey: 'fire',
      },
      {
        key: 'thickness',
        labelKey: 'field.thickness',
        value: '150',
        sourceDoc: 'dbn',
        sourceKey: 'thickness',
      },
      {
        key: 'frost',
        labelKey: 'field.frost',
        value: '',
        sourceDoc: null,
        sourceKey: null,
        missing: true,
      },
    ],
    table1: [
      {
        crit: B('Fire class', 'Група горючості'),
        spec: B('NG (non-combustible)', 'НГ (негорючий)'),
        limit: B('NG or G1 required (DBN V.1.1-7 §3.4)', 'НГ або Г1 (ДБН В.1.1-7 п.3.4)'),
        proposal: B('G3 (combustible)', 'Г3 (горючий)'),
        status: 'violation',
        sourceDoc: 'dstu_fire',
        sourceKey: 'fs1',
      },
      {
        crit: B('Thermal conductivity, λ', 'Теплопровідність, λ'),
        spec: B('0.041 W/(m·K)', '0.041 Вт/(м·К)'),
        limit: B('≤ 0.045 W/(m·K)', '≤ 0.045 Вт/(м·К)'),
        proposal: B('0.038 W/(m·K)', '0.038 Вт/(м·К)'),
        status: 'compliant',
        sourceDoc: 'dbn',
        sourceKey: 'conductivity',
      },
      {
        crit: B('Insulation layer thickness', 'Товщина шару утеплення'),
        spec: B('150 mm', '150 мм'),
        limit: B('≥ 140 mm (thermal calc.)', '≥ 140 мм (теплотехнічний розрахунок)'),
        proposal: B('120 mm', '120 мм'),
        status: 'violation',
        sourceDoc: 'specman',
        sourceKey: 'eps4',
      },
      {
        crit: B('Height restriction, group G3', 'Обмеження за висотою, гр. Г3'),
        spec: B("Not applicable (NG spec'd)", 'Не застосовується (передбачено НГ)'),
        limit: B(
          'Prohibited above 26.5 m (DBN V.1.1-7 §3.5)',
          'Заборонено вище 26.5 м (ДБН В.1.1-7 п.3.5)',
        ),
        proposal: B('Bridge structure exceeds 26.5 m', 'Конструкція мосту перевищує 26.5 м'),
        status: 'violation',
        sourceDoc: 'dstu_fire',
        sourceKey: 'fs2',
      },
    ],
    table2: [
      {
        crit: B('Material', 'Матеріал'),
        actual: B('Mineral wool, 145 kg/m³', 'Мінеральна вата, 145 кг/м³'),
        proposed: B('Polystyrene EPS, 25 kg/m³', 'Пінополістирол ЕПС, 25 кг/м³'),
        impact: B(
          '−$18,500, but non-compliant (fire safety)',
          '−$18,500, але не відповідає нормам (пожежна безпека)',
        ),
      },
      {
        crit: B('Fire class', 'Група горючості'),
        actual: B('NG (non-combustible)', 'НГ (негорючий)'),
        proposed: B('G3 (combustible)', 'Г3 (горючий)'),
        impact: B('Downgrade — critical safety risk', 'Погіршення — критичний ризик безпеки'),
      },
      {
        crit: B('Thermal conductivity', 'Теплопровідність'),
        actual: B('0.041 W/(m·K)', '0.041 Вт/(м·К)'),
        proposed: B('0.038 W/(m·K)', '0.038 Вт/(м·К)'),
        impact: B(
          '+7% thermal performance, equivalent quality',
          '+7% теплотехнічних показників, еквівалентна якість',
        ),
      },
      {
        crit: B('Est. price', 'Орієнтовна ціна'),
        actual: '$480/m²',
        proposed: '$310/m²',
        impact: B('−35% material cost', '−35% вартості матеріалу'),
      },
    ],
    revisionTitle: B(
      'Material Substitution: Mineral wool → Polystyrene EPS',
      'Заміна матеріалу: Мінеральна вата → Пінополістирол ЕПС',
    ),
    revisionDesc: B(
      'Supplier-proposed substitution pending engineering review.',
      'Запропонована постачальником заміна на розгляді інженера.',
    ),
    auditApprovedText: B(
      'Substitution «Mineral wool → Polystyrene EPS» APPROVED (override — non-compliant per system verdict)',
      'Заміну «Мінеральна вата → Пінополістирол ЕПС» ЗАТВЕРДЖЕНО (перевизначення — не відповідає висновку системи)',
    ),
  },
  /* Scenario B — Poorer quality / cost reduction: Lviv Water Treatment, bimetallic → steel panel radiators */
  'PRJ-1038': {
    key: 'radiators_steel',
    email: EMAIL_B,
    category: 'radiators-bimetal',
    materialShortName: B('Radiators', 'Радіатори'),
    fromMaterial: B('Bimetallic radiators', 'Біметалеві радіатори'),
    toMaterial: B('Steel panel radiators', 'Стальні панельні радіатори'),
    supplierName: B('TeploSystem Ukraine', 'ТеплоСистема Україна'),
    costDelta: -6200,
    verdict: {
      tone: 'amber',
      title: B(
        'Degraded characteristics: Substitution complies with DBN, but reduces service life by 15 years.',
        'Погіршення характеристик: Заміна відповідає ДБН, але зменшує термін служби на 15 років.',
      ),
      desc: B(
        'The proposed steel panel radiators meet all applicable DBN heat-output and pressure requirements, but carry a 15-year manufacturer warranty versus the 30-year warranty specified for the original bimetallic radiators.',
        'Запропоновані стальні панельні радіатори відповідають усім застосовним вимогам ДБН щодо тепловіддачі та тиску, проте мають гарантію виробника 15 років проти 30 років, передбачених для оригінальних біметалевих радіаторів.',
      ),
    },
    sources: [
      {
        key: 'spec',
        name: 'Специфікація_Опалення.pdf',
        title: B(
          'Section 4. Heating system equipment specification',
          'Розділ 4. Специфікація обладнання системи опалення',
        ),
        sentences: [
          {
            key: 'material',
            text: B(
              '4.1 Bimetallic radiators with a manufacturer warranty of no less than 30 years are used for the administrative building heating system.',
              '4.1 Для системи опалення адміністративної будівлі застосовуються біметалеві радіатори з гарантією виробника не менше 30 років.',
            ),
          },
          {
            key: 'heat',
            text: B(
              '4.2 Minimum required heat output per section is 1200 W at ΔT 70°C.',
              '4.2 Мінімальна необхідна тепловіддача секції — 1200 Вт при ΔT 70°C.',
            ),
          },
          {
            key: 'pressure',
            text: B(
              '4.3 Maximum working pressure in the heating network is 8.7 bar.',
              '4.3 Максимальний робочий тиск у мережі опалення — 8.7 бар.',
            ),
          },
          {
            key: 'warranty',
            text: B(
              '4.4 Design service life of the heating system components is no less than 30 years.',
              '4.4 Проєктний термін служби елементів системи опалення — не менше 30 років.',
            ),
          },
        ],
      },
      {
        key: 'dstu_rad',
        name: 'ДСТУ_Радіатори.pdf',
        title: B(
          'State standard for heating radiators — technical requirements',
          'Державний стандарт на радіатори опалення — технічні вимоги',
        ),
        sentences: [
          {
            key: 'dstu_heat',
            text: B(
              '2.2 Radiators must provide a minimum heat output of 1100 W per section at rated conditions to satisfy DBN heating norms.',
              '2.2 Радіатори повинні забезпечувати мінімальну тепловіддачу 1100 Вт на секцію за розрахункових умов для дотримання норм ДБН з опалення.',
            ),
          },
          {
            key: 'dstu_pressure',
            text: B(
              '2.5 Minimum rated working pressure for radiators in centralized systems is 8.7 bar.',
              '2.5 Мінімальний розрахунковий робочий тиск радіаторів у централізованих системах — 8.7 бар.',
            ),
          },
        ],
      },
      {
        key: 'supplier_sheet',
        name: 'Технічний_лист_Постачальника.pdf',
        title: B(
          'Supplier technical data sheet — steel panel radiators',
          'Технічний лист постачальника — стальні панельні радіатори',
        ),
        sentences: [
          {
            key: 's_heat',
            text: B(
              '1.1 Steel panel radiator, type 22, rated heat output 1250 W per section at ΔT 70°C.',
              '1.1 Стальний панельний радіатор, тип 22, розрахункова тепловіддача 1250 Вт на секцію при ΔT 70°C.',
            ),
          },
          {
            key: 's_pressure',
            text: B(
              '1.2 Maximum working pressure: 10 bar.',
              '1.2 Максимальний робочий тиск: 10 бар.',
            ),
          },
          {
            key: 's_warranty',
            text: B('1.3 Manufacturer warranty: 15 years.', '1.3 Гарантія виробника: 15 років.'),
          },
          {
            key: 's_price',
            text: B(
              '1.4 List price: $95 per unit (vs. $145 for bimetallic equivalent).',
              '1.4 Прайсова ціна: $95 за одиницю (проти $145 за біметалевий аналог).',
            ),
          },
        ],
      },
    ],
    fields: [
      {
        key: 'material',
        labelKey: 'field.material',
        value: B('Bimetallic radiator', 'Біметалевий радіатор'),
        sourceDoc: 'spec',
        sourceKey: 'material',
      },
      {
        key: 'heat',
        labelKey: 'field.heatOutput',
        value: '1200',
        sourceDoc: 'spec',
        sourceKey: 'heat',
      },
      {
        key: 'pressure',
        labelKey: 'field.pressure',
        value: '8.7',
        sourceDoc: 'spec',
        sourceKey: 'pressure',
      },
      {
        key: 'warranty',
        labelKey: 'field.warranty',
        value: '30',
        sourceDoc: 'spec',
        sourceKey: 'warranty',
      },
      {
        key: 'corrosion',
        labelKey: 'field.corrosionCert',
        value: '',
        sourceDoc: null,
        sourceKey: null,
        missing: true,
      },
    ],
    table1: [
      {
        crit: B('Heat output per section', 'Тепловіддача секції'),
        spec: B('1200 W', '1200 Вт'),
        limit: B('≥ 1100 W (DSTU §2.2)', '≥ 1100 Вт (ДСТУ п.2.2)'),
        proposal: B('1250 W', '1250 Вт'),
        status: 'compliant',
        sourceDoc: 'dstu_rad',
        sourceKey: 'dstu_heat',
      },
      {
        crit: B('Max working pressure', 'Робочий тиск'),
        spec: B('8.7 bar', '8.7 бар'),
        limit: B('≥ 8.7 bar (DSTU §2.5)', '≥ 8.7 бар (ДСТУ п.2.5)'),
        proposal: B('10 bar', '10 бар'),
        status: 'compliant',
        sourceDoc: 'dstu_rad',
        sourceKey: 'dstu_pressure',
      },
      {
        crit: B('Warranty / service life', 'Гарантія / термін служби'),
        spec: B('30 years', '30 років'),
        limit: B('No minimum set by DBN', 'Мінімум ДБН не встановлено'),
        proposal: B('15 years', '15 років'),
        status: 'compliant',
        sourceDoc: 'supplier_sheet',
        sourceKey: 's_warranty',
      },
    ],
    table2: [
      {
        crit: B('Radiator type', 'Тип радіатора'),
        actual: B('Bimetallic', 'Біметалевий'),
        proposed: B('Steel panel', 'Стальний панельний'),
        impact: B(
          '−34% unit cost, but reduced durability',
          '−34% вартості одиниці, але нижча довговічність',
        ),
      },
      {
        crit: B('Warranty / service life', 'Гарантія / термін служби'),
        actual: B('30 years', '30 років'),
        proposed: B('15 years', '15 років'),
        impact: B(
          '−15 years (50% shorter service life)',
          '−15 років (на 50% коротший термін служби)',
        ),
      },
      {
        crit: B('Heat output', 'Тепловіддача'),
        actual: B('1200 W', '1200 Вт'),
        proposed: B('1250 W', '1250 Вт'),
        impact: B(
          '+4% heat output, equivalent performance',
          '+4% тепловіддачі, еквівалентна ефективність',
        ),
      },
      {
        crit: B('Est. price', 'Орієнтовна ціна'),
        actual: B('$145/unit', '$145/од.'),
        proposed: B('$95/unit', '$95/од.'),
        impact: B('−34% cost per unit', '−34% вартості за одиницю'),
      },
    ],
    revisionTitle: B(
      'Material Substitution: Bimetallic → Steel panel radiators',
      'Заміна матеріалу: Біметалеві → Стальні панельні радіатори',
    ),
    revisionDesc: B(
      'Supplier-proposed heating equipment substitution pending engineering review.',
      'Запропонована постачальником заміна опалювального обладнання на розгляді інженера.',
    ),
    auditApprovedText: B(
      'Substitution «Bimetallic → Steel panel radiators» APPROVED (compliant, reduced service life accepted)',
      'Заміну «Біметалеві → Стальні панельні радіатори» ЗАТВЕРДЖЕНО (відповідає нормам, коротший термін служби прийнято)',
    ),
  },
  /* Scenario C — Approved substitution: Dnipro Industrial Park, imported mineral wool → domestic basalt insulation */
  'PRJ-1019': {
    key: 'basalt_domestic',
    email: EMAIL_C,
    category: 'facade-minvata',
    materialShortName: B('Facade Insulation', 'Утеплення фасаду'),
    fromMaterial: B('Imported mineral wool (Rockwool)', 'Імпортна мінеральна вата (Rockwool)'),
    toMaterial: B(
      'Domestic basalt insulation (Termobazalt-M)',
      'Вітчизняний базальтовий утеплювач («Термобазальт-M»)',
    ),
    supplierName: B('Ukrterm Izolyatsiya', 'Укртермоізоляція'),
    costDelta: -264000,
    verdict: {
      tone: 'success',
      title: B(
        'RECOMMENDED: Substitution fully complies with DBN and project requirements. 8% savings.',
        'РЕКОМЕНДОВАНО: Заміна повністю відповідає ДБН та проєктним вимогам. Економія 8%.',
      ),
      desc: B(
        'The proposed domestic basalt insulation board matches or exceeds all thermal, density, and fire-safety parameters of the specified imported product, at an 8% lower cost, with valid DSTU certification.',
        'Запропонований вітчизняний базальтовий утеплювач відповідає або перевищує всі теплотехнічні, щільнісні та протипожежні параметри передбаченого імпортного продукту за нижчою на 8% ціною, з чинним сертифікатом ДСТУ.',
      ),
    },
    sources: [
      {
        key: 'spec',
        name: 'Специфікація_Фасаду.pdf',
        title: B(
          'Section 6. Facade insulation package specification',
          'Розділ 6. Специфікація пакету утеплення фасаду',
        ),
        sentences: [
          {
            key: 'material',
            text: B(
              '6.1 Imported mineral wool insulation, density 140 kg/m³, is specified for the facade insulation package.',
              '6.1 Для пакету утеплення фасаду передбачено імпортну мінеральну вату щільністю 140 кг/м³.',
            ),
          },
          {
            key: 'conductivity',
            text: B(
              '6.2 Design thermal conductivity coefficient λ is 0.040 W/(m·K).',
              '6.2 Розрахунковий коефіцієнт теплопровідності λ становить 0.040 Вт/(м·К).',
            ),
          },
          {
            key: 'fire',
            text: B(
              '6.3 Material fire class is NG (non-combustible) per DBN V.1.1-7.',
              '6.3 Група горючості матеріалу — НГ (негорючий) згідно з ДБН В.1.1-7.',
            ),
          },
          {
            key: 'cert',
            text: B(
              '6.4 The material must be accompanied by a valid certificate of conformity per DSTU B V.2.7-94.',
              '6.4 Матеріал повинен супроводжуватися чинним сертифікатом відповідності згідно з ДСТУ Б В.2.7-94.',
            ),
          },
        ],
      },
      {
        key: 'cert_doc',
        name: 'Сертифікат_Термобазальт-M.pdf',
        title: B(
          'Certificate of conformity — Termobazalt-M',
          'Сертифікат відповідності — «Термобазальт-M»',
        ),
        sentences: [
          {
            key: 'c_material',
            text: B(
              '1.1 Basalt insulation board «Termobazalt-M», density 145 kg/m³, manufactured in Ukraine.',
              '1.1 Базальтова теплоізоляційна плита «Термобазальт-M», щільність 145 кг/м³, виробництво Україна.',
            ),
          },
          {
            key: 'c_conductivity',
            text: B(
              '1.2 Certified thermal conductivity coefficient λ: 0.039 W/(m·K).',
              '1.2 Сертифікований коефіцієнт теплопровідності λ: 0.039 Вт/(м·К).',
            ),
          },
          {
            key: 'c_fire',
            text: B(
              '1.3 Fire classification: NG (non-combustible), confirmed by test report No. 218-24.',
              '1.3 Класифікація горючості: НГ (негорючий), підтверджено протоколом випробувань №218-24.',
            ),
          },
          {
            key: 'c_cert',
            text: B(
              '1.4 Valid certificate of conformity per DSTU B V.2.7-94:2021, No. UA.TR.058.',
              '1.4 Чинний сертифікат відповідності згідно з ДСТУ Б В.2.7-94:2021, №UA.TR.058.',
            ),
          },
        ],
      },
      {
        key: 'dbn_therm',
        name: 'ДБН_В.2.6-31.pdf',
        title: B(
          'Section 5. Thermal insulation materials of facade systems',
          'Розділ 5. Теплоізоляційні матеріали фасадних систем',
        ),
        sentences: [
          {
            key: 'dbn_limit',
            text: B(
              '5.2 The maximum permissible thermal conductivity coefficient λ for the climate zone is 0.045 W/(m·K).',
              '5.2 Максимально допустимий коефіцієнт теплопровідності λ для кліматичної зони — 0.045 Вт/(м·К).',
            ),
          },
          {
            key: 'dbn_density',
            text: B(
              '5.3 Minimum insulation density for facade systems is 130 kg/m³.',
              '5.3 Мінімальна щільність утеплювача для фасадних систем — 130 кг/м³.',
            ),
          },
        ],
      },
    ],
    fields: [
      {
        key: 'material',
        labelKey: 'field.material',
        value: B('Imported mineral wool', 'Імпортна мінеральна вата'),
        sourceDoc: 'spec',
        sourceKey: 'material',
      },
      {
        key: 'conductivity',
        labelKey: 'field.conductivity',
        value: '0.040',
        sourceDoc: 'spec',
        sourceKey: 'conductivity',
      },
      {
        key: 'fire',
        labelKey: 'field.fire',
        value: B('NG (non-combustible)', 'НГ (негорючий)'),
        sourceDoc: 'spec',
        sourceKey: 'fire',
      },
      {
        key: 'density',
        labelKey: 'field.density',
        value: '140',
        sourceDoc: 'spec',
        sourceKey: 'material',
      },
      {
        key: 'cert',
        labelKey: 'field.certificate',
        value: '',
        sourceDoc: null,
        sourceKey: null,
        missing: true,
      },
    ],
    table1: [
      {
        crit: B('Fire class', 'Група горючості'),
        spec: B('NG (non-combustible)', 'НГ (негорючий)'),
        limit: B('NG required (DBN V.1.1-7)', 'Вимагається НГ (ДБН В.1.1-7)'),
        proposal: B('NG (non-combustible)', 'НГ (негорючий)'),
        status: 'compliant',
        sourceDoc: 'cert_doc',
        sourceKey: 'c_fire',
      },
      {
        crit: B('Thermal conductivity, λ', 'Теплопровідність, λ'),
        spec: B('0.040 W/(m·K)', '0.040 Вт/(м·К)'),
        limit: B('≤ 0.045 W/(m·K)', '≤ 0.045 Вт/(м·К)'),
        proposal: B('0.039 W/(m·K)', '0.039 Вт/(м·К)'),
        status: 'compliant',
        sourceDoc: 'dbn_therm',
        sourceKey: 'dbn_limit',
      },
      {
        crit: B('Density', 'Щільність'),
        spec: B('140 kg/m³', '140 кг/м³'),
        limit: B('≥ 130 kg/m³', '≥ 130 кг/м³'),
        proposal: B('145 kg/m³', '145 кг/м³'),
        status: 'compliant',
        sourceDoc: 'dbn_therm',
        sourceKey: 'dbn_density',
      },
      {
        crit: B('Certificate of conformity', 'Сертифікат відповідності'),
        spec: B('Required per DSTU B V.2.7-94', 'Вимагається згідно з ДСТУ Б В.2.7-94'),
        limit: B('Valid certificate mandatory', "Чинний сертифікат обов'язковий"),
        proposal: B('Valid, No. UA.TR.058', 'Чинний, №UA.TR.058'),
        status: 'compliant',
        sourceDoc: 'cert_doc',
        sourceKey: 'c_cert',
      },
    ],
    table2: [
      {
        crit: B('Material', 'Матеріал'),
        actual: B('Imported mineral wool (Rockwool)', 'Імпортна мінеральна вата (Rockwool)'),
        proposed: B(
          'Domestic basalt board (Termobazalt-M)',
          'Вітчизняна базальтова плита («Термобазальт-M»)',
        ),
        impact: B('+8% savings, equivalent quality', '+8% економії, еквівалентна якість'),
      },
      {
        crit: B('Thermal conductivity', 'Теплопровідність'),
        actual: B('0.040 W/(m·K)', '0.040 Вт/(м·К)'),
        proposed: B('0.039 W/(m·K)', '0.039 Вт/(м·К)'),
        impact: B('+2% better thermal performance', '+2% кращі теплотехнічні показники'),
      },
      {
        crit: B('Est. price', 'Орієнтовна ціна'),
        actual: '$420/m²',
        proposed: '$386/m²',
        impact: B(
          '−8% material cost, no compliance risk',
          '−8% вартості матеріалу, без ризику невідповідності',
        ),
      },
      {
        crit: B('Fire class', 'Група горючості'),
        actual: B('NG (non-combustible)', 'НГ (негорючий)'),
        proposed: B('NG (non-combustible)', 'НГ (негорючий)'),
        impact: B('No change — fully compliant', 'Без змін — повністю відповідає нормам'),
      },
    ],
    revisionTitle: B(
      'Material Substitution: Imported mineral wool → Domestic basalt insulation',
      'Заміна матеріалу: Імпортна мінеральна вата → Вітчизняний базальтовий утеплювач',
    ),
    revisionDesc: B(
      'Supplier-proposed domestic equivalent pending engineering review.',
      'Запропонований постачальником вітчизняний аналог на розгляді інженера.',
    ),
    auditApprovedText: B(
      'Substitution «Imported mineral wool → Domestic basalt insulation» APPROVED (per system recommendation)',
      'Заміну «Імпортна мінеральна вата → Вітчизняний базальтовий утеплювач» ЗАТВЕРДЖЕНО (згідно з рекомендацією системи)',
    ),
  },
} satisfies Record<string, SubstitutionScenario>;

export const SUBSTITUTION_SCENARIOS: Record<string, SubstitutionScenario> = SCENARIOS;

/** Scenario A doubles as the fallback for projects without their own scenario. */
export const FALLBACK_SCENARIO_ID: keyof typeof SCENARIOS = 'PRJ-1042';

export function getScenario(projectId: string): SubstitutionScenario {
  return SUBSTITUTION_SCENARIOS[projectId] ?? SCENARIOS[FALLBACK_SCENARIO_ID];
}

/* ===== Per-project artifact factories ================================== */
export const makeDocuments = (): ProjectDocument[] => [
  {
    id: 1,
    name: 'DBN_V.2.6-31.pdf',
    type: 'PDF',
    section: B('Thermal insulation', 'Теплоізоляція'),
    sizeKb: 3200,
    author: B('V. Kuzemko', 'В. Куземко'),
    date: '01.06.2026',
  },
  {
    id: 2,
    name: 'Estimate_Q2.xlsx',
    type: 'XLSX',
    section: B('Finance', 'Фінанси'),
    sizeKb: 540,
    author: B('D. Marchenko', 'Д. Марченко'),
    date: '18.06.2026',
  },
  {
    id: 3,
    name: 'Facade_requirements.docx',
    type: 'DOCX',
    section: B('Facade', 'Фасад'),
    sizeKb: 890,
    author: B('I. Kovalenko', 'І. Коваленко'),
    date: '22.05.2026',
  },
  {
    id: 4,
    name: 'Node_A_fastening.pdf',
    type: 'PDF',
    section: B('Structures', 'Конструкції'),
    sizeKb: 640,
    author: B('O. Petrenko', 'О. Петренко'),
    date: '10.06.2026',
  },
];

export const makeBlueprints = (): Blueprint[] => [
  {
    id: 1,
    name: 'Facade_insulation_F4-F7.dwg',
    discipline: B('Structural', 'Конструктивна'),
    revision: 'Rev 4',
    date: '10.06.2026',
  },
  {
    id: 2,
    name: 'Foundation_layout.dwg',
    discipline: B('Structural', 'Конструктивна'),
    revision: 'Rev 2',
    date: '14.03.2026',
  },
  {
    id: 3,
    name: 'Site_drainage.dwg',
    discipline: B('Civil', 'Цивільна'),
    revision: 'Rev 1',
    date: '27.02.2026',
  },
  {
    id: 4,
    name: 'Electrical_riser.dwg',
    discipline: B('Electrical', 'Електрична'),
    revision: 'Rev 3',
    date: '05.05.2026',
  },
];

export const makeReports = (): Report[] => [
  {
    id: 1,
    name: B('Monthly Progress Report', 'Місячний звіт про прогрес'),
    version: 'v1.0',
    author: B('O. Petrenko', 'О. Петренко'),
    date: '02.05.2026',
    format: 'PDF',
  },
  {
    id: 2,
    name: B('Defect Report No.2', 'Дефектовий акт №2'),
    version: 'v1.1',
    author: B('I. Kovalenko', 'І. Коваленко'),
    date: '14.06.2026',
    format: 'XLSX',
  },
];

export const makeAudit = (project: Project): AuditEntry[] => {
  const supplier = project.hasDemo
    ? getScenario(project.id).supplierName
    : B('Ukrbudpostach', 'Укрбудпостач');
  return [
    {
      id: 1,
      time: '09:40',
      date: '24.07.2026',
      text: B('Material substitution request created', 'Запит на заміну матеріалу створено'),
      who: supplier,
      tone: 'blue',
    },
    {
      id: 2,
      time: '10:15',
      date: '24.07.2026',
      text: B(
        'O. Petrenko reviewed the project documentation (DBN V.2.6-31)',
        'О. Петренко переглянув проєктну документацію (ДБН В.2.6-31)',
      ),
      who: B('O. Petrenko', 'О. Петренко'),
      tone: 'slate',
    },
  ];
};

export const makeRevisions = (project: Project): Revision[] => {
  const base: Revision[] = [
    {
      id: 1,
      title: B('Facade insulation spec update', 'Оновлення специфікації утеплення фасаду'),
      desc: B(
        'Increased density spec for panels F2–F3 per updated model.',
        'Збільшено щільність для панелей Ф2–Ф3 за оновленою моделлю.',
      ),
      author: B('O. Petrenko', 'О. Петренко'),
      date: '20.06.2026',
      statusKey: 'approved',
    },
    {
      id: 2,
      title: B('Foundation layout revision', 'Ревізія розкладки фундаменту'),
      desc: B(
        'Adjusted footing depth after geotechnical survey.',
        'Скориговано глибину підошви після геологічних вишукувань.',
      ),
      author: B('I. Kovalenko', 'І. Коваленко'),
      date: '11.05.2026',
      statusKey: 'approved',
    },
  ];
  if (project.hasDemo) {
    const scenario = getScenario(project.id);
    base.unshift({
      id: 0,
      title: scenario.revisionTitle,
      desc: scenario.revisionDesc,
      author: B(`${scenario.email.from.en} (Supplier)`, `${scenario.email.from.uk} (Постачальник)`),
      date: '24.07.2026',
      statusKey: 'pending',
      isSubstitution: true,
    });
  }
  return base;
};

/* Per-project persisted data slice — lazily created the first time a project is opened,
   then kept alive in Dashboard's projectDataById map so it survives navigating away and back. */
export function makeProjectData(project: Project): ProjectData {
  return {
    documents: makeDocuments(),
    blueprints: makeBlueprints(),
    reports: makeReports(),
    audit: makeAudit(project),
    revisions: makeRevisions(project),
    inboxMessages: makeInboxMessages(project),
    sentMessages: [],
    spamMessages: [],
    resolution: null,
  };
}

/* Mock cross-project notification feed (bell dropdown) and activity feed (projects view) */
export const NOTIFICATIONS_SEED: FeedItem[] = [
  { id: 1, textKey: 'notif.item1', timeKey: 'notif.time1', icon: Sparkles, tone: 'blue' },
  { id: 2, textKey: 'notif.item2', timeKey: 'notif.time2', icon: CheckCircle2, tone: 'green' },
  { id: 3, textKey: 'notif.item3', timeKey: 'notif.time3', icon: Mail, tone: 'blue' },
  { id: 4, textKey: 'notif.item4', timeKey: 'notif.time4', icon: AlertTriangle, tone: 'red' },
  { id: 5, textKey: 'notif.item5', timeKey: 'notif.time5', icon: BarChart3, tone: 'amber' },
  { id: 6, textKey: 'notif.item6', timeKey: 'notif.time6', icon: FileText, tone: 'slate' },
];

export const ACTIVITY_FEED: FeedItem[] = [
  { id: 1, textKey: 'notif.item1', timeKey: 'notif.time1', icon: Sparkles, tone: 'blue' },
  { id: 2, textKey: 'notif.item2', timeKey: 'notif.time2', icon: CheckCircle2, tone: 'green' },
  { id: 3, textKey: 'notif.item4', timeKey: 'notif.time4', icon: AlertTriangle, tone: 'red' },
  { id: 4, textKey: 'notif.item5', timeKey: 'notif.time5', icon: BarChart3, tone: 'amber' },
  { id: 5, textKey: 'notif.item6', timeKey: 'notif.time6', icon: FileText, tone: 'slate' },
  { id: 6, textKey: 'notif.item3', timeKey: 'notif.time3', icon: Mail, tone: 'blue' },
];

/* ===== Report templates ================================================ */
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    value: 'material',
    key: 'tpl.material',
    descKey: 'tpl.materialDesc',
    accent: 'blue',
    sections: [
      B('Substitution summary', 'Опис заміни'),
      B('Compliance check (DBN)', 'Перевірка відповідності (ДБН)'),
      B('Cost impact', 'Вплив на вартість'),
      B("Engineer's verdict", 'Висновок інженера'),
    ],
  },
  {
    value: 'monthly',
    key: 'tpl.monthly',
    descKey: 'tpl.monthlyDesc',
    accent: 'emerald',
    sections: [
      B('Progress vs plan', 'Прогрес відносно плану'),
      B('Budget burn-down', 'Використання бюджету'),
      B('Risk register', 'Реєстр ризиків'),
      B('Next period plan', 'План на наступний період'),
    ],
  },
  {
    value: 'defect',
    key: 'tpl.defect',
    descKey: 'tpl.defectDesc',
    accent: 'amber',
    sections: [
      B('Defect list', 'Перелік дефектів'),
      B('Photo evidence', 'Фотофіксація'),
      B('Responsible party', 'Відповідальна сторона'),
      B('Remediation deadline', 'Термін усунення'),
    ],
  },
];

/* Fallback preview template for reports that don't match a known REPORT_TEMPLATES entry
   (e.g. substitution reports, or the AI budget calculation report) — used by the Reports tab's View action. */
export const GENERIC_REPORT_TPL: ReportTemplate = {
  value: 'generic',
  key: 'tpl.generic',
  accent: 'blue',
  sections: [B('Summary', 'Підсумок'), B('Key details', 'Ключові деталі'), B('Notes', 'Примітки')],
};

/* Document category options used by the New Project wizard's AI auto-categorization mock */
export const DOC_CATEGORY_OPTIONS: { value: DocumentCategory; label: BilingualString }[] = [
  { value: 'report', label: B('Report', 'Звіт') },
  { value: 'documentation', label: B('Documentation', 'Документація') },
  { value: 'blueprint', label: B('Blueprint', 'Креслення') },
  { value: 'correction', label: B('Correction', 'Виправлення') },
];

/* ===== AI Budget Calculator ============================================ */
export const BUDGET_MATERIAL_ROWS: BudgetMaterialRow[] = [
  {
    material: B('Reinforced concrete B25', 'Бетон армований B25'),
    supplier: B('Kyivbudmaterialy', 'Київбудматеріали'),
    unit: 'm³',
    unitPrice: 95,
    qty: 420,
  },
  {
    material: B('Steel rebar A500', 'Арматура А500'),
    supplier: B('Ukrmetal Group', 'Укрметалгруп'),
    unit: 't',
    unitPrice: 780,
    qty: 38,
  },
  {
    material: B('Mineral wool insulation', 'Мінеральна вата'),
    supplier: B('Rockwool Ukraine', 'Роквул Україна'),
    unit: 'm³',
    unitPrice: 42,
    qty: 260,
  },
  {
    material: B('Facade brick', 'Фасадна цегла'),
    supplier: B('Cegla Group', 'Цегла Груп'),
    unit: 'pcs',
    unitPrice: 0.65,
    qty: 18500,
  },
  {
    material: B('Roofing membrane', 'Покрівельна мембрана'),
    supplier: B('Icopal', 'Ікопал'),
    unit: 'm²',
    unitPrice: 12.5,
    qty: 1200,
  },
  {
    material: B('Structural steel beams', 'Сталеві балки'),
    supplier: B('Ukrmetal Group', 'Укрметалгруп'),
    unit: 'pcs',
    unitPrice: 1450,
    qty: 24,
  },
];

/* Mock source document backing the Budget Calculator's "Sources & Tracing" panel (item 1).
   One excerpt line per BUDGET_MATERIAL_ROWS entry — clicking a row's material name, unit
   price or quantity cell pins that row's line, highlighted, in the left-hand viewer. */
export const BUDGET_SOURCE_DOC_TITLE: BilingualString = B(
  'Estimate_Q2.xlsx — cost basis excerpt',
  'Estimate_Q2.xlsx — витяг кошторисної основи',
);
export const BUDGET_SOURCE_LINES: BilingualString[] = [
  B(
    'Section 4.2: Reinforced concrete B25 is specified for all load-bearing elements per structural calculation Rev 4, at 420 m³.',
    'Розділ 4.2: Бетон армований B25 передбачений для всіх несучих елементів згідно з конструктивним розрахунком, ревізія 4, обсягом 420 м³.',
  ),
  B(
    'Section 4.5: Steel rebar A500 quantity is derived from the reinforcement schedule — 38 t at current market price.',
    'Розділ 4.5: Кількість арматури А500 визначена за відомістю армування — 38 т за поточною ринковою ціною.',
  ),
  B(
    'Section 5.1: Mineral wool insulation is used for facade walls at a rate of 260 m³ per the thermal calculation.',
    'Розділ 5.1: Мінеральна вата застосовується для стін фасаду в обсязі 260 м³ згідно з теплотехнічним розрахунком.',
  ),
  B(
    'Section 6.3: Facade brick quantity of 18,500 pcs is taken from the facade elevation drawings.',
    'Розділ 6.3: Кількість фасадної цегли 18 500 шт. взято з креслень фасадних розгорток.',
  ),
  B(
    'Section 7.1: Roofing membrane area of 1,200 m² is calculated from the roof plan.',
    'Розділ 7.1: Площа покрівельної мембрани 1 200 м² розрахована за планом покрівлі.',
  ),
  B(
    'Section 4.8: Structural steel beams — 24 pcs per the steel structures specification.',
    'Розділ 4.8: Сталеві балки — 24 шт. згідно зі специфікацією металоконструкцій.',
  ),
];
