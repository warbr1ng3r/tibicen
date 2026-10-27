import type {
  Snapshot,
  VerifyOptions,
  FileRecord,
  Change,
  CheckResult,
  CheckRun,
  Regression,
  PathReason,
  Command,
  CommandResult,
  QuizQuestion,
  BehaviorSpec,
  SharedRule,
  ComponentPlan,
} from '../core/types.ts';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import {
  mkdir,
  mkdtemp,
  realpath,
  rm,
  writeFile,
  lstat,
  chmod,
  opendir,
} from 'node:fs/promises';
import {
  assert,
  digest,
  hashContent,
  validateCheckResult,
} from '../core/contracts.ts';
import { safePath, validateRelativePath } from '../core/paths.ts';
import {
  scanProject,
  readProjectFile,
  exclusionReason,
  infrastructurePath,
} from '../scan/index.ts';
import { prepareClaudeRun } from '../compat/index.ts';
import { parseManagedBlock, supportsManagedBlocks } from '../core/blocks.ts';
import { inspectSharedRules } from '../core/shared-rules.ts';
import { readManifest } from '../core/components.ts';
import { inspectProcess, processAllows } from '../process/index.ts';
import type { ProcessPlan } from '../process/index.ts';
import { infrastructureScope } from './scope.ts';
import type { ExpectedFile } from './scope.ts';
import { copyNodeEnvironment } from './environment.ts';

const liveSnapshots = new Map<string, { container: string; id: string }>();
const approval = (value?: string) =>
  assert(
    /^[a-f0-9]{64}$/.test(value ?? ''),
    'approval-required',
    'A snapshot or execution requires the approved plan digest.',
  );
const inside = (root: string, candidate: string) =>
  candidate === root || candidate.startsWith(`${root}${path.sep}`);
const fileIdentity = (files: FileRecord[]) =>
  files
    .map(({ path, hash, mode }) => ({ path, hash, mode }))
    .sort((a, b) => a.path.localeCompare(b.path));

