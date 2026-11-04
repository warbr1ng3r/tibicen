# Реальные запуски Codex и ZCode через подписки

Снимок 26.10.2026: **Codex выполнил девять агентских сессий** через существующую подписку ChatGPT. Проверочная задача прошла; следующая пара SKILL-01 прошла установку скилла и задачу у Tibicen и baseline. ZCode получил официальный подписочный маршрут GLM-5.3 после отдельного OAuth-входа и успешно выполнил connectivity-проверку; кодовая задача прошла 6/6 независимых Node tests. API OpenRouter-like отложен владельцем. [Машиночитаемые результаты](summary.json), текущий тикет (`../../../../.scratch/codex-zcode-acceptance/issues/28-run-environment-smokes.md`; private development record; excluded from public source).

| Среда / проверка | Реальные сессии | Наблюдаемый результат |
| --- | ---: | --- |
| Codex: проверочная задача | 1 executor | Pass за 20,45 с: прочитал AGENTS, сохранил double, добавил triple и тесты; независимая проверка прошла |
| Codex: SKILL-01 Tibicen | 4 executor | Setup 129,83 с / task 40,15 с; установка, загрузка точного скилла в новой сессии и независимые проверки прошли |
| Codex: SKILL-01 baseline | 4 executor | Setup 101,64 с / task 45,38 с; загрузка того же скилла, тесты и независимые проверки прошли |
| ZCode: существующий OAuth store | 1 host preflight / 0 model | За 2,062 с registry не предоставил доступный маршрут individual-coding-plan; запрос к модели не отправлен |
| ZCode: новая connectivity-проверка | 1 model call | Pass за 7,927 с через официальный OAuth-профиль, GLM-5.3 low |
| ZCode: кодовая задача | 1 model call | Pass: генерация за 9,338 с; host применил два проверенных файла, независимые sandboxed Node tests 6/6 |
| API OpenRouter-like | 0 | Отложен владельцем до работы подписочных сред; API-расходы $0 |

## Что именно проверено в Codex

CLI 0.157.0, gpt-6-astra, существующая подписка. Проверочная задача и SKILL-пара имеют отдельные зафиксированные условия и снимки; они не объединены в сравнительную когорту. Новых startup/judge-запросов, host retries, смены модели или API fallback нет. У каждого из восьми executor SKILL-пары exit 0 без timeout; тесты выполнялись самим агентом и отдельно доверенным host.

В обеих свежих task-сессиях наблюдалась загрузка Ponytail из закреплённого источника `09c434ab73ca43761c5d8b0c5d341926c2fba710`, SHA-256 `9badd22a32e19cb884e46dfa8d3aae82bb81dfa5484105b8b4f0262df823a509`. Проверены 73 совпавших утверждения, 95 выбранных фактов, связи traces/receipts/run/packet/report, 191 файл исходников и архива с режимами доступа. Исходный коммит `6fd6cb5`; фактическое дерево SKILL-пары `80c0270fb54c6a1e541028b2628d0543c5dc4b498a251e8d6cc0df0fafd9811d`. Все 84 файла дистрибутива проверены по суммам.

Расход восьми executor пары — 719458 input / 9003 output tokens; из raw terminal usage известны 581760 cached input. В проверочной задаче отдельно 34249 input / 372 output. Денежная стоимость не измерялась; подписочный запуск не превращает её в измеренный ноль. Время приведено для одной пары, без вывода об устойчивом ускорении. У ZCode кодовая задача использовала 245 input / 263 output tokens; usage connectivity не измерялся.

## Границы результата

Это успешные наблюдаемые установка/загрузка/применение и проверки инвариантов. Новых независимых quality judge и human review нет. Поэтому collector сохраняет evaluated setup `missing-quality-review` и evaluated task `skip`; полная продуктовая и релизная приёмка открыта. Предыдущие PROC timeout/capacity/429 и их raw outcomes не менялись и этим запуском не переоцениваются.

ZCode установлен как CLI 0.16.9; отдельный host собран из официального исходника 0.17.0, commit `3c5b227649371507ddc4eb46ac5133afe6db1cab`. Версии различаются явно. Четыре offline deny-port canaries прошли, но app creation, native tools и skills в исходной попытке не достигнуты. Копия прежнего credential store удалена. Новый вход выполняется в отдельном профиле; личная конфигурация не меняется. Connectivity-проверка прошла. Native tools и загрузка скиллов ZCode ещё не проверены; кодовая задача использует режим model-generated/host-applied с tools выключенными.

Ровно один connectivity attempt и одна tools-disabled кодовая задача выполнены в заранее заданном лимите; независимые host-тесты 6/6 прошли после свежей проверки границ песочницы. Содержимое credentials, OAuth callback и личные traces в сводку не включаются.

## Дополнительные завершённые пакеты

Отдельная PROC-01 пара использовала 16 executor / 0 новых startup / 0 judge. Обе установки прошли. В последующей задаче Tibicen агент отказался от применения из-за нераскрытого разрешения на уже допустимое чтение OpenSpec. Baseline применил два согласованных файла, но также изменил несогласованный tasks.md. Обе task сохранены как native-plan-mismatch; guard не выдал false pass по exit 0. Это 16 дополнительных сессий, отдельно от девяти smoke/SKILL выше. Тикет результата (`../../../../.scratch/codex-zcode-acceptance/issues/29-check-process-on-working-subscription.md`; private development record; excluded from public source).

ZCode затем выполнил два отдельных quality judge вызова для SKILL-пары: оба ответа нарушили требуемый JSON envelope, принятых оценок 0; usage 52396 input / 726 output. Повторов или исправления оценок не было. Старые результаты/пакеты неизменны, human/release acceptance не заявлена. Тикет результата (`../../../../.scratch/codex-zcode-acceptance/issues/30-review-skill-with-zcode.md`; private development record; excluded from public source).

## Уточнение основного продуктового пути

По уточнению владельца приоритет — самостоятельный Tibicen init/adopt → согласованное применение → проверка → итоговый handoff/report, без зависимости от OpenSpec. Процесс OpenSpec устанавливается только при соответствующем выборе; его дальнейший workflow — отдельный downstream case. Его ошибка не подменяет итоговый статус передачи Tibicen. Исправление disclosure стенда остановлено до runtime-изменений и оставлено в backlog. Требования основного отчёта — [handoff](../../../../references/stage-handoff.md); файл отчёта сохраняется только по явному запросу.
