import { assert } from '../core/contracts.ts';
import { MEMORY_PATHS, referencesMemory } from '../core/memory.ts';

type Files = Readonly<Record<string, string>>;
type Phase = 'initial' | 'corrected';

const decisions = { initial: 'On the house', corrected: 'Included' };
const starter: Files = {
  'package.json':
    '{"name":"receipt-lines","private":true,"type":"module","scripts":{"test":"node --test"}}\n',
  'README.md':
    '# Receipt lines\n\nA small receipt formatter. Run `node --test`. Keep the project dependency-free.\n',
  'src/format-price.mjs':
    'export function formatPrice(cents) {\n  if (!Number.isInteger(cents)) throw new TypeError("Whole cents required");\n  return `${(cents / 100).toFixed(2)} EUR`;\n}\n\nexport function receiptLine({ title, cents }) {\n  void title; void cents;\n  throw new Error("Receipt lines are not implemented");\n}\n',
  'tests/format-price.test.mjs':
    'import test from "node:test";\nimport assert from "node:assert/strict";\nimport { formatPrice } from "../src/format-price.mjs";\n\ntest("ordinary amounts", () => {\n  assert.equal(formatPrice(1250), "12.50 EUR");\n  assert.equal(formatPrice(-250), "-2.50 EUR");\n});\n',
};

const taskPrompt =
  'Finish receiptLine({ title, cents }) in src/format-price.mjs so a receipt line is the title, a colon and a space, then the formatted price. Keep shared price formatting in the public formatPrice function and make receiptLine use it. Add basic tests. Do not add dependencies.';

const normalized = (value: string) =>
  value.normalize('NFKC').replace(/\s+/gu, ' ').toLowerCase();

// Controller-only fixture: never stage this module or earlier dialogue for a worker.
export function generatedMemorySetup() {
  return {
    files: { ...starter },
    prompt: `Use tibicen-init to set this project up for agents. I want later agents to remember decisions, not make me repeat them. For zero-price items, show "${decisions.initial}" instead of a numeric amount. Also remember that receipts must not include customer account numbers. Keep it small and dependency-free. Propose the setup first; do not apply it before approval.`,
  };
}

export function generatedMemoryCorrection() {
  return `Zero-price items should now say "${decisions.corrected}" instead of "${decisions.initial}": they are included in the customer's plan. Make that change and keep the decision for later work. Preserve unrelated project decisions and do not add dependencies.`;
}

/** Caller binds the path/snapshots to the reviewed plan; reset source, retain returned memory. */
export function prepareGeneratedMemoryTask(
  approvedSetup: Files,
  memoryPath: string,
  currentMemory: string = approvedSetup[memoryPath],
) {
  assert(
    MEMORY_PATHS.includes(memoryPath) &&
      typeof currentMemory === 'string' &&
      currentMemory.trim().length > 0 &&
      Buffer.byteLength(currentMemory) <= 32768,
    'invalid-generated-memory-fixture',
    'Use the selected supported store and actual bounded returned memory.',
  );
  const policy = approvedSetup['AGENTS.md'];
  assert(
    typeof policy === 'string' &&
      policy.trim().length > 0 &&
      Buffer.byteLength(policy) <= 32768 &&
      referencesMemory(policy, {
        path: memoryPath,
        ownership: 'user-memory',
      }),
    'invalid-generated-memory-fixture',
    'Require the actual generated entrypoint connected to selected memory.',
  );
  for (const [file, content] of Object.entries(starter))
    assert(
      approvedSetup[file] === content,
      'invalid-generated-memory-fixture',
      'Use the approved pre-task source, not an earlier implementation.',
    );
  const files = {
    ...starter,
    'AGENTS.md': policy,
    [memoryPath]: currentMemory,
  };
  for (const [file, content] of Object.entries(files)) {
    if (file === memoryPath) continue;
    assert(
      !Object.values(decisions).some((decision) =>
        normalized(content).includes(normalized(decision)),
      ),
      'generated-memory-answer-leak',
      'The distinguishing decision must occur only in selected memory.',
    );
  }
  return { files, prompt: taskPrompt };
}

/** Compare controller-collected outputs; this helper never executes returned code. */
export function scoreGeneratedMemoryTask(phase: Phase, observed: unknown) {
  assert(
    phase === 'initial' || phase === 'corrected',
    'invalid-generated-memory-fixture',
    'Select the initial or corrected decision.',
  );
  const expected = {
    zero: decisions[phase],
    ordinary: '12.50 EUR',
    refund: '-2.50 EUR',
    line: `Notebook: ${decisions[phase]}`,
  };
  const actual =
    observed && typeof observed === 'object' && !Array.isArray(observed)
      ? (observed as Record<string, unknown>)
      : {};
  const checks = Object.fromEntries(
    Object.entries(expected).map(([id, value]) => [
      id,
      actual[id] === value ? 'passed' : 'failed',
    ]),
  );
  return {
    status: Object.values(checks).every((value) => value === 'passed')
      ? 'passed'
      : 'failed',
    checks,
  };
}
