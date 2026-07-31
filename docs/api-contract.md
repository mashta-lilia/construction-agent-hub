# Контракт із бекендом

Чернетка з боку фронтенда: які запити робить інтерфейс і які форми даних очікує.
Джерело правди для типів запитів і відповідей — OpenAPI-схема FastAPI:
`npm run api:types` генерує `src/services/api-schema.d.ts`. Цей файл — чернетка
для узгодження ендпоінтів, а не місце, де типи описуються руками. Узгоджується на початку другого етапу (ТЗ §4.2).

Базова адреса — `VITE_API_BASE_URL` (у розробці `/api` через проксі Vite).

## Проєкти

| Метод   | Шлях                       | Тіло / відповідь                          |
| ------- | -------------------------- | ----------------------------------------- |
| `GET`   | `/projects`                | `Project[]`                               |
| `POST`  | `/projects`                | `ProjectDraft` → `Project`                |
| `PATCH` | `/projects/{id}`           | `Partial<ProjectDraft>` → `Project`       |
| `GET`   | `/projects/{id}/documents` | `ProjectDocument[]`                       |
| `POST`  | `/projects/{id}/documents` | `multipart/form-data` → `ProjectDocument` |
| `GET`   | `/projects/{id}/audit`     | `AuditEntry[]`                            |
| `GET`   | `/projects/{id}/revisions` | `Revision[]`                              |

Адреса скриньки проєкту генерується на фронті (`lib/project-email.ts`) лише для
попереднього перегляду під час введення назви. Створює скриньку бекенд і повертає
фактичну адресу в полі `corporateEmail` — фронт показує саме її.

## Пошта

| Метод  | Шлях                                           | Відповідь                           |
| ------ | ---------------------------------------------- | ----------------------------------- |
| `GET`  | `/projects/{id}/mail?folder=inbox\|sent\|spam` | `InboxMessage[]`                    |
| `POST` | `/projects/{id}/mail/{messageId}/reply`        | `{ body: string }` → `InboxMessage` |

**Лист ніколи не йде автоматично.** Ендпоінт відправки викликається тільки з
явної дії інженера (ТЗ §2.4, чекліст PR).

## Нормативна база

| Метод   | Шлях                           | Відповідь                                                         |
| ------- | ------------------------------ | ----------------------------------------------------------------- |
| `POST`  | `/normative`                   | `multipart/form-data` + `mode: RecognitionMode` → `ProcessingJob` |
| `GET`   | `/normative`                   | `NormativeDocument[]`                                             |
| `GET`   | `/normative/{id}`              | `NormativeDocument` разом із `requirements`                       |
| `PATCH` | `/normative/{id}/requirements` | `NormativeRequirement[]` — правка в напівавтоматичному режимі     |
| `POST`  | `/normative/{id}/confirm`      | `NormativeDocument` зі `status: "confirmed"`                      |

## Аналіз заміни

| Метод  | Шлях                           | Відповідь                                                 |
| ------ | ------------------------------ | --------------------------------------------------------- |
| `POST` | `/projects/{id}/substitutions` | `{ messageId }` → `ProcessingJob`                         |
| `GET`  | `/jobs/{jobId}`                | `ProcessingJob` — фронт опитує до `succeeded`/`failed`    |
| `GET`  | `/substitutions/{id}`          | `SubstitutionScenario` + `MaskingReport`                  |
| `POST` | `/substitutions/{id}/resolve`  | `{ resolution: "approved" \| "rejected" }` → `AuditEntry` |

Вердикт (`verdict`) приходить уже обчисленим детермінованим шаром правил
(правило 19). Фронт його не перераховує і не інтерпретує — лише показує з
позначкою «рекомендація» і вимагає підтвердження інженера.

`MaskingReport` потрібен інтерфейсу, щоб показати, які саме поля були знеособлені
перед відправкою в LLM (ТЗ §2.3 п.9, правило 29).

## Звіти

| Метод  | Шлях                                    | Відповідь                                                   |
| ------ | --------------------------------------- | ----------------------------------------------------------- |
| `GET`  | `/projects/{id}/reports`                | `Report[]`                                                  |
| `POST` | `/projects/{id}/reports`                | `{ templateId, substitutionId }` → `ProcessingJob`          |
| `GET`  | `/reports/{id}/versions`                | `ReportVersion[]` — попередні версії незмінні (ТЗ §2.3 п.8) |
| `GET`  | `/reports/{id}/export?format=pdf\|xlsx` | файл; мова береться з cookie локалі                         |

## Помилки

Очікується єдина форма, яку фронт показує в тості:

```json
{ "detail": "human readable message", "code": "MACHINE_CODE" }
```

Для задач у черзі помилка приходить у полі `error` самої задачі, а не як HTTP-код,
бо запит на створення задачі вже завершився успішно.
