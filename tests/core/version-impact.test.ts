import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  summarizeVersionImpacts,
  validateVersionImpacts,
} from '../../scripts/core/version-impact.ts';
import type { VersionImpact } from '../../scripts/core/version-impact.ts';
import type { ScanResult } from '../../scripts/core/types.ts';

const localHash = 'a'.repeat(64);
const sourceHash = 'b'.repeat(64);

function entry(): VersionImpact {
  return {
    source: {
      url: 'https://docs.example.test/release?view=next',
      checkedAt: '2026-11-07T00:00:00.000Z',
      contentHash: sourceHash,
    },
    versions: { from: 'nightly-old', to: 'custom-current' },
    upstreamChange: 'The host now preserves manual configuration edits.',
    local: {
      path: 'AGENTS.md',
      contentHash: localHash,
      decision: 'Keep the accepted local restrictions.',
    },
    applicability: 'The supplied release note concerns this configured host.',
    action: 'keep',
    reason: 'No replacement of accepted local rules is indicated.',
  };
}

function inventory(): ScanResult {
  return {
    schema: 1,
    root: '/tmp/project',
    kind: 'existing',
    mode: 'improve',
    files: [{ path: 'AGENTS.md', hash: localHash, mode: 0o644 }],
    languages: [],
    commands: [],
    agents: [],
    gaps: [],
    excluded: [],
    complete: true,
  };
}

test('a current local hash retains the supplied explanation without verifying upstream or installation', () => {
  const input = validateVersionImpacts([entry()]);
  const [result] = summarizeVersionImpacts(inventory(), input);
  assert.deepEqual(result.source, {
    ...entry().source,
    basis: 'caller-supplied',
    verification: 'unverified',
  });
  assert.equal(result.local.status, 'matched');
  assert.equal(result.local.hash, localHash);
  assert.equal(result.local.decision, entry().local.decision);
  assert.equal(result.assessment.basis, 'caller-supplied');
  assert.equal(result.assessment.suggestedAction, 'keep');
  assert.equal(result.assessment.upstreamChange, entry().upstreamChange);
  assert.equal(result.assessment.applicability, entry().applicability);
  assert.deepEqual(result.versions, {
    from: 'nightly-old',
    to: 'custom-current',
    basis: 'caller-supplied',
    installedVersion: 'unverified',
  });
  assert.equal(result.loading, 'unverified');
  assert.equal(result.compatibility, 'unverified');
});

test('change and unknown are supplied suggestions, not automatic updates or semver decisions', () => {
  for (const action of ['change', 'unknown'] as const) {
    const value = entry();
    value.action = action;
    value.versions = { from: '999.0.0', to: '1.0.0' };
    const [result] = summarizeVersionImpacts(inventory(), [value]);
    assert.equal(result.assessment.suggestedAction, action);
    assert.equal(result.assessment.basis, 'caller-supplied');
    assert.equal(result.compatibility, 'unverified');
  }
});

test('a changed local source invalidates a previously supplied keep decision', () => {
  const scan = inventory();
  scan.files[0].hash = 'c'.repeat(64);
  const [result] = summarizeVersionImpacts(scan, [entry()]);
  assert.equal(result.local.status, 'changed');
  assert.equal(result.assessment.suggestedAction, 'unknown');
  assert.equal(result.assessment.reason, 'local-source-changed');
  assert.equal(result.local.hash, undefined);
  assert.equal(result.local.decision, undefined);
  assert.equal(result.assessment.upstreamChange, undefined);
  assert.equal(result.source.contentHash, undefined);
});

test('complete absence differs from incomplete inventory but neither authorizes a change', () => {
  for (const complete of [true, false]) {
    const scan = inventory();
    scan.files = [];
    scan.complete = complete;
    const value = entry();
    value.action = 'change';
    const [result] = summarizeVersionImpacts(scan, [value]);
    assert.equal(result.local.status, complete ? 'missing' : 'unverified');
    assert.equal(result.assessment.suggestedAction, 'unknown');
    assert.equal(result.source.contentHash, undefined);
    assert.equal(result.local.hash, undefined);
  }
});

