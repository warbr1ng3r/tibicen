# Pinned eval executor image

This image is an eval-only Linux executor, not a production-readiness signal. It contains no project, model credentials or host configuration. Building downloads public packages; execution uses no network. No image is published.

## Fixed inputs

`image-lock.json` records the Linux arm64 base manifest digest and the exact official npm archives, with SHA-512 integrity and SHA-256 hashes. The Dockerfile verifies both archive hashes before extracting them, without running npm install hooks.

- Base: official [`node:24.15.0-bookworm-slim`](https://hub.docker.com/_/node), arm64 manifest `sha256:682f301a9e8e5731d4bb1889182a2186fe65a312cc81ae86cea6038ef8b1603f`. The multi-platform index digest is recorded separately.
- Codex: official [`@openai/codex@0.157.0-linux-arm64`](https://registry.npmjs.org/@openai/codex/0.157.0-linux-arm64), the same platform artifact selected by `@openai/codex@0.157.0`'s optional dependency.
- pnpm: official [`pnpm@11.21.0`](https://registry.npmjs.org/pnpm/11.21.0).

Build from the repository root, with the small container directory as the only build context:

```sh
docker pull --platform linux/arm64 docker.io/library/node:24.15.0-bookworm-slim@sha256:682f301a9e8e5731d4bb1889182a2186fe65a312cc81ae86cea6038ef8b1603f
docker build --platform linux/arm64 --provenance=false -t tibicen-eval-codex:0.157.0-arm64-r2 scripts/evals/container
docker image inspect tibicen-eval-codex:0.157.0-arm64-r2 --format '{{.Id}}'
```

Use the immutable ID returned by the daemon's `image inspect`, never the build tag. On the tested Docker Desktop containerd image store, BuildKit's `--iidfile` returned a config digest that the daemon could not resolve; `inspect .Id` returned the usable manifest digest.

The tested daemon image ID is:

```text
sha256:ba23f5c65d7d77b8aaac15fb53cdda90ecd25acff2738fd6d40fc762519dc6bd
```

## Runtime contract

The fixed entrypoint is `/usr/local/bin/node /opt/tibicen/watchdog.mjs`; its sole argument is an integer lifetime of 1–180000 milliseconds. The default is 180000. It always starts `/usr/local/bin/codex exec-server --listen stdio://`, with UID/GID 1000, cleared supplementary groups and a fixed HOME/CODEX_HOME/TMPDIR/PATH/LANG environment. No runtime argument selects a command or supplies executable code.

PID 1 must run as root with only SETUID and SETGID capabilities, no ambient/inheritable capabilities and `no-new-privileges`. The watchdog checks these conditions before starting the executor. The executor and its tools have no permitted/effective/inheritable/ambient capabilities; the remaining bounding set does not grant them capabilities. UID 1000 cannot signal root PID 1 or modify its root-owned code. `no-new-privileges` also prevents gaining privilege through image binaries.

The root filesystem uses a disposable writable overlay. Root ownership and permissions make `/opt` and `/usr/local` immutable to the tool UID; the caller must not overlay these paths. Keeping the overlay allows input transfer before start and bounded result collection after stop. No host path, host home, socket or device is mounted. The caller owns resource limits, private namespaces, explicit Docker environment, CID cleanup and archive validation.

A representative create command is:

```sh
docker create --platform linux/arm64 --pull never \
  --network none --cap-drop ALL --cap-add SETUID --cap-add SETGID \
  --security-opt no-new-privileges \
  --memory 512m --memory-swap 512m --cpus 1 --pids-limit 128 \
  --restart no --interactive \
  sha256:ba23f5c65d7d77b8aaac15fb53cdda90ecd25acff2738fd6d40fc762519dc6bd 180000
```

The caller saves the returned CID, copies a bounded, validated archive into it, then starts with `docker start --attach --interactive CID`. The watchdog starts in `/tmp`; each RPC provides the mirrored absolute workspace cwd. Tool HOME is `/home/runner`, never the host user's home. The image creates an empty `/home/runner/.codex`, owned by UID 1000, so executor configuration reads and its runtime PATH helpers work without host configuration.

For a tar stream whose headers already specify numeric UID/GID 1000, use **plain** `docker cp - CID:/`. The tested `docker cp -a - CID:/` rewrote every header owner to the configured container user 0:0, making the workspace unwritable. Archive headers must also omit macOS xattrs, ACLs and flags; those are unnecessary inputs and may fail on extraction. This is transport preparation, not authorization to pass arbitrary archive entries.

Inspect `Config.OpenStdin`, `Config.AttachStdin` and `Config.StdinOnce` after create. The tested `--interactive` configuration has `true`, `true`, `false` respectively. EOF from `start --attach --interactive` and death of that Docker client both closed the watchdog lease in the real canaries. The independent deadline still applies if the lease remains open. The reusable session library also passes explicit `--attach=stdin/stdout/stderr`; that exact create form was inspected with `StdinOnce=true` and is the value it requires. The manual interactive-only command above and the library create form are separate observed configurations.

The watchdog exits on stdin EOF, executor exit, startup failure, SIGTERM/SIGINT or deadline. Deadline exits with 124. PID 1 exit causes the kernel to kill the namespace, including detached descendants. A host owner must still wait, inspect `Running=false`/`Pid=0`, collect only approved bounded regular files, remove its CID and report any cleanup failure.

## Fresh offline evidence

On 2026-10-26, `.evals-private/container-image-20261026-r1/` retained registry metadata, exact package archives, build log, image IDs, the assert-based canary and detailed RPC evidence. `evidence-r2.json` SHA-256:

```text
208609d9c04ffb8c4da58d6181c7d0ddb60e010e4b01cef9957a2e0cd0d87f00
```

The real image passed:

- `environmentConfig/read` returns the empty executor configuration with `/home/runner/.codex`.
- Native exec-server initialization: executor version 0.157.0, Linux, `/home/runner`, `/tmp`.
- Native `process/start`: Node v24.15.0, pnpm 11.21.0, Codex 0.157.0; UID/GID 1000, groups `[1000]`, zero child permitted/effective/inheritable/ambient capabilities, `NoNewPrivs=1`.
- Tool attempts to stop PID 1 and append to the watchdog: `EPERM` and `EACCES`.
- Pre-start archive transfer with UID/GID 1000 and a successful native write under `/Users/runner/eval`.
- A detached-worker positive control wrote its late marker, proving the oracle works.
- EOF, fixed independent deadline, exec-server child exit and SIGKILL of the attached owner each left the container stopped with PID 0 and no late marker after the worker's horizon.
- Every canary CID was removed; the baseline unrelated container IDs were unchanged.

Run the small repo checks with `node --test tests/evals/container-watchdog.test.ts`. The private `canary-r2.mjs` reproduces the five real-image cases and removes only the CIDs it creates. These checks make zero auth, real-model or provider API calls. Full host tool routing and production/live acceptance remain separate gates.

Revision r1 remains preserved as superseded evidence: image `sha256:686e6cc8ce886874e9b583ca4cf436a1bfd314ab5c441acbf66e41c2d26f67b8`, `evidence.json` SHA-256 `771ccb626c81a36246e67e4151ecd8a23a666f5b33ae0cbacb2c437631b42905`. Its five lifecycle canaries passed, but it omitted the empty Codex home and could not support the full host configuration handshake. Revision r2 adds that directory and ownership; package pins and watchdog code are unchanged. The supported r2 contract uses 512 MiB and 128 PIDs. A separate 256 MiB/64-PID config-read attempt timed out and is not acceptance evidence.
