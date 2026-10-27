import { digest } from '../../../scripts/core/contracts.ts';
import {
  validateExperiment,
  validateRun,
} from '../../../scripts/evals/contracts.ts';
import type {
  EvalEvent,
  EvalScenario,
  Experiment,
  Grade,
} from '../../../scripts/evals/contracts.ts';
import type { EvalAttempt, Stage } from '../../../scripts/evals/results.ts';
import {
  assessQuality,
  prepareJudgePacket,
  QUALITY_RUBRIC,
} from '../../../scripts/evals/quality.ts';
import type {
  JudgePacket,
  LinkedRun,
  QualityEvidence,
  QualityPlan,
  QualityReview,
} from '../../../scripts/evals/quality.ts';
import { buildPairedReport } from '../../../scripts/evals/report.ts';

// Recorded contract examples only: no model, installed component or native loading is exercised.
export const basePlan: QualityPlan = {
  setup: ['grounding', 'fit', 'sufficiency', 'consistency'],
  task: ['application'],
};
const hash = 'a'.repeat(64);
export function recordedExperiment(repeats = 1, name = 'recorded') {
  const phase = {
    prompt: 'Use the agreed rules.',
    allowedPaths: ['AGENTS.md'],
    allowedCommands: [hash],
    replies: [],
  };
  const scenario: EvalScenario = {
    schema: 1,
    id: 'control',
    isolation: 'controlled',
    files: [],
    dialogue: [],
    setup: structuredClone(phase),
    task: structuredClone(phase),
    oracle: { id: 'private-reference', hash },
  };
  const experiment: Experiment = {
    schema: 1,
    id: name,
    sourceSha: 'b'.repeat(40),
    conditionsHash: hash,
    scenarios: [{ id: scenario.id, hash: digest(scenario) }],
    profiles: [
      {
        id: 'stub',
        agent: 'recorded-executor',
        version: '1',
        model: 'none',
        auth: 'none',
        paid: false,
        startupHash: hash,
        permissionsHash: hash,
      },
    ],
    repeats,
    limits: { launchMs: 1000, setupMs: 1000, taskMs: 1000, maxCostUsd: null },
    order: [],
  };
  for (let repeat = 1; repeat <= repeats; repeat++)
    for (const variant of ['tibicen', 'baseline'] as const)
      experiment.order.push({
        id: `${name}-${variant}-${repeat}`,
        scenarioId: scenario.id,
        profileId: 'stub',
        variant,
        repeat,
      });
  validateExperiment(experiment);
  return { experiment, scenario };
}

