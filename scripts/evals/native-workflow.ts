import path from 'node:path';
import { readFile } from 'node:fs/promises';
import {
  assert,
  digest,
  hashContent,
  validateProposal,
} from '../core/contracts.ts';
import { readCurrent } from '../core/plan.ts';
import {
  planComponents,
  readManifest,
  installedComponents,
} from '../core/components.ts';
import { inspectProcess } from '../process/index.ts';
import type { Source, Proposal } from '../core/types.ts';
import type { EvalScenario } from './contracts.ts';
import type { AcceptanceFixture } from './matrix.ts';
import type { ProcessPlanning } from './matrix/shared.ts';
import type { NativeOutput } from './profiles/contracts.ts';
import { safePath } from '../core/paths.ts';

export type NativePhase =
  'setup' | 'task' | 'specification' | 'plan' | 'implementation';
export interface NativeScope {
  home: string;
  sources: Source[];
  cliRoot?: string;
}
export interface NativeProposal {
  summary: string;
  changes: { path: string; content: string | null }[];
  commands: string[];
  kernelPlan: string | null;
  question?: string | null;
  skipDesignReason?: string | null;
}
export const nodeRecipe = { executable: 'node', argv: ['--test'], cwd: '.' };
const change = 'openspec/changes/add-triple/';

export function nativeProposalSchema(
  acceptance = false,
  optionalDesign = false,
) {
  return {
    type: 'object',
    additionalProperties: false,
    required: [
      'summary',
      'changes',
      'commands',
      'kernelPlan',
      ...(acceptance ? ['question'] : []),
      ...(optionalDesign ? ['skipDesignReason'] : []),
    ],
    properties: {
      summary: { type: 'string' },
      changes: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['path', 'content'],
          properties: {
            path: { type: 'string' },
            content: { type: ['string', 'null'] },
          },
        },
      },
      commands: { type: 'array', items: { type: 'string' } },
      kernelPlan: {
        type: ['string', 'null'],
        description:
          'Prefer proposal-sha256:<digest> referencing successful compiled stdout from this proposal session. Legacy JSON.stringify of the complete {proposal,digest,summary} envelope is accepted. Never the input intent. Kernel commands must be empty; checks belong in outer commands. Null when no kernel apply is needed.',
      },
      ...(acceptance ? { question: { type: ['string', 'null'] } } : {}),
      ...(optionalDesign
        ? { skipDesignReason: { type: ['string', 'null'] } }
        : {}),
    },
  };
}
export function isNativeNodeTest(command: unknown) {
  return nativeRecipe(command)?.executable === 'node';
}

