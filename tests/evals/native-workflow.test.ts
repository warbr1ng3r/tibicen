import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, readFile, writeFile, rm, realpath } from 'node:fs/promises';
import { nativeCheckout, sourceControl } from './native-control.ts';
import {
  firstWaveProfiles,
  runNativeAcceptance,
} from '../../scripts/evals/native.ts';
import { probeNativeCli } from '../../scripts/evals/profiles/probe-cli.ts';
import { preflightZCode } from '../../scripts/evals/profiles/zcode/preflight.ts';
import { collectNative } from '../../scripts/evals/collect-native.ts';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import {
  nativeSourcePins,
  captureNativeSources,
  loadNativeSources,
  nativeSourcePreload,
} from '../../scripts/evals/native-sources.ts';
import { loadAcceptanceMatrix } from '../../scripts/evals/matrix.ts';
import { materializeScenario } from '../../scripts/evals/fixtures.ts';
import {
  reviewNativeProposal,
  checkKernelReceipt,
  nativeWords,
  nativeRecipe,
  isNativeProcessInspection,
  reviewedCommands,
} from '../../scripts/evals/native-workflow.ts';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan } from '../../scripts/core/apply.ts';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

test('literal command review does not split shell-concatenated executable names', async (t) => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'tibicen-native-words-'));
  t.after(() => rm(parent, { recursive: true, force: true }));
  const fixture = (await loadAcceptanceMatrix()).find(
    (item) => item.scenario.id === 'pref-03',
  )!;
  const { root } = await materializeScenario(fixture.scenario, parent);
  for (const command of [
    'node"--test"',
    "'node'--test",
    '/bin/sh -c \'node"--test"\'',
    'node\n--test',
    'node\r--test',
  ]) {
    assert.equal(nativeWords(command), null);
    assert.equal(nativeRecipe(command), null);
    await assert.rejects(
      reviewNativeProposal(
        {
          summary: 'Wrong executable',
          changes: [],
          commands: [command],
          kernelPlan: null,
        },
        fixture.scenario,
        'setup',
        root,
      ),
      { code: 'native-proposal-rejected' },
    );
  }
  assert.equal(nativeRecipe("'node' '--test'")?.executable, 'node');
});

test('verified process inspection grants only exact metadata and frozen read recipes', async () => {
  const fixture = (await loadAcceptanceMatrix()).find(
    (item) => item.scenario.id === 'proc-01',
  )!;
  const cliRoot = '/checked/openspec',
    allowed = fixture.scenario.task.allowedCommands;
  const metadata = [
    '--version',
    '--help',
    'help',
    'validate --help',
    'version --help',
    'version --json',
    'instructions --help',
    'templates --help',
    'templates --schema spec-driven --json',
    'new change --help',
    'instructions specs --schema spec-driven',
    'instructions proposal --schema spec-driven',
  ];
  for (const argv of metadata) {
    for (const command of [
      'openspec ' + argv,
      `/bin/sh -c 'openspec ${argv}'`,
      'node ' + path.join(cliRoot, 'bin/openspec.js') + ' ' + argv,
    ]) {
      const recipe = nativeRecipe(command, cliRoot);
      assert(isNativeProcessInspection(recipe, cliRoot, []), command);
      assert(!isNativeProcessInspection(recipe, undefined, allowed), command);
    }
    const command = 'openspec ' + argv + ' extra';
    assert(
      !isNativeProcessInspection(nativeRecipe(command), cliRoot, allowed),
      command,
    );
  }
  for (const command of [
    'openspec list --json',
    'openspec status --change add-triple --json',
    ...['proposal', 'design', 'specs', 'tasks', 'apply'].map(
      (artifact) =>
        'openspec instructions ' + artifact + ' --change add-triple --json',
    ),
  ]) {
    const recipe = nativeRecipe(command);
    assert(isNativeProcessInspection(recipe, cliRoot, allowed), command);
    assert(!isNativeProcessInspection(recipe, cliRoot, []), command);
  }
  for (const command of [
    'openspec validate add-triple --strict',
    'node --test',
    'openspec new change add-triple --json',
    'openspec version --check',
    'openspec templates --schema other --json',
    'openspec schemas --json',
    'openspec schema which spec-driven --json',
    'openspec status --all --json',
    'openspec instructions archive --change add-triple --json',
    'openspec schema fork spec-driven team --json',
    'openspec --help && node --test',
    'openspec new change add-triple --help',
    'node /unverified/openspec/bin/openspec.js --help',
  ])
    assert(
      !isNativeProcessInspection(
        nativeRecipe(command, cliRoot),
        cliRoot,
        allowed,
      ),
      command,
    );
  assert.equal(
    nativeRecipe('openspec validate add-triple --strict')?.readOnly,
    true,
  );
  assert.equal(
    reviewedCommands(
      ['node --test', 'openspec validate add-triple --strict'],
      fixture.scenario,
      'task',
      'implementation',
      cliRoot,
    ).length,
    2,
  );
  assert.throws(
    () =>
      reviewedCommands(
        ['openspec --help && node --test'],
        fixture.scenario,
        'task',
        'implementation',
        cliRoot,
      ),
    { code: 'native-proposal-rejected' },
  );
});

