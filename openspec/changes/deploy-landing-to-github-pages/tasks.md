# Tasks

## 1. Hosting paths

- [x] 1.1 Исправить ссылки страницы относительно Astro base, расширить существующий resource-test и подтвердить реальными сборками root и /repo/, включая лицензии и preview.

## 2. Manual delivery

- [x] 2.1 Добавить ручной Pages workflow с полными SHA Actions, закреплённым pnpm/Node, origin/base из Pages, проверками сайта перед upload и минимальными job permissions; проверить YAML/настройки по официальным источникам и локальный эквивалент build/test.
- [x] 2.2 Описать Source GitHub Actions, ручной запуск и локальную проверку; проверить команды, явно оставить remote deployment непроверенным.

## 3. Acceptance

- [x] 3.1 Проверить project-path в браузере: загрузка ресурсов, preview-навигация и локальный download пресета; вернуть root-сборку, пройти общий offline gate и независимое review. Сохранить результаты/ограничения без объявления опубликованного сайта.

## Workflow follow-up

- После явного поручения коммита/push опубликовать reviewed изменения в выбранный remote и выполнить remote workflow; подтвердить фактический URL и поведение страницы.
- Sync/archive после принятой локальной реализации и review; remote publication остаётся отдельным действием.
