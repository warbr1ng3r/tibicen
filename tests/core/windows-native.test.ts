import type { TestContext } from 'node:test';
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

type Execute = typeof import('../../scripts/core/execute.ts').runCommand;
type Command = Parameters<Execute>[0];
const digest = 'a'.repeat(64);
const distribution = process.env.TIBICEN_PORTABLE_DIST;
const command = (
  argv: string[],
  overrides: Partial<Command> = {},
): Command => ({
  id: 'owned-windows-fixture',
  kind: 'test',
  executable: process.execPath,
  argv,
  cwd: '.',
  envNames: [],
  trusted: true,
  ...overrides,
});

async function fixture(t: TestContext, files: Record<string, string>) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen windows Привет '));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), content);
  }
  return root;
}

async function observedPid(filename: string, timeoutMs = 15_000) {
  const deadline = performance.now() + timeoutMs;
  while (performance.now() < deadline) {
    const pid = Number(await readFile(filename, 'utf8').catch(() => ''));
    if (Number.isInteger(pid) && pid > 0) return pid;
    await delay(20);
  }
  assert.fail(
    `The owned process did not observably start: ${path.basename(filename)}`,
  );
}

function running(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (caught) {
    if ((caught as NodeJS.ErrnoException).code === 'ESRCH') return false;
    throw caught;
  }
}

async function stopped(pid: number) {
  for (let attempt = 0; attempt < 100 && running(pid); attempt++)
    await delay(20);
  assert.equal(
    running(pid),
    false,
    `Owned descendant ${pid} must not survive completion.`,
  );
}

