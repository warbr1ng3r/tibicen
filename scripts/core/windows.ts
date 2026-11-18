import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { lstat, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { assert } from './contracts.ts';
import type { Command, CommandResult } from './types.ts';

export function quoteWindowsArgument(value: string) {
  return `"${value
    .replace(/(\\*)"/g, (_, slashes: string) => `${slashes}${slashes}\\"`)
    .replace(/\\+$/, (slashes) => slashes + slashes)}"`;
}

export function windowsInvocation(
  executable: string,
  argv: string[],
  systemRoot: string,
) {
  assert(
    path.win32.isAbsolute(executable) &&
      ![executable, ...argv].some((value) => value.includes('\0')) &&
      /\.(?:exe|com|cmd|bat)$/i.test(executable),
    'unsupported-windows-command',
    'Windows commands need an absolute native executable or supported batch file without NUL.',
  );
  if (/\.(?:cmd|bat)$/i.test(executable)) {
    assert(
      ![executable, ...argv].some((value) =>
        /["\0\r\n%!^&|<>()]/.test(value),
      ) && !argv.some((value) => value.endsWith('\\')),
      'unsupported-windows-command',
      'Batch arguments cannot contain quotes, expansion/shell characters, newlines or a trailing backslash.',
    );
    const arguments_ = `/d /s /v:off /c "${[executable, ...argv].map((value) => `"${value}"`).join(' ')}"`;
    const cmd = path.win32.join(systemRoot, 'System32', 'cmd.exe');
    assert(
      cmd.length + arguments_.length + 4 <= 8191,
      'unsupported-windows-command',
      'The batch command line exceeds the supported Windows bound.',
    );
    return { executable: cmd, arguments: arguments_ };
  }
  const arguments_ = argv.map(quoteWindowsArgument).join(' ');
  assert(
    quoteWindowsArgument(executable).length + arguments_.length + 2 <= 32767,
    'unsupported-windows-command',
    'The native Windows command line is too long.',
  );
  return { executable, arguments: arguments_ };
}

async function resolveExecutable(
  executable: string,
  cwd: string,
  env: NodeJS.ProcessEnv,
) {
  const explicitPath = path.isAbsolute(executable) || /[\\/]/.test(executable);
  // Never substitute a different suffixed file for a reviewed ./ entrypoint.
  const extensions =
    explicitPath || path.extname(executable)
      ? ['']
      : ['.exe', '.com', '.cmd', '.bat'];
  const candidates = explicitPath
    ? extensions.map((extension) => path.resolve(cwd, executable + extension))
    : (env.PATH ?? '')
        .split(path.delimiter)
        .filter((directory) => directory && path.isAbsolute(directory))
        .flatMap((directory) =>
          extensions.map((extension) =>
            path.join(directory, executable + extension),
          ),
        );
  for (const candidate of candidates)
    if ((await stat(candidate).catch(() => null))?.isFile()) return candidate;
  return null;
}

type Result = CommandResult & {
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

export async function runWindowsCommand(
  command: Command,
  options: {
    cwd: string;
    env: NodeJS.ProcessEnv;
    timeoutMs: number;
    signal?: AbortSignal;
  },
): Promise<Result> {
  const unavailable = (reason: string): Result => ({
    exitCode: null,
    reason,
    stdout: '',
    stderr: '',
    timedOut: false,
  });
  if (options.signal?.aborted) return unavailable('aborted');
  // Bootstrap only from the host system directory, never a project PATH shim.
  const systemRoot = process.env.SystemRoot ?? process.env.WINDIR;
  if (
    !systemRoot ||
    !/^[a-z]:[\\/]/i.test(systemRoot) ||
    systemRoot.includes('\0')
  )
    return unavailable('process-tree-unavailable');
  const launcher = path.join(
    systemRoot,
    'System32',
    'WindowsPowerShell',
    'v1.0',
    'powershell.exe',
  );
  if (!(await stat(launcher).catch(() => null))?.isFile())
    return unavailable('process-tree-unavailable');
  const executable = await resolveExecutable(
    command.executable,
    options.cwd,
    options.env,
  );
  if (!executable) return unavailable('execution-unavailable');
  let invocation;
  try {
    invocation = windowsInvocation(executable, command.argv, systemRoot);
  } catch (caught) {
    return unavailable(
      (caught as { code?: string }).code ?? 'unsupported-windows-command',
    );
  }
  const source = await readFile(
    new URL('./windows-command.ps1', import.meta.url),
    'utf8',
  ).catch(() => null);
  if (!source) return unavailable('process-tree-unavailable');
  const temporary = await mkdtemp(
    path.join(os.tmpdir(), 'tibicen-windows-command-'),
  );
  const receipt = path.join(temporary, 'result.json');
  const nonce = randomUUID();
  try {
    if (options.signal?.aborted) return unavailable('aborted');
    return await new Promise<Result>((resolve) => {
      let stdout = '',
        stderr = '',
        reason: string | undefined,
        timedOut = false,
        settled = false;
      let force: ReturnType<typeof setTimeout> | undefined;
      const child = spawn(
        launcher,
        [
          '-NoLogo',
          '-NoProfile',
          '-NonInteractive',
          '-EncodedCommand',
          Buffer.from(source, 'utf16le').toString('base64'),
        ],
        {
          cwd: options.cwd,
          env: { ...options.env, SystemRoot: systemRoot, WINDIR: systemRoot },
          shell: false,
          windowsHide: true,
        },
      );
      const timer = setTimeout(() => {
        timedOut = true;
        stop('timeout');
      }, options.timeoutMs);
      const finish = async () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clearTimeout(force);
        options.signal?.removeEventListener('abort', abort);
        child.stdin.destroy();
        child.stdout.destroy();
        child.stderr.destroy();
        let exitCode: number | null = null;
        if (!reason) {
          try {
            const info = await lstat(receipt);
            if (!info.isFile() || info.isSymbolicLink() || info.size > 4096)
              throw new Error('Invalid receipt');
            const record = JSON.parse(await readFile(receipt, 'utf8'));
            if (record.schema !== 1 || record.nonce !== nonce)
              throw new Error('Invalid receipt');
            if (
              record.status === 'completed' &&
              Number.isInteger(record.exitCode) &&
              record.exitCode >= 0 &&
              record.exitCode <= 0xffffffff
            )
              exitCode = record.exitCode;
            else if (
              record.status === 'unavailable' &&
              ['process-tree-unavailable', 'execution-unavailable'].includes(
                record.reason,
              )
            )
              reason = record.reason;
            else throw new Error('Invalid receipt');
          } catch {
            reason = 'process-tree-uncontrolled';
          }
        }
        resolve({
          exitCode,
          ...(reason ? { reason } : {}),
          stdout,
          stderr,
          timedOut,
        });
      };
      const stop = (why: string) => {
        if (settled || reason) return;
        reason = why;
        clearTimeout(timer);
        // Killing this helper closes its non-inheritable job handle and its descendants.
        if (!child.kill('SIGKILL')) reason = 'process-tree-uncontrolled';
        force = setTimeout(() => {
          reason = 'process-tree-uncontrolled';
          void finish();
        }, 2500);
      };
      const abort = () => stop('aborted');
      options.signal?.addEventListener('abort', abort, { once: true });
      if (options.signal?.aborted) abort();
      const append = (current: string, chunk: Buffer) =>
        (current + chunk.toString('utf8')).slice(-64 * 1024);
      child.stdout.on('data', (chunk: Buffer) => {
        stdout = append(stdout, chunk);
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr = append(stderr, chunk);
      });
      child.on('error', () => {
        reason ??= 'execution-unavailable';
      });
      child.on('close', () => {
        void finish();
      });
      child.stdin.on('error', () => {
        /* Missing receipt makes a broken launch unavailable. */
      });
      child.stdin.end(
        JSON.stringify({
          schema: 1,
          nonce,
          receipt,
          ...invocation,
          cwd: options.cwd,
        }) + '\n',
      );
    });
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
