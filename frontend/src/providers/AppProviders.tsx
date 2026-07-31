import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18next from '@/i18n/config';

import { ThemeProvider } from './ThemeProvider';

/** Single place where cross-cutting context is mounted. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18next}>
      <ThemeProvider>{children}</ThemeProvider>
    </I18nextProvider>
  );
}
