# Чеклист миграции

Инвентарь прототипа `REHUB_WORK_V6.html`: 3974 строки, 125 React-компонентов.
Объём в строках — по исходнику, как ориентир для планирования.

## Готово

| Блок                                                                                                                                                              | Куда переехало                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `I18N` (321 стр., 396 ключей × 2 локали)                                                                                                                          | `lib/dictionaries.ts` + типизированный `t()`            |
| `SUBSTITUTION_SCENARIOS` (231), `FUNNEL` (66), `PROJECT_INBOX_SEEDS` (46), `DEFAULT_INBOX_SEED` (41), `GENERIC_REPORT_TPL` (42), `PROJECTS`, `EMAIL*`, `BUDGET_*` | `lib/mock-data.ts`                                      |
| `B(en, uk)` + структуры данных                                                                                                                                    | `lib/bilingual.ts`, `types/index.ts`                    |
| `CYRILLIC_TO_LATIN` (43), `slugifyProjectName`, `getProjectEmail`, `checkEmailTaken`                                                                              | `lib/project-email.ts`                                  |
| `MONTHS_EN/UK`, `formatDeadlineFromMonth`, `parseDeadlineToMonthValue`                                                                                            | `lib/deadline.ts`                                       |
| `guessDocCategory`, `folderOfDocument`                                                                                                                            | `lib/documents.ts`                                      |
| `NAV_TREE`, `matchesNavFilter`, `TAB_DEFS`, `FOLDER_DEFS`, `MAIL_FOLDERS`                                                                                         | `lib/navigation.ts`                                     |
| `useSortableData` (19)                                                                                                                                            | `hooks/use-sortable-data.ts`, теперь дженерик           |
| `StatusBadge`, `RiskBadge`, `InfoCard` (35), пустые состояния, модалка подтверждения                                                                              | `src/components/common/*`                               |
| Хаки тёмной темы (80 правил CSS)                                                                                                                                  | токены в `src/index.css`                                |
| `LocaleProvider`, `ThemeProvider` (60)                                                                                                                            | `components/providers/i18n-provider.tsx`, `next-themes` |
| `Button`, `Badge`, `Card`, `Alert`, `Input`, `Textarea`, `Label`, `Switch` (32), `Avatar`                                                                         | `src/components/<Name>/` на Bootstrap                   |
| `Select` (30), `MultiSelect` (59), `Dialog`, `Sheet`, `ToastProvider` (37)                                                                                        | Bootstrap + власні компоненти                           |

## Удалено и не переносится

| Из прототипа                | Почему                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `usePopoverPosition`        | Radix рендерит меню в портал — ручной расчёт координат для обхода `overflow: hidden` не нужен |
| `useFocusTrap`              | ловушку фокуса, блокировку скролла и `Esc` берёт на себя Radix Dialog                         |
| `Icon` + ~50 инлайновых SVG | `lucide-react`                                                                                |
| `cx()`                      | `cn()` на `clsx` + `tailwind-merge` (умеет перебивать базовые классы)                         |
| `html.dark .*` (80 правил)  | семантические токены                                                                          |

## Осталось: экраны и фичи

| Компонент                                                                               | Строк        | Целевой файл                                                            |
| --------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------- |
| `SubstitutionFlow`                                                                      | 322          | `src/features/norms/substitution-flow.tsx` (+ 5 подкомпонентов)         |
| `Dashboard`                                                                             | 227          | `src/features/projects/`                                                |
| `ProjectDetail`                                                                         | 202          | `src/features/projects/project-detail.tsx`                              |
| `DocumentationTab`                                                                      | 198          | `src/features/documents/documentation-tab.tsx`                          |
| `BudgetCalculatorModal`                                                                 | 190          | `src/features/reports/budget-calculator-modal.tsx`                      |
| `NewProjectModal`                                                                       | 146          | `src/features/projects/new-project-modal.tsx`                           |
| `ProjectsTable`                                                                         | 107          | `src/features/projects/projects-table.tsx`                              |
| `CommandPalette`                                                                        | 101          | `src/components/common/command-palette.tsx`                             |
| `UploadDocumentModal`                                                                   | 83           | `src/features/documents/upload-document-modal.tsx`                      |
| `ManualRequestModal`, `ProfileModal`                                                    | 68 + 68      | `features/substitution/`, `features/profile/`                           |
| `TopBar`, `InboxTab`                                                                    | 65 + 65      | `src/components/layout/top-bar.tsx`, `features/documents/inbox-tab.tsx` |
| `EditProjectModal`, `CreateReportModal`                                                 | 64 + 62      | `features/projects/`, `features/reports/`                               |
| `ProjectMailboxesOverview`, `ReportsTab`                                                | 60 + 57      | `features/inbox/`, `features/documents/`                                |
| `ReportPreview`, `NavSection`, `SettingsModal`                                          | 50 + 39 + 36 | `features/reports/`, `layout/nav-tree.tsx`, `features/settings/`        |
| `Sidebar`, `ThemeToggle`                                                                | 34 + 30      | `layout/`                                                               |
| `BlueprintsTab`, `AuditTab`, `EmailReaderDialog`                                        | 29 + 25 + 25 | `features/documents/`, `features/inbox/`                                |
| ~86 мелких компонентов (строки таблиц, бейджи статусов, шаги визарда, пустые состояния) | ~700         | по своим фичам                                                          |

