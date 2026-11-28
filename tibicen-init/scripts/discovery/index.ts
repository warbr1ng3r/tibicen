import type {
  Source,
  Blocklist,
  DiscoveryOptions,
  PathReason,
} from '../core/types.ts';
import { createHash } from 'node:crypto';
import { assert, fail, hashContent } from '../core/contracts.ts';
import { validateRelativePath, isSensitivePath } from '../core/paths.ts';

interface GitHubRepo {
  full_name: string;
  fork?: boolean;
  parent?: { full_name: string };
  archived?: boolean;
  created_at: string;
  default_branch: string;
}
interface GitHubTreeEntry {
  path: string;
  sha: string;
  type: string;
  mode: string;
  size: number;
}
interface GitHubLicense {
  path: string;
  sha: string;
  license?: { spdx_id?: string };
}
interface Candidate {
  repo: string;
  sha: string;
  kind?: string;
  skillPath?: string;
  license: string;
  provenance: string;
  selectionVersion: number;
  files: { sourcePath: string; contentHash: string; fileMode: number }[];
  safety: string;
  applicability: string;
  transport?: string;
  externalVerified?: null;
}

export const SELECTION_VERSION = 1;
const REPO = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/;
const SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const LIMIT = 1024 * 1024;
const INJECTION =
  /(?:ignore|disregard|override)\s+(?:all\s+)?(?:(?:previous|prior)(?:\s+(?:system|developer))?|system|developer)\s+(?:instructions?|prompts?)|(?:exfiltrat|steal)\w*\s+(?:secrets?|tokens?|credentials?)|(?:reveal|print|send)\s+(?:all\s+)?(?:api[_ -]?keys?|secret\s+values)|<\|(?:system|developer)\|>/i;

function sourceIdentity<T extends Pick<Source, 'repo' | 'sha'>>(source: T): T {
  assert(
    REPO.test(source?.repo) && SHA.test(source?.sha),
    'invalid-source',
    'A canonical GitHub repository and full SHA are required.',
  );
  return source;
}

export function checkBlocklist(sources: Source[], blocklist: Blocklist = []) {
  const entries = Array.isArray(blocklist) ? blocklist : blocklist?.entries;
  assert(
    Array.isArray(entries),
    'invalid-blocklist',
    'Blocklist must contain an entries array.',
  );
  for (const source of sources) {
    sourceIdentity(source);
    const blocked = entries.some((entry) => {
      if (typeof entry === 'string')
        return (
          entry.toLowerCase() === source.repo.toLowerCase() ||
          entry === source.sha
        );
      assert(
        entry && REPO.test(entry.repo) && (!entry.sha || SHA.test(entry.sha)),
        'invalid-blocklist',
        'Invalid blocklist entry.',
      );
      return (
        entry.repo.toLowerCase() === source.repo.toLowerCase() &&
        (!entry.sha || entry.sha === source.sha)
      );
    });
    assert(
      !blocked,
      'source-blocked',
      'The selected repository or SHA is blocked.',
    );
  }
  return true;
}

async function request<T>(
  route: string,
  options: DiscoveryOptions = {},
): Promise<T> {
  const url = new URL(route, 'https://api.github.com');
  const allowedHosts = options.allowedHosts ?? ['api.github.com'];
  assert(
    url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      allowedHosts.includes(url.hostname) &&
      (!url.port || url.port === '443'),
    'network-denied',
    'Network source is not allowed.',
  );
  if (options._memory?.has(url.toString()))
    return options._memory.get(url.toString()) as T;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  let response;
  try {
    response = await (options.fetch ?? globalThis.fetch)(url.toString(), {
      headers,
      redirect: 'error',
      signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
    });
  } catch (caught) {
    const error = caught as NodeJS.ErrnoException;
    fail(
      error.name === 'TimeoutError' || error.name === 'AbortError'
        ? 'source-timeout'
        : 'source-unavailable',
      'Could not read the permitted source.',
    );
  }
  assert(
    !response.redirected &&
      (!response.url || new URL(response.url).origin === url.origin),
    'network-denied',
    'Source redirected outside the requested origin.',
  );
  assert(
    response.ok,
    response.status === 404 ? 'source-not-found' : 'source-unavailable',
    'Source returned an unsuccessful response.',
  );
  const text = await response.text();
  assert(
    Buffer.byteLength(text) <= (options.maxResponseBytes ?? 8 * LIMIT),
    'source-too-large',
    'Source response exceeds the read limit.',
  );
  try {
    const data = JSON.parse(text);
    options._memory?.set(url.toString(), data);
    return data as T;
  } catch {
    fail('invalid-source-data', 'Source response is not JSON.');
  }
}

