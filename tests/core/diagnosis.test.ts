import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  summarizeDiagnosis,
  validateTaskContext,
} from '../../scripts/core/diagnosis.ts';
import type { CheckResult, ScanResult } from '../../scripts/core/types.ts';

function scan(paths = ['AGENTS.md']): ScanResult {
  return {
    schema: 1,
    root: '/private/project',
    kind: 'existing',
    mode: 'improve',
    files: paths.map((relative) => ({
      path: relative,
      hash: 'a'.repeat(64),
      mode: 0o644,
      infrastructure: true,
    })),
    languages: [],
    commands: [],
    agents: [],
    gaps: [],
    excluded: [],
    complete: true,
  };
}

function structure(status = 'passed'): CheckResult {
  return {
    kind: 'infrastructure',
    status,
    scope: 'structure-only',
    issues: [],
  };
}

test('current structural damage remains separate from the completed saved session', () => {
  const infrastructure = structure('issues-found');
  infrastructure.issues = [
    {
      path: 'CLAUDE.md',
      agent: 'claude-code',
      reason: 'shared-rule-copy-outdated',
    },
    { path: '.agents/memory.md', reason: 'missing-memory-connection' },
  ];
  const result = summarizeDiagnosis({
    scan: scan(['AGENTS.md', 'CLAUDE.md', '.agents/memory.md']),
    infrastructure,
    session: { id: 'original-session', status: 'complete' },
  });
  assert.deepEqual(result.recordedSession, {
    id: 'original-session',
    status: 'complete',
    basis: 'saved-session',
  });
  assert.equal(result.structure.status, 'issues-found');
  assert.equal(result.structure.issues[0].reason, 'missing-memory-connection');
  assert.equal(result.structure.issues[1].reason, 'shared-rule-copy-outdated');
  assert.equal(result.nextAction.kind, 'review-issues');
});

test('a native setup has no invented session, selected agent, or loading result', () => {
  const result = summarizeDiagnosis({
    scan: scan(),
    infrastructure: structure(),
  });
  assert.equal(result.recordedSession, null);
  assert.deepEqual(result.instructions.candidates, [
    { path: 'AGENTS.md', directory: '.' },
  ]);
  assert.deepEqual(result.instructions.harnessProfiles, []);
  assert.equal(result.instructions.applicability, 'unverified');
  assert.deepEqual(result.instructions.loading, {
    status: 'unverified',
    reason: 'no-current-native-observation',
  });
  assert.deepEqual(result.instructions.use, {
    status: 'unverified',
    reason: 'no-current-behavioral-observation',
  });
  assert(
    result.instructions.adapterContracts.every(
      (adapter) => adapter.installedVersion === 'unverified',
    ),
  );
  assert.equal(
    result.instructions.adapterContracts.find(
      (adapter) => adapter.agent === 'codex',
    )!.checkedVersion,
    '0.157.0',
  );
  assert.equal(
    result.instructions.adapterContracts.find(
      (adapter) => adapter.agent === 'cursor',
    )!.checkedVersion,
    null,
  );
  assert.equal(result.nextAction.kind, 'review-evidence');
  assert.match(result.nextAction.reason, /does not establish sufficiency/);
});

