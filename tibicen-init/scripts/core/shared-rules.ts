import type {
  SharedRule,
  SharedRuleInput,
  SharedRuleCheck,
  PathReason,
} from './types.ts';
import { assert, hashContent } from './contracts.ts';
import { agentSupport } from '../compat/matrix.ts';
import { parseManagedBlock } from './blocks.ts';

const canonical = (text: string) =>
  text.replace(/\r\n|\r/g, '\n').replace(/([^\n])$/, '$1\n');

export function resolveSharedRules(
  inputs: SharedRuleInput[],
  previous: SharedRule[] = [],
): SharedRule[] {
  assert(
    Array.isArray(inputs) && Array.isArray(previous),
    'invalid-shared-rules',
    'Shared rules must be arrays.',
  );
  if (previous.length) validateSharedRules(previous);
  const result = new Map(previous.map((rule) => [rule.id, rule]));
  const ids = new Set();
  for (const input of inputs) {
    assert(
      input &&
        Object.keys(input).every((key) =>
          ['id', 'content', 'reason', 'targets', 'revision'].includes(key),
        ) &&
        typeof input.id === 'string' &&
        /^[a-z][a-z0-9-]{0,63}$/.test(input.id) &&
        !ids.has(input.id),
      'invalid-shared-rules',
      'Shared materials need distinct stable ids and known fields.',
    );
    ids.add(input.id);
    assert(
      typeof input.content === 'string' &&
        input.content.trim() &&
        typeof input.reason === 'string' &&
        input.reason.trim(),
      'invalid-shared-rules',
      'Shared materials need their exact content and reason.',
    );
    const targets =
      input.targets === undefined
        ? result.get(input.id)?.targets
        : input.targets;
    assert(
      Array.isArray(targets) &&
        targets.length >= 2 &&
        targets.every(
          (target) =>
            target &&
            Object.keys(target).every((key) =>
              ['agent', 'agentVersion', 'path'].includes(key),
            ) &&
            typeof target.agent === 'string' &&
            typeof target.agentVersion === 'string' &&
            typeof target.path === 'string',
        ) &&
        new Set(targets.map((target) => target.agent)).size === targets.length,
      'invalid-shared-rules',
      'Shared materials need at least two distinct agents with their version and path.',
    );
    for (const target of targets) {
      const support = agentSupport(target.agent, target.agentVersion);
      assert(
        support.supported,
        support.reason ?? 'unsupported-agent',
        'Shared rules need a version from the checked adapter matrix.',
      );
      assert(
        (support.adapter!.entrypoints as readonly string[]).includes(
          target.path,
        ),
        'unsupported-shared-rule-path',
        'Use the exact instruction entrypoint from the adapter matrix.',
      );
    }
    for (const old of result.get(input.id)?.targets ?? [])
      assert(
        targets.some(
          (target) => target.agent === old.agent && target.path === old.path,
        ),
        'shared-rule-target-required',
        'An update must retain every linked copy; do not silently detach a tool.',
      );
    const content = canonical(input.content);
    result.set(input.id, {
      id: input.id,
      content,
      reason: input.reason,
      revision: hashContent(content),
      targets: targets.map((target) => ({ ...target })),
    });
  }
  const paths = new Set();
  for (const rule of result.values())
    for (const target of rule.targets) {
      assert(
        !paths.has(target.path),
        'shared-rule-path-conflict',
        'Only one shared material can own a managed block.',
      );
      paths.add(target.path);
    }
  return [...result.values()];
}

export function validateSharedRules(rules: SharedRule[]) {
  const resolved = resolveSharedRules(rules);
  for (let index = 0; index < resolved.length; index++)
    assert(
      rules[index].content === resolved[index].content &&
        rules[index].revision === resolved[index].revision,
      'invalid-shared-rules',
      'Shared revision must match its canonical content.',
    );
  return rules;
}

export async function inspectSharedRules(
  rules: SharedRule[],
  read: (relative: string) => Promise<{ content: string | null }>,
): Promise<SharedRuleCheck> {
  validateSharedRules(rules);
  const copies: {
    id: string;
    agent: string;
    path: string;
    revision: string;
    actualRevision: string | null;
    status: string;
    reason?: string;
  }[] = [];
  const issues: PathReason[] = [];
  for (const rule of rules)
    for (const target of rule.targets) {
      let actualRevision: string | null = null,
        reason: string | undefined;
      try {
        const { content } = await read(target.path);
        const block =
          content === null ? null : parseManagedBlock(content, target.path);
        if (!block || block.version !== '1')
          reason = 'shared-rule-copy-missing';
        else {
          actualRevision = hashContent(
            canonical(content!.slice(block.contentStart, block.contentEnd)),
          );
          if (actualRevision !== rule.revision)
            reason = 'shared-rule-copy-outdated';
        }
      } catch (caught) {
        const code = (caught as NodeJS.ErrnoException).code;
        reason =
          code === 'ENOENT'
            ? 'shared-rule-copy-missing'
            : (code ?? 'unreadable-file');
      }
      copies.push({
        id: rule.id,
        agent: target.agent,
        path: target.path,
        revision: rule.revision,
        actualRevision,
        status: reason ? 'issues-found' : 'current',
        ...(reason ? { reason } : {}),
      });
      if (reason)
        issues.push({ path: target.path, agent: target.agent, reason });
    }
  return { status: issues.length ? 'issues-found' : 'passed', copies, issues };
}
