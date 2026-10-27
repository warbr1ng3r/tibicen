import { test, expect, type Page } from '@playwright/test';

async function openPreset(page: Page) {
  await expect(page.locator('#download-preset')).toBeEnabled();
  await page.locator('.preset-details > summary').click();
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
  await page.goto('/');
  await expect(page.locator('#language')).toHaveAttribute(
    'aria-controls',
    /.+/,
  );
});

test('all installation combinations update immediately after selection', async ({
  page,
}) => {
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
});

test('keyboard selection, dismissal and focus do not submit the preset', async ({
  page,
}) => {
  await openPreset(page);
  let downloads = 0;
  page.on('download', () => downloads++);
  const trigger = page.getByRole('combobox', { name: 'Основной язык' });
  await trigger.focus();
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('option', { name: 'Определить в проекте', exact: true }),
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
  await page.getByRole('heading', { name: 'Сохраните предпочтения' }).click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('custom selects participate in FormData, including empty defaults', async ({
  page,
}) => {
  await openPreset(page);
  await expect(page.locator('#language')).toContainText('Определить в проекте');
  await expect(page.locator('#kind')).toContainText('Разные проекты');
  await expect(page.locator('#style')).toContainText('Коротко и по делу');
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
  await choose(page, 'kind', 'Библиотеки');
  await choose(page, 'style', 'С подробным объяснением');
  expect(await values()).toMatchObject({
    language: 'python',
    kind: 'library',
    style: 'detailed',
  });
  await choose(page, 'language', 'Определить в проекте');
  await expect(page.locator('#language')).toContainText('Определить в проекте');
  expect(await values()).toMatchObject({ language: '' });
});

test('field errors block downloads, identify the field and recover after editing', async ({
  page,
}, testInfo) => {
  await openPreset(page);
  let downloads = 0;
  page.on('download', () => downloads++);
  const name = page.locator('#name');
  await name.fill('Bad Name');
  await page.locator('#download-preset').click();
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAttribute('aria-describedby', /name-error/);
  await expect(page.locator('#name-error')).toContainText('Имя:');
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
  await page.locator('.advanced > summary').click();
  await page.locator('#forbidden-paths').fill('../outside');
  await page.locator('.advanced > summary').click();
  await page.locator('#download-preset').click();
  await expect(page.locator('#forbidden-paths')).toBeFocused();
  await expect(page.locator('#forbidden-paths')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(page.locator('#forbidden-paths-error')).toContainText(
    'относительно проекта',
  );
  expect(downloads).toBe(0);
  await page.locator('#forbidden-paths').fill('data/raw\nprivate/');
  await choose(page, 'language', 'Python');
  await page.getByRole('checkbox', { name: 'Codex', exact: true }).check();
  const downloaded = page.waitForEvent('download');
  await page.locator('#download-preset').click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('preset.yaml');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(JSON.parse(Buffer.concat(chunks).toString())).toEqual({
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
          value.textContent === 'Определить в проекте' &&
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

test('without JavaScript no preset answers can be submitted', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('http://127.0.0.1:8372/');
  await page.locator('.preset-details > summary').click();
  await expect(page.locator('#name')).toBeDisabled();
  await expect(page.locator('#download-preset')).toBeDisabled();
  await page
    .locator('#preset-form')
    .evaluate((form) => (form as HTMLFormElement).requestSubmit());
  // requestSubmit can bypass disabled buttons, so no answer may be a successful control.
  await expect
    .poll(
      () =>
        requests.filter((url) =>
          /[?&](name|language|forbiddenPaths)=/.test(url),
        ).length,
    )
    .toBe(0);
  await expect(page.locator('#install-command')).toHaveText(
    'npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/v0.1.0-alpha.1 -g --agent codex --skill tibicen-init tibicen-adopt --copy',
  );
  await context.close();
});

test('touch selection and repeated taps work on a mobile viewport', async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName === 'firefox',
    'Playwright does not emulate mobile Firefox.',
  );
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8372/');
  await expect(page.locator('#download-preset')).toBeEnabled();
  await page.locator('.preset-details > summary').tap();
  const trigger = page.getByRole('combobox', { name: 'Основной язык' });
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
