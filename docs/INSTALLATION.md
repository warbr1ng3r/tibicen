# Install and explicitly load Tibicen

Tibicen provides `tibicen-init` for initial setup and `tibicen-adopt` for improving
existing agent infrastructure. Use them inside a host that can read project
files, read the complete installed skill and run its Node CLI. The host chooses
the model/provider; Tibicen has no separate model account or API key.

This generic entry flow is included in **published 1.4.1**. The commands and
assets below pin that exact distribution. Public mechanical installation,
replacement/repeat, complete edited-backup restoration into actual installed
skill paths and removal passed for the explicit `universal` target. Explicit
reading does not establish native discovery, automatic use or behavior in every
host/model. See the [release scope](RELEASING.md).

## Requirements

- Published 1.4.1 needs Node **≥22.20** for its installed CLI. The normal installer
  also needs Git and one of npm, pnpm or Yarn 2+. The archive route needs neither
  Git nor a package manager, source checkout or development dependencies.
- The host must have access to the target project and the skill's files. It must
  run the required Node operations, or a local operator must run the approved
  commands and return their actual results. A text-only chat can give guidance;
  it cannot inspect unread files or apply changes without local operations.
- Project writes, installations and project commands need approval of the exact
  plan. On Windows, Tibicen cannot launch project build/test/lint commands;
  read-only operations remain available. Do not report an unavailable check as
  passed. Native loading and behavioral checks have their own limits.

## Universal folder installation

Run this in a terminal, independently of your project packages:

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/52c0769574e90d7d1a0438996df9da40621b0107 -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

For pnpm replace only `npx` with `pnpm dlx`; for Yarn 2+ use `yarn dlx`. Keep
`--agent universal`, both skill names, the complete distribution SHA and `--copy`.
The pinned installer places the complete folders at:

```text
~/.agents/skills/tibicen-init/
~/.agents/skills/tibicen-adopt/
```

`~` means your home directory (`$HOME` on macOS/Linux, `$env:USERPROFILE` in
PowerShell). This common folder is an explicit source of skill files; your host
does not have to discover it automatically. Do not omit `--agent` or substitute
`--all`, `*` or an invented agent flag: that changes the installer's target
selection. Use the manual route for another chosen location.

Reinstalling replaces these skill folders. Back up complete folders containing
local edits first, outside the destination. The installer does not update your
project's approved instructions. See [update and removal](#update-and-removal).

## First project session

Open the target project in your host. Send the appropriate ordinary request:

```text
Read ~/.agents/skills/tibicen-init/SKILL.md and follow its instructions.
Set this project up for my coding agent.
```

```text
Read ~/.agents/skills/tibicen-adopt/SKILL.md and follow its instructions.
Check the project instructions and fix what is outdated.
```

Replace `~` with the absolute home path if the host does not expand it. For a
manual installation, substitute the actual chosen directory. If the host only
accepts file attachments, attach the entry file using its documented method and
give it access to the rest of the skill directory. Copying `SKILL.md` alone is
insufficient: referenced instructions and `scripts/tibicen.ts` must remain
available. Resource paths resolve from the installed skill directory, not the
target project's working directory.

Review the proposed files, commands and manual steps before approving them.
Where one common `AGENTS.md` is sufficient, keep that file and the existing
project memory store. In later sessions, explicitly ask the host to read the
approved project `AGENTS.md` when automatic loading is unknown. A missing native
probe does not grant new permissions or turn explicit reading into native
discovery. More details: [portable workflow](HARNESS_PORTABILITY.md).

## Manual archive installation

Choose a **new empty directory** you control, including a path with spaces if
desired. Do not extract over existing skill folders or application files.
Download these assets from the same published release into that directory:

| Asset                                                                                                             | SHA256                                                             |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [tibicen-1.4.1.tar.gz](https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.1/tibicen-1.4.1.tar.gz)       | `c3302cf25284120d009ee7b01c9044cdc0193c8c658597e0f24fe7e65233dcb8` |
| [distribution-SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.1/distribution-SHA256SUMS) | `1ddbe0968918ac22469dbe3c0d8cd8f85c8d23910d2f623451957f804a4238fd` |
| [SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.1/SHA256SUMS)                           | `23c4ccc8243d2936a1e2782922fa17991cc4f8e182047c7d5f78e711e4ee2d6c` |

