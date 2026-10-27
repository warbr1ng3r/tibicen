import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const watchdog = fileURLToPath(
  new URL('../../scripts/evals/container/watchdog.mjs', import.meta.url),
);

test('container watchdog rejects missing, unbounded and command arguments', () => {
  for (const args of [
    [],
    ['0'],
    ['180001'],
    ['9999999'],
    ['-1'],
    ['1.5'],
    ['1e3'],
    [' 100'],
    ['0100'],
    ['100', 'sh'],
  ]) {
    const result = spawnSync(process.execPath, [watchdog, ...args], {
      encoding: 'utf8',
      env: {},
    });
    assert.equal(result.status, 64, JSON.stringify(args));
    assert.match(result.stderr, /expected one deadline/);
  }
});

test('container watchdog refuses valid deadlines outside root PID 1', () => {
  for (const deadline of ['1', '180000']) {
    const result = spawnSync(process.execPath, [watchdog, deadline], {
      encoding: 'utf8',
      env: {},
    });
    assert.equal(result.status, 78);
    assert.match(result.stderr, /requires root PID 1/);
  }
});

test('container build inputs pin the platform, toolchain and package integrity', () => {
  const lock = JSON.parse(
    readFileSync(
      new URL('../../scripts/evals/container/image-lock.json', import.meta.url),
      'utf8',
    ),
  );
  const dockerfile = readFileSync(
    new URL('../../scripts/evals/container/Dockerfile', import.meta.url),
    'utf8',
  );
  assert.equal(lock.platform, 'linux/arm64');
  assert.match(lock.base.reference, /@sha256:[a-f0-9]{64}$/);
  assert(dockerfile.includes(lock.base.reference));
  assert.equal(lock.base.nodeVersion, '24.15.0');
  assert.deepEqual(
    lock.packages.map((item: { version: string }) => item.version),
    ['0.157.0-linux-arm64', '11.21.0'],
  );
  for (const item of lock.packages) {
    assert.equal(new URL(item.url).host, 'registry.npmjs.org');
    assert.match(item.integrity, /^sha512-[a-zA-Z0-9+/]{86}==$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
  }
  assert.deepEqual(lock.executor.args, ['exec-server', '--listen', 'stdio://']);
  assert.equal(lock.executor.uid, 1000);
  assert.equal(lock.executor.gid, 1000);
  assert.equal(lock.executor.maxLifetimeMs, 180000);
});
