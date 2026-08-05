# Розбивка на PR

Стеля диффу: 200 рядків — ціль, 400 — максимум. Цей внесок цілком —
близько 5000 рядків, тому влити його одним PR не можна. Порядок нижче тримає
кожен PR самодостатнім: після кожного `npm run lint && npm run typecheck &&
npm run build` зелені.

| #   | PR                                                                   | Гілка                         | ~рядків |
| --- | -------------------------------------------------------------------- | ----------------------------- | ------- |
| 1   | Каркас: конфіги, CI, pre-commit, Vite + Bootstrap + роутер           | `chore/frontend-scaffold`     | 380     |
| 2   | Типи домену                                                          | `feature/domain-types`        | 400     |
| 3   | Мок-дані, частина 1: проєкти, інженери, листи, inbox-сіди            | `feature/mock-data-core`      | 320     |
| 4   | Мок-дані, частина 2: сценарії заміни + фабрики артефактів            | `feature/mock-data-scenarios` | 390     |
| 5   | Словники en/uk (`i18n/locales`)                                      | `feature/i18n-dictionaries`   | 340     |
| 6   | `react-i18next` конфіг, типізація, cookie локалі                     | `feature/i18n-provider`       | 180     |
| 7   | Тема: `index.css`, `ThemeProvider` на `data-bs-theme`, `ThemeToggle` | `feature/theme-tokens`        | 400     |
| 8   | Спільні компоненти: StatusBadge, EmptyState, RecommendationNotice    | `feature/common-components`   | 380     |
| 9   | Zustand-store, apiClient, роути і `pages/`                           | `feature/app-shell`           | 390     |
| 10  | Сторінка дашборда на мок-даних                                       | `feature/dashboard-page`      | 400     |
| 11  | Утиліти: адреса проєкту, дедлайни, документи, навігація              | `feature/lib-utils`           | 260     |
| 12  | `useSortableData`, `useBilingual`, `lib/navigation`                  | `feature/common-components`   | 240     |

Далі порт екранів — по одній фічі на PR, у порядку з `migration-checklist.md`.
Великі компоненти (`SubstitutionFlow` — 322 рядки, `DocumentationTab` — 198)
розбиваються на підкомпоненти, кожен зі своїм PR, щоб не пробити стелю.

Мок-дані і словники — це дані, а не логіка, тож ревʼю там швидке; якщо команда
готова, PR 3–5 можна помітити як `data-only` і дивитися вибірково.

## Гілки

За `CLAUDE.md` 4: гілка створюється від актуального `develop` з префіксом
`feature/` (або `fix/`, `chore/`), вливається в `develop` через PR з ревʼю,
у `main` йде тільки продакшн-готовий код. Прямий пуш у `main` заборонений.

Зверніть увагу: `RULES.md` 1 описує інший процес — GitHub Flow без `develop`.
Розбіжність між двома документами варто закрити до першого PR.
