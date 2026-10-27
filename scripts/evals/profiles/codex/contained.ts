import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lstat, mkdtemp, readFile, realpath, rm } from 'node:fs/promises';
import { relativeFile, transferLimits } from '../../container/archive.ts';
import { validateContainerInput } from '../../container/session.ts';
import type { EvalProfileSpec } from '../../contracts.ts';

export const containedCodexImage =
  'sha256:ba23f5c65d7d77b8aaac15fb53cdda90ecd25acff2738fd6d40fc762519dc6bd';

export interface ContainedCodexProfileInput {
  binary: string;
  binaryHash: string;
  imageId: string;
  workspace: string;
  files: Record<string, Buffer>;
  resultPaths: string[];
  deadlineMs: number;
  model: string;
  signal?: AbortSignal;
  /** Monotonic deadline in the calling process's performance.now() clock. */
  deadlineAt?: number;
}

type MetadataCommand = (
  executable: string,
  argv: string[],
  options: {
    cwd: string;
    env: NodeJS.ProcessEnv;
    signal?: AbortSignal;
    deadlineAt?: number;
  },
) => Promise<{ status: number | null; bytes: Buffer }>;

const repository = fileURLToPath(new URL('../../../../', import.meta.url));
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
const hash = (value: string | Buffer) =>
  createHash('sha256').update(value).digest('hex');
const forcedPreferences =
  'ObjC.import("CoreFoundation"); JSON.stringify([$.CFPreferencesAppValueIsForced($("config_toml_base64"),$("com.openai.codex")),$.CFPreferencesAppValueIsForced($("requirements_toml_base64"),$("com.openai.codex"))])';

const command: MetadataCommand = (executable, argv, options) =>
  new Promise((resolve) => {
    const remaining = Math.min(
      10000,
      (options.deadlineAt ?? Infinity) - performance.now(),
    );
    if (options.signal?.aborted || remaining <= 0)
      return resolve({ status: null, bytes: Buffer.alloc(0) });
    const child = spawn(executable, argv, {
      cwd: options.cwd,
      env: options.env,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const chunks: Buffer[] = [];
    let size = 0,
      ended = false;
    const done = (status: number | null) => {
      if (ended) return;
      ended = true;
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', abort);
      resolve({ status, bytes: Buffer.concat(chunks) });
    };
    const abort = () => {
      child.kill('SIGKILL');
      done(null);
    };
    const timer = setTimeout(abort, remaining);
    options.signal?.addEventListener('abort', abort, { once: true });
    if (options.signal?.aborted) abort();
    child.stdout.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > 16384) {
        child.kill('SIGKILL');
        done(null);
      } else chunks.push(chunk);
    });
    child.on('error', () => done(null));
    child.on('close', done);
  });

