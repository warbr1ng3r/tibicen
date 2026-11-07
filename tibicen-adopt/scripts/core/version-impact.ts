import { assert } from './contracts.ts';
import type { ScanResult } from './types.ts';
import {
  inspectInventoryFile,
  isEvidenceHash,
  isEvidencePath,
} from './report-evidence.ts';

export interface VersionImpact {
  source: { url: string; checkedAt: string; contentHash: string };
  versions?: { from?: string; to?: string };
  upstreamChange: string;
  local: { path: string; contentHash: string; decision: string };
  applicability: string;
  action: 'keep' | 'change' | 'unknown';
  reason: string;
}

function check(condition: unknown): asserts condition {
  assert(
    condition,
    'invalid-version-impact',
    'Version impacts require bounded source, local evidence and assessment metadata.',
  );
}

function record(value: unknown, allowed: string[], required = allowed) {
  check(
    value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      [Object.prototype, null].includes(Object.getPrototypeOf(value)) &&
      Reflect.ownKeys(value).every(
        (key) => typeof key === 'string' && allowed.includes(key),
      ) &&
      required.every((key) => Object.hasOwn(value, key)),
  );
  return value as Record<string, unknown>;
}

function text(value: unknown, limit = 1000) {
  check(
    typeof value === 'string' &&
      value.trim().length > 0 &&
      value === value.trim() &&
      Buffer.byteLength(value) <= limit &&
      !/[\p{C}\u2028\u2029]/u.test(value),
  );
  return value;
}

function sourceUrl(value: unknown) {
  const input = text(value, 2048);
  check(!/[\s\\]/u.test(input));
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    check(false);
  }
  check(
    url.protocol === 'https:' &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.hash,
  );
  const seen = new Set<string>();
  for (const [key, value] of url.searchParams) {
    // Documentation version/locale selectors, never authentication parameters.
    check(
      ['ref', 'version', 'v', 'view', 'lang', 'locale'].includes(key) &&
        !seen.has(key),
    );
    text(value, 256);
    seen.add(key);
  }
  return input;
}

function sourceDate(value: unknown) {
  const input = text(value, 32);
  check(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/.test(input));
  const time = Date.parse(input);
  check(Number.isFinite(time));
  const canonical = new Date(time).toISOString();
  check(
    input === canonical ||
      input === canonical.replace('.000Z', 'Z') ||
      input + 'T00:00:00.000Z' === canonical,
  );
  return input;
}

export function validateVersionImpacts(input: unknown): VersionImpact[] {
  check(Array.isArray(input) && input.length <= 8);
  return Array.from(input, (value) => {
    const item = record(
      value,
      [
        'source',
        'versions',
        'upstreamChange',
        'local',
        'applicability',
        'action',
        'reason',
      ],
      [
        'source',
        'upstreamChange',
        'local',
        'applicability',
        'action',
        'reason',
      ],
    );
    const source = record(item.source, ['url', 'checkedAt', 'contentHash']);
    const local = record(item.local, ['path', 'contentHash', 'decision']);
    check(
      isEvidenceHash(source.contentHash) &&
        isEvidenceHash(local.contentHash) &&
        isEvidencePath(local.path),
    );
    check(['keep', 'change', 'unknown'].includes(item.action as string));
    let versions: VersionImpact['versions'];
    if (Object.hasOwn(item, 'versions')) {
      const supplied = record(item.versions, ['from', 'to'], []);
      check(Object.keys(supplied).length > 0);
      versions = {
        ...(Object.hasOwn(supplied, 'from')
          ? { from: text(supplied.from, 128) }
          : {}),
        ...(Object.hasOwn(supplied, 'to')
          ? { to: text(supplied.to, 128) }
          : {}),
      };
    }
    return {
      source: {
        url: sourceUrl(source.url),
        checkedAt: sourceDate(source.checkedAt),
        contentHash: source.contentHash,
      },
      ...(versions ? { versions } : {}),
      upstreamChange: text(item.upstreamChange),
      local: {
        path: local.path,
        contentHash: local.contentHash,
        decision: text(local.decision),
      },
      applicability: text(item.applicability),
      action: item.action as VersionImpact['action'],
      reason: text(item.reason),
    };
  });
}

export function summarizeVersionImpacts(
  scan: ScanResult,
  entries: VersionImpact[],
  forbiddenPaths: string[] = [],
) {
  return entries.map((entry) => {
    const current = inspectInventoryFile(
      scan,
      entry.local.path,
      forbiddenPaths,
    );
    const matched =
      current.status === 'observed' && current.hash === entry.local.contentHash;
    const status =
      current.status === 'observed'
        ? matched
          ? 'matched'
          : 'changed'
        : current.status;
    return {
      source: {
        basis: 'caller-supplied',
        verification: 'unverified',
        ...(matched ? entry.source : {}),
      },
      versions: {
        basis: 'caller-supplied',
        installedVersion: 'unverified',
        ...(matched ? entry.versions : {}),
      },
      local: {
        path: entry.local.path,
        status,
        ...(matched
          ? { hash: current.hash, decision: entry.local.decision }
          : {}),
      },
      assessment: {
        basis: 'caller-supplied',
        suggestedAction: matched ? entry.action : 'unknown',
        ...(matched
          ? {
              upstreamChange: entry.upstreamChange,
              applicability: entry.applicability,
            }
          : {}),
        reason: matched
          ? entry.reason
          : status === 'changed'
            ? 'local-source-changed'
            : status === 'missing'
              ? 'local-source-missing'
              : 'local-source-unverified',
      },
      loading: 'unverified',
      compatibility: 'unverified',
    };
  });
}
