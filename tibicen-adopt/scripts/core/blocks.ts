import type { ManagedBlockInput } from './types.ts';
import { assert } from './contracts.ts';

export const supportsManagedBlocks = (filename: string) =>
  /\.mdc?$/i.test(filename);

// Offsets refer to the original text; slicing never normalizes surrounding bytes.
export function parseManagedBlock(text: string, filename = 'Markdown') {
  function invalid(
    line: number,
    message: string,
    code = 'invalid-managed-block',
  ): never {
    throw Object.assign(new Error(`${filename}:${line}: ${message}`), {
      code,
      line,
    });
  }
  const markers: {
    kind: string;
    version: string;
    start: number;
    end: number;
    eol: string;
    line: number;
  }[] = [];
  let fence: { character: string; length: number } | undefined;
  let line = 0;
  for (const match of text.matchAll(/([^\r\n]*)(\r\n|\n|\r|$)/g)) {
    line++;
    const bom = match.index === 0 && match[1].startsWith('\uFEFF') ? 1 : 0;
    const raw = match[1].slice(bom);
    const delimiter = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(raw);
    if (fence) {
      if (
        delimiter &&
        delimiter[1][0] === fence.character &&
        delimiter[1].length >= fence.length &&
        !delimiter[2].trim()
      )
        fence = undefined;
      continue;
    }
    if (delimiter) {
      fence = { character: delimiter[1][0], length: delimiter[1].length };
      continue;
    }
    if (!/^ {0,3}<!--\s*tibicen:(?:begin|end)\b/.test(raw)) continue;
    const marker =
      /^ {0,3}<!-- tibicen:(begin|end)(?: v([0-9]+))? -->[\t ]*$/.exec(raw);
    if (!marker)
      invalid(line, 'malformed marker; show an explicit repair diff.');
    const version = marker[2] ?? 'legacy';
    if (!['legacy', '1'].includes(version))
      invalid(
        line,
        `unsupported marker version ${version}; show an explicit conversion diff.`,
        'unsupported-managed-block-version',
      );
    markers.push({
      kind: marker[1],
      version,
      start: match.index + bom,
      end: match.index + match[0].length,
      eol: match[2],
      line,
    });
  }
  if (!markers.length) return null;
  if (markers.length !== 2)
    invalid(
      markers[Math.min(2, markers.length - 1)].line,
      'expected exactly one begin/end pair.',
    );
  const [begin, end] = markers;
  if (
    begin.kind !== 'begin' ||
    end.kind !== 'end' ||
    begin.version !== end.version
  )
    invalid(end.line, 'reversed, nested or mismatched marker pair.');
  return {
    start: begin.start,
    end: end.end,
    contentStart: begin.end,
    contentEnd: end.start,
    version: begin.version,
    eol: begin.eol,
    trailingEol: end.eol,
  };
}

export function updateManagedBlock(
  original: string | null,
  input: ManagedBlockInput,
  filename?: string,
) {
  assert(
    input &&
      typeof input === 'object' &&
      !Array.isArray(input) &&
      Object.keys(input).every((key) => ['content', 'migrate'].includes(key)),
    'invalid-managed-block',
    'Expected managedBlock content and optional migrate.',
  );
  assert(
    input.content === null || typeof input.content === 'string',
    'invalid-managed-block',
    'Managed block content must be text or null for removal.',
  );
  assert(
    input.migrate === undefined || typeof input.migrate === 'boolean',
    'invalid-managed-block',
    'Managed block migrate must be boolean.',
  );
  const text = original ?? '';
  const block = parseManagedBlock(text, filename);
  if (input.content === null)
    return block
      ? text.slice(0, block.start) + text.slice(block.end)
      : original;
  assert(
    !block || block.version !== 'legacy' || input.migrate === true,
    'managed-block-migration-required',
    'Legacy markers need managedBlock.migrate: true and a separately reviewed conversion diff.',
  );
  const eol = block?.eol || /\r\n|\n|\r/.exec(text)?.[0] || '\n';
  const body = input.content.replace(/\r\n|\n|\r/g, eol);
  const replacement = `<!-- tibicen:begin v1 -->${eol}${body}${body && !body.endsWith(eol) ? eol : ''}<!-- tibicen:end v1 -->${block ? block.trailingEol : eol}`;
  const separator =
    !text || block ? '' : /[\r\n]$/.test(text) ? eol : eol + eol;
  const result = block
    ? text.slice(0, block.start) + replacement + text.slice(block.end)
    : text + separator + replacement;
  assert(
    parseManagedBlock(result, filename),
    'invalid-managed-block',
    'Managed block must remain outside code fences; show an explicit repair diff.',
  );
  return result;
}
