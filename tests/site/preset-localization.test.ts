import test from 'node:test';
import assert from 'node:assert/strict';
import { HARNESS_PROFILES } from '../../scripts/agents/profiles.ts';
import { validatePreset } from '../../scripts/core/contracts.ts';
import {
  buildPreset,
  serializePreset,
  PresetValidationError,
} from '../../landing/src/scripts/preset.ts';

const invalidCases = [
  {
    field: 'name',
    value: '../private',
    en: 'Name: up to 64 lowercase Latin letters, numbers and hyphens. For example, hackathon.',
    ru: 'Имя: до 64 латинских букв, цифр и дефисов. Например, hackathon.',
  },
  {
    field: 'process',
    value: 'unknown',
    en: 'Choose one of the available processes.',
    ru: 'Выберите предложенный процесс.',
  },
  {
    field: 'style',
    value: 'unknown',
    en: 'Choose one of the available response styles.',
    ru: 'Выберите предложенную подробность ответов.',
  },
  {
    field: 'agents',
    value: ['Bad-ID'],
    en: 'Use up to 16 distinct harness IDs: 1–64 lowercase Latin letters, numbers and hyphens, starting with a letter or number.',
    ru: 'Не более 16 разных ID: 1–64 строчных латинских буквы, цифры и дефисы; первый символ — буква или цифра.',
  },
  {
    field: 'customAgents',
    value: 'Bad-ID',
    en: 'Use up to 16 distinct harness IDs: 1–64 lowercase Latin letters, numbers and hyphens, starting with a letter or number.',
    ru: 'Не более 16 разных ID: 1–64 строчных латинских буквы, цифры и дефисы; первый символ — буква или цифра.',
  },
  {
    field: 'language',
    value: 'not a short name',
    en: 'Use short names for programming language and project type.',
    ru: 'Стек и тип проекта задаются короткими названиями.',
  },
  {
    field: 'kind',
    value: 'not a short name',
    en: 'Use short names for programming language and project type.',
    ru: 'Стек и тип проекта задаются короткими названиями.',
  },
  {
    field: 'forbiddenPaths',
    value: '../private',
    en: 'Protected paths must be relative to the project, without .., backslashes or absolute paths.',
    ru: 'Запретные пути задаются относительно проекта, без .., обратных слешей и абсолютных путей.',
  },
];

for (const locale of ['en', 'ru'] as const) {
  for (const { field, value, ...messages } of invalidCases) {
    test(`${locale}: invalid ${field} keeps its field identity and localized message`, () => {
      assert.throws(
        () => buildPreset({ name: 'my-setup', [field]: value }, locale),
        (error: unknown) => {
          assert.ok(error instanceof PresetValidationError);
          assert.equal(error.field, field);
          assert.equal(error.message, messages[locale]);
          return true;
        },
      );
    });
  }
}

test('page locale never changes empty preset defaults or infers a programming language', () => {
  const expected = {
    schema: 1,
    name: 'my-setup',
    stack_hint: {},
    answers: {
      process: 'balanced',
      style: 'concise',
      agents: [],
      forbidden_paths: [],
    },
    preferred_sources: [],
  };
  for (const locale of ['en', 'ru'] as const) {
    const preset = buildPreset({ name: 'my-setup' }, locale);
    assert.deepEqual(preset, expected);
    assert.equal(
      serializePreset(preset),
      `${JSON.stringify(expected, null, 2)}\n`,
    );
  }
  assert.deepEqual(buildPreset({ name: 'my-setup' }), expected);
});

test('equivalent populated presets are byte-identical in both page languages', () => {
  const input = {
    name: ' service-setup ',
    language: 'typescript',
    kind: 'service',
    process: 'structured',
    style: 'detailed',
    agents: ['codex', 'claude-code', 'cursor', 'codex'],
    forbiddenPaths: ' data/raw\nprivate/\ndata/raw\n',
  };
  const expected = {
    schema: 1,
    name: 'service-setup',
    stack_hint: { language: 'typescript', kind: 'service' },
    answers: {
      process: 'structured',
      style: 'detailed',
      agents: ['codex', 'claude-code', 'cursor'],
      forbidden_paths: ['data/raw', 'private/'],
    },
    preferred_sources: [],
  };
  for (const locale of ['en', 'ru'] as const) {
    const preset = buildPreset(input, locale);
    assert.deepEqual(preset, expected);
    assert.equal(
      serializePreset(preset),
      `${JSON.stringify(expected, null, 2)}\n`,
    );
  }
});

test('browser and core accept every catalog hint in both languages, including legacy profiles', () => {
  const agents = HARNESS_PROFILES.map(({ id }) => id);
  for (const locale of ['en', 'ru'] as const) {
    const preset = buildPreset(
      { name: 'catalog', agents: [...agents, agents[0]] },
      locale,
    );
    assert.deepEqual(preset.answers.agents, agents);
    assert.deepEqual(validatePreset(preset), preset);
  }
});

test('uncatalogued and custom hints round-trip with ordered deduplication in both languages', () => {
  for (const locale of ['en', 'ru'] as const) {
    const preset = buildPreset(
      {
        name: 'private-hints',
        agents: ['codex', 'team-agent', 'codex'],
        customAgents: ' team-agent, other-host\nlocal-llm codex ',
      },
      locale,
    );
    assert.deepEqual(preset.answers.agents, [
      'codex',
      'team-agent',
      'other-host',
      'local-llm',
    ]);
    assert.deepEqual(validatePreset(preset), preset);
  }
});

test('sixteen distinct hints allow duplicates; a seventeenth custom hint identifies its input', () => {
  const agents = Array.from({ length: 16 }, (_, index) => `team-${index}`);
  for (const locale of ['en', 'ru'] as const) {
    const preset = buildPreset(
      {
        name: 'limit',
        agents: [...agents, ...agents],
        customAgents: agents[0],
      },
      locale,
    );
    assert.deepEqual(preset.answers.agents, agents);
    assert.deepEqual(validatePreset(preset), preset);
    assert.throws(
      () =>
        buildPreset({ name: 'limit', agents, customAgents: 'team-16' }, locale),
      (error) =>
        error instanceof PresetValidationError &&
        error.field === 'customAgents',
    );
  }
});

test('malformed, sparse and excessive hints stay invalid in browser and core', () => {
  for (const agent of [
    'Codex',
    'gemini_cli',
    '../codex',
    '__proto__',
    'toString',
    '',
    'a'.repeat(65),
  ]) {
    for (const locale of ['en', 'ru'] as const) {
      assert.throws(
        () => buildPreset({ name: 'invalid', agents: [agent] }, locale),
        PresetValidationError,
      );
    }
    const preset = buildPreset({ name: 'invalid' });
    assert.throws(() =>
      validatePreset({
        ...preset,
        answers: { ...preset.answers, agents: [agent] },
      }),
    );
  }
  for (const agents of [
    Array<string>(1),
    Array.from({ length: 17 }, (_, index) => `host-${index}`),
    [new File([], 'host')],
  ]) {
    assert.throws(
      () => buildPreset({ name: 'invalid', agents }),
      PresetValidationError,
    );
    const preset = buildPreset({ name: 'invalid' });
    assert.throws(() =>
      validatePreset({ ...preset, answers: { ...preset.answers, agents } }),
    );
  }
  for (const customAgents of [
    'Bad-ID',
    '../host',
    'team_agent',
    new File([], 'host'),
  ]) {
    assert.throws(
      () => buildPreset({ name: 'invalid', customAgents }),
      (error) =>
        error instanceof PresetValidationError &&
        error.field === 'customAgents',
    );
  }
});
