import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createProposal } from '../../scripts/core/plan.ts';

const resource = (name: string) =>
  readFile(new URL(`../../references/${name}.md`, import.meta.url), 'utf8');

test('both skill routes disclose optional memory without replacing the interview or consent', async () => {
  for (const name of ['tibicen-init', 'tibicen-adopt']) {
    const entrypoint = await readFile(
      new URL(`../../skills/${name}/SKILL.md`, import.meta.url),
      'utf8',
    );
    assert.match(entrypoint, /\]\(references\/project-memory\.md\)/);
    assert.match(entrypoint, /необязательна/);
  }
  const interview = await resource('stage-interview');
  assert.match(interview, /четыре составных вопроса за 1–2 итерации/);
  assert.match(interview, /для улучшения — одна итерация/);
  assert.match(interview, /ноль вопросов интервью/);
  assert.match(interview, /не отменяет согласие на точный план/);
  for (const stage of [
    'stage-interview',
    'stage-inventory',
    'stage-agent-arch',
  ])
    assert.match(await resource(stage), /\]\(project-memory\.md\)/);
});

test('memory policy covers uncertainty, ambiguous stores and preservation rather than blanket persistence', async () => {
  const memory = await resource('project-memory');
  for (const supported of [
    '.agents/memory.md',
    'MEMORY.md',
    'docs/memory.md',
    'docs/decisions.md',
  ])
    assert(memory.includes(`\`${supported}\``));
  assert.match(memory, /Отказ|отказ/);
  assert.match(memory, /«ответь сейчас коротко»/);
  assert.match(memory, /`inferred`/);
  assert.match(memory, /`user-confirmed`/);
  assert.match(memory, /проверенные факты/);
  assert.match(memory, /противоречащих хранилищ/);
  assert.match(memory, /вопросы запрещены.*gap/);
  assert.match(memory, /Неподдержанный, запрещённый или недоступный путь/);
  assert.match(memory, /несвязанные заметки побайтно/);
  assert.match(
    memory,
    /Секреты и полные переписки по умолчанию не сохраняются/,
  );
  assert.match(memory, /исправь его текущий смысл/);
  assert.match(memory, /не зависит от наличия скилла/);
  assert.match(memory, /не одобряет digest/);
});

test('memory verification guidance separates later mutable notes, pending writes and observed behavior', async () => {
  const verify = await resource('stage-verify');
  assert.match(verify, /`user-memory` после завершённой настройки/);
  assert.match(verify, /тело принадлежит пользователю и может меняться/);
  assert.match(
    verify,
    /незавершённом resume точность исходных байтов обязательна/,
  );
  assert.match(
    verify,
    /свежая сессия.*прочитать.*использовать.*обновить\/исправить/,
  );
  assert.match(verify, /структурный `passed` этого не доказывают/);
  const handoff = await resource('stage-handoff');
  assert.match(
    handoff,
    /поведение следующего агента наблюдалось\/не наблюдалось/,
  );
  assert.match(handoff, /постоянного процесса Tibicen нет/);
});

test('documented init and adopt memory examples compile to exact read-only proposals', async (t) => {
  const examples = [
    ...(await resource('project-memory')).matchAll(/```json\n([\s\S]*?)\n```/g),
  ].map((match) => JSON.parse(match[1]));
  assert.equal(examples.length, 2);
  const base = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'tibicen-memory-examples-')),
  );
  t.after(() => rm(base, { recursive: true, force: true }));
  for (const example of examples) {
    const root = path.join(base, example.mode);
    await mkdir(root);
    const application = 'export const untouched = true;\n';
    const ownerInstructions =
      '# User instructions\nKeep application files intact.\n';
    const existingMemory =
      '# Project notes\n\n- Accepted: no external analytics.\n- Unrelated note: export reports as CSV.\n';
    await writeFile(path.join(root, 'app.js'), application);
    await writeFile(path.join(root, 'AGENTS.md'), ownerInstructions);
    if (example.mode === 'improve') {
      await mkdir(path.join(root, 'docs'));
      await writeFile(path.join(root, example.memory.path), existingMemory);
    }
    const before = await readdir(root);
    const result = await createProposal(root, example, { home: root });
    assert.equal(result.proposal.schema, 2);
    assert.deepEqual(result.proposal.memory, {
      path: example.memory.path,
      ownership: 'user-memory',
    });
    assert.match(result.digest, /^[a-f0-9]{64}$/);
    const instructions = result.proposal.changes.find(
      (change) => change.path === 'AGENTS.md',
    );
    assert(instructions && typeof instructions.content === 'string');
    assert(instructions.content.startsWith(ownerInstructions));
    assert(instructions.content.includes(example.memory.path));
    if (example.mode === 'init') {
      assert.equal(
        result.proposal.changes.find(
          (change) => change.path === example.memory.path,
        )?.beforeHash,
        null,
      );
      await assert.rejects(readFile(path.join(root, example.memory.path)), {
        code: 'ENOENT',
      });
    } else {
      assert(
        !result.proposal.changes.some(
          (change) => change.path === example.memory.path,
        ),
      );
      assert.equal(
        await readFile(path.join(root, example.memory.path), 'utf8'),
        existingMemory,
      );
    }
    assert.equal(
      await readFile(path.join(root, 'app.js'), 'utf8'),
      application,
    );
    assert.equal(
      await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
      ownerInstructions,
    );
    assert.deepEqual(await readdir(root), before);
  }
});