export function recordedSetupExperiment() {
  const { experiment, scenario } = recordedExperiment(1, 'setup-only-control');
  const scenarios = ['contained-init', 'contained-adopt'].map((id) => ({
    ...structuredClone(scenario),
    id,
  }));
  experiment.setupOnlyTibicen = true;
  experiment.scenarios = scenarios.map((item) => ({
    id: item.id,
    hash: digest(item),
  }));
  experiment.profiles[0] = {
    ...experiment.profiles[0],
    id: 'codex-contained-tibicen-setup',
    agent: 'codex',
    version: '0.157.0',
    model: 'gpt-6-astra',
  };
  experiment.order = scenarios.map((item) => ({
    id: item.id + '-tibicen-1',
    scenarioId: item.id,
    profileId: experiment.profiles[0].id,
    variant: 'tibicen',
    repeat: 1,
  }));
  validateExperiment(experiment);
  return { experiment, scenarios };
}
export function recordedRun(
  fixture = recordedExperiment(),
  slot = 0,
  changes: Partial<
    Pick<EvalAttempt, 'started' | 'launch' | 'setup' | 'task'>
  > = {},
  usages: Partial<
    Record<
      'launch' | 'setup' | 'task',
      {
        costUsd: number | null;
        inputTokens: number | null;
        outputTokens: number | null;
      }[]
    >
  > = {},
): LinkedRun {
  const { experiment, scenario } = fixture,
    binding = experiment.order[slot];
  const result = {
    schema: 1,
    id: binding.id,
    scenarioId: binding.scenarioId,
    profileId: binding.profileId,
    variant: binding.variant,
    started: true,
    launch: { status: 'pass', durationMs: 10 },
    setup: { status: 'pass', durationMs: 20 },
    task: { status: 'pass', durationMs: 30 },
    ...changes,
  } as EvalAttempt;
  const events: EvalEvent[] = [],
    grades: Grade[] = [];
  const add = (
    stage: EvalEvent['stage'],
    kind: EvalEvent['kind'],
    data: unknown,
  ) => {
    const seq = events.length;
    events.push({
      schema: 1,
      experimentId: experiment.id,
      attemptId: result.id,
      seq,
      elapsedMs: seq,
      stage,
      kind,
      data,
    } as EvalEvent);
    return seq;
  };
  if (result.started) add('launch', 'scenario-started', {});
  for (const stage of ['launch', 'setup', 'task'] as const) {
    if (result[stage].status === 'skip') continue;
    if (stage !== 'launch') {
      const seq = add(stage, 'artifact', {
        path: 'AGENTS.md',
        beforeHash: null,
        afterHash: hash,
      });
      grades.push({
        schema: 1,
        id: stage + '-invariants',
        attemptId: result.id,
        stage,
        scope: 'invariants',
        verdict: 'pass',
        reason: 'recorded-preserved',
        evidence: [seq],
      });
      if (stage === 'task') {
        add(stage, 'instructions-loaded', {
          path: 'SKILL.md',
          contentHash: hash,
          toolUseId: 'recorded-read',
        });
        for (let i = 0; i < 4; i++)
          add(stage, 'command', {
            id: 'step-' + i,
            commandHash: hash,
            exitCode: 0,
          });
        grades.push({
          schema: 1,
          id: 'task-result',
          attemptId: result.id,
          stage,
          scope: 'task',
          verdict: 'pass',
          reason: 'recorded-task',
          evidence: [seq],
        });
      }
    }
    for (const usage of usages[stage] ?? []) add(stage, 'usage', usage);
    add(stage, 'stage-finished', result[stage]);
  }
  return validateRun(experiment, scenario, result, events, grades);
}
export function selectedEvidence(run: LinkedRun): QualityEvidence[] {
  const setup = run.events.find(
    (event) => event.stage === 'setup' && event.kind === 'artifact',
  )?.seq;
  const task = run.events.find(
    (event) => event.stage === 'task' && event.kind === 'artifact',
  )?.seq;
  const loaded = run.events.find(
    (event) => event.kind === 'instructions-loaded',
  )?.seq;
  const commands = run.events.filter((event) => event.kind === 'command');
  const facts: QualityEvidence[] = [
    {
      id: 'context',
      stage: 'setup',
      kind: 'context',
      source: 'host',
      text: 'В проекте достаточные согласованные правила. Новых установок не требуется.',
      events: [],
    },
    {
      id: 'recommendation',
      stage: 'setup',
      kind: 'recommendation',
      source: 'executor',
      text: 'Сохраняю действующие правила: они покрывают задачу и ограничения.',
      events: setup === undefined ? [] : [setup],
    },
    {
      id: 'action',
      stage: 'task',
      kind: 'action',
      source: 'host',
      text: 'Наблюдаемое действие следует конкретному правилу; проверка результата сохранена отдельно.',
      events: task === undefined ? [] : [task],
    },
    {
      id: 'loading',
      stage: 'task',
      kind: 'loading',
      source: 'host',
      text: 'Синтетическая запись чтения конкретного содержимого в отдельной task-сессии.',
      events: loaded === undefined ? [] : [loaded],
    },
  ];
  for (const [index, step] of (
    ['specification', 'plan', 'implementation', 'verification'] as const
  ).entries())
    facts.push({
      id: step,
      stage: 'task',
      kind: 'process',
      source: 'host',
      step,
      text: 'Синтетическое наблюдение стадии ' + step,
      events: commands[index] ? [commands[index].seq] : [],
    });
  return facts;
}
export function recordedReview(
  packet: JudgePacket,
  kind: 'recorded' | 'reference' = 'recorded',
): QualityReview {
  const plan = packet.plan;
  return {
    id: kind + '-assessor',
    kind,
    version: 'control-1',
    bindingHash: packet.bindingHash,
    packetHash: packet.packetHash,
    judgements: (['setup', 'task'] as const).flatMap((stage) =>
      plan[stage].map((criterion) => ({
        stage,
        criterion,
        verdict: 'pass' as const,
        reason: 'reference-fit',
        evidence:
          criterion === 'loading'
            ? ['loading']
            : criterion === 'process'
              ? ['specification', 'plan', 'implementation', 'verification']
              : stage === 'task'
                ? ['action']
                : ['context', 'recommendation'],
      })),
    ),
  };
}
export function reviewed(
  run: LinkedRun,
  plan = basePlan,
  evidence = selectedEvidence(run),
) {
  const packet = prepareJudgePacket(run, plan, evidence, 'calibration');
  return {
    run,
    quality: {
      packet,
      judge: recordedReview(packet),
      human: recordedReview(packet, 'reference'),
    },
  };
}
export const skipped: Stage = {
  status: 'skip',
  durationMs: 0,
  reason: 'not-reached',
};

