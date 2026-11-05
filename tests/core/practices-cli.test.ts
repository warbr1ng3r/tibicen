import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  cp,
  lstat,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { hashContent } from '../../scripts/core/contracts.ts';
import { OFFICIAL_SOURCES } from '../../scripts/discovery/practices.ts';
import { HARNESS_PROFILES } from '../../scripts/agents/profiles.ts';

test('practices accepts version data read-only in source and standalone init/adopt outside a checkout', async (t) => {
  const base = await realpath(
    await mkdtemp(path.join(tmpdir(), 'tibicen-practices-cli-')),
  );
  t.after(() => rm(base, { recursive: true, force: true }));
  const checkout = path.join(base, 'checkout'),
    output = path.join(base, 'installed'),
    root = path.join(base, 'app'),
    home = path.join(base, 'home'),
    control = path.join(base, 'control');
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
      { recursive: true },
    );
  const { buildSkills } = (await import(
    pathToFileURL(path.join(checkout, 'scripts/build.ts')).href
  )) as typeof import('../../scripts/build.ts');
  await buildSkills(output);
  await rm(checkout, { recursive: true });
  await mkdir(control);
  for (const [filename, content] of [
    [path.join(root, 'app.js'), 'Existing application.\n'],
    [path.join(root, '.tibicen/manifest.yml'), 'Existing project record.\n'],
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
  const before = [await snapshot(root), await snapshot(home)],
    installedBefore = await snapshot(output),
    inputFile = path.join(control, 'versions.json'),
    brokenFile = path.join(control, 'broken.json'),
    preload = path.join(control, 'offline-fetch.mjs'),
    log = path.join(control, 'requests.jsonl'),
    document =
      '# Official guidance\n\nUse instructions applicable to the selected agent and project.\n',
    versions = {
      codex: 'preview; touch SHOULD_NOT_EXIST',
      cursor: '2026.11 local build',
      'claude-code': '2.0.0+fixture',
    },
    urls = Object.values(OFFICIAL_SOURCES).flat();
  await writeFile(inputFile, JSON.stringify({ agentVersions: versions }));
  await writeFile(brokenFile, '{');
  await writeFile(log, '');
  await writeFile(
    preload,
    `import { appendFileSync } from 'node:fs';
const urls = ${JSON.stringify(urls)};
globalThis.fetch = async (url, options = {}) => {
  appendFileSync(${JSON.stringify(log)}, JSON.stringify(String(url)) + '\\n');
  if (!urls.includes(String(url)) || options.method !== 'GET' || options.redirect !== 'error') throw new Error('Unexpected request');
  if (process.env.TIBICEN_TEST_SOURCE_FAILURE === '1') {
    if (String(url) === ${JSON.stringify(OFFICIAL_SOURCES.codex[0])}) return new Response('Unavailable', { status: 503 });
    throw Object.assign(new Error('Offline timeout'), { name: 'TimeoutError' });
  }
  return new Response(${JSON.stringify(document)}, { headers: { 'content-type': 'text/markdown' } });
};
`,
  );
  async function execute(
    cli: string,
    args: string[],
    input?: unknown,
    failure = false,
  ) {
    const result = spawnSync(process.execPath, [cli, ...args], {
      cwd: root,
      env: {
        HOME: home,
        PATH: '',
        NODE_OPTIONS: '--import=' + pathToFileURL(preload).href,
        TIBICEN_TEST_SOURCE_FAILURE: failure ? '1' : '0',
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
  for (const cli of [
    path.resolve('scripts/tibicen.ts'),
    ...['tibicen-init', 'tibicen-adopt'].map((name) =>
      path.join(output, name, 'scripts/tibicen.ts'),
    ),
  ]) {
    assert.equal(
      (await execute(cli, ['help'])).result.commands.practices,
      'practices --agents ID[,ID...] [--input FILE_OR_STDIN_DASH]',
    );
    const args = ['practices', '--agents', 'codex,cursor,claude-code'];
    let stdinResult;
    for (const [inputArgs, input] of [
      [['--input', '-'], { agentVersions: versions }],
      [['--input', inputFile], undefined],
    ] as [string[], unknown][]) {
      const { exitCode, result } = await execute(
        cli,
        [...args, ...inputArgs],
        input,
      );
      assert.equal(exitCode, 0);
      assert.deepEqual(result.gaps, []);
      assert.equal(result.schema, 1);
      assert.equal(result.practices.length, 6);
      for (const entry of result.practices) {
        const agent = entry.appliesTo.split(' ')[0] as keyof typeof versions;
        assert.equal(entry.agentVersion, versions[agent]);
        assert.equal(entry.status, 'checked');
        assert.equal(entry.evidence.applicability, 'requires-agent-assessment');
        assert.equal(entry.evidence.contentHash, hashContent(document));
        assert.ok(Number.isFinite(Date.parse(entry.checkedAt)));
        delete entry.checkedAt;
      }
      if (stdinResult) assert.deepEqual(result, stdinResult);
      else stdinResult = result;
    }
    for (const input of [
      undefined,
      {},
      { agentVersions: { codex: versions.codex } },
    ]) {
      const { exitCode, result } = await execute(
        cli,
        input === undefined ? args : [...args, '--input', '-'],
        input,
      );
      assert.equal(exitCode, 0);
      assert.deepEqual(
        result.gaps,
        (input && 'agentVersions' in input
          ? ['cursor', 'claude-code']
          : ['codex', 'cursor', 'claude-code']
        ).map((agent) => ({ agent, reason: 'agent-version-unverified' })),
      );
    }
    const requestsBefore = await readFile(log, 'utf8');
    const catalog = await execute(cli, ['harnesses']);
    assert.equal(catalog.exitCode, 0);
    assert.deepEqual(catalog.result, {
      schema: 1,
      harnesses: HARNESS_PROFILES,
    });
    const selection = await execute(cli, [
      'harnesses',
      '--agents',
      'gemini-cli,future-agent,roo-code,gemini-cli',
    ]);
    assert.equal(selection.exitCode, 0);
    assert.deepEqual(
      selection.result.harnesses.map(
        ({ id, status }: { id: string; status: string }) => ({ id, status }),
      ),
      [
        { id: 'gemini-cli', status: 'documented' },
        { id: 'future-agent', status: 'unknown' },
        { id: 'roo-code', status: 'legacy' },
      ],
    );
    const unknown = await execute(
      cli,
      ['practices', '--agents', 'future-agent', '--input', '-'],
      { agentVersions: { 'future-agent': '1.0.0' } },
    );
    assert.equal(unknown.exitCode, 0);
    assert.deepEqual(unknown.result.gaps, [
      { agent: 'future-agent', reason: 'unsupported-agent' },
    ]);
    for (const command of ['harnesses', 'practices'])
      for (const invalid of [
        '',
        'codex,Unknown',
        'codex,with_under',
        'a'.repeat(65),
        Array(17).fill('codex').join(','),
      ]) {
        const result = await execute(cli, [command, '--agents', invalid]);
        assert.equal(result.exitCode, 1);
        assert.equal(result.result.error.code, 'invalid-agents');
      }
    assert.equal(await readFile(log, 'utf8'), requestsBefore);
    for (const [input, code] of [
      [null, 'invalid-practices-input'],
      [[], 'invalid-practices-input'],
      ['version', 'invalid-practices-input'],
      [{ agents: ['cursor'] }, 'invalid-practices-input'],
      [
        { sources: { codex: ['https://evil.example'] } },
        'invalid-practices-input',
      ],
      [{ agentVersions: null }, 'invalid-agent-versions'],
      [{ agentVersions: [] }, 'invalid-agent-versions'],
      [{ agentVersions: { codex: '' } }, 'invalid-agent-versions'],
      [{ agentVersions: { codex: 1 } }, 'invalid-agent-versions'],
      [{ agentVersions: { codex: 'v'.repeat(101) } }, 'invalid-agent-versions'],
      [{ agentVersions: { codex: 'v\n1' } }, 'invalid-agent-versions'],
      [{ agentVersions: { cursor: 'unselected' } }, 'invalid-agent-versions'],
      [{ agentVersions: { unknown: 'unsupported' } }, 'invalid-agent-versions'],
    ] as [unknown, string][]) {
      const { exitCode, result } = await execute(
        cli,
        ['practices', '--agents', 'codex', '--input', '-'],
        input,
      );
      assert.equal(exitCode, 1);
      assert.equal(result.error.code, code);
    }
    const broken = await execute(cli, [
      'practices',
      '--agents',
      'codex',
      '--input',
      brokenFile,
    ]);
    assert.equal(broken.exitCode, 1);
    assert.equal(broken.result.error.code, 'invalid-data');
    assert.equal(await readFile(log, 'utf8'), requestsBefore);
    const failed = await execute(
      cli,
      ['practices', '--agents', 'codex', '--input', '-'],
      { agentVersions: { codex: versions.codex } },
      true,
    );
    assert.equal(failed.exitCode, 0);
    assert.deepEqual(
      failed.result.practices.map((entry: { reason: string }) => entry.reason),
      ['source-unavailable', 'source-timeout'],
    );
    assert.ok(
      failed.result.practices.every(
        (entry: { status: string; agentVersion: string; evidence?: unknown }) =>
          entry.status === 'unverified' &&
          entry.agentVersion === versions.codex &&
          !entry.evidence,
      ),
    );
    assert.deepEqual(
      failed.result.gaps.map((gap: { reason: string }) => gap.reason),
      ['source-unavailable', 'source-timeout'],
    );
    assert.equal(
      (await readFile(log, 'utf8')).split('\n').length -
        requestsBefore.split('\n').length,
      2,
    );
  }
  assert.deepEqual(await snapshot(output), installedBefore);
});