for (const mode of ['null-record', 'missing-start', 'oversized-output'])
  test(
    'malformed native stream retains the cohort: ' + mode,
    { skip: process.platform === 'win32' },
    async (t) => {
      const control = await nativeCheckout(mode);
      t.after(() => rm(control.root, { recursive: true, force: true }));
      const entry = path.join(control.root, 'run-control.mjs'),
        artifactDirectory = path.join(control.root, 'observed');
      await writeFile(
        entry,
        `import {runTrustedNativeFixtureAcceptance} from ${JSON.stringify(pathToFileURL(path.join(control.root, 'scripts/evals/native.ts')).href)};await runTrustedNativeFixtureAcceptance(${JSON.stringify({ ...control.options, artifactDirectory, scenarioIds: ['skill-02'] })});`,
      );
      const child = spawn(process.execPath, [entry], {
        stdio: ['ignore', 'ignore', 'pipe'],
      });
      let diagnostic = '';
      child.stderr.on('data', (bytes) => (diagnostic += bytes));
      const code = await new Promise((resolve) => child.once('close', resolve));
      assert.equal(code, 0, diagnostic);
      for (const variant of ['tibicen', 'baseline']) {
        const run = JSON.parse(
          await readFile(
            path.join(artifactDirectory, `skill-02-${variant}-1-run.json`),
            'utf8',
          ),
        );
        assert.equal(run.result.task.status, 'skip');
        if (mode === 'missing-start') {
          assert.equal(run.result.started, false);
          assert.equal(run.result.launch.status, 'error');
          assert(
            !run.events.some(
              (event: { stage: string }) => event.stage !== 'launch',
            ),
          );
        } else assert.equal(run.result.setup.status, 'error');
      }
      assert.equal(
        (
          await collectNative(
            artifactDirectory,
            path.join(control.root, 'reports'),
            'invalid-stream',
          )
        ).attempts,
        2,
      );
    },
  );

test(
  'a completed native parent cannot pass after a descendant exhausts the stage timeout',
  { skip: process.platform === 'win32' },
  async (t) => {
    const control = await nativeCheckout('timeout-after-completion');
    t.after(() => rm(control.root, { recursive: true, force: true }));
    const artifactDirectory = path.join(control.root, 'observed');
    const result = await control.api.runNativeAcceptance({
      ...control.options,
      artifactDirectory,
      scenarioIds: ['skill-02'],
      maxModelSessions: 2,
      // Keep the fixture startup budget; only the stage deadline is under test.
      limits: { ...control.options.limits, setupMs: 800, taskMs: 800 },
    });
    for (const { run } of result.experiments[0].runs) {
      assert.equal(run.result.setup.status, 'error');
      assert.equal(run.result.setup.reason, 'native-execution-failed');
      assert.equal(run.result.task.status, 'skip');
      const index = JSON.parse(
        await readFile(
          path.join(artifactDirectory, run.result.id + '-sessions.json'),
          'utf8',
        ),
      );
      const trace = JSON.parse(
        await readFile(
          path.join(artifactDirectory, index.sessions[0].file),
          'utf8',
        ),
      );
      assert.equal(trace.exitCode, 0);
      assert.equal(trace.timedOut, true);
    }
  },
);

test('failed sessions retain timing and safe hints without raw stderr, and collector keeps their outcomes', async (t) => {
  const control = await nativeCheckout('rate-diagnostic');
  t.after(() => rm(control.root, { recursive: true, force: true }));
  const artifactDirectory = path.join(control.root, 'observed');
  const began = Date.now();
  const result = await control.api.runNativeAcceptance({
    ...control.options,
    artifactDirectory,
    scenarioIds: ['skill-02'],
    maxModelSessions: 2,
  });
  for (const { run } of result.experiments[0].runs) {
    assert.equal(run.result.setup.status, 'error');
    assert.equal(run.result.task.status, 'skip');
    const index = JSON.parse(
      await readFile(
        path.join(artifactDirectory, run.result.id + '-sessions.json'),
        'utf8',
      ),
    );
    assert.equal(index.sessions.length, 1);
    const bytes = await readFile(
      path.join(artifactDirectory, index.sessions[0].file),
      'utf8',
    );
    assert.equal(hashContent(bytes), index.sessions[0].hash);
    const trace = JSON.parse(bytes);
    assert.equal(trace.exitCode, 1);
    assert.equal(trace.timedOut, false);
    assert(Date.parse(trace.timing.startedAt) >= began);
    assert(Date.parse(trace.timing.endedAt) <= Date.now());
    assert(Number.isFinite(trace.timing.durationMs));
    assert(trace.timing.durationMs >= 0);
    assert.equal(trace.diagnostics.httpStatus.value, 429);
    assert.deepEqual(trace.diagnostics.retryAfterSeconds, {
      value: 7,
      source: 'stderr-header',
    });
    assert.deepEqual(trace.diagnostics.requestIdHash, {
      value: hashContent('synthetic-request-id'),
      source: 'stderr-header',
    });
    assert.equal(trace.diagnostics.serverCode, null);
    assert.equal(trace.diagnostics.internalRetryCount, null);
    assert.deepEqual(trace.usage, { inputTokens: null, outputTokens: null });
    for (const privateText of [
      'sk-synthetic-private-value-1234567890',
      'Authorization',
      'Private prompt text',
      'synthetic-request-id',
    ])
      assert(!bytes.includes(privateText), privateText);
    assert.equal(trace.stderr, undefined);
  }
  const collected = await collectNative(
    artifactDirectory,
    path.join(control.root, 'reports'),
    'safe-diagnostics',
  );
  assert.equal(collected.attempts, 2);
});

