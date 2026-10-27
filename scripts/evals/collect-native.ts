import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { assert, digest, hashContent } from '../core/contracts.ts';
import { validateExperiment, validateRun } from './contracts.ts';
import { attachNativeUsage, restoreNativeTaskStartup } from './native-usage.ts';
import { buildPairedReport } from './report.ts';
import { writeEvalArtifact } from './observations.ts';
import type { QualityPlan } from './quality.ts';
import { prepareJudgePacket } from './quality.ts';
import type { QualityEvidence } from './quality.ts';

// Explicit, model-free processing of retained host artifacts. Original files are never changed.
export async function collectNative(
  directory: string,
  destination: string,
  label: string,
  legacyTimingHash?: string,
) {
  assert(
    /^[a-z][a-z0-9-]*$/.test(label),
    'invalid-native-label',
    'Use a bounded artifact label.',
  );
  const frozen = JSON.parse(
    await readFile(path.join(directory, 'frozen.json'), 'utf8'),
  );
  const experiment = validateExperiment(frozen.experiment);
  assert(
    digest(frozen.conditions) === experiment.conditionsHash,
    'invalid-native-cohort',
    'Frozen conditions differ from the experiment.',
  );
  if (legacyTimingHash)
    assert(
      frozen.conditions.harnessFiles.find(
        (file: { path: string }) => file.path === 'codex-diagnostic.ts',
      )?.hash === legacyTimingHash,
      'invalid-native-timing',
      'Timing correction must identify the executed buggy driver.',
    );
  const runs = [],
    evidence = [];
  const plan: QualityPlan = {
    setup: ['grounding', 'fit', 'sufficiency', 'consistency'],
    task: ['application', 'loading'],
  };
  const plans: Record<string, QualityPlan> =
    frozen.conditions.plans ??
    Object.fromEntries(
      experiment.scenarios.map((scenario) => [
        scenario.id,
        structuredClone(plan),
      ]),
    );
  for (const slot of experiment.order) {
    const input = JSON.parse(
      await readFile(path.join(directory, slot.id + '-run.json'), 'utf8'),
    );
    const raw = validateRun(
      input.experiment,
      input.scenario,
      input.result,
      input.events,
      input.grades,
    );
    assert(
      digest(raw.experiment) === digest(experiment) &&
        raw.result.id === slot.id,
      'invalid-native-cohort',
      'Run must belong to this cohort and artifact slot.',
    );
    const sessions = [];
    const indexed = frozen.conditions.nativeProtocol === 2;
    const observedStage = (stage: 'setup' | 'task') =>
      raw.result[stage]?.status !== 'skip' ||
      (indexed &&
        raw.events.some(
          (event) =>
            event.stage === stage &&
            event.kind === 'checkpoint' &&
            event.data.point === 'start',
        ));
    const index = indexed
      ? await readFile(path.join(directory, slot.id + '-sessions.json'), 'utf8')
          .then(JSON.parse)
          .catch((error) => {
            if (error.code === 'ENOENT') return null;
            throw error;
          })
      : null;
    if (index)
      assert(
        index.schema === 1 &&
          index.runHash === digest(raw) &&
          Array.isArray(index.sessions) &&
          index.sessions.length <= frozen.conditions.maxModelSessions &&
          new Set(index.sessions.map((item: { file: string }) => item.file))
            .size === index.sessions.length,
        'invalid-native-cohort',
        'Session index must bind the exact run and unique files.',
      );
    const entries: {
      stage: 'setup' | 'task';
      phase: string;
      file: string;
      hash?: string | null;
    }[] = indexed
      ? (index?.sessions ?? [])
      : (['setup', 'task'] as const).flatMap((stage) =>
          ['proposal', 'apply'].map((phase) => ({
            stage,
            phase,
            file: `${slot.id}-${stage}-${phase}.json`,
          })),
        );
    if (index) {
      const receipts = raw.events.filter(
        (event) =>
          event.kind === 'assertion' &&
          event.data.id.startsWith('native-session-'),
      );
      const observed = entries.filter(
        (entry) => observedStage(entry.stage) && entry.hash !== null,
      );
      assert(
        receipts.length === observed.length &&
          observed.every((entry) =>
            receipts.some(
              (event) =>
                event.kind === 'assertion' &&
                event.stage === entry.stage &&
                event.data.expectedHash === digest(entry) &&
                event.data.actualHash === digest(entry),
            ),
          ),
        'invalid-native-cohort',
        'Session index must match the receipts retained in the run.',
      );
    }
    if (indexed && !index)
      for (const stage of ['setup', 'task'] as const)
        if (observedStage(stage)) sessions.push({ stage, records: [] });
    for (const { stage, phase, file: name, hash } of entries) {
      assert(
        ['setup', 'task'].includes(stage) &&
          typeof phase === 'string' &&
          path.basename(name) === name &&
          name.startsWith(slot.id + '-') &&
          name.endsWith('.json'),
        'invalid-native-cohort',
        'Session file is outside its slot.',
      );
      const bytes = await readFile(path.join(directory, name)).catch(
        (error) => {
          if (error.code === 'ENOENT') return null;
          throw error;
        },
      );
      if (!bytes) {
        const expected =
          observedStage(stage) &&
          (indexed ||
            phase === 'proposal' ||
            raw.result[stage].status === 'pass' ||
            raw.events.some(
              (event) => event.stage === stage && event.kind === 'approval',
            ));
        if (expected) sessions.push({ stage, records: [] });
        continue;
      }
      if (indexed)
        assert(
          hash === hashContent(bytes),
          'invalid-native-cohort',
          'Session trace differs from its retained index.',
        );
      const record = JSON.parse(bytes.toString('utf8'));
      const turns = (record.records ?? []).filter(
        (item: { type: string }) => item.type === 'turn.completed',
      );
      const usage = indexed
        ? (record.usage ?? { inputTokens: null, outputTokens: null })
        : turns.length === 1
          ? Object.fromEntries(
              [
                'input_tokens',
                'output_tokens',
                'cached_input_tokens',
                'cache_write_input_tokens',
                'reasoning_output_tokens',
              ].map((key) => [
                key,
                Number.isSafeInteger(turns[0].usage?.[key]) &&
                turns[0].usage[key] >= 0
                  ? turns[0].usage[key]
                  : null,
              ]),
            )
          : null;
      evidence.push({
        attemptId: slot.id,
        stage,
        phase,
        sourceHash: hashContent(bytes),
        exitCode: record.exitCode,
        timedOut: record.timedOut,
        usage,
      });
      if (observedStage(stage))
        sessions.push(
          indexed
            ? {
                stage,
                usage: record.usage ?? {
                  inputTokens: null,
                  outputTokens: null,
                },
              }
            : { stage, records: record.records },
        );
    }
    const run = attachNativeUsage(
      legacyTimingHash ? restoreNativeTaskStartup(raw) : raw,
      sessions,
    );
    runs.push({ run });
    if (indexed) {
      const selected = JSON.parse(
        await readFile(
          path.join(directory, slot.id + '-evidence.json'),
          'utf8',
        ),
      );
      assert(
        selected.schema === 1 && selected.runHash === digest(raw),
        'invalid-quality-review',
        'Evidence belongs to another native run.',
      );
      prepareJudgePacket(
        raw,
        plans[slot.scenarioId],
        selected.evidence,
        'observed',
      );
      const originals = run.events.filter((event) => event.kind !== 'usage');
      const mapping = new Map(
        raw.events.map((event, index) => [event.seq, originals[index].seq]),
      );
      const facts: QualityEvidence[] = selected.evidence.map(
        (item: QualityEvidence) => ({
          ...item,
          events: item.events.map((seq) => mapping.get(seq)!),
        }),
      );
      await writeEvalArtifact(
        path.join(destination, `${slot.id}-${label}-judge.json`),
        prepareJudgePacket(run, plans[slot.scenarioId], facts, 'observed'),
      );
      await writeEvalArtifact(
        path.join(destination, `${slot.id}-${label}-linked-run.json`),
        run,
      );
    }
  }
  const report = buildPairedReport([
    { experiment, mode: 'observed', plans, runs },
  ]);
  await writeEvalArtifact(
    path.join(destination, `report-${label}-enriched.json`),
    report,
  );
  await writeEvalArtifact(
    path.join(destination, `observations-${label}-enriched.json`),
    {
      schema: 1,
      runs: runs.map(({ run }) => ({
        experimentHash: digest(experiment),
        scenarioHash: digest(run.scenario),
        result: run.result,
        events: run.events,
        grades: run.grades,
      })),
    },
  );
  await writeEvalArtifact(path.join(destination, `usage-${label}.json`), {
    schema: 1,
    experimentHash: digest(experiment),
    processorHash: hashContent(await readFile(fileURLToPath(import.meta.url))),
    usageProcessorHash: hashContent(
      await readFile(new URL('./native-usage.ts', import.meta.url)),
    ),
    timingCorrection: legacyTimingHash
      ? {
          driverHash: legacyTimingHash,
          method:
            'Retained setup-finished → task-finished host boundaries; includes fresh task startup. Raw durations/outcomes preserved in original artifacts.',
        }
      : null,
    sessions: evidence,
  });
  return {
    schema: 1,
    attempts: runs.length,
    sessions: evidence.length,
    cohorts: report.cohorts.length,
  };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  assert(
    process.argv.length >= 5 && process.argv.length <= 6,
    'invalid-native-collection',
    'Use INPUT_DIR OUTPUT_DIR LABEL [LEGACY_DRIVER_HASH].',
  );
  process.stdout.write(
    JSON.stringify(
      await collectNative(
        process.argv[2],
        process.argv[3],
        process.argv[4],
        process.argv[5],
      ),
    ) + '\n',
  );
}
