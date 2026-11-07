import assert from 'node:assert/strict';
import path from 'node:path';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { StringDecoder } from 'node:string_decoder';
import {
  encodeFiles,
  decodeArchive,
  transferLimits,
  relativeFile,
} from './archive.ts';

const docker = '/usr/local/bin/docker';
const dockerEnv = {
  PATH: '/usr/bin:/bin',
  DOCKER_HOST: 'unix:///var/run/docker.sock',
  DOCKER_CONFIG: '/nonexistent-tibicen-config',
};
const outputLimit = transferLimits.total + transferLimits.entries * 1024;

async function command(args: string[], input?: Buffer, limit = outputLimit) {
  return new Promise<{ status: number | null; bytes: Buffer }>((resolve) => {
    const child = spawn(docker, args, {
      env: dockerEnv,
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const chunks: Buffer[] = [];
    let size = 0,
      ended = false;
    const done = (status: number | null) => {
      if (ended) return;
      ended = true;
      clearTimeout(timer);
      resolve({ status, bytes: Buffer.concat(chunks) });
    };
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      done(null);
    }, 15000);
    child.stdout.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        child.kill('SIGKILL');
        done(null);
      } else chunks.push(chunk);
    });
    child.on('error', () => done(null));
    child.on('close', (status) => done(status));
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}

export interface ContainerInput {
  imageId: string;
  workspace: string;
  files: Record<string, Buffer>;
  fileModes?: Record<string, number>;
  deadlineMs: number;
}

interface FailureContext {
  operation: 'process/start' | null;
  requestIdHash: string | null;
  processIdHash: string | null;
  startResponseObserved: boolean;
  sequence: number | null;
  sandboxDenied: boolean | null;
}

type ToolFailure = (
  | { kind: 'rpc-error'; code: number | null }
  | { kind: 'process-exit'; exitCode: number | null }
) & { context: FailureContext };

function ordinaryProcessExit(params: unknown) {
  if (!params || typeof params !== 'object' || Array.isArray(params))
    return false;
  const { processId, seq, exitCode, sandboxDenied } = params as Record<
    string,
    unknown
  >;
  // Pinned executor schema: String, u64, i32, Option<bool>. Correlation is optional.
  return (
    typeof processId === 'string' &&
    Number.isSafeInteger(seq) &&
    Number(seq) >= 0 &&
    Number.isInteger(exitCode) &&
    Number(exitCode) >= -2147483648 &&
    Number(exitCode) <= 2147483647 &&
    (sandboxDenied === undefined ||
      sandboxDenied === null ||
      sandboxDenied === false)
  );
}