test('documented native profiles remain separate from the checked runtime adapter contracts', () => {
  const observed = scan([
    'GEMINI.md',
    'packages/ui/GEMINI.md',
    '.github/copilot-instructions.md',
    '.continue/rules/project.md',
    '.roo/rules/project.md',
    '.zcode/config.json',
    '.agents/skills/review/SKILL.md',
  ]);
  observed.agents = [
    'copilot-cli',
    'gemini-cli',
    'continue-ide',
    'roo-code',
    'zcode',
    'future-tool',
  ];
  const result = summarizeDiagnosis({
    scan: observed,
    infrastructure: structure(),
  });
  assert.deepEqual(
    result.instructions.candidates.map((file) => file.path),
    [
      '.continue/rules/project.md',
      '.github/copilot-instructions.md',
      '.roo/rules/project.md',
      'GEMINI.md',
      'packages/ui/GEMINI.md',
    ],
  );
  assert.deepEqual(
    result.instructions.harnessProfiles.map((profile) => profile.id),
    observed.agents.slice(0, -1),
  );
  assert.equal(
    result.instructions.harnessProfiles.find(
      (profile) => profile.id === 'roo-code',
    )!.status,
    'legacy',
  );
  assert(
    result.instructions.harnessProfiles.every(
      (profile) => profile.installedVersion === 'unverified',
    ),
  );
  assert.deepEqual(
    result.instructions.adapterContracts,
    summarizeDiagnosis({ scan: scan(), infrastructure: structure() })
      .instructions.adapterContracts,
  );
  assert.deepEqual(
    result.instructions.adapterContracts.map((adapter) => adapter.agent),
    ['claude-code', 'codex', 'cursor'],
  );
  assert.equal(result.instructions.applicability, 'unverified');
  assert.equal(result.instructions.loading.status, 'unverified');
  assert.equal(result.instructions.use.status, 'unverified');
});

test('partial inventory and unverified versions cannot become a clean setup conclusion', () => {
  const partial = scan();
  partial.complete = false;
  partial.gaps = [
    { path: 'nested/AGENTS.md', reason: 'symlink-excluded' },
    { path: '.', reason: 'scan-limit' },
  ];
  const result = summarizeDiagnosis({
    scan: partial,
    infrastructure: structure(),
  });
  assert.equal(result.inventory.complete, false);
  assert.deepEqual(result.inventory.gaps, [
    { path: '.', reason: 'scan-limit' },
    { path: 'nested/AGENTS.md', reason: 'symlink-excluded' },
  ]);
  assert.equal(result.nextAction.kind, 'inspect-gaps');
  const unknownVersion = scan();
  unknownVersion.gaps = [
    { agent: 'claude-code', reason: 'agent-version-unverified' },
  ];
  assert.equal(
    summarizeDiagnosis({ scan: unknownVersion, infrastructure: structure() })
      .nextAction.kind,
    'inspect-gaps',
  );
});

test('root, subtree and conditional rules remain candidates in their own directories', () => {
  const observed = scan([
    'packages/ui/CLAUDE.md',
    'src/AGENTS.md',
    '.cursor/rules/frontend.mdc',
    'AGENTS.md',
    '.claude/rules/backend.md',
    '.agents/skills/example/SKILL.md',
    '.cursorrules',
    'packages/ui/.cursor/rules/local.mdc',
    'packages/ui/.cursorrules',
    'packages/ui/.claude/rules/local.md',
    'packages/ui/.cursor/rules/config.json',
  ]);
  observed.files[1].hash = 'b'.repeat(64);
  const result = summarizeDiagnosis({
    scan: observed,
    infrastructure: structure(),
  });
  assert.deepEqual(result.instructions.candidates, [
    { path: '.claude/rules/backend.md', directory: '.claude/rules' },
    { path: '.cursor/rules/frontend.mdc', directory: '.cursor/rules' },
    { path: '.cursorrules', directory: '.' },
    { path: 'AGENTS.md', directory: '.' },
    {
      path: 'packages/ui/.claude/rules/local.md',
      directory: 'packages/ui/.claude/rules',
    },
    {
      path: 'packages/ui/.cursor/rules/local.mdc',
      directory: 'packages/ui/.cursor/rules',
    },
    { path: 'packages/ui/.cursorrules', directory: 'packages/ui' },
    { path: 'packages/ui/CLAUDE.md', directory: 'packages/ui' },
    { path: 'src/AGENTS.md', directory: 'src' },
  ]);
  assert.deepEqual(result.structure.issues, []);
  assert.match(
    result.instructions.reason,
    /do not establish.*active precedence/,
  );
});