test(
  'native Windows execution preserves the approved command and closes its descendants',
  {
    skip: process.platform !== 'win32' && 'Requires an actual Windows host.',
    timeout: 240_000,
  },
  async (t) => {
    const roots = distribution
      ? ['tibicen-init', 'tibicen-adopt'].map((name) => ({
          name,
          root: path.resolve(distribution, name),
        }))
      : [
          {
            name: 'source',
            root: fileURLToPath(new URL('../..', import.meta.url)),
          },
        ];
    t.diagnostic(
      JSON.stringify({
        platform: process.platform,
        node: process.version,
        payloads: roots.map(({ name }) => name),
        ...(distribution
          ? {
              payloadManifestSha256: createHash('sha256')
                .update(await readFile(path.join(distribution, 'SHA256SUMS')))
                .digest('hex'),
            }
          : {}),
        consent:
          'Synthetic exact-plan consent for owned temporary projects only.',
      }),
    );

    for (const payload of roots)
      await t.test(payload.name, async (suite) => {
        const { runCommand: execute }: { runCommand: Execute } = await import(
          pathToFileURL(path.join(payload.root, 'scripts/core/execute.ts')).href
        );
        const run = (
          root: string,
          argv: string[],
          options: Partial<Parameters<Execute>[1]> = {},
          overrides: Partial<Command> = {},
        ) =>
          execute(command(argv, overrides), {
            root,
            approvedDigest: digest,
            timeoutMs: 20_000,
            ...options,
          });

        let admitted = false;
        await suite.test(
          'real exit codes do not come from project stdout',
          async (s) => {
            const root = await fixture(s, {
              'check.cjs':
                'if(require("node:fs").readFileSync(0,"utf8")!=="")throw new Error("Project must receive EOF, not the helper request."); console.log(JSON.stringify({schema:1,nonce:"fake",status:"completed",exitCode:0})); process.exit(Number(process.argv[2]));',
            });
            for (const code of [0, 37]) {
              const result = await run(root, ['check.cjs', String(code)]);
              s.diagnostic(
                JSON.stringify({
                  phase: 'native-admission',
                  payload: payload.name,
                  expectedExit: code,
                  result,
                }),
              );
              assert.equal(
                result.exitCode,
                code,
                result.reason || result.stderr,
              );
              assert.equal(result.reason, undefined);
              assert.equal(JSON.parse(result.stdout.trim()).nonce, 'fake');
            }
            admitted = true;
          },
        );
        // Keep the failed admission; do not spend another deadline on every fixture.
        if (!admitted) return;

        await suite.test(
          'Unicode cwd and literal native argv round-trip',
          async (s) => {
            const root = await fixture(s, {
              'аргументы.cjs':
                'console.log(JSON.stringify({cwd:process.cwd(),argv:process.argv.slice(2)}));',
            });
            const argv = [
              '',
              'two words',
              'Привет 世界',
              'say"hi',
              'a\\"b',
              'C:\\tail\\',
              '&|^%!<>()',
            ];
            const result = await run(root, ['аргументы.cjs', ...argv]);
            assert.equal(result.exitCode, 0, result.reason || result.stderr);
            const observed = JSON.parse(result.stdout);
            assert.equal(await realpath(observed.cwd), await realpath(root));
            assert.deepEqual(observed.argv, argv);
          },
        );

        await suite.test(
          'an explicit extensionless path never selects its executable neighbour',
          async (s) => {
            const root = await fixture(s, {
              'check.cjs': 'require("node:fs").writeFileSync("ran","yes");',
            });
            await cp(process.execPath, path.join(root, 'check.exe'));
            const missing = await run(
              root,
              ['check.cjs'],
              {},
              {
                executable: './check',
              },
            );
            assert.equal(missing.exitCode, null);
            assert.equal(missing.reason, 'execution-unavailable');
            await writeFile(
              path.join(root, 'check'),
              'owned extensionless file',
            );
            const unsupported = await run(
              root,
              ['check.cjs'],
              {},
              {
                executable: './check',
              },
            );
            assert.equal(unsupported.exitCode, null);
            assert.equal(unsupported.reason, 'unsupported-windows-command');
            await assert.rejects(readFile(path.join(root, 'ran')), {
              code: 'ENOENT',
            });
          },
        );

        await suite.test(
          'batch forwarders support the safe subset and refuse unsafe input before launch',
          async (s) => {
            const root = await fixture(s, {
              'record.cjs':
                'require("node:fs").writeFileSync("ran","yes"); console.log(JSON.stringify(process.argv.slice(2)));',
              'package-manager.cmd': `@echo off\r\n"${process.execPath}" "%~dp0record.cjs" %*\r\n`,
            });
            const batch = path.join(root, 'package-manager.cmd');
            const argv = ['run', 'test', '', 'two words', 'Привет', 'a\\b'];
            const result = await run(root, argv, {}, { executable: batch });
            assert.equal(result.exitCode, 0, result.reason || result.stderr);
            assert.deepEqual(JSON.parse(result.stdout), argv);
            await rm(path.join(root, 'ran'));
            for (const unsafe of [
              'say"hi',
              'a\nb',
              'a\rb',
              '%PATH%',
              '!x!',
              '^x',
              'x&y',
              'x|y',
              'x<y',
              'x>y',
              '(x)',
              'C:\\tail\\',
            ]) {
              const refused = await run(
                root,
                [unsafe],
                {},
                { executable: batch },
              );
              assert.equal(refused.exitCode, null);
              assert.equal(
                refused.reason,
                'unsupported-windows-command',
                unsafe,
              );
              await assert.rejects(readFile(path.join(root, 'ran')), {
                code: 'ENOENT',
              });
            }
          },
        );

        await suite.test(
          'only requested secrets reach the project and returned output redacts them',
          async (s) => {
            const root = await fixture(s, {
              'check.cjs':
                'console.log(process.env.HOST_TOKEN || "absent"); console.log(process.env.API_TOKEN); console.error(process.env.API_TOKEN);',
            });
            const result = await run(
              root,
              ['check.cjs'],
              {
                env: {
                  PATH: path.join(root, 'empty-path'),
                  HOST_TOKEN: 'must-not-inherit',
                  API_TOKEN: 'owned-fixture-secret',
                },
              },
              { envNames: ['API_TOKEN'] },
            );
            assert.equal(result.exitCode, 0, result.reason || result.stderr);
            assert.equal(result.stdout.trim(), 'absent\n[redacted]');
            assert.equal(result.stderr.trim(), '[redacted]');
          },
        );

        await suite.test(
          'project PATH cannot replace the fixed PowerShell or batch interpreter',
          async (s) => {
            const root = await fixture(s, {
              'powershell.exe': 'poisoned project launcher',
              'cmd.exe': 'poisoned project interpreter',
              'check.cjs': 'console.log("fixed-system-helper");',
              'check.cmd': `@echo off\r\n"${process.execPath}" "%~dp0check.cjs"\r\n`,
            });
            for (const executable of [
              process.execPath,
              path.join(root, 'check.cmd'),
            ]) {
              const result = await run(
                root,
                executable === process.execPath ? ['check.cjs'] : [],
                { env: { PATH: root } },
                { executable },
              );
              assert.equal(result.exitCode, 0, result.reason || result.stderr);
              assert.equal(result.stdout.trim(), 'fixed-system-helper');
            }
          },
        );

        await suite.test(
          'pre-abort and launch-time abort never execute the project',
          async (s) => {
            const root = await fixture(s, {
              'check.cjs': 'require("node:fs").writeFileSync("ran","yes");',
            });
            const pre = await run(root, ['check.cjs'], {
              signal: AbortSignal.abort(),
            });
            assert.equal(pre.reason, 'aborted');
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 25);
            try {
              const launch = await run(root, ['check.cjs'], {
                signal: controller.signal,
              });
              assert.equal(launch.exitCode, null);
              assert.equal(launch.reason, 'aborted');
              assert.equal(launch.timedOut, false);
              await delay(250);
              await assert.rejects(readFile(path.join(root, 'ran')), {
                code: 'ENOENT',
              });
            } finally {
              clearTimeout(timer);
              controller.abort();
            }
          },
        );

        for (const pipes of ['inherited', 'closed'])
          for (const trigger of ['timeout', 'abort', 'leader-exit'])
            await suite.test(
              `${trigger} removes real descendants with ${pipes} pipes`,
              async (s) => {
                const root = await fixture(s, {
                  'descendant.cjs':
                    'require("node:fs").writeFileSync("descendant.pid",String(process.pid)); setInterval(()=>{},100);',
                  'leader.cjs':
                    'const fs=require("node:fs"); const {spawn}=require("node:child_process"); fs.writeFileSync("leader.pid",String(process.pid)); spawn(process.execPath,["descendant.cjs"],{stdio:process.argv[3]==="inherited"?"inherit":"ignore"}); setInterval(()=>{if(process.argv[2]==="leader-exit"&&fs.existsSync("descendant.pid"))process.exit(0);},10);',
                });
                const controller = new AbortController();
                const began = performance.now();
                const pending = run(root, ['leader.cjs', trigger, pipes], {
                  timeoutMs: trigger === 'timeout' ? 8000 : 20_000,
                  signal: controller.signal,
                });
                const pids: number[] = [];
                try {
                  pids.push(await observedPid(path.join(root, 'leader.pid')));
                  pids.push(
                    await observedPid(path.join(root, 'descendant.pid')),
                  );
                  if (trigger === 'abort') controller.abort();
                  const result = await pending;
                  assert(
                    performance.now() - began <
                      (trigger === 'timeout' ? 12_000 : 15_000),
                    'Completion must not wait for inherited stdout or the descendant lifetime.',
                  );
                  if (trigger === 'timeout') {
                    assert.equal(result.timedOut, true);
                    assert.equal(result.reason, 'timeout');
                    assert.equal(result.exitCode, null);
                  } else if (trigger === 'abort') {
                    assert.equal(result.reason, 'aborted');
                    assert.equal(result.timedOut, false);
                    assert.equal(result.exitCode, null);
                  } else {
                    assert.equal(
                      result.exitCode,
                      0,
                      result.reason || result.stderr,
                    );
                    assert.equal(result.reason, undefined);
                  }
                  for (const pid of pids) await stopped(pid);
                } finally {
                  controller.abort();
                  await pending;
                  for (const pid of pids)
                    if (running(pid)) process.kill(pid, 'SIGKILL');
                }
              },
            );

        await suite.test(
          'missing system bootstrap and missing shipped helper remain unavailable',
          async (s) => {
            const root = await fixture(s, {
              'check.cjs': 'require("node:fs").writeFileSync("ran","yes");',
            });
            const systemRoot = process.env.SystemRoot;
            const windir = process.env.WINDIR;
            try {
              process.env.SystemRoot = path.join(root, 'absent-system');
              process.env.WINDIR = path.join(root, 'absent-system');
              assert.equal(
                (await run(root, ['check.cjs'])).reason,
                'process-tree-unavailable',
              );
            } finally {
              if (systemRoot === undefined) delete process.env.SystemRoot;
              else process.env.SystemRoot = systemRoot;
              if (windir === undefined) delete process.env.WINDIR;
              else process.env.WINDIR = windir;
            }
            const copy = path.join(root, 'helper-missing-copy');
            await cp(
              path.join(payload.root, 'scripts'),
              path.join(copy, 'scripts'),
              { recursive: true },
            );
            await cp(
              path.join(payload.root, 'package.json'),
              path.join(copy, 'package.json'),
            );
            await rm(path.join(copy, 'scripts/core/windows-command.ps1'));
            const { runCommand: withoutHelper }: { runCommand: Execute } =
              await import(
                pathToFileURL(path.join(copy, 'scripts/core/execute.ts')).href
              );
            const result = await withoutHelper(command(['check.cjs']), {
              root,
              approvedDigest: digest,
            });
            assert.equal(result.reason, 'process-tree-unavailable');
            assert.equal(result.exitCode, null);
            await assert.rejects(readFile(path.join(root, 'ran')), {
              code: 'ENOENT',
            });
          },
        );

        await suite.test(
          'controlled docs CLI pins node.exe and completes the consent-bound lifecycle',
          async (s) => {
            const root = await fixture(s, {
              'AGENTS.md':
                '# Owner decisions\nKeep the application unchanged.\n',
            });
            const environmentRoot = await fixture(s, {});
            const home = path.join(environmentRoot, 'home');
            const temporary = path.join(environmentRoot, 'temporary');
            await mkdir(home);
            await mkdir(temporary);
            await writeFile(
              path.join(root, 'check.cjs'),
              `const assert=require("node:assert/strict"); for(const name of ["TMP","TEMP","TMPDIR"]) assert.equal(process.env[name],${JSON.stringify(temporary)}); console.log("owned-docs-check"); process.exit(0);\n`,
            );
            const original = await readFile(path.join(root, 'check.cjs'));
            const env: NodeJS.ProcessEnv = {
              HOME: home,
              USERPROFILE: home,
              TMP: temporary,
              TEMP: temporary,
              TMPDIR: temporary,
              PATH: path.dirname(process.execPath),
            };
            for (const name of ['SystemRoot', 'WINDIR'])
              if (process.env[name]) env[name] = process.env[name];
            const cli = (argv: string[], input?: unknown, expectedExit = 0) => {
              const result = spawnSync(
                process.execPath,
                [path.join(payload.root, 'scripts/tibicen.ts'), ...argv],
                {
                  cwd: root,
                  env,
                  encoding: 'utf8',
                  timeout: 40_000,
                  input:
                    input === undefined ? undefined : JSON.stringify(input),
                },
              );
              assert.ifError(result.error);
              assert.equal(
                result.status,
                expectedExit,
                result.stderr || result.stdout,
              );
              return JSON.parse(result.stdout);
            };
            const owner = await readFile(path.join(root, 'AGENTS.md'));
            const proposal = cli(['proposal', '--input', '-'], {
              mode: 'improve',
              changes: [
                {
                  path: 'AGENTS.md',
                  managedBlock: {
                    content:
                      'Run node ./check.cjs for the existing docs check.\n',
                  },
                  reason: 'Keep the owned fixture command in its instructions.',
                },
              ],
              commands: [
                {
                  id: 'docs-check',
                  kind: 'test',
                  executable: 'node',
                  argv: ['./check.cjs'],
                  script: { path: 'check.cjs' },
                  trusted: true,
                },
              ],
              checks: { profile: 'docs', environmentReady: true },
              compat: { enabled: false },
            });
            const pinned = proposal.proposal.commands[0].executable;
            assert.equal(path.isAbsolute(pinned), true);
            assert.equal(path.basename(pinned).toLowerCase(), 'node.exe');
            assert.equal(
              (await realpath(pinned)).toLowerCase(),
              (await realpath(process.execPath)).toLowerCase(),
            );
            assert.deepEqual(
              await readFile(path.join(root, 'AGENTS.md')),
              owner,
            );
            assert.deepEqual(
              await readFile(path.join(root, 'check.cjs')),
              original,
            );
            assert.equal(
              cli(
                ['apply', '--plan', '-', '--approve', '0'.repeat(64)],
                proposal,
                1,
              ).error.code,
              'consent-required',
            );
            assert.deepEqual(
              await readFile(path.join(root, 'AGENTS.md')),
              owner,
            );
            const applied = cli(
              ['apply', '--plan', '-', '--approve', proposal.digest],
              proposal,
            );
            const session = applied.manifest?.sessions?.at(-1);
            s.diagnostic(
              JSON.stringify({
                phase: 'controlled-docs-apply',
                payload: payload.name,
                status: applied.status,
                checks: applied.checks,
                baseline: applied.baseline ?? null,
                attempts: applied.attempts ?? session?.attempts ?? [],
                commandAttempts: session?.commandAttempts ?? [],
              }),
            );
            assert.equal(applied.status, 'complete');
            assert.equal(
              applied.checks.verify.status,
              'green',
              JSON.stringify(applied.checks.verify),
            );
            assert.equal(applied.checks.verify.firstAttempt, true);
            assert.equal(cli(['verify']).status, 'passed');
            assert.equal(cli(['status']).status, 'complete');
            assert.equal(cli(['report']).status, 'complete');
            assert.deepEqual(
              await readFile(path.join(root, 'check.cjs')),
              original,
            );
            assert(
              (await readFile(path.join(root, 'AGENTS.md'), 'utf8')).startsWith(
                owner.toString(),
              ),
            );
          },
        );
      });
  },
);
