import type { resources } from './config';

/**
 * Type augmentation is what keeps the compile-time guarantee we had before
 * react-i18next: `t()` only accepts keys that exist in the English dictionary,
 * and a typo is a build error rather than a string echoed back to the user.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: (typeof resources)['en'];
    keySeparator: false;
    nsSeparator: false;
  }
}
