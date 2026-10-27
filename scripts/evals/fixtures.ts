import path from 'node:path';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { assert, digest, parseData } from '../core/contracts.ts';
import { safePath } from '../core/paths.ts';
import { executorScenario, validateScenario } from './contracts.ts';
import type { EvalScenario } from './contracts.ts';

export const diagnosticScenarios = [
  'diagnostic-bare',
  'diagnostic-conflicts',
] as const;

export async function loadDiagnostic(id: (typeof diagnosticScenarios)[number]) {
  assert(
    diagnosticScenarios.includes(id),
    'invalid-eval-fixture',
    'Unknown diagnostic fixture.',
  );
  const base = new URL('./fixtures/', import.meta.url);
  const scenario = validateScenario(
    parseData(await readFile(new URL(`${id}.json`, base), 'utf8')),
  );
  const oracle = parseData(
    await readFile(new URL(`oracles/${id}.json`, base), 'utf8'),
  );
  assert(
    scenario.id === id &&
      scenario.oracle.id === id + '-oracle' &&
      scenario.oracle.hash === digest(oracle),
    'invalid-eval-fixture',
    'Fixture and hidden oracle differ.',
  );
  return { scenario, oracle };
}

// The caller owns this fresh directory. Only input files enter it, never the oracle or future replies.
export async function materializeScenario(input: EvalScenario, parent: string) {
  const scenario = executorScenario(input);
  const root = await mkdtemp(path.join(path.resolve(parent), 'attempt-'));
  try {
    for (const file of scenario.files) {
      const target = await safePath(root, file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content, { flag: 'wx' });
    }
    return { root, scenario };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}
