import { spawn } from 'node:child_process';

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
    groups = new Set<number>();
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
          timedOut = false,
          outputExceeded = false;
        const stopChild = () => stop(child.pid);
        let timer: ReturnType<typeof setTimeout>;
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
          const remaining = command.stdoutLimit - stdout.length;
          const retained = chunk.slice(0, Math.max(0, remaining));
          stdout += retained;
          if (chunk.length > remaining) {
            outputExceeded = true;
            stopChild();
          }
          try {
            command.onStdout?.(retained, { stop: stopChild, deadlineIn });
          } catch {
            stopChild();
          }
        });
        if (child.stderr) {
          child.stderr.setEncoding('utf8');
          child.stderr.on('data', (chunk: string) => {
            const remaining = command.stderrLimit! - stderr.length;
            stderr += chunk.slice(0, Math.max(0, remaining));
            if (chunk.length > remaining) {
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
        child.on('error', () => {
          clearTimeout(timer);
          if (child.pid) groups.delete(child.pid);
          resolve({ ...unavailable, timedOut, spawnError: true });
        });
        child.on('close', (status) => {
          clearTimeout(timer);
          stopChild();
          if (child.pid) groups.delete(child.pid);
          resolve({
            status: outputExceeded ? null : status,
            stdout,
            stderr,
            timedOut,
            spawnError: false,
          });
        });
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
