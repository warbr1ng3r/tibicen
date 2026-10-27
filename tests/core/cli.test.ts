import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cp,
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { hashContent } from '../../scripts/core/contracts.ts';

const script = path.resolve('scripts/tibicen.ts');
test('CLI stdin flow applies only after consent, preserves app and creates no Git history', async (t) => {
  const base = await mkdtemp(path.join(tmpdir(), 'tibicen-cli-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'app'),
    home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  await writeFile(path.join(root, 'index.js'), 'existing application');
  const execute = (args: string[], input?: unknown) => {
    const result = spawnSync(process.execPath, [script, ...args], {
      cwd: base,
      env: { PATH: process.env.PATH, HOME: home },
      input: input === undefined ? undefined : JSON.stringify(input),
      encoding: 'utf8',
      timeout: 10000,
    });
    assert.equal(result.stderr, '');
    return { exitCode: result.status, result: JSON.parse(result.stdout) };
  };
  assert.equal(execute(['scan', '--root', root]).result.mode, 'init');
  const proposal = execute(['proposal', '--root', root, '--input', '-'], {
    mode: 'init',
    changes: [
      {
        path: 'AGENTS.md',
        content:
          '# Agent instructions\nRead the application before proposing changes.\n',
        reason: 'Connect project instructions',
      },
    ],
  }).result;
  assert.deepEqual(await readdir(root), ['index.js']);
  assert.equal(
    execute(['apply', '--root', root, '--plan', '-'], proposal).result.error
      .code,
    'consent-required',
  );
  const applied = execute(
    ['apply', '--root', root, '--plan', '-', '--approve', proposal.digest],
    proposal,
  );
  assert.equal(applied.exitCode, 0);
  assert.equal(applied.result.status, 'complete');
  assert.equal(applied.result.checks.infrastructure.status, 'passed');
  assert.equal(applied.result.checks.verify.status, 'unverified');
  assert.equal(
    await readFile(path.join(root, 'index.js'), 'utf8'),
    'existing application',
  );
  assert.equal((await readdir(root)).includes('.git'), false);
  assert.equal(execute(['status', '--root', root]).result.status, 'complete');
  const beforeReport = await readdir(path.join(root, '.tibicen'));
  const report = execute(['report', '--root', root]).result;
  assert.deepEqual(report.applied, [{ path: 'AGENTS.md', action: 'add' }]);
  assert.equal(report.reason, null);
  assert.equal(report.checks.verify.status, 'unverified');
  assert.deepEqual(await readdir(path.join(root, '.tibicen')), beforeReport);
  assert.equal(
    execute(['report', '--root', root, '--save']).result.error.code,
    'consent-required',
  );
  await assert.rejects(readFile(path.join(root, '.tibicen/report.md')), {
    code: 'ENOENT',
  });
  const saved = execute([
    'report',
    '--root',
    root,
    '--save',
    '--requested',
  ]).result;
  assert.deepEqual(saved, { ...report, saved: '.tibicen/report.md' });
  const contents = await readFile(path.join(root, saved.saved), 'utf8');
  assert.deepEqual(
    JSON.parse(contents.split('```json\n')[1].split('```')[0]),
    report,
  );
});

test('CLI report preserves applied changes and the stored interruption reason', async (t) => {
  const base = await mkdtemp(path.join(tmpdir(), 'tibicen-report-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'app'),
    home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  await writeFile(
    path.join(root, 'AGENTS.md'),
    '# Owner rules\nKeep the app.\n',
  );
  await writeFile(path.join(root, 'app.js'), 'existing application');
  const { createProposal } = await import('../../scripts/core/plan.ts');
  const { applyPlan } = await import('../../scripts/core/apply.ts');
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: '# Owner rules\nKeep the app.\nRun tests before delivery.\n',
          reason: 'Clarify verification.',
        },
      ],
    },
    { home },
  );
  const applied = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    afterChange() {
      throw Object.assign(new Error('Interrupted after the recorded write.'), {
        code: 'report-test-interrupted',
      });
    },
  });
  assert.equal(applied.status, 'incomplete');
  const result = spawnSync(
    process.execPath,
    [script, 'report', '--root', root],
    {
      env: { PATH: process.env.PATH, HOME: home },
      encoding: 'utf8',
      timeout: 10000,
    },
  );
  assert.equal(result.status, 1, result.stderr || result.stdout);
  assert.equal(result.stderr, '');
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'incomplete');
  assert.equal(report.reason, 'report-test-interrupted');
  assert.deepEqual(report.applied, [{ path: 'AGENTS.md', action: 'modify' }]);
  assert.equal(
    await readFile(path.join(root, 'app.js'), 'utf8'),
    'existing application',
  );
  await assert.rejects(readFile(path.join(root, '.tibicen/report.md')), {
    code: 'ENOENT',
  });
});