test('first-wave profiles are explicit; unavailable ZCode retains both slots without Codex or a model', async (t) => {
  assert.deepEqual(firstWaveProfiles, ['codex', 'claude-code', 'zcode']);
  const root = await mkdtemp(
    path.join(os.tmpdir(), 'tibicen-profile-control-'),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  const probe = await probeNativeCli('zcode', path.join(root, 'missing-zcode'));
  assert.equal(probe.modelRequests, 0);
  assert.equal(probe.preflight.reason, 'native-cli-unavailable');
  const preflightPath = path.join(root, 'preflight.json');
  await writeFile(preflightPath, JSON.stringify(probe));
  const artifactDirectory = path.join(root, 'observed');
  const options = {
    profile: 'zcode' as const,
    preflightPath,
    artifactDirectory,
    sourceSha: 'a'.repeat(40),
    experimentId: 'blocked-zcode-control',
    scenarioIds: ['skill-01'],
    repeats: 1,
    maxModelSessions: 4,
    limits: { launchMs: 1000, setupMs: 1000, taskMs: 1000, maxCostUsd: null },
  };
  const result = await runNativeAcceptance(options);
  assert.equal(result.experiments[0].runs.length, 2);
  for (const { run } of result.experiments[0].runs) {
    assert.equal(run.result.started, false);
    assert.equal(
      run.result.launch.reason,
      'native-process-containment-unavailable',
    );
    assert.equal(run.experiment.profiles[0].agent, 'zcode');
  }
  assert.deepEqual(
    await collectNative(
      artifactDirectory,
      path.join(root, 'reports'),
      'blocked',
    ),
    { schema: 1, attempts: 2, sessions: 0, cohorts: 1 },
  );
  await assert.rejects(runNativeAcceptance({ ...options, repeats: Infinity }), {
    code: 'invalid-native-budget',
  });
  await assert.rejects(
    runNativeAcceptance({ ...options, profile: 'cursor' as 'zcode' }),
    { code: 'invalid-native-profile' },
  );
  await writeFile(
    preflightPath,
    JSON.stringify({
      ...probe,
      preflight: {
        status: 'ready',
        startupControlled: true,
        authProtected: true,
        processTreeControlled: true,
        isolation: 'controlled',
      },
    }),
  );
  const stale = await runNativeAcceptance({
    ...options,
    artifactDirectory: path.join(root, 'stale-ready'),
  });
  assert(
    stale.experiments[0].runs.every(
      ({ run }) =>
        run.result.launch.reason === 'native-process-containment-unavailable',
    ),
  );
});

test('CLI discovery uses version/help only, an empty HOME and no inherited provider credentials', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-cli-control-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const binary = path.join(root, 'zcode'),
    log = path.join(root, 'calls.jsonl');
  await writeFile(
    binary,
    `#!${process.execPath}\nconst fs=require('node:fs');fs.appendFileSync(${JSON.stringify(log)},JSON.stringify({args:process.argv.slice(2),home:process.env.HOME,entries:fs.readdirSync(process.env.HOME),env:Object.keys(process.env)})+'\\n');console.log(process.argv[2]==='--version'?'zcode 0.0.0-control':'Control help');`,
    { mode: 0o755 },
  );
  const probe = await probeNativeCli('zcode', binary);
  assert.equal(probe.cli.version, 'zcode 0.0.0-control');
  assert.equal(probe.modelRequests, 0);
  assert.equal(
    probe.preflight.reason,
    'native-process-containment-unavailable',
  );
  const calls = (await readFile(log, 'utf8'))
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.deepEqual(
    calls.map((call) => call.args),
    [['--version'], ['--help']],
  );
  for (const call of calls) {
    assert.notEqual(call.home, os.homedir());
    assert.deepEqual(call.entries, []);
    assert.deepEqual(
      call.env
        .filter((name: string) => name !== '__CF_USER_TEXT_ENCODING')
        .sort(),
      ['HOME', 'PATH', 'TMPDIR'],
    );
  }
});

