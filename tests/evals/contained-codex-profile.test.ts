import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import {
  containedCodexImage,
  inspectContainedCodexProfile,
  inspectTrustedContainedCodexFixture,
} from '../../scripts/evals/profiles/codex/contained.ts';
import type { ContainedCodexProfileInput } from '../../scripts/evals/profiles/codex/contained.ts';

const sourcePaths = [
  'scripts/core/contracts.ts',
  'scripts/evals/contracts.ts',
  'scripts/evals/process-supervisor.ts',
  'scripts/evals/native-runner.ts',
  'scripts/evals/container/session.ts',
  'scripts/evals/container/archive.ts',
  'scripts/evals/container/owner.ts',
  'scripts/evals/container/bridge.mjs',
  'scripts/evals/container/codex-config.ts',
  'scripts/evals/container/code-mode.ts',
  'scripts/evals/container/codex-code-mode-model.json',
  'scripts/evals/container/subscription.ts',
  'scripts/evals/container/codex-model.json',
  'scripts/evals/container/watchdog.mjs',
  'scripts/evals/container/image-lock.json',
  'scripts/evals/container/Dockerfile',
  'scripts/evals/profiles/codex/preflight.ts',
  'scripts/evals/profiles/codex/profile.ts',
  'scripts/evals/profiles/codex/contained.ts',
  'scripts/evals/contained-codex.ts',
];
const hash = (value: Buffer | string) =>
  createHash('sha256').update(value).digest('hex');

async function fixture(t: { after(fn: () => Promise<void>): void }) {
  const scope = await realpath(
    await mkdtemp('/tmp/tibicen-contained-profile-'),
  );
  t.after(() => rm(scope, { recursive: true, force: true }));
  const repository = path.join(scope, 'repo');
  for (const name of sourcePaths) {
    const filename = path.join(repository, name);
    await mkdir(path.dirname(filename), { recursive: true });
    // The runner is source metadata here; this fixture never starts it.
    await writeFile(
      filename,
      name === 'scripts/evals/contained-codex.ts'
        ? '// Offline runner fixture.\n'
        : await readFile(new URL('../../' + name, import.meta.url)),
    );
  }
  const workspace = path.join(scope, 'project'),
    binary = path.join(scope, 'codex');
  await mkdir(workspace);
  await writeFile(binary, 'Metadata fixture; never execute.\n', {
    mode: 0o755,
  });
  const module = (await import(
    pathToFileURL(
      path.join(repository, 'scripts/evals/profiles/codex/contained.ts'),
    ).href
  )) as typeof import('../../scripts/evals/profiles/codex/contained.ts');
  const input: ContainedCodexProfileInput = {
    binary,
    binaryHash: hash(await readFile(binary)),
    imageId: containedCodexImage,
    workspace,
    files: { 'AGENTS.md': Buffer.from('trusted fixture\n') },
    resultPaths: ['AGENTS.md', 'result.txt'],
    deadlineMs: 10000,
    model: 'gpt-6-sol',
  };
  const observed: {
    executable: string;
    argv: string[];
    cwd: string;
    env: NodeJS.ProcessEnv;
  }[] = [];
  const facts = {
    preferences: [false, false],
    preferencesStatus: 0 as number | null,
    version: 'codex-cli 0.157.0\n',
    status: 0 as number | null,
    image: {
      Id: containedCodexImage,
      Os: 'linux',
      Architecture: 'arm64',
      Config: {
        User: '0:0',
        Entrypoint: ['/usr/local/bin/node', '/opt/tibicen/watchdog.mjs'],
      },
    },
  };
  const command: Parameters<
    typeof inspectTrustedContainedCodexFixture
  >[1] = async (executable, argv, options) => {
    observed.push({ executable, argv, ...options });
    if (executable === '/usr/bin/osascript')
      return {
        status: facts.preferencesStatus,
        bytes: Buffer.from(JSON.stringify(facts.preferences)),
      };
    if (executable === binary) {
      assert.deepEqual(await readdir(options.cwd), []);
      return { status: 0, bytes: Buffer.from(facts.version) };
    }
    assert.equal(executable, '/usr/local/bin/docker');
    return {
      status: facts.status,
      bytes: Buffer.from(JSON.stringify(facts.image)),
    };
  };
  return { scope, repository, module, input, observed, facts, command };
}

