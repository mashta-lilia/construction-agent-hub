import type { Project } from '@/types';

/**
 * Every project is auto-provisioned a mailbox address derived from its English
 * name, with no manual "connect mailbox" step. This is the recommended option
 * from the spec (§3.2 / §7.2): the system only ever sees correspondence for one
 * project instead of the engineer's whole inbox.
 */
export const PROJECT_MAIL_DOMAIN = 'rehub.org.ua';

/**
 * Ukrainian Cyrillic to Latin, based on the official national transliteration
 * system and simplified for slugs. Lets a Ukrainian project title still produce
 * a readable Latin address instead of an empty one.
 */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ie',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'yi',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'yu',
  я: 'ya',
  ъ: '',
  ы: 'y',
  э: 'e',
  "'": '',
  ʼ: '',
  '’': '',
};

export function transliterateCyrillic(input: string): string {
  // Регулярка з флагом `u` йде по код-поїнтах, тому не ламає складені символи.
  return input.replace(/./gu, (char) => CYRILLIC_TO_LATIN[char] ?? char);
}

/** First three words of the transliterated name, joined by dashes. */
export function slugifyProjectName(nameEn: string): string {
  return transliterateCyrillic(nameEn.toLowerCase())
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join('-');
}

export function projectEmailAddress(nameEn: string): string {
  return `${slugifyProjectName(nameEn) || 'project'}.pr@${PROJECT_MAIL_DOMAIN}`;
}

/**
 * Single read point for a project's address: derived from the name by default,
 * but a manual override stored on the project wins. Call this instead of
 * `projectEmailAddress` so an edited address shows up everywhere.
 */
export function getProjectEmail(project: Pick<Project, 'name' | 'corporateEmail'>): string {
  // Порожній рядок теж має падати на похідну адресу, тому не `??`.
  const override = project.corporateEmail?.trim();
  if (override) return override;

  return projectEmailAddress(project.name.en);
}

/** Guards against two projects claiming the same mailbox. */
export function isProjectEmailTaken(
  email: string,
  projects: readonly Project[],
  exceptProjectId?: string,
): boolean {
  const normalized = email.trim().toLowerCase();
  return projects.some(
    (project) =>
      project.id !== exceptProjectId && getProjectEmail(project).toLowerCase() === normalized,
  );
}