test('desktop ZCode bundle is probed through Node without an executable script or personal data directory', async (t) => {
  const root = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'tibicen-desktop-zcode-')),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  const entry = path.join(root, 'desktop entry.cjs'),
    log = path.join(root, 'calls.jsonl');
  await writeFile(
    entry,
    `const fs=require('node:fs');fs.appendFileSync(${JSON.stringify(log)},JSON.stringify({args:process.argv.slice(2),home:process.env.HOME,data:process.env.ZCODE_DATA_BASE_DIR,entries:fs.readdirSync(process.env.HOME),env:Object.keys(process.env)})+'\\n');console.log(process.argv[2]==='--version'?'zcode desktop control':'Control help');`,
    { mode: 0o644 },
  );
  const probe = await preflightZCode(entry);
  assert.equal(probe.cli.version, 'zcode desktop control');
  assert.equal(probe.cli.path, await realpath(process.execPath));
  assert.deepEqual(probe.cli.entrypoint, {
    path: entry,
    hash: hashContent(await readFile(entry)),
  });
  assert.equal(
    probe.preflight.reason,
    'native-process-containment-unavailable',
  );
  assert.equal(probe.modelRequests, 0);
  const calls = (await readFile(log, 'utf8'))
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.deepEqual(
    calls.map((call) => call.args),
    [['--version'], ['--help']],
  );
  for (const call of calls) {
    assert.notEqual(call.home, os.homedir());
    assert.equal(call.data, call.home);
    assert.deepEqual(call.entries, []);
    assert.deepEqual(
      call.env
        .filter((name: string) => name !== '__CF_USER_TEXT_ENCODING')
        .sort(),
      ['HOME', 'PATH', 'TMPDIR', 'ZCODE_DATA_BASE_DIR'],
    );
  }
  await assert.rejects(preflightZCode(path.join(root, 'missing-zcode.cjs')), {
    code: 'ENOENT',
  });
  const missing = await preflightZCode(path.join(root, 'missing-zcode'));
  assert.equal(missing.cli.path, null);
});

test(
  'cancelling CLI discovery stops detached descendants before probing another command',
  { skip: process.platform === 'win32', timeout: 10000 },
  async (t) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-cli-cancel-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    const binary = path.join(root, 'zcode'),
      marker = path.join(root, 'ready.json'),
      late = path.join(root, 'survived');
    await writeFile(
      binary,
      `#!${process.execPath}
const {spawn}=require('node:child_process'),fs=require('node:fs');
const child=spawn(process.execPath,['-e',${JSON.stringify(`process.send('ready');setTimeout(()=>require('node:fs').writeFileSync(${JSON.stringify(late)},'bad'),800);setInterval(()=>{},1000);`)}],{stdio:['ignore','ignore','ignore','ipc']});
child.on('message',()=>fs.writeFileSync(${JSON.stringify(marker)},JSON.stringify({pid:process.pid,home:process.env.HOME})));
setInterval(()=>{},1000);`,
      { mode: 0o755 },
    );
    const entry = path.join(root, 'probe.mjs');
    await writeFile(
      entry,
      `import {probeNativeCli} from ${JSON.stringify(new URL('../../scripts/evals/profiles/probe-cli.ts', import.meta.url).href)};try{await probeNativeCli('zcode',${JSON.stringify(binary)});}catch(error){if(error.code!=='native-preflight-aborted')throw error;}`,
    );
    const child = spawn(process.execPath, [entry], { stdio: 'ignore' });
    t.after(() => child.kill('SIGKILL'));
    const closed = new Promise((resolve) =>
      child.once('close', (code, signal) => resolve({ code, signal })),
    );
    let ready: { pid: number; home: string } | undefined;
    for (let i = 0; i < 200 && !ready; i++) {
      await delay(20);
      ready = await readFile(marker, 'utf8')
        .then(JSON.parse)
        .catch(() => undefined);
    }
    assert(ready);
    t.after(() => {
      try {
        process.kill(-ready!.pid, 'SIGKILL');
      } catch {
        /* Already gone. */
      }
    });
    t.after(() => rm(ready!.home, { recursive: true, force: true }));
    child.kill('SIGTERM');
    assert.deepEqual(await closed, { code: 0, signal: null });
    await assert.rejects(readFile(ready.home), { code: 'ENOENT' });
    await delay(900);
    await assert.rejects(readFile(late), { code: 'ENOENT' });
  },
);

test(
  'CLI discovery discards an oversized version and cleans its isolated home',
  { skip: process.platform === 'win32', timeout: 10000 },
  async (t) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-cli-cap-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    const binary = path.join(root, 'zcode'),
      marker = path.join(root, 'home');
    await writeFile(
      binary,
      `#!${process.execPath}
const fs=require('node:fs');fs.writeFileSync(${JSON.stringify(marker)},process.env.HOME);
if(process.argv.includes('--version')){fs.writeSync(1,'v'.repeat(200000));setInterval(()=>{},1000);}
else console.log('offline help');
`,
      { mode: 0o755 },
    );
    const result = await probeNativeCli('zcode', binary);
    assert.equal(result.cli.version, 'unavailable');
    assert.equal(result.cli.helpHash, hashContent('offline help\n'));
    assert.equal(result.preflight.reason, 'native-cli-version-unverified');
    assert.equal(result.modelRequests, 0);
    const home = await readFile(marker, 'utf8');
    await assert.rejects(readFile(home), { code: 'ENOENT' });
  },
);

