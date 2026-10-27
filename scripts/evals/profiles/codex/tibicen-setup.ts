import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  chmod,
  lstat,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import {
  assert,
  digest,
  hashContent,
  serializeData,
} from '../../../core/contracts.ts';
import { safePath } from '../../../core/paths.ts';
import { validateScenario } from '../../contracts.ts';
import { loadDiagnostic } from '../../fixtures.ts';
import type { AcceptanceFixture } from '../../matrix.ts';
import { tree } from '../../mechanical.ts';
import type { MechanicalOracle, ReviewedPlan } from '../../mechanical.ts';
import { createProcessSupervisor } from '../../process-supervisor.ts';
import { startContainerSession } from '../../container/session.ts';
import {
  describeContainedCodexRun,
  runContainedCodexSession,
} from '../../contained-codex.ts';
import type { ContainedCodexRunInput } from '../../contained-codex.ts';
import { containedCodexImage } from './contained.ts';
import type { NativeOutput } from '../contracts.ts';

export const setupRuntime = 'support/runtime';
export const setupHome = 'support/home';
export const setupUsage = setupHome + '/.tibicen/usage.json';
export const setupPlan = 'support/plan.json';
export const setupLimits = {
  launchMs: 45000,
  setupMs: 180000,
  taskMs: 180000,
  maxCostUsd: null,
};
const projectServices = [
  '.tibicen/manifest.yml',
  '.tibicen/state/session.json',
];
const services = [
  ...projectServices.map((name) => 'project/' + name),
  setupUsage,
];
export function setupLayout(root: string) {
  const workspace = path.dirname(root);
  return {
    workspace,
    runtime: path.join(workspace, setupRuntime),
    home: path.join(workspace, setupHome),
    plan: path.join(workspace, setupPlan),
  };
}

export function validateSetupMode(scenarioId: string, mode: unknown) {
  assert(
    scenarioId === 'contained-init'
      ? mode === 'init'
      : scenarioId === 'contained-adopt' && mode === 'improve',
    'contained-setup-plan',
    'Compiled proposal mode must match the fixed init/adopt case.',
  );
}
const repository = fileURLToPath(new URL('../../../../', import.meta.url));
const quote = (text: string) => "'" + text.replaceAll("'", "'\\''") + "'";

export interface ContainedTibicenSetupInput {
  binary: string;
  binaryHash: string;
  imageId: string;
  route: ContainedCodexRunInput['route'];
  expectedBatchHash?: string;
}

export async function containedSetupFixtures(): Promise<AcceptanceFixture[]> {
  const { scenario: base, oracle: original } =
    await loadDiagnostic('diagnostic-bare');
  return ['init', 'adopt'].map((mode) => {
    const scenario = structuredClone(base),
      oracle = structuredClone(original) as MechanicalOracle;
    scenario.id = 'contained-' + mode;
    scenario.files =
      mode === 'adopt'
        ? [
            {
              path: 'AGENTS.md',
              content:
                '# Team rules\n\nPreserve the owner review before infrastructure changes.\n',
            },
          ]
        : [];
    scenario.dialogue = [];
    scenario.setup.prompt = `Use Tibicen ${mode} to add one useful AGENTS.md rule for small changes and owner review. Preserve existing useful rules. Only AGENTS.md changes are in scope. No components, sources, MCP, compat, process, application tasks, commands, installs or commits. Obtain the compiled proposal and exact approval before applying. Complete apply, verify, status and report, then explain the observed result.`;
    scenario.setup.allowedPaths = ['AGENTS.md', ...projectServices];
    scenario.setup.allowedCommands = [];
    scenario.setup.replies = [];
    scenario.task.allowedPaths = [];
    scenario.task.allowedCommands = [];
    scenario.task.replies = [];
    oracle.id = scenario.id + '-oracle';
    oracle.setup = {
      allowedPaths: scenario.setup.allowedPaths,
      protectedPaths: [],
      criteria: [
        'Only reviewed AGENTS.md and fixed service state change.',
        'Observed compiled proposal, apply, verify, status and report are required.',
      ],
    };
    oracle.task = {
      allowedPaths: [],
      protectedPaths: [],
      criteria: ['Task is outside this setup-only slice.'],
    };
    scenario.oracle = { id: oracle.id, hash: digest(oracle) };
    return {
      scenario: validateScenario(scenario),
      oracle,
      coverage: ['contained-setup-' + mode],
      interaction: { proposal: 'approve' as const, process: false },
      quality: {
        setup: ['grounding', 'fit', 'sufficiency', 'consistency'],
        task: ['application'],
      },
      controls: {
        sufficient: 'Observed complete AGENTS-only setup.',
        violation: 'Any unapproved effect or missing native verification.',
      },
    };
  });
}

