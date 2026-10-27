# Tasks

## 1. Approved environment

- [x] 1.1 Реализовать bounded local environment inspection/copy и negative tests для внешних ссылок, чувствительных путей, stale hash и независимых копий; проверить node --test tests/verify/environment.test.ts.
- [x] 1.2 Связать вычисленное окружение с proposal/types/validation и документировать opt-in, лимиты, vendor trust и Node entrypoints; проверить изменение digest и совместимость плана без environment.

## 2. Snapshot execution

- [x] 2.1 Захватить окружение до baseline и передавать его только из retained snapshots в независимые исполнения; проверить отсутствие source/retained mutations и unverified при недоступном окружении.
- [x] 2.2 Выполнить публичный CLI apply на копии реального landing с pinned local deps, build и 13 site tests; сохранить собственный report, сравнимые command hashes и доказательство сохранности оригинала.

## 3. Integrated acceptance

- [x] 3.1 Провести независимое review, полный offline gate/build/unpacked checks и обновить tracker с фактическими ограничениями; не объявлять live/native/release acceptance по offline тестам.
- [x] 3.2 Сохранить прежние ошибки подготовки snapshot для планов без dependency environment; проверить baseline-changed без исполнения команд, полный gate и автономную поставку перед коммитом.