test('source transport replays product provenance checks and has no fallback for other URLs', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-source-control-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const filename = path.join(root, 'mirror.json');
  await captureNativeSources(filename, await sourceControl());
  const result = await loadNativeSources(filename);
  assert.equal(result.sources.length, 2);
  const { fetch: original } = globalThis;
  try {
    Function(nativeSourcePreload(result.mirror))();
    await assert.rejects(fetch('https://example.com'), /Unfrozen/);
    await assert.rejects(
      fetch(result.mirror.responses[0].url, { method: 'POST' }),
      /Unfrozen/,
    );
  } finally {
    globalThis.fetch = original;
  }
  const tampered = structuredClone(result.mirror);
  tampered.responses.find((item) => item.url.includes('/git/blobs/'))!.body =
    JSON.stringify({
      encoding: 'base64',
      content: Buffer.from('changed').toString('base64'),
    });
  await writeFile(filename, JSON.stringify(tampered));
  await assert.rejects(loadNativeSources(filename), {
    code: 'source-hash-mismatch',
  });
});

test('acceptance kernel validates pinned composition and the actual apply receipt', async (t) => {
  const parent = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'tibicen-kernel-control-')),
  );
  t.after(() => rm(parent, { recursive: true, force: true }));
  const fixture = (await loadAcceptanceMatrix()).find(
    (item) => item.scenario.id === 'skill-01',
  )!;
  const { root } = await materializeScenario(fixture.scenario, parent),
    { sources } = await nativeSourcePins();
  const source = sources[0],
    changes = source.files!.map((file) => ({
      path: file.path,
      content: fixture.scenario.files.find(
        (item) => item.path === 'available-sources/ponytail/' + file.sourcePath,
      )!.content,
      reason: 'Install the exact selected source file.',
    }));
  const kernel = await createProposal(
    root,
    {
      mode: 'improve',
      sources: [source],
      changes,
      checks: {},
      compat: { enabled: false },
    },
    { home: parent },
  );
  const proposal = {
    summary: 'Pinned composition',
    changes: changes.map(({ path, content }) => ({ path, content })),
    commands: [],
    kernelPlan: JSON.stringify(kernel),
    question: null,
  };
  const scope = { home: parent, sources };
  await assert.rejects(
    reviewNativeProposal(
      {
        ...proposal,
        kernelPlan: JSON.stringify({
          mode: 'improve',
          sources: [source],
          changes,
          checks: {},
          compat: { enabled: false },
        }),
      },
      fixture.scenario,
      'setup',
      root,
      scope,
    ),
    { code: 'native-proposal-rejected' },
  );
  const reviewed = await reviewNativeProposal(
    proposal,
    fixture.scenario,
    'setup',
    root,
    scope,
  );
  assert(reviewed.receipt);
  const reference = {
    ...proposal,
    kernelPlan: 'proposal-sha256:' + kernel.digest,
  };
  const outputs = [{ output: JSON.stringify(kernel), exitCode: 0 }];
  const referenced = await reviewNativeProposal(
    reference,
    fixture.scenario,
    'setup',
    root,
    scope,
    'setup',
    outputs,
  );
  assert.deepEqual(referenced.kernel, reviewed.kernel);
  assert.deepEqual(referenced.receipt, reviewed.receipt);
  for (const output of [
    [],
    [{ ...outputs[0], exitCode: 1 }],
    [
      {
        output: JSON.stringify({
          ...kernel,
          proposal: { ...kernel.proposal, mode: 'init' },
        }),
        exitCode: 0,
      },
    ],
  ])
    await assert.rejects(
      reviewNativeProposal(
        reference,
        fixture.scenario,
        'setup',
        root,
        scope,
        'setup',
        output,
      ),
      { code: 'native-proposal-rejected' },
    );
  await assert.rejects(
    reviewNativeProposal(
      { ...reference, kernelPlan: 'proposal-sha256:' + 'a'.repeat(64) },
      fixture.scenario,
      'setup',
      root,
      scope,
      'setup',
      outputs,
    ),
    { code: 'native-proposal-rejected' },
  );
  await assert.rejects(
    reviewNativeProposal(
      {
        ...reference,
        changes: [
          { ...proposal.changes[0], content: 'changed' },
          ...proposal.changes.slice(1),
        ],
      },
      fixture.scenario,
      'setup',
      root,
      scope,
      'setup',
      outputs,
    ),
    { code: 'native-proposal-rejected' },
  );
  const executableKernel = {
    ...kernel.proposal,
    commands: [
      {
        id: 'unapproved-test',
        envNames: [],
        executable: 'node',
        argv: ['--test'],
        cwd: '.',
        kind: 'project-test',
      },
    ],
  };
  const executableDigest = digest(executableKernel);
  await assert.rejects(
    reviewNativeProposal(
      { ...proposal, kernelPlan: 'proposal-sha256:' + executableDigest },
      fixture.scenario,
      'setup',
      root,
      scope,
      'setup',
      [
        {
          exitCode: 0,
          output: JSON.stringify({
            proposal: executableKernel,
            digest: executableDigest,
          }),
        },
      ],
    ),
    { code: 'native-proposal-rejected' },
  );
  for (const mutation of [
    { ...kernel.proposal, usageFile: '/outside/usage.json' },
    { ...kernel.proposal, sources: [{ ...source, license: 'unknown' }] },
    {
      ...kernel.proposal,
      sources: [
        {
          ...source,
          files: [{ ...source.files![0], contentHash: hashContent('changed') }],
        },
      ],
    },
    { ...kernel.proposal, compat: { enabled: true } },
  ]) {
    await assert.rejects(
      reviewNativeProposal(
        {
          ...proposal,
          kernelPlan: JSON.stringify({
            proposal: mutation,
            digest: digest(mutation),
          }),
        },
        fixture.scenario,
        'setup',
        root,
        scope,
      ),
      { code: 'native-proposal-rejected' },
    );
  }
  await applyPlan(root, kernel, {
    home: parent,
    approvedDigest: kernel.digest,
    discovery: { fetch: await sourceControl() },
  });
  await checkKernelReceipt(root, reviewed.receipt);
  const manifest = JSON.parse(
    await readFile(path.join(root, '.tibicen/manifest.yml'), 'utf8'),
  );
  manifest.installed[0].sha = 'b'.repeat(40);
  await writeFile(
    path.join(root, '.tibicen/manifest.yml'),
    JSON.stringify(manifest),
  );
  await assert.rejects(checkKernelReceipt(root, reviewed.receipt), {
    code: 'native-plan-mismatch',
  });
});

