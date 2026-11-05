import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeDiagnosis } from '../../scripts/core/diagnosis.ts';
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