test('contained profile rejects unsupported inputs before any metadata executable', async () => {
  const input: ContainedCodexProfileInput = {
    binary: '/nonexistent/do-not-execute',
    binaryHash: 'a'.repeat(64),
    imageId: containedCodexImage,
    workspace: '/tmp/does-not-need-to-exist',
    files: { 'AGENTS.md': Buffer.from('fixture') },
    resultPaths: ['result.txt'],
    deadlineMs: 10000,
    model: 'gpt-6-sol',
  };
  const invalid: Partial<ContainedCodexProfileInput>[] = [
    { imageId: 'node:latest' },
    { imageId: 'sha256:' + 'a'.repeat(64) },
    { workspace: '/opt/overlaid' },
    { deadlineMs: 999 },
    { deadlineMs: 180001 },
    { files: {} },
    { files: { '../escape': Buffer.from('bad') } },
    { files: { '.codex/config.toml': Buffer.from('bad') } },
    { files: { 'nested/.codex/config.toml': Buffer.from('bad') } },
    { files: { '.mcp.json': Buffer.from('bad') } },
    ...[[], ['../escape'], ['/absolute'], ['a', 'a'], ['.mcp.json']].map(
      (resultPaths) => ({ resultPaths }),
    ),
    { binaryHash: 'unfrozen' },
    { binary: 'codex' },
    { model: '--other' },
  ];
  for (const extra of invalid)
    await assert.rejects(inspectContainedCodexProfile({ ...input, ...extra }));
});

test('metadata profile freezes exact sources and scope without a ready/auth claim', async (t) => {
  const f = await fixture(t);
  const profile = await f.module.inspectTrustedContainedCodexFixture(
    f.input,
    f.command,
  );
  assert.equal(profile.specification.auth, 'none');
  assert.equal(profile.specification.paid, false);
  assert.equal(profile.specification.model, 'gpt-6-sol');
  assert.equal(profile.specification.version, '0.157.0');
  assert(!('state' in profile));
  assert(!('preflight' in profile));
  assert(Object.isFrozen(profile));
  assert(Object.isFrozen(profile.specification));
  assert(Object.isFrozen(profile.resultPaths));
  assert(Object.isFrozen(profile.sourceHashes));
  assert.deepEqual(Object.keys(profile.sourceHashes), sourcePaths);
  assert.throws(() => {
    (profile.resultPaths as string[]).push('unapproved.txt');
  });
  f.input.resultPaths.push('other.txt');
  assert.deepEqual(profile.resultPaths, ['AGENTS.md', 'result.txt']);
  const executables = f.observed.filter(
    (entry) => entry.executable !== '/usr/bin/osascript',
  );
  assert.deepEqual(
    executables.map((entry) => entry.argv),
    [
      ['--version'],
      ['image', 'inspect', containedCodexImage, '--format', '{{json .}}'],
    ],
  );
  const version = executables[0];
  assert.deepEqual(version.env, {
    PATH: '/usr/bin:/bin',
    HOME: version.cwd,
    CODEX_HOME: path.join(version.cwd, '.codex'),
    TMPDIR: version.cwd,
    DO_NOT_TRACK: '1',
    CI: '1',
  });
  await assert.rejects(lstat(version.cwd), { code: 'ENOENT' });
  assert.deepEqual(executables[1].env, {
    PATH: '/usr/bin:/bin',
    DOCKER_HOST: 'unix:///var/run/docker.sock',
    DOCKER_CONFIG: '/nonexistent-tibicen-config',
  });
  await profile.validate();
  await profile.validate();
  assert.equal(
    f.observed.filter((entry) => entry.executable === '/usr/local/bin/docker')
      .length,
    3,
  );
  if (process.platform === 'darwin') {
    const preferences = f.observed.filter(
      (entry) => entry.executable === '/usr/bin/osascript',
    );
    assert.equal(preferences.length, 3);
    assert.deepEqual(preferences[0].env, { PATH: '/usr/bin:/bin' });
    assert.deepEqual(preferences[0].argv.slice(0, 3), [
      '-l',
      'JavaScript',
      '-e',
    ]);
    assert(preferences[0].argv[3].includes('CFPreferencesAppValueIsForced'));
  }
});

test('host project configuration and links fail before version or Docker', async (t) => {
  const f = await fixture(t);
  for (const name of ['.codex', '.mcp.json']) {
    const filename = path.join(f.input.workspace, name);
    await symlink('/nonexistent/config', filename);
    await assert.rejects(
      f.module.inspectTrustedContainedCodexFixture(f.input, f.command),
      /unsupported-container-project-config/,
    );
    await rm(filename);
  }
  assert.equal(f.observed.length, 0);
});