export async function reviewNativeProposal(
  value: unknown,
  scenario: EvalScenario,
  stage: 'setup' | 'task',
  root: string,
  scope?: NativeScope,
  phase: NativePhase = stage,
  observedOutputs: Pick<
    NativeOutput['commands'][number],
    'output' | 'exitCode'
  >[] = [],
  planning?: ProcessPlanning,
) {
  assert(
    value && typeof value === 'object' && !Array.isArray(value),
    'native-proposal-rejected',
    'Expected a bounded native proposal.',
  );
  const input = structuredClone(value) as NativeProposal;
  const optionalDesign = phase === 'plan' && !!planning?.optionalDesign;
  assert(
    [
      'changes,commands,kernelPlan,summary',
      ...(scope ? ['changes,commands,kernelPlan,question,summary'] : []),
    ].includes(
      Object.keys(input)
        .filter((key) => key !== 'skipDesignReason' || !optionalDesign)
        .sort()
        .join(','),
    ) &&
      typeof input.summary === 'string' &&
      input.summary.length <= 16000 &&
      Array.isArray(input.changes) &&
      input.changes.length <= 30 &&
      (input.kernelPlan === null || typeof input.kernelPlan === 'string') &&
      (input.question === undefined ||
        input.question === null ||
        (typeof input.question === 'string' &&
          input.question.length <= 4000)) &&
      (input.skipDesignReason === undefined ||
        input.skipDesignReason === null ||
        (typeof input.skipDesignReason === 'string' &&
          input.skipDesignReason.trim().length > 0 &&
          input.skipDesignReason.length <= 4000)),
    'native-proposal-rejected',
    'Invalid proposal fields.',
  );
  const commandHashes = reviewedCommands(
    input.commands,
    scenario,
    stage,
    phase,
    scope?.cliRoot,
  );
  if (input.question)
    assert(
      !input.changes.length &&
        !input.commands.length &&
        input.kernelPlan === null &&
        !input.skipDesignReason,
      'native-proposal-rejected',
      'A clarification cannot grant writes or execution.',
    );
  const allowed = phasePaths(scenario, stage, phase),
    changes = [];
  for (const file of input.changes) {
    assert(
      file &&
        Object.keys(file).sort().join(',') === 'content,path' &&
        allowed.includes(file.path) &&
        !file.path.startsWith('.tibicen/') &&
        (file.content === null ||
          (typeof file.content === 'string' &&
            file.content.length <= 2 * 1024 * 1024)),
      'native-proposal-rejected',
      'Path/content outside this consent phase.',
    );
    const old = await readFile(await safePath(root, file.path)).catch(
      (error) => {
        if (error.code === 'ENOENT') return null;
        throw error;
      },
    );
    changes.push({
      path: file.path,
      beforeHash: old === null ? null : hashContent(old),
      afterHash: file.content === null ? null : hashContent(file.content),
    });
  }
  assert(
    new Set(changes.map((file) => file.path)).size === changes.length,
    'native-proposal-rejected',
    'Duplicate path.',
  );
  let kernel: Record<string, unknown> | null = null,
    receipt: Awaited<ReturnType<typeof reviewAcceptanceKernel>> | undefined;
  if (input.kernelPlan !== null) {
    assert(
      stage === 'setup',
      'native-proposal-rejected',
      'Kernel setup cannot approve an application task.',
    );
    if (input.kernelPlan.startsWith('proposal-sha256:')) {
      const reference = input.kernelPlan.slice('proposal-sha256:'.length);
      assert(
        /^[a-f0-9]{64}$/.test(reference),
        'native-proposal-rejected',
        'Invalid compiled proposal reference.',
      );
      for (const output of observedOutputs) {
        if (output.exitCode !== 0) continue;
        try {
          const candidate = JSON.parse(output.output);
          if (
            candidate?.proposal &&
            candidate.digest === reference &&
            digest(candidate.proposal) === reference
          ) {
            kernel = candidate;
            break;
          }
        } catch {
          /* Only successful, exact JSON output from this session can resolve a reference. */
        }
      }
      assert(
        kernel,
        'native-proposal-rejected',
        'Compiled proposal was not observed in this proposal session.',
      );
    } else kernel = JSON.parse(input.kernelPlan) as Record<string, unknown>;
    assert(
      kernel && typeof kernel === 'object',
      'native-proposal-rejected',
      'Invalid kernel plan.',
    );
    const proposal = kernelProposal(kernel);
    assert(
      proposal.root === root &&
        (kernel.digest === undefined || kernel.digest === digest(proposal)) &&
        Array.isArray(proposal.changes) &&
        digest(
          proposal.changes.map((file) => ({
            path: file.path,
            beforeHash: file.beforeHash,
            afterHash:
              file.action === 'delete'
                ? null
                : hashContent(String(file.content)),
          })),
        ) === digest(changes),
      'native-proposal-rejected',
      'Kernel plan differs from exact displayed changes.',
    );
    if (scope)
      receipt = await reviewAcceptanceKernel(proposal, root, scenario, scope);
    else
      assert(
        proposal.sources?.length === 0 &&
          proposal.componentUpdates?.length === 0 &&
          proposal.mcp?.length === 0 &&
          !proposal.process &&
          proposal.commands?.length === 0 &&
          proposal.manualActions?.length === 0 &&
          proposal.serviceWrites?.every((file) =>
            ['.tibicen/manifest.yml', '.tibicen/state/session.json'].includes(
              file,
            ),
          ),
        'native-proposal-rejected',
        'Diagnostic scope cannot install or execute additional tools.',
      );
  }
  return { input, plan: { changes, commandHashes }, kernel, receipt };
}

