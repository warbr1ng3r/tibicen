import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  readdir,
  realpath,
  rm,
} from 'node:fs/promises';
import { createProposal } from '../core/plan.ts';
import { getStatus } from '../core/apply.ts';
import { assert, digest } from '../core/contracts.ts';
import { loadDiagnostic, materializeScenario } from './fixtures.ts';

// Explicit host fixture authoring, not part of ordinary test execution or the distributed skills.
const parent = await realpath(
  await mkdtemp(path.join(os.tmpdir(), 'tibicen-lifecycle-author-')),
);
try {
  const { scenario } = await loadDiagnostic('diagnostic-bare');
  const runner = path.join(parent, 'interrupt.mjs');
  await writeFile(
    runner,
    `import {applyPlan} from ${JSON.stringify(new URL('../core/apply.ts', import.meta.url).href)};import {readFile} from 'node:fs/promises';const x=JSON.parse(await readFile(process.argv[2],'utf8'));await applyPlan(x.root,x.plan,{home:x.home,approvedDigest:x.plan.digest,beforeApply:async()=>({id:'original-baseline',complete:true,runs:[]}),...(x.point==='after-command'?{verify:async(plan,session,execution)=>{await execution.runner(plan.commands[0],{root:x.root,approvedDigest:x.plan.digest});return{infrastructure:{kind:'infrastructure',status:'passed'}};}}:{}),checkpoint(point){if(point===x.point)process.exit(73);}});`,
  );
  const cases = [];
  for (const action of ['add', 'modify', 'delete'] as const)
    for (const point of ['before-file-write', 'after-file-write'] as const) {
      cases.push({ id: `resume-${action}-${point}`, action, point });
    }
  for (const point of [
    'before-manifest-write',
    'after-manifest-write',
    'before-state-cleanup',
  ] as const)
    cases.push({ id: 'resume-' + point, action: 'modify' as const, point });
  cases.push({
    id: 'resume-ambiguous',
    action: 'modify',
    point: 'after-file-write',
  });
  cases.push({
    id: 'resume-command-unknown',
    action: 'modify',
    point: 'after-command',
  });
  const frozen = [];
  async function files(
    root: string,
    prefix = '',
  ): Promise<{ path: string; content: string }[]> {
    const result = [];
    for (const entry of (
      await readdir(path.join(root, prefix), { withFileTypes: true })
    ).sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = path.posix.join(prefix, entry.name);
      if (entry.isDirectory()) result.push(...(await files(root, relative)));
      else
        result.push({
          path: relative,
          content: await readFile(path.join(root, relative), 'utf8'),
        });
    }
    return result;
  }
  for (const item of cases) {
    const { root } = await materializeScenario(scenario, parent);
    const home = await mkdtemp(path.join(parent, 'home-'));
    if (item.action !== 'add')
      await writeFile(
        path.join(root, 'AGENTS.md'),
        '# Owner\r\nKeep double.  \r\n',
      );
    const plan = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          {
            path: 'AGENTS.md',
            action: item.action,
            ...(item.action === 'delete'
              ? {}
              : {
                  content: '# Updated\r\nKeep double and owner review.  \r\n',
                  fileMode: 0o644,
                }),
            reason: 'Previously reviewed infrastructure change.',
          },
        ],
        ...(item.point === 'after-command'
          ? {
              commands: [
                {
                  id: 'node-test',
                  kind: 'test',
                  executable: 'node',
                  argv: ['--test'],
                  cwd: '.',
                  envNames: [],
                  trusted: true,
                },
              ],
            }
          : {}),
      },
      { home },
    );
    const config = path.join(parent, 'config.json');
    await writeFile(
      config,
      JSON.stringify({ root, home, plan, point: item.point }),
    );
    const run = spawnSync(process.execPath, [runner, config], {
      encoding: 'utf8',
      timeout: 15000,
      env: { PATH: process.env.PATH, HOME: home },
    });
    assert(
      run.status === 73 && !run.stderr,
      'fixture-interruption-failed',
      'Expected a hard exit at the selected checkpoint.',
    );
    if (item.id === 'resume-ambiguous')
      await writeFile(
        path.join(root, 'AGENTS.md'),
        '# Concurrent owner edit\r\nDo not overwrite.\r\n',
      );
    const status = await getStatus(root);
    assert(
      status.state && status.recovery,
      'fixture-interruption-failed',
      'Expected recoverable saved state.',
    );
    await mkdir(path.join(root, 'docs'), { recursive: true });
    await writeFile(
      path.join(root, 'docs/previously-reviewed-plan.json'),
      JSON.stringify(plan, null, 2) + '\n',
    );
    const inputs = await files(root);
    for (const file of inputs)
      if (
        [
          '.tibicen/state/session.json',
          'docs/previously-reviewed-plan.json',
        ].includes(file.path)
      ) {
        const record = JSON.parse(file.content);
        record.proposal.root = '/fixture/project';
        record.proposal.usageFile = '/fixture/home/.tibicen/usage.json';
        if (file.path.endsWith('session.json'))
          record.proposalDigest = digest(record.proposal);
        else record.digest = digest(record.proposal);
        file.content = JSON.stringify(record, null, 2) + '\n';
      }
    frozen.push({
      ...item,
      files: inputs,
      expected: {
        sessionId: status.state.id,
        files: status.recovery.files.map((file) => ({
          path: file.path,
          state: file.state,
        })),
        manifest: status.recovery.manifest,
        unknownCommands: status.recovery.unknownCommands,
      },
    });
  }
  await writeFile(
    new URL('./fixtures/lifecycle.json', import.meta.url),
    JSON.stringify(
      {
        schema: 1,
        createdBy:
          'Real kernel hard exit, schema 3 state; expectations held by host only. No model runs.',
        cases: frozen,
      },
      null,
      2,
    ) + '\n',
  );
  process.stdout.write(`Frozen ${frozen.length} real interruption states.\n`);
} finally {
  await rm(parent, { recursive: true, force: true });
}
