import { writeFile } from 'node:fs/promises';
import {
  basePlan,
  recordedExperiment,
  recordedRun,
  reviewed,
} from './recorded-quality.ts';

export async function run() {
  if (process.env.TIBICEN_EVAL_MARKER)
    await writeFile(process.env.TIBICEN_EVAL_MARKER, 'explicit-run');
  const secret = 'synthetic-external-value';
  if (process.env.TIBICEN_EVAL_CASE === 'throw') throw new Error(secret);
  if (process.env.TIBICEN_EVAL_CASE === 'malformed') return { experiments: [] };
  const fixture = recordedExperiment();
  const runs = fixture.experiment.order.map((_, i) =>
    reviewed(recordedRun(fixture, i)),
  );
  if (process.env.TIBICEN_EVAL_CASE === 'secret')
    runs[0].quality.judge.judgements[0].reason = secret;
  return {
    experiments: [
      {
        experiment: fixture.experiment,
        mode: 'calibration',
        plans: { control: basePlan },
        runs,
      },
    ],
    sensitiveValues: [secret],
  };
}
