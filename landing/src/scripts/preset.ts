const AGENTS = ['claude-code', 'codex', 'cursor'];
const PROCESSES = ['minimal', 'balanced', 'structured'];
const STYLES = ['concise', 'detailed'];

interface PresetInput {
  name?: FormDataEntryValue | null;
  language?: FormDataEntryValue | null;
  kind?: FormDataEntryValue | null;
  process?: FormDataEntryValue | null;
  style?: FormDataEntryValue | null;
  agents?: FormDataEntryValue[];
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

export function buildPreset({
  name,
  language = '',
  kind = '',
  process = 'balanced',
  style = 'concise',
  agents = [],
  forbiddenPaths = '',
}: PresetInput) {
  const presetName = String(name ?? '').trim();
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(presetName))
    throw new PresetValidationError(
      'name',
      'Имя: до 64 латинских букв, цифр и дефисов. Например, hackathon.',
    );
  if (typeof process !== 'string' || !PROCESSES.includes(process))
    throw new PresetValidationError(
      'process',
      'Выберите предложенный процесс.',
    );
  if (typeof style !== 'string' || !STYLES.includes(style))
    throw new PresetValidationError(
      'style',
      'Выберите предложенную подробность ответов.',
    );
  if (
    !Array.isArray(agents) ||
    !agents.every(
      (agent) => typeof agent === 'string' && AGENTS.includes(agent),
    )
  )
    throw new PresetValidationError('agents', 'Выберите поддержанного агента.');
  const stack_hint: Record<string, string> = {};
  for (const [key, input] of Object.entries({ language, kind })) {
    const value = String(input).trim();
    if (!value) continue;
    if (!/^[a-z0-9+#.-]{1,40}$/i.test(value))
      throw new PresetValidationError(
        key as 'language' | 'kind',
        'Стек и тип проекта задаются короткими названиями.',
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
      'Запретные пути задаются относительно проекта, без .., обратных слешей и абсолютных путей.',
    );
  }
  return {
    schema: 1,
    name: presetName,
    stack_hint,
    answers: {
      process,
      style,
      agents: [...new Set(agents)],
      forbidden_paths: [...new Set(forbidden_paths)],
    },
    preferred_sources: [],
  };
}

export function serializePreset(preset: ReturnType<typeof buildPreset>) {
  return `${JSON.stringify(preset, null, 2)}\n`;
}
