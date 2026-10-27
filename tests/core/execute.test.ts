import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import os from 'node:os';
import path from 'node:path';
import { runCommand, validateCommand } from '../../scripts/core/execute.ts';

const command = {
  id: 'test',
  kind: 'test',
  executable: process.execPath,
  argv: ['run.cjs'],
  cwd: '.',
  envNames: [],
  trusted: true,
};
test('commands need exact-plan consent and reject commits, shells and install hooks', async () => {
  await assert.rejects(runCommand(command, { root: '.' }), {
    code: 'consent-required',
  });
  for (const invalid of [
    { executable: 'git', argv: ['commit', '-m', 'x'] },
    { executable: 'sh', argv: ['test.sh'] },
    { executable: 'node', argv: ['-e', 'console.log(1)'] },
    { executable: 'npm', kind: 'install', argv: ['install'] },
  ])
    assert.throws(() => validateCommand({ ...command, ...invalid }));
});

test('execution does not inherit host tokens and redacts explicitly passed secrets', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-command-'));
  try {
    await writeFile(
      path.join(root, 'run.cjs'),
      'console.log(process.env.HOST_TOKEN || "absent"); console.log(process.env.API_TOKEN || "absent")',
    );
    const result = await runCommand(
      { ...command, envNames: ['API_TOKEN'] },
      {
        root,
        approvedDigest: 'a'.repeat(64),
        env: {
          PATH: process.env.PATH,
          HOST_TOKEN: 'must-not-inherit',
          API_TOKEN: 'must-redact',
        },
      },
    );
    assert.equal(result.exitCode, 0);
    assert.equal(result.stdout.trim(), 'absent\n[redacted]');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

for (const trigger of ['timeout', 'leader-exit', 'abort']) {
  test(
    `${trigger} stops descendants that ignore termination and retain stdout`,
    { skip: process.platform === 'win32' },
    async () => {
      const root = await mkdtemp(
        path.join(os.tmpdir(), 'tibicen-process-tree-'),
      );
      let pid: number | undefined;
      const controller = new AbortController();
      try {
        await writeFile(
          path.join(root, 'descendant.cjs'),
          'const fs=require("node:fs");process.on("SIGTERM",()=>{});fs.writeFileSync("pid",String(process.pid));setTimeout(()=>process.exit(0),4000);',
        );
        await writeFile(
          path.join(root, 'run.cjs'),
          'const {spawn}=require("node:child_process");const fs=require("node:fs");spawn(process.execPath,["descendant.cjs"],{stdio:"inherit"});const timer=setInterval(()=>{if(process.argv[2]==="leader-exit"&&fs.existsSync("pid"))process.exit(0);},5);',
        );
        const began = performance.now();
        const pending = runCommand(
          { ...command, argv: ['run.cjs', trigger] },
          {
            root,
            approvedDigest: 'a'.repeat(64),
            timeoutMs: trigger === 'timeout' ? 500 : 6000,
            signal: controller.signal,
          },
        );
        for (let attempt = 0; attempt < 150 && !pid; attempt++) {
          pid =
            Number(
              await readFile(path.join(root, 'pid'), 'utf8').catch(() => ''),
            ) || undefined;
          if (!pid) await delay(10);
        }
        assert.ok(pid, 'The descendant must observably start.');
        if (trigger === 'abort') controller.abort();
        const result = await pending;
        assert(
          performance.now() - began < 3000,
          'Wait must not depend on the descendant closing stdout.',
        );
        for (let attempt = 0; attempt < 50; attempt++) {
          try {
            process.kill(pid, 0);
            await delay(10);
          } catch {
            break;
          }
        }
        assert.throws(() => process.kill(pid!, 0), { code: 'ESRCH' });
        if (trigger === 'timeout') assert.equal(result.timedOut, true);
        if (trigger === 'abort') assert.equal(result.reason, 'aborted');
        if (trigger === 'leader-exit') assert.equal(result.exitCode, 0);
      } finally {
        if (pid)
          try {
            process.kill(pid, 'SIGKILL');
          } catch {
            /* Already reaped. */
          }
        controller.abort();
        await rm(root, { recursive: true, force: true });
      }
    },
  );
}

test('pre-cancelled and unavailable commands never claim a successful launch', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-command-'));
  try {
    await writeFile(
      path.join(root, 'run.cjs'),
      'require("node:fs").writeFileSync("ran","yes");',
    );
    const cancelled = await runCommand(command, {
      root,
      approvedDigest: 'a'.repeat(64),
      signal: AbortSignal.abort(),
    });
    assert.equal(cancelled.reason, 'aborted');
    await assert.rejects(readFile(path.join(root, 'ran')), { code: 'ENOENT' });
    assert.equal(
      (
        await runCommand(
          { ...command, executable: path.join(root, 'missing') },
          { root, approvedDigest: 'a'.repeat(64) },
        )
      ).reason,
      process.platform === 'win32'
        ? 'process-tree-unavailable'
        : 'execution-unavailable',
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