function containsLiteralSecret(content: Buffer) {
  const text = content.toString('utf8');
  if (
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:github_pat_|gh[pousr]_|sk-)[a-zA-Z0-9_-]{16,}/.test(
      text,
    )
  )
    return true;
  const assignment =
    /["']?\b(?:password|passwd|api[_-]?key|token|secret|[a-zA-Z0-9_]*(?:API_KEY|TOKEN|PASSWORD|SECRET|CREDENTIALS?))["']?\s*[:=]\s*(["'])([^"'\r\n]+)\1/gi;
  for (const match of text.matchAll(assignment)) {
    if (!/^\$\{(?:env:)?[A-Z_][A-Z0-9_]*\}$|^<[a-zA-Z0-9_-]+>$/.test(match[2]))
      return true;
  }
  return false;
}

async function allocate(sourceRoot: string, options: VerifyOptions) {
  approval(options.approvedDigest);
  const parent = await realpath(options.temporaryRoot ?? tmpdir());
  assert(
    !inside(sourceRoot, parent),
    'unsafe-snapshot-path',
    'Snapshots must be outside the target project.',
  );
  const container = await mkdtemp(path.join(parent, 'tibicen-snapshot-'));
  const root = path.join(container, 'project');
  await mkdir(root);
  const snapshot: Snapshot = {
    schema: 1,
    id: randomUUID(),
    sourceRoot,
    root,
    files: [],
    excluded: [],
    complete: false,
    gaps: [],
  };
  liveSnapshots.set(root, { container, id: snapshot.id });
  return snapshot;
}

export async function cleanupSnapshot(snapshot: Pick<Snapshot, 'root' | 'id'>) {
  const owned = liveSnapshots.get(snapshot?.root);
  assert(
    owned && owned.id === snapshot.id,
    'unknown-snapshot',
    'Only snapshots created by this process can be deleted.',
  );
  await rm(owned.container, { recursive: true, force: true });
  liveSnapshots.delete(snapshot.root);
}

export async function createSnapshot(
  root: string,
  options: VerifyOptions = {},
) {
  approval(options.approvedDigest);
  const scan = await scanProject(root, options);
  const snapshot = await allocate(scan.root, options);
  snapshot.excluded = scan.excluded;
  snapshot.gaps = scan.gaps.filter(
    (gap) =>
      !['agent-version-unverified', 'invalid-package-json'].includes(
        gap.reason,
      ),
  );
  for (const item of scan.excluded.filter(
    (item) => item.reason === 'forbidden-path',
  ))
    snapshot.gaps.push({
      path: item.path,
      reason: 'forbidden-content-excluded',
    });
  try {
    for (const file of scan.files) {
      try {
        const { content, mode } = await readProjectFile(
          scan.root,
          file.path,
          options,
        );
        assert(
          hashContent(content) === file.hash && mode === file.mode,
          'tree-changed',
          'Source changed during snapshot creation.',
        );
        if (containsLiteralSecret(content)) {
          snapshot.excluded.push({
            path: file.path,
            reason: 'sensitive-content',
          });
          snapshot.gaps.push({
            path: file.path,
            reason: 'sensitive-content-excluded',
          });
          continue;
        }
        const destination = await safePath(snapshot.root, file.path, options);
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, content, { flag: 'wx', mode });
        await chmod(destination, mode);
        snapshot.files.push({ path: file.path, hash: file.hash, mode });
      } catch (caught) {
        const error = caught as NodeJS.ErrnoException;
        snapshot.gaps.push({
          path: file.path,
          reason:
            error.code === 'tree-changed'
              ? 'tree-changed'
              : 'snapshot-file-unavailable',
        });
      }
    }
    const after = await scanProject(scan.root, options);
    if (
      digest(fileIdentity(scan.files)) !== digest(fileIdentity(after.files)) ||
      !after.complete
    )
      snapshot.gaps.push({ path: '.', reason: 'tree-changed-or-incomplete' });
    if (options.environment && options.environmentReady) {
      try {
        await copyNodeEnvironment(
          scan.root,
          snapshot.root,
          options.environment,
          options,
        );
        snapshot.environment = options.environment;
      } catch (caught) {
        const code = (caught as NodeJS.ErrnoException).code;
        snapshot.gaps.push({
          path: '.',
          reason:
            code && code.includes('node-environment')
              ? code
              : 'node-environment-unavailable',
        });
      }
    }
    snapshot.complete = scan.complete && snapshot.gaps.length === 0;
    return snapshot;
  } catch (caught) {
    const error = caught as NodeJS.ErrnoException;
    await cleanupSnapshot(snapshot);
    throw error;
  }
}

export async function prepareFinalSnapshot(
  baseline: Snapshot,
  changes: Change[],
  options: VerifyOptions = {},
) {
  approval(options.approvedDigest);
  assert(
    liveSnapshots.get(baseline?.root)?.id === baseline.id,
    'unknown-snapshot',
    'Baseline must be a retained snapshot.',
  );
  const final = await allocate(baseline.sourceRoot, options);
  final.excluded = baseline.excluded.map((item) => ({ ...item }));
  final.gaps = baseline.gaps.map((item) => ({ ...item }));
  final.baselineId = baseline.id;
  const records = new Map(
    baseline.files.map((file) => [file.path, { ...file }]),
  );
  const seen = new Set();
  try {
    for (const file of baseline.files) {
      const { content, mode } = await readProjectFile(
        baseline.root,
        file.path,
        options,
      );
      assert(
        hashContent(content) === file.hash && mode === file.mode,
        'baseline-changed',
        'Baseline files changed after capture.',
      );
      const destination = await safePath(final.root, file.path, options);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, content, { flag: 'wx', mode });
      await chmod(destination, mode);
    }
    for (const change of changes) {
      validateRelativePath(change.path);
      assert(
        !seen.has(change.path),
        'invalid-change',
        'Duplicate snapshot change path.',
      );
      seen.add(change.path);
      assert(
        ['add', 'modify', 'delete'].includes(change.action),
        'invalid-change',
        'Unknown snapshot operation.',
      );
      assert(
        !exclusionReason(change.path, options.forbiddenPaths),
        'forbidden-path',
        'Excluded paths cannot be changed in a snapshot.',
      );
      const before = records.get(change.path);
      assert(
        change.action === 'add'
          ? !before && change.beforeHash === null
          : before?.hash === change.beforeHash,
        'snapshot-hash-mismatch',
        'Snapshot operation does not match the original tree.',
      );
      if (change.beforeMode !== undefined)
        assert(
          change.beforeMode === (before?.mode ?? null),
          'snapshot-hash-mismatch',
          'Snapshot permissions differ from the approved original.',
        );
      const destination = await safePath(final.root, change.path, options);
      if (change.action === 'delete') {
        await rm(destination);
        records.delete(change.path);
        continue;
      }
      assert(
        typeof change.content === 'string',
        'invalid-change',
        'Snapshot writes require explicit file content.',
      );
      assert(
        !containsLiteralSecret(Buffer.from(change.content)),
        'sensitive-content',
        'Snapshot changes cannot introduce literal credentials.',
      );
      await mkdir(path.dirname(destination), { recursive: true });
      const mode = change.fileMode ?? before?.mode ?? 0o600;
      await writeFile(destination, change.content, { mode });
      await chmod(destination, mode);
      records.set(change.path, {
        path: change.path,
        hash: hashContent(change.content),
        mode,
      });
    }
    final.files = [...records.values()].sort((a, b) =>
      a.path.localeCompare(b.path),
    );
    if (baseline.environment) {
      await copyNodeEnvironment(
        baseline.root,
        final.root,
        baseline.environment,
        options,
      );
      final.environment = baseline.environment;
    }
    final.complete = baseline.complete;
    return final;
  } catch (caught) {
    const error = caught as NodeJS.ErrnoException;
    await cleanupSnapshot(final);
    throw error;
  }
}