for (const mode of [
  'normal',
  'skill',
  'sufficient',
  'early-code',
  'boundary-failure',
  'budget',
  'clarification',
  'revision',
  'refusal',
  'repeated-loading',
  'failed-apply-write',
  'utf8-split',
  'metadata-read',
  'metadata-extra-args',
  'metadata-registry-check',
  'metadata-unverified-cli',
  'project-check-before-approval',
  'process-check-before-approval',
  'process-create-before-approval',
  'missing-required-check',
  'missing-process-check',
  'process-skip-design',
  'process-skip-unexplained',
  'process-missing-tasks',
  'process-adopt',
  'kernel-reference',
  'kernel-reference-apply-failure',
  'runtime-write-boundary-failure',
])
  test(
    'native offline protocol: ' + mode,
    { skip: process.platform === 'win32' },
    async (t) => {
      const control = await nativeCheckout(mode);
      t.after(() => rm(control.root, { recursive: true, force: true }));
      const artifactDirectory = path.join(control.root, 'observed');
      const scenarioIds =
        mode === 'process-skip-design'
          ? ['proc-01', 'proc-02-adopt']
          : mode === 'process-adopt'
            ? ['proc-02-adopt', 'proc-02-update']
            : [
                  'metadata-read',
                  'metadata-extra-args',
                  'metadata-registry-check',
                  'project-check-before-approval',
                ].includes(mode)
              ? ['skill-02', 'proc-01']
              : [
                    'skill',
                    'kernel-reference',
                    'kernel-reference-apply-failure',
                  ].includes(mode)
                ? ['skill-01']
                : [
                      'sufficient',
                      'repeated-loading',
                      'utf8-split',
                      'metadata-unverified-cli',
                    ].includes(mode)
                  ? ['skill-02']
                  : mode === 'clarification'
                    ? ['pref-06']
                    : mode === 'revision'
                      ? ['pref-03']
                      : mode === 'refusal'
                        ? ['skill-01-refusal']
                        : ['proc-01'];
      let sourceMirrorPath: string | undefined;
      if (
        [
          'refusal',
          'skill',
          'kernel-reference',
          'kernel-reference-apply-failure',
        ].includes(mode)
      ) {
        sourceMirrorPath = path.join(control.root, 'source-control.json');
        await control.api.captureNativeSources(
          sourceMirrorPath,
          await sourceControl(),
        );
      }
      const result = await control.api.runNativeAcceptance({
        ...control.options,
        artifactDirectory,
        scenarioIds,
        ...(sourceMirrorPath ? { sourceMirrorPath } : {}),
        ...(mode === 'budget' ? { maxModelSessions: 1 } : {}),
      });
      const runs = result.experiments[0].runs;
      assert.equal(runs.length, scenarioIds.length * 2);
      if (['boundary-failure', 'runtime-write-boundary-failure'].includes(mode))
        assert(
          runs.every(
            ({ run }) =>
              !run.result.started &&
              run.result.launch.reason === 'native-runtime-boundary-unverified',
          ),
        );
      else if (mode === 'kernel-reference-apply-failure') {
        assert.equal(runs[0].run.result.setup.status, 'error');
        assert.equal(runs[0].run.result.task.status, 'skip');
        assert.equal(runs[1].run.result.setup.status, 'pass');
        assert.equal(runs[1].run.result.task.status, 'pass');
      } else if (
        [
          'process-skip-design',
          'process-skip-unexplained',
          'process-missing-tasks',
        ].includes(mode)
      ) {
        for (const { run } of runs) {
          const passing =
            mode === 'process-skip-design' &&
            run.result.scenarioId === 'proc-01';
          assert.equal(run.result.setup.status, 'pass');
          assert.equal(
            run.result.task.status,
            passing ? 'pass' : 'error',
            run.result.task.reason,
          );
          const approvals = run.events.filter(
            (event) => event.stage === 'task' && event.kind === 'approval',
          );
          assert.equal(approvals.length, passing ? 3 : 1);
          const index = JSON.parse(
            await readFile(
              path.join(artifactDirectory, run.result.id + '-sessions.json'),
              'utf8',
            ),
          );
          assert.equal(
            index.sessions.some(
              (session: { phase: string }) => session.phase === 'plan-apply',
            ),
            passing,
          );
          assert.equal(
            index.sessions.some(
              (session: { phase: string }) =>
                session.phase === 'implementation-apply',
            ),
            passing,
          );
          if (passing) {
            const proof = run.events.find(
              (event) =>
                event.kind === 'assertion' &&
                event.data.id === 'native-process-planning-preview',
            )!;
            assert(proof.seq < approvals[1].seq);
            const selected = JSON.parse(
              await readFile(
                path.join(artifactDirectory, run.result.id + '-evidence.json'),
                'utf8',
              ),
            );
            assert(
              selected.evidence.some(
                (item: { text: string }) =>
                  item.text.includes('"isPlanningComplete":false') &&
                  item.text.includes('"applyState":"ready"') &&
                  item.text.includes('A local pure export'),
              ),
            );
          } else {
            assert.equal(
              run.result.task.reason,
              mode === 'process-skip-unexplained'
                ? 'native-process-design-skip-invalid'
                : 'native-process-artifacts-missing',
            );
            assert(
              !run.events.some(
                (event) =>
                  event.kind === 'assertion' &&
                  event.data.id === 'native-planning-reviewed',
              ),
            );
          }
        }
      } else if (
        ['missing-required-check', 'missing-process-check'].includes(mode)
      )
        for (const { run } of runs) {
          const stage = mode === 'missing-required-check' ? 'setup' : 'task';
          assert.equal(
            run.result[stage].reason,
            stage === 'setup'
              ? 'native-required-check-not-approved'
              : 'native-process-check-not-approved',
          );
          const approvals = run.events.filter(
            (event) => event.stage === stage && event.kind === 'approval',
          );
          assert.equal(approvals.length, stage === 'setup' ? 0 : 2);
          const index = JSON.parse(
            await readFile(
              path.join(artifactDirectory, run.result.id + '-sessions.json'),
              'utf8',
            ),
          );
          assert(
            !index.sessions.some(
              (session: { phase: string }) =>
                session.phase ===
                (stage === 'setup' ? 'setup-apply' : 'implementation-apply'),
            ),
          );
        }
      else if (mode === 'early-code')
        assert(
          runs.every(
            ({ run }) =>
              run.result.setup.status === 'pass' &&
              run.result.task.reason === 'native-proposal-rejected',
          ),
        );
      else if (mode === 'budget') {
        assert.equal(
          runs[0].run.result.setup.reason,
          'native-budget-exhausted',
        );
        assert(!runs[1].run.result.started);
        assert.equal(
          runs[1].run.result.launch.reason,
          'native-budget-exhausted',
        );
      } else if (
        [
          'metadata-extra-args',
          'metadata-registry-check',
          'metadata-unverified-cli',
          'project-check-before-approval',
        ].includes(mode)
      )
        for (const { run } of runs) {
          assert.equal(
            run.result.setup.reason,
            'native-command-before-approval',
          );
          assert.equal(run.result.setup.status, 'fail');
          assert.equal(run.result.task.status, 'skip');
        }
      else if (
        [
          'process-check-before-approval',
          'process-create-before-approval',
        ].includes(mode)
      )
        for (const { run } of runs) {
          assert.equal(run.result.setup.status, 'pass');
          assert.equal(
            run.result.task.reason,
            'native-command-before-approval',
          );
          assert.equal(run.result.task.status, 'fail');
          assert(
            !run.events.some(
              (event) => event.stage === 'task' && event.kind === 'approval',
            ),
          );
        }
      else if (mode === 'failed-apply-write')
        for (const { run } of runs) {
          assert.equal(run.result.setup.status, 'fail');
          assert.equal(run.result.task.status, 'skip');
          assert(
            run.grades.some(
              (grade) =>
                grade.scope === 'invariants' && grade.verdict === 'fail',
            ),
          );
        }
      else if (mode === 'refusal')
        for (const { run } of runs) {
          assert.equal(run.result.setup.reason, 'user-refused');
          assert.equal(run.result.task.status, 'skip');
          assert(!run.events.some((event) => event.kind === 'approval'));
        }
      else
        for (const { run } of runs) {
          assert.equal(
            run.result.setup.status,
            'pass',
            run.result.setup.reason,
          );
          assert.equal(run.result.task.status, 'pass', run.result.task.reason);
        }
      const collected = await collectNative(
        artifactDirectory,
        path.join(control.root, 'reports'),
        'control',
      );
      assert.equal(collected.attempts, scenarioIds.length * 2);
      if (mode === 'utf8-split')
        for (const { run } of runs) {
          const facts = JSON.parse(
            await readFile(
              path.join(artifactDirectory, run.result.id + '-evidence.json'),
              'utf8',
            ),
          ).evidence;
          assert.equal(
            facts.find(
              (item: { kind: string }) => item.kind === 'recommendation',
            ).text,
            'Сохраняю точный текст Привет',
          );
          assert(
            run.events.some(
              (event) =>
                event.stage === 'task' && event.kind === 'instructions-loaded',
            ),
          );
        }
      if (mode === 'refusal') {
        const saved = JSON.parse(
          await readFile(
            path.join(
              control.root,
              'reports',
              runs[0].run.result.id + '-control-linked-run.json',
            ),
            'utf8',
          ),
        );
        assert.deepEqual(
          saved.events.find((event: { kind: string }) => event.kind === 'usage')
            .data,
          { costUsd: null, inputTokens: 10, outputTokens: 2 },
        );
        const report = JSON.parse(
          await readFile(
            path.join(control.root, 'reports', 'report-control-enriched.json'),
            'utf8',
          ),
        );
        assert(JSON.stringify(report).includes('"inputTokens":10'));
      }
      if (['skill', 'kernel-reference'].includes(mode))
        for (const { run } of runs)
          assert(
            run.events.some(
              (event) =>
                event.stage === 'task' &&
                event.kind === 'instructions-loaded' &&
                event.data.path === '.agents/skills/ponytail/SKILL.md',
            ),
          );
      if (['clarification', 'revision'].includes(mode))
        for (const { run } of runs) {
          const index = JSON.parse(
            await readFile(
              path.join(artifactDirectory, run.result.id + '-sessions.json'),
              'utf8',
            ),
          );
          assert.equal(
            index.sessions.filter(
              (entry: { phase: string }) => entry.phase === 'setup-proposal',
            ).length,
            2,
          );
          assert.equal(
            run.events.filter(
              (event) => event.stage === 'setup' && event.kind === 'approval',
            ).length,
            1,
          );
        }
      if (mode === 'normal') {
        const run = runs[0].run,
          indexPath = path.join(
            artifactDirectory,
            run.result.id + '-sessions.json',
          ),
          index = JSON.parse(await readFile(indexPath, 'utf8'));
        assert.equal(index.sessions.length, 8); // setup and the three task phases, proposal + apply each.
        assert.equal(
          run.events.filter(
            (event) => event.stage === 'task' && event.kind === 'approval',
          ).length,
          3,
        );
        const selected = JSON.parse(
          await readFile(
            path.join(artifactDirectory, run.result.id + '-evidence.json'),
            'utf8',
          ),
        );
        assert.deepEqual(
          [
            ...new Set(
              selected.evidence
                .filter((item: { kind: string }) => item.kind === 'process')
                .map((item: { step: string }) => item.step),
            ),
          ],
          ['specification', 'plan', 'implementation', 'verification'],
        );
        const enriched = JSON.parse(
          await readFile(
            path.join(
              control.root,
              'reports',
              run.result.id + '-control-linked-run.json',
            ),
            'utf8',
          ),
        );
        assert.deepEqual(
          enriched.events
            .filter((event: { kind: string }) => event.kind === 'usage')
            .map((event: { data: unknown }) => event.data),
          [
            { costUsd: null, inputTokens: 20, outputTokens: 4 },
            { costUsd: null, inputTokens: 60, outputTokens: 12 },
          ],
        );
        await rm(path.join(artifactDirectory, index.sessions.at(-1).file));
        await collectNative(
          artifactDirectory,
          path.join(control.root, 'reports'),
          'missing',
        );
        const missing = JSON.parse(
          await readFile(
            path.join(
              control.root,
              'reports',
              run.result.id + '-missing-linked-run.json',
            ),
            'utf8',
          ),
        );
        assert.equal(
          missing.events.find(
            (event: { kind: string; stage: string }) =>
              event.kind === 'usage' && event.stage === 'task',
          ).data.inputTokens,
          null,
        );
        index.sessions.pop();
        await writeFile(indexPath, JSON.stringify(index));
        await assert.rejects(
          collectNative(
            artifactDirectory,
            path.join(control.root, 'reports'),
            'truncated-index',
          ),
          { code: 'invalid-native-cohort' },
        );
      }
    },
  );
