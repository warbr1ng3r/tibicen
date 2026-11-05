import path from 'node:path';
import type { CheckResult, PathReason, ScanResult } from './types.ts';
import { AGENT_MATRIX, CHECKED_AT } from '../compat/matrix.ts';
import {
  getHarnessProfile,
  instructionCandidate,
  isHarnessId,
} from '../agents/profiles.ts';
import { assert } from './contracts.ts';
import { validateRelativePath } from './paths.ts';

export interface TaskContext {
  agent: string;
  agentVersion?: string;
  cwd: string;
  targetPath?: string;
}

const printable = (value: string) => !/[\p{C}\u2028\u2029]/u.test(value);

function contextPath(value: unknown, allowRoot = false): string {
  assert(
    typeof value === 'string' && value.length <= 4096 && printable(value),
    'invalid-task-context',
    'Task paths must be printable project-relative paths of at most 4096 characters.',
  );
  if (allowRoot && value === '.') return value;
  try {
    return validateRelativePath(value);
  } catch {
    assert(
      false,
      'invalid-task-context',
      'Task paths must be canonical project-relative slash paths without traversal.',
    );
  }
}

export function validateTaskContext(input: unknown): TaskContext {
  assert(
    input &&
      typeof input === 'object' &&
      !Array.isArray(input) &&
      [Object.prototype, null].includes(Object.getPrototypeOf(input)),
    'invalid-task-context',
    'Expected a task context object.',
  );
  const context = input as Record<string, unknown>;
  assert(
    Reflect.ownKeys(context).every(
      (key) =>
        typeof key === 'string' &&
        ['agent', 'agentVersion', 'cwd', 'targetPath'].includes(key),
    ) &&
      Object.hasOwn(context, 'agent') &&
      Object.hasOwn(context, 'cwd') &&
      isHarnessId(context.agent),
    'invalid-task-context',
    'Provide only agent, optional agentVersion, cwd and optional targetPath; agent must be a valid harness ID.',
  );
  if (Object.hasOwn(context, 'agentVersion'))
    assert(
      typeof context.agentVersion === 'string' &&
        context.agentVersion.length > 0 &&
        context.agentVersion.length <= 128 &&
        context.agentVersion.trim() === context.agentVersion &&
        printable(context.agentVersion),
      'invalid-task-context',
      'Agent version must be a nonempty printable string of at most 128 characters without surrounding whitespace.',
    );
  return {
    agent: context.agent,
    ...(Object.hasOwn(context, 'agentVersion')
      ? { agentVersion: context.agentVersion as string }
      : {}),
    cwd: contextPath(context.cwd, true),
    ...(Object.hasOwn(context, 'targetPath')
      ? { targetPath: contextPath(context.targetPath) }
      : {}),
  };
}

const directoryRelation = (directory: string, target: string) =>
  directory === '.' ||
  directory === target ||
  target.startsWith(`${directory}/`)
    ? 'ancestor-or-same'
    : 'other-subtree';

function summarizeTaskScope(scan: ScanResult, input: TaskContext) {
  const context = validateTaskContext(input);
  const profile = getHarnessProfile(context.agent);
  return {
    context,
    contextBasis: 'caller-supplied',
    basis: 'lexical-directory-relationships',
    host: {
      id: context.agent,
      status: profile?.status ?? 'unknown',
      ...(profile
        ? {
            checkedAt: profile.checkedAt,
            documentationScope: profile.documentationScope,
          }
        : {}),
      sources: profile ? [...profile.sources] : [],
      installedVersion: 'unverified',
    },
    candidates: scan.files
      .filter((file) => instructionCandidate(file.path))
      .map((file) => {
        const directory = path.posix.dirname(file.path);
        // A familiar basename inside native rules still needs native matching.
        const plain =
          /^(?:AGENTS(?:\.local)?|AGENT|CLAUDE|GEMINI)\.md$/.test(
            path.posix.basename(file.path),
          ) &&
          !/(?:^|\/)\.(?:(?:claude|cursor|cline|devin|continue|windsurf|roo)\/rules(?:-[^/]+)?|clinerules|github\/instructions)\//.test(
            file.path,
          );
        return {
          path: file.path,
          directory,
          kind: plain ? 'plain-instruction' : 'conditional-or-host-specific',
          cwdRelation: plain
            ? directoryRelation(directory, context.cwd)
            : 'unverified',
          targetRelation:
            context.targetPath === undefined
              ? 'not-supplied'
              : plain
                ? directoryRelation(directory, context.targetPath)
                : 'unverified',
        };
      })
      .sort((a, b) => a.path.localeCompare(b.path)),
    assessment: {
      status: 'unverified',
      reason: 'host-version-configuration-and-session-not-assessed',
    },
  };
}