async function repository(repo: string, options: DiscoveryOptions) {
  assert(REPO.test(repo), 'invalid-source', 'Invalid GitHub repository.');
  let item = await request<GitHubRepo>(`/repos/${repo}`, options);
  const seen = new Set();
  while (item.fork) {
    assert(
      item.parent?.full_name && !seen.has(item.full_name) && seen.size < 5,
      'provenance-unverified',
      'Cannot resolve the canonical fork source.',
    );
    seen.add(item.full_name);
    item = await request<GitHubRepo>(
      `/repos/${item.parent.full_name}`,
      options,
    );
  }
  assert(
    REPO.test(item.full_name),
    'provenance-unverified',
    'Source has no canonical identity.',
  );
  assert(
    !item.archived,
    'archived-source',
    'Archived repositories are excluded.',
  );
  const created = Date.parse(item.created_at);
  const now = options.now ? new Date(options.now).getTime() : Date.now();
  assert(
    Number.isFinite(created) && (now - created) / 86400000 >= 90,
    'source-too-young',
    'Repository must be at least 90 days old.',
  );
  return item;
}

async function treeAt(repo: string, sha: string, options: DiscoveryOptions) {
  const commit = await request<{
    sha: string;
    commit: { tree: { sha: string } };
  }>(`/repos/${repo}/commits/${encodeURIComponent(sha)}`, options);
  assert(
    commit.sha === sha && SHA.test(commit.commit?.tree?.sha),
    'provenance-unverified',
    'Pinned commit identity could not be verified.',
  );
  const tree = await request<{ truncated?: boolean; tree: GitHubTreeEntry[] }>(
    `/repos/${repo}/git/trees/${commit.commit.tree.sha}?recursive=1`,
    options,
  );
  assert(
    !tree.truncated && Array.isArray(tree.tree),
    'source-incomplete',
    'The complete pinned source tree is unavailable.',
  );
  assert(
    tree.tree.length <= 20000,
    'source-too-large',
    'Pinned source tree exceeds the inspection limit.',
  );
  for (const entry of tree.tree) validateRelativePath(entry.path);
  return tree.tree;
}

async function blob(
  repo: string,
  entry: GitHubTreeEntry,
  options: DiscoveryOptions,
) {
  assert(
    entry.type === 'blob' &&
      ['100644', '100755'].includes(entry.mode) &&
      entry.size <= LIMIT,
    'unsafe-source-file',
    'Only bounded regular source files are supported.',
  );
  assert(
    SHA.test(entry.sha),
    'provenance-unverified',
    'Missing source blob SHA.',
  );
  const data = await request<{
    encoding: string;
    content: string;
    sha?: string;
  }>(`/repos/${repo}/git/blobs/${entry.sha}`, options);
  assert(
    data.encoding === 'base64' && typeof data.content === 'string',
    'invalid-source-data',
    'Unsupported source file encoding.',
  );
  const bytes = Buffer.from(data.content, 'base64');
  assert(
    bytes.length <= LIMIT,
    'source-too-large',
    'Source file exceeds the read limit.',
  );
  const actual = createHash(entry.sha.length === 40 ? 'sha1' : 'sha256')
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest('hex');
  assert(
    actual === entry.sha && (!data.sha || data.sha === entry.sha),
    'source-hash-mismatch',
    'Pinned blob content does not match its identity.',
  );
  const text = bytes.toString('utf8');
  assert(
    !text.includes('\0') && Buffer.from(text).equals(bytes),
    'unsupported-source-file',
    'Binary files require manual review.',
  );
  return text;
}

