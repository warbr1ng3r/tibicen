import { readFile } from 'node:fs/promises';
import { assert, digest, hashContent, parseData } from '../core/contracts.ts';
import type { DiscoveryOptions, Source } from '../core/types.ts';
import { validateSources, fetchSourceFile } from '../discovery/index.ts';
import { observationGuard, writeEvalArtifact } from './observations.ts';

interface Pin {
  id: string;
  repository: string;
  commit: string;
  path: string;
  license: string;
  gitBlob: string;
  sha256: string;
  local: string;
}
interface SourceMirror {
  schema: 1;
  pinsHash: string;
  responses: { url: string; body: string }[];
}

export async function nativeSourcePins() {
  const manifest = parseData(
    await readFile(
      new URL('./fixtures/sources/upstream.json', import.meta.url),
      'utf8',
    ),
  ) as { files: Pin[] };
  const pins = manifest.files.filter((file) => file.id.startsWith('ponytail-'));
  for (const pin of pins)
    assert(
      hashContent(
        await readFile(new URL('../../' + pin.local, import.meta.url)),
      ) === pin.sha256,
      'native-source-changed',
      'Pinned fixture bytes changed.',
    );
  const sources: Source[] = [...new Set(pins.map((pin) => pin.commit))].map(
    (sha) => ({
      repo: 'DietrichGebert/ponytail',
      sha,
      license: 'MIT',
      skillPath: 'skills/ponytail/SKILL.md',
      files: pins
        .filter((pin) => pin.commit === sha)
        .map((pin) => ({
          path:
            '.agents/skills/ponytail/' +
            (pin.path.endsWith('SKILL.md')
              ? 'SKILL.md'
              : pin.path.startsWith('examples/')
                ? 'references/' + pin.path.slice(9)
                : pin.path),
          sourcePath: pin.path,
          contentHash: pin.sha256,
        })),
    }),
  );
  return { pins, sources, pinsHash: digest(pins) };
}

function mirrorFetch(
  mirror: SourceMirror,
): NonNullable<DiscoveryOptions['fetch']> {
  assert(
    Array.isArray(mirror.responses) &&
      mirror.responses.length <= 400 &&
      new Set(mirror.responses.map((item) => item.url)).size ===
        mirror.responses.length,
    'invalid-native-source-mirror',
    'Use unique bounded source responses.',
  );
  const responses = new Map(
    mirror.responses.map((item) => {
      const url = new URL(item.url);
      assert(
        url.origin === 'https://api.github.com' &&
          /^\/repos\/DietrichGebert\/ponytail(?:\/|$)/.test(url.pathname) &&
          typeof item.body === 'string',
        'invalid-native-source-mirror',
        'Only pinned public source responses are allowed.',
      );
      return [item.url, item.body];
    }),
  );
  return async (url, options) => {
    assert(
      !options.method || options.method === 'GET',
      'native-source-request-denied',
      'The mirror permits reads only.',
    );
    const body = responses.get(String(url));
    assert(
      body !== undefined,
      'native-source-request-denied',
      'No network fallback for an unfrozen request.',
    );
    return { ok: true, url: String(url), text: async () => body };
  };
}

async function verifyMirror(mirror: SourceMirror) {
  const { pins, sources, pinsHash } = await nativeSourcePins();
  assert(
    mirror.schema === 1 && mirror.pinsHash === pinsHash,
    'invalid-native-source-mirror',
    'Mirror belongs to different source pins.',
  );
  const options = { fetch: mirrorFetch(mirror) };
  await validateSources(sources, options);
  for (const source of sources)
    for (const file of source.files!)
      assert(
        hashContent(
          await fetchSourceFile(
            { ...source, sourcePath: file.sourcePath },
            options,
          ),
        ) ===
          pins.find(
            (pin) => pin.commit === source.sha && pin.path === file.sourcePath,
          )!.sha256,
        'native-source-changed',
        'Source transport differs from frozen fixture bytes.',
      );
  observationGuard()(mirror);
  return { mirror, sources, pinsHash };
}

// Explicit host-only, model-free capture. Never fabricates repository/commit/license metadata.
export async function captureNativeSources(
  filename: string,
  fetch: NonNullable<DiscoveryOptions['fetch']> = globalThis.fetch,
) {
  const { sources, pinsHash } = await nativeSourcePins(),
    responses = new Map<string, string>();
  const recording: NonNullable<DiscoveryOptions['fetch']> = async (
    url,
    options,
  ) => {
    if (responses.has(url))
      return { ok: true, url, text: async () => responses.get(url)! };
    const response = await fetch(url, options);
    assert(
      response.ok &&
        !response.redirected &&
        (!response.url ||
          new URL(response.url).origin === 'https://api.github.com'),
      'native-source-unavailable',
      'Source capture requires successful direct GitHub responses.',
    );
    const body = await response.text();
    assert(
      Buffer.byteLength(body) <= 8 * 1024 * 1024,
      'native-source-too-large',
      'Bound source capture responses.',
    );
    if (responses.has(url))
      assert(
        responses.get(url) === body,
        'native-source-changed',
        'Source changed during capture.',
      );
    responses.set(url, body);
    return { ok: true, url, text: async () => body };
  };
  await validateSources(sources, { fetch: recording });
  for (const source of sources)
    for (const file of source.files!)
      await fetchSourceFile(
        { ...source, sourcePath: file.sourcePath },
        { fetch: recording },
      );
  const mirror: SourceMirror = {
    schema: 1,
    pinsHash,
    responses: [...responses].map(([url, body]) => ({ url, body })),
  };
  await verifyMirror(mirror);
  await writeEvalArtifact(filename, mirror);
  return { schema: 1, pinsHash, responses: responses.size };
}

export async function loadNativeSources(filename: string) {
  return verifyMirror(
    parseData(await readFile(filename, 'utf8')) as SourceMirror,
  );
}

// Project Node processes receive this read-only preload in both variants, with command network off.
export function nativeSourcePreload(mirror: SourceMirror) {
  return `const responses=new Map(${JSON.stringify(mirror.responses.map((item) => [item.url, item.body]))});
globalThis.fetch=async(input,options={})=>{const url=typeof input==='string'?input:input.url??String(input);if((options.method??input.method??'GET')!=='GET'||!responses.has(url))throw new Error('Unfrozen source request');return new Response(responses.get(url),{status:200,headers:{'Content-Type':'application/json'}});};\n`;
}
