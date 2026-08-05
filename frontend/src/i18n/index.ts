import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enDocuments from "./locales/en/documents.json";
import enInbox from "./locales/en/inbox.json";
import enNorms from "./locales/en/norms.json";
import enProjects from "./locales/en/projects.json";
import enReports from "./locales/en/reports.json";
import ukCommon from "./locales/uk/common.json";
import ukDocuments from "./locales/uk/documents.json";
import ukInbox from "./locales/uk/inbox.json";
import ukNorms from "./locales/uk/norms.json";
import ukProjects from "./locales/uk/projects.json";
import ukReports from "./locales/uk/reports.json";

export const defaultNS = "common";

export const NAMESPACES = ["common", "projects", "documents", "reports", "inbox", "norms"] as const;

export const resources = {
  en: {
    common: enCommon,
    projects: enProjects,
    documents: enDocuments,
    reports: enReports,
    inbox: enInbox,
    norms: enNorms,
  },
  uk: {
    common: ukCommon,
    projects: ukProjects,
    documents: ukDocuments,
    reports: ukReports,
    inbox: ukInbox,
    norms: ukNorms,
  },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // No `lng` here on purpose: LanguageDetector picks it up from
    // localStorage (persisted by LangToggle via i18n.changeLanguage), and
    // only falls through to `fallbackLng` on first visit / no stored value.
    detection: { order: ["localStorage"], caches: ["localStorage"] },
    fallbackLng: "en",
    defaultNS,
    ns: NAMESPACES,
    // `useI18n()`'s `t(key)` is called with no namespace prefix everywhere
    // (matching the original prototype's flat `I18N[locale][key]` lookup),
    // and callers rely on i18next trying every namespace in `NAMESPACES`
    // until one has the key (see useI18n.ts's doc comment). Merely listing
    // multiple namespaces in `ns` (above) only controls which namespaces get
    // LOADED -- it does NOT make plain `t(key)` search across all of them;
    // without `fallbackNS`, an unprefixed key only resolves against
    // `defaultNS` ("common") and every other namespace's keys render as the
    // raw key string. `fallbackNS` is what actually enables the "try each
    // namespace in order" behavior this app depends on. Verified in a real
    // browser: before this option, `/mail` rendered literal
    // "mail.overviewTitle"/"col.name"/"projects.seed.prj1042.name" etc.
    // instead of translated text.
    fallbackNS: NAMESPACES,
    // The ported dictionary uses flat, dot-namespaced keys (e.g. "nav.projects"),
    // not nested JSON objects. Disabling the key separator makes react-i18next treat
    // each JSON property as a single literal key instead of traversing "nav" -> "projects",
    // matching the original prototype's `I18N[locale][key]` flat lookup exactly.
    keySeparator: false,
    interpolation: { escapeValue: false },
  });

export default i18n;