function inspectText(text: string, filePath: string) {
  assert(
    !INJECTION.test(text),
    'injection-suspect',
    'Source contains suspicious instruction overrides.',
  );
  if (/(?:^|\/)package\.json$/.test(filePath)) {
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      fail('invalid-source-data', 'Source package manifest is invalid.');
    }
    assert(
      !['preinstall', 'install', 'postinstall', 'prepare'].some(
        (key) => data.scripts?.[key],
      ),
      'install-hook-blocked',
      'Source contains a prohibited installation hook.',
    );
  }
}

async function inspectSource(source: Source, options: DiscoveryOptions = {}) {
  sourceIdentity(source);
  checkBlocklist([source], options.blocklist ?? []);
  const licenseException = source.licenseException;
  if (licenseException !== undefined)
    assert(
      source.license === 'unknown' &&
        licenseException &&
        typeof licenseException.reason === 'string' &&
        licenseException.reason.trim(),
      'invalid-license-exception',
      'An unknown license requires an explicit exception reason in the approved source.',
    );
  const meta = await repository(source.repo, options);
  assert(
    meta.full_name.toLowerCase() === source.repo.toLowerCase(),
    'canonical-source-required',
    'Use the canonical repository instead of its fork.',
  );
  const tree = await treeAt(source.repo, source.sha, options);
  let license: GitHubLicense | undefined;
  try {
    license = await request<GitHubLicense>(
      `/repos/${source.repo}/license?ref=${source.sha}`,
      options,
    );
  } catch (caught) {
    const error = caught as NodeJS.ErrnoException;
    if (error.code !== 'source-not-found') throw error;
    assert(
      licenseException,
      'license-unknown',
      'A pinned license is unavailable; an explicit approved exception is required.',
    );
  }
  const spdx = license?.license?.spdx_id;
  if (!spdx || ['NOASSERTION', 'OTHER'].includes(spdx)) {
    assert(
      licenseException,
      'license-unknown',
      'Unknown license requires an explicit approved exception.',
    );
  } else {
    const file = tree.find(
      (entry) => entry.path === license!.path && entry.sha === license!.sha,
    );
    assert(
      file,
      'license-unverified',
      'License is not in the pinned source tree.',
    );
    await blob(source.repo, file, options);
    assert(
      !source.license || source.license === spdx,
      'license-changed',
      'License differs from the approved source.',
    );
  }
  const prefix =
    source.skillPath && source.skillPath !== 'SKILL.md'
      ? source.skillPath.replace(/\/SKILL\.md$/, '')
      : '';
  if (source.skillPath) {
    validateRelativePath(source.skillPath);
    assert(
      /(?:^|\/)SKILL\.md$/.test(source.skillPath),
      'invalid-source',
      'Skill scope must identify a SKILL.md file.',
    );
  }
  for (const file of source.files ?? []) {
    validateRelativePath(file.sourcePath);
    const entry = tree.find(
      (entry) => entry.path === file.sourcePath && entry.type === 'blob',
    );
    assert(
      entry,
      'source-file-not-found',
      'A proposed source file is absent from the pinned tree.',
    );
    assert(
      ['100644', '100755'].includes(entry.mode) &&
        (file.fileMode === undefined
          ? entry.mode === '100644'
          : file.fileMode === (entry.mode === '100755' ? 0o755 : 0o644)),
      'source-mode-mismatch',
      'Show the exact pinned source permissions, including executable files.',
    );
    assert(
      /^[a-f0-9]{64}$/.test(file.contentHash),
      'invalid-source',
      'Proposed files require content hashes.',
    );
  }
  const relevant = tree.filter(
    (entry) =>
      entry.type === 'blob' &&
      (entry.path === 'package.json' ||
        entry.path === 'SKILL.md' ||
        source.skillPath === 'SKILL.md' ||
        (prefix
          ? entry.path.startsWith(`${prefix}/`)
          : /(?:^|\/)SKILL\.md$/.test(entry.path)) ||
        (source.files ?? []).some((file) => file.sourcePath === entry.path)),
  );
  assert(
    relevant.length <= 160,
    'source-too-large',
    'Candidate needs a smaller reviewed skill scope.',
  );
  if (source.kind !== 'mcp')
    assert(
      relevant.some((entry) => /(?:^|\/)SKILL\.md$/.test(entry.path)),
      'skill-not-found',
      'No skill instructions exist in the pinned source scope.',
    );
  for (const entry of relevant) {
    assert(
      !isSensitivePath(entry.path),
      'sensitive-source-file',
      'Secret-like source paths are excluded.',
    );
    const text = await blob(source.repo, entry, options);
    inspectText(text, entry.path);
    for (const proposed of (source.files ?? []).filter(
      (file) => file.sourcePath === entry.path,
    ))
      assert(
        proposed.contentHash === hashContent(text),
        'source-hash-mismatch',
        'Proposed file hash differs from the pinned source.',
      );
  }
  return {
    schema: 1,
    repo: meta.full_name,
    sha: source.sha,
    license:
      spdx && !['NOASSERTION', 'OTHER'].includes(spdx) ? spdx : 'unknown',
    ...(licenseException
      ? { licenseException: { reason: licenseException.reason } }
      : {}),
    provenance: 'provenance-verified',
    selectionVersion: SELECTION_VERSION,
    tree,
  };
}

