# Spec Delta

## Purpose

Стенд разработки ограничивает исполнение проверяемыми границами процессов и не собирает результат native запуска, если потомки могут продолжить работу после остановки.

## ADDED Requirements

### Requirement: Native execution requires verified process containment
Полнофункциональные native evaluation профили SHALL блокировать исполнение с native-process-containment-unavailable, пока backend контроля полного дерева не подтверждён. Проверка только исходной группы процессов SHALL не считаться таким подтверждением.

#### Scenario: An old ready record exists
- **WHEN** host загружает ранее записанный ready, включая processTreeControlled=true или произвольные JSON признаки обхода
- **THEN** профиль остаётся blocked с native-process-containment-unavailable без CLI startup, auth или model request
- **AND** первый неуправляемый запуск не выполняется ради получения нового свидетельства

#### Scenario: Startup observation is explicitly requested
- **WHEN** вызывается native preflight с запросом наблюдения startup
- **THEN** отсутствие backend определяется до login, чтения личной auth, model discovery или model session
- **AND** modelRequests остаётся 0

### Requirement: Node-only checks prevent descendants before untrusted execution
Ограниченный режим Node checks SHALL сначала подтвердить OS запрет fork и запрет Node child processes, workers и native addons. Tests SHALL выполняться в одном процессе с явными путями. Неподдержанная платформа или неподтверждённая граница SHALL отклоняться до исполнения проверяемого кода.

#### Scenario: A test attempts a detached late writer
- **WHEN** тест пытается создать обычного или detached потомка, worker либо загрузить addon
- **THEN** попытка отклоняется до исполнения потомка
- **AND** безопасный временный маркер не появляется после exit, timeout и cancellation

#### Scenario: A runtime option could reopen process permissions
- **WHEN** caller передаёт runtime injection environment или неявный/относительный список tests
- **THEN** запуск отклоняется до создания проверяемого процесса
- **AND** параметры проверки не могут выдать child, worker или addon grants

#### Scenario: An inherited variable could reopen process permissions
- **WHEN** запрещённая runtime variable находится в enumerable prototype окружения
- **THEN** она проверяется наравне с собственными ключами и запуск отклоняется до spawn
- **AND** launcher получает ровно проверенную копию окружения

#### Scenario: A test tries to stop its supervisor
- **WHEN** проверяемый Node код посылает сигнал своему supervisor или другому процессу
- **THEN** OS boundary отклоняет сигнал до его доставки
- **AND** timeout и cancellation остаются исполнимыми без поздних эффектов теста

### Requirement: Trusted fixtures remain separate from production readiness
Доверенные offline protocol fixtures SHALL запускаться только через явный code-only вход. Их group-only cleanup SHALL быть обозначен ограничением, без личной авторизации и без переноса результата в production ready. Исторические результаты SHALL сохраняться без исправления задним числом.

#### Scenario: Offline protocol controls run
- **WHEN** тест явно выбирает trusted fixture entrypoint в коде
- **THEN** общий протокол продолжает проверяться без личных auth links и без моделей
- **AND** JSON профиля не способен выбрать этот вход