interface DiagnosisInput {
  scan: ScanResult;
  infrastructure: CheckResult;
  session?: { id: string; status: string } | null;
  continuationAvailable?: boolean;
  context?: TaskContext;
}

const orderedReasons = (items: PathReason[]) =>
  items
    .map((item) => ({ ...item }))
    .sort((a, b) =>
      `${a.path ?? ''}\0${a.agent ?? ''}\0${a.reason}`.localeCompare(
        `${b.path ?? ''}\0${b.agent ?? ''}\0${b.reason}`,
      ),
    );

export function summarizeDiagnosis({
  scan,
  infrastructure,
  session,
  continuationAvailable = false,
  context,
}: DiagnosisInput) {
  const issues = orderedReasons(infrastructure.issues ?? []);
  const gaps = orderedReasons(scan.gaps);
  const coverageLimits = [
    ...new Set(
      scan.excluded
        .filter((item) => item.reason !== 'cache-or-metadata')
        .map((item) => item.reason),
    ),
  ].sort();
  const complete = scan.complete && !coverageLimits.length;
  const nextAction = continuationAvailable
    ? {
        kind: 'review-continuation',
        reason:
          'Review the interrupted session and permitted current files before approving a continuation.',
      }
    : !complete || gaps.length
      ? {
          kind: 'inspect-gaps',
          reason:
            'Assess the permitted evidence and explain inspection limits before deciding what to keep or change; leave excluded paths and permissions unchanged.',
        }
      : issues.length || infrastructure.status === 'issues-found'
        ? {
            kind: 'review-issues',
            reason:
              'Review the current structural issues and propose only necessary corrections.',
          }
        : infrastructure.status !== 'passed'
          ? {
              kind: 'inspect-setup',
              reason:
                'Inspect the instruction candidates and selected agent context; structural verification is incomplete.',
            }
          : {
              kind: 'review-evidence',
              reason:
                'Review the observed setup for the intended task; passing structural checks alone does not establish sufficiency.',
            };
  return {
    inventory: {
      complete,
      gaps,
      coverageLimits,
    },
    structure: {
      status: infrastructure.status,
      scope: infrastructure.scope ?? 'structure-only',
      ...(infrastructure.reason ? { reason: infrastructure.reason } : {}),
      issues,
    },
    instructions: {
      basis: 'project-file-inventory',
      ...(context !== undefined
        ? { taskScope: summarizeTaskScope(scan, context) }
        : {}),
      candidates: scan.files
        .filter((file) => instructionCandidate(file.path))
        .map((file) => ({
          path: file.path,
          directory: path.posix.dirname(file.path),
        }))
        .sort((a, b) => a.path.localeCompare(b.path)),
      adapterContracts: Object.entries(AGENT_MATRIX).map(
        ([agent, adapter]) => ({
          agent,
          checkedVersion: adapter.inspectedVersion,
          entrypoints: [...adapter.entrypoints],
          checkedAt: CHECKED_AT,
          installedVersion: 'unverified',
        }),
      ),
      harnessProfiles: scan.agents.flatMap((agent) => {
        const profile = getHarnessProfile(agent);
        return profile
          ? [
              {
                ...profile,
                instructionPaths: [...profile.instructionPaths],
                skillPaths: profile.skillPaths ? [...profile.skillPaths] : null,
                sources: [...profile.sources],
                installedVersion: 'unverified',
              },
            ]
          : [];
      }),
      applicability: 'unverified',
      reason:
        'Candidate directories, documented profiles and adapter contracts do not establish the selected agent/version, working directory, target path or active precedence.',
      loading: {
        status: 'unverified',
        reason: 'no-current-native-observation',
      },
      use: {
        status: 'unverified',
        reason: 'no-current-behavioral-observation',
      },
    },
    recordedSession: session
      ? { id: session.id, status: session.status, basis: 'saved-session' }
      : null,
    nextAction,
  };
}
