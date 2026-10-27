import { digest, hashContent } from '../core/contracts.ts';
import { observationGuard } from './observations.ts';
import { nativeRecipe, readMatches } from './native-workflow.ts';
import type { NativeOutput } from './profiles/contracts.ts';
import type { QualityEvidence, QualityPlan } from './quality.ts';

type Stage = QualityEvidence['stage'];
type Provenance = NonNullable<QualityEvidence['provenance']>;
type Observe = (
  kind: 'assertion' | 'instructions-loaded',
  data: unknown,
) => number;

// Select excerpts from explicit observations, never from an oracle or a full private trace.
export function createNativeEvidence(
  plan: QualityPlan,
  replacements: readonly (readonly [string, string])[],
  sensitiveValues: readonly string[] = [],
) {
  const requirements = structuredClone(plan);
  const guard = observationGuard(sensitiveValues),
    selected: QualityEvidence[] = [],
    seenReads = new Set<string>(),
    omitted = { setup: 0, task: 0 };
  const redact = (text: string) =>
    replacements.reduce(
      (value, [original, replacement]) =>
        value.replaceAll(original, replacement),
      text,
    );
  let nextId = 0;
  const add = (
    stage: Stage,
    kind: QualityEvidence['kind'],
    text: string,
    events: number[],
    step?: QualityEvidence['step'],
    details: Partial<Provenance> = {},
  ) => {
    const criteria = requirements[stage].filter((criterion) =>
      kind === 'process'
        ? criterion === 'process'
        : kind === 'loading' || kind === 'context' || criterion !== 'loading',
    );
    if (!criteria.length) return;
    const clean = redact(text) || 'No observed text.';
    const provenance: Provenance = {
      origin: kind === 'recommendation' ? 'executor-message' : 'host-check',
      contentHash: hashContent(text),
      ...details,
      ...(details.path ? { path: redact(details.path) } : {}),
      ...(details.toolUseId ? { toolUseId: redact(details.toolUseId) } : {}),
      redacted:
        clean !== text ||
        (details.path !== undefined && redact(details.path) !== details.path) ||
        (details.toolUseId !== undefined &&
          redact(details.toolUseId) !== details.toolUseId),
    };
    guard({ text: clean, provenance });
    let excerpt = clean;
    let truncation: QualityEvidence['truncation'];
    if (clean.length > 4000) {
      // Reserve room for the omission notice within the existing cap.
      const retainedLength = 3940;
      excerpt =
        clean.slice(0, retainedLength) +
        `\n[truncated: ${clean.length - retainedLength} characters omitted]`;
      truncation = { originalLength: clean.length, retainedLength };
    }
    const item: QualityEvidence = {
      id: 'native-' + nextId++,
      stage,
      kind,
      source: kind === 'recommendation' ? 'executor' : 'host',
      text: excerpt,
      events,
      criteria,
      provenance,
      ...(step ? { step } : {}),
      ...(truncation ? { truncation } : {}),
    };
    const stageItems = selected.filter((fact) => fact.stage === stage);
    if (stageItems.length >= 99) {
      const group = (fact: QualityEvidence) =>
        digest([
          fact.kind,
          fact.provenance?.origin,
          fact.criteria,
          fact.step ?? null,
        ]);
      const counts = new Map<string, number>();
      for (const fact of stageItems)
        counts.set(group(fact), (counts.get(group(fact)) ?? 0) + 1);
      const crowded = [...counts].sort((a, b) => b[1] - a[1])[0];
      omitted[stage]++;
      if (crowded[1] < 2) return;
      selected.splice(
        selected.findIndex(
          (fact) => fact.stage === stage && group(fact) === crowded[0],
        ),
        1,
      );
    }
    selected.push(item);
  };
  return {
    add,
    observeCommand(
      stage: Stage,
      command: NativeOutput['commands'][number],
      reads: { path: string; content: string }[],
      scope: { root: string; cliRoot?: string; sessionHash: string },
      observe: Observe,
    ) {
      const commandText = String(command.command),
        output = String(command.output),
        commandHash = hashContent(commandText),
        details = {
          origin: 'executor-command' as const,
          toolUseId: command.toolUseId,
          sessionHash: scope.sessionHash,
        };
      const value = {
        commandHash,
        exitCode: command.exitCode,
        toolUseId: command.toolUseId,
      };
      const seq = observe('assertion', {
        id: 'native-observed-command-' + nextId,
        expectedHash: digest(value),
        actualHash: digest(value),
      });
      add(
        stage,
        'action',
        `Observed command: ${commandText}\nExit: ${command.exitCode}\nOutput:\n${output}`,
        [seq],
        undefined,
        details,
      );
      if (command.exitCode !== 0 || typeof command.toolUseId !== 'string')
        return;
      let template: unknown;
      try {
        template = JSON.parse(output).template;
      } catch {
        /* Ordinary command output. */
      }
      for (const read of reads) {
        if (!read.content.trim()) continue;
        const external = read.path.startsWith('tooling/openspec/'),
          relative = external ? read.path.slice(17) : read.path,
          recipe = nativeRecipe(command.command, scope.cliRoot);
        if (
          !(
            readMatches(
              command.command,
              relative,
              external ? scope.cliRoot! : scope.root,
            ) && output.includes(read.content.trim())
          ) &&
          !(
            external &&
            recipe?.readOnly &&
            recipe.argv[0] === 'instructions' &&
            template === read.content
          )
        )
          continue;
        const key = digest({
          stage,
          path: read.path,
          contentHash: hashContent(read.content),
        });
        const loading =
          read.path === 'AGENTS.md' ||
          (read.path.startsWith('.agents/skills/') &&
            read.path.endsWith('/SKILL.md')) ||
          read.path.startsWith('openspec/changes/') ||
          external;
        const loaded = loading
          ? observe('instructions-loaded', {
              path: read.path,
              contentHash: hashContent(read.content),
              toolUseId: command.toolUseId,
            })
          : seq;
        if (seenReads.has(key)) continue;
        seenReads.add(key);
        add(
          stage,
          loading ? 'loading' : 'context',
          read.path + '\n' + read.content,
          [loaded],
          undefined,
          {
            ...details,
            origin: 'file-read',
            path: read.path,
            contentHash: hashContent(read.content),
          },
        );
      }
    },
    observeMessages(
      stage: Stage,
      messages: string[],
      sessionHash: string,
      observe: Observe,
    ) {
      for (const message of messages) {
        let excerpt = message;
        try {
          const value = JSON.parse(message);
          if (
            value &&
            typeof value === 'object' &&
            ('summary' in value || 'kernelPlan' in value)
          )
            excerpt = [value.summary, value.question]
              .filter((value) => typeof value === 'string')
              .join('\n');
        } catch {
          /* Plain intermediate reply. */
        }
        if (!excerpt.trim()) continue;
        const value = { sessionHash, contentHash: hashContent(message) };
        const seq = observe('assertion', {
          id: 'native-observed-message-' + nextId,
          expectedHash: digest(value),
          actualHash: digest(value),
        });
        add(stage, 'recommendation', excerpt, [seq], undefined, {
          origin: 'executor-message',
          ...value,
        });
      }
    },
    select() {
      const result = structuredClone(selected);
      for (const stage of ['setup', 'task'] as const) {
        if (!omitted[stage]) continue;
        const text = `[truncated: ${omitted[stage]} evidence items omitted; selection is incomplete]`;
        result.push({
          id: 'native-omitted-' + stage,
          stage,
          kind: 'context',
          source: 'host',
          text,
          events: [],
          criteria: [...requirements[stage]],
          provenance: {
            origin: 'selection',
            contentHash: hashContent(text),
            redacted: false,
          },
          truncation: { omittedItems: omitted[stage] },
        });
      }
      return result;
    },
  };
}