function failureCorrelation() {
  const key = randomBytes(32),
    buffer = Buffer.alloc(65536),
    responseDecoder = new TextDecoder('utf-8', { fatal: true }),
    requests = new Map<
      string,
      { process: string | null; responded: boolean; accepted: boolean }
    >(),
    processes = new Map<string, string>();
  let enabled = true,
    size = 0,
    total = 0;
  const object = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object' && !Array.isArray(value);
  const identity = (value: unknown, domain: 'request' | 'process') => {
    if (typeof value === 'string') {
      const bytes = Buffer.from(value);
      if (!bytes.length || bytes.length > 256 || bytes.toString() !== value)
        return null;
    } else if (
      domain !== 'request' ||
      !Number.isSafeInteger(value) ||
      Object.is(value, -0)
    )
      return null;
    return createHmac('sha256', key)
      .update(domain + '\0' + typeof value + '\0')
      .update(String(value))
      .digest('hex');
  };
  const disable = () => {
    enabled = false;
    buffer.fill(0);
    size = 0;
    requests.clear();
    processes.clear();
  };
  const observeRequest = (chunk: Buffer) => {
    if (!enabled) return;
    total += chunk.length;
    if (total > 1024 * 1024) return disable();
    for (let offset = 0; offset < chunk.length && enabled;) {
      const newline = chunk.indexOf(10, offset),
        end = newline < 0 ? chunk.length : newline,
        length = end - offset;
      if (size + length > buffer.length) return disable();
      chunk.copy(buffer, size, offset, end);
      size += length;
      offset = end + 1;
      if (newline < 0) break;
      try {
        const request: unknown = JSON.parse(
          new TextDecoder('utf-8', { fatal: true }).decode(
            buffer.subarray(0, size),
          ),
        );
        if (
          !object(request) ||
          typeof request.method !== 'string' ||
          !request.method
        )
          return disable();
        if (!Object.hasOwn(request, 'id')) {
          if (request.method === 'process/start') return disable();
          continue;
        }
        const id = identity(request.id, 'request');
        if (!id || requests.has(id) || requests.size >= 128) return disable();
        let process: string | null = null;
        if (request.method === 'process/start') {
          process = object(request.params)
            ? identity(request.params.processId, 'process')
            : null;
          if (!process || processes.has(process) || processes.size >= 128)
            return disable();
          processes.set(process, id);
        }
        requests.set(id, { process, responded: false, accepted: false });
      } catch {
        return disable();
      } finally {
        buffer.fill(0, 0, size);
        size = 0;
      }
    }
  };
  const observeResponse = (event: unknown) => {
    if (!enabled || !object(event) || !Object.hasOwn(event, 'id')) return;
    const id = identity(event.id, 'request'),
      request = id ? requests.get(id) : undefined;
    if (
      !request ||
      request.responded ||
      Object.hasOwn(event, 'method') ||
      Object.hasOwn(event, 'result') === Object.hasOwn(event, 'error')
    )
      return disable();
    request.responded = true;
    if (Object.hasOwn(event, 'error')) return;
    if (request.process) {
      if (
        !object(event.result) ||
        identity(event.result.processId, 'process') !== request.process
      )
        return disable();
      request.accepted = true;
    }
  };
  return {
    disable,
    observeRequest,
    observeResponse,
    responseBytes(chunk: Buffer) {
      if (enabled)
        try {
          responseDecoder.decode(chunk, { stream: true });
        } catch {
          disable();
        }
    },
    context(event: Record<string, unknown>, exit: boolean): FailureContext {
      const params = object(event.params) ? event.params : {},
        process = exit ? identity(params.processId, 'process') : null,
        id = exit
          ? process && enabled
            ? processes.get(process)
            : null
          : enabled
            ? identity(event.id, 'request')
            : null,
        request = id ? requests.get(id) : undefined,
        matched = Boolean(request && (!exit || request.accepted));
      return {
        operation: matched && request?.process ? 'process/start' : null,
        requestIdHash: matched ? (id ?? null) : null,
        processIdHash: exit
          ? process
          : matched
            ? (request?.process ?? null)
            : null,
        startResponseObserved: matched && request?.accepted === true,
        sequence:
          exit && Number.isSafeInteger(params.seq) && Number(params.seq) >= 0
            ? Number(params.seq)
            : null,
        sandboxDenied:
          exit && typeof params.sandboxDenied === 'boolean'
            ? params.sandboxDenied
            : null,
      };
    },
  };
}

export function validateContainerInput(input: ContainerInput) {
  assert(
    /^sha256:[a-f0-9]{64}$/.test(input.imageId),
    'pinned-container-image-required',
  );
  assert(
    path.posix.isAbsolute(input.workspace) &&
      input.workspace !== '/' &&
      input.workspace === path.posix.normalize(input.workspace),
  );
  assert(
    /^\/(?:Users|tmp|private\/(?:tmp|var\/folders))\/.+/.test(input.workspace),
    'unsupported-container-workspace',
  );
  relativeFile(input.workspace.slice(1));
  assert(
    Number.isSafeInteger(input.deadlineMs) &&
      input.deadlineMs >= 1000 &&
      input.deadlineMs <= 180000,
  );
  assert(Object.keys(input.files).length > 0);
  assert(
    Object.keys(input.files).every(
      (name) =>
        !name
          .split('/')
          .some((part) => part === '.codex' || part === '.mcp.json'),
    ),
    'unsupported-container-project-config',
  );
  return encodeFiles(input.files, input.workspace.slice(1), input.fileModes);
}