async function frozenAssets() {
  const sums = await readFile(path.join(repository, 'dist/SHA256SUMS'), 'utf8');
  const assets: Record<string, Buffer> = {};
  for (const line of sums.trim().split('\n')) {
    const [hash, name] = line.split('  ');
    assert(
      /^(tibicen-init|tibicen-adopt)\//.test(name),
      'contained-setup-distribution',
      'Unexpected distribution entry.',
    );
    const filename = await safePath(path.join(repository, 'dist'), name);
    assert(
      (await lstat(filename)).isFile(),
      'contained-setup-distribution',
      'Only regular distribution assets are supported.',
    );
    const bytes = await readFile(filename);
    assert(
      hashContent(bytes) === hash,
      'contained-setup-distribution',
      'Build inventory changed.',
    );
    assets[setupRuntime + '/' + name] = bytes;
  }
  for (const skill of ['tibicen-init', 'tibicen-adopt'])
    assert(
      Object.keys(assets).filter((name) =>
        name.startsWith(setupRuntime + '/' + skill + '/'),
      ).length === 43,
      'contained-setup-distribution',
      'Use the complete inspected 43-file bundle.',
    );
  const names = ['package.json', 'pnpm-lock.yaml'];
  async function sourceFiles(relative: string) {
    for (const name of (
      await readdir(path.join(repository, relative))
    ).sort()) {
      const filename = path.posix.join(relative, name);
      const info = await lstat(path.join(repository, filename));
      assert(
        !info.isSymbolicLink(),
        'contained-setup-source-changed',
        'Source inventory cannot contain links.',
      );
      if (info.isDirectory()) await sourceFiles(filename);
      else {
        assert(
          info.isFile(),
          'contained-setup-source-changed',
          'Only regular source files are supported.',
        );
        names.push(filename);
      }
    }
  }
  await sourceFiles('scripts');
  const hashes = Object.fromEntries(
    await Promise.all(
      names.map(async (name) => [
        name,
        hashContent(await readFile(path.join(repository, name))),
      ]),
    ),
  );
  return { assets, sumsHash: hashContent(sums), hashes };
}

export function setupCommand(
  root: string,
  skill: string,
  verb: string,
  tail: string[] = [],
) {
  return (
    'HOME=' +
    quote(setupLayout(root).home) +
    ' node ' +
    [
      path.join(setupLayout(root).runtime, skill, 'scripts/tibicen.ts'),
      verb,
      '--root',
      root,
      ...tail,
    ]
      .map(quote)
      .join(' ')
  );
}

