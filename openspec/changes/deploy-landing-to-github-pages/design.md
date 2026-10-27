# Design

## Context

См. proposal. Astro уже собирает static output. Изначально Git remote отсутствовал; после выбора владельцем public tibicen создан пустой репозиторий и настроен origin. Локальные проверки не выполняют публикацию. Сайт имеет несколько абсолютных public-ссылок, bundled assets обрабатывает Astro.

## Goals / Non-Goals

**Goals:** одинаковая страница при root/project base; ручной Pages workflow без ввода вымышленного адреса.
**Non-Goals:** изменение продукта/версии/зависимостей, публикация скиллов, push или выполнение deployment в этом продолжении.

## Decisions

- Использовать `import.meta.env.BASE_URL` в существующей странице, нормализуя только завершающий `/`. Не добавлять отдельную систему URL/config; Astro уже владеет base.
- Передавать `--site`/`--base` в существующий build-script из `actions/configure-pages` outputs `origin`/`base_path`; пустой base означает `/`. Локальные dev/build сохраняют настройки по умолчанию.
- Workflow запускается только вручную. Build job имеет contents:read/pages:read для чтения настроек Pages; deploy job получает pages:write/id-token:write и environment github-pages. Все Actions закреплены SHA, pnpm11.21.0/Node24.15.0 повторяют существующий CI. Перед upload выполнить офлайн-тесты сайта на том же build output.
- Расширить существующую проверку статических ресурсов параметром test base; проверить реальные root и `/repo/` сборки. Отдельный браузерный smoke под project path подтверждает загрузку, выбор/скачивание пресета и preview, без нового тестового framework.

## Risks / Trade-offs

- [Жёсткие public-ссылки обходят base] → проверять все локальные ссылки реального HTML, а не искать строку в исходнике.
- [Удалённый Pages не настроен] → описать Source GitHub Actions и ручной запуск, оставить remote run явно непроверенным.
- [Старая сборка остаётся после subpath smoke] → вернуть обычную root-сборку перед общим gate.

## Migration Plan

После выбора репозитория и явного поручения публикации разместить reviewed commit, выбрать Pages Source GitHub Actions и вручную запустить workflow. Возврат страницы выполняется новым ручным deployment проверенного предыдущего commit; опубликованные скиллы этот workflow не затрагивает.
