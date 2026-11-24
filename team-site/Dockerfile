# Сайт-визитка «Аркадный автомат» — статика в nginx
# Сборка:  docker build -t volgatop2026-team-site .
# Запуск:  docker run -p 8080:80 volgatop2026-team-site
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="Волга.ТОП 2026 — сайт команды" \
      org.opencontainers.image.description="Статический сайт-автомат: HTML + CSS + JS, контент в JSON" \
      org.opencontainers.image.licenses="MIT"

ENV TZ=Europe/Moscow

# только то, что нужно сайту: без исходников Docker и README
COPY index.html /usr/share/nginx/html/index.html
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY data/ /usr/share/nginx/html/data/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
