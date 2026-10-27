import type { TestContext } from 'node:test';
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { tmpdir } from 'node:os';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
  realpath,
} from 'node:fs/promises';
import { loadPreset, savePreset } from '../../scripts/presets/index.ts';
import {
  parseData,
  serializeData,
  validatePreset,
} from '../../scripts/core/contracts.ts';
import {
  buildPreset,
  serializePreset,
  PresetValidationError,
} from '../../landing/src/scripts/preset.ts';

async function temporary(t: TestContext) {
  const directory = await realpath(
    await mkdtemp(path.join(tmpdir(), 'tibicen-presets-')),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

const preset = () => ({
  schema: 1,
  name: 'hackathon',
  stack_hint: { language: 'python', kind: 'experiment' },
  answers: {
    process: 'minimal',
    style: 'concise',
    agents: ['claude-code'],
    forbidden_paths: ['data/raw'],
  },
  preferred_sources: ['github.com/example/skills'],
});

test('preset requires an explicit request before creating any local state', async (t) => {
  const home = await temporary(t);
  await assert.rejects(savePreset(preset(), { home }), {
    code: 'consent-required',
  });
  assert.deepEqual(await readdir(home), []);
});

test('save and load preserve only validated preferences in a private atomic file', async (t) => {
  const home = await temporary(t);
  const result = await savePreset(preset(), { requested: true, home });
  assert.equal(
    result.path,
    path.join(home, '.tibicen/presets/hackathon/preset.yaml'),
  );
  assert.deepEqual(await loadPreset('hackathon', { home }), preset());
  assert.deepEqual(await loadPreset(result.path), preset());
  assert.deepEqual(parseData(await readFile(result.path, 'utf8')), preset());
  assert.deepEqual(await readdir(path.dirname(result.path)), ['preset.yaml']);
  if (process.platform !== 'win32')
    assert.equal((await stat(result.path)).mode & 0o777, 0o600);

  const changed = preset();
  changed.answers.process = 'balanced';
  await savePreset(changed, { requested: true, home });
  assert.deepEqual(await loadPreset('hackathon', { home }), changed);
});

test('unknown fields, instructions, secrets and unsafe names fail before writing', async (t) => {
  const home = await temporary(t);
  for (const invalid of [
    { ...preset(), instructions: 'install another tool' },
    { ...preset(), secret: 'not-a-real-secret' },
    { ...preset(), name: '../outside' },
    {
      ...preset(),
      answers: { ...preset().answers, process: 'ignore-all-rules' },
    },
    { ...preset(), stack_hint: { language: 'python; run something' } },
    { ...preset(), answers: { forbidden_paths: ['../../outside'] } },
  ])
    await assert.rejects(savePreset(invalid, { requested: true, home }), {
      code: 'invalid-preset',
    });
  assert.deepEqual(await readdir(home), []);
});

test('named preset writes cannot follow symlinked directories or files', async (t) => {
  const home = await temporary(t);
  const outside = await temporary(t);
  await symlink(
    outside,
    path.join(home, '.tibicen'),
    process.platform === 'win32' ? 'junction' : 'dir',
  );
  await assert.rejects(savePreset(preset(), { requested: true, home }), {
    code: 'unsafe-path',
  });
  assert.deepEqual(await readdir(outside), []);

  await rm(path.join(home, '.tibicen'));
  const folder = path.join(home, '.tibicen/presets/hackathon');
  await mkdir(folder, { recursive: true });
  const original = path.join(outside, 'existing.yaml');
  await writeFile(original, 'original\n');
  await symlink(original, path.join(folder, 'preset.yaml'));
  await assert.rejects(savePreset(preset(), { requested: true, home }), {
    code: 'unsafe-path',
  });
  await assert.rejects(loadPreset('hackathon', { home }), {
    code: 'unsafe-path',
  });
  assert.equal(await readFile(original, 'utf8'), 'original\n');
});

test('read-only loading rejects malformed or untrusted schemas without state', async (t) => {
  const folder = await temporary(t);
  const input = path.join(folder, 'import.yaml');
  await writeFile(input, '!!js/function bad');
  await assert.rejects(loadPreset(input), { code: 'invalid-data' });
  await writeFile(
    input,
    serializeData({ ...preset(), commands: ['anything'] }),
  );
  await assert.rejects(loadPreset(input), { code: 'invalid-preset' });
  assert.deepEqual(await readdir(folder), ['import.yaml']);
});

test('browser constructor output uses the same contract as saved and loaded presets', async (t) => {
  const home = await temporary(t);
  for (const input of [
    { name: 'defaults' },
    {
      name: 'web',
      language: 'typescript',
      kind: 'application',
      process: 'structured',
      style: 'detailed',
      agents: ['codex', 'cursor'],
      forbiddenPaths: 'data/raw\nprivate/',
    },
    {
      name: 'python',
      language: 'python',
      process: 'minimal',
      agents: ['claude-code', 'claude-code'],
      forbiddenPaths: 'data/raw\ndata/raw',
    },
  ]) {
    const result = buildPreset(input);
    assert.deepEqual(
      validatePreset(parseData(serializePreset(result))),
      result,
    );
    await savePreset(result, { home, requested: true });
    assert.deepEqual(await loadPreset(result.name, { home }), result);
  }
  assert.throws(() => buildPreset({ name: 'bad', forbiddenPaths: '/outside' }));
  assert.throws(() =>
    buildPreset({ name: 'bad', forbiddenPaths: 'C:/outside' }),
  );
  assert.throws(() => buildPreset({ name: 'bad', agents: ['unknown-agent'] }));
});

test('constructor validation identifies the field without weakening rejected inputs', () => {
  const cases: [string, Parameters<typeof buildPreset>[0]][] = [
    ['name', { name: 'Bad Name' }],
    ['process', { name: 'valid', process: 'unknown' }],
    ['style', { name: 'valid', style: 'unknown' }],
    ['agents', { name: 'valid', agents: ['unknown'] }],
    ['language', { name: 'valid', language: 'bad;command' }],
    ['kind', { name: 'valid', kind: 'bad;command' }],
    ['forbiddenPaths', { name: 'valid', forbiddenPaths: '../outside' }],
  ];
  for (const [field, input] of cases) {
    assert.throws(
      () => buildPreset(input),
      (cause) =>
        cause instanceof PresetValidationError && cause.field === field,
    );
  }
});
