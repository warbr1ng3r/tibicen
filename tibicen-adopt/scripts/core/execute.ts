import type { Command, CommandResult, RunOptions } from './types.ts';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { realpath } from 'node:fs/promises';
import { assert } from './contracts.ts';
import { safePath, validateRelativePath } from './paths.ts';
import { runWindowsCommand } from './windows.ts';

export async function validateExternalExecutable(
  root: string,
  executable: string,
) {
  if (!path.isAbsolute(executable)) return;
  const projectRoot = await realpath(root);
  const absolute = path.resolve(executable);
  const actual = await realpath(absolute).catch(() => absolute);
  assert(
    [absolute, actual].every(
      (filename) =>
        filename !== projectRoot &&
        !filename.startsWith(`${projectRoot}${path.sep}`),
    ),
    'invalid-check-command',
    'Project executables must use a byte-bound ./ entrypoint in the controlled copy.',
  );
}

export const executableName = ({ executable }: { executable: string }) =>
  path
    .basename(executable)
    .replace(/\.(?:exe|com|cmd|bat)$/i, '')
    .toLowerCase();

export function validateCommand(input: unknown): Command {
  const command = input as Command;
  assert(
    command && typeof command.id === 'string',
    'invalid-command',
    'Every command needs an id.',
  );
  assert(
    [
      'build',
      'test',
      'lint',
      'install',
      'git-init',
      'task',
      'quiz',
      'compat',
    ].includes(command.kind),
    'invalid-command',
    'Unsupported command kind.',
  );
  assert(
    typeof command.executable === 'string' &&
      command.executable &&
      !command.executable.includes('\0') &&
      Array.isArray(command.argv) &&
      command.argv.every(
        (arg) => typeof arg === 'string' && !arg.includes('\0'),
      ),
    'invalid-command',
    'Commands need an executable and literal argv.',
  );
  if (command.script !== undefined) {
    assert(
      command.script !== null &&
        typeof command.script.path === 'string' &&
        /^[a-f0-9]{64}$/.test(command.script.hash ?? ''),
      'invalid-command',
      'A script binding needs a safe relative path and its reviewed hash.',
    );
    validateRelativePath(command.script.path);
    // Explicit ./ keeps filenames from becoming interpreter options or subcommands.
    assert(
      command.cwd === '.' &&
        (command.executable === `./${command.script.path}` ||
          command.argv[0] === `./${command.script.path}`),
      'forbidden-command',
      'A bound script must run from the project root as an explicit ./ executable or file argument.',
    );
    // When the binding rides on argv[0], the executable must be the pinned
    // interpreter itself; otherwise the reviewed hash certifies unused bytes.
    assert(
      command.executable === `./${command.script.path}` ||
        ['node', 'python3', 'python', 'bash'].includes(executableName(command)),
      'forbidden-command',
      'A script file argument binds only to a pinned interpreter executable.',
    );
  }
  const executable = executableName(command);
  if (executable === 'bash')
    assert(
      ['build', 'test', 'lint'].includes(command.kind) &&
        path.isAbsolute(command.executable) &&
        command.script !== undefined &&
        command.argv.length === 1 &&
        command.argv[0] === `./${command.script.path}`,
      'forbidden-command',
      'Bash execution is limited to one approved script file bound to its reviewed bytes.',
    );
  else
    assert(
      ![
        'sh',
        'zsh',
        'fish',
        'cmd',
        'powershell',
        'pwsh',
        'npx',
        'env',
        'xargs',
      ].includes(executable),
      'forbidden-command',
      'Shells, command wrappers and dynamic npx are not supported.',
    );
  assert(
    !/\bgit\s+(?:[^\n]*\s)?commit\b/i.test(
      [executable, ...command.argv].join(' '),
    ),
    'forbidden-command',
    'Tibicen never creates commits.',
  );
  assert(
    !command.argv.some((arg) =>
      /\bgit\s+(?:[^\n]*\s)?commit\b|\b(?:deploy|prune|migrate|push)\b/i.test(
        arg,
      ),
    ),
    'forbidden-command',
    'Publishing, migrations and commits are outside this runner.',
  );
  if (executable === 'git')
    assert(
      command.kind === 'git-init' &&
        command.argv.length === 1 &&
        command.argv[0] === 'init',
      'forbidden-command',
      'Git execution is limited to explicit git init.',
    );
  assert(
    !command.argv.some((arg) =>
      ['-e', '--eval', '-c', '--command'].includes(arg),
    ),
    'forbidden-command',
    'Inline code is not an approved project command.',
  );
  if (command.kind === 'install')
    assert(
      command.argv.includes('--ignore-scripts'),
      'forbidden-command',
      'Dependency installation requires --ignore-scripts.',
    );
  assert(
    Array.isArray(command.envNames) &&
      command.envNames.every((name) => /^[A-Z_][A-Z0-9_]*$/i.test(name)),
    'invalid-command',
    'Environment contains names only.',
  );
  assert(
    typeof command.cwd === 'string' && !command.cwd.includes('\0'),
    'invalid-command',
    'Command needs a project-relative cwd.',
  );
  return command;
}

