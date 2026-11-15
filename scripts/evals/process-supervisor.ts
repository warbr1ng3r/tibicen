import { spawn } from 'node:child_process';
import { StringDecoder } from 'node:string_decoder';

export interface SupervisedCommand {
  executable: string;
  argv: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  timeoutMs: number;
  stdoutLimit: number;
  stderrLimit?: number;
  stdin?: { text?: string; keepOpen?: boolean };
  onStdout?: (
    chunk: string,
    controls: { stop: () => void; deadlineIn: (ms: number) => void },
  ) => void;
}

// Trusted commands only: SIGKILL targets the original process group, not detached descendants.
// Untrusted Node checks must use node-check-containment; full native tools stay blocked.
export function createProcessSupervisor() {
  const cancellation = new AbortController(),
    groups = new Set<number>(),
    pending = new Set<() => void>();
  const stop = (pid: number | undefined) => {
    if (pid === undefined) return;
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      /* Already gone. */
    }
  };
  const stopGroups = () => groups.forEach(stop);
  const cancel = () => {
    cancellation.abort();
    pending.forEach((stop) => stop());
    stopGroups();
  };
  process.on('SIGINT', cancel);
  process.on('SIGTERM', cancel);
  process.on('exit', stopGroups);
  return {
    signal: cancellation.signal,
    cancel,
    run(command: SupervisedCommand) {
      return new Promise<{
        status: number | null;
        stdout: string;
        stderr: string;
        timedOut: boolean;
        spawnError: boolean;
      }>((resolve) => {
        const unavailable = {
          status: null,
          stdout: '',
          stderr: '',
          timedOut: false,
          spawnError: false,
        };
        if (cancellation.signal.aborted) return resolve(unavailable);
        const child = spawn(command.executable, command.argv, {
          cwd: command.cwd,
          env: command.env,
          detached: true,
          stdio: [
            command.stdin ? 'pipe' : 'ignore',
            'pipe',
            command.stderrLimit === undefined ? 'ignore' : 'pipe',
          ],
        });
        if (child.pid) groups.add(child.pid);
        let stdout = '',
          stderr = '',
          stdoutBytes = 0,
          stderrBytes = 0,
          timedOut = false,
          outputExceeded = false,
          observationFailed = false,
          settled = false;
        let timer: ReturnType<typeof setTimeout>;
        let drainTimer: ReturnType<typeof setTimeout> | undefined;
        const finish = (status: number | null, spawnError = false) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          clearTimeout(drainTimer);
          pending.delete(stopChild);
          stop(child.pid);
          if (child.pid) groups.delete(child.pid);
          child.stdin?.destroy();
          child.stdout?.destroy();
          child.stderr?.destroy();
          resolve({
            status:
              outputExceeded || observationFailed || cancellation.signal.aborted
                ? null
                : status,
            stdout,
            stderr,
            timedOut,
            spawnError,
          });
        };
        const stopChild = () => {
          stop(child.pid);
          // Escaped descendants can retain inherited pipes after the group dies.
          // Bound draining; this is not a claim that those descendants were contained.
          drainTimer ??= setTimeout(() => finish(null), 100);
        };
        pending.add(stopChild);
        const deadlineIn = (ms: number) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            timedOut = true;
            stopChild();
          }, ms);
        };
        deadlineIn(command.timeoutMs);
        child.stdout!.setEncoding('utf8');
        child.stdout!.on('data', (chunk: string) => {
          const remaining = command.stdoutLimit - stdoutBytes;
          const bytes = Buffer.from(chunk);
          const retained =
            bytes.length <= remaining
              ? chunk
              : new StringDecoder('utf8').write(
                  bytes.subarray(0, Math.max(0, remaining)),
                );
          stdout += retained;
          stdoutBytes += Buffer.byteLength(retained);
          if (bytes.length > remaining) {
            outputExceeded = true;
            stopChild();
          }
          try {
            command.onStdout?.(retained, { stop: stopChild, deadlineIn });
          } catch {
            observationFailed = true;
            stopChild();
          }
        });
        if (child.stderr) {
          child.stderr.setEncoding('utf8');
          child.stderr.on('data', (chunk: string) => {
            const remaining = command.stderrLimit! - stderrBytes;
            const bytes = Buffer.from(chunk);
            const retained =
              bytes.length <= remaining
                ? chunk
                : new StringDecoder('utf8').write(
                    bytes.subarray(0, Math.max(0, remaining)),
                  );
            stderr += retained;
            stderrBytes += Buffer.byteLength(retained);
            if (bytes.length > remaining) {
              outputExceeded = true;
              stopChild();
            }
          });
        }
        if (child.stdin) {
          child.stdin.on('error', () => {});
          if (command.stdin!.keepOpen)
            child.stdin.write(command.stdin!.text ?? '');
          else child.stdin.end(command.stdin!.text);
        }
        child.on('error', () => finish(null, true));
        child.on('close', (status) => finish(status));
      });
    },
    dispose() {
      cancel();
      process.off('SIGINT', cancel);
      process.off('SIGTERM', cancel);
      process.off('exit', stopGroups);
    },
  };
}
