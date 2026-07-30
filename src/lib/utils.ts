import { clsx, type ClassValue } from 'clsx';

/**
 * Conditional class names. With Bootstrap there is no utility-conflict problem
 * to resolve, so plain `clsx` is enough — no `tailwind-merge`.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
