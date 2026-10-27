# Candidate component setup, 2026-10-27

На frozen Tibicen 0.1.0/source3fb29ef выполнена установка закреплённого Ponytail и файловая интеграция OpenSpec 1.14.3 через установленные вне checkout dist-скиллы. Setup и последующие наблюдения новой рабочей сессии учитываются раздельно; результаты последних приведены ниже.

| Случай | Apply / status / report | Structural verify | Внешний тест приложения |
| --- | --- | --- | --- |
| Ponytail init | complete | passed, structure-only | 1/1 до и после |
| OpenSpec init | complete | passed, structure-and-package-resources | 1/1 до и после |
| OpenSpec adopt | complete, applied[] | passed, structure-and-package-resources | 1/1 после; исходный app SHA сохранён |

Приложение — маленький Node ES module с double(value). package.json, src/math.js и tests/math.test.js не изменены setup. Adopt сохранил 13 неслужебных файлов: приложение, AGENTS.md, конфиг процесса, локальную инструкцию, командный шаблон и пользовательский change keep-double. Данные и результаты — в setup-summary.json (локальная запись сопровождающего; не входит в публичный снимок). Точные планы, отдельные согласия root и фактические apply/verify/status/report сохранены в private evidence; публичная сводка не содержит личных или временных абсолютных путей.

## Закреплённые источники

Ponytail: DietrichGebert/ponytail@09c434ab73ca43761c5d8b0c5d341926c2fba710, MIT. Выбран только skills/ponytail/SKILL.md с SHA256 9badd22a32e19cb884e46dfa8d3aae82bb81dfa5484105b8b4f0262df823a509 и LICENSE с SHA256 fb1bc6909ac3ef82d5c22106e32ef682b0cff66788fa915fb9b53b15c9d2f3ab. Реальный source-check с обоими файлами вернул provenance-verified; проверка повторена при apply. Исходные байты сохранены в owned private evidence.

OpenSpec: @fission-ai/openspec1.14.3, MIT, исходник из закреплённой devDependency. pnpm-lock integrity совпал с pinned fixture; все 432 файла исходного пакета сохранены, resourceHash 27f07484ad1c5843d930395fa6381b8a0d472d7fbf1ddb61c89900b017bd095b совпал. Для работы сделана отдельная замкнутая копия 57 runtime-пакетов в owned temp. Все скопированные байты сравнены с источниками, семь ресурсов адаптера совпали. Единственный исключённый из runtime файл — неиспользуемый package-internal node_modules/.bin/yaml wrapper; его байты есть в source archive. Копия не требует devcheckout CLI.

Ограниченный адаптер создал ровно config, два .gitkeep и собственный tibicen-openspec/SKILL.md; native init/update и установка CLI не запускались. Отдельно разрешённые --version и list --json выполнились из копии с isolated HOME/XDG, OPENSPEC_TELEMETRY=0: версия1.14.3, root соответствует process-init-app. Это CLI smoke, не агентская загрузка процесса.

## Контроль и ограничения

Использован Node v24.15.0, pnpm11.21.0. 86 файлов установленного Tibicen побайтно совпали с frozen dist. Codex0.157.0 — закреплённый целевой формат; фактическая версия приложения Codex в этой серии не измерена. Proposal отметил headless-method-unverified; фактический compat report сохранил loading:unverified / trust-required. Команд в setup-планах нет, поэтому встроенная проверка приложения — unverified/no-project-checks; профиль Node в v1 не поддержан. Успешные node --test выполнены отдельно.

Каждый apply выполнен только после review точного digest. Исходные планы с пропущенным LICENSE и с checkout CLI были отклонены root до apply; исправленные планы сохранены отдельно. Продуктовый код не исправлялся. На setup native app startup, дополнительная модельная сессия, auth и paid model API не использовались; новых runner/SDK, зависимостей репозитория и коммитов нет. HOME/XDG, usage/state и runtime находятся в owned temp; временная папка не является OS sandbox.

## Новые рабочие сессии

Два независимых Codex app subagent получили только проект, подключённый скилл и пользовательскую задачу, без контекста setup/оценщиков. Это явное чтение и применение инструкции в новом контексте; отдельный startup приложения и автоматическое обнаружение скилла не проверены. Фактическая версия app не измерена.

| Компонент | Наблюдение | Независимая проверка root |
| --- | --- | --- |
| Ponytail | Прочитан установленный SKILL.md с закреплённым SHA; добавлен triple при сохранении double, 2/2 Node-теста | Изменены только два разрешённых файла, пять других сохранены; 12 функциональных проверок прошли |
| OpenSpec | Прочитаны проектная инструкция и нативные шаблоны; согласованы пять planning-файлов, затем после отдельного ревью — реализация. 5/5 Node-тестов, strict validation, native progress 3/3 all_done | Сохранены 12 защищённых исходных файлов, добавлены только пять согласованных planning-файлов; 12 функциональных проверок прошли |

Очищенная сводка новых сессий (локальная запись сопровождающего; не входит в публичный снимок). OpenSpec workflow выполнен один раз на копии принятого adopt с keep-double; init имеет setup-факты, без второго самостоятельного downstream. Командные инструкции, локальный шаблон и существующий change сохранены. Сохранённые Tibicen reports остаются исходными: внешние наблюдения не переписывают unverified в этих reports.

Это положительные наблюдения для выбранных источников и сценариев. Полная SKILL/PROC матрица, отдельный init workflow, component update/отрицательные варианты, native startup и human acceptance остаются открытыми. Человеческая выборка отсутствует.

Private evidence: .evals-private/candidate-components-20261027-r1/. В нём locations.json, полные источники/инвентарь runtime и candidate equivalence, первые отклонённые планы, CLI/test stdout/stderr, отдельные согласия, итоговые планы и downstream-skill-task.txt / downstream-process-task.txt. Temp сохраняется для независимого продолжения.
