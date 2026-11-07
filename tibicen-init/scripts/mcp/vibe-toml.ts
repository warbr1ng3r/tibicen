import { assert, validateData } from '../core/contracts.ts';

type Table = Record<string, unknown>;
const BARE = /^[A-Za-z0-9_-]+$/;

function check(value: unknown): asserts value {
  assert(value, 'invalid-mcp-format', 'Unsupported or ambiguous TOML.');
}

function table(value: unknown): value is Table {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// shortcut: single-line TOML subset only; use observations for other syntax.
export function parseVibeToml(text: string): Table {
  check(typeof text === 'string' && Buffer.byteLength(text) <= 1024 * 1024);
  check(!/\r(?!\n)/.test(text));
  for (const character of text) {
    const code = character.codePointAt(0)!;
    check((code >= 32 && code !== 127) || [9, 10, 13].includes(code));
  }
  const root: Table = Object.create(null);
  const explicit = new WeakSet<object>();
  const closed = new WeakSet<object>();
  const arrayTables = new WeakSet<object>();
  let current = root;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^[ \t]+|[ \t]+$/g, '');
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('[')) {
      const header = /^(\[\[?)([A-Za-z0-9_.-]+)(\]\]?)[ \t]*(?:#.*)?$/.exec(
        line,
      );
      check(header && header[1].length === header[3].length);
      const parts = header[2].split('.');
      check(parts.length < 40 && parts.every((part) => BARE.test(part)));
      check(
        parts.every(
          (part) => !['__proto__', 'constructor', 'prototype'].includes(part),
        ),
      );
      let parent = root;
      for (const part of parts.slice(0, -1)) {
        if (!Object.hasOwn(parent, part)) parent[part] = Object.create(null);
        let child = parent[part];
        if (Array.isArray(child)) {
          check(arrayTables.has(child) && child.length > 0);
          child = child.at(-1);
        }
        check(table(child) && !closed.has(child));
        parent = child;
      }
      const key = parts.at(-1)!;
      if (header[1] === '[[') {
        if (!Object.hasOwn(parent, key)) {
          parent[key] = [];
          arrayTables.add(parent[key] as unknown[]);
        }
        const items = parent[key];
        check(Array.isArray(items) && arrayTables.has(items));
        current = Object.create(null);
        items.push(current);
      } else {
        if (!Object.hasOwn(parent, key)) parent[key] = Object.create(null);
        const child = parent[key];
        check(table(child) && !closed.has(child) && !explicit.has(child));
        current = child;
      }
      explicit.add(current);
      continue;
    }

    let position = 0;
    const whitespace = () => {
      while (/[ \t]/.test(line[position] ?? '')) position++;
    };
    function string(): string {
      const start = position;
      const quote = line[position++];
      while (position < line.length) {
        if (quote === '"' && line[position] === '\\') {
          position += 2;
          continue;
        }
        if (line[position++] === quote) {
          const token = line.slice(start, position);
          check(!token.startsWith(quote.repeat(3)));
          if (quote === '"') check(!/\\\//.test(token));
          const value =
            quote === "'" ? token.slice(1, -1) : (JSON.parse(token) as string);
          check(!/\p{Surrogate}/u.test(value));
          return value;
        }
      }
      check(false);
    }
    function key(): string {
      whitespace();
      let value;
      if (['"', "'"].includes(line[position])) value = string();
      else {
        const match = /^[A-Za-z0-9_-]+/.exec(line.slice(position));
        check(match);
        value = match[0];
        position += value.length;
      }
      check(!['__proto__', 'constructor', 'prototype'].includes(value));
      return value;
    }
    function value(depth = 0): unknown {
      check(depth < 35);
      whitespace();
      const token = line[position];
      if (token === '"' || token === "'") return string();
      if (token === '[' || token === '{') {
        const array = token === '[';
        const result: unknown[] | Table = array ? [] : Object.create(null);
        const end = array ? ']' : '}';
        position++;
        whitespace();
        while (line[position] !== end) {
          if (array) (result as unknown[]).push(value(depth + 1));
          else {
            const name = key();
            check(!Object.hasOwn(result, name));
            whitespace();
            check(line[position++] === '=');
            (result as Table)[name] = value(depth + 1);
          }
          whitespace();
          if (line[position] !== ',') break;
          position++;
          whitespace();
          check(array || line[position] !== end);
        }
        check(line[position++] === end);
        if (!array) closed.add(result);
        return result;
      }
      const scalar =
        /^(?:true|false|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/.exec(
          line.slice(position),
        );
      check(scalar);
      position += scalar[0].length;
      const parsed = JSON.parse(scalar[0]) as boolean | number;
      check(
        typeof parsed === 'boolean' ||
          (Number.isFinite(parsed) &&
            (!Number.isInteger(parsed) || Number.isSafeInteger(parsed))),
      );
      return parsed;
    }
    const name = key();
    check(!Object.hasOwn(current, name));
    whitespace();
    check(line[position++] === '=');
    current[name] = value();
    whitespace();
    check(position === line.length || line[position] === '#');
  }
  return validateData(root);
}