For example, on macOS/Linux, after changing into your empty chosen directory:

```sh
curl -fLO https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.1/tibicen-1.4.1.tar.gz &&
curl -fLO https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.1/distribution-SHA256SUMS &&
curl -fLO https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.1/SHA256SUMS &&
shasum -a 256 SHA256SUMS
```

Check that the last digest equals the table before using the manifest. Then
verify both downloaded files, unpack and verify every payload file:

```sh
shasum -a 256 -c SHA256SUMS &&
mkdir unpacked &&
tar -xzf tibicen-1.4.1.tar.gz -C unpacked &&
cd unpacked &&
cmp ../distribution-SHA256SUMS SHA256SUMS &&
shasum -a 256 -c SHA256SUMS
```

On Linux, `sha256sum` can replace `shasum -a 256`. Stop on any failed download,
digest mismatch or extraction error; do not continue to loading. These hashes
check the published bytes, not a signature or host compatibility.

On Windows, download the same three linked assets into your chosen empty folder.
In PowerShell, first run `Get-FileHash .\SHA256SUMS -Algorithm SHA256` and compare
the digest to the table. Then verify the two entries, unpack and verify the
payload (stop immediately if a command reports an error):

```powershell
$ErrorActionPreference = 'Stop'
Get-Content .\SHA256SUMS | ForEach-Object {
  $expected, $relative = $_ -split '  ', 2
  if ((Get-FileHash -LiteralPath $relative -Algorithm SHA256).Hash.ToLower() -ne $expected) { throw "Checksum mismatch: $relative" }
}
New-Item -ItemType Directory unpacked
tar -xzf tibicen-1.4.1.tar.gz -C unpacked
if ($LASTEXITCODE -ne 0) { throw 'Archive extraction failed' }
if ((Get-FileHash .\distribution-SHA256SUMS).Hash -ne (Get-FileHash .\unpacked\SHA256SUMS).Hash) { throw 'Payload manifest mismatch' }
Set-Location unpacked
Get-Content .\SHA256SUMS | ForEach-Object {
  $expected, $relative = $_ -split '  ', 2
  if ((Get-FileHash -LiteralPath $relative -Algorithm SHA256).Hash.ToLower() -ne $expected) { throw "Checksum mismatch: $relative" }
}
```

The unpacked directory contains `tibicen-init/`, `tibicen-adopt/` and
`SHA256SUMS`. Keep **both complete skill folders**, including each `SKILL.md`,
`scripts/`, `references/`, `package.json` and `LICENSE`. You can leave them here
or copy both entire folders to another chosen location. If your host documents a
native destination, follow its documentation; this guide does not guess one.

For a directory `/Users/me/Tibicen 1.4.1/unpacked`, the explicit entry files are:

```text
/Users/me/Tibicen 1.4.1/unpacked/tibicen-init/SKILL.md
/Users/me/Tibicen 1.4.1/unpacked/tibicen-adopt/SKILL.md
```

Substitute those actual paths in the [first-session requests](#first-project-session).
For Windows, use your actual path, for example
`C:\Users\me\Tibicen 1.4.1\unpacked\tibicen-init\SKILL.md`. When invoking the
CLI from a terminal, quote paths containing spaces:

```sh
node "/Users/me/Tibicen 1.4.1/unpacked/tibicen-init/scripts/tibicen.ts" self-test
node "/Users/me/Tibicen 1.4.1/unpacked/tibicen-adopt/scripts/tibicen.ts" self-test
```

These local self-tests check the installed kernel/resources. They do not prove
that a host/model loaded the skill or completed a project task.

## Update and removal

There is no background updater. Back up each complete installed skill folder
before replacing it with an explicitly selected release. To restore local edits,
remove the replacement folder and copy its corresponding complete backup back to
the same skills root. Preserve sibling skills and any unrelated host settings.

To remove a universal installation, delete only the two installed folders
`~/.agents/skills/tibicen-init` and `~/.agents/skills/tibicen-adopt`. For a manual
installation, remove those two folders from your chosen location. Keep any other
files there. Removing a skill does not undo project instructions, state or memory;
changes to those remain a separate reviewed project operation.

See [building from source](../README.md#build-and-install-from-source) for the
separate development route. Do not install from the unbuilt repository root.
