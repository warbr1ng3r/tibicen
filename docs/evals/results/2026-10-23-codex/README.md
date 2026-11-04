# Codex diagnostics — 23.10.2026

Ядро: `408beb5a5e4af1bae78d2a3d6b4bf23b04611f90`. macOS arm64, Node 24.15.0, pnpm 11.21.0, Codex CLI 0.157.0 (`ad0be20d04e2ba6146ecdb51d7f8b7b0fe15420a15dc9b0057518d858f1f3714`), модель gpt-6-sol, существующий ChatGPT subscription. Продуктовый код/дистрибутив соответствуют HEAD; незакоммиченный стенд закреплён отдельными хэшами.

Это первые два diagnostic-сценария, не PREF/SKILL/PROC, пилот или релизная приёмка. Независимый судья и человеческая выборка ещё не выполнялись: `quality: null`; evaluated setup имеет `missing-quality-review`, evaluated task пропущен. Наблюдённый механический pass не заменяет эти проверки.

## Corrected cohort

[Frozen conditions](frozen-corrected.json), [итоговый парный отчёт](report-corrected-enriched.json), [очищенные наблюдения](observations-corrected-enriched.json), [usage и метод учёта времени](usage-corrected.json), [реальные tool-чтения инструкций](loading-evidence-corrected.json).

| Сценарий | Вариант | Observed setup / task | Setup, s | Task со startup, s | Input / output tokens, setup + task |
|---|---|---|---:|---:|---:|
| Без инфраструктуры | Tibicen | pass / pass | 177.50 | 41.24 | 689632 / 12184 |
| Без инфраструктуры | Baseline | pass / pass | 43.25 | 35.78 | 148003 / 3250 |
| Конфликтующие инструкции | Baseline | pass / pass | 58.58 | 43.23 | 174614 / 3997 |
| Конфликтующие инструкции | Tibicen | pass / pass | 78.52 | 37.90 | 349147 / 5637 |

Все четыре launch наблюдались; setup 4/4 и задача после состоявшегося setup 4/4, сквозной observed результат 4/4. Проверялись сохранность/точное согласие и independent Node assertions для double/triple, включая 0, отрицательное значение и 17. Task имел новый HOME/CODEX_HOME и отдельные native ephemeral сессии. Native-чтение AGENTS.md наблюдалось во всех четырёх задачах; девять чтений setup/task сохранены отдельно. В варианте bare Tibicen действительно выполнялся штатный CLI apply с утверждённым digest; ошибка передачи diff была отвергнута до записи, затем тот же digest принят.

В этой конкретной серии Tibicen потребовал больше setup-времени и токенов. Это не доказательство общей пользы или вреда: один повтор, два игрушечных проекта, специальный протокол передачи полного kernelPlan и отдельные proposal/apply CLI-сессии. Host во время диагностики продолжал разработку/офлайн-проверки, поэтому время не является чистым измерением производительности модели. Input tokens включают повторяющийся/cached контекст; cached input не прибавляется второй раз. Денежная стоимость неизвестна (`null`); API key/платёжный API-маршрут не включались.

Заморожены один повтор, порядок T/B → B/T, максимум 16 native model sessions, launch 45 s, setup 180 s и task 120 s. Использованы все 16 сессий; автоматической замены неудачного исхода успехом нет. Setup-бюджет консервативно включает первый launch, хотя его длительность показана отдельно; task-бюджет включает его fresh startup.

## Preserved first cohort and preflight failures

Первая когорта использовала 9 native model sessions: bare Tibicen error/skip, bare baseline pass/pass, conflicts baseline fail/skip, conflicts Tibicen fail/skip. [Исходный отчёт](report-initial.json), [frozen](frozen-initial.json) и [наблюдения](observations-initial.json) сохранены. [Проекция с доступными tokens/полным task временем](report-initial-enriched.json) сохраняет те же исходы.

Здесь выявлены два дефекта стенда: regex принимал `node --test` внутри JSON/heredoc за исполнение; `.agents` оставалась защищена самой CLI даже после согласия на удаление. Это не установленное нарушение Tibicen. Исправленная когорта имеет новый experiment/conditions/harness hash. Первые ошибки не удалены, не объединены с исправленной серией и не используются как сравнение качества продукта.

Исходная gpt-6.1-sol дважды отвергнута подписочным backend: [первый отказ](preflight-model-rejected.json), [каталог и повторный отказ](preflight-model-catalog.json). После чтения model/list выбран отдельный профиль gpt-6-sol: [первый доступный профиль](preflight-first-supported-model.json), [preflight исходной серии](preflight-initial.json), [исправленные права](preflight-corrected.json). Всего пять startup-запросов моделей вне двух когорт; они не входят в дроби сценариев. Preflight подтверждает синтетическую командную границу и родительский подписочный маршрут: реальные значения credentials JS не читает, CLI использует отдельную временную auth-ссылку, команды проекта не читают ни её, ни личный источник. Слова `synthetic credentials` в legacy note относятся к границе синтетического probe, не к отсутствию подписочной авторизации у родительского CLI.

## Evidence processing

[Оригинальный исправленный отчёт](report-corrected-original.json) и [оригинальные наблюдения](observations-corrected-original.json) сохранены. После серии обнаружено, что первоначальная duration task начиналась после ready. Для определённых хэшей этого драйвера полный интервал восстановлен из неизменённых host-событий setup-finished → task-finished; статусы не изменялись. Будущая версия драйвера считает startup сразу. Регрессия отдельно проверяет сохранность других стадий при общих object-ссылках.

[collect-native.ts](../../../../scripts/evals/collect-native.ts) без моделей добавляет накопленные per-stage input/output из native `turn.completed.usage`, оставляя стоимость null. [native-usage.ts](../../../../scripts/evals/native-usage.ts) сохраняет unknown при неполных/неверных counters, перепривязывает seq оценок и не меняет оригинал. Metadata содержит source hashes каждого transcript и обоих обработчиков. Старый/новый отчёты не перезаписываются. Полные native transcripts остаются частными вспомогательными файлами `/tmp/tibicen-codex-{observed,corrected}-2026-10-23`; здесь сохранены очищенные факты без prompt/oracle/будущих ответов и actual loading excerpts.

[Точные исходники исполненного исправленного стенда](executed-harness-source.json) сохраняют все восемь frozen hash до последующей поправки clock. Это архив исходного кода для проверки воспроизводимости, не контекст агента и не наблюдение credentials. Дистрибутив содержит 80 прежних файлов и не включает стенд/источники/отчёты/OpenSpec. Другие ОС, профили Claude/ZCode, глубокая hostile-изоляция и семантическая приёмка здесь не подтверждены.
