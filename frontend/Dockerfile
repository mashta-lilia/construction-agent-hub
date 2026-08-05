# Збірка статики
FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Роздача через nginx (non-root образ, слухає 8080); /api проксюється на
# бекенд-сервіс з docker-compose
FROM nginxinc/nginx-unprivileged:1.27-alpine@sha256:65e3e85dbaed8ba248841d9d58a899b6197106c23cb0ff1a132b7bfe0547e4c0
COPY --from=build /app/dist /usr/share/nginx/html
# .template, не .conf напряму: базовий образ envsubst'ить
# /etc/nginx/templates/*.template -> /etc/nginx/conf.d/*.conf при старті
# контейнера (entrypoint-скрипт 20-envsubst-on-templates.sh) — дає змогу
# підставити шляхи SSL/TLS сертифікатів на деплої без пересборки образу.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 8080
