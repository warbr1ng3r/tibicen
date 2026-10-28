import { test, expect, type Download, type Page } from '@playwright/test';

async function openPreset(page: Page) {
  await expect(page.locator('#download-preset')).toBeEnabled();
  await page.locator('.preset-details > summary').click();
}

async function openAdvanced(page: Page) {
  await page.locator('.advanced > summary').click();
}

async function downloadedText(download: Download) {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString();
}

async function choose(page: Page, id: string, label: string) {
  const trigger = page.locator(`#${id}`);
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page
    .getByRole('listbox')
    .getByRole('option', { name: label, exact: true })
    .click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
}

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#language')).toHaveAttribute(
    'aria-controls',
    /.+/,
  );
});

test('all installation combinations update immediately after selection', async ({
  page,
}) => {
  for (const route of ['./', 'ru/']) {
    await page.goto(route);
    await expect(page.locator('#install-controls')).toBeEnabled();
    for (const [manager, runner] of [
      ['npm', 'npx'],
      ['pnpm', 'pnpm dlx'],
      ['Yarn 2+', 'yarn dlx'],
    ]) {
      await choose(page, 'install-manager', manager);
      for (const [agent, flag] of [
        ['Codex', 'codex'],
        ['Claude Code', 'claude-code'],
        ['Cursor', 'cursor'],
      ]) {
        await choose(page, 'install-agent', agent);
        await expect(page.locator('#install-command')).toHaveText(
          `${runner} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/v0.1.0-alpha.1 -g --agent ${flag} --skill tibicen-init tibicen-adopt --copy`,
        );
      }
    }
  }
});

