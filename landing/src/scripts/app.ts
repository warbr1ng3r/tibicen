import {
  buildPreset,
  serializePreset,
  PresetValidationError,
} from './preset.ts';
import { localize, type Locale } from '../i18n.ts';

const locale: Locale = document.documentElement.lang === 'ru' ? 'ru' : 'en';
const t = (en: string, ru: string) => localize(locale, en, ru);

const form = document.querySelector<HTMLFormElement>('#preset-form')!;
const error = document.querySelector<HTMLElement>('#form-error')!;
const status = document.querySelector<HTMLElement>('#download-status')!;
const copyStatus = document.querySelector<HTMLElement>('#copy-status')!;
let latestCopy = 0;

async function copyText(text: string, request: number) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Local HTTP and clipboard permissions can require the selection fallback.
    }
  }

  if (request !== latestCopy) return;
  const focused = document.activeElement;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.readOnly = true;
  textarea.tabIndex = -1;
  textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.append(textarea);
  try {
    textarea.select();
    if (!document.execCommand('copy')) throw new Error('Copy unavailable');
  } finally {
    textarea.remove();
    if (focused && document.activeElement !== focused)
      (focused as HTMLElement).focus({ preventScroll: true });
  }
}

for (const button of document.querySelectorAll<HTMLButtonElement>(
  '[data-copy-target]',
)) {
  const label = button.querySelector('[data-copy-label]');
  const originalLabel = label?.textContent;
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  button.addEventListener('click', async () => {
    const request = ++latestCopy;
    clearTimeout(resetTimer);
    if (label) label.textContent = originalLabel ?? null;
    copyStatus.textContent = t('Copying…', 'Копирование…');
    try {
      const target = document.getElementById(button.dataset.copyTarget!);
      if (!target) throw new Error('Copy target absent');
      await copyText(target.textContent ?? '', request);
      if (request !== latestCopy) return;
      copyStatus.textContent = t(
        'Copied to clipboard.',
        'Скопировано в буфер обмена.',
      );
      if (label) {
        label.textContent = t('Copied', 'Скопировано');
        resetTimer = setTimeout(() => {
          label.textContent = originalLabel ?? null;
          if (request === latestCopy) copyStatus.textContent = '';
        }, 1800);
      }
    } catch {
      if (request === latestCopy)
        copyStatus.textContent = t(
          'Could not copy. Select the text and copy it manually.',
          'Не удалось скопировать. Выделите текст и скопируйте его вручную.',
        );
    }
  });
}

function clearFieldError(field: Element) {
  field
    .querySelectorAll('[aria-invalid]')
    .forEach((control) => control.removeAttribute('aria-invalid'));
  const message = field.querySelector<HTMLElement>('[data-field-error]');
  if (message) {
    message.hidden = true;
    message.textContent = '';
  }
}

form.addEventListener('input', (event) => {
  const field = (event.target as Element).closest('[data-field]');
  if (field) clearFieldError(field);
});
form.addEventListener('starwind:value-change', (event) => {
  const field = (event.target as Element).closest('[data-field]');
  if (field) clearFieldError(field);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  form.querySelectorAll('[data-field]').forEach(clearFieldError);
  error.hidden = true;
  status.textContent = '';
  try {
    const data = new FormData(form);
    const preset = buildPreset(
      {
        name: data.get('name'),
        language: data.get('language'),
        kind: data.get('kind'),
        process: data.get('process'),
        style: data.get('style'),
        agents: data.getAll('agents'),
        forbiddenPaths: data.get('forbiddenPaths'),
      },
      locale,
    );
    const blob = new Blob([serializePreset(preset)], {
      type: 'application/yaml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'preset.yaml';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = t(
      'File prepared for download. Give it to your agent in the target project.',
      'Файл подготовлен к скачиванию. Передайте его агенту в нужном проекте.',
    );
  } catch (cause) {
    if (cause instanceof PresetValidationError) {
      const field = form.querySelector(`[data-field="${cause.field}"]`);
      const control = field?.querySelector<HTMLElement>(
        'input:not([type="hidden"]), textarea, [role="combobox"]',
      );
      const message = field?.querySelector<HTMLElement>('[data-field-error]');
      if (control && message) {
        const details = control.closest<HTMLDetailsElement>('details.advanced');
        if (details) details.open = true;
        control.setAttribute('aria-invalid', 'true');
        message.textContent = cause.message;
        message.hidden = false;
        control.focus();
        return;
      }
    }
    error.textContent =
      cause instanceof PresetValidationError
        ? cause.message
        : t(
            'Could not prepare the file. Try downloading it again.',
            'Не удалось подготовить файл. Попробуйте скачать его ещё раз.',
          );
    error.hidden = false;
  }
});

// Keep native submission disabled until the local download handler is installed.
document.querySelector<HTMLButtonElement>('#download-preset')!.disabled = false;
document.querySelector<HTMLFieldSetElement>('#preset-controls')!.disabled =
  false;
