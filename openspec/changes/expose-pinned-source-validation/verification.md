# Verification

> Public source snapshot: detailed local development records are omitted. Historical verification summaries below retain their original limits.

## Implemented and checked — 26.10.2026

CLI добавляет accepted option/help и одну ветку `inputData → validateSources + loadBlocklist`; общий validator, Source и sourceGate/apply не менялись. `stage-agent-arch.md` направляет известный canonical repo/full SHA/выбранный состав к source-check, неизвестный кандидат — к discover.

Focused: 3 CLI + 26 discovery/build tests прошли. Новый интеграционный тест запускает настоящий CLI через stdin/file, проверяет неверные hash, missing resource, неподтверждённую лицензию, repo/SHA blocklist, invalid input/options и недоступность источника. GET-only synthetic transport не имеет network fallback. Проект/HOME со state/manifest/usage/cache сравниваются после каждого исхода. Тот же набор проверяется у обоих standalone skills после удаления временного checkout с пустым PATH.

`pnpm test` — exit 0: lint, format check, core/Astro types, site build, active/archived strict OpenSpec, **566/566 Node tests**, без skip. Лог интегратора: `/tmp/tibicen-source-check-gate-20261026.log`. `node scripts/build.ts` — оба скилла, 84 файла. Независимое read-only code review — P1/P2 не обнаружено; reviewer не менял код и не подменял cohort quality judge.

## Live control completed

Новая SKILL-01 пара: обе стороны observed launch/setup/task pass; setup invariants, independent task exports и task invariants — все шесть grades pass. Source tree a8abc6571d6f6f7df192be2ade3062c0ca66ac348b91d6ed3ab5321714d923b6, 156 файлов; HEAD bdd889d9f4f626daec1bf10057fa1003d2e2a252, dirty. После серии bytes/modes всех файлов повторно совпали.

Codex CLI 0.157.0 / gpt-6-sol / subscription, paid false; preflight metadata переиспользовано, новых startup-запросов 0. Один repeat, восемь executor, лимиты launch/setup/task 45/180/120s. Новых judge/human 0; evaluated сохраняет missing-quality-review. Совокупно 29 из 32 executor и 2 из 2 judge; старые оценки не перенесены. Private evidence: .evals-private/codex-source-check-20261026-MrXrND. Оба run валидированы, session/run/conditions/experiment hashes проверены; runtime probe verified с runtimeWriteDenied.

Агент выполнил source-check: invalid-source для URL вместо owner/repo, затем provenance-verified с точным SHA и MIT. Proposal компилировался один раз, как и в предыдущем успешном run. Terminal events 72 → 42; UTF-8 tool output 402231 → 134397 байт. Большой transport mirror и прямой импорт validator исчезли, но четыре proposal-исследования scripts и одно смешанное чтение при apply остались. Подробный разбор.

Эта когорта не пересчитывает прежние canonical-plan результаты. Один repeat не доказывает устойчивого ускорения или причинного эффекта; полная смысловая/человеческая приёмка и PROC остаются открытыми. Реализация/локальная проверка этого change завершена 4/4, без архивации и коммитов.