// Only this exact literal grammar is trusted as a Tibicen observation.
export function setupCommandKind(
  command: unknown,
  root: string,
  skill: string,
  approval?: string,
) {
  if (typeof command !== 'string') return null;
  for (const shell of ['/bin/bash', '/bin/sh', '/bin/zsh']) {
    const prefix = shell + ' -c ';
    if (!command.startsWith(prefix)) continue;
    const quoted = command.slice(prefix.length);
    let value = '',
      state = '';
    for (let index = 0; index < quoted.length; index++) {
      const character = quoted[index];
      if (state === "'") {
        if (character === "'") state = '';
        else value += character;
      } else if (character === '\\') {
        const next = quoted[++index];
        if (
          next === undefined ||
          (state === '"' && !['\\', '"', '$', '`'].includes(next)) ||
          next === '\n'
        )
          return null;
        value += next;
      } else if (state === '"') {
        if (character === '"') state = '';
        else {
          if (['$', '`'].includes(character)) return null;
          value += character;
        }
      } else if (character === "'" || character === '"') state = character;
      else {
        if (!/^[a-zA-Z0-9_./:@=+,-]$/.test(character)) return null;
        value += character;
      }
    }
    if (state) return null;
    command = value;
    break;
  }
  if (typeof command !== 'string') return null;
  if (command === "cat '" + path.join(root, 'AGENTS.md') + "'") return 'read';
  const readPrefix =
    "cat '" + path.join(setupLayout(root).runtime, skill) + '/';
  if (command.startsWith(readPrefix) && command.endsWith("'")) {
    const relative = command.slice(readPrefix.length, -1);
    if (
      /^[a-zA-Z0-9_./-]+$/.test(relative) &&
      !relative
        .split('/')
        .some((part) => !part || part === '.' || part === '..')
    )
      return 'read';
  }
  for (const verb of ['scan', 'verify', 'status', 'report'])
    if (command === setupCommand(root, skill, verb)) return verb;
  const proposal = setupCommand(root, skill, 'proposal', ['--input', '-']);
  const prefix = proposal + " <<'TIBICEN_INTENT'\n";
  const suffix = '\nTIBICEN_INTENT';
  if (command.startsWith(prefix) && command.endsWith(suffix)) {
    const body = command.slice(prefix.length, -suffix.length);
    if (Buffer.byteLength(body) > 65536 || /[\r\n]/.test(body)) return null;
    try {
      const value = JSON.parse(body);
      if (value && typeof value === 'object' && !Array.isArray(value))
        return 'proposal';
    } catch {
      return null;
    }
  }
  if (
    approval &&
    command ===
      setupCommand(root, skill, 'apply', [
        '--plan',
        setupLayout(root).plan,
        '--approve',
        approval,
      ])
  )
    return 'apply';
  return null;
}

export function validateSetupActivity(
  parsed: NativeOutput,
  root: string,
  skill: string,
  write: boolean,
  approval?: string,
) {
  parsed.records.forEach((record) =>
    validateSetupRecord(record, root, skill, write, approval),
  );
  assert(
    !parsed.records.some(
      (record) =>
        record.type === 'item.completed' &&
        (record.item as { type?: string })?.type === 'file_change',
    ),
    'contained-setup-command',
    'Native file edits cannot replace a reviewed kernel apply.',
  );
  const kinds = parsed.commands.map((command) => {
    const kind = setupCommandKind(command.command, root, skill, approval);
    assert(
      kind &&
        command.exitCode === 0 &&
        (write
          ? ['read', 'apply', 'verify', 'status', 'report']
          : ['read', 'scan', 'proposal']
        ).includes(kind),
      'contained-setup-command',
      'Only exact reads and the current trusted CLI phase are allowed.',
    );
    return kind;
  });
  for (const verb of write
    ? ['apply', 'verify', 'status', 'report', 'read']
    : ['scan', 'proposal'])
    assert(
      kinds.includes(verb),
      'contained-setup-observation',
      'Missing required trusted setup command.',
    );
  if (write)
    assert(
      parsed.commands.some(
        (command) =>
          setupCommandKind(command.command, root, skill, approval) === 'read' &&
          typeof command.command === 'string' &&
          command.command.includes(path.join(root, 'AGENTS.md')),
      ),
      'contained-setup-observation',
      'Final AGENTS.md bytes must be read.',
    );
}

export function validateSetupRecord(
  record: Record<string, unknown>,
  root: string,
  skill: string,
  write: boolean,
  approval?: string,
) {
  if (!['item.started', 'item.completed'].includes(String(record.type))) return;
  const item = record.item as {
    type?: string;
    command?: unknown;
    exit_code?: number;
  };
  assert(
    item &&
      ['command_execution', 'agent_message', 'reasoning'].includes(
        String(item.type),
      ),
    'contained-setup-command',
    'Unsupported native tool or file edit.',
  );
  if (item.type !== 'command_execution') return;
  const kind = setupCommandKind(item.command, root, skill, approval);
  assert(
    kind &&
      (write
        ? ['read', 'apply', 'verify', 'status', 'report']
        : ['read', 'scan', 'proposal']
      ).includes(kind) &&
      (record.type !== 'item.completed' || item.exit_code === 0),
    'contained-setup-command',
    'Native command rejected at its first record.',
  );
}

