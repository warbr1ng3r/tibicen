import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generatedMemorySetup,
  generatedMemoryCorrection,
  prepareGeneratedMemoryTask,
  scoreGeneratedMemoryTask,
} from '../../scripts/evals/generated-memory-fixture.ts';

const memoryPath = '.agents/memory.md';
const unrelated = '- Receipts must not include customer account numbers.\n';
const initialMemory =
  '# Decisions\n\n- Zero-price items: On the house.\n' + unrelated;
const correctedMemory =
  '# Decisions\n\n- Zero-price items: Included, because they are included in the customer plan.\n' +
  unrelated;

// Synthetic policy is only an offline control, never a native-generation result.
function approvedSetup() {
  return {
    ...generatedMemorySetup().files,
    'AGENTS.md':
      '# Project instructions\n\nRead relevant decisions in `.agents/memory.md` before related work. Keep accepted decisions current and preserve unrelated notes within owner-authorized work.\n',
    [memoryPath]: initialMemory,
  };
}

test('setup has no prewritten policy or memory and does not seed the answer in source', () => {
  const setup = generatedMemorySetup();
  assert.deepEqual(Object.keys(setup.files).sort(), [
    'README.md',
    'package.json',
    'src/format-price.mjs',
    'tests/format-price.test.mjs',
  ]);
  assert(setup.prompt.includes('tibicen-init'));
  assert(setup.prompt.includes('On the house'));
  assert(!setup.prompt.includes('Included'));
  assert(!JSON.stringify(setup.files).includes('On the house'));
  assert(!JSON.stringify(setup.files).includes('Included'));
  setup.files['README.md'] = 'Changed in one copy';
  assert.notEqual(
    generatedMemorySetup().files['README.md'],
    'Changed in one copy',
  );
});

test('fresh task contains only approved source, generated entrypoint and returned memory', () => {
  const setup = approvedSetup();
  const worker = prepareGeneratedMemoryTask(
    {
      ...setup,
      '.tibicen/manifest.yml': 'On the house',
      'support/proposal.json': 'On the house',
      'oracle.json': 'Included',
      'previous-task.mjs': 'On the house',
      'transcript.txt': generatedMemorySetup().prompt,
      'skills/tibicen-init/SKILL.md': 'Not an ordinary working dependency',
    },
    memoryPath,
  );
  assert.deepEqual(Object.keys(worker).sort(), ['files', 'prompt']);
  assert.deepEqual(Object.keys(worker.files).sort(), Object.keys(setup).sort());
  assert.equal(worker.files['AGENTS.md'], setup['AGENTS.md']);
  assert.equal(worker.files[memoryPath], initialMemory);
  const withoutMemory = { ...worker.files };
  delete withoutMemory[memoryPath];
  for (const value of [
    'On the house',
    'Included',
    'memory',
    'tibicen',
    'oracle',
  ])
    assert(!worker.prompt.includes(value));
  assert(!JSON.stringify(withoutMemory).includes('On the house'));
  assert(!JSON.stringify(withoutMemory).includes('Included'));
});

test('task projection rejects answer-bearing entrypoints and prior implementations', () => {
  for (const decision of [
    'On the house',
    'Included',
    'on the house',
    'INCLUDED',
    'ON\u00a0THE\u00a0HOUSE',
    'Ｉｎｃｌｕｄｅｄ',
  ]) {
    assert.throws(
      () =>
        prepareGeneratedMemoryTask(
          {
            ...approvedSetup(),
            'AGENTS.md': approvedSetup()['AGENTS.md'] + decision,
          },
          memoryPath,
        ),
      { code: 'generated-memory-answer-leak' },
    );
    assert.throws(
      () =>
        prepareGeneratedMemoryTask(
          {
            ...approvedSetup(),
            'src/format-price.mjs': `export const answer = '${decision}';`,
          },
          memoryPath,
        ),
      { code: 'invalid-generated-memory-fixture' },
    );
    assert.throws(
      () =>
        prepareGeneratedMemoryTask(
          { ...approvedSetup(), 'README.md': decision },
          memoryPath,
        ),
      { code: 'invalid-generated-memory-fixture' },
    );
  }
});

test('only an actual supported store and connected generated entrypoint are accepted', () => {
  for (const memory of ['', ' ', 'x'.repeat(32769)])
    assert.throws(
      () => prepareGeneratedMemoryTask(approvedSetup(), memoryPath, memory),
      { code: 'invalid-generated-memory-fixture' },
    );
  assert.throws(
    () => prepareGeneratedMemoryTask(approvedSetup(), '../private-memory.md'),
    { code: 'invalid-generated-memory-fixture' },
  );
  assert.throws(
    () =>
      prepareGeneratedMemoryTask(
        { ...approvedSetup(), 'AGENTS.md': '# No connection\n' },
        memoryPath,
      ),
    { code: 'invalid-generated-memory-fixture' },
  );
  const other = 'docs/decisions.md';
  const project = {
    ...generatedMemorySetup().files,
    'AGENTS.md': `Read relevant decisions in ${other}.\n`,
    [other]: initialMemory,
  };
  assert.equal(
    prepareGeneratedMemoryTask(project, other).files[other],
    initialMemory,
  );
});

test('corrected fresh task resets source while retaining returned notes byte for byte', () => {
  const setup = approvedSetup();
  const frozen = structuredClone(setup);
  const worker = prepareGeneratedMemoryTask(setup, memoryPath, correctedMemory);
  assert.equal(worker.files[memoryPath], correctedMemory);
  assert(worker.files[memoryPath].includes(unrelated));
  assert.equal(
    worker.files['src/format-price.mjs'],
    generatedMemorySetup().files['src/format-price.mjs'],
  );
  assert(!worker.files['src/format-price.mjs'].includes('On the house'));
  assert(!worker.files['src/format-price.mjs'].includes('Included'));
  assert.deepEqual(setup, frozen);
  assert(generatedMemoryCorrection().includes('Included'));
  assert(!generatedMemoryCorrection().includes('tibicen'));
});

test('isolated scorer distinguishes generated decisions from numeric defaults and old policy', () => {
  const observed = {
    zero: 'On the house',
    ordinary: '12.50 EUR',
    refund: '-2.50 EUR',
    line: 'Notebook: On the house',
  };
  assert.equal(scoreGeneratedMemoryTask('initial', observed).status, 'passed');
  const stale = scoreGeneratedMemoryTask('corrected', observed);
  assert.equal(stale.status, 'failed');
  assert.equal(stale.checks.zero, 'failed');
  assert.equal(stale.checks.line, 'failed');
  assert.equal(
    scoreGeneratedMemoryTask('corrected', {
      ...observed,
      zero: 'Included',
      line: 'Notebook: Included',
    }).status,
    'passed',
  );
  assert.equal(
    scoreGeneratedMemoryTask('initial', {
      ...observed,
      zero: '0.00 EUR',
      line: 'Notebook: 0.00 EUR',
    }).status,
    'failed',
  );
  for (const missing of [null, [], {}, { zero: 'Included' }])
    assert.equal(
      scoreGeneratedMemoryTask('corrected', missing).status,
      'failed',
    );
});
