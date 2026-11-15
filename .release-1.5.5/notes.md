Tibicen 1.5.5 fixes recovery and maintenance of agent setup.

- Explain missing project-memory connections and how to repair them with a newly approved plan, preserving session history and owner notes.
- Keep owner decisions outside replaceable policy blocks and clarify exact-plan consent and post-setup maintenance without installed Tibicen.
- Bound explicit CLI/config file reads and improve development evaluation error capture and process cleanup.

Compatible patch: no new schema, migration or background update. Back up local skill edits before replacing the installation. Removing Tibicen skills preserves approved project infrastructure.

Verification: local gate: 1,148 passed / 0 failed / 1 existing skip; 110 payload hashes and both standalone self-tests; exact native apply/verify/status/report and fresh memory-use/correction/reuse observations retain assisted-loading and synthetic-consent limits. Native verify was structure-only. Autoload, human usefulness and all-harness compatibility are not claimed.

Source: `963e46102a1b39d6e8a64cb9995a949bc1dcc505`.
Distribution: `6d4baea666fc2885c04ba0fa0fc60dbb8b4e6a74`.

Public [CI](https://github.com/warbr1ng3r/tibicen/actions/runs/43682820067), [six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/43682833497) and full-SHA public installation/update/recovery/removal passed.

Install:
```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/6d4baea666fc2885c04ba0fa0fc60dbb8b4e6a74 -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

Checksums are attached; old releases remain immutable.