export function compareChecks(
  baselineRuns: CheckRun[] | null | undefined,
  finalRuns: CheckRun[],
  {
    comparable = true,
    firstAttempt = true,
    knownRegressions = [],
    baselineUnavailableReason = 'baseline-unavailable',
    newProject = false,
  }: {
    comparable?: boolean;
    firstAttempt?: boolean;
    knownRegressions?: Regression[];
    baselineUnavailableReason?: string;
    newProject?: boolean;
  } = {},
): CheckResult {
  const result = {
    kind: 'verify',
    status: 'unverified',
    reason: baselineUnavailableReason,
    firstAttempt: firstAttempt && knownRegressions.length === 0,
    newRegressions: [...knownRegressions],
  };
  if (newProject && comparable) {
    if (!Array.isArray(finalRuns) || !finalRuns.length)
      return validateCheckResult({ ...result, reason: 'no-project-checks' });
    if (
      new Set(finalRuns.map((run) => run.id)).size !== finalRuns.length ||
      finalRuns.some((run) => !run.commandHash)
    )
      return validateCheckResult({
        ...result,
        reason: 'checks-not-comparable',
      });
    if (
      finalRuns.some((run) => run.timedOut || !Number.isInteger(run.exitCode))
    )
      return validateCheckResult({ ...result, reason: 'command-incomplete' });
    const failed = finalRuns
      .filter((run) => run.exitCode !== 0)
      .map((run) => ({ id: run.id, reason: 'new-project-check-failed' }));
    if (failed.length)
      return validateCheckResult({
        ...result,
        reason: 'new-project-check-failed',
        newRegressions: [...knownRegressions, ...failed],
      });
    const { reason, ...completed } = result;
    return validateCheckResult({
      ...completed,
      status: knownRegressions.length ? 'red-fixed' : 'green',
    });
  }
  if (!comparable || !Array.isArray(baselineRuns) || !Array.isArray(finalRuns))
    return validateCheckResult(result);
  if (!baselineRuns.length || !finalRuns.length)
    return validateCheckResult({ ...result, reason: 'no-project-checks' });
  const baseline = new Map(baselineRuns.map((run) => [run.id, run]));
  if (
    baseline.size !== baselineRuns.length ||
    baseline.size !== finalRuns.length ||
    new Set(finalRuns.map((run) => run.id)).size !== finalRuns.length
  )
    return validateCheckResult({ ...result, reason: 'checks-not-comparable' });
  const regressions = [];
  let fixed = false,
    preExisting = false;
  for (const final of finalRuns) {
    const before = baseline.get(final.id);
    if (
      !before ||
      before.commandHash !== final.commandHash ||
      !before.commandHash
    )
      return validateCheckResult({
        ...result,
        reason: 'checks-not-comparable',
      });
    if (
      before.timedOut ||
      final.timedOut ||
      !Number.isInteger(before.exitCode) ||
      !Number.isInteger(final.exitCode)
    )
      return validateCheckResult({ ...result, reason: 'command-incomplete' });
    if (final.exitCode !== 0) {
      if (
        before.exitCode !== 0 &&
        before.outputHash &&
        before.outputHash === final.outputHash
      )
        preExisting = true;
      else
        regressions.push({
          id: final.id,
          reason: before.exitCode === 0 ? 'new-failure' : 'changed-failure',
        });
    } else if (before.exitCode !== 0) fixed = true;
  }
  if (regressions.length)
    return validateCheckResult({
      ...result,
      reason: 'new-regression',
      newRegressions: [...knownRegressions, ...regressions],
    });
  const { reason, ...completed } = result;
  return validateCheckResult({
    ...completed,
    status: preExisting
      ? 'pre-existing-red'
      : fixed || knownRegressions.length
        ? 'red-fixed'
        : 'green',
  });
}

