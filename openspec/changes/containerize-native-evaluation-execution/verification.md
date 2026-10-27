# Verification

> Public source snapshot: detailed local development records are omitted. Historical verification summaries below retain their original limits.

Commit review on 27.10.2026 fixed removal skipped after failed wait/state validation. Four offline regressions and one fresh real Docker seed/collect/stop/remove proof passed; owned CID was independently absent. Full gate667/667, build/86 checksums/both unpacked self-tests passed. Ponytail review; private proof `.evals-private/ponytail-review-20261027-r1/docker-cleanup-proof.json`. No new model/auth calls.

## Executed evidence

Сводка: результаты пакета. Image r2 pinned ID ba23f5c65d7d77b8aaac15fb53cdda90ecd25acff2738fd6d40fc762519dc6bd; 5 lifecycle canaries и environmentConfig/read прошли. Private evidence-r2 SHA-256 208609d9c04ffb8c4da58d6181c7d0ddb60e010e4b01cef9957a2e0cd0d87f00.

Final-source session r4 прошёл 7 cases, source hashes неизменны, attached client закрыт до terminal result, Node runner завершился нормально. Proof SHA-256 a27bf8cf80094d1e7ad2bb7f9f582fa8dea66fed3c6340bb1263b6f677d2a8d7. Строгий byte-only collector отверг реальную symlink; positive bytes совпали. Unit checks покрыли traversal/links/duplicate/limits и отказ критических workspace paths.

Настоящий host CLI + generated config + native apply_patch/shell пройден через synthetic local transport, frozen attempt8. 4 synthetic requests; 0 реальных provider/model/API/credential inputs. Source/config unchanged, host sentinels unchanged, CID stopped/removed. Result SHA-256 0f3747b2316aa27c063fbad7dbb66e0de3e9599d6f5d809e49ec8a79ccaaa626; inventory e7c21a244a599cdf3b5d475e980e1b512278deb2fc53956b601c401add646f2d.

## Review fixes

Независимый read-only review подтвердил, что произвольный workspace мог наложить входной archive на /opt/tibicen или /usr/local. Добавлен safe-root whitelist и regression checks. Root дополнительно исправил duplicate input ancestor и зависание paused Docker attach client: stdio уничтожаются, клиент завершается, close ожидается перед result. Повтор final-source canaries это подтвердил. Ошибочные первоначальные попытки и их receipts сохранены.

## Acceptance limits

Общий `pnpm test` завершился успешно: 626 tests, 626 pass, 0 fail/cancel/skip. Перед ними прошли ESLint, Prettier, core/site typecheck, Astro build и strict active/archived OpenSpec. 10 новых unit checks входят в общий набор.

Общий native profile не включён, live acceptance не заявлена. Контролируемые seeds исключают .codex/.mcp.json; общий project/MCP policy и подключение backend к production caller остаются следующим отдельным изменением. Image Linux/arm64 и host macOS; другие платформы не проверены. Новых коммитов и реальных auth/model/API calls нет.
