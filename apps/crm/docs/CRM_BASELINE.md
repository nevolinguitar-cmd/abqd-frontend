# ABQD CRM — Эталон (Baseline)

Дата/время: 2026-02-23 18:40 (Europe/Vaduz)
Тег: CRM_BASELINE_20260223_1840

Зафиксировано:
- Колонки (stages) перетаскиваются ТОЛЬКО за ручку GripVertical.
- Колонка остаётся зоной приёма (onDragOver/onDrop).
- draggable/onDragStart/onDragEnd убраны с контейнера колонки.
- cursor-grab убран с шапки колонки.
- Пайплайн: apps/crm/src/App.jsx → npm run build → rsync dist/ → /opt/abqd/static/dashboard/
- Live-proof: sha256 dist = prod = live.

Правило: не править /opt/abqd/static/dashboard/ руками — только через build+rsync.
