# Reconstruction Hub

Веб-платформа для головного інженера будівельних проєктів. Деталі домену та
архітектурні рішення — `CLAUDE.md`.

## Структура репозиторію

Монорепо, два основні корені плюс інфраструктурні сервіси:

```
/
├── docker-compose.yml     # єдина точка входу: піднімає всі сервіси разом
├── backend/               # FastAPI API — CLAUDE.md §2.2
├── frontend/              # React + TS + Vite — CLAUDE.md §2.1
├── mail/                  # self-hosted SMTP/IMAP (docker-mailserver)
└── workers/
    ├── mail-processing/
    ├── document-processing/
    └── report-generation/
```

Кожен сервіс зі своїм кодом має власний `Dockerfile` у своїй теці — без
спільного монолітного `Dockerfile` на кілька сервісів.

**Спільний код воркерів.** `workers/*/Dockerfile` збираються з build context
кореня репозиторію (`context: .` в `docker-compose.yml`) і копіюють
`backend/` напряму в образ — а не встановлюють `backend` як окремий пакет.
Це найпростіший варіант без потреби піднімати приватний package index на
цьому етапі; якщо код воркерів згодом суттєво розійдеться з кодом API, варто
повернутись до варіанту з окремим інстальованим пакетом.

**Стан скелетів:**
- `backend/` — мінімальний stub: тільки `GET /health` і `GET /ready`
  (CLAUDE.md §11). Реальна логіка (routers/services/repositories/ai/rules) —
  окремі задачі, зокрема S2-INFRA-01.
- `mail/` — тільки build-скелет на базі `docker-mailserver`, без логіки
  провіжину поштових акаунтів по проєктах. Містить один placeholder-акаунт
  (`placeholder@reconstruction-hub.local`, `mail/config/postfix-accounts.cf`)
  — без жодного акаунта Dovecot відмовляється стартувати і контейнер
  зациклюється на рестарті кожні ~2 хв. Це не робочий поштовий ящик, лише
  спосіб тримати контейнер живим до задачі з реальним провіжином акаунтів.
- `workers/*` — кожен піднімає ARQ-процес без жодної реальної задачі
  (`functions: []`) — місце під конкретний воркер з'явиться в окремих
  задачах.

## Запуск

```bash
cp .env.example .env
# відредагувати .env реальними локальними значеннями
docker compose up --build
```

Перевірка, що все піднялось:

```bash
curl -i http://localhost/api/health   # через nginx-проксі фронтенду
curl -i http://localhost:8000/health  # напряму до backend
```

`/api/` на фронтенді проксюється на `backend:8000` (nginx.conf усередині
`frontend/`), тому `/api/health` ззовні і `/health` усередині backend — той
самий ендпоінт, просто по різному видимий (nginx знімає префікс `/api/`).

## Гейти

Форматування/лінтинг/типи для кожного з коренів — `frontend/README.md` і
(коли з'явиться) `backend/README.md`. Правила проєкту в цілому — `CLAUDE.md`.