test('keyboard selection, dismissal and focus do not submit the preset', async ({
  page,
}) => {
  await openPreset(page);
  await openAdvanced(page);
  let downloads = 0;
  page.on('download', () => downloads++);
  const trigger = page.getByRole('combobox', { name: 'Programming language' });
  await trigger.focus();
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('option', { name: 'Detect in project', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('option', { name: 'TypeScript', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText('TypeScript');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(downloads).toBe(0);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await page.getByRole('heading', { name: 'Save your preferences' }).click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('custom selects participate in FormData, including empty defaults', async ({
  page,
}) => {
  await openPreset(page);
  await openAdvanced(page);
  await expect(page.locator('#language')).toContainText('Detect in project');
  await expect(page.locator('#kind')).toContainText('Various projects');
  await expect(page.locator('#style')).toContainText('Concise');
  const values = () =>
    page
      .locator('#preset-form')
      .evaluate((form) =>
        Object.fromEntries(new FormData(form as HTMLFormElement)),
      );
  expect(await values()).toMatchObject({
    language: '',
    kind: '',
    style: 'concise',
    process: 'balanced',
  });
  await choose(page, 'language', 'Python');
  await choose(page, 'kind', 'Libraries');
  await choose(page, 'style', 'Detailed');
  expect(await values()).toMatchObject({
    language: 'python',
    kind: 'library',
    style: 'detailed',
  });
  await choose(page, 'language', 'Detect in project');
  await expect(page.locator('#language')).toContainText('Detect in project');
  expect(await values()).toMatchObject({ language: '' });
});

test('field errors block downloads, identify the field and recover after editing', async ({
  page,
}, testInfo) => {
  await openPreset(page);
  await openAdvanced(page);
  let downloads = 0;
  page.on('download', () => downloads++);
  const name = page.locator('#name');
  await name.fill('Bad Name');
  await page.locator('#download-preset').click();
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAttribute('aria-describedby', /name-error/);
  await expect(page.locator('#name-error')).toContainText('Name:');
  expect(downloads).toBe(0);
  if (testInfo.project.name === 'chromium') {
    await expect(page.locator('.preset-details')).toHaveScreenshot(
      'preset-name-error.png',
      { animations: 'disabled' },
    );
  }
  await name.fill('my-setup');
  await expect(page.locator('#name-error')).toBeHidden();
  await expect(name).not.toHaveAttribute('aria-invalid');
  await page.locator('#forbidden-paths').fill('../outside');
  await page.locator('.advanced > summary').click();
  await page.locator('#download-preset').click();
  await expect(page.locator('#forbidden-paths')).toBeFocused();
  await expect(page.locator('#forbidden-paths')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(page.locator('#forbidden-paths-error')).toContainText(
    'relative to the project',
  );
  expect(downloads).toBe(0);
  await page.locator('#forbidden-paths').fill('data/raw\nprivate/');
  await choose(page, 'language', 'Python');
  await page.getByRole('checkbox', { name: 'Codex', exact: true }).check();
  const downloaded = page.waitForEvent('download');
  await page.locator('#download-preset').click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('preset.yaml');
  expect(JSON.parse(await downloadedText(download))).toEqual({
    schema: 1,
    name: 'my-setup',
    stack_hint: { language: 'python' },
    answers: {
      process: 'balanced',
      style: 'concise',
      agents: ['codex'],
      forbidden_paths: ['data/raw', 'private/'],
    },
    preferred_sources: [],
  });
  await expect(page.locator('#forbidden-paths-error')).toBeHidden();
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`controls fit at ${width}px and menu stays in the viewport`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await openPreset(page);
    await openAdvanced(page);
    const measurements = await page.evaluate(() => {
      const trigger = document.querySelector<HTMLElement>('#language')!;
      const value = trigger.querySelector<HTMLElement>(
        '[data-sw-select-value]',
      )!;
      const icon = document
        .querySelector<HTMLElement>('.details-toggle svg')!
        .getBoundingClientRect();
      const circle = document
        .querySelector<HTMLElement>('.details-toggle')!
        .getBoundingClientRect();
      return {
        width: document.documentElement.scrollWidth,
        textFits:
          value.textContent === 'Detect in project' &&
          value.scrollWidth <= value.clientWidth,
        fontSizes: [
          ...document.querySelectorAll('#preset small, .form-footnote'),
        ].map((el) => parseFloat(getComputedStyle(el).fontSize)),
        targets: [
          ...document.querySelectorAll('.agent-choices label, .choice'),
        ].map((el) => el.getBoundingClientRect().height),
        iconOffset: [
          Math.abs(icon.x + icon.width / 2 - circle.x - circle.width / 2),
          Math.abs(icon.y + icon.height / 2 - circle.y - circle.height / 2),
        ],
      };
    });
    expect(measurements.width).toBe(width);
    expect(measurements.textFits).toBe(true);
    expect(Math.min(...measurements.fontSizes)).toBeGreaterThanOrEqual(12);
    expect(Math.min(...measurements.targets)).toBeGreaterThanOrEqual(44);
    expect(Math.max(...measurements.iconOffset)).toBeLessThan(1);
    await page.locator('#language').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -260));
    await page.locator('#language').click();
    const popup = page.getByRole('listbox');
    await expect(popup).toBeVisible();
    await expect
      .poll(async () => (await popup.boundingBox())!.width)
      .toBeGreaterThan(100);
    const box = (await popup.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(1000);
    if (testInfo.project.name === 'chromium') {
      await expect(page).toHaveScreenshot(`select-open-${width}.png`, {
        animations: 'disabled',
      });
    }
  });
}

test('without JavaScript English stays default in a Russian browser and language links preserve privacy', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    locale: 'ru-RU',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const requests: { url: string; body: string | null }[] = [];
  page.on('request', (request) =>
    requests.push({
      url: request.url(),
      body: request.postData(),
    }),
  );
  await page.goto('./');
  for (const [index, locale] of ['en', 'ru', 'en'].entries()) {
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page).toHaveURL(
      new URL(locale === 'en' ? './' : 'ru/', baseURL).href,
    );
    const nextLocale = locale === 'en' ? 'ru' : 'en';
    const switchLink = page.locator(`header a[hreflang="${nextLocale}"]`);
    await expect(switchLink).toBeVisible();
    await expect(page.locator('header a[aria-current="page"]')).toHaveAttribute(
      'hreflang',
      locale,
    );
    await page.locator('.preset-details > summary').click();
    await expect(page.locator('#name')).toBeDisabled();
    await expect(page.locator('#download-preset')).toBeDisabled();
    await expect(page.locator('#install-command')).toHaveText(
      'npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/v0.1.0-alpha.1 -g --agent codex --skill tibicen-init tibicen-adopt --copy',
    );
    await page
      .locator('#name')
      .evaluate((field: HTMLInputElement) => (field.value = 'private-answer'));
    // Native submission can bypass a disabled button. Its disabled controls must still carry no answers.
    await Promise.all([
      page.waitForEvent(
        'framenavigated',
        (frame) => frame === page.mainFrame(),
      ),
      page
        .locator('#preset-form')
        .evaluate((form) => (form as HTMLFormElement).requestSubmit()),
    ]);
    await page.waitForLoadState('domcontentloaded');
    if (index < 2) {
      await page.locator(`header a[hreflang="${nextLocale}"]`).click();
    }
  }
  expect(
    requests.filter(({ url, body }) =>
      /private-answer|[?&](name|language|forbiddenPaths)=/.test(
        `${url} ${body ?? ''}`,
      ),
    ),
  ).toEqual([]);
  await context.close();
});

test('touch selection and repeated taps work on a mobile viewport', async ({
  browser,
  browserName,
  baseURL,
}) => {
  test.skip(
    browserName === 'firefox',
    'Playwright does not emulate mobile Firefox.',
  );
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('./');
  await expect(page.locator('#download-preset')).toBeEnabled();
  await page.locator('.preset-details > summary').tap();
  await page.locator('.advanced > summary').tap();
  const trigger = page.getByRole('combobox', { name: 'Programming language' });
  await trigger.tap();
  await page.getByRole('option', { name: 'Python', exact: true }).tap();
  await expect(trigger).toContainText('Python');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.tap();
  await expect(page.getByRole('listbox')).toBeVisible();
  await trigger.tap();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await context.close();
});

for (const locale of ['en', 'ru'] as const) {
  test(`${locale}: copy progress, success and clipboard-plus-fallback failure are localized`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText(text: string) {
            const state = window as Window & {
              copied?: string;
              completeCopy?: () => void;
            };
            state.copied = text;
            return new Promise<void>(
              (resolve) => (state.completeCopy = resolve),
            );
          },
        },
      });
    });
    await page.goto(locale === 'en' ? './' : 'ru/');
    await expect(page.locator('#download-preset')).toBeEnabled();
    for (const id of ['install-command', 'prompt-scenarios-0']) {
      const button = page.locator(`[data-copy-target="${id}"]`);
      const originalName = await button.getAttribute('aria-label');
      await button.click();
      await expect(page.locator('#copy-status')).toHaveText(
        locale === 'en' ? 'Copying…' : 'Копирование…',
      );
      expect(
        await page.evaluate(
          () => (window as Window & { copied?: string }).copied,
        ),
      ).toBe(await page.locator(`#${id}`).textContent());
      await page.evaluate(() =>
        (window as Window & { completeCopy?: () => void }).completeCopy!(),
      );
      await expect(page.locator('#copy-status')).toHaveText(
        locale === 'en'
          ? 'Copied to clipboard.'
          : 'Скопировано в буфер обмена.',
      );
      await expect(button.locator('[data-copy-label]')).toHaveText(
        locale === 'en' ? 'Copied' : 'Скопировано',
      );
      await expect(button).toHaveAttribute('aria-label', originalName!);
    }
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          async writeText() {
            throw new Error('Permission denied');
          },
        },
      });
      document.execCommand = () => false;
    });
    const failed = page.locator('[data-copy-target="prompt-scenarios-1"]');
    await failed.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#copy-status')).toHaveText(
      locale === 'en'
        ? 'Could not copy. Select the text and copy it manually.'
        : 'Не удалось скопировать. Выделите текст и скопируйте его вручную.',
    );
    await expect(failed.locator('[data-copy-label]')).toHaveText(
      locale === 'en' ? 'Copy' : 'Копировать',
    );
    await expect(failed).toBeFocused();
    await expect(page.locator('textarea[readonly]')).toHaveCount(0);
  });
}

