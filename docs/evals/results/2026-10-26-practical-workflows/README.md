# Практические сценарии Tibicen, Codex и ZCode

Пакет завершён с ограничениями: восстановление прошло, настройка веб-проекта доведена до отчёта интегратором после предложения Codex, живые инструменты ZCode не подтверждены. [Машиночитаемые факты](summary.json), дашборд (`../../../../.scratch/codex-zcode-acceptance/dashboard.md`; private development record; excluded from public source).

| Работа | Фактический результат |
| --- | --- |
| Реальный Astro-проект | Codex подготовил план; root применил его. Tibicen complete, внешняя сборка и 13/13 site tests прошли до/после, собственное приложение unverified |
| Обновление и восстановление после обрыва | Два offline CLI-сценария прошли, 26 квитанций; два существующих recovery-теста прошли |
| ZCode с настоящими инструментами | Одна живая host session завершилась ошибкой SDK до инструментов; native pass не подтверждён |

## Реальный веб-проект

Одна сессия Codex 0.157.0/gpt-6-astra через существующую подписку прочитала скилл и стадии, выполнила scan и подготовила настоящий compiled proposal для одного блока AGENTS.md. Сессия завершилась exit 0 за 84,887 с, без таймаута; 222845 input/2926 output tokens. Стенд ошибочно не распознал допустимый scan --root ., ожидая абсолютный root, и остановился до apply. Первичный frozen model case остаётся not-passed; повтор модели не выполнялся.

Root независимо сверил фактический root в выводе scan и полностью пересобрал предложение через публичный core: digest, полный показанный файл, команды и права совпали. До дальнейшей записи сохранён отдельный протокол продолжения без модели. Root применил ровно этот digest через публичный CLI и выполнил verify/status/report. Результат — complete, инфраструктура passed, AGENTS.md изменён в согласованном блоке, исходные пользовательские области/приложение/package/lock/19720 dependency entries сохранены. Единственный новый проектный файл — паспорт .tibicen/manifest.yml; report.md не создавался. [Итог настройки копии](web-handoff.md).

Отдельные build/test до и после прошли на изолированных копиях: Astro build exit 0, site tests 13/13. Hashes приложения, зависимостей, команд и нормализованного окружения совпали. Это внешний reference; собственный Tibicen checks.verify остался unverified/environment-unverified с нулём project command attempts. В исходном offline preflight тот же публичный snapshot исключил node_modules и не смог выполнить команды; это ограничение продукта не закрыто.

Все 240 frozen source hashes повторно сверены после продолжения; runtime и 84 файла dist не менялись. Root связал 15 артефактов приёмки. В первичном outcome есть отдельный служебный дефект frozenHash: host добавил reviewRoot в объект frozen.cases перед вычислением hash. Сам frozen.json не менялся; отдельная proof связывает его исходный digest и изменённый служебный hash. Исходные документы не переписывались. Контракт и факты (`../../../../.scratch/codex-zcode-acceptance/issues/33-check-real-web-project.md`; private development record; excluded from public source).

## Обновление и восстановление

Проверены начальная настройка, правки владельца, согласованное обновление, обрыв после записи до квитанции, отчёт и продолжение. Локальные байты, CRLF, приложение, session id и история сохранены. Старое согласие и неизвестное состояние файлов отклоняются без записи; свежий точный план позволяет продолжить. После обрыва report показывает interrupted и известный applied, после продолжения — complete/reason null. Уже выполненная setup-команда не повторяется, повтор неизвестной команды требует отдельного согласия.

Модельных вызовов и shared edits в этой части нет. Сторонний компонент не выбирался, приложение не исполнялось; его проверки остаются unverified. Контракт и приёмка (`../../../../.scratch/codex-zcode-acceptance/issues/34-check-update-and-resume.md`; private development record; excluded from public source).

## ZCode: фактическая попытка

Использован public createZCodeApp/app.submitPrompt из source 0.17.0, commit 3c5b227649371507ddc4eb46ac5133afe6db1cab, через существующий подписочный account:zai-individual-coding-plan / GLM-5.3 / low. Установленный CLI 0.16.9 и личный вход не менялись. Одна host session дала один SDK model_request event, затем turn_error через 9,864 с. Агент не успел прочитать инструкции, записать код или выполнить тесты. Реальные HTTP/inference count, внутренние retries и usage неизвестны; host retries, startup, judge и paid API — 0.

Сохранён hash общего сообщения Turn execution failed; нижележащая причина не сохранилась. Нельзя приписывать ошибку сети, лимиту или провайдеру. Public bootstrap подтверждает, что запрет HTTP-инструментов не участвует в создании modelAdapter. Первичные свидетельства сохранены и связаны hashes, root отдельно сверил семь артефактов.

До модели прошли offline native Read/Write/Bash, независимая проверка восьми значений и проверки границ. Независимое review выявило и помогло исправить private host: недоверенные байты читаются через sandbox, ссылки и лишние файлы отклоняются, Node-case запрещает дочерние процессы/worker/native addons. Offline fake loop не считается живым native pass. Контракт, исход и ограничения (`../../../../.scratch/codex-zcode-acceptance/issues/35-run-zcode-native-tools.md`; private development record; excluded from public source).

## Следующая очередь

Остановка отсоединённых процессов (`../../../../.scratch/codex-zcode-acceptance/issues/37-stop-detached-check-processes.md`; private development record; excluded from public source) — общий пробел supervisor, подтверждённый безопасной offline-проверкой. Локальное ограничение Node-case не исправляет остальные исполнения.

Воспроизводимое окружение проектных проверок (`../../../../.scratch/codex-zcode-acceptance/issues/36-reproduce-project-check-environment.md`; private development record; excluded from public source) — продуктовый пробел: встроенный snapshot исключает node_modules, поэтому внешний reference pass не может заменить собственный verify. Перед новым ZCode smoke нужна безопасная диагностика нижележащей ошибки SDK (`../../../../.scratch/codex-zcode-acceptance/issues/38-retain-zcode-error-reason.md`; private development record; excluded from public source).

Общий runtime и распространяемые скиллы в этом пакете не менялись. Предыдущий полный gate 596/596, build и unpacked checks относятся к тому же runtime; повторно они не запускались. Paid API, публикации и новые коммиты — 0. Полная релизная, semantic и человеческая приёмка остаются открытыми.
