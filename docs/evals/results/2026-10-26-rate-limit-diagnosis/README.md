# Разбор 429 без новых модельных вызовов

Точная причина исторического HTTP 429 не установлена. Проверка самой CLI связала аккаунт с desktop и показала `ordinaryUsageAllowed: true`, 5% использованного недельного окна, отсутствие общего reached/spend block **на момент проверки**. Покупка credits, сброс лимитов или смена модели из этого результата не следуют. [Машиночитаемые свидетельства](summary.json).

## Что подтверждено

Разбиралась только [сохранённая gpt-6-astra пара](../2026-10-26-process-ready/README.md) на коммите `6fd6cb5`. Новых startup/executor/judge/model requests — **0**. Два ограниченных metadata-сеанса app-server выполнили `account/read` с `refreshToken: false` и два `account/rateLimits/read`; thread/turn, login/reset/purchase не вызывались. Второе чтение сохранило недостающие в первой allowlist поля account binding и `ordinaryUsageAllowed`. CLI использовала прежний auth link без чтения значений host-кодом; размер, inode и mtime исходного файла не менялись. Полные RPC-ответы и identity не сохранены.

CLI 0.157.0 и binary SHA-256 совпадают с исторической парой. Статус получен через её account route, совпадение с desktop установлено сравнением account id без публикации значения. Это текущий account snapshot, а не доказательство состояния конкретного запроса за 22 минуты до него или доступности gpt-6-astra. [Official OpenAI documentation: account/rateLimits/read](https://learn.chatgpt.com/docs/app-server).

Четыре executor-сессии завершились, следующие две вернули одинаковое сообщение об исчерпании внутренних retries и последнем статусе 429. Известный subtotal — **434336 input / 5959 output**, включая **293376 cached input**; у двух отказов и startup usage неизвестен. Шесть executor-сессий не равны шести HTTP-запросам. Точные времена сохранения traces приведены в JSON и обозначены как filesystem mtime.

## Чего не хватает

- В terminal errors нет отдельного server error code/type, request id, `Retry-After`, headers, reset time и внутреннего retry count. Парсер сохранил terminal objects целиком; отсутствующие поля он не отрезал.
- Остальные stdout event types фильтруются; stderr executor-процесса игнорируется. Их прежнее содержимое восстановить нельзя и нельзя утверждать, что оно включало нужные headers.
- Trace не сохраняет start/end сессии. Mtime и относительное завершение не дают время отдельных HTTP-попыток.
- Профиль изолирует HOME/env, не наследует API key/base URL/proxy и задаёт модель. Effective inference provider/base URL и retry limits отдельно не закреплены: документированный default не доказывает фактический endpoint.

HTTP 429 может обозначать разные ограничения. Для классификации нужны конкретный код и доступные server hints; текущий процент подписки не заменяет эти сведения. API-документация описывает [разные коды 429](https://developers.openai.com/api/docs/guides/error-codes) и [границы Retry-After](https://developers.openai.com/api/docs/guides/rate-limits), но не устанавливает причину этого подписочного ответа.

## Решение

Не повторять историческую пару и не объявлять дефект продукта. Отдельная правка выполнена: Сохранять безопасную диагностику native-сессий (`../../../../.scratch/codex-zcode-acceptance/issues/26-retain-safe-session-diagnostics.md`; private development record; excluded from public source): UTC/monotonic timing и ограниченные проверенные error-поля, без raw stderr/headers/prompts/credentials. Отсутствующие сведения остаются null; перенос на app-server inference и общий API-маршрут не входят в неё. Проверка только offline: 594/594 теста, build/unpacked и повторное review прошли. Новые terminal errors сохраняют только type/detailHash; старые записи не изменились. Следующий шаг — Закрепить маршрут Codex перед новой серией (`../../../../.scratch/codex-zcode-acceptance/issues/27-pin-effective-codex-route.md`; private development record; excluded from public source), также без inference.

Следующий live-контроль требует отдельного frozen-контракта/бюджета и проверки именно CLI account/model route. Текущий `ordinaryUsageAllowed` необходим для проверки общего запрета, но не гарантирует успех модели. Сохраняются прежние raw outcomes, source hashes, неизвестный usage и открытая full 3.6/adopt/update/human приёмка.