async function inspect(
  input: ContainedCodexProfileInput,
  metadataCommand: MetadataCommand,
) {
  const metadata: MetadataCommand = async (executable, argv, options) => {
    assert(
      !input.signal?.aborted &&
        (input.deadlineAt === undefined ||
          (Number.isFinite(input.deadlineAt) &&
            input.deadlineAt > performance.now())),
      'contained-codex-cancelled',
    );
    const result = await metadataCommand(executable, argv, {
      ...options,
      ...(input.signal ? { signal: input.signal } : {}),
      ...(input.deadlineAt === undefined
        ? {}
        : { deadlineAt: input.deadlineAt }),
    });
    assert(!input.signal?.aborted, 'contained-codex-cancelled');
    return result;
  };
  // Reject archive, scope and collection inputs before either metadata executable.
  validateContainerInput(input);
  assert(input.imageId === containedCodexImage, 'unsupported-container-image');
  assert(
    Array.isArray(input.resultPaths) &&
      input.resultPaths.length > 0 &&
      input.resultPaths.length <= transferLimits.entries,
    'invalid-container-result-paths',
  );
  const resultPaths = Object.freeze(input.resultPaths.map(relativeFile));
  assert(
    new Set(resultPaths).size === resultPaths.length &&
      resultPaths.every(
        (name) =>
          !name
            .split('/')
            .some((part) => part === '.codex' || part === '.mcp.json'),
      ),
    'invalid-container-result-paths',
  );
  assert(
    typeof input.binary === 'string' &&
      path.isAbsolute(input.binary) &&
      input.binary === path.normalize(input.binary) &&
      !/[\0\r\n]/.test(input.binary) &&
      /^[a-f0-9]{64}$/.test(input.binaryHash),
    'invalid-contained-codex-binary',
  );
  const model = input.model;
  assert(
    typeof model === 'string' &&
      /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(model),
    'invalid-contained-codex-model',
  );
  const { imageId, workspace, files, deadlineMs, binaryHash } = input;
  const binaryPath = input.binary;
  const scope = { imageId, workspace, files, deadlineMs };
  const filesHash = () =>
    hash(
      JSON.stringify(
        Object.keys(files)
          .sort()
          .map((name) => [name, hash(files[name])]),
      ),
    );
  async function validateWorkspace() {
    assert(
      (await realpath(workspace)) === workspace &&
        (await lstat(workspace)).isDirectory(),
      'unsupported-container-workspace',
    );
    for (const name of ['.codex', '.mcp.json']) {
      const entry = await lstat(path.join(workspace, name)).catch((error) => {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw error;
      });
      assert(!entry, 'unsupported-container-project-config');
    }
  }
  async function validateSystemConfig() {
    for (const directory of ['/etc/codex', '/private/etc/codex'])
      for (const name of [
        'config.toml',
        'requirements.toml',
        'managed_config.toml',
      ]) {
        const entry = await lstat(path.join(directory, name)).catch((error) => {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
          throw error;
        });
        assert(!entry, 'unsupported-contained-codex-system-config');
      }
    if (process.platform === 'darwin') {
      const preferences = await metadata(
        '/usr/bin/osascript',
        ['-l', 'JavaScript', '-e', forcedPreferences],
        { cwd: '/', env: { PATH: '/usr/bin:/bin' } },
      );
      assert(
        preferences.status === 0 &&
          JSON.stringify(JSON.parse(preferences.bytes.toString())) ===
            '[false,false]',
        'unsupported-contained-codex-managed-config',
      );
    }
  }
  await validateWorkspace();
  const binary = await realpath(binaryPath);
  async function validateBinary() {
    const stat = await lstat(binary);
    assert(
      (await realpath(binaryPath)) === binary &&
        stat.isFile() &&
        (stat.mode & 0o111) !== 0 &&
        hash(await readFile(binary)) === binaryHash,
      'contained-codex-binary-changed',
    );
  }
  await validateBinary();
  await validateSystemConfig();
  const home = await realpath(await mkdtemp('/tmp/tibicen-codex-metadata-'));
  try {
    const version = await metadata(binary, ['--version'], {
      cwd: home,
      env: {
        PATH: '/usr/bin:/bin',
        HOME: home,
        CODEX_HOME: path.join(home, '.codex'),
        TMPDIR: home,
        DO_NOT_TRACK: '1',
        CI: '1',
      },
    });
    assert(
      version.status === 0 &&
        version.bytes.toString().trim() === 'codex-cli 0.157.0',
      'unsupported-contained-codex-version',
    );
  } finally {
    await rm(home, { recursive: true, force: true });
  }
  await validateBinary();
  async function inspectImage() {
    const result = await metadata(
      '/usr/local/bin/docker',
      ['image', 'inspect', imageId, '--format', '{{json .}}'],
      {
        cwd: '/',
        env: {
          PATH: '/usr/bin:/bin',
          DOCKER_HOST: 'unix:///var/run/docker.sock',
          DOCKER_CONFIG: '/nonexistent-tibicen-config',
        },
      },
    );
    assert(result.status === 0, 'contained-codex-image-unavailable');
    const image = JSON.parse(result.bytes.toString());
    assert(
      image.Id === imageId &&
        image.Os === 'linux' &&
        image.Architecture === 'arm64' &&
        image.Config?.User === '0:0' &&
        JSON.stringify(image.Config?.Entrypoint) ===
          JSON.stringify(['/usr/local/bin/node', '/opt/tibicen/watchdog.mjs']),
      'unsupported-contained-codex-image',
    );
    return hash(JSON.stringify(image));
  }
  const imageHash = await inspectImage();
  const sourceHashes = Object.freeze(
    Object.fromEntries(
      await Promise.all(
        sourcePaths.map(async (name) => [
          name,
          hash(await readFile(path.join(repository, name))),
        ]),
      ),
    ) as Record<string, string>,
  );
  const seedHash = filesHash();
  const specification: Readonly<EvalProfileSpec> = Object.freeze({
    id: 'codex-contained-0.157.0-' + model,
    agent: 'codex',
    version: '0.157.0',
    model,
    auth: 'none',
    paid: false,
    startupHash: hash(
      JSON.stringify({
        binary,
        binaryHash,
        imageId,
        imageHash,
        sourceHashes,
        seedHash,
        workspace,
        resultPaths,
        deadlineMs,
        model,
      }),
    ),
    permissionsHash: hash(
      JSON.stringify({
        route: 'owned-docker-stdio',
        network: 'none',
        mounts: [],
        workspace,
        resultPaths,
        deadlineMs,
        sourceHashes,
      }),
    ),
  });
  async function validate() {
    validateContainerInput(scope);
    assert(filesHash() === seedHash, 'contained-codex-input-changed');
    await validateWorkspace();
    for (const [name, expected] of Object.entries(sourceHashes))
      assert(
        hash(await readFile(path.join(repository, name))) === expected,
        'contained-codex-source-changed',
      );
    await validateBinary();
    await validateSystemConfig();
    assert(
      (await inspectImage()) === imageHash,
      'contained-codex-image-changed',
    );
  }
  return Object.freeze({
    specification,
    binary,
    binaryHash,
    imageId,
    imageHash,
    workspace,
    resultPaths,
    deadlineMs,
    model,
    filesHash: seedHash,
    sourceHashes,
    validate,
  });
}

/** Metadata only: this does not authorize or report readiness for a model run. */
export function inspectContainedCodexProfile(
  input: ContainedCodexProfileInput,
) {
  return inspect(input, command);
}

// Code-only test seam. Never select it from serialized profile/config data.
export function inspectTrustedContainedCodexFixture(
  input: ContainedCodexProfileInput,
  metadataCommand: MetadataCommand,
) {
  return inspect(input, metadataCommand);
}