export async function runProjectChecks(
  snapshot: Snapshot,
  commands: Command[],
  {
    approvedDigest,
    runner,
    environmentReady = false,
    profile = 'web',
    timeoutMs = 30000,
    signal,
  }: VerifyOptions = {},
): Promise<CheckResult & { runs: CheckRun[] }> {
  const unverified = (reason: string) => ({
    kind: 'verify',
    status: 'unverified',
    reason,
    runs: [],
  });
  if (profile !== 'web') return unverified('unsupported-profile');
  if (!snapshot?.complete)
    return unverified(
      snapshot?.gaps.find((gap) => gap.reason.includes('node-environment'))
        ?.reason ?? 'snapshot-incomplete',
    );
  if (!environmentReady) return unverified('environment-unverified');
  if (!commands?.length) return unverified('no-project-checks');
  approval(approvedDigest);
  const execute = runner ?? (await import('../core/execute.ts')).runCommand;
  const runs: CheckRun[] = [];
  let execution: Snapshot | undefined;
  try {
    if (snapshot.environment) {
      const node = await realpath(process.execPath);
      for (const command of commands)
        assert(
          path.isAbsolute(command.executable) &&
            (await realpath(command.executable).catch(() => null)) === node,
          'node-environment-runtime-mismatch',
          'Dependency checks must use the approved Node runtime.',
        );
    }
    execution = await prepareFinalSnapshot(snapshot, [], { approvedDigest });
    // Workspace links can be captured without source; execution needs their copied targets.
    async function checkLinks(directory: string): Promise<void> {
      for await (const entry of await opendir(directory)) {
        const filename = path.join(directory, entry.name);
        if (entry.isSymbolicLink()) {
          const target = await realpath(filename).catch(() => null);
          assert(
            target !== null && inside(execution!.root, target),
            'node-environment-link-unavailable',
            'Dependency links must resolve within the execution copy.',
          );
        } else if (entry.isDirectory()) await checkLinks(filename);
      }
    }
    for (const root of execution.environment?.roots ?? [])
      await checkLinks(path.join(execution.root, root));
  } catch (caught) {
    if (execution) await cleanupSnapshot(execution);
    if (!snapshot.environment) throw caught;
    const code = (caught as NodeJS.ErrnoException).code;
    return unverified(
      code?.includes('node-environment')
        ? code
        : 'node-environment-unavailable',
    );
  }
  try {
    for (const command of commands) {
      assert(
        ['build', 'test', 'lint'].includes(command.kind),
        'invalid-check-command',
        'Project checks accept only approved build/test/lint commands.',
      );
      try {
        if (command.source) {
          const { content } = await readProjectFile(
            execution.root,
            command.source.path,
          );
          const script = JSON.parse(content.toString('utf8')).scripts?.[
            command.source.script
          ];
          assert(
            typeof script === 'string' &&
              hashContent(script) === command.source.scriptHash,
            'command-source-changed',
            'Project command source differs from the reviewed script.',
          );
        }
        const result = await execute(command, {
          root: execution.root,
          approvedDigest,
          timeoutMs,
          signal,
        });
        if (result.reason && result.exitCode === null)
          return { ...unverified(result.reason), runs };
        const output =
          `${result.stdout ?? ''}\n${result.stderr ?? ''}`.replaceAll(
            execution.root,
            '<project>',
          );
        runs.push({
          id: command.id,
          commandHash: digest(command),
          exitCode: result.exitCode,
          outputHash: hashContent(output),
          timedOut: result.timedOut === true,
        });
      } catch (caught) {
        const error = caught as NodeJS.ErrnoException;
        return {
          ...unverified(
            ['approval-required', 'consent-required'].includes(error.code ?? '')
              ? 'approval-required'
              : ['trust-required', 'command-source-changed'].includes(
                    error.code ?? '',
                  )
                ? error.code!
                : 'command-unavailable',
          ),
          runs,
        };
      }
    }
    // A single run cannot prove absence of regressions; callers must compare with baseline.
    return {
      kind: 'verify',
      status: 'unverified',
      reason: 'comparison-required',
      runs,
    };
  } finally {
    await cleanupSnapshot(execution);
  }
}

