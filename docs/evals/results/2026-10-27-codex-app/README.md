# Продуктовые прогоны в приложении Codex

Два запроса выполнены обычными инструментами субагента в текущей сессии Codex. Агент прочитал скиллы и проекты, составил и проверил точные предложения, затем выполнил штатные proposal → apply → verify → status → report.

| Сценарий | Результат | Проверки |
|---|---|---|
| Init | Добавлен короткий AGENTS.md с реальными путями, правилами небольших изменений и `node --test` | Structural verify passed, status/report complete; 4/4 Node-теста до и после |
| Adopt | Удалена отсутствующая команда `test:legacy`, пользовательский раздел сохранён побайтно | Structural verify passed, status/report complete; 4/4 Node-теста до и после |

Хэши приложения, тестов, package.json, README и CI сохранились. Root независимо пересверил финальные файлы, права и CLI reports обоих проектов. Подтверждённых дефектов продукта нет; общие исходники не менялись. [Результат без временных путей](result.json).

На проект пришлось **два применения**: после первоначального успеха агент заменил свою рекомендацию `pnpm test` на прямой `node --test`. Внешний pnpm создал служебные dependency-файлы; они сохранены как evidence и удалены из итоговых проектов. Исходные proposal/report и отдельные reviewed corrections сохранены, первый успех не представлен как единственная попытка.

Встроенная проверка приложения остаётся `unverified/no-project-checks`; внешние Node-тесты не переписаны в штатный report. Это работа текущего app-агента, без отдельного startup или downstream task/quiz/compat/MCP. Дочерние CLI, SDK-host и чтение авторизации не использовались. Отдельный неуспешный headless batch сохраняется [самостоятельно](../2026-10-27-contained-tibicen/README.md).

Private evidence: `.evals-private/codex-app-product-pass-20261027-r1/`. Result SHA256 `fb9f0fd4a29507108c22a9dcb0c9393eaacfa94240caa4da572efb77bd3ab86f`; `root-verified.json` подтверждает независимую сверку. Общий код ранее прошёл `pnpm test` 660/660; после этого в продуктовой проверке shared scripts/tests не менялись.

Для ZCode подготовлены отдельная ветка и задание (`../../../../.scratch/codex-zcode-acceptance/ZCODE_HANDOFF.md`; private development record; excluded from public source). Его запуск в приложении пока не подтверждён.
