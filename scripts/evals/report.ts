import { assert, digest } from '../core/contracts.ts';
import { validateExperiment, validateRun } from './contracts.ts';
import type { Experiment } from './contracts.ts';
import { summarizeAttempts, validateAttempt } from './results.ts';
import type { EvalAttempt, Stage } from './results.ts';
import {
  assessQuality,
  QUALITY_RUBRIC,
  validateQualityPlan,
} from './quality.ts';
import type {
  JudgePacket,
  LinkedRun,
  QualityAssessment,
  QualityPlan,
} from './quality.ts';
import { observationGuard } from './observations.ts';

export interface ReviewedRun {
  run: LinkedRun;
  quality?: { packet: JudgePacket; judge: unknown; human?: unknown };
}
export interface ReportExperiment {
  experiment: Experiment;
  mode: JudgePacket['mode'];
  plans: Record<string, QualityPlan>;
  runs: ReviewedRun[];
}
const phases = ['launch', 'setup', 'task'] as const;
const code = 'invalid-eval-report';

// Keep observed outcomes intact; this separate projection requires independent acceptance evidence.
function evaluated(
  run: LinkedRun,
  quality: QualityAssessment | null,
): EvalAttempt {
  const result = structuredClone(run.result);
  for (const stage of ['setup', 'task'] as const) {
    if (stage === 'task' && result.setup.status !== 'pass') {
      result.task = {
        status: 'skip',
        durationMs: 0,
        reason: 'evaluated-setup-not-passed',
      };
      continue;
    }
    if (result[stage].status !== 'pass') continue;
    const mechanical = run.grades.filter(
      (g) => g.stage === stage && g.scope !== 'quality',
    );
    const checks = [
      ...run.grades.filter((g) => g.stage === stage),
      ...(quality?.grades.filter((g) => g.stage === stage) ?? []),
    ];
    let reason: string | undefined,
      status: Stage['status'] = 'error';
    if (checks.some((g) => g.verdict === 'fail')) {
      reason = 'independent-check-failed';
      status = 'fail';
    } else if (
      !mechanical.some((g) => g.scope === 'invariants') ||
      (stage === 'task' && !mechanical.some((g) => g.scope === 'task'))
    )
      reason = 'missing-mechanical-evidence';
    else if (!quality) reason = 'missing-quality-review';
    else if (checks.some((g) => g.verdict === 'unverified'))
      reason = 'independent-check-unverified';
    if (reason)
      result[stage] = { status, durationMs: result[stage].durationMs, reason };
  }
  return validateAttempt(result);
}

function measurements(run: LinkedRun) {
  const durationMs = { launch: null, setup: null, task: null } as Record<
    (typeof phases)[number],
    number | null
  >;
  const usage = {} as Record<
    (typeof phases)[number],
    {
      costUsd: number | null;
      inputTokens: number | null;
      outputTokens: number | null;
    } | null
  >;
  for (const stage of phases) {
    durationMs[stage] =
      run.result[stage].status === 'skip' ? null : run.result[stage].durationMs;
    // Usage is cumulative within one stage: only its latest snapshot is the final observation.
    const last = run.events
      .filter((e) => e.stage === stage && e.kind === 'usage')
      .at(-1);
    usage[stage] =
      last?.kind === 'usage'
        ? structuredClone(last.data)
        : run.result[stage].status === 'skip'
          ? null
          : { costUsd: null, inputTokens: null, outputTokens: null };
  }
  const executed = phases.filter(
    (stage) => run.result[stage].status !== 'skip' || usage[stage] !== null,
  );
  const costUsd =
    executed.length && executed.every((stage) => usage[stage]?.costUsd !== null)
      ? executed.reduce((sum, stage) => sum + usage[stage]!.costUsd!, 0)
      : null;
  return { durationMs, usage, costUsd };
}
function row(
  record: ReviewedRun,
  mode: ReportExperiment['mode'],
  plan: QualityPlan,
) {
  const run = validateRun(
    record.run.experiment,
    record.run.scenario,
    record.run.result,
    record.run.events,
    record.run.grades,
  );
  let quality: QualityAssessment | null = null;
  if (record.quality) {
    assert(
      record.quality.packet.mode === mode &&
        digest(record.quality.packet.plan) === digest(plan),
      code,
      'Do not mix evidence modes or rubric plans.',
    );
    quality = assessQuality(
      run,
      record.quality.packet,
      record.quality.judge,
      record.quality.human,
    );
  }
  return {
    id: run.result.id,
    observed: structuredClone(run.result),
    evaluated: evaluated(run, quality),
    observedGrades: structuredClone(run.grades),
    quality,
    measurements: measurements(run),
  };
}
type Row = ReturnType<typeof row>;
function quantity(values: (number | null | 'not-executed')[]) {
  const known = values.filter(
    (value): value is number => typeof value === 'number',
  );
  const unknownCount = values.filter((value) => value === null).length;
  const knownSubtotal = known.reduce((sum, value) => sum + value, 0);
  return {
    knownSubtotal,
    knownCount: known.length,
    unknownCount,
    notExecutedCount: values.filter((value) => value === 'not-executed').length,
    total: known.length && !unknownCount ? knownSubtotal : null,
  };
}
const difference = (
  a: number | null | undefined,
  b: number | null | undefined,
) => (a == null || b == null ? null : a - b);
function summary(rows: (Row | null)[]) {
  const present = rows.filter((r): r is Row => r !== null);
  return {
    planned: rows.length,
    recorded: present.length,
    missing: rows.length - present.length,
    observed: summarizeAttempts(present.map((r) => r.observed)),
    evaluated: summarizeAttempts(present.map((r) => r.evaluated)),
    costUsd: quantity(
      rows.map((r) =>
        r?.observed.launch.status === 'skip'
          ? 'not-executed'
          : (r?.measurements.costUsd ?? null),
      ),
    ),
    durationMs: Object.fromEntries(
      phases.map((stage) => [
        stage,
        quantity(
          rows.map((r) =>
            r?.observed[stage].status === 'skip'
              ? 'not-executed'
              : (r?.measurements.durationMs[stage] ?? null),
          ),
        ),
      ]),
    ),
  };
}

