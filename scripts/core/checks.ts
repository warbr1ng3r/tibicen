import type {
  Command,
  Proposal,
  ChecksInput,
  CompatInput,
  Runner,
} from './types.ts';
import path from 'node:path';
import os from 'node:os';
import { assert, digest } from './contracts.ts';
import { prepareClaudeRun, prepareCompatCommand } from '../compat/index.ts';
import { runCommand } from './execute.ts';

export const COPY_MARKER = path.join(os.tmpdir(), '__TIBICEN_PROJECT_COPY__');
export const availableNames = (names?: string[]) =>
  (names ?? []).filter((name) => process.env[name] !== undefined);

export function prepareCheckCommands(
  checks: ChecksInput = {},
  compat: CompatInput = { enabled: true },
) {
  const commands: Command[] = [],
    unavailable: { kind: string; reason: string; skill?: string }[] = [];
  for (const kind of ['task', 'quiz'] as const) {
    const requested = checks[kind];
    if (!requested) continue;
    const { specification, execution = {} } = requested;
    assert(
      specification?.kind === kind,
      'invalid-check',
      'Behavior checks need a matching specification.',
    );
    if (execution.agent !== 'claude-code') {
      unavailable.push({ kind, reason: 'unsupported-agent' });
      continue;
    }
    const launch = prepareClaudeRun({
      ...execution,
      copyRoot: COPY_MARKER,
      availableEnvNames: availableNames(execution.envNames),
      kind,
      id: specification.id ?? kind,
      prompt: specification.prompt,
      context: specification.context ?? '',
      tools:
        specification.tools ??
        (kind === 'quiz'
          ? ['Read', 'Glob', 'Grep']
          : ['Read', 'Glob', 'Grep', 'Edit', 'Write', 'Skill']),
    });
    if (launch.status === 'ready') commands.push(launch.command);
    else unavailable.push({ kind, reason: launch.reason });
  }
  if (compat.enabled !== false)
    for (const pair of compat.pairs ?? []) {
      if (pair.agent !== 'claude-code') {
        unavailable.push({
          kind: 'compat',
          skill: pair.skill,
          reason: 'headless-method-unverified',
        });
        continue;
      }
      const execution = compat.execution ?? {};
      const launch = prepareCompatCommand(pair, {
        ...execution,
        copyRoot: COPY_MARKER,
        availableEnvNames: availableNames(execution.envNames),
      });
      if (launch.status === 'ready') commands.push(launch.command);
      else
        unavailable.push({
          kind: 'compat',
          skill: pair.skill,
          reason: launch.reason,
        });
    }
  return { commands, unavailable };
}

export function commandIdentity(command: Command, root: string) {
  return digest({
    ...command,
    argv: command.argv.map((argument) =>
      argument === root ? COPY_MARKER : argument,
    ),
  });
}

export function bindRunner(
  proposal: Pick<Proposal, 'commands'>,
  approvedDigest: string,
  execute: Runner = runCommand,
): Runner {
  assert(
    digest(proposal) === approvedDigest,
    'consent-required',
    'Execution must bind to the exact approved proposal.',
  );
  return async (command, options) => {
    const actual = commandIdentity(command, options.root);
    assert(
      proposal.commands.some(
        (approved) => commandIdentity(approved, COPY_MARKER) === actual,
      ),
      'unapproved-command',
      'Command argv, environment names or startup differs from the approved plan.',
    );
    return execute(command, { ...options, approvedDigest });
  };
}
