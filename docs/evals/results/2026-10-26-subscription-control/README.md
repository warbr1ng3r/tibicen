# Короткий подписочный контроль — 26.10.2026

Контроль выявил два изъяна native-протокола стенда. Положительная установка/загрузка/применение скилла в новой задаче пока не приняты; PREF/PROC не запускались. [Машиночитаемая проекция](summary.json) сохраняет точные исходы и hashes без raw transcript и авторизации. Дашборд (`../../../../.scratch/codex-zcode-acceptance/dashboard.md`; private development record; excluded from public source) показывает работу по пакетам.

## Условия

- Codex CLI 0.157.0, `gpt-6-sol`, существующая ChatGPT subscription, без платного API и fallback.
- Две отдельные startup-пробы: `gpt-6.1-sol` получила `model_not_found` именно в текущем подписочном CLI-маршруте; `gpt-6-sol` подтвердила shell-чтение контрольного AGENTS.md и завершение turn. Значение default сохранено; loader не подменяет модель принятого preflight.
- Первая пара — только `skill-01`, Tibicen → baseline, один повтор, cap 8 executor-сессий. Launch/setup/task: 45/180/120 секунд; вся группа потомков останавливается при завершении/таймауте. Фактически использовано три executor-сессии; все завершились с exit 0 и `turn.completed`, без timeout или routing failure.
- Исходный HEAD `bdd889d9f4f626daec1bf10057fa1003d2e2a252` не включает dirty-правки. Перед запуском сохранены hashes 156 файлов исходников/тестов/ресурсов; tree hash `586904a93ab5fc6eba1f57cbefb433f7986178a906403de711a4ebc6e4915491`. Conditions hash пары `73996a2256f439ad6a86da444a459394bca2c7ac49ee6f19b198bb73351775da`.
- Свежая автономная сборка содержит 84 файла. Mirror проверен продуктовыми provenance/license/hash правилами; дополнительный runtime probe подтвердил доступность ресурсов при запрете synthetic private read.

## Наблюдения

| Профиль / вариант | Launch | Setup | Task | Executor-сессии |
|---|---|---|---|---:|
| Codex / Tibicen | pass | error: `native-proposal-rejected` | skip | 1 |
| Codex / baseline | pass | error: `native-required-check-not-approved` | skip | 2 |
| ZCode / оба варианта | skip: `native-startup-auth-isolation-unverified` | skip | skip | 0 |

Tibicen успешно сформировал штатный результат CLI `proposal`, но финальный `kernelPlan` содержал входной intent. Стенд обоснованно отклонил объект без готового root/схемы/служебного плана. Независимый read-only replay полного stdout envelope `{proposal,digest,summary}` прошёл review, включая источники и receipt. Дефект компиляции ядра этим случаем не воспроизведён.

Baseline установил оба файла с закреплёнными SHA256. Затем стенд обнаружил отсутствие согласованной `node --test`, хотя проверял это условие только после apply. У Tibicen также был пустой список commands: после исправления envelope возник бы тот же второй отказ. Совпадение байтов у baseline не подтверждает загрузку и применение в следующей задаче.

## Исправления после когорты

Отдельный тикет (`../../../../.scratch/codex-zcode-acceptance/issues/07-review-native-verification-before-apply.md`; private development record; excluded from public source) уточняет контракт `kernelPlan`, заранее раскрывает обязательные literal-команды проверки и проверяет их до approval/apply. Planning-фазы и отказ пользователя сохраняют собственные границы; host не добавляет команды автоматически и не раскрывает hidden assertions. Прежние результаты остаются ошибками, новый живой повтор в этот цикл не добавлялся.

Независимое review ZCode-парсера выявило противоречивый Bash `status: failed` с exitCode 0. После завершения Codex-когорты это сочетание перестало создавать успешное tool evidence; отрицательная регрессия добавлена. Этот новый parser hash не относится к замороженной Codex-паре. После всех исправлений полный `pnpm test` прошёл 562/562; targeted workflow/ZCode — 36/36, независимое code review не нашло существенных замечаний.

## ZCode

Установлены Desktop 3.14.4 / bundled CLI 0.16.9. Свежие version/help пройдены в пустых HOME/TMPDIR/ZCODE_DATA_BASE_DIR; отдельный stream-json parser проверен fake-тестами. Подписку подтвердил владелец; живые provider/model/auth не объявлены проверенными.

Четыре незакрытые границы: наблюдаемый startup, недоступность авторизации инструментам, ограничения внешней записи и завершение потомков. Оба blocked-слота сохранены общим runner без запроса модели и без подстановки Codex. Исследование первичных источников (`../../../../.scratch/codex-zcode-acceptance/zcode-profile.md`; private development record; excluded from public source) описывает конкретные protocol/auth/fs gaps. Его PROC дополнительно требует отдельного продуктового адаптера и новой подходящей фикстуры.

## Что остаётся

Текущий цикл остановлен после первой ошибочной пары. Независимых judge-сессий и человеческих сверок — ноль; evaluated pass не заявлен. Семантическая приёмка, полная задача 3.6 и релизные обязательства открыты. Следующий цикл Codex — новая замороженная SKILL-пара с исправленным протоколом, затем PREF/PROC только после успеха. ZCode требует подтверждения границ до реальной авторизации; повторные prompt сами этого не доказывают.

Private исходники серии: `.evals-private/codex-zcode-20261026-E9khLl/` — два native reports, preflight, frozen, source snapshot, session index/trace/evidence. В этой директории нет скопированных реальных значений авторизации. Публичная проекция содержит только выбранные структурные поля; известные token counters не превращаются в денежную стоимость, неизвестное остаётся null. Коммитов и публикации не было.
