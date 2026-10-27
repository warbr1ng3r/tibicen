# Verification — 27.10.2026

## Implementation

Pages workflow запускается только вручную, собирает landing/dist с origin/base из configure-pages, проверяет тот же output и передаёт его отдельному deploy job. Полные SHA Actions и Node/pnpm закреплены; Pages write/OIDC только у deploy. Исходные ссылки страницы теперь учитывают Astro base; preview использует query-relative ссылки. CLI скиллов, package/lock и frozen candidate не изменены.

## Evidence

- Regression: исходная страница в /repo/ сборке падает на /assets/favicon.svg; после исправления 13/13 site tests проходят. Дополнительная сборка exact workflow command с base=/repo (без завершающего слеша) также 13/13 pass.
- Chromium/Firefox/WebKit: все три прошли под /repo/. Проверены реальные logo/favicon/license, preview-навигация, выбор Python и локальный preset.yaml. Ошибок страницы/ресурсов, внешних runtime запросов и POST нет; root-пути ресурсов сервером отдавались как404. Сервер и браузеры закрыты, 16 файлов dist сохранены.
- Начальная ошибка browser smoke была неверным ожиданием shape preset: необязательные пустые списки были пропущены в тестовом ожидании. Исходная ошибка сохранена; после сверки с существующим preset.ts повтор всех трёх engines прошёл. Это не дефект продукта.
- Workflow YAML/permissions/pins/trigger/order разобраны локально; shell syntax и fallback пустого base проверены. Pins проверены по официальным GitHub refs/release/action.yml. Actionlint отсутствует, remote GitHub execution не выполнялся.
- Независимый ponytail-review: Ship, actionable findings нет. Проверены связанные scripts/CSS, source paths, workflow и реальная регрессия.

Private evidence: .evals-private/pages-20261027-r1/ (path-regression-before.log, project-path-tests.log, workflow-build.log, workflow-tests.log, workflow/, browser/).

## Pending publication

По ответу владельца «public, tibicen» создан пустой публичный https://github.com/warbr1ng3r/tibicen и настроен origin. Remote workflow, опубликованный URL и проверка на GitHub не выполнялись; это отдельный шаг после явного поручения коммита/push. Полная приёмка скиллов не является техническим условием размещения страницы.

## Final local gate

pnpm test прошёл:667/667, fail/cancel/skip0; lint/format/core+site types/root site build и strict specs прошли. Root-сборка восстановлена. Новых commits/tags/push/deployment нет. Все86 файлов frozen candidate3fb29ef сохранили хэши.

## Actual deployment — 27 October 2026

The owner authorized commit/push/publication and completed GitHub sign-in. Pages Source is GitHub Actions. [Run40438226284](https://github.com/warbr1ng3r/tibicen/actions/runs/40438226284) passed for source e0f59a55c7ce7581e402c3e270aa162fa1e0dc52. [Published site](https://warbr1ng3r.github.io/tibicen/) returned200; logos/favicon/license/CSS/JS loaded under /tibicen/. In-app-browser smoke confirmed the tagged command, pnpm selection and local schema1 preset download. The referenced alpha tag exists and its installation was checked.
