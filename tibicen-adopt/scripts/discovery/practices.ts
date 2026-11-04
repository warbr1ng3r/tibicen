import type { Fetch, HttpResponse, PathReason } from '../core/types.ts';
import { assert, fail, hashContent } from '../core/contracts.ts';

export const OFFICIAL_SOURCES = Object.freeze({
  'claude-code': [
    'https://code.claude.com/docs/en/best-practices',
    'https://code.claude.com/docs/en/skills',
  ],
  codex: [
    'https://learn.chatgpt.com/docs/agent-configuration/agents-md',
    'https://learn.chatgpt.com/docs/build-skills',
  ],
  cursor: ['https://cursor.com/docs/rules', 'https://cursor.com/docs/skills'],
});
interface PracticeEvidence {
  title: string;
  headings: string[];
  excerpts: string[];
  contentHash: string;
  format: string;
  applicability: string;
}
interface Practice {
  source: string;
  checkedAt: string;
  appliesTo: string;
  agentVersion?: string;
  status: string;
  evidence?: PracticeEvidence;
  reason?: string;
}
interface PracticeOptions {
  fetch?: Fetch;
  now?: string | number;
  timeoutMs?: number;
  maxBytes?: number;
  sources?: Record<string, string[]>;
}

const OFFICIAL_HOSTS = new Set([
  'code.claude.com',
  'cursor.com',
  'developers.openai.com',
  'learn.chatgpt.com',
  'agents.md',
  'agentskills.io',
]);

