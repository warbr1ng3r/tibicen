import path from 'node:path';
import type { CheckResult, PathReason, ScanResult } from './types.ts';
import { AGENT_MATRIX, CHECKED_AT } from '../compat/matrix.ts';

interface DiagnosisInput {
  scan: ScanResult;
  infrastructure: CheckResult;
  session?: { id: string; status: string } | null;
  continuationAvailable?: boolean;
}

const orderedReasons = (items: PathReason[]) =>
  items
    .map((item) => ({ ...item }))
    .sort((a, b) =>
      `${a.path ?? ''}\0${a.agent ?? ''}\0${a.reason}`.localeCompare(
        `${b.path ?? ''}\0${b.agent ?? ''}\0${b.reason}`,
      ),
    );

const instructionCandidate = (relative: string) =>
  /(?:^|\/)(?:AGENTS\.md|CLAUDE\.md|\.cursorrules)$/.test(relative) ||
  /(?:^|\/)\.(?:claude|cursor)\/rules\/.+\.(?:md|mdc|txt)$/.test(relative);

export function summarizeDiagnosis({
  scan,
  infrastructure,
  session,
  continuationAvailable = false,
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
      applicability: 'unverified',
      reason:
        'Candidate directories and adapter contracts do not establish the selected agent/version, working directory, target path or active precedence.',
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
