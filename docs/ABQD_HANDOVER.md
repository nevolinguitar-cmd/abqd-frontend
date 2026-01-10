# ABQD • HANDOVER (актуально на 2026-01-09/10)

## 1) Что где крутится
- APP (статика): https://app.abqd.ru
  - /constructor/ → /opt/abqd/static/constructor/index.html
  - /u/ → /opt/abqd/static/u/index.html
  - рендер профиля → /opt/abqd/static/assets/profile-render.js
- API: https://api.abqd.ru (nginx → docker profiles-api)
  - проект: /opt/abqd/profiles-api
  - docker compose: /opt/abqd/profiles-api/docker-compose.yml

## 2) Ключевые патчи конструктора (в constructor/index.html)
- ABQD_UPLOAD_VIA_API_ALL_MEDIA_v1
  - upload изображений через POST /api/v1/media/upload
  - форматы: jpeg/png/webp
  - лимит: <= 5MB
- ABQD_PUBLISH_TO_API_v3
  - кнопка Save → PUT /api/v1/profile/<slug> {state}
- ABQD_FILE_LABELS_v2
  - показывать имя выбранного файла (вместо “файл не выбран”)
- ABQD_NO_PERSIST_BASE64_PREVIEW_v1
  - base64-превью НЕ пишем в localStorage (только URL после upload)

## 3) /u: что обязательно отключено
- Нет заголовка “Профиль”
- Нет суффикса “— Профиль” в title
- Нет генерации “© YEAR NAME” в footer

Контроль:
- grep -n "<b>Профиль</b>" /opt/abqd/static/u/index.html || echo OK
- grep -n "— Профиль" /opt/abqd/static/u/index.html || echo OK
- grep -n "footer.innerHTML.*©" /opt/abqd/static/assets/profile-render.js || echo OK

## 4) Восстановление (быстро)
### Вариант A: из tar релиза
- tar -xzf /opt/abqd/releases/ABQD_RELEASE_*.tar.gz -C /
- sudo systemctl reload nginx
- cd /opt/abqd/profiles-api && sudo docker compose restart api

### Вариант B: из git bundle (репо целиком)
- git clone abqd-frontend_*.bundle abqd-frontend
- дальше копировать нужные файлы в /opt/abqd/static/...

## 5) Проверки после восстановления
- constructor:
  - curl -sS "https://app.abqd.ru/constructor/?v=$(date +%s)" | grep -n "ABQD_PUBLISH_TO_API_v3" | head
- API:
  - curl -sS --http1.1 https://api.abqd.ru/api/v1/profile/media1 | head -c 220; echo
