import path from 'node:path';
import { realpath, lstat } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assert, serializeData } from '../core/contracts.ts';
import { buildPairedReport } from './report.ts';
import type { ReportExperiment } from './report.ts';
import { writeEvalArtifact } from './observations.ts';

// A host driver is trusted executable code, chosen explicitly; it is never an executor input.
export interface ExternalRun {
  experiments: ReportExperiment[];
  sensitiveValues?: readonly string[];
}
export interface ExternalDriver {
  run(): Promise<ExternalRun>;
}

export async function externalMain(argv = process.argv.slice(2)) {
  if (
    argv.length === 0 ||
    (argv.length === 1 && ['help', '--help'].includes(argv[0]))
  )
    return {
      schema: 1,
      status: 'help',
      usage:
        'pnpm eval:external run <trusted-host-driver.mjs> <new-report.json>',
    };
  assert(
    argv.length === 3 &&
      argv[0] === 'run' &&
      argv
        .slice(1)
        .every((value) => value.length > 0 && !value.startsWith('-')),
    'invalid-external-command',
    'Use run with a trusted local driver and a new report path.',
  );
  const driverPath = path.resolve(argv[1]),
    reportPath = path.resolve(argv[2]);
  try {
    await lstat(reportPath);
    assert(false, 'eval-report-exists', 'Choose a new report path.');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  // Import only after explicit run. No default profile, subprocess or model is started on import/help.
  const module = (await import(
    pathToFileURL(await realpath(driverPath)).href
  )) as Partial<ExternalDriver>;
  assert(
    typeof module.run === 'function',
    'invalid-external-driver',
    'The trusted host module must export run().',
  );
  const result = await module.run();
  assert(
    result &&
      typeof result === 'object' &&
      !Array.isArray(result) &&
      Object.hasOwn(result, 'experiments') &&
      Object.keys(result).every((key) =>
        ['experiments', 'sensitiveValues'].includes(key),
      ),
    'invalid-external-driver',
    'The driver must return experiments and optional host-only sensitiveValues.',
  );
  assert(
    Array.isArray(result.experiments) && result.experiments.length > 0,
    'invalid-external-driver',
    'Return at least one frozen experiment, including blocked outcomes.',
  );
  const report = buildPairedReport(result.experiments, result.sensitiveValues);
  const filename = await writeEvalArtifact(
    reportPath,
    report,
    result.sensitiveValues,
  );
  return {
    schema: 1,
    status: 'saved',
    path: filename,
    cohorts: report.cohorts.length,
  };
}

if (
  process.argv[1] &&
  (await realpath(process.argv[1]).catch(() => '')) ===
    fileURLToPath(import.meta.url)
) {
  externalMain()
    .then((result) => process.stdout.write(serializeData(result)))
    .catch(() => {
      // Driver errors may contain credentials; neither native error text nor paths are reflected.
      process.stdout.write(
        serializeData({
          schema: 1,
          status: 'error',
          reason: 'external-experiment-failed',
        }),
      );
      process.exitCode = 1;
    });
}
