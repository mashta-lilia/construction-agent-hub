# frontend

React + TypeScript + Vite + Bootstrap. Порт однофайлового прототипу
`REHUB_WORK_V6.html` (4000 рядків, React через CDN) у структуру з `CLAUDE.md` 2.1.

**Стан: фундамент. Екранів продукту ще немає** — близько 3300 рядків UI у
~100 компонентах попереду. Прототип лишається еталоном поведінки.
Залишок робіт — `../docs/migration-checklist.md`, розбивка на PR — `../docs/pr-plan.md`.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
```

На `/` — тимчасова сторінка `pages/DashboardPage.tsx`: сортована таблиця
проєктів на мок-даних, перемикачі мови й теми. Вона перевіряє, що фундамент
живий (словники, білінгвальні дані, сортування, Zustand-фільтр, Bootstrap-тема),
і замінюється на `features/projects`, коли почнеться порт екранів.

## Що вже є

| Шар                | Файли                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Типи домену        | `src/types/index.ts` — ~40 інтерфейсів, жодного `any`                                             |
| Мок-дані           | `src/lib/mock-data.ts` — 7 проєктів, 3 сценарії заміни, інбокси, звіти, бюджет                    |
| Локалізація        | `src/i18n/` — 396 ключів × 2 локалі на `react-i18next`, типізований `t()`                         |
| Утиліти            | `bilingual`, `project-email`, `deadline`, `documents`, `format`, `navigation`                     |
| Хуки               | `useSortableData`, `useBilingual`, `useTheme`                                                     |
| Провайдери         | `AppProviders`, `ThemeProvider` (`data-bs-theme`)                                                 |
| Стан               | `src/store/uiStore.ts` — Zustand, тільки клієнтський стан                                         |
| API                | `src/services/apiClient.ts` — базовий клієнт, одна форма помилки                                  |
| Спільні компоненти | `StatusBadge`, `RiskBadge`, `ThemeToggle`, `LocaleSwitcher`, `EmptyState`, `RecommendationNotice` |
| Інфраструктура     | `Dockerfile` + `nginx.conf`, три `tsconfig`, ESLint, Prettier                                     |

## Рішення, які варто знати

**Типізований `t()`.** `react-i18next` доповнений типами (`src/i18n/i18n.d.ts`):
`TranslationKey` виводиться зі словника `en`, а `uk` типізований як повний
`Record<TranslationKey, string>`. Пропущений або опечатаний ключ — помилка
компіляції, а не рядок-ключ, показаний користувачу. Ключі плоскі з точками
(`'nav.projects'`), тому `keySeparator` і `nsSeparator` вимкнені — інакше
i18next читав би їх як вкладені шляхи. Підстановки в словниках прототипу
одинарними дужками (`{name}`), звідси перевизначення `interpolation`.

**Тема — атрибутом, не класом.** `data-bs-theme` на `<html>`, як велить
Bootstrap 5.3. Кольори беруться з його ж CSS-змінних (`--bs-secondary-bg`),
тому другий набір правил під темну тему не потрібен. Деталі — `../docs/theming.md`.

**Білінгвальні дані окремо від словників.** i18next вирішує ключі інтерфейсу,
а дані (`project.name`) приходять як `{ en, uk }` — для них `useBilingual()`.

**Типи API не пишемо руками.** `npm run api:types` генерує їх із OpenAPI-схеми
FastAPI через `openapi-typescript`. Контракт, який підтримується вручну, тихо
розходиться зі схемою. `../docs/api-contract.md` — це чернетка для узгодження з
бекендом, а не джерело типів.

**Тестів немає свідомо.** CLAUDE.md, розділ 5: фронтові тести не є приоритетом
MVP і новий test-runner без запиту не додається.

## Гейти

```bash
npm run lint          # eslint: strictTypeChecked + stylisticTypeChecked
npm run format:check  # prettier
npm run typecheck     # tsc -b --noEmit
npm run build         # tsc -b && vite build
```

`tsconfig.app.json` тримає `strict`, `noUncheckedIndexedAccess`,
`noImplicitOverride`, `noUnusedLocals`, `noUnusedParameters`.

## Відкриті питання до команди

1. **Інтерактивні віджети Bootstrap.** Модалки, дропдауни й тултіпи потребують
   JS. Або `react-bootstrap` (декларативні компоненти, той самий Bootstrap —
   рекомендую), або імперативний Bootstrap JS API через `useEffect`, або
   писати руками на класах `.modal.show` + бекдроп. Це не додавання другого
   фреймворку стилів, але додавання залежності — потрібне явне рішення.
2. **Git-flow.** `CLAUDE.md` 4 вимагає `develop` + `feature/*`, а `RULES.md` 1 —
   GitHub Flow з однією довгоживучою `main` і без `develop`. Документи
   суперечать один одному; CI і `../docs/pr-plan.md` я зробив під `CLAUDE.md`.
3. **Автентифікація.** У структурі є фіча `auth`, у CLAUDE.md 10 — JWT з
   httpOnly refresh-cookie. На фронті це впливає на `apiClient` (перехоплення
   401, ротація токена) — робити після появи ендпоінтів.
