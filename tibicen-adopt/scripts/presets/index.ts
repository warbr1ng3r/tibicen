import path from 'node:path';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import {
  assert,
  parseData,
  serializeData,
  validatePreset,
} from '../core/contracts.ts';
import { safePath } from '../core/paths.ts';

const NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;

async function namedPath(name: string, home: string) {
  assert(
    NAME.test(name),
    'invalid-preset',
    'Use a preset name with lowercase letters, digits and hyphens.',
  );
  return safePath(home, `.tibicen/presets/${name}/preset.yaml`, {
    allowSensitive: true,
  });
}

export async function loadPreset(
  nameOrPath: string,
  { home = homedir() } = {},
) {
  assert(
    typeof nameOrPath === 'string' && nameOrPath,
    'invalid-preset',
    'Choose a preset name or file.',
  );
  const file = NAME.test(nameOrPath)
    ? await namedPath(nameOrPath, home)
    : path.resolve(nameOrPath);
  const stat = await lstat(file);
  assert(
    stat.isFile() && !stat.isSymbolicLink(),
    'unsafe-path',
    'A preset must be a regular file, not a symlink.',
  );
  assert(
    stat.size <= 8 * 1024 * 1024,
    'invalid-preset',
    'Preset is too large.',
  );
  return validatePreset(parseData(await readFile(file, 'utf8')));
}

export async function savePreset(
  input: unknown,
  { requested = false, home = homedir() } = {},
) {
  assert(
    requested === true,
    'consent-required',
    'Save a preset only after the user explicitly asks.',
  );
  const preset = validatePreset(input);
  const file = await namedPath(preset.name, home);
  await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  await namedPath(preset.name, home);
  const temporary = path.join(
    path.dirname(file),
    `.preset-${randomUUID()}.tmp`,
  );
  let handle;
  try {
    handle = await open(temporary, 'wx', 0o600);
    await handle.writeFile(serializeData(preset));
    await handle.sync();
    await handle.close();
    handle = undefined;
    await namedPath(preset.name, home);
    await rename(temporary, file);
  } finally {
    await handle?.close();
    await rm(temporary, { force: true });
  }
  return { path: file, preset };
}