test('forbidden and gapped paths cannot echo supplied hashes, versions or assessment text', () => {
  const canary = 'private-canary';
  const value = entry();
  value.local.path = 'restricted/rules.md';
  value.local.decision = canary;
  value.upstreamChange = canary;
  value.applicability = canary;
  value.reason = canary;
  value.source.url = 'https://docs.example.test/' + canary;
  value.versions = { from: canary, to: canary };
  for (const boundary of ['forbidden', 'excluded', 'gap'] as const) {
    const scan = inventory();
    scan.files[0].path = value.local.path;
    if (boundary === 'excluded')
      scan.excluded = [{ path: 'restricted', reason: 'symlink' }];
    if (boundary === 'gap')
      scan.gaps = [{ path: 'restricted', reason: 'unreadable-directory' }];
    const [result] = summarizeVersionImpacts(
      scan,
      [value],
      boundary === 'forbidden' ? ['restricted/'] : [],
    );
    const output = JSON.stringify(result);
    assert.equal(result.local.status, 'unverified');
    assert.equal(result.assessment.suggestedAction, 'unknown');
    assert.equal(output.includes(canary), false);
    assert.equal(output.includes(localHash), false);
    assert.equal(output.includes(sourceHash), false);
  }
});

test('unrelated scan truncation does not erase a permitted observed source', () => {
  const scan = inventory();
  scan.complete = false;
  scan.gaps = [{ path: '.', reason: 'scan-limit' }];
  const [result] = summarizeVersionImpacts(scan, [entry()]);
  assert.equal(result.local.status, 'matched');
  assert.equal(result.assessment.suggestedAction, 'keep');
});

test('dates, opaque versions and harmless documentation query selectors stay supported', () => {
  const value = entry();
  value.source.checkedAt = '2024-02-29';
  value.source.url = 'https://docs.example.test/path?ref=release&lang=en';
  delete value.versions;
  assert.equal(validateVersionImpacts([value])[0].versions, undefined);
  value.source.checkedAt = '2026-11-07T00:00:00Z';
  assert.equal(
    validateVersionImpacts([value])[0].source.checkedAt,
    value.source.checkedAt,
  );
  assert.deepEqual(validateVersionImpacts([]), []);
  assert.equal(
    validateVersionImpacts(Array.from({ length: 8 }, entry)).length,
    8,
  );
});

test('invalid or oversized evidence is rejected without exposing supplied values', () => {
  const invalid: unknown[] = [
    null,
    {},
    new Array(1),
    Array.from({ length: 9 }, entry),
    [null],
    [{ ...entry(), extra: 'private-canary' }],
    [{ ...entry(), source: { ...entry().source, extra: true } }],
    [{ ...entry(), local: { ...entry().local, extra: true } }],
    [{ ...entry(), versions: {} }],
    [{ ...entry(), versions: { from: '' } }],
    [{ ...entry(), versions: { from: 'x'.repeat(129) } }],
    [{ ...entry(), versions: { observed: '1.0' } }],
    [{ ...entry(), upstreamChange: 'x'.repeat(1001) }],
    [{ ...entry(), applicability: 'line\nbreak' }],
    [{ ...entry(), reason: 'invisible\u2028text' }],
    [{ ...entry(), action: 'upgrade-now' }],
    [{ ...entry(), local: { ...entry().local, path: '../outside' } }],
    [{ ...entry(), local: { ...entry().local, path: '/absolute' } }],
    [{ ...entry(), local: { ...entry().local, contentHash: 'A'.repeat(64) } }],
    [{ ...entry(), source: { ...entry().source, contentHash: 'short' } }],
    ...[
      'http://docs.example.test/release',
      'https://user:private-canary@docs.example.test/release',
      'https://docs.example.test/release#fragment',
      'https://docs.example.test/release?token=private-canary',
      'https://docs.example.test/release?view=a&view=b',
      'https://docs.example.test/has space',
      'https://docs.example.test/\\ambiguous',
    ].map((url) => [{ ...entry(), source: { ...entry().source, url } }]),
    ...['2026-02-30', 'yesterday', '2026-11-07T24:00:00Z'].map((checkedAt) => [
      { ...entry(), source: { ...entry().source, checkedAt } },
    ]),
  ];
  for (const input of invalid)
    assert.throws(
      () => validateVersionImpacts(input),
      (error: unknown) => {
        assert.equal(
          (error as { code?: string }).code,
          'invalid-version-impact',
        );
        assert.equal(String(error).includes('private-canary'), false);
        return true;
      },
    );
});

test('validation and assessment do not mutate caller metadata or inventory', () => {
  const input = [entry()];
  const scan = inventory();
  const before = JSON.stringify({ input, scan });
  const validated = validateVersionImpacts(input);
  summarizeVersionImpacts(scan, validated);
  assert.equal(JSON.stringify({ input, scan }), before);
  assert.notEqual(validated[0], input[0]);
  assert.notEqual(validated[0].local, input[0].local);
  assert.notEqual(validated[0].source, input[0].source);
});
