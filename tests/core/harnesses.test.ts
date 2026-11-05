import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  HARNESS_PROFILES,
  getHarnessProfile,
  instructionCandidate,
  observedHarnesses,
  harnessInfrastructurePath,
  isHarnessId,
} from '../../scripts/agents/profiles.ts';

test('catalog retains scoped current and legacy identities without executable metadata', async () => {
  assert.equal(HARNESS_PROFILES.length, 13);
  assert.equal(new Set(HARNESS_PROFILES.map(({ id }) => id)).size, 13);
  assert.deepEqual(
    HARNESS_PROFILES.slice(0, 3).map(({ id }) => id),
    ['claude-code', 'codex', 'cursor'],
  );
  assert.deepEqual(
    HARNESS_PROFILES.filter(({ status }) => status === 'legacy').map(
      ({ id }) => id,
    ),
    ['roo-code', 'windsurf'],
  );
  for (const profile of HARNESS_PROFILES) {
    assert.ok(isHarnessId(profile.id));
    assert.ok(profile.documentationScope);
    assert.match(profile.checkedAt, /^2026-\d{2}-\d{2}$/);
    assert.ok(profile.sources.length > 0 && profile.sources.length <= 2);
    assert.ok(
      profile.sources.every((source) => new URL(source).protocol === 'https:'),
    );
    assert.deepEqual(Object.keys(profile).sort(), [
      'checkedAt',
      'documentationScope',
      'id',
      'instructionPaths',
      'label',
      'skillPaths',
      'sources',
      'status',
    ]);
  }
  for (const id of ['aider', 'zcode', 'continue-ide'])
    assert.equal(getHarnessProfile(id)!.skillPaths, null);
  assert.match(getHarnessProfile('opencode')!.documentationScope, /V2/);
  assert.match(
    getHarnessProfile('aider')!.documentationScope,
    /not autodiscovery/,
  );
  assert.match(
    getHarnessProfile('zcode')!.documentationScope,
    /workspace AGENTS\.md only/,
  );
  assert.equal(getHarnessProfile('constructor'), undefined);
  assert.equal(getHarnessProfile('__proto__'), undefined);
  const source = await readFile(
    new URL('../../scripts/agents/profiles.ts', import.meta.url),
    'utf8',
  );
  assert.ok(
    !/^import\s/m.test(source),
    'shared catalog must remain standalone and browser safe',
  );
});

test('shared paths do not identify a harness and configs are not instruction bodies', () => {
  for (const relative of [
    'AGENTS.md',
    'src/AGENTS.md',
    'AGENT.md',
    '.agents/skills/example/SKILL.md',
    'packages/app/.agents/skills/example/SKILL.md',
  ])
    assert.deepEqual(observedHarnesses(relative), []);
  for (const relative of [
    'AGENTS.md',
    'src/AGENTS.md',
    '.agents/skills/example/SKILL.md',
  ])
    assert.ok(harnessInfrastructurePath(relative));
  for (const relative of [
    '.aider.conf.yml',
    '.zcode/config.json',
    '.gemini/settings.json',
    '.github/skills/example/SKILL.md',
    '.cline/skills/example/SKILL.md',
    'CONVENTIONS.md',
    'docs/ordinary.md',
  ])
    assert.equal(instructionCandidate(relative), false, relative);
});

test('native observations include instruction candidates without granting write capabilities', () => {
  const candidates = [
    ['GEMINI.md', 'gemini-cli'],
    ['packages/ui/.github/instructions/ui.instructions.md', 'copilot-cli'],
    ['.cline/rules/project.md', 'cline'],
    ['.clinerules/project.md', 'cline'],
    ['.devin/rules/project.md', 'devin-local'],
    ['AGENTS.local.md', 'devin-local'],
    ['.continue/rules/project.md', 'continue-ide'],
    ['.roo/rules-code/project.md', 'roo-code'],
    ['.roorules-code', 'roo-code'],
    ['.windsurf/global_rules.md', 'windsurf'],
  ];
  for (const [relative, id] of candidates) {
    assert.ok(instructionCandidate(relative), relative);
    assert.ok(harnessInfrastructurePath(relative), relative);
    assert.deepEqual(observedHarnesses(relative), [id]);
  }
  for (const [relative, id] of [
    ['opencode.jsonc', 'opencode'],
    ['.aider.conf.yml', 'aider'],
    ['.zcode/config.json', 'zcode'],
  ]) {
    assert.equal(instructionCandidate(relative), false);
    assert.ok(harnessInfrastructurePath(relative));
    assert.deepEqual(observedHarnesses(relative), [id]);
  }
  for (const [relative, id] of [
    ['packages/ui/CLAUDE.md.extra', 'claude-code'],
    ['.cursor/rules/main.mdc', 'cursor'],
    ['src/.codex/config.toml', 'codex'],
    ['.mcp.json', 'claude-code'],
  ])
    assert.deepEqual(observedHarnesses(relative), [id]);
});