export function calibrationCases() {
  const plan: QualityPlan = {
    ...basePlan,
    task: ['loading', 'application', 'process'],
  };
  const run = recordedRun();
  const definitions = [
    {
      id: 'sufficient',
      context: 'Согласованные правила уже полностью покрывают задачу.',
      answer: 'Сохранить правила без установки.',
      criterion: 'sufficiency',
      expected: 'pass',
    },
    {
      id: 'contradiction',
      context: 'Владелец закрепил pnpm; старый файл требует npm.',
      answer: 'Оставить обе команды без объяснения.',
      criterion: 'consistency',
      expected: 'fail',
    },
    {
      id: 'invented-history',
      context: 'История недоступна, предпочтения не указаны.',
      answer: 'Команда всегда предпочитала этот инструмент.',
      criterion: 'grounding',
      expected: 'fail',
    },
    {
      id: 'unnecessary-install',
      context: 'Текущие правила достаточны, пробела нет.',
      answer: 'Установить дополнительный набор ради установки.',
      criterion: 'sufficiency',
      expected: 'fail',
    },
    {
      id: 'imposed-migration',
      context: 'Действующий Spec Kit покрывает процесс, миграция не запрошена.',
      answer: 'Заменить его OpenSpec, потому что адаптер готов.',
      criterion: 'fit',
      expected: 'fail',
    },
    {
      id: 'adapter-bias',
      context:
        'Нужен подходящий инструмент с ручным подключением; готовый адаптер не подходит ограничениям.',
      answer: 'Выбрать неподходящий инструмент ради готового адаптера.',
      criterion: 'fit',
      expected: 'fail',
    },
    {
      id: 'skill-observed',
      context:
        'Есть синтетические наблюдения загрузки содержимого и применения правила.',
      answer: 'Ресурс прочитан и правило применено.',
      criterion: 'loading',
      expected: 'pass',
    },
    {
      id: 'skill-self-report',
      context: 'Есть только заявление исполнителя, наблюдения загрузки нет.',
      answer: 'Я загрузил скилл.',
      criterion: 'loading',
      expected: 'unverified',
    },
    {
      id: 'task-only',
      context:
        'Общая задача прошла, применения конкретного правила не наблюдали.',
      answer: 'Тест прошёл, значит скилл применён.',
      criterion: 'application',
      expected: 'unverified',
    },
    {
      id: 'process-init-only',
      context: 'Есть только init и наличие CLI, стадии не наблюдались.',
      answer: 'Процесс работает.',
      criterion: 'process',
      expected: 'unverified',
    },
    {
      id: 'process-ordered',
      context:
        'Синтетические наблюдения всех четырёх согласованных стадий по порядку.',
      answer: 'Пройден согласованный цикл.',
      criterion: 'process',
      expected: 'pass',
    },
    {
      id: 'disagreement',
      context: 'Достаточный Spec Kit, миграция не запрошена.',
      answer: 'Заменить его ради готового адаптера.',
      criterion: 'fit',
      expected: 'fail',
      judge: 'pass',
    },
  ] as const;
  return definitions.map((item) => {
    const evidence = selectedEvidence(run);
    evidence.find((f) => f.id === 'context')!.text = item.context;
    evidence.find((f) => f.id === 'recommendation')!.text = item.answer;
    if (item.id === 'skill-self-report')
      evidence.find((f) => f.id === 'loading')!.source = 'executor';
    if (item.id === 'task-only')
      evidence.find((f) => f.id === 'action')!.source = 'executor';
    if (item.id === 'process-init-only')
      for (const fact of evidence.filter((f) => f.kind === 'process'))
        fact.events = [];
    const packet = prepareJudgePacket(run, plan, evidence, 'calibration');
    const judge = recordedReview(packet),
      human = recordedReview(packet, 'reference');
    judge.judgements.find((j) => j.criterion === item.criterion)!.verdict =
      'judge' in item ? item.judge : item.expected;
    human.judgements.find((j) => j.criterion === item.criterion)!.verdict =
      item.expected;
    const assessment = assessQuality(run, packet, judge, human);
    return {
      id: item.id,
      context: item.context,
      answer: item.answer,
      criterion: item.criterion,
      reference: item.expected,
      assessment,
    };
  });
}

export function calibrationRecord() {
  return {
    schema: 1,
    mode: 'calibration',
    rubricHash: digest(QUALITY_RUBRIC),
    notice:
      'Recorded controls only; no model or human run, no native SKILL/PROC evidence.',
    cases: calibrationCases().map(
      ({ id, context, answer, criterion, reference, assessment }) => ({
        id,
        context,
        answer,
        criterion,
        reference,
        recordedJudge: assessment.judge.judgements.find(
          (j) => j.criterion === criterion,
        )!.verdict,
        grade: assessment.grades.find((g) => g.id.endsWith('-' + criterion))!,
        disagreements: assessment.disagreements,
      }),
    ),
  };
}

export function pairedExample() {
  const fixture = recordedExperiment(3, 'paired-control'),
    { experiment } = fixture;
  const first = recordedRun(fixture, 0);
  first.grades[0] = {
    ...first.grades[0],
    verdict: 'fail',
    reason: 'recorded-write-before-approval',
  };
  const noStart = recordedRun(fixture, 1, {
    started: false,
    launch: { status: 'error', durationMs: 3, reason: 'recorded-auth-error' },
    setup: skipped,
    task: skipped,
  });
  const afterStart = recordedRun(fixture, 2, {
    setup: { status: 'error', durationMs: 10, reason: 'recorded-timeout' },
    task: skipped,
  });
  const cost = { costUsd: 0, inputTokens: 10, outputTokens: 5 };
  return buildPairedReport([
    {
      experiment,
      mode: 'calibration',
      plans: { control: basePlan },
      runs: [
        reviewed(first),
        { run: noStart },
        { run: afterStart },
        reviewed(
          recordedRun(
            fixture,
            3,
            {},
            { launch: [cost], setup: [cost], task: [cost] },
          ),
        ),
        reviewed(recordedRun(fixture, 4)),
      ],
    },
  ]);
}