export async function verifyInfrastructure(
  root: string,
  {
    expectedFiles = [],
    observedFiles = [],
    components,
    forbiddenPaths = [],
    sharedRules,
    process,
  }: {
    expectedFiles?: ExpectedFile[];
    observedFiles?: FileRecord[];
    components?: ComponentPlan;
    forbiddenPaths?: string[];
    sharedRules?: SharedRule[];
    process?: ProcessPlan;
  } = {},
): Promise<CheckResult> {
  const issues: PathReason[] = [];
  const manifest = (await readManifest(root)).manifest;
  sharedRules ??= manifest?.sharedRules ?? [];
  process ??= manifest?.process;
  // Managed content has its own checks; current writes still require exact bytes.
  const independentlyChecked = new Set([
    ...sharedRules.flatMap((rule) => rule.targets.map((target) => target.path)),
    ...(process?.files.map((file) => file.path) ?? []),
  ]);
  const explicitPaths = new Set(expectedFiles.map((file) => file.path));
  expectedFiles = infrastructureScope(
    manifest,
    observedFiles,
    expectedFiles,
    components,
  );
  const processStatus = await inspectProcess(process, async (relative) => {
    try {
      const { content } = await readProjectFile(root, relative, {
        forbiddenPaths,
      });
      return { content: content.toString('utf8'), hash: hashContent(content) };
    } catch (caught) {
      if ((caught as NodeJS.ErrnoException).code === 'ENOENT')
        return { content: null, hash: null };
      throw caught;
    }
  });
  issues.push(...processStatus.issues);
  const shared = await inspectSharedRules(sharedRules, async (relative) => ({
    content: (
      await readProjectFile(root, relative, { forbiddenPaths })
    ).content.toString('utf8'),
  }));
  issues.push(...shared.issues);
  if (!expectedFiles.length && !sharedRules.length && !process)
    return validateCheckResult({
      kind: 'infrastructure',
      status: 'unverified',
      reason: 'no-check-scope',
      scope: 'structure-only',
      issues,
    });
  for (const expected of expectedFiles) {
    try {
      assert(
        infrastructurePath(expected.path) ||
          processAllows(process, expected.path),
        'outside-infrastructure',
        'Structural scope must name an infrastructure file.',
      );
      const filename = await safePath(root, expected.path, { forbiddenPaths });
      if (expected.action === 'delete') {
        try {
          await lstat(filename);
          issues.push({ path: expected.path, reason: 'not-deleted' });
        } catch (caught) {
          const error = caught as NodeJS.ErrnoException;
          if (error.code !== 'ENOENT') throw error;
        }
        continue;
      }
      const { content, mode } = await readProjectFile(root, expected.path, {
        forbiddenPaths,
      });
      const expectedHash =
        expected.hash ??
        expected.afterHash ??
        (typeof expected.content === 'string'
          ? hashContent(expected.content)
          : undefined);
      if (
        expectedHash &&
        (!independentlyChecked.has(expected.path) ||
          explicitPaths.has(expected.path)) &&
        hashContent(content) !== expectedHash
      )
        issues.push({ path: expected.path, reason: 'content-mismatch' });
      const expectedMode =
        expected.mode ?? expected.afterMode ?? expected.fileMode;
      if (expectedMode !== undefined && mode !== expectedMode)
        issues.push({ path: expected.path, reason: 'permission-mismatch' });
      if (supportsManagedBlocks(expected.path)) {
        try {
          parseManagedBlock(content.toString('utf8'), expected.path);
        } catch (caught) {
          const error = caught as NodeJS.ErrnoException & { line?: number };
          issues.push({
            path: expected.path,
            reason: error.code ?? 'invalid-managed-block',
            line: error.line,
          });
        }
      }
      if (
        !content.toString('utf8').trim() &&
        !process?.files.some(
          (file) => file.path === expected.path && file.role === 'anchor',
        )
      )
        issues.push({
          path: expected.path,
          reason: 'empty-infrastructure-file',
        });
      if (
        expected.path === '.mcp.json' ||
        expected.path === '.cursor/mcp.json'
      ) {
        try {
          const config = JSON.parse(content.toString('utf8'));
          assert(
            config?.mcpServers &&
              typeof config.mcpServers === 'object' &&
              !Array.isArray(config.mcpServers),
            'invalid-mcp-config',
            'Expected named MCP entries.',
          );
        } catch {
          issues.push({ path: expected.path, reason: 'invalid-mcp-config' });
        }
      }
    } catch (caught) {
      const error = caught as NodeJS.ErrnoException;
      issues.push({
        path: expected.path,
        reason:
          error.code === 'ENOENT'
            ? 'missing-file'
            : error.code === 'unsafe-path'
              ? 'unsafe-path'
              : error.code === 'outside-infrastructure'
                ? 'outside-infrastructure'
                : 'unreadable-file',
      });
    }
  }
  return validateCheckResult({
    kind: 'infrastructure',
    status: issues.length ? 'issues-found' : 'passed',
    scope: 'structure-only',
    issues,
    sharedRules: shared,
    ...(process ? { process: processStatus } : {}),
  });
}

