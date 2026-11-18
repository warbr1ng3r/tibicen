import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, chmod } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createProposal } from '../../scripts/core/plan.ts';
import {
  quoteWindowsArgument,
  windowsInvocation,
} from '../../scripts/core/windows.ts';

test('native Windows arguments retain empty strings, spaces, Unicode, quotes and backslashes', () => {
  for (const [value, expected] of [
    ['', '""'],
    ['hello world', '"hello world"'],
    ['Привет', '"Привет"'],
    ['say"hi', '"say\\"hi"'],
    ['C:\\tail\\', '"C:\\tail\\\\"'],
    ['a\\"b', '"a\\\\\\"b"'],
  ])
    assert.equal(quoteWindowsArgument(value), expected);
  assert.deepEqual(
    windowsInvocation(
      'C:\\Program Files\\node.exe',
      ['a b', ''],
      'C:\\Windows',
    ),
    { executable: 'C:\\Program Files\\node.exe', arguments: '"a b" ""' },
  );
});

test('batch commands use only the fixed system interpreter and a conservative literal subset', () => {
  assert.deepEqual(
    windowsInvocation(
      'C:\\Program Files\\npm.cmd',
      ['run', 'test', '', 'a b', 'Привет'],
      'C:\\Windows',
    ),
    {
      executable: 'C:\\Windows\\System32\\cmd.exe',
      arguments:
        '/d /s /v:off /c ""C:\\Program Files\\npm.cmd" "run" "test" "" "a b" "Привет""',
    },
  );
  for (const value of [
    'a"b',
    'a\nb',
    'a\rb',
    'a\0b',
    '%PATH%',
    '!x!',
    '^x',
    'x&y',
    'x|y',
    'x<y',
    'x>y',
    '(x)',
    'C:\\tail\\',
  ])
    assert.throws(
      () => windowsInvocation('C:\\npm.cmd', [value], 'C:\\Windows'),
      { code: 'unsupported-windows-command' },
    );
  assert.throws(
    () => windowsInvocation('C:\\x&y\\npm.cmd', ['run'], 'C:\\Windows'),
    { code: 'unsupported-windows-command' },
  );
  assert.throws(
    () => windowsInvocation('C:\\npm.cmd', ['a'.repeat(8192)], 'C:\\Windows'),
    { code: 'unsupported-windows-command' },
  );
});

test('Windows launch representations refuse NUL, relative executables and unknown scripts', () => {
  for (const executable of [
    'node.exe',
    'C:\\node\0.exe',
    'C:\\script.ps1',
    'C:\\script.js',
  ])
    assert.throws(() => windowsInvocation(executable, [], 'C:\\Windows'), {
      code: 'unsupported-windows-command',
    });
  assert.throws(
    () => windowsInvocation('C:\\node.exe', ['x\0y'], 'C:\\Windows'),
    { code: 'unsupported-windows-command' },
  );
  assert.throws(
    () => windowsInvocation('C:\\node.exe', ['x'.repeat(32767)], 'C:\\Windows'),
    { code: 'unsupported-windows-command' },
  );
});

test('Windows proposal pins an existing native interpreter without POSIX execute bits or execution', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-win-plan-'));
  const tools = await mkdtemp(path.join(os.tmpdir(), 'tibicen-win-tools-'));
  const platform = Object.getOwnPropertyDescriptor(process, 'platform')!;
  const originalPath = process.env.PATH;
  try {
    const executable = path.join(tools, 'node.exe');
    await writeFile(
      executable,
      'This fixture is deliberately not an executable.\n',
    );
    await chmod(executable, 0o666);
    await writeFile(path.join(root, 'check.cjs'), 'process.exit(0);\n');
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.PATH = tools;
    const envelope = await createProposal(root, {
      mode: 'init',
      changes: [
        {
          path: 'AGENTS.md',
          content: '# Instructions\n',
          reason: 'Owned fixture',
        },
      ],
      commands: [
        {
          id: 'test',
          kind: 'test',
          executable: 'node',
          argv: ['./check.cjs'],
          cwd: '.',
          envNames: [],
          trusted: true,
          script: { path: 'check.cjs' },
        },
      ],
      checks: { profile: 'docs' },
      compat: { enabled: false },
    });
    assert.equal(envelope.proposal.commands[0].executable, executable);
    await assert.rejects(readFile(path.join(root, 'AGENTS.md')), {
      code: 'ENOENT',
    });
    assert.equal(
      await readFile(path.join(root, 'check.cjs'), 'utf8'),
      'process.exit(0);\n',
    );
  } finally {
    Object.defineProperty(process, 'platform', platform);
    if (originalPath === undefined) delete process.env.PATH;
    else process.env.PATH = originalPath;
    await rm(root, { recursive: true, force: true });
    await rm(tools, { recursive: true, force: true });
  }
});
