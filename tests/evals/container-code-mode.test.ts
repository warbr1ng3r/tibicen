import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chmod,
  lstat,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { hashContent } from '../../scripts/core/contracts.ts';
import {
  stageContainerCodeMode,
  linuxCodeModeHost,
} from '../../scripts/evals/container/code-mode.ts';

test('companion wrapper pins one owned CID, UID and cleared environments without host fallback', async (t) => {
  const root = await realpath(await mkdtemp('/tmp/tibicen-code-mode-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const binary = path.join(root, 'source-codex');
  await writeFile(binary, 'trusted binary fixture');
  const cid = 'a'.repeat(64);
  const stage = await stageContainerCodeMode(
    binary,
    hashContent(await readFile(binary)),
    cid,
  );
  t.after(() => stage.dispose());
  await stage.validate();
  assert((await readFile(stage.executable)).equals(await readFile(binary)));
  assert.equal((await lstat(stage.executable)).isSymbolicLink(), false);
  const wrapper = await readFile(stage.wrapper, 'utf8');
  assert(
    wrapper.includes(
      'env -i PATH=/usr/bin:/bin DOCKER_HOST=unix:///var/run/docker.sock DOCKER_CONFIG=/nonexistent-tibicen-config',
    ),
  );
  assert(
    wrapper.includes(
      'docker exec --interactive --user 1000:1000 --workdir /tmp ' + cid,
    ),
  );
  assert(wrapper.endsWith(linuxCodeModeHost + '\n'));
  assert(!wrapper.includes(binary));
  assert(!wrapper.includes('$@'));
  await stage.dispose();
  await assert.rejects(lstat(stage.executable), { code: 'ENOENT' });
  assert.equal(await readFile(binary, 'utf8'), 'trusted binary fixture');
});

test('unsafe CID, wrong source hash, missing or replaced companion fails closed', async (t) => {
  const root = await realpath(await mkdtemp('/tmp/tibicen-code-mode-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const binary = path.join(root, 'source-codex');
  await writeFile(binary, 'trusted binary fixture');
  const hash = hashContent(await readFile(binary));
  await assert.rejects(
    stageContainerCodeMode(binary, hash, 'a'.repeat(64) + ' --privileged'),
  );
  await assert.rejects(
    stageContainerCodeMode(binary, '0'.repeat(64), 'a'.repeat(64)),
  );
  const stage = await stageContainerCodeMode(binary, hash, 'a'.repeat(64));
  t.after(() => stage.dispose());
  await chmod(stage.wrapper, 0o700);
  await writeFile(stage.wrapper, '#!/bin/sh\nexit 0\n');
  await chmod(stage.wrapper, 0o500);
  await assert.rejects(stage.validate());
  await rm(stage.wrapper);
  await assert.rejects(stage.validate());
  await symlink(binary, stage.wrapper);
  await assert.rejects(stage.validate());
});