export function buildPairedReport(
  inputs: ReportExperiment[],
  sensitiveValues: readonly string[] = [],
) {
  assert(Array.isArray(inputs), code, 'Report frozen experiments explicitly.');
  const ids = new Set<string>();
  const cohorts = inputs.flatMap((input) => {
    const experiment = validateExperiment(input.experiment),
      experimentHash = digest(experiment);
    assert(
      !ids.has(experiment.id) &&
        ['calibration', 'observed'].includes(input.mode),
      code,
      'Experiment ids and evidence modes must be unambiguous.',
    );
    ids.add(experiment.id);
    assert(
      input.plans &&
        typeof input.plans === 'object' &&
        Object.keys(input.plans).length === experiment.scenarios.length &&
        experiment.scenarios.every((s) => Object.hasOwn(input.plans, s.id)),
      code,
      'Freeze a rubric plan for each scenario.',
    );
    for (const plan of Object.values(input.plans)) validateQualityPlan(plan);
    assert(Array.isArray(input.runs), code, 'Expected observed run records.');
    const rows = new Map<string, Row>();
    for (const record of input.runs) {
      assert(
        digest(record.run.experiment) === experimentHash &&
          !rows.has(record.run.result.id),
        code,
        'A run must belong to this experiment and retain its unique id.',
      );
      const plan = input.plans[record.run.result.scenarioId];
      const value = row(record, input.mode, plan);
      rows.set(value.id, value);
    }
    return experiment.scenarios.flatMap((scenario) =>
      experiment.profiles.map((profile) => {
        const plan = input.plans[scenario.id];
        const binding = {
          experimentHash,
          scenarioHash: scenario.hash,
          profileHash: digest(profile),
          rubricHash: digest(QUALITY_RUBRIC),
          plan: structuredClone(plan),
          mode: input.mode,
        };
        const slots = experiment.order.filter(
          (slot) =>
            slot.scenarioId === scenario.id && slot.profileId === profile.id,
        );
        const variants = {
          tibicen: summary(
            slots
              .filter((s) => s.variant === 'tibicen')
              .map((s) => rows.get(s.id) ?? null),
          ),
          baseline: summary(
            slots
              .filter((s) => s.variant === 'baseline')
              .map((s) => rows.get(s.id) ?? null),
          ),
        };
        const pairs = Array.from(
          { length: experiment.setupOnlyTibicen ? 0 : experiment.repeats },
          (_, index) => {
            const repeat = index + 1;
            const get = (variant: 'tibicen' | 'baseline') => {
              const slot = slots.find(
                (s) => s.repeat === repeat && s.variant === variant,
              )!;
              return { id: slot.id, record: rows.get(slot.id) ?? null };
            };
            const tibicen = get('tibicen'),
              baseline = get('baseline');
            return {
              repeat,
              tibicen,
              baseline,
              complete: tibicen.record !== null && baseline.record !== null,
              delta: {
                setupMs: difference(
                  tibicen.record?.measurements.durationMs.setup,
                  baseline.record?.measurements.durationMs.setup,
                ),
                taskMs: difference(
                  tibicen.record?.measurements.durationMs.task,
                  baseline.record?.measurements.durationMs.task,
                ),
                costUsd: difference(
                  tibicen.record?.measurements.costUsd,
                  baseline.record?.measurements.costUsd,
                ),
              },
            };
          },
        );
        const invariantFailures = slots.flatMap((s) =>
          (rows.get(s.id)?.observedGrades ?? [])
            .filter((g) => g.scope === 'invariants' && g.verdict === 'fail')
            .map((g) => ({ attemptId: s.id, grade: g })),
        );
        return {
          id: digest(binding),
          ...binding,
          experimentId: experiment.id,
          sourceSha: experiment.sourceSha,
          conditionsHash: experiment.conditionsHash,
          limits: structuredClone(experiment.limits),
          scenarioId: scenario.id,
          profile: structuredClone(profile),
          variants,
          pairs,
          ...(experiment.setupOnlyTibicen
            ? {
                setupOnlyTibicen: true as const,
                attempts: slots.map((slot) => ({
                  id: slot.id,
                  record: rows.get(slot.id) ?? null,
                })),
              }
            : {}),
          invariantFailures,
        };
      }),
    );
  });
  const report = {
    schema: 1,
    meaning: inputs.some((input) => input.experiment.setupOnlyTibicen)
      ? ('experimental-observations' as const)
      : ('experimental-comparison' as const),
    cohorts,
  };
  observationGuard(sensitiveValues)(report);
  return report;
}