export async function runCommand(
  command: Command,
  {
    root,
    approvedDigest,
    timeoutMs = 30_000,
    signal,
    env = process.env,
  }: RunOptions,
): Promise<
  CommandResult & { stdout: string; stderr: string; timedOut: boolean }
> {
  validateCommand(command);
  assert(
    /^[a-f0-9]{64}$/.test(approvedDigest ?? ''),
    'consent-required',
    'Execution needs approval of the exact proposal.',
  );
  assert(
    command.trusted === true,
    'trust-required',
    'The shown code must be explicitly trusted before execution.',
  );
  const unavailable = (reason: string) => ({
    exitCode: null,
    reason,
    stdout: '',
    stderr: '',
    timedOut: false,
  });
  if (signal?.aborted) return unavailable('aborted');
  const cwd = await safePath(root, command.cwd, { allowDot: true });
  const minimalEnv: NodeJS.ProcessEnv = {};
  for (const name of [
    'PATH',
    'SystemRoot',
    'WINDIR',
    'TMPDIR',
    'TMP',
    'TEMP',
    'LANG',
    ...command.envNames,
  ]) {
    if (env[name] !== undefined) minimalEnv[name] = env[name];
  }
  const secrets = command.envNames
    .filter((name) => /TOKEN|SECRET|PASSWORD|API_KEY|CREDENTIAL/i.test(name))
    .map((name) => env[name])
    .filter((value): value is string => Boolean(value));
  const redact = (text: string) =>
    secrets.reduce(
      (result, value) => result.split(value).join('[redacted]'),
      text,
    );
  if (process.platform === 'win32') {
    const result = await runWindowsCommand(command, {
      cwd,
      env: minimalEnv,
      timeoutMs,
      signal,
    });
    return {
      ...result,
      stdout: redact(result.stdout),
      stderr: redact(result.stderr),
    };
  }
  return new Promise<
    CommandResult & { stdout: string; stderr: string; timedOut: boolean }
  >((resolve) => {
    let stdout = '',
      stderr = '',
      timedOut = false,
      finished = false,
      stopping = false,
      closed = false,
      groupPending = false;
    let exitCode: number | null = null,
      childSignal: NodeJS.Signals | null = null,
      reason: string | undefined;
    let forceTimer: ReturnType<typeof setTimeout> | undefined;
    const child = spawn(command.executable, command.argv, {
      cwd,
      env: minimalEnv,
      shell: false,
      windowsHide: true,
      detached: true,
    });
    const groupSignal = (signal: NodeJS.Signals) => {
      if (!child.pid) return false;
      try {
        process.kill(-child.pid, signal);
        return true;
      } catch (caught) {
        if ((caught as NodeJS.ErrnoException).code === 'ESRCH') return false;
        reason = 'process-tree-uncontrolled';
        return true;
      }
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      clearTimeout(forceTimer);
      signal?.removeEventListener('abort', abort);
      child.stdin.destroy();
      child.stdout.destroy();
      child.stderr.destroy();
      resolve({
        exitCode: reason ? null : exitCode,
        signal: childSignal,
        ...(reason ? { reason } : {}),
        stdout: redact(stdout),
        stderr: redact(stderr),
        timedOut,
      });
    };
    const stop = () => {
      if (stopping) return;
      stopping = true;
      clearTimeout(timer);
      groupPending = groupSignal('SIGTERM');
      // The leader can exit while a descendant still owns the pipes. Keep escalation armed.
      if (groupPending)
        forceTimer = setTimeout(() => {
          groupSignal('SIGKILL');
          finish();
        }, 1000);
      else if (closed || !child.pid) finish();
      else forceTimer = setTimeout(finish, 1000);
    };
    const abort = () => {
      reason ??= 'aborted';
      stop();
    };
    const timer = setTimeout(() => {
      timedOut = true;
      reason ??= 'timeout';
      stop();
    }, timeoutMs);
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    const append = (current: string, chunk: Buffer) =>
      (current + chunk.toString('utf8')).slice(-64 * 1024);
    child.stdout.on('data', (chunk) => {
      stdout = append(stdout, chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr = append(stderr, chunk);
    });
    child.on('error', () => {
      reason ??= 'execution-unavailable';
      stop();
    });
    child.on('exit', (code, value) => {
      exitCode = code;
      childSignal = value;
      stop();
    });
    child.on('close', () => {
      closed = true;
      if (!stopping) stop();
      if (!groupPending) finish();
    });
  });
}