test('CLI report reads legacy sessions without attempt records', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'tibicen-legacy-report-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, '.tibicen'));
  const passport = JSON.stringify({
    schema: 1,
    tibicen: { status: 'complete' },
    installed: [],
    changes: [],
    sessions: [{ id: 'legacy', status: 'complete', manualActions: [] }],
  });
  const filename = path.join(root, '.tibicen/manifest.yml');
  await writeFile(filename, passport);
  const result = spawnSync(
    process.execPath,
    [script, 'report', '--root', root],
    {
      env: { PATH: process.env.PATH, HOME: root },
      encoding: 'utf8',
      timeout: 10000,
    },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.status, 'complete');
  assert.equal(report.reason, null);
  assert.deepEqual(report.applied, []);
  assert.equal(await readFile(filename, 'utf8'), passport);
});

test('CLI executes through a symlink and rejects unknown commands as structured errors', async (t) => {
  const base = await mkdtemp(path.join(tmpdir(), 'tibicen-link-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const link = path.join(base, 'tibicen.ts');
  await symlink(script, link);
  const result = spawnSync(process.execPath, [link, 'version'], {
    encoding: 'utf8',
  });
  const metadata = JSON.parse(
    await readFile(new URL('../../package.json', import.meta.url), 'utf8'),
  );
  assert.equal(JSON.parse(result.stdout).version, metadata.version);
  const unknown = spawnSync(process.execPath, [link, 'unknown'], {
    encoding: 'utf8',
  });
  assert.equal(unknown.status, 1);
  assert.equal(JSON.parse(unknown.stdout).error.code, 'unknown-command');
});

test('source-check validates stdin/files read-only, including both standalone skills without a checkout', async (t) => {
  const base = await realpath(
    await mkdtemp(path.join(tmpdir(), 'tibicen-source-cli-')),
  );
  t.after(() => rm(base, { recursive: true, force: true }));
  const checkout = path.join(base, 'checkout'),
    output = path.join(base, 'installed'),
    root = path.join(base, 'app'),
    home = path.join(base, 'home'),
    io = path.join(base, 'control');
  await mkdir(checkout);
  for (const name of [
    'scripts',
    'references',
    'skills',
    'LICENSE',
    'package.json',
  ])
    await cp(
      new URL('../../' + name, import.meta.url),
      path.join(checkout, name),
      {
        recursive: true,
      },
    );
  const { buildSkills } = (await import(
    pathToFileURL(path.join(checkout, 'scripts/build.ts')).href
  )) as typeof import('../../scripts/build.ts');
  await buildSkills(output);
  await rm(checkout, { recursive: true });
  await mkdir(io);
  for (const [filename, content] of [
    [path.join(root, 'src/app.js'), 'export const existing = true;\n'],
    [path.join(root, '.tibicen/manifest.yml'), 'Existing owner passport.\n'],
    [path.join(root, '.tibicen/state/session.json'), 'Existing owner state.\n'],
    [path.join(home, '.tibicen/usage.json'), '{"count":7}\n'],
    [path.join(home, '.cache/keep'), 'Existing user cache.\n'],
  ]) {
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, content);
  }
  async function snapshot(directory: string, prefix = ''): Promise<unknown[]> {
    const result: unknown[] = [];
    for (const name of (await readdir(path.join(directory, prefix))).sort()) {
      const relative = path.join(prefix, name),
        filename = path.join(directory, relative),
        stat = await lstat(filename);
      result.push([
        relative,
        stat.mode,
        stat.isDirectory() ? null : hashContent(await readFile(filename)),
      ]);
      if (stat.isDirectory())
        result.push(...(await snapshot(directory, relative)));
    }
    return result;
  }
  const before = [await snapshot(root), await snapshot(home)];
  const sha = 'a'.repeat(40),
    treeSha = 'b'.repeat(40),
    repo = 'owner/skills',
    api = 'https://api.github.com/repos/' + repo;
  const files = [
    {
      sourcePath: 'skills/useful/SKILL.md',
      content:
        '---\nname: useful\ndescription: A focused workflow\n---\nRead project conventions.\n',
    },
    {
      sourcePath: 'LICENSE',
      content: 'MIT License\nCopyright synthetic source control.\n',
    },
  ].map((file) => {
    const bytes = Buffer.from(file.content);
    return {
      ...file,
      bytes,
      blob: createHash('sha1')
        .update(`blob ${bytes.length}\0`)
        .update(bytes)
        .digest('hex'),
    };
  });
  const licenseURL = api + '/license?ref=' + sha;
  const responses = new Map<string, unknown>([
    [
      api,
      {
        full_name: repo,
        archived: false,
        fork: false,
        created_at: '2020-01-01',
        default_branch: 'main',
      },
    ],
    [api + '/commits/' + sha, { sha, commit: { tree: { sha: treeSha } } }],
    [
      api + '/git/trees/' + treeSha + '?recursive=1',
      {
        truncated: false,
        tree: files.map((file) => ({
          path: file.sourcePath,
          sha: file.blob,
          size: file.bytes.length,
          type: 'blob',
          mode: '100644',
        })),
      },
    ],
    [
      licenseURL,
      { path: 'LICENSE', sha: files[1].blob, license: { spdx_id: 'MIT' } },
    ],
    ...files.map((file): [string, unknown] => [
      api + '/git/blobs/' + file.blob,
      {
        sha: file.blob,
        encoding: 'base64',
        content: file.bytes.toString('base64'),
      },
    ]),
  ]);
  const source = {
    repo,
    sha,
    license: 'MIT',
    skillPath: 'skills/useful/SKILL.md',
    files: files.map((file) => ({
      path: '.agents/skills/useful/' + path.basename(file.sourcePath),
      sourcePath: file.sourcePath,
      contentHash: hashContent(file.bytes),
      fileMode: 0o644,
    })),
  };
  const inputFile = path.join(io, 'sources.json'),
    brokenFile = path.join(io, 'broken.json'),
    preload = path.join(io, 'source-control.mjs');
  await writeFile(inputFile, JSON.stringify([source]));
  await writeFile(brokenFile, '{');
  async function execute(
    cli: string,
    args: string[],
    input?: unknown,
    unknownLicense = false,
  ) {
    const selected = new Map(responses);
    if (unknownLicense)
      selected.set(licenseURL, {
        path: 'LICENSE',
        sha: files[1].blob,
        license: { spdx_id: 'NOASSERTION' },
      });
    await writeFile(
      preload,
      `const responses=new Map(${JSON.stringify([...selected])});globalThis.fetch=async(url,options={})=>{if((options.method??'GET')!=='GET'||!responses.has(String(url)))throw new Error('Unfrozen source request');return new Response(JSON.stringify(responses.get(String(url))));};\n`,
    );
    const result = spawnSync(process.execPath, [cli, ...args], {
      cwd: root,
      env: {
        HOME: home,
        PATH: '',
        NODE_OPTIONS: '--import=' + pathToFileURL(preload).href,
      },
      input: input === undefined ? undefined : JSON.stringify(input),
      encoding: 'utf8',
      timeout: 10000,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.stderr, '');
    assert.deepEqual([await snapshot(root), await snapshot(home)], before);
    return { exitCode: result.status, result: JSON.parse(result.stdout) };
  }
  const installed = ['tibicen-init', 'tibicen-adopt'].map((name) =>
    path.join(output, name),
  );
  for (const skill of installed) {
    const metadata = JSON.parse(
      await readFile(path.join(skill, 'package.json'), 'utf8'),
    );
    assert.equal(metadata.devDependencies, undefined);
    for (const excluded of ['node_modules', 'openspec', 'scripts/evals'])
      await assert.rejects(lstat(path.join(skill, excluded)), {
        code: 'ENOENT',
      });
    assert(
      (
        await readFile(
          path.join(skill, 'references/stage-agent-arch.md'),
          'utf8',
        )
      ).includes('source-check --input -'),
    );
  }
  const expected = [
    {
      schema: 1,
      repo,
      sha,
      license: 'MIT',
      provenance: 'provenance-verified',
      selectionVersion: 1,
    },
  ];
  for (const cli of [
    script,
    ...installed.map((skill) => path.join(skill, 'scripts/tibicen.ts')),
  ]) {
    assert.equal(
      (await execute(cli, ['help'])).result.commands['source-check'],
      'source-check --input FILE_OR_STDIN_DASH',
    );
    for (const [args, input] of [
      [['source-check', '--input', '-'], [source]],
      [['source-check', '--input', inputFile], undefined],
    ] as [string[], unknown][]) {
      const result = await execute(cli, args, input);
      assert.equal(result.exitCode, 0);
      assert.deepEqual(result.result, expected);
    }
    for (const [input, reason] of [
      [
        [
          {
            ...source,
            files: [{ ...source.files[0], contentHash: '0'.repeat(64) }],
          },
        ],
        'source-hash-mismatch',
      ],
      [
        [
          {
            ...source,
            files: [{ ...source.files[0], sourcePath: 'missing.md' }],
          },
        ],
        'source-file-not-found',
      ],
      [[{ ...source, repo: 'owner/unavailable' }], 'source-unavailable'],
      [[{ ...source, sha: 'not-pinned' }], 'invalid-source'],
      [{ sources: [source] }, 'invalid-source'],
    ] as [unknown, string][]) {
      const result = await execute(
        cli,
        ['source-check', '--input', '-'],
        input,
      );
      assert.equal(result.exitCode, 1);
      assert.equal(result.result.error.code, reason);
    }
    const unknown = await execute(
      cli,
      ['source-check', '--input', '-'],
      [source],
      true,
    );
    assert.equal(unknown.exitCode, 1);
    assert.equal(unknown.result.error.code, 'license-unknown');
    for (const args of [
      ['source-check'],
      ['source-check', '--query', 'unused'],
      ['source-check', '--input', brokenFile],
    ]) {
      const result = await execute(cli, args);
      assert.equal(result.exitCode, 1);
      assert.equal(
        result.result.error.code,
        args.includes(brokenFile) ? 'invalid-data' : 'invalid-arguments',
      );
    }
  }
  for (const skill of installed)
    for (const entry of [repo, sha]) {
      await writeFile(
        path.join(skill, 'references/blocklist.json'),
        JSON.stringify({ schema: 1, entries: [entry] }),
      );
      const result = await execute(
        path.join(skill, 'scripts/tibicen.ts'),
        ['source-check', '--input', '-'],
        [source],
      );
      assert.equal(result.exitCode, 1);
      assert.equal(result.result.error.code, 'source-blocked');
    }
  assert.equal(await readFile(inputFile, 'utf8'), JSON.stringify([source]));
});
