import { localize, type Locale } from '../i18n.ts';
import { isHarnessHintList } from '../../../scripts/agents/profiles.ts';

const PROCESSES = ['minimal', 'balanced', 'structured'];
const STYLES = ['concise', 'detailed'];

interface PresetInput {
  name?: FormDataEntryValue | null;
  language?: FormDataEntryValue | null;
  kind?: FormDataEntryValue | null;
  process?: FormDataEntryValue | null;
  style?: FormDataEntryValue | null;
  agents?: FormDataEntryValue[];
  customAgents?: FormDataEntryValue | null;
  forbiddenPaths?: FormDataEntryValue | null;
}

export class PresetValidationError extends Error {
  field: keyof PresetInput;
  constructor(field: keyof PresetInput, message: string) {
    super(message);
    this.name = 'PresetValidationError';
    this.field = field;
  }
}

export function buildPreset(
  {
    name,
    language = '',
    kind = '',
    process = 'balanced',
    style = 'concise',
    agents = [],
    customAgents = '',
    forbiddenPaths = '',
  }: PresetInput,
  locale: Locale = 'en',
) {
  const t = (en: string, ru: string) => localize(locale, en, ru);
  const presetName = String(name ?? '').trim();
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(presetName))
    throw new PresetValidationError(
      'name',
      t(
        'Use up to 64 characters: lowercase Latin letters, numbers and hyphens. Start with a letter or number. For example, hackathon.',
        'До 64 символов: строчные латинские буквы, цифры и дефисы. Начните с буквы или цифры. Например, hackathon.',
      ),
    );
  if (typeof process !== 'string' || !PROCESSES.includes(process))
    throw new PresetValidationError(
      'process',
      t(
        'Choose how detailed the workflow should be.',
        'Выберите, насколько подробно разбивать работу на этапы.',
      ),
    );
  if (typeof style !== 'string' || !STYLES.includes(style))
    throw new PresetValidationError(
      'style',
      t('Choose the agent response style.', 'Выберите стиль ответов агента.'),
    );
  const hintError = t(
    'Use up to 16 distinct harness IDs: 1–64 lowercase Latin letters, numbers and hyphens, starting with a letter or number.',
    'Не более 16 разных ID: 1–64 строчных латинских буквы, цифры и дефисы; первый символ — буква или цифра.',
  );
  if (!isHarnessHintList(agents))
    throw new PresetValidationError('agents', hintError);
  if (typeof customAgents !== 'string')
    throw new PresetValidationError('customAgents', hintError);
  const hints = [...agents, ...customAgents.split(/[\s,]+/).filter(Boolean)];
  if (!isHarnessHintList(hints))
    throw new PresetValidationError('customAgents', hintError);
  const stack_hint: Record<string, string> = {};
  for (const [key, input] of Object.entries({ language, kind })) {
    const value = String(input).trim();
    if (!value) continue;
    if (!/^[a-z0-9+#.-]{1,40}$/i.test(value))
      throw new PresetValidationError(
        key as 'language' | 'kind',
        t(
          'Enter a short name for the programming language or project type.',
          'Укажите короткое название языка программирования или типа проекта.',
        ),
      );
    stack_hint[key] = value;
  }
  const forbidden_paths = String(forbiddenPaths)
    .split(/[\r\n]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  if (
    forbidden_paths.some(
      (value) =>
        value.startsWith('/') ||
        /^[a-z]:/i.test(value) ||
        value.includes('..') ||
        value.includes('\\') ||
        value.includes('\0'),
    )
  ) {
    throw new PresetValidationError(
      'forbiddenPaths',
      t(
        'Use paths relative to the project root. Do not use .., backslashes or absolute paths.',
        'Укажите пути относительно корня проекта. Не используйте .., обратные слеши и абсолютные пути.',
      ),
    );
  }
  return {
    schema: 1,
    name: presetName,
    stack_hint,
    answers: {
      process,
      style,
      agents: [...new Set(hints)],
      forbidden_paths: [...new Set(forbidden_paths)],
    },
    preferred_sources: [],
  };
}

export function serializePreset(preset: ReturnType<typeof buildPreset>) {
  return `${JSON.stringify(preset, null, 2)}\n`;
}