export async function reviewNativePlanning(
  root: string,
  planning: ProcessPlanning,
  phase: 'specification' | 'plan',
  input: NativeProposal,
) {
  const required = [
    ...planning.specification,
    ...(phase === 'plan' ? planning.plan : []),
  ];
  const content = async (file: string) => {
    const edit = input.changes.find((edit) => edit.path === file);
    return edit ? edit.content : (await readCurrent(root, file)).content;
  };
  for (const file of required)
    assert(
      (await content(file))?.trim(),
      'native-process-artifacts-missing',
      'Required planning must be nonempty before approval: ' + file,
    );
  const designContent =
    phase === 'plan' && planning.optionalDesign
      ? await content(planning.optionalDesign)
      : null;
  assert(
    designContent === null || designContent.trim(),
    'native-process-artifacts-missing',
    'A retained design must be nonempty.',
  );
  const designPresent = designContent !== null;
  const skipDesignReason = input.skipDesignReason ?? null;
  assert(
    skipDesignReason === null ||
      (phase === 'plan' &&
        planning.optionalDesign &&
        !designPresent &&
        skipDesignReason.trim().length > 0),
    'native-process-design-skip-invalid',
    'A design skip needs an explicit reason and no design file.',
  );
  assert(
    phase !== 'plan' ||
      !planning.optionalDesign ||
      designPresent ||
      skipDesignReason,
    'native-process-design-skip-invalid',
    'Omitting conditional design requires an explicit reviewed reason.',
  );
  return { required, skipDesignReason };
}

export function workflowPhases(
  fixture: AcceptanceFixture | undefined,
  stage: 'setup' | 'task',
): NativePhase[] {
  return stage === 'task' && fixture?.interaction.process
    ? ['specification', 'plan', 'implementation']
    : [stage];
}
export function phasePaths(
  scenario: EvalScenario,
  stage: 'setup' | 'task',
  phase: NativePhase,
) {
  return scenario[stage].allowedPaths.filter((file) => {
    if (phase === 'specification')
      return [
        change + '.openspec.yaml',
        change + 'proposal.md',
        change + 'specs/triple/spec.md',
      ].includes(file);
    if (phase === 'plan')
      return [change + 'design.md', change + 'tasks.md'].includes(file);
    if (phase === 'implementation')
      return [
        'src/math.js',
        'tests/math.test.js',
        change + 'tasks.md',
      ].includes(file);
    return true;
  });
}