export function validateSetupCollection(
  seed: Record<string, Buffer>,
  files: Record<string, Buffer>,
  modes: Record<string, number>,
  plan?: ReviewedPlan,
) {
  const expected = new Map(
    plan?.changes.map((change) => [
      'project/' + change.path,
      change.afterHash,
    ]) ?? [],
  );
  assert(
    !plan ||
      (expected.size === 1 &&
        expected.has('project/AGENTS.md') &&
        expected.get('project/AGENTS.md') !== null),
    'contained-setup-plan',
    'This slice requires one concrete AGENTS.md edit.',
  );
  const allowed = new Set([
    ...Object.keys(seed),
    ...(plan ? ['project/AGENTS.md', ...services] : []),
  ]);
  for (const name of new Set([
    ...Object.keys(seed),
    ...Object.keys(files),
    ...Object.keys(modes),
  ])) {
    assert(
      allowed.has(name),
      'contained-setup-collection',
      'Unexpected returned path.',
    );
    assert(
      files[name] &&
        modes[name] === (plan && services.includes(name) ? 0o600 : 0o644),
      'contained-setup-collection',
      'Missing file or changed mode.',
    );
    if (plan && services.includes(name)) continue;
    const hash = expected.has(name)
      ? expected.get(name)
      : seed[name] && hashContent(seed[name]);
    assert(
      hashContent(files[name]) === hash,
      'contained-setup-collection',
      'Protected or reviewed bytes changed.',
    );
  }
  if (plan) {
    assert(
      files['project/AGENTS.md'] &&
        files['project/.tibicen/manifest.yml'] &&
        files[setupUsage] &&
        !files['project/.tibicen/state/session.json'],
      'contained-setup-collection',
      'Setup must complete its receipt and usage state.',
    );
    const manifest = JSON.parse(
        files['project/.tibicen/manifest.yml'].toString(),
      ),
      usage = JSON.parse(files[setupUsage].toString());
    const receipt = manifest.sessions?.at(-1);
    assert(
      manifest.schema === 2 &&
        manifest.sessions.length === 1 &&
        receipt?.status === 'complete' &&
        usage.schema === 1 &&
        usage.sessions?.length === 1 &&
        usage.sessions[0].id === receipt.id &&
        usage.sessions[0].status === 'complete',
      'contained-setup-collection',
      'Invalid completed service state.',
    );
  }
}

export function validateSetupReports(
  commands: NativeOutput['commands'],
  root: string,
  skill: string,
  approval: string,
) {
  const captures: Record<string, (Record<string, unknown> | null)[]> = {};
  const statuses: Record<string, string> = {
    apply: 'complete',
    verify: 'passed',
    status: 'complete',
    report: 'complete',
  };
  for (const command of commands) {
    const kind = setupCommandKind(command.command, root, skill, approval);
    if (!kind || !Object.hasOwn(statuses, kind)) continue;
    assert(
      command.exitCode === 0,
      'contained-setup-observation',
      'Trusted command did not succeed.',
    );
    let value: unknown = null;
    if (command.output.trim()) {
      try {
        value = JSON.parse(command.output);
      } catch {
        assert(
          false,
          'contained-setup-observation',
          'Captured trusted stdout is not JSON.',
        );
      }
      assert(
        value !== null &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          Object.getPrototypeOf(value) === Object.prototype &&
          (value as { status?: unknown }).status === statuses[kind],
        'contained-setup-observation',
        'Captured trusted stdout has an invalid shape or status.',
      );
    }
    (captures[kind] ??= []).push(value as Record<string, unknown> | null);
  }
  for (const verb of Object.keys(statuses))
    assert(
      captures[verb]?.length,
      'contained-setup-observation',
      'Missing successful trusted CLI observation.',
    );
  return captures;
}

