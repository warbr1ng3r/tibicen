import test from 'node:test';
import assert from 'node:assert/strict';
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
    value: ['unknown'],
    en: 'Choose a supported agent.',
    ru: 'Выберите поддержанного агента.',
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
