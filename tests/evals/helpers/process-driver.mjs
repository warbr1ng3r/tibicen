import { spawn } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';

const [mode, phase, probes] = process.argv.slice(2);
const emit = (message) => process.stdout.write(JSON.stringify(message) + '\n');
const hang = () => setInterval(() => {}, 1000);
const finish = (status = 'pass', reason) => {
  emit({ kind: 'finished', status, ...(reason ? { reason } : {}) });
  process.stdin.destroy();
};
if (['leaf', 'grandchild'].includes(mode)) {
  writeFileSync(path.join(probes, mode + '.pid'), String(process.pid));
  process.on('SIGTERM', () => {});
  if (mode === 'leaf')
    spawn(process.execPath, [process.argv[1], 'grandchild', phase, probes], {
      stdio: 'inherit',
      env: {},
    });
  setInterval(
    () =>
      writeFileSync(path.join(probes, mode + '.heartbeat'), String(Date.now())),
    15,
  );
} else {
  const messages = createInterface({ input: process.stdin })[
    Symbol.asyncIterator
  ]();
  const first = await messages.next();
  writeFileSync(path.join(probes, phase + '.input.json'), first.value);
  writeFileSync(path.join(probes, phase + '.pid'), String(process.pid));
  if (mode === 'silent') hang();
  else if (mode === 'exit-before') process.exit(7);
  else if (mode === 'auth-before' || (mode === 'auth-task' && phase === 'task'))
    emit({ kind: 'error', reason: 'auth-unavailable' });
  else if (mode === 'bad-before') {
    process.stdout.write('{invalid\n');
    hang();
  } else if (mode === 'empty-exit') process.stdin.destroy();
  else {
    if (mode === 'slow-task' && phase === 'task')
      await new Promise((resolve) => setTimeout(resolve, 250));
    emit({ kind: 'ready' });
    if (mode === 'no-finish') process.stdin.destroy();
    else if (mode === 'duplicate-ready') {
      emit({ kind: 'ready' });
      hang();
    } else if (mode === 'secret-output') {
      process.stderr.write('synthetic-auth-value-123');
      emit({ kind: 'error', reason: 'synthetic-auth-value-123' });
    } else if (mode === 'auth-probe') {
      const probe = spawn(
        process.execPath,
        ['-p', 'JSON.stringify({argv:process.argv,env:process.env})'],
        { env: {}, stdio: ['ignore', 'pipe', 'pipe'] },
      );
      let output = '';
      for await (const chunk of probe.stdout) output += chunk;
      writeFileSync(path.join(probes, phase + '.project.json'), output);
      finish();
    } else if (mode === 'observations' || mode === 'bad-observation') {
      emit({
        kind: 'observation',
        observation: 'usage',
        data: {
          costUsd: null,
          inputTokens: null,
          outputTokens: null,
          ...(mode === 'bad-observation'
            ? { stdout: 'synthetic-raw-value' }
            : {}),
        },
      });
      finish();
    } else if (mode === 'bad-after') {
      process.stdout.write('{invalid\n');
      hang();
    } else if (mode === 'oversized') {
      process.stdout.write('x'.repeat(70 * 1024));
      hang();
    } else if (mode === 'truncated') {
      process.stdout.write('{"kind":');
      process.stdin.destroy();
    } else if (
      mode === 'setup-timeout' ||
      (['task-timeout', 'slow-task'].includes(mode) && phase === 'task')
    )
      hang();
    else if ((mode === 'tree-task' && phase === 'task') || mode === 'orphan') {
      for (const name of ['leaf', 'grandchild'])
        rmSync(path.join(probes, name + '.pid'), { force: true });
      spawn(process.execPath, [process.argv[1], 'leaf', phase, probes], {
        stdio: 'inherit',
        env: {},
      });
      if (mode === 'orphan') {
        const wait = setInterval(() => {
          try {
            readFileSync(path.join(probes, 'grandchild.pid'));
            clearInterval(wait);
            finish();
            process.exit(0);
          } catch {
            // Wait for the grandchild's readiness marker.
          }
        }, 10);
      } else hang();
    } else if (mode === 'reply' || mode === 'clarification') {
      emit({
        kind: 'reply',
        when: mode === 'clarification' ? 'clarification' : 'proposal',
        proposalDigest: 'c'.repeat(64),
      });
      const response = JSON.parse((await messages.next()).value);
      writeFileSync(
        path.join(probes, phase + '.reply.json'),
        JSON.stringify(response),
      );
      if (response.data?.approvedDigest === 'c'.repeat(64)) finish();
      else finish('fail', 'consent-not-granted');
    } else if (mode === 'skip') finish('skip', 'fixture-skipped');
    else if (mode === 'fail' || (mode === 'task-fail' && phase === 'task'))
      finish('fail', 'fixture-failure');
    else if (mode === 'finished-hang') {
      emit({ kind: 'finished', status: 'pass' });
      hang();
    } else if (mode === 'exit-after-pass') {
      finish();
      process.exitCode = 7;
    } else if (mode === 'after-finish') {
      finish();
      emit({ kind: 'ready' });
    } else finish();
  }
}