export function unavailableBehavior(
  kind: string,
  reason = 'startup-uncontrolled',
): CheckResult {
  assert(
    ['task', 'quiz'].includes(kind),
    'invalid-check',
    'Expected task or quiz.',
  );
  return validateCheckResult({ kind, status: 'unverified', reason });
}

function behaviorResult(execution?: CommandResult) {
  if (execution?.timedOut || execution?.exitCode !== 0) return null;
  try {
    const records = (execution.stdout ?? '')
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));
    const result = records.findLast((record) => record.type === 'result');
    return result?.subtype === 'success' && result.is_error !== true
      ? result
      : null;
  } catch {
    return null;
  }
}

function validateQuiz(questions: QuizQuestion[]) {
  assert(
    Array.isArray(questions) &&
      questions.length === 5 &&
      new Set(questions.map((item) => item.id)).size === 5 &&
      questions.every(
        (item) =>
          typeof item.id === 'string' &&
          typeof item.question === 'string' &&
          typeof item.answer === 'string',
      ),
    'invalid-quiz',
    'A quiz needs five distinct questions and expected answers.',
  );
}

export function evaluateQuiz(
  questions: QuizQuestion[],
  execution?: CommandResult,
): CheckResult {
  validateQuiz(questions);
  const record = behaviorResult(execution);
  if (!record)
    return unavailableBehavior(
      'quiz',
      execution?.timedOut ? 'timeout' : 'behavior-result-unavailable',
    );
  let answers;
  try {
    answers = JSON.parse(record.result).answers;
  } catch {
    return validateCheckResult({
      kind: 'quiz',
      status: 'failed',
      reason: 'invalid-quiz-output',
      score: 0,
      total: 5,
    });
  }
  if (
    !Array.isArray(answers) ||
    answers.length !== 5 ||
    new Set(answers.map((item) => item?.id)).size !== 5 ||
    answers.some(
      (item) =>
        typeof item?.answer !== 'string' ||
        !questions.some((question) => question.id === item.id),
    )
  )
    return validateCheckResult({
      kind: 'quiz',
      status: 'failed',
      reason: 'invalid-quiz-output',
      score: 0,
      total: 5,
    });
  const normalized = (value: string) =>
    value.trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ');
  const score = questions.filter(
    (question) =>
      normalized(answers.find((item) => item.id === question.id).answer) ===
      normalized(question.answer),
  ).length;
  return validateCheckResult({
    kind: 'quiz',
    status: score >= 4 ? 'passed' : 'failed',
    score,
    total: 5,
  });
}

