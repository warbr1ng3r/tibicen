import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = ts
  .transpileModule(
    await readFile(
      new URL('../../landing/src/scripts/app.ts', import.meta.url),
      'utf8',
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2023,
      },
    },
  )
  .outputText.replace(/^import[\s\S]*?;\s*/gm, '');

function page({
  clipboard,
  fallback = true,
}: { clipboard?: Pick<Clipboard, 'writeText'>; fallback?: boolean } = {}) {
  const status = { textContent: '' };
  const form = { addEventListener() {} };
  const download = { disabled: true };
  const timers = new Map<symbol, () => void>();
  const pendingElements = new Set<unknown>();
  const labels = [{ textContent: 'Копировать' }, { textContent: 'Копировать' }];
  const buttons = labels.map((label, index) => ({
    dataset: { copyTarget: `command-${index}` },
    icon: { name: 'copy' },
    ariaLabel: 'Скопировать команду',
    click: async () => {},
    querySelector() {
      return label;
    },
    addEventListener(name: string, handler: () => Promise<void>) {
      this.click = handler;
    },
  }));
  const focused = {
    focus() {
      document.activeElement = this;
    },
  };
  let copied: string | undefined;
  const document = {
    documentElement: { lang: 'ru' },
    activeElement: focused as unknown,
    querySelector(selector: string) {
      return selector === '#preset-form'
        ? form
        : selector === '#download-preset'
          ? download
          : status;
    },
    querySelectorAll() {
      return buttons;
    },
    getElementById(id: string) {
      return { textContent: `text:${id}` };
    },
    body: {
      append(element: unknown) {
        pendingElements.add(element);
      },
    },
    createElement() {
      return {
        value: '',
        style: {},
        select() {
          document.activeElement = this;
          copied = this.value;
        },
        remove() {
          pendingElements.delete(this);
        },
      };
    },
    execCommand() {
      return fallback;
    },
  };
  runInNewContext(source, {
    localize: (locale: string, en: string, ru: string) =>
      locale === 'ru' ? ru : en,
    document,
    navigator: { clipboard },
    setTimeout(callback: () => void) {
      const id = Symbol();
      timers.set(id, callback);
      return id;
    },
    clearTimeout(id: symbol) {
      timers.delete(id);
    },
  });
  return {
    status,
    buttons,
    labels,
    timers,
    document,
    focused,
    pendingElements,
    get copied() {
      return copied;
    },
  };
}

test('only the latest copy reports completion, without replacing icons or accessible names', async () => {
  const requests: {
    text?: string;
    resolve: () => void;
    reject?: (cause: Error) => void;
  }[] = [];
  const view = page({
    clipboard: {
      writeText(text) {
        return new Promise<void>((resolve) => requests.push({ text, resolve }));
      },
    },
  });
  const icon = view.buttons[1].icon;
  const first = view.buttons[0].click();
  const second = view.buttons[1].click();
  assert.equal(requests[1].text, 'text:command-1');
  requests[1].resolve();
  await second;
  assert.equal(view.labels[1].textContent, 'Скопировано');
  requests[0].resolve();
  await first;
  assert.equal(view.labels[0].textContent, 'Копировать');
  assert.equal(view.status.textContent, 'Скопировано в буфер обмена.');
  assert.equal(view.buttons[1].icon, icon);
  assert.equal(view.buttons[1].ariaLabel, 'Скопировать команду');
  for (const callback of view.timers.values()) callback();
  assert.equal(view.labels[1].textContent, 'Копировать');
  assert.equal(view.status.textContent, '');
});

test('selection fallback restores focus and removes its temporary element', async () => {
  const view = page({
    clipboard: {
      async writeText() {
        throw new Error('Permission denied');
      },
    },
  });
  await view.buttons[0].click();
  assert.equal(view.copied, 'text:command-0');
  assert.equal(view.document.activeElement, view.focused);
  assert.equal(view.pendingElements.size, 0);
  assert.equal(view.labels[0].textContent, 'Скопировано');
});

test('an outdated clipboard rejection cannot overwrite a newer copy through fallback', async () => {
  const requests: {
    text?: string;
    resolve: () => void;
    reject?: (cause: Error) => void;
  }[] = [];
  const view = page({
    clipboard: {
      writeText() {
        return new Promise<void>((resolve, reject) =>
          requests.push({ resolve, reject }),
        );
      },
    },
  });
  const first = view.buttons[0].click();
  const second = view.buttons[1].click();
  requests[1].resolve();
  await second;
  requests[0].reject!(new Error('Permission denied'));
  await first;
  assert.equal(view.copied, undefined);
  assert.equal(view.labels[1].textContent, 'Скопировано');
  assert.equal(view.status.textContent, 'Скопировано в буфер обмена.');
});

test('failed copying never announces success and a repeated click cancels old feedback', async () => {
  const failed = page({ fallback: false });
  await failed.buttons[0].click();
  assert.match(failed.status.textContent, /Не удалось/);
  assert.equal(failed.labels[0].textContent, 'Копировать');
  assert.equal(failed.pendingElements.size, 0);
  assert.equal(failed.document.activeElement, failed.focused);

  const view = page({ clipboard: { async writeText() {} } });
  await view.buttons[0].click();
  assert.equal(view.timers.size, 1);
  const next = view.buttons[0].click();
  assert.equal(view.timers.size, 0);
  assert.equal(view.labels[0].textContent, 'Копировать');
  await next;
  assert.equal(view.timers.size, 1);
});
