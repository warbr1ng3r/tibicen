import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  chmodSync,
  symlinkSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import path from 'node:path';
const [mode, phase] = process.argv.slice(2);
const hash = (text) => createHash('sha256').update(text).digest('hex');
const stable = (value) =>
  Array.isArray(value)
    ? '[' + value.map(stable).join(',') + ']'
    : value && typeof value === 'object'
      ? '{' +
        Object.keys(value)
          .sort()
          .map((key) => JSON.stringify(key) + ':' + stable(value[key]))
          .join(',') +
        '}'
      : JSON.stringify(value);
const digest = (value) => hash(stable(value));
const lines = createInterface({ input: process.stdin })[Symbol.asyncIterator]();
await lines.next();
const emit = (value) => process.stdout.write(JSON.stringify(value) + '\n');
emit({ kind: 'ready' });
if (mode === 'spoof-host') {
  emit({
    kind: 'observation',
    observation: 'checkpoint',
    data: { point: 'end', complete: true, files: [] },
  });
  process.stdin.destroy();
} else {
  const files =
    phase === 'setup'
      ? { 'AGENTS.md': '# Project\nUse node --test.\n' }
      : {
          'src/math.js':
            'export const double = value => value * 2;\nexport const triple = value => value * 3;\n',
          'tests/math.test.js':
            "import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { double, triple } from '../src/math.js';\ntest('double', () => assert.equal(double(3), 6));\ntest('triple', () => assert.equal(triple(3), 9));\n",
        };
  if (mode === 'exit-zero' && phase === 'task')
    files['src/math.js'] = 'process.exit(0);\n' + files['src/math.js'];
  if (
    phase === 'setup' &&
    [
      'component',
      'metadata-only',
      'loading-only',
      'wrong-sha',
      'wrong-license',
      'update',
      'foreign',
    ].includes(mode)
  ) {
    files['.agents/skills/demo/SKILL.md'] =
      '# Demo\nRead references/rule.md.\n';
    files['.agents/skills/demo/references/rule.md'] =
      'Keep the owner constraint.\n';
    files['.tibicen/manifest.yml'] = JSON.stringify({
      installed: [
        {
          repo: 'owner/demo',
          sha: 'a'.repeat(40),
          license: 'MIT',
          files: [
            {
              path: '.agents/skills/demo/SKILL.md',
              contentHash: hash(files['.agents/skills/demo/SKILL.md']),
            },
            {
              path: '.agents/skills/demo/references/rule.md',
              contentHash: hash(
                files['.agents/skills/demo/references/rule.md'],
              ),
            },
          ],
        },
      ],
    });
    if (mode === 'wrong-license')
      files['.tibicen/manifest.yml'] = files['.tibicen/manifest.yml'].replace(
        'MIT',
        'Apache-2.0',
      );
    if (mode === 'update') files['.agents/skills/demo/obsolete.md'] = null;
  }
  if (phase === 'setup' && ['process', 'missing-process'].includes(mode)) {
    files['openspec/project.md'] = '# Owner process\n';
    files['openspec/changes/example/proposal.md'] = '# Approved proposal\n';
  }
  const changes = Object.entries(files).map(([filename, content]) => {
    let old = null;
    try {
      old = hash(readFileSync(filename));
    } catch {
      // A missing artifact has no previous hash.
    }
    return {
      path: filename,
      beforeHash: old,
      afterHash: content === null ? null : hash(content),
    };
  });
  const plan = {
    changes,
    commandHashes: [digest({ executable: 'node', argv: ['--test'], cwd: '.' })],
  };
  if (mode === 'early' && phase === 'setup')
    writeFileSync('AGENTS.md', files['AGENTS.md']);
  emit({ kind: 'reply', when: 'proposal', proposalDigest: digest(plan) });
  const response = JSON.parse((await lines.next()).value);
  if (response.data?.approvedDigest !== digest(plan)) {
    emit({ kind: 'finished', status: 'fail', reason: 'not-approved' });
  } else {
    for (const [filename, content] of Object.entries(files)) {
      if (mode === 'false-green' && phase === 'task') continue;
      if (mode === 'metadata-only' && filename.includes('/references/'))
        continue;
      if (mode === 'missing-process' && filename.endsWith('/proposal.md'))
        continue;
      mkdirSync(path.dirname(filename), { recursive: true });
      if (content === null) rmSync(filename);
      else
        writeFileSync(
          filename,
          mode === 'wrong-sha' && filename.endsWith('manifest.yml')
            ? content.replace('a'.repeat(40), 'b'.repeat(40))
            : content,
        );
    }
    if (
      ['protected', 'protected-incomplete'].includes(mode) &&
      phase === 'setup'
    )
      writeFileSync('package.json', '{}');
    if (mode === 'protected-incomplete' && phase === 'setup')
      symlinkSync('package.json', 'unobserved-link');
    if (mode === 'permissions' && phase === 'task')
      chmodSync('src/math.js', 0o755);
    if (mode === 'foreign' && phase === 'setup')
      writeFileSync('.agents/skills/demo/local.md', 'Lost owner rules.\n');
    if (mode === 'git' && phase === 'setup') {
      mkdirSync('.git', { recursive: true });
      writeFileSync('.git/HEAD', 'ref: refs/heads/changed\n');
    }
    if (mode === 'unauthorized')
      emit({
        kind: 'observation',
        observation: 'command',
        data: { id: 'unapproved', commandHash: 'd'.repeat(64), exitCode: 0 },
      });
    if (['metadata-only', 'loading-only'].includes(mode))
      emit({
        kind: 'observation',
        observation: 'instructions-loaded',
        data: {
          path: '.agents/skills/demo/SKILL.md',
          contentHash: hash(
            files['.agents/skills/demo/SKILL.md'] ??
              '# Demo\nRead references/rule.md.\n',
          ),
          toolUseId: 'self-report',
        },
      });
    emit({ kind: 'finished', status: 'pass' });
  }
  process.stdin.destroy();
}
