import path from 'node:path';
import { createHash } from 'node:crypto';
import { constants, closeSync, openSync, writeFileSync } from 'node:fs';
import { lstat, mkdir, realpath } from 'node:fs/promises';

export interface PrivateDiagnosticsInput {
  directory: string;
}

export const terminalDiagnosticPolicy = Object.freeze({
  version: 2,
  filename: 'terminal-errors.jsonl',
  events: Object.freeze(['error', 'turn.failed', 'executor.error'] as const),
  fields: Object.freeze([
    'message',
    'error.message',
    'error.code',
    'error.type',
  ] as const),
  messageBytes: 1024,
  identifierBytes: 128,
  recordBytes: 16384,
  fileBytes: 65536,
  records: 16,
  executor: Object.freeze({
    processes: 8,
    processBytes: 16384,
    totalBytes: 65536,
  }),
  redaction: 'exact-access-only-values-and-credential-patterns-v1',
});

const code = 'invalid-contained-private-diagnostics';
function assert(
  condition: unknown,
  errorCode: string,
  message: string,
): asserts condition {
  if (!condition) throw Object.assign(new Error(message), { code: errorCode });
}
const inside = (child: string, parent: string) =>
  child === parent || child.startsWith(parent + path.sep);

/** Pure metadata inspection: no file creation and no credential access. */
export async function describePrivateDiagnostics(
  input: PrivateDiagnosticsInput,
  excluded: string[],
) {
  assert(
    input !== null &&
      typeof input === 'object' &&
      Object.keys(input).length === 1 &&
      typeof input.directory === 'string' &&
      path.isAbsolute(input.directory) &&
      path.resolve(input.directory) === input.directory &&
      !/[\0\r\n]/.test(input.directory) &&
      excluded.every(
        (area) =>
          !inside(input.directory, area) && !inside(area, input.directory),
      ),
    code,
    'Use a new private directory outside the workspace and disposable HOME.',
  );
  const parent = path.dirname(input.directory);
  const stat = await lstat(parent);
  assert(
    (await realpath(parent)) === parent &&
      stat.isDirectory() &&
      !stat.isSymbolicLink() &&
      (stat.mode & 0o777) === 0o700 &&
      (process.getuid === undefined || stat.uid === process.getuid()),
    code,
    'The canonical parent must be an owner-only directory.',
  );
  const exists = await lstat(input.directory).catch((error) => {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  });
  assert(!exists, code, 'The diagnostic destination must not exist.');
  return { directory: input.directory, policy: terminalDiagnosticPolicy };
}

function limitedText(value: string, bytes: number) {
  if (Buffer.byteLength(value) <= bytes) return { text: value, cut: false };
  return {
    text: Buffer.from(value)
      .subarray(0, bytes)
      .toString()
      .replace(/\uFFFD$/, ''),
    cut: true,
  };
}

function executorMetadata(value: unknown) {
  const object = (item: unknown): item is Record<string, unknown> =>
    item !== null && typeof item === 'object' && !Array.isArray(item);
  const hash = (item: unknown): item is string | null =>
    item === null || (typeof item === 'string' && /^[a-f0-9]{64}$/.test(item));
  const count = (item: unknown): item is number =>
    Number.isSafeInteger(item) && Number(item) >= 0;
  const statusCode = (item: unknown): item is number | null =>
    item === null ||
    (Number.isInteger(item) &&
      Number(item) >= -2147483648 &&
      Number(item) <= 2147483647);
  assert(
    object(value) && object(value.context),
    code,
    'Invalid executor metadata.',
  );
  const context = value.context;
  assert(
    (value.kind === 'process-exit' || value.kind === 'rpc-error') &&
      statusCode(value.code) &&
      statusCode(value.exitCode) &&
      typeof value.stderrStatus === 'string' &&
      [
        'complete',
        'empty',
        'overflow',
        'invalid',
        'uncorrelated',
        'not-process',
      ].includes(value.stderrStatus) &&
      count(value.stderrBytes) &&
      (context.operation === null || context.operation === 'process/start') &&
      hash(context.requestIdHash) &&
      hash(context.processIdHash) &&
      typeof context.startResponseObserved === 'boolean' &&
      (context.sequence === null || count(context.sequence)) &&
      (context.sandboxDenied === null ||
        typeof context.sandboxDenied === 'boolean'),
    code,
    'Invalid executor metadata.',
  );
  return {
    kind: value.kind,
    code: value.code,
    exitCode: value.exitCode,
    context: {
      operation: context.operation,
      requestIdHash: context.requestIdHash,
      processIdHash: context.processIdHash,
      startResponseObserved: context.startResponseObserved,
      sequence: context.sequence,
      sandboxDenied: context.sandboxDenied,
    },
    stderrStatus: value.stderrStatus,
    stderrBytes: value.stderrBytes,
  };
}

