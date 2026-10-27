import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  cp,
  mkdir,
  readdir,
  readFile,
  writeFile,
  rm,
  realpath,
  lstat,
} from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { assert, VERSION } from './core/contracts.ts';

const sourceRoot = await realpath(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
);
const names = ['tibicen-init', 'tibicen-adopt'];
const distributionRoot = path.join(sourceRoot, 'dist');
const inside = (parent: string, candidate: string) =>
  candidate === parent || candidate.startsWith(`${parent}${path.sep}`);

async function buildDestination(candidate: string): Promise<string> {
  const suffix: string[] = [];
  let existing = candidate;
  while (true) {
    try {
      const stat = await lstat(existing);
      if (!suffix.length)
        assert(
          !stat.isSymbolicLink(),
          'unsafe-build-path',
          'Build destinations cannot be symlinks.',
        );
      const resolved = path.join(await realpath(existing), ...suffix);
      assert(
        !inside(resolved, sourceRoot) &&
          (!inside(sourceRoot, resolved) || inside(distributionRoot, resolved)),
        'unsafe-build-path',
        'Build output inside the repository must stay under dist.',
      );
      return resolved;
    } catch (caught) {
      if ((caught as NodeJS.ErrnoException).code !== 'ENOENT') throw caught;
      suffix.unshift(path.basename(existing));
      existing = path.dirname(existing);
    }
  }
}
export async function buildSkills(output = path.join(sourceRoot, 'dist')) {
  output = await buildDestination(path.resolve(output));
  // Validate both trees before cleaning either one.
  for (const name of names) await buildDestination(path.join(output, name));
  await buildDestination(path.join(output, 'SHA256SUMS'));
  await mkdir(output, { recursive: true });
  for (const name of names) {
    const target = path.join(output, name);
    await rm(target, { recursive: true, force: true });
    await mkdir(target);
    await cp(
      path.join(sourceRoot, 'skills', name, 'SKILL.md'),
      path.join(target, 'SKILL.md'),
    );
    await cp(path.join(sourceRoot, 'scripts'), path.join(target, 'scripts'), {
      recursive: true,
      filter: (source) =>
        !source.endsWith(`${path.sep}build.ts`) &&
        source !== path.join(sourceRoot, 'scripts', 'evals'),
    });
    await cp(
      path.join(sourceRoot, 'references'),
      path.join(target, 'references'),
      { recursive: true },
    );
    await cp(path.join(sourceRoot, 'LICENSE'), path.join(target, 'LICENSE'));
    await writeFile(
      path.join(target, 'package.json'),
      `${JSON.stringify({ name, version: VERSION, private: true, type: 'module', engines: { node: '>=22.20.0' }, license: 'MIT' }, null, 2)}\n`,
    );
  }
  const sums: string[] = [];
  async function walk(relative = '') {
    for (const entry of (
      await readdir(path.join(output, relative), { withFileTypes: true })
    ).sort((a, b) => a.name.localeCompare(b.name))) {
      const filename = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) await walk(filename);
      else if (filename !== 'SHA256SUMS')
        sums.push(
          `${createHash('sha256')
            .update(await readFile(path.join(output, filename)))
            .digest('hex')}  ${filename}`,
        );
    }
  }
  await walk();
  await writeFile(path.join(output, 'SHA256SUMS'), `${sums.join('\n')}\n`);
  return {
    output,
    skills: ['tibicen-init', 'tibicen-adopt'],
    files: sums.length,
  };
}
if (
  process.argv[1] &&
  (await realpath(process.argv[1]).catch(() => '')) ===
    fileURLToPath(import.meta.url)
) {
  buildSkills()
    .then((result) => process.stdout.write(`${JSON.stringify(result)}\n`))
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    });
}
