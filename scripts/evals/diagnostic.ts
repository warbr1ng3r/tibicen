import path from 'node:path';
import { mkdir, readFile, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { assert } from '../core/contracts.ts';
import { writeEvalArtifact } from './observations.ts';
import type { DiagnosticMode } from './diagnostic-driver.ts';

export async function diagnosticMain(argv = process.argv.slice(2)) {
  if (
    argv.length === 0 ||
    (argv.length === 1 && ['help', '--help'].includes(argv[0]))
  )
    return {
      schema: 1,
      status: 'help',
      usage:
        'pnpm eval:diagnostic --output <new-directory> [--mode dry-run|offline|native] [--config <request.json>]',
    };
  const flags = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const [flag, value] = argv.slice(index, index + 2);
    assert(
      ['--output', '--mode', '--config'].includes(flag) &&
        !flags.has(flag) &&
        value?.length > 0 &&
        !value.startsWith('-'),
      'invalid-diagnostic-command',
      'Use explicit diagnostic options and a new output directory.',
    );
    flags.set(flag, value);
  }
  const mode = flags.get('--mode') ?? 'dry-run';
  assert(
    flags.has('--output') && ['dry-run', 'offline', 'native'].includes(mode),
    'invalid-diagnostic-command',
    'Choose a diagnostic mode and a new output directory.',
  );
  const directory = path.resolve(flags.get('--output')!);
  await mkdir(path.dirname(directory), { recursive: true, mode: 0o700 });
  // Atomic reservation precedes config reads, driver imports and every possible execution.
  await mkdir(directory, { mode: 0o700 });
  let config: unknown;
  if (flags.has('--config')) {
    try {
      config = JSON.parse(await readFile(flags.get('--config')!, 'utf8'));
    } catch {
      config = null;
    }
  }
  const { runDiagnostic } = await import('./diagnostic-driver.ts');
  const diagnostic = await runDiagnostic(
    mode as DiagnosticMode,
    config,
    directory,
  );
  await writeEvalArtifact(path.join(directory, 'diagnostic.json'), diagnostic);
  // Do not reflect config paths, native errors or arbitrary option values to stdout.
  return { schema: 1, status: diagnostic.status, reason: diagnostic.reason };
}

if (
  process.argv[1] &&
  (await realpath(process.argv[1]).catch(() => '')) ===
    fileURLToPath(import.meta.url)
)
  diagnosticMain()
    .then((result) => {
      process.stdout.write(JSON.stringify(result) + '\n');
      if (result.status === 'error') process.exitCode = 1;
    })
    .catch(() => {
      process.stdout.write(
        JSON.stringify({
          schema: 1,
          status: 'error',
          reason: 'diagnostic-command-failed',
        }) + '\n',
      );
      process.exitCode = 1;
    });