function plain(text: string) {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(
      /&(?:nbsp|amp|lt|gt|quot|#39);/g,
      (item) =>
        ({
          '&nbsp;': ' ',
          '&amp;': '&',
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&#39;': "'",
        })[item as '&nbsp;' | '&amp;' | '&lt;' | '&gt;' | '&quot;' | '&#39;'],
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function extract(text: string, type: string) {
  let title: string, headings: string[], paragraphs: string[];
  if (type.includes('html')) {
    const clean = text
      .replace(
        /<(script|style|template|svg|iframe|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
        '',
      )
      .replace(/<!--[\s\S]*?-->/g, '');
    const main =
      /<main\b[^>]*>([\s\S]*?)<\/main\s*>/i.exec(clean)?.[1] ?? clean;
    title = plain(
      /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(clean)?.[1] ?? '',
    );
    headings = [
      ...main.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]\s*>/gi),
    ].map((match) => plain(match[1]));
    paragraphs = [
      ...main.matchAll(/<(?:p|li)\b[^>]*>([\s\S]*?)<\/(?:p|li)\s*>/gi),
    ].map((match) => plain(match[1]));
  } else {
    // Code fences and inline HTML remain outside the extracted recommendation data.
    const clean = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
    headings = [...clean.matchAll(/^#{1,3}\s+(.+)$/gm)].map((match) =>
      plain(match[1]),
    );
    title = headings[0] ?? '';
    paragraphs = clean
      .split(/\n\s*\n/)
      .filter((part) => !/^\s*#/.test(part))
      .map(plain);
  }
  return {
    title: title.slice(0, 200),
    headings: [...new Set(headings.filter(Boolean))]
      .slice(0, 20)
      .map((item) => item.slice(0, 200)),
    excerpts: paragraphs
      .filter((item) => item.length >= 30)
      .slice(0, 12)
      .map((item) => item.slice(0, 500)),
  };
}

async function readSource(source: string, options: PracticeOptions) {
  const url = new URL(source);
  assert(
    url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      OFFICIAL_HOSTS.has(url.hostname),
    'network-denied',
    'Only explicitly allowed official documentation hosts are read.',
  );
  const timeoutMs = options.timeoutMs ?? 8000,
    maxBytes = options.maxBytes ?? 1024 * 1024;
  assert(
    Number.isInteger(timeoutMs) &&
      timeoutMs > 0 &&
      timeoutMs <= 30000 &&
      Number.isInteger(maxBytes) &&
      maxBytes > 0 &&
      maxBytes <= 2 * 1024 * 1024,
    'invalid-source-limits',
    'Invalid documentation read limits.',
  );
  let response: HttpResponse;
  try {
    response = await (options.fetch ?? globalThis.fetch)(url.toString(), {
      method: 'GET',
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: 'text/markdown, text/html;q=0.8, text/plain;q=0.7' },
    });
  } catch (caught) {
    const error = caught as NodeJS.ErrnoException;
    fail(
      error.name === 'TimeoutError' || error.name === 'AbortError'
        ? 'source-timeout'
        : 'source-unavailable',
      'Official documentation could not be read.',
    );
  }
  assert(
    !response.redirected && (!response.url || response.url === url.toString()),
    'network-denied',
    'Documentation redirects are not followed.',
  );
  assert(
    response.ok,
    'source-unavailable',
    'Official documentation returned an unsuccessful response.',
  );
  const type = response.headers?.get('content-type') ?? 'text/plain';
  assert(
    /text\/(?:html|plain|markdown)|application\/markdown/.test(type),
    'unsupported-source-format',
    'Documentation is not a supported text format.',
  );
  const length = Number(response.headers?.get('content-length') ?? 0);
  assert(
    length <= maxBytes,
    'source-too-large',
    'Official documentation exceeds the read limit.',
  );
  let text;
  if (response.body?.getReader) {
    const reader = response.body.getReader(),
      chunks = [];
    let size = 0;
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value!.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        fail(
          'source-too-large',
          'Official documentation exceeds the read limit.',
        );
      }
      chunks.push(Buffer.from(next.value!));
    }
    text = Buffer.concat(chunks).toString('utf8');
  } else text = await response.text();
  assert(
    Buffer.byteLength(text) <= maxBytes,
    'source-too-large',
    'Official documentation exceeds the read limit.',
  );
  const extracted = extract(text, type);
  assert(
    extracted.title || extracted.headings.length,
    'unstructured-source',
    'No structured documentation headings were found.',
  );
  return {
    ...extracted,
    contentHash: hashContent(text),
    format: type.split(';')[0],
    applicability: 'requires-agent-assessment',
  };
}

export async function checkPractices(
  {
    agents = [],
    agentVersions = {},
  }: { agents?: string[]; agentVersions?: Record<string, string> } = {},
  options: PracticeOptions = {},
) {
  assert(
    Array.isArray(agents) && agents.length <= 3,
    'invalid-agents',
    'Select at most the three supported agents.',
  );
  const checkedAt = new Date(options.now ?? Date.now()).toISOString();
  const result: { schema: number; practices: Practice[]; gaps: PathReason[] } =
    { schema: 1, practices: [], gaps: [] };
  const selected = [...new Set(agents)];
  for (const agent of selected) {
    if (!Object.hasOwn(OFFICIAL_SOURCES, agent)) {
      result.gaps.push({ agent, reason: 'unsupported-agent' });
      continue;
    }
    if (!agentVersions[agent])
      result.gaps.push({ agent, reason: 'agent-version-unverified' });
    const sources =
      options.sources?.[agent] ??
      OFFICIAL_SOURCES[agent as keyof typeof OFFICIAL_SOURCES];
    assert(
      Array.isArray(sources) && sources.length <= 2,
      'source-request-limit',
      'At most two relevant official sources are read per agent.',
    );
    for (const source of sources) {
      const entry = {
        source,
        checkedAt,
        appliesTo: `${agent} project instructions and skills`,
        ...(agentVersions[agent] ? { agentVersion: agentVersions[agent] } : {}),
      };
      try {
        result.practices.push({
          ...entry,
          status: 'checked',
          evidence: await readSource(source, options),
        });
      } catch (caught) {
        const error = caught as NodeJS.ErrnoException;
        const reason =
          error.code ??
          (error.name === 'TimeoutError' || error.name === 'AbortError'
            ? 'source-timeout'
            : 'source-unavailable');
        result.practices.push({ ...entry, status: 'unverified', reason });
        result.gaps.push({ source, agent, reason });
      }
    }
  }
  return result;
}