export async function validateSources(
  sources: Source[],
  options: DiscoveryOptions = {},
) {
  options = { ...options, _memory: new Map() };
  assert(Array.isArray(sources), 'invalid-source', 'Sources must be an array.');
  checkBlocklist(sources, options.blocklist ?? []);
  const results = [];
  for (const source of sources) {
    const result = await inspectSource(source, options);
    const { tree, ...summary } = result;
    results.push(summary);
  }
  return results;
}

export async function fetchSourceFile(
  source: Pick<Source, 'repo' | 'sha'> & { sourcePath: string },
  options: DiscoveryOptions = {},
) {
  // Only immutable SHA-addressed reads may share this caller-owned in-memory cache.
  options = { ...options, _memory: options.sourceCache ?? new Map() };
  sourceIdentity(source);
  checkBlocklist([source], options.blocklist ?? []);
  validateRelativePath(source.sourcePath);
  assert(
    !isSensitivePath(source.sourcePath),
    'sensitive-source-file',
    'Secret-like source paths are excluded.',
  );
  const tree = await treeAt(source.repo, source.sha, options);
  const entry = tree.find((item) => item.path === source.sourcePath);
  assert(
    entry,
    'source-file-not-found',
    'The proposed file is absent from the pinned source.',
  );
  const text = await blob(source.repo, entry, options);
  inspectText(text, source.sourcePath);
  return text;
}

