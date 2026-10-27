import path from 'node:path';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { assert } from '../core/contracts.ts';
import { safePath } from '../core/paths.ts';
import type { NativeProposal } from './native-workflow.ts';

type RunCheck = (
  copy: string,
  argv: string[],
  timeoutMs: number,
) => Promise<{ status: number | null; timedOut: boolean }>;

export async function checkOpenSpecPlanning(
  root: string,
  copy: string,
  cliRoot: string,
  changes: NativeProposal['changes'],
  remaining: () => number,
  run: (
    copy: string,
    argv: string[],
    timeoutMs: number,
  ) => Promise<{ status: number | null; timedOut: boolean; stdout: string }>,
) {
  try {
    await cp(root, copy, { recursive: true });
    for (const file of changes) {
      const target = await safePath(copy, file.path);
      if (file.content === null) await rm(target, { force: true });
      else {
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, file.content);
      }
    }
    const inspect = async (argv: string[]) => {
      const budget = remaining();
      assert(budget > 0, 'native-stage-timeout', 'No planning check budget.');
      const result = await run(
        copy,
        [path.join(cliRoot, 'bin/openspec.js'), ...argv],
        Math.min(15000, budget),
      );
      assert(
        result.status === 0 && !result.timedOut,
        'native-process-planning-unverified',
        'Pinned planning inspection did not finish successfully.',
      );
      try {
        return JSON.parse(result.stdout);
      } catch {
        assert(
          false,
          'native-process-planning-unverified',
          'Invalid planning JSON.',
        );
      }
    };
    const status = await inspect([
      'status',
      '--change',
      'add-triple',
      '--json',
    ]);
    const apply = await inspect([
      'instructions',
      'apply',
      '--change',
      'add-triple',
      '--json',
    ]);
    assert(
      status?.changeName === 'add-triple' &&
        status?.schemaName === 'spec-driven' &&
        typeof status.isPlanningComplete === 'boolean' &&
        apply?.changeName === 'add-triple' &&
        apply?.schemaName === 'spec-driven' &&
        apply?.state === 'ready',
      'native-process-planning-unverified',
      'Pinned process is not apply-ready for this change/schema.',
    );
    return {
      applyState: apply.state as 'ready',
      isPlanningComplete: status.isPlanningComplete as boolean,
    };
  } finally {
    await rm(copy, { recursive: true, force: true });
  }
}

export const nativeProcessValidation = {
  executable: 'openspec',
  argv: ['validate', 'add-triple', '--strict'],
  cwd: '.',
};

// Concrete checks for the current math/OpenSpec fixtures; consent remains with the caller.
export async function checkMathExports(
  root: string,
  copy: string,
  stage: 'setup' | 'task',
  remaining: () => number,
  run: RunCheck,
) {
  await cp(root, copy, { recursive: true });
  if (stage === 'task')
    await writeFile(
      path.join(copy, 'independent.test.cjs'),
      "const {test}=require('node:test'),assert=require('node:assert/strict');let done=false;process.on('exit',()=>{if(!done)process.exitCode=1});test('independent',async()=>{const m=await import('./src/math.js');for(const x of [-2,0,3,17]){assert.equal(m.double(x),x*2);assert.equal(m.triple(x),x*3)}done=true});\n",
    );
  const budget = remaining();
  assert(
    budget > 0,
    'native-stage-timeout',
    'No time left for independent checks.',
  );
  const result = await run(copy, ['--test'], Math.min(15000, budget));
  return result.timedOut ? null : result.status;
}

export async function checkOpenSpecArtifacts(
  copy: string,
  cliRoot: string,
  remaining: () => number,
  run: RunCheck,
) {
  const budget = remaining();
  assert(
    budget > 0,
    'native-stage-timeout',
    'No time left for process verification.',
  );
  const result = await run(
    copy,
    [path.join(cliRoot, 'bin/openspec.js'), ...nativeProcessValidation.argv],
    Math.min(15000, budget),
  );
  return result.timedOut ? null : result.status;
}