test('policy exclusions limit coverage without exposing their paths or recommending more access', () => {
  const observed = scan();
  observed.excluded = [
    { path: 'private-payroll', reason: 'forbidden-path' },
    { path: '.env.production', reason: 'sensitive-path' },
    { path: 'another-private-area', reason: 'forbidden-path' },
    { path: '.git', reason: 'cache-or-metadata' },
  ];
  const result = summarizeDiagnosis({
    scan: observed,
    infrastructure: structure(),
  });
  assert.equal(observed.complete, true);
  assert.equal(result.inventory.complete, false);
  assert.deepEqual(result.inventory.coverageLimits, [
    'forbidden-path',
    'sensitive-path',
  ]);
  assert.equal(result.nextAction.kind, 'inspect-gaps');
  assert.match(
    result.nextAction.reason,
    /leave excluded paths and permissions unchanged/,
  );
  for (const excluded of observed.excluded) {
    assert(excluded.path);
    assert(!JSON.stringify(result).includes(excluded.path));
  }

  observed.excluded = [{ path: '.git', reason: 'cache-or-metadata' }];
  const metadataOnly = summarizeDiagnosis({
    scan: observed,
    infrastructure: structure(),
  });
  assert.equal(metadataOnly.inventory.complete, true);
  assert.deepEqual(metadataOnly.inventory.coverageLimits, []);
  assert.equal(metadataOnly.nextAction.kind, 'review-evidence');
  assert.deepEqual(
    metadataOnly,
    summarizeDiagnosis({ scan: scan(), infrastructure: structure() }),
  );
});

test('later mutable memory and a saved report do not change the projected diagnosis', () => {
  const observed = scan(['AGENTS.md', '.agents/memory.md']);
  const before = summarizeDiagnosis({
    scan: observed,
    infrastructure: structure(),
  });
  observed.files[1].hash = 'b'.repeat(64);
  observed.files.push({
    path: '.tibicen/report.md',
    hash: 'c'.repeat(64),
    mode: 0o600,
  });
  assert.deepEqual(
    summarizeDiagnosis({ scan: observed, infrastructure: structure() }),
    before,
  );
});

test('interrupted work takes priority over repair suggestions', () => {
  const observed = scan();
  observed.complete = false;
  observed.gaps = [{ path: '.', reason: 'scan-limit' }];
  const result = summarizeDiagnosis({
    scan: observed,
    infrastructure: structure('issues-found'),
    session: { id: 'pending-session', status: 'incomplete' },
    continuationAvailable: true,
  });
  assert.equal(result.recordedSession!.status, 'incomplete');
  assert.equal(result.nextAction.kind, 'review-continuation');
  assert.match(result.nextAction.reason, /before approving/);
});

test('unavailable structural checks require inspection rather than a no-change verdict', () => {
  const infrastructure = structure('unverified');
  infrastructure.reason = 'no-check-scope';
  const result = summarizeDiagnosis({ scan: scan([]), infrastructure });
  assert.equal(result.structure.reason, 'no-check-scope');
  assert.equal(result.nextAction.kind, 'inspect-setup');
});

test('projection leaves input records untouched and omits unrelated content and private root', () => {
  const observed = scan();
  observed.agents = ['gemini-cli'];
  observed.excluded = [{ path: '.env', reason: 'sensitive-path' }];
  const infrastructure = structure('issues-found');
  infrastructure.issues = [{ path: 'AGENTS.md', reason: 'missing-file' }];
  infrastructure.evidence = [{ path: 'PRIVATE_COMMAND_OUTPUT', passed: true }];
  const inputs = { scan: observed, infrastructure };
  const original = JSON.stringify(inputs);
  const result = summarizeDiagnosis(inputs);
  assert.equal(JSON.stringify(inputs), original);
  result.structure.issues[0].reason = 'changed-output';
  result.instructions.candidates[0].path = 'changed-output';
  result.instructions.adapterContracts[0].entrypoints[0] = 'changed-output';
  result.instructions.harnessProfiles[0].instructionPaths[0] = 'changed-output';
  result.instructions.harnessProfiles[0].sources[0] = 'changed-output';
  result.instructions.harnessProfiles[0].skillPaths![0] = 'changed-output';
  assert.equal(JSON.stringify(inputs), original);
  const serialized = JSON.stringify(summarizeDiagnosis(inputs));
  assert(!serialized.includes('/private/project'));
  assert(!serialized.includes('PRIVATE_COMMAND_OUTPUT'));
  assert(!serialized.includes('.env'));
  assert(!serialized.includes('changed-output'));
});