export async function runBehaviorCheck(
  snapshot: Snapshot | undefined,
  specification: BehaviorSpec,
  options: VerifyOptions = {},
): Promise<CheckResult> {
  const {
    kind,
    prompt,
    expectedArtifacts = [],
    questions = [],
  } = specification;
  assert(
    ['task', 'quiz'].includes(kind),
    'invalid-check',
    'Expected a task or quiz specification.',
  );
  const unavailable = (reason: string) => unavailableBehavior(kind, reason);
  if (options.agent !== 'claude-code') return unavailable('unsupported-agent');
  if (!snapshot?.complete) return unavailable('snapshot-incomplete');
  if (options.trusted !== true) return unavailable('trust-required');
  if (
    kind === 'task' &&
    (!expectedArtifacts.length ||
      expectedArtifacts.some(
        (item) =>
          typeof item.path !== 'string' ||
          (!/^[a-f0-9]{64}$/.test(item.hash ?? '') &&
            !(typeof item.contains === 'string' && item.contains.length)),
      ))
  )
    return unavailable('task-oracle-unavailable');
  if (kind === 'quiz') validateQuiz(questions);
  const launchOptions = {
    ...options,
    id: specification.id ?? kind,
    kind,
    prompt,
    context: specification.context ?? '',
    tools:
      specification.tools ??
      (kind === 'quiz'
        ? ['Read', 'Glob', 'Grep']
        : ['Read', 'Glob', 'Grep', 'Edit', 'Write', 'Skill']),
  };
  const preflight = prepareClaudeRun({
    ...launchOptions,
    copyRoot: snapshot.root,
  });
  if (preflight.status !== 'ready') return unavailable(preflight.reason);
  if (launchOptions.tools.includes('Skill')) {
    for (const file of snapshot.files.filter((file) =>
      /(?:^|\/)\.claude\/(?:skills\/.*\/SKILL\.md|commands\/.*\.md)$/.test(
        file.path,
      ),
    )) {
      const { content } = await readProjectFile(snapshot.root, file.path);
      if (
        /!`|^\s*(?:hooks|context|agent|allowed-tools)\s*:/m.test(
          content.toString('utf8'),
        )
      )
        return unavailable('skill-command-execution-required');
    }
  }
  approval(options.approvedDigest);
  const executionCopy = await prepareFinalSnapshot(snapshot, [], {
    approvedDigest: options.approvedDigest,
  });
  try {
    const launch = prepareClaudeRun({
      ...launchOptions,
      copyRoot: executionCopy.root,
    });
    const execute =
      options.runner ?? (await import('../core/execute.ts')).runCommand;
    let execution;
    try {
      execution = await execute(
        (launch as Extract<typeof launch, { status: 'ready' }>).command,
        {
          root: executionCopy.root,
          approvedDigest: options.approvedDigest,
          timeoutMs: options.timeoutMs ?? 30000,
          signal: options.signal,
        },
      );
    } catch {
      return unavailable('execution-unavailable');
    }
    if (execution.reason === 'command-outcome-unknown')
      return unavailable(execution.reason);
    if (kind === 'quiz')
      return {
        ...evaluateQuiz(questions, execution),
        method: 'controlled-claude-session',
      };
    if (!behaviorResult(execution))
      return unavailable(
        execution.timedOut ? 'timeout' : 'behavior-result-unavailable',
      );
    const evidence = [];
    for (const expected of expectedArtifacts) {
      try {
        const { content } = await readProjectFile(
          executionCopy.root,
          expected.path,
        );
        const matches = expected.hash
          ? hashContent(content) === expected.hash
          : content.toString('utf8').includes(expected.contains!);
        evidence.push({ path: expected.path, passed: matches });
      } catch {
        evidence.push({ path: expected.path, passed: false });
      }
    }
    return validateCheckResult({
      kind,
      status: evidence.every((item) => item.passed) ? 'passed' : 'failed',
      method: 'controlled-claude-session',
      scope: 'agreed-artifact-assertions',
      evidence,
    });
  } finally {
    await cleanupSnapshot(executionCopy);
  }
}