export async function searchCandidates(
  query: string,
  options: DiscoveryOptions = {},
) {
  options = { ...options, _memory: new Map() };
  const kind = options.kind ?? 'skill';
  assert(
    ['skill', 'mcp'].includes(kind),
    'invalid-query',
    'Search kind must be skill or mcp.',
  );
  assert(
    typeof query === 'string' && query.trim() && query.length <= 300,
    'invalid-query',
    'Provide a bounded search query.',
  );
  const result: {
    schema: number;
    query: string;
    selectionVersion: number;
    candidates: Candidate[];
    rejected: { repo: string | null; reason: string }[];
    gaps: PathReason[];
    attempts: number;
  } = {
    schema: 1,
    query,
    selectionVersion: SELECTION_VERSION,
    candidates: [],
    rejected: [],
    gaps: [],
    attempts: 0,
  };
  const queries = [
    query.trim(),
    `${query.trim()} ${kind === 'mcp' ? 'mcp server' : 'agent skills'}`,
  ];
  for (const search of queries) {
    result.attempts++;
    let response;
    try {
      response = await request<{
        items: GitHubRepo[];
        incomplete_results?: boolean;
      }>(
        `/search/repositories?q=${encodeURIComponent(search)}&per_page=5`,
        options,
      );
    } catch (caught) {
      const error = caught as NodeJS.ErrnoException;
      result.gaps.push({
        reason: error.code ?? 'source-unavailable',
        source: 'github-search',
      });
      break;
    }
    assert(
      Array.isArray(response.items),
      'invalid-source-data',
      'Search response has no candidate list.',
    );
    if (response.incomplete_results)
      result.gaps.push({
        reason: 'partial-search-results',
        source: 'github-search',
      });
    if (!response.items.length) continue;
    for (const item of response.items.slice(0, 5)) {
      try {
        const meta = await repository(item.full_name, options);
        const head = await request<{ sha: string }>(
          `/repos/${meta.full_name}/commits/${encodeURIComponent(meta.default_branch)}`,
          options,
        );
        sourceIdentity({ repo: meta.full_name, sha: head.sha });
        const tree = await treeAt(meta.full_name, head.sha, options);
        if (kind === 'mcp') {
          const source = await inspectSource(
            { repo: meta.full_name, sha: head.sha, kind: 'mcp' },
            options,
          );
          result.candidates.push({
            kind,
            repo: source.repo,
            sha: source.sha,
            license: source.license,
            provenance: source.provenance,
            selectionVersion: SELECTION_VERSION,
            files: [],
            safety: 'heuristic-only',
            applicability: 'requires-agent-assessment',
            transport: 'stdio-requires-assessment',
          });
          continue;
        }
        const skillFiles = tree
          .filter(
            (entry) =>
              entry.type === 'blob' && /(?:^|\/)SKILL\.md$/.test(entry.path),
          )
          .slice(0, 5);
        assert(
          skillFiles.length,
          'skill-not-found',
          'No skill instructions found.',
        );
        for (const skillFile of skillFiles) {
          const source = {
            repo: meta.full_name,
            sha: head.sha,
            skillPath: skillFile.path,
          };
          const checked = await inspectSource(source, options);
          const prefix =
            skillFile.path === 'SKILL.md'
              ? ''
              : skillFile.path.slice(0, -'/SKILL.md'.length);
          const selected = checked.tree.filter(
            (entry) =>
              entry.type === 'blob' &&
              (prefix ? entry.path.startsWith(`${prefix}/`) : true),
          );
          const files = [];
          for (const entry of selected)
            files.push({
              sourcePath: entry.path,
              contentHash: hashContent(
                await blob(meta.full_name, entry, options),
              ),
              fileMode: entry.mode === '100755' ? 0o755 : 0o644,
            });
          result.candidates.push({
            repo: checked.repo,
            sha: checked.sha,
            skillPath: skillFile.path,
            license: checked.license,
            provenance: checked.provenance,
            selectionVersion: SELECTION_VERSION,
            files,
            externalVerified: null,
            safety: 'heuristic-only',
            applicability: 'requires-agent-assessment',
          });
        }
      } catch (caught) {
        const error = caught as NodeJS.ErrnoException;
        result.rejected.push({
          repo: REPO.test(item.full_name) ? item.full_name : null,
          reason: error.code ?? 'source-unavailable',
        });
      }
    }
    if (result.candidates.length) break;
  }
  result.candidates = result.candidates.filter(
    (candidate, index, all) =>
      all.findIndex(
        (other) =>
          other.repo === candidate.repo &&
          other.sha === candidate.sha &&
          other.skillPath === candidate.skillPath,
      ) === index,
  );
  if (!result.candidates.length)
    result.gaps.push({
      reason: 'no-suitable-candidate',
      resolution: 'defer-or-propose-origin-self',
    });
  return result;
}