// Literal supported commands only. Text inside heredocs/JS and compound shell stays unobserved.
export function nativeWords(input: unknown): string[] | null {
  if (typeof input !== 'string') return null;
  const wrapper = input.match(
    /^(?:\/(?:bin\/(?:ba|z)?sh)|(?:ba|z)?sh) -[a-z]+ (['"])([\s\S]*)\1$/,
  );
  const text = wrapper ? wrapper[2] : input,
    words: string[] = [];
  const pattern = /'[^']*'|"[^"$\\]*"|[a-zA-Z0-9_./:@=+,-]+/g;
  let end = 0;
  for (const token of text.matchAll(pattern)) {
    const gap = text.slice(end, token.index);
    if (!/^[ \t]*$/.test(gap) || (end > 0 && !gap)) return null;
    words.push(/^['"]/.test(token[0]) ? token[0].slice(1, -1) : token[0]);
    end = token.index + token[0].length;
  }
  return /^[ \t]*$/.test(text.slice(end)) ? words : null;
}
export function nativeRecipe(input: unknown, cliRoot?: string) {
  const words = nativeWords(input);
  if (!words?.length) return null;
  if (
    (words[0] === 'node' || words[0] === process.execPath) &&
    digest(words.slice(1)) === digest(['--test'])
  )
    return { ...nodeRecipe, readOnly: false };
  let argv: string[] | undefined;
  if (words[0] === 'openspec') argv = words.slice(1);
  else if (
    cliRoot &&
    (words[0] === 'node' || words[0] === process.execPath) &&
    words[1] === path.join(cliRoot, 'bin/openspec.js')
  )
    argv = words.slice(2);
  if (!argv) return null;
  const readOnly = [
    '--version',
    '--help',
    'list',
    'status',
    'instructions',
    'validate',
  ].includes(argv[0]);
  return { executable: 'openspec', argv, cwd: '.', readOnly };
}
export const recipeHash = (recipe: {
  executable: string;
  argv: string[];
  cwd: string;
}) =>
  digest({ executable: recipe.executable, argv: recipe.argv, cwd: recipe.cwd });

export const nativeProcessMetadata = [
  ['--version'],
  ['--help'],
  ['help'],
  ['validate', '--help'],
  ['version', '--help'],
  ['version', '--json'],
  ['instructions', '--help'],
  ['templates', '--help'],
  ['templates', '--schema', 'spec-driven', '--json'],
  ['new', 'change', '--help'],
  ['instructions', 'specs', '--schema', 'spec-driven'],
  ['instructions', 'proposal', '--schema', 'spec-driven'],
];

// Physical read-only effects do not grant consent for checks such as validate.
export function isNativeProcessInspection(
  recipe: ReturnType<typeof nativeRecipe>,
  verifiedCliRoot: string | undefined,
  allowedCommands: readonly string[],
) {
  return (
    !!verifiedCliRoot &&
    recipe?.executable === 'openspec' &&
    (nativeProcessMetadata.some(
      (argv) => digest(argv) === digest(recipe.argv),
    ) ||
      (['list', 'status', 'instructions'].includes(recipe.argv[0]) &&
        allowedCommands.includes(recipeHash(recipe))))
  );
}

export function reviewedCommands(
  commands: unknown,
  scenario: EvalScenario,
  stage: 'setup' | 'task',
  phase: NativePhase,
  cliRoot?: string,
) {
  assert(
    Array.isArray(commands) &&
      commands.length <= 20 &&
      new Set(commands).size === commands.length,
    'native-proposal-rejected',
    'Use bounded unique literal commands.',
  );
  return commands.map((command) => {
    const recipe = nativeRecipe(command, cliRoot);
    assert(
      recipe && scenario[stage].allowedCommands.includes(recipeHash(recipe)),
      'native-proposal-rejected',
      'Command is outside the frozen scenario.',
    );
    assert(
      recipe.executable !== 'openspec' || !!cliRoot,
      'native-proposal-rejected',
      'No unverified process CLI.',
    );
    assert(
      !['specification', 'plan'].includes(phase) ||
        recipe.executable !== 'node',
      'native-proposal-rejected',
      'Planning consent cannot execute application checks.',
    );
    assert(
      recipe.readOnly ||
        recipe.executable !== 'openspec' ||
        phase === 'specification',
      'native-proposal-rejected',
      'Process creation needs specification consent.',
    );
    return recipeHash(recipe);
  });
}

export async function reviewAcceptanceKernel(
  input: unknown,
  root: string,
  scenario: EvalScenario,
  scope: NativeScope,
) {
  const p = validateProposal(input);
  assert(
    p.root === root &&
      p.usageFile === path.join(scope.home, '.tibicen/usage.json'),
    'native-proposal-rejected',
    'Kernel belongs to this project and isolated HOME.',
  );
  assert(
    digest(p.serviceWrites) ===
      digest(['.tibicen/manifest.yml', '.tibicen/state/session.json']) &&
      p.serviceWrites.every((file) =>
        scenario.setup.allowedPaths.includes(file),
      ),
    'native-proposal-rejected',
    'No service writes in a no-change/refusal scope.',
  );
  assert(
    !p.commands.length &&
      !p.manualActions.length &&
      !p.mcp.length &&
      !p.manualFragments.length &&
      p.compat.enabled === false &&
      !Object.keys(p.checks).length,
    'native-proposal-rejected',
    'Kernel cannot start checks, services, installers or extra models.',
  );
  for (const source of p.sources) {
    const pin = scope.sources.find(
      (pin) =>
        pin.repo === source.repo &&
        pin.sha === source.sha &&
        pin.skillPath === source.skillPath,
    );
    assert(
      pin &&
        source.license === pin.license &&
        !source.licenseException &&
        Array.isArray(source.files) &&
        source.files.length > 0,
      'native-proposal-rejected',
      'Unpinned source or license.',
    );
    for (const file of source.files)
      assert(
        pin.files!.some(
          (expected) =>
            expected.path === file.path &&
            expected.sourcePath === file.sourcePath &&
            expected.contentHash === file.contentHash,
        ) && [undefined, 0o644].includes(file.fileMode),
        'native-proposal-rejected',
        'Source composition differs from frozen bytes.',
      );
  }
  const previous = await readManifest(root);
  const components = await planComponents(
    previous,
    p.sources,
    p.componentUpdates ?? [],
    p.changes,
    (relative) => readCurrent(root, relative),
    p.migrateManifest,
  );
  assert(
    digest(components) === digest(p.components),
    'native-proposal-rejected',
    'Component ownership differs from actual files.',
  );
  if (p.process) {
    assert(
      scope.cliRoot && p.process.cli?.packageRoot === scope.cliRoot,
      'native-proposal-rejected',
      'Use the separately verified process CLI.',
    );
    const check = await inspectProcess(
      p.process,
      async (relative) => {
        const file = p.changes.find((file) => file.path === relative);
        return file
          ? {
              content: file.content ?? null,
              hash: file.content == null ? null : hashContent(file.content),
            }
          : readCurrent(root, relative);
      },
      previous.manifest?.process,
    );
    assert(
      check.status === 'passed',
      'native-proposal-rejected',
      'Process resources or preserved instructions differ.',
    );
  }
  return {
    proposal: p,
    baseline: previous.manifest?.installed ?? [],
    previousSessions: previous.manifest?.sessions ?? [],
  };
}

export async function checkKernelReceipt(
  root: string,
  reviewed: Awaited<ReturnType<typeof reviewAcceptanceKernel>>,
) {
  const { proposal: p } = reviewed,
    manifest = JSON.parse(
      await readFile(path.join(root, '.tibicen/manifest.yml'), 'utf8'),
    );
  const expected = await installedComponents(
    p.components,
    p.sources,
    reviewed.baseline,
    (relative) => readCurrent(root, relative),
  );
  const receipt = manifest.sessions?.at(-1);
  assert(
    manifest.schema === 2 &&
      receipt?.status === 'complete' &&
      digest(manifest.sessions.slice(0, -1)) ===
        digest(reviewed.previousSessions),
    'native-plan-mismatch',
    'Kernel history or completion differs.',
  );
  assert(
    digest(manifest.installed) === digest(expected) &&
      digest(manifest.process ?? null) === digest(p.process ?? null),
    'native-plan-mismatch',
    'Installed provenance or process differs from the reviewed plan.',
  );
  const changes = (receipt.changes ?? []).map(
    (file: {
      path: string;
      beforeHash: string | null;
      afterHash: string | null;
    }) => ({
      path: file.path,
      beforeHash: file.beforeHash,
      afterHash: file.afterHash,
    }),
  );
  assert(
    digest(changes) ===
      digest(
        p.changes.map((file) => ({
          path: file.path,
          beforeHash: file.beforeHash,
          afterHash: file.content == null ? null : hashContent(file.content),
        })),
      ),
    'native-plan-mismatch',
    'Kernel receipt does not match reviewed changes.',
  );
  return digest({ installed: expected, process: p.process ?? null, changes });
}

export function readMatches(command: unknown, relative: string, root: string) {
  const words = nativeWords(command);
  return (
    !!words &&
    ['cat', 'sed', 'head'].includes(words[0]) &&
    (words.includes(relative) || words.includes(path.join(root, relative)))
  );
}

export function kernelProposal(kernel: Record<string, unknown>): Proposal {
  return (kernel.proposal ?? kernel) as Proposal;
}