test('an unfrozen binary and unsupported version fail before image inspection', async (t) => {
  const f = await fixture(t);
  f.input.binaryHash = 'b'.repeat(64);
  await assert.rejects(
    f.module.inspectTrustedContainedCodexFixture(f.input, f.command),
    /contained-codex-binary-changed/,
  );
  assert.equal(f.observed.length, 0);
  f.input.binaryHash = hash(await readFile(f.input.binary));
  f.facts.version = 'codex-cli 0.158.0\n';
  await assert.rejects(
    f.module.inspectTrustedContainedCodexFixture(f.input, f.command),
    /unsupported-contained-codex-version/,
  );
  assert.equal(
    f.observed.filter((entry) => entry.executable === f.input.binary).length,
    1,
  );
});

test(
  'forced managed preferences and unavailable metadata helper fail closed',
  { skip: process.platform !== 'darwin' },
  async (t) => {
    const f = await fixture(t);
    f.facts.preferences = [true, false];
    await assert.rejects(
      f.module.inspectTrustedContainedCodexFixture(f.input, f.command),
      /unsupported-contained-codex-managed-config/,
    );
    f.facts.preferences = [false, true];
    await assert.rejects(
      f.module.inspectTrustedContainedCodexFixture(f.input, f.command),
      /unsupported-contained-codex-managed-config/,
    );
    f.facts.preferences = [false, false];
    const profile = await f.module.inspectTrustedContainedCodexFixture(
      f.input,
      f.command,
    );
    f.facts.preferencesStatus = 1;
    await assert.rejects(
      profile.validate(),
      /unsupported-contained-codex-managed-config/,
    );
  },
);

test('current image inspection requires the pinned root Linux arm64 watchdog', async (t) => {
  const f = await fixture(t);
  for (const image of [
    { ...f.facts.image, Id: 'sha256:' + 'b'.repeat(64) },
    { ...f.facts.image, Os: 'darwin' },
    { ...f.facts.image, Architecture: 'amd64' },
    { ...f.facts.image, Config: { ...f.facts.image.Config, User: '1000' } },
    {
      ...f.facts.image,
      Config: { ...f.facts.image.Config, Entrypoint: ['/bin/sh'] },
    },
  ]) {
    const original = f.facts.image;
    f.facts.image = image;
    await assert.rejects(
      f.module.inspectTrustedContainedCodexFixture(f.input, f.command),
      /unsupported-contained-codex-image/,
    );
    f.facts.image = original;
  }
  f.facts.status = null;
  await assert.rejects(
    f.module.inspectTrustedContainedCodexFixture(f.input, f.command),
    /contained-codex-image-unavailable/,
  );
});

test('validation rechecks source, binary, image, seed bytes and project config', async (t) => {
  const f = await fixture(t);
  const profile = await f.module.inspectTrustedContainedCodexFixture(
    f.input,
    f.command,
  );
  for (const name of sourcePaths) {
    const filename = path.join(f.repository, name),
      bytes = await readFile(filename);
    await writeFile(filename, Buffer.concat([bytes, Buffer.from('\n')]));
    await assert.rejects(profile.validate(), /contained-codex-source-changed/);
    await writeFile(filename, bytes);
  }
  const binary = await readFile(f.input.binary);
  await writeFile(f.input.binary, 'changed executable\n');
  await assert.rejects(profile.validate(), /contained-codex-binary-changed/);
  await writeFile(f.input.binary, binary);
  f.facts.image.Architecture = 'amd64';
  await assert.rejects(profile.validate(), /unsupported-contained-codex-image/);
  f.facts.image.Architecture = 'arm64';
  f.facts.status = 1;
  await assert.rejects(profile.validate(), /contained-codex-image-unavailable/);
  f.facts.status = 0;
  const seed = f.input.files['AGENTS.md'];
  f.input.files['AGENTS.md'] = Buffer.from('changed seed\n');
  await assert.rejects(profile.validate(), /contained-codex-input-changed/);
  f.input.files['AGENTS.md'] = seed;
  const config = path.join(f.input.workspace, '.codex');
  await mkdir(config);
  await assert.rejects(
    profile.validate(),
    /unsupported-container-project-config/,
  );
  await rm(config, { recursive: true });
  await profile.validate();
});