test('task paths are relative to root and retain separate cwd and target relationships', () => {
  const observed = scan([
    'docs/ru/AGENTS.md',
    'src/AGENTS.md',
    'AGENTS.md',
    'docs/AGENTS.md',
  ]);
  const context = {
    agent: 'zcode',
    agentVersion: '1.2.3',
    cwd: 'docs',
    targetPath: 'docs/ru/guide.md',
  };
  const inputs = { scan: observed, infrastructure: structure(), context };
  const before = JSON.stringify(inputs);
  const result = summarizeDiagnosis(inputs);
  const scope = result.instructions.taskScope!;
  assert.deepEqual(scope.context, context);
  assert.equal(scope.contextBasis, 'caller-supplied');
  assert.equal(scope.basis, 'lexical-directory-relationships');
  assert.equal(scope.host.id, 'zcode');
  assert.equal(scope.host.status, 'documented');
  assert.equal(scope.host.installedVersion, 'unverified');
  assert.match(scope.host.documentationScope!, /workspace AGENTS\.md only/);
  assert.deepEqual(
    scope.candidates.map(({ path, cwdRelation, targetRelation }) => ({
      path,
      cwdRelation,
      targetRelation,
    })),
    [
      {
        path: 'AGENTS.md',
        cwdRelation: 'ancestor-or-same',
        targetRelation: 'ancestor-or-same',
      },
      {
        path: 'docs/AGENTS.md',
        cwdRelation: 'ancestor-or-same',
        targetRelation: 'ancestor-or-same',
      },
      {
        path: 'docs/ru/AGENTS.md',
        cwdRelation: 'other-subtree',
        targetRelation: 'ancestor-or-same',
      },
      {
        path: 'src/AGENTS.md',
        cwdRelation: 'other-subtree',
        targetRelation: 'other-subtree',
      },
    ],
  );
  assert.deepEqual(scope.assessment, {
    status: 'unverified',
    reason: 'host-version-configuration-and-session-not-assessed',
  });
  assert.equal(result.instructions.applicability, 'unverified');
  assert.equal(result.instructions.loading.status, 'unverified');
  assert.equal(result.instructions.use.status, 'unverified');
  scope.context.cwd = 'changed';
  scope.host.sources[0] = 'changed';
  scope.candidates[0].path = 'changed';
  assert.equal(JSON.stringify(inputs), before);
});