/** Fixed fields only; executor gaps never turn a raw prefix into retained text. */
export function sanitizeTerminalError(
  record: Record<string, unknown>,
  auth?: Buffer,
) {
  const credential = auth ? JSON.parse(auth.toString()) : {};
  const secrets = [
    ...['id_token', 'access_token', 'refresh_token', 'account_id'].map(
      (key) => credential.tokens?.[key],
    ),
    credential.OPENAI_API_KEY,
  ]
    .filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    )
    .sort((left, right) => right.length - left.length);
  const exact = secrets.length
    ? new RegExp(
        secrets
          .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('|'),
        'g',
      )
    : undefined;
  let truncated = false;
  const clean = (value: string, max: number) => {
    let text = exact ? value.replace(exact, '<REDACTED>') : value;
    text = text
      .replace(/\bBearer\s+[^\s"',;]+/gi, 'Bearer <REDACTED>')
      .replace(/\b(?:sk|pk)-[A-Za-z0-9_-]{8,}/g, '<REDACTED>')
      .replace(
        /\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
        '<REDACTED>',
      )
      .replace(
        /((?:access[_-]?token|refresh[_-]?token|id[_-]?token|api[_-]?key|authorization|password|secret|cookie|account[_-]?id)\b["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;}]+)/gi,
        '$1<REDACTED>',
      );
    const result = limitedText(text, max);
    truncated ||= result.cut;
    return result.text;
  };
  assert(
    record.type === 'error' ||
      record.type === 'turn.failed' ||
      record.type === 'executor.error',
    code,
    'Only terminal or executor error records may be retained.',
  );
  const executor =
    record.type === 'executor.error'
      ? executorMetadata(record.executor)
      : undefined;
  truncated ||= executor?.stderrStatus === 'overflow';
  const eligible =
    !executor ||
    (executor.kind === 'process-exit' &&
      executor.stderrStatus === 'complete' &&
      executor.context.operation === 'process/start' &&
      executor.context.startResponseObserved &&
      executor.context.requestIdHash !== null &&
      executor.context.processIdHash !== null &&
      executor.context.sequence !== null) ||
    (executor.kind === 'rpc-error' &&
      executor.stderrStatus === 'not-process' &&
      executor.context.requestIdHash !== null);
  const error =
    !executor &&
    record.error &&
    typeof record.error === 'object' &&
    !Array.isArray(record.error)
      ? (record.error as Record<string, unknown>)
      : {};
  const detail = Object.fromEntries(
    ['message', 'code', 'type']
      .filter((key) => typeof error[key] === 'string')
      .map((key) => [
        key,
        clean(
          error[key] as string,
          key === 'message'
            ? terminalDiagnosticPolicy.messageBytes
            : terminalDiagnosticPolicy.identifierBytes,
        ),
      ]),
  );
  return {
    type: record.type,
    detailHash: createHash('sha256')
      .update(JSON.stringify(record))
      .digest('hex'),
    ...(eligible && typeof record.message === 'string'
      ? {
          message: clean(record.message, terminalDiagnosticPolicy.messageBytes),
        }
      : {}),
    ...(Object.keys(detail).length ? { error: detail } : {}),
    ...(executor ? { executor } : {}),
    truncated,
  };
}

export async function createPrivateDiagnostics(
  input: PrivateDiagnosticsInput,
  excluded: string[],
) {
  await describePrivateDiagnostics(input, excluded);
  await mkdir(input.directory, { mode: 0o700 });
  assert(
    (await realpath(input.directory)) === input.directory &&
      ((await lstat(input.directory)).mode & 0o777) === 0o700,
    code,
    'The created diagnostic directory must remain owner-only.',
  );
  const fd = openSync(
    path.join(input.directory, terminalDiagnosticPolicy.filename),
    constants.O_CREAT |
      constants.O_EXCL |
      constants.O_WRONLY |
      constants.O_NOFOLLOW,
    0o600,
  );
  let closed = false,
    failed = false,
    truncated = false,
    records = 0,
    bytes = 0;
  return {
    capture(record: Record<string, unknown>, auth?: Buffer) {
      try {
        assert(!closed, code, 'The diagnostic recorder is closed.');
        const sanitized = sanitizeTerminalError(record, auth);
        const line = JSON.stringify(sanitized) + '\n';
        const size = Buffer.byteLength(line);
        if (
          records >= terminalDiagnosticPolicy.records ||
          size > terminalDiagnosticPolicy.recordBytes ||
          bytes + size > terminalDiagnosticPolicy.fileBytes
        ) {
          truncated = true;
          return;
        }
        writeFileSync(fd, line);
        records++;
        bytes += size;
        truncated ||= sanitized.truncated;
      } catch {
        failed = true;
        throw new Error('private-terminal-diagnostic-write-failed');
      }
    },
    close() {
      if (closed) return;
      closed = true;
      try {
        closeSync(fd);
      } catch {
        failed = true;
      }
    },
    receipt() {
      return {
        status: failed ? 'failed' : records ? 'captured' : 'no-terminal-record',
        records,
        bytes,
        truncated,
      };
    },
  };
}