export async function startContainerSession(input: ContainerInput) {
  const archive = validateContainerInput(input);
  const correlation = failureCorrelation();
  const name = 'tibicen-eval-' + randomUUID(),
    owner = randomUUID();
  let cid = '',
    timer: ReturnType<typeof setTimeout> | undefined;
  let attached: ReturnType<typeof spawn> | undefined;
  let attachedDone = Promise.resolve();
  let toolFailure: ToolFailure | null = null;
  let stopPromise:
    | Promise<{
        cid: string;
        reason: string;
        stopped: boolean;
        removed: boolean;
        files: Record<string, Buffer>;
        modes: Record<string, number>;
        toolFailure: ToolFailure | null;
      }>
    | undefined;
  let complete: (value: Awaited<ReturnType<typeof stop>>) => void,
    fail: (error: unknown) => void;
  let notifyFailure: (reason: string) => void;
  // Notify the host before slow Docker cleanup, so no model continuation is sent.
  const failure = new Promise<string>((resolve) => {
    notifyFailure = resolve;
  });
  const finished = new Promise<Awaited<ReturnType<typeof stop>>>(
    (resolve, reject) => {
      complete = resolve;
      fail = reject;
    },
  );
  // Caller may await stop instead; still retain rejection for finished consumers.
  void finished.catch(() => {});
  const owned = async () => {
    const found = await command(
      [
        'inspect',
        '--format',
        '{{.Id}} {{index .Config.Labels "tibicen.owner"}}',
        cid || name,
      ],
      undefined,
      1024,
    );
    if (found.status !== 0) return null;
    const [id, label] = found.bytes.toString().trim().split(' ');
    assert(
      /^[a-f0-9]{64}$/.test(id) && label === owner,
      'container-owner-mismatch',
    );
    return id;
  };
  async function stop(allowed: readonly string[] = [], reason = 'completed') {
    if (stopPromise) return stopPromise;
    correlation.disable();
    if (!['completed', 'host-finished', 'owner-end'].includes(reason))
      notifyFailure(reason);
    stopPromise = (async () => {
      clearTimeout(timer);
      const id = await owned();
      let files: Record<string, Buffer> = Object.create(null),
        modes: Record<string, number> = Object.create(null);
      assert(id, 'container-cleanup-unverified');
      try {
        await command(['kill', '--signal', 'KILL', id], undefined, 1024);
        const waited = await command(['wait', id], undefined, 1024);
        const state = await command(
          ['inspect', '--format', '{{json .State}}', id],
          undefined,
          4096,
        );
        assert(
          waited.status === 0 && state.status === 0,
          'container-stop-unverified',
        );
        const facts = JSON.parse(state.bytes.toString());
        assert(
          facts.Running === false && facts.Pid === 0,
          'container-stop-unverified',
        );
        if (allowed.length) {
          const archive = await command([
            'cp',
            id + ':' + input.workspace + '/.',
            '-',
          ]);
          assert(archive.status === 0, 'container-collection-failed');
          ({ files, modes } = decodeArchive(archive.bytes, allowed));
        }
      } finally {
        const removed = await command(['rm', '-f', id], undefined, 1024);
        assert(
          removed.status === 0 && (await owned()) === null,
          'container-removal-unverified',
        );
      }
      return {
        cid: id,
        reason,
        stopped: true,
        removed: true,
        files,
        modes,
        toolFailure,
      };
    })().finally(async () => {
      if (attached) {
        attached.stdin?.destroy();
        attached.stdout?.destroy();
        attached.stderr?.destroy();
        attached.kill('SIGKILL');
        await attachedDone;
      }
    });
    stopPromise.then(
      (value) => complete(value),
      (error) => fail(error),
    );
    return stopPromise;
  }
  try {
    const created = await command(
      [
        'create',
        '--pull=never',
        '--name',
        name,
        '--label',
        'tibicen.owner=' + owner,
        '--platform=linux/arm64',
        '--network=none',
        '--ipc=private',
        '--cgroupns=private',
        '--cap-drop=ALL',
        '--cap-add=SETUID',
        '--cap-add=SETGID',
        '--security-opt=no-new-privileges:true',
        '--memory=512m',
        '--memory-swap=512m',
        '--cpus=1',
        '--pids-limit=128',
        '--restart=no',
        '--stop-timeout=1',
        '--interactive',
        '--attach=stdin',
        '--attach=stdout',
        '--attach=stderr',
        '--workdir',
        input.workspace,
        input.imageId,
        String(input.deadlineMs),
      ],
      undefined,
      1024,
    );
    assert(
      created.status === 0 &&
        /^[a-f0-9]{64}$/.test(created.bytes.toString().trim()),
      'container-create-failed',
    );
    cid = created.bytes.toString().trim();
    const config = await command(
      ['inspect', '--format', '{{json .Config}}', cid],
      undefined,
      8192,
    );
    assert(config.status === 0);
    const configuration = JSON.parse(config.bytes.toString());
    assert(
      configuration.OpenStdin &&
        configuration.AttachStdin &&
        configuration.StdinOnce,
      'container-lease-required',
    );
    assert(
      (await command(['cp', '-', cid + ':/'], archive, 1024)).status === 0,
      'container-input-copy-failed',
    );
    const child = spawn(docker, ['start', '--attach', '--interactive', cid], {
      env: dockerEnv,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    attached = child;
    attachedDone = new Promise<void>((resolve) =>
      child.once('close', () => resolve()),
    );
    child.stdin.on('error', () => {});
    const decoder = new StringDecoder('utf8');
    let bytes = 0,
      line = '';
    child.stdout.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > outputLimit) {
        child.stdout.pause();
        child.stderr.pause();
        void stop([], 'output-cap').catch(() => {});
        return;
      }
      correlation.responseBytes(chunk);
      line += decoder.write(chunk);
      if (line.length > transferLimits.file) {
        child.stdout.pause();
        child.stderr.pause();
        void stop([], 'protocol-limit').catch(() => {});
        return;
      }
      let next: number;
      while ((next = line.indexOf('\n')) >= 0) {
        const text = line.slice(0, next);
        line = line.slice(next + 1);
        try {
          const event = JSON.parse(text);
          if (!stopPromise) correlation.observeResponse(event);
          if (
            (event.error && event.error.code !== -32004) ||
            (event.method === 'process/exited' &&
              !ordinaryProcessExit(event.params))
          ) {
            if (!stopPromise)
              toolFailure =
                event.error && event.error.code !== -32004
                  ? {
                      kind: 'rpc-error',
                      code: Number.isSafeInteger(event.error.code)
                        ? event.error.code
                        : null,
                      context: correlation.context(event, false),
                    }
                  : {
                      kind: 'process-exit',
                      exitCode: Number.isSafeInteger(event.params?.exitCode)
                        ? event.params.exitCode
                        : null,
                      context: correlation.context(event, true),
                    };
            void stop([], 'tool-failure').catch(() => {});
          }
        } catch {
          void stop([], 'invalid-protocol').catch(() => {});
        }
      }
    });
    child.stderr.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > outputLimit) {
        child.stdout.pause();
        child.stderr.pause();
        void stop([], 'output-cap').catch(() => {});
      }
    });
    child.on('error', () => {
      void stop([], 'attach-error').catch(() => {});
    });
    child.on('close', () => {
      if (!stopPromise) void stop([], 'executor-exit').catch(() => {});
    });
    timer = setTimeout(() => {
      void stop([], 'deadline').catch(() => {});
    }, input.deadlineMs + 1000);
    return {
      cid,
      child,
      finished,
      failure,
      stop,
      observeRequest(chunk: Buffer) {
        if (!stopPromise) correlation.observeRequest(chunk);
      },
    };
  } catch (error) {
    const id = await owned();
    if (id) {
      await command(['kill', '--signal', 'KILL', id], undefined, 1024);
      assert(
        (await command(['rm', '-f', id], undefined, 1024)).status === 0,
        'container-setup-cleanup-failed',
      );
    }
    throw error;
  }
}