test('unknown supplied hosts remain distinct from observed markers and native rules remain conditional', () => {
  const observed = scan([
    'src/AGENTS.md',
    'src2/CLAUDE.md',
    '.github/copilot-instructions.md',
    '.github/instructions/frontend.instructions.md',
    '.claude/rules/AGENTS.md',
    'packages/ui/.cursor/rules/frontend.mdc',
  ]);
  observed.agents = ['codex'];
  const result = summarizeDiagnosis({
    scan: observed,
    infrastructure: structure(),
    context: {
      agent: 'future-tool',
      cwd: 'src2',
      targetPath: 'src2/view.ts',
    },
  });
  const scope = result.instructions.taskScope!;
  assert.deepEqual(scope.host, {
    id: 'future-tool',
    status: 'unknown',
    sources: [],
    installedVersion: 'unverified',
  });
  assert(!Object.hasOwn(scope.context, 'agentVersion'));
  assert.equal(
    scope.candidates.find((item) => item.path === 'src/AGENTS.md')!
      .targetRelation,
    'other-subtree',
  );
  assert.equal(
    scope.candidates.find((item) => item.path === 'src2/CLAUDE.md')!
      .targetRelation,
    'ancestor-or-same',
  );
  for (const item of scope.candidates.filter(
    (item) => item.path.startsWith('.') || item.path.startsWith('packages/'),
  )) {
    assert.equal(item.kind, 'conditional-or-host-specific');
    assert.equal(item.cwdRelation, 'unverified');
    assert.equal(item.targetRelation, 'unverified');
  }
  assert(
    result.instructions.adapterContracts.every(
      (adapter) => adapter.installedVersion === 'unverified',
    ),
  );
});

test('legacy reports have no taskScope and an omitted target stays omitted', () => {
  const inputs = {
    scan: scan(['AGENTS.md', '.cursor/rules/frontend.mdc']),
    infrastructure: structure(),
  };
  assert(!Object.hasOwn(summarizeDiagnosis(inputs).instructions, 'taskScope'));
  const result = summarizeDiagnosis({
    ...inputs,
    context: { agent: 'gemini-cli', cwd: '.' },
  });
  const scope = result.instructions.taskScope!;
  assert(!Object.hasOwn(scope.context, 'targetPath'));
  assert(
    scope.candidates.every((item) => item.targetRelation === 'not-supplied'),
  );
  const { taskScope: _scope, ...instructions } = result.instructions;
  assert.deepEqual(instructions, summarizeDiagnosis(inputs).instructions);
});

test('task context accepts bounded versions and canonical project-relative paths', () => {
  const context = {
    agent: 'a'.repeat(64),
    agentVersion: 'v'.repeat(128),
    cwd: '.',
    targetPath: `docs/${'a'.repeat(4091)}`,
  };
  assert.deepEqual(validateTaskContext(context), context);
  assert.deepEqual(
    validateTaskContext({ agent: 'future-tool', cwd: 'документы/guide' }),
    { agent: 'future-tool', cwd: 'документы/guide' },
  );
});

test('invalid task context is rejected without normalization or unknown fields', () => {
  const valid = { agent: 'codex', cwd: '.' };
  const invalid: unknown[] = [
    undefined,
    null,
    [],
    'codex',
    {},
    { cwd: '.' },
    { agent: 'codex' },
    { ...valid, unexpected: true },
    { ...valid, [Symbol('hidden')]: true },
    Object.create(valid),
  ];
  for (const agent of [
    '',
    'Codex',
    'codex,claude-code',
    '-codex',
    'a'.repeat(65),
    null,
    1,
  ])
    invalid.push({ ...valid, agent });
  for (const agentVersion of [
    '',
    ' ',
    ' 1.0',
    '1.0 ',
    'v'.repeat(129),
    '1\n2',
    '1\u00852',
    '1\u200b2',
    '1\u20282',
    null,
    1,
    undefined,
  ])
    invalid.push({ ...valid, agentVersion });
  for (const field of ['cwd', 'targetPath']) {
    for (const value of [
      '',
      '/src',
      'C:src',
      'C:/src',
      '\\src',
      'src\\file',
      '..',
      '../src',
      'src/..',
      'src/./file',
      './src',
      'src//file',
      'src/',
      'src\u0000file',
      'src\nfile',
      'src\u0085file',
      'src\u2028file',
      'a'.repeat(4097),
      1,
      null,
      undefined,
    ])
      invalid.push({ ...valid, [field]: value });
  }
  invalid.push({ ...valid, targetPath: '.' });
  for (const context of invalid)
    assert.throws(() => validateTaskContext(context), {
      code: 'invalid-task-context',
    });
});