test('Russian name/path errors identify fields and recover with advanced settings closed', async ({
  page,
}) => {
  await page.goto('ru/');
  await openPreset(page);
  let downloads = 0;
  page.on('download', () => downloads++);
  await page.locator('#name').fill('Bad Name');
  await page.locator('#download-preset').click();
  await expect(page.locator('#name')).toBeFocused();
  await expect(page.locator('#name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#name')).toHaveAttribute(
    'aria-describedby',
    /name-error/,
  );
  await expect(page.locator('#name-error')).toContainText('Имя:');
  await page.locator('#name').fill('my-setup');
  await expect(page.locator('#name-error')).toBeHidden();
  await expect(page.locator('#name')).not.toHaveAttribute('aria-invalid');
  await openAdvanced(page);
  await page.locator('#forbidden-paths').fill('../outside');
  await page.locator('.advanced > summary').click();
  await page.locator('#download-preset').click();
  await expect(page.locator('.advanced')).toHaveAttribute('open', '');
  await expect(page.locator('#forbidden-paths')).toBeFocused();
  await expect(page.locator('#forbidden-paths')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(page.locator('#forbidden-paths-error')).toContainText(
    'относительно проекта',
  );
  expect(downloads).toBe(0);
  await page.locator('#forbidden-paths').fill('private/');
  await expect(page.locator('#forbidden-paths-error')).toBeHidden();
  await expect(page.locator('#forbidden-paths')).not.toHaveAttribute(
    'aria-invalid',
  );
});

test('equivalent English/Russian choices download identical local presets with localized status', async ({
  page,
}) => {
  const presets: { defaults: string; selected: string }[] = [];
  for (const locale of ['en', 'ru']) {
    await page.goto(locale === 'en' ? './' : 'ru/');
    await openPreset(page);
    await expect(page.locator('.advanced')).not.toHaveAttribute('open');
    const requests: string[] = [];
    const record = (request: { url(): string }) => requests.push(request.url());
    page.on('request', record);
    const download = async () => {
      const pending = page.waitForEvent('download');
      await page.locator('#download-preset').click();
      const file = await pending;
      expect(file.suggestedFilename()).toBe('preset.yaml');
      await expect(page.locator('#download-status')).toHaveText(
        locale === 'en'
          ? 'File prepared for download. Give it to your agent in the target project.'
          : 'Файл подготовлен к скачиванию. Передайте его агенту в нужном проекте.',
      );
      return downloadedText(file);
    };
    const defaults = await download();
    expect(JSON.parse(defaults)).toEqual({
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
    });
    await openAdvanced(page);
    await page.locator('#name').fill('locale-check');
    await choose(page, 'language', 'Python');
    await choose(page, 'kind', locale === 'en' ? 'Libraries' : 'Библиотеки');
    await choose(
      page,
      'style',
      locale === 'en' ? 'Detailed' : 'С подробным объяснением',
    );
    await page.locator('input[name="process"][value="structured"]').check();
    await page.getByRole('checkbox', { name: 'Codex', exact: true }).check();
    await page.locator('#forbidden-paths').fill('private-answer/\ndata/raw');
    const selected = await download();
    presets.push({ defaults, selected });
    expect(
      requests,
      'Preset answers and downloads must stay in this browser.',
    ).toEqual([]);
    page.off('request', record);
  }
  expect(presets[0]).toEqual(presets[1]);
  expect(JSON.parse(presets[0].selected)).toEqual({
    schema: 1,
    name: 'locale-check',
    stack_hint: { language: 'python', kind: 'library' },
    answers: {
      process: 'structured',
      style: 'detailed',
      agents: ['codex'],
      forbidden_paths: ['private-answer/', 'data/raw'],
    },
    preferred_sources: [],
  });
});
