import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  mkdtemp,
  mkdir,
  readdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { assert, digest, hashContent } from '../core/contracts.ts';
import { planProcess } from '../process/index.ts';

async function inventory(
  root: string,
  prefix = '',
  excludedDirectory?: string,
): Promise<{ path: string; hash: string }[]> {
  const files = [];
  for (const entry of (
    await readdir(path.join(root, prefix), { withFileTypes: true })
  ).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = path.posix.join(prefix, entry.name);
    if (relative === excludedDirectory) continue;
    if (entry.isDirectory())
      files.push(...(await inventory(root, relative, excludedDirectory)));
    else {
      assert(
        entry.isFile(),
        'unexpected-eval-cli',
        'Package/probe must contain ordinary files.',
      );
      files.push({
        path: relative,
        hash: hashContent(await readFile(path.join(root, relative))),
      });
    }
  }
  return files;
}

export async function inspectOpenSpecPackage(
  packageRoot = fileURLToPath(
    new URL('../../node_modules/@fission-ai/openspec', import.meta.url),
  ),
) {
  const cli = await realpath(packageRoot);
  const pkg = JSON.parse(
    await readFile(path.join(cli, 'package.json'), 'utf8'),
  );
  assert(
    pkg.name === '@fission-ai/openspec' &&
      pkg.version === '1.14.3' &&
      pkg.license === 'MIT',
    'unexpected-eval-cli',
    'Expected the locked OpenSpec package.',
  );
  // pnpm generates dependency launchers containing the local installation path.
  const resources = await inventory(cli, '', 'node_modules/.bin');
  const lock = await readFile(
    new URL('../../pnpm-lock.yaml', import.meta.url),
    'utf8',
  );
  const integrity = lock.match(
    /'@fission-ai\/openspec@1\.14\.3':\n\s+resolution: \{integrity: ([^}]+)\}/,
  )?.[1];
  assert(integrity, 'unexpected-eval-cli', 'Missing locked package integrity.');
  return { cli, pkg, resources, integrity, lockHash: hashContent(lock) };
}

// Host-only probe of the repository's already pinned dependency. No download or personal HOME.
export async function inspectOpenSpec() {
  const { cli, pkg, resources, integrity } = await inspectOpenSpecPackage();
  const scope = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'tibicen-openspec-effects-')),
  );
  const project = path.join(scope, 'project'),
    home = path.join(scope, 'home');
  await mkdir(project);
  await mkdir(home);
  const environment = {
    PATH: process.env.PATH,
    HOME: home,
    XDG_CONFIG_HOME: path.join(home, '.config'),
    XDG_DATA_HOME: path.join(home, '.local/share'),
    XDG_STATE_HOME: path.join(home, '.local/state'),
    CI: '1',
    OPENSPEC_TELEMETRY: '0',
    DO_NOT_TRACK: '1',
  };
  const effects = [];
  try {
    const command = (argv: string[]) => {
      const run = spawnSync(
        process.execPath,
        [path.join(cli, 'bin/openspec.js'), ...argv],
        {
          cwd: project,
          env: environment,
          encoding: 'utf8',
          timeout: 15000,
          maxBuffer: 1024 * 1024,
        },
      );
      assert(
        !run.error && run.status === 0,
        'openspec-effects-failed',
        'Pinned CLI effect probe failed.',
      );
      return run.stdout;
    };
    for (const argv of [
      [
        'init',
        '--tools',
        'codex',
        '--profile',
        'core',
        '--no-animation',
        '--no-copilot-cloud',
      ],
      ['update'],
      ['update'],
    ]) {
      const before = await inventory(scope);
      command(argv);
      const after = await inventory(scope);
      effects.push({
        argv,
        changed: after.filter(
          (file) =>
            before.find((old) => old.path === file.path)?.hash !== file.hash,
        ),
        removed: before
          .filter((file) => !after.some((next) => next.path === file.path))
          .map((file) => file.path),
      });
    }
    const nativeFiles = await inventory(scope);
    const plan = await planProcess(
      {
        framework: 'openspec',
        version: '1.14.3',
        agent: 'codex',
        agentVersion: '0.157.0',
      },
      undefined,
      async () => ({ content: null, hash: null }),
    );
    return {
      schema: 1,
      package: pkg.name,
      version: pkg.version,
      license: pkg.license,
      repository: pkg.repository.url,
      integrity,
      resources,
      resourceHash: digest(resources),
      native: {
        environment:
          'Fresh explicit HOME/XDG, CI=1, telemetry off; trusted locked CLI only. This is an observed file inventory, not an OS sandbox or agent loading proof.',
        effects,
        files: nativeFiles,
      },
      bounded: {
        files: plan.process!.files,
        commands: [],
        note: 'Tibicen compiles four reviewed files, does not call native init/update and does not install the CLI. Existing config/templates/changes are preserved.',
      },
    };
  } finally {
    await rm(scope, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await writeFile(
    new URL('./fixtures/sources/openspec.json', import.meta.url),
    JSON.stringify(await inspectOpenSpec(), null, 2) + '\n',
  );
  process.stdout.write(
    'Frozen OpenSpec package inventory and observed init/update effects.\n',
  );
}