export async function createContainedTibicenSetup(
  input: ContainedTibicenSetupInput,
) {
  input = structuredClone(input);
  assert(
    input.imageId === containedCodexImage &&
      path.isAbsolute(input.binary) &&
      /^[a-f0-9]{64}$/.test(input.binaryHash),
    'contained-setup-input',
    'Use inspected executable and image pins.',
  );
  const captured = await frozenAssets();
  const fixtures = await containedSetupFixtures();
  const freeze = {
    schema: 1,
    layout: {
      project: 'project',
      runtime: setupRuntime,
      home: setupHome,
      plan: setupPlan,
    },
    kind: 'contained-tibicen-setup',
    tibicenOnly: true,
    setupOnly: true,
    order: fixtures.map((item) => item.scenario.id),
    fixturesHash: digest(fixtures),
    binaryHash: input.binaryHash,
    nodeHash: hashContent(await readFile(process.execPath)),
    imageId: input.imageId,
    route:
      input.route.kind === 'subscription'
        ? { kind: 'subscription', model: 'gpt-6-astra' }
        : {
            kind: 'synthetic',
            model: 'gpt-6-astra',
            baseUrl: input.route.baseUrl,
          },
    sourceHashes: captured.hashes,
    sumsHash: captured.sumsHash,
    runtime: Object.fromEntries(
      Object.entries(captured.assets).map(([name, bytes]) => [
        name,
        hashContent(bytes),
      ]),
    ),
    caps: {
      hostSessions: 4,
      sessionsPerCase: 2,
      sessionMs: 90000,
      caseMs: 180000,
      batchMs: 360000,
      retries: 0,
      fallback: false,
      startupSessions: 0,
      judgeSessions: 0,
      paidApi: false,
    },
  };
  const freezeHash = digest(freeze);
  async function validate() {
    assert(
      digest(freeze) === freezeHash,
      'contained-setup-source-changed',
      'Batch freeze changed.',
    );
    const current = await frozenAssets();
    assert(
      digest(current.hashes) === digest(freeze.sourceHashes) &&
        current.sumsHash === freeze.sumsHash &&
        hashContent(await readFile(input.binary)) === input.binaryHash &&
        hashContent(await readFile(process.execPath)) === freeze.nodeHash,
      'contained-setup-source-changed',
      'Frozen batch inputs changed before child launch.',
    );
  }
  async function seed(root: string, skill: string) {
    for (const [name, bytes] of Object.entries(captured.assets).filter(
      ([name]) => name.startsWith(setupRuntime + '/' + skill + '/'),
    ))
      await put(setupLayout(root).workspace, name, bytes);
    await put(
      setupLayout(root).workspace,
      setupHome + '/.keep',
      Buffer.from('contained logical HOME\n'),
    );
    await put(
      setupLayout(root).workspace,
      'project/.tibicen/.keep',
      Buffer.from('contained project directory\n'),
    );
  }
  async function collectSeed(root: string) {
    const workspace = setupLayout(root).workspace;
    const snapshot = await tree(workspace);
    assert(
      snapshot.complete &&
        snapshot.files.every(
          (file) =>
            file.fileMode === (services.includes(file.path) ? 0o600 : 0o644),
        ),
      'contained-setup-seed',
      'Expected a complete regular-file seed with fixed modes.',
    );
    const files: Record<string, Buffer> = Object.fromEntries(
      await Promise.all(
        snapshot.files.map(async (file) => [
          file.path,
          await readFile(await safePath(workspace, file.path)),
        ]),
      ),
    );
    for (const [name, bytes] of Object.entries(files))
      if (name.startsWith(setupRuntime + '/'))
        assert(
          hashContent(bytes) === freeze.runtime[name],
          'contained-setup-runtime-changed',
          'Trusted runtime changed.',
        );
    return files;
  }
  async function run(args: {
    root: string;
    home: string;
    skill: string;
    prompt: string;
    outputSchema?: string;
    deadlineAt: number;
    signal: AbortSignal;
    onStart(): void;
    plan?: ReviewedPlan;
    kernel?: Record<string, unknown>;
    record(kind: string, value: unknown): Promise<void>;
  }) {
    const remaining = () => {
      assert(
        !args.signal.aborted && args.deadlineAt - performance.now() >= 1000,
        'contained-setup-cancelled',
        'Case or batch cancelled or expired before launch.',
      );
      return Math.min(90000, args.deadlineAt - performance.now());
    };
    remaining();
    await validate();
    remaining();
    assert(
      input.route.kind !== 'subscription' ||
        input.expectedBatchHash === freezeHash,
      'contained-setup-freeze-required',
      'Freeze and approve the exact prospective batch before auth.',
    );
    const files = await collectSeed(args.root);
    if (args.kernel) files[setupPlan] = Buffer.from(serializeData(args.kernel));
    const child: ContainedCodexRunInput = {
      binary: input.binary,
      binaryHash: input.binaryHash,
      imageId: input.imageId,
      workspace: setupLayout(args.root).workspace,
      home: args.home,
      files,
      resultPaths: [
        ...new Set([...Object.keys(files), 'project/AGENTS.md', ...services]),
      ],
      model: 'gpt-6-astra',
      route: input.route,
      prompt: args.prompt,
      outputSchema: args.outputSchema,
      onStart: args.onStart,
      deadlineMs: Math.floor(remaining()),
      signal: args.signal,
      deadlineAt: args.deadlineAt,
      onRecord: (record) =>
        validateSetupRecord(
          record,
          args.root,
          args.skill,
          !!args.plan,
          args.kernel ? digest(args.kernel.proposal ?? args.kernel) : undefined,
        ),
    };
    const description = await describeContainedCodexRun(child);
    await args.record('freeze', {
      parentFreezeHash: freezeHash,
      freezeHash: description.freezeHash,
      freeze: description.freeze,
    });
    await validate();
    remaining();
    const output = await runContainedCodexSession({
      ...child,
      expectedFreezeHash: description.freezeHash,
    });
    await args.record('collection', {
      pass: output.pass,
      freezeHash: output.freezeHash,
      cid: output.receipt.cid,
      stopped: output.receipt.stopped,
      removed: output.receipt.removed,
      reason: output.receipt.reason,
      files: Object.fromEntries(
        Object.entries(output.receipt.files).map(([name, bytes]) => [
          name,
          { hash: hashContent(bytes), mode: output.receipt.modes[name] },
        ]),
      ),
      diagnostics:
        'diagnostics' in output.parsed ? output.parsed.diagnostics : null,
      parsed: output.parsed,
    });
    remaining();
    assert(
      output.pass && output.parsed.messages.at(-1)?.trim(),
      'contained-setup-child-failed',
      'Contained native session did not complete.',
    );
    const proposal = args.kernel?.proposal ?? args.kernel;
    validateSetupActivity(
      output.parsed,
      args.root,
      args.skill,
      !!args.plan,
      proposal ? digest(proposal) : undefined,
    );
    validateSetupCollection(
      files,
      output.receipt.files,
      output.receipt.modes,
      args.plan,
    );
    if (args.plan) {
      const usage = JSON.parse(output.receipt.files[setupUsage].toString());
      assert(
        usage.sessions[0].project === hashContent(args.root) &&
          usage.sessions[0].mode === (proposal as { mode?: string }).mode,
        'contained-setup-collection',
        'Logical HOME usage differs from approved project and mode.',
      );
      for (const name of ['project/AGENTS.md', ...services]) {
        remaining();
        if (output.receipt.files[name])
          await put(
            setupLayout(args.root).workspace,
            name,
            output.receipt.files[name],
          );
        else
          await rm(await safePath(setupLayout(args.root).workspace, name), {
            force: true,
          });
      }
    }
    return output;
  }
  async function check(
    root: string,
    skill: string,
    parsed: NativeOutput,
    approval: string,
    signal: AbortSignal,
    deadlineAt: number,
    deadlineMs: number,
  ) {
    const remaining = () => {
      assert(
        !signal.aborted &&
          deadlineAt - performance.now() >= 1000 &&
          deadlineMs >= 1000,
        'contained-setup-cancelled',
        'No independent container after case cancellation or expiry.',
      );
      return Math.min(90000, deadlineMs, deadlineAt - performance.now());
    };
    remaining();
    const observed = validateSetupReports(
      parsed.commands,
      root,
      skill,
      approval,
    );
    await validate();
    remaining();
    const files = await collectSeed(root),
      supervisor = createProcessSupervisor();
    const session = await startContainerSession({
      imageId: input.imageId,
      workspace: setupLayout(root).workspace,
      files,
      deadlineMs: Math.floor(remaining()),
    }).catch((error) => {
      supervisor.dispose();
      throw error;
    });
    const cancel = () => {
      supervisor.cancel();
      void session.stop([], 'parent-cancelled').catch(() => {});
    };
    signal.addEventListener('abort', cancel, { once: true });
    try {
      remaining();
      const script = `const{execFileSync}=require('node:child_process');const results={};for(const verb of ['verify','status','report'])results[verb]=JSON.parse(execFileSync('/usr/local/bin/node',[${JSON.stringify(path.join(setupLayout(root).runtime, skill, 'scripts/tibicen.ts'))},verb,'--root',${JSON.stringify(root)}],{env:{HOME:${JSON.stringify(setupLayout(root).home)},PATH:'/usr/local/bin:/usr/bin:/bin'},timeout:15000,maxBuffer:1048576}).toString());console.log(JSON.stringify(results));`;
      const output = await supervisor.run({
        executable: '/usr/local/bin/docker',
        argv: [
          'exec',
          '--user',
          '1000:1000',
          session.cid,
          '/usr/bin/env',
          '-i',
          'PATH=/usr/local/bin:/usr/bin:/bin',
          '/usr/local/bin/node',
          '-e',
          script,
        ],
        cwd: '/',
        env: {
          PATH: '/usr/bin:/bin',
          DOCKER_HOST: 'unix:///var/run/docker.sock',
          DOCKER_CONFIG: '/nonexistent-tibicen-config',
        },
        timeoutMs: Math.floor(Math.min(60000, remaining())),
        stdoutLimit: 1048576,
        stderrLimit: 65536,
      });
      const receipt = await session.stop(Object.keys(files));
      remaining();
      assert(
        output.status === 0 &&
          !output.timedOut &&
          receipt.stopped &&
          receipt.removed &&
          receipt.reason === 'completed',
        'contained-setup-independent-check',
        'Independent owned-container verification failed.',
      );
      validateSetupCollection(files, receipt.files, receipt.modes);
      const results = JSON.parse(output.stdout);
      assert(
        results.verify?.status === 'passed' &&
          results.status?.status === 'complete' &&
          results.report?.status === 'complete',
        'contained-setup-independent-check',
        'Independent setup verification did not complete.',
      );
      for (const verb of ['verify', 'status', 'report'])
        for (const capture of observed[verb])
          assert(
            capture === null || digest(results[verb]) === digest(capture),
            'contained-setup-independent-check',
            'Captured native output differs from independently computed state.',
          );
      return {
        cid: receipt.cid,
        stopped: receipt.stopped,
        removed: receipt.removed,
        nativeCaptures: Object.fromEntries(
          Object.entries(observed).map(([verb, captures]) => [
            verb,
            {
              available: captures.filter((value) => value !== null).length,
              unavailable: captures.filter((value) => value === null).length,
              captures,
            },
          ]),
        ),
        independentResults: results,
      };
    } finally {
      signal.removeEventListener('abort', cancel);
      supervisor.dispose();
      await session.stop([], 'host-finished');
    }
  }
  return {
    state: 'ready' as const,
    kind: 'contained-tibicen-setup' as const,
    freeze,
    freezeHash,
    fixtures,
    validate,
    seed,
    run,
    check,
    specification: {
      id: 'codex-contained-tibicen-setup',
      agent: 'codex',
      version: '0.157.0',
      model: 'gpt-6-astra',
      auth:
        input.route.kind === 'subscription'
          ? ('subscription' as const)
          : ('none' as const),
      paid: false,
      startupHash: freezeHash,
      permissionsHash: digest({
        image: input.imageId,
        scope: 'closed-workspace',
        mode: 0o644,
      }),
    },
  };
}

async function put(root: string, name: string, bytes: Buffer) {
  const filename = await safePath(root, name);
  await mkdir(path.dirname(filename), { recursive: true });
  const old = await lstat(filename).catch(() => null);
  assert(
    !old || old.isFile(),
    'contained-setup-reconcile',
    'Only fixed regular files can be reconciled.',
  );
  await writeFile(filename, bytes, { mode: 0o644 });
  await chmod(filename, services.includes(name) ? 0o600 : 0o644);
}

export type ContainedTibicenSetup = Awaited<
  ReturnType<typeof createContainedTibicenSetup>
>;
