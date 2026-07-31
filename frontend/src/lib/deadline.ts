import { B } from '@/lib/bilingual';
import type { BilingualString } from '@/types';

const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTHS_UK = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
];

/** `<input type="month">` value (`"2027-04"`) to a bilingual label. */
export function formatDeadlineFromMonth(monthValue: string): BilingualString {
  const tbd = B('TBD', 'Визначається');
  if (!monthValue) return tbd;

  const [rawYear, rawMonth] = monthValue.split('-');
  const year = Number(rawYear);
  const index = Number(rawMonth) - 1;
  const en = MONTHS_EN[index];
  const uk = MONTHS_UK[index];
  if (!year || !en || !uk) return tbd;

  const suffix = String(year);
  return B(`${en} ${suffix}`, `${uk} ${suffix}`);
}

/** Inverse of the above, for pre-filling the Edit Project form. */
export function parseDeadlineToMonthValue(deadlineEn: string): string {
  const match = /^([A-Za-z]{3})\w*\s+(\d{4})$/.exec(deadlineEn.trim());
  if (!match) return '';

  const abbreviation = match[1];
  const year = match[2];
  if (!abbreviation || !year) return '';

  const index = MONTHS_EN.indexOf(abbreviation);
  if (index === -1) return '';

  return `${year}-${String(index + 1).padStart(2, '0')}`;
}