Итого около **3300 строк** UI в ~100 компонентах.

## Осталось: утилиты

| Из прототипа                            | Целевой файл             |
| --------------------------------------- | ------------------------ |
| `generateReply`, `generateReplyVariant` | `lib/reply-templates.ts` |
| `findTemplateForReport`                 | `lib/reports.ts`         |
| `downloadBlob`, `makeDummyContent`      | `lib/download.ts`        |

## План на два прохода

**Проход 1.** Утилиты и хуки из таблицы выше, `lib/navigation.ts`, слой
`components/layout` (`Sidebar`, `NavTree`, `TopBar`, `ThemeToggle`,
`LocaleSwitcher`, `NotificationsBell`), `ProjectsTable` с сортировкой,
`features/shared` (`InfoCard`, `StatusBadge`, `RiskBadge`, `ConfirmDialog`,
`EmptyState`).

**Проход 2.** `ProjectDetail` с шестью табами, `SubstitutionFlow`,
`BudgetCalculatorModal`, модалки проекта и отчётов, почта, `CommandPalette`,
затем сборка `src/features/projects/` вместо smoke-страницы.

## Приёмка

Порт компонента считается законченным, когда:

1. `npm run typecheck` и `npm run build` проходят;
2. по файлу молчит `grep -nE "bg-white|bg-slate-|text-slate-|border-slate-|(bg|text|ring|border)-(blue|emerald|amber|red)-[0-9]"`;
3. поведение совпадает с прототипом в обеих локалях и обеих темах.

## Осталось: требования ТЗ вне прототипа

ТЗ v1.1 (28.07.2026) требует экранов, которых в макете не было. Типы под них уже
есть в `types/index.ts`, интерфейс — в проходе 3.

| Раздел ТЗ      | Экран или элемент                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| §2.3 п.3, §7.3 | загрузка нормативной базы (ДБН/ДСТУ): список документов, статус распознавания                               |
| §2.3 п.3, §7.3 | проверка распознанного в полуавтоматическом режиме: таблица требований с правкой и подтверждением инженером |
| §2.3 п.5       | индикаторы фоновой обработки: очередь, прогресс, ошибка, повтор — вместо ожидания ответа                    |
| §2.3 п.9       | панель маскирования: что именно заменено перед отправкой в ИИ                                               |
| §2.3 п.6       | наличие у поставщика как отдельный критерий сравнения                                                       |
| §2.3 п.8       | переключатель версий отчёта со сравнением                                                                   |
| Риски, стр. 1  | `RecommendationNotice` рядом с каждым автоматическим выводом                                                |
| §7.1           | переключатель способа определения раздела документа, если замовник выберет комбинированный вариант          |

**Отдельно требует решения:** раздел 9 ТЗ называет Bootstrap и react-i18next,
здесь Tailwind + shadcn + собственный `useI18n`. Подробнее — в README.

## Зміна стека після появи CLAUDE.md

Перша версія цього порту була на Tailwind + shadcn/ui + власному `useI18n`.
`CLAUDE.md` 2.1 і 3 фіксують Bootstrap і `react-i18next` і прямо забороняють
Tailwind, тому UI-шар перероблено. Перенеслось без змін: типи, мок-дані,
утиліти, `useSortableData` (2390 рядків). Конвертовано: словники в ресурси
i18next (876 рядків). Викинуто: 20 примітивів на Radix, шар токенів Tailwind,
власний i18n-провайдер (2047 рядків).
