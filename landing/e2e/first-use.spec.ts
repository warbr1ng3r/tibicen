import { test, expect } from '@playwright/test';

for (const locale of ['en', 'ru'] as const) {
  for (const width of [390, 320]) {
    test(`${locale}: first-use path fits ${width}px and mobile decoration is compact`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(locale === 'en' ? './' : 'ru/');
      await expect(page.locator('#install-command')).toBeVisible();
      const measurements = await page.evaluate(() => {
        const top = (selector: string) =>
          document.querySelector(selector)!.getBoundingClientRect().top +
          scrollY;
        return {
          start: top('#start'),
          card: top('.installation'),
          illustrationHeight: document
            .querySelector('#example')!
            .getBoundingClientRect().height,
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          motion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        };
      });
      expect(measurements.scrollWidth).toBe(width);
      expect(measurements.motion).toBe(true);
      // Baseline at 390px: section y≈954, installation card y≈1423.
      if (width === 390) {
        expect(measurements.start).toBeLessThan(954);
        expect(measurements.card).toBeLessThan(1423);
      }
      expect(measurements.illustrationHeight).toBeLessThan(360);
      expect(measurements.card - measurements.start).toBeLessThan(340);
      console.log(`${locale} ${width}x844: ${JSON.stringify(measurements)}`);
      await page.locator('.hero-actions a[href="#start"]').click();
      await expect(page.locator('#start-title')).toBeInViewport();
      await expect(page.locator('.support-note')).toBeVisible();
      for (const id of ['compatibility', 'skill-help']) {
        const disclosure = page.locator(`#${id}`);
        const summary = disclosure.locator('summary');
        await summary.focus();
        await page.keyboard.press('Enter');
        await expect(disclosure).toHaveAttribute('open', '');
        await expect(disclosure.locator('a')).toBeVisible();
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      await expect(page.locator('#preset-form')).toHaveCount(0);
      await expect(page.locator('#preset a')).toHaveAttribute(
        'href',
        /\/(?:ru\/)?preset\/$/,
      );
      await expect(
        page.locator('#walkthrough-init [data-step="proposal"]'),
      ).toBeVisible();
      await expect(page.locator('#walkthrough-adopt')).toBeHidden();
      await page.locator('#example-choice-init').focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#example-choice-adopt')).toBeChecked();
      await expect(page.locator('#walkthrough-init')).toBeHidden();
      await expect(
        page.locator('#walkthrough-adopt [data-step="approval"]'),
      ).toBeVisible();
      const proposed = page.locator(
        '#walkthrough-adopt [data-step="proposal"]',
      );
      await proposed.locator('summary').click();
      await expect(proposed.locator('.proposal-diff')).toBeVisible();
    });
  }

  test(`${locale}: the installation and both examples work without JavaScript`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL,
    });
    const page = await context.newPage();
    await page.goto(locale === 'en' ? './' : 'ru/');
    await expect(page.locator('#install-command')).toBeVisible();
    await page.locator('.installation-alternatives > summary').click();
    await expect(page.locator('#install-command-pnpm')).toBeVisible();
    await expect(page.locator('#install-command-yarn')).toBeVisible();
    await expect(page.locator('#walkthrough-init')).toBeVisible();
    await expect(page.locator('#walkthrough-adopt')).toBeHidden();
    await page.locator('label[for="example-choice-adopt"]').click();
    await expect(page.locator('#walkthrough-init')).toBeHidden();
    await expect(page.locator('#walkthrough-adopt')).toBeVisible();
    await page
      .locator('#walkthrough-adopt [data-step="before"] summary')
      .click();
    await expect(
      page.locator('#walkthrough-adopt [data-step="before"] pre').first(),
    ).toContainText('notes-api/');
    await page.locator('#preset a').click();
    await expect(page).toHaveURL(/\/(?:ru\/)?preset\/$/);
    await expect(page.locator('#download-preset')).toBeDisabled();
    await page
      .locator(
        `.language-switch a[hreflang="${locale === 'en' ? 'ru' : 'en'}"]`,
      )
      .click();
    await expect(page).toHaveURL(
      locale === 'en' ? /\/ru\/preset\/$/ : /(?<!\/ru)\/preset\/$/,
    );
    await expect(page.locator('#download-preset')).toBeDisabled();
    await context.close();
  });
}

test('project preview stages work with the keyboard and without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  for (const locale of ['en', 'ru']) {
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(locale === 'en' ? './' : 'ru/');
      const preview = page.locator('#example');
      const rows = preview.locator('.repo-tree > li:visible');
      const instructions = preview.locator(
        '[data-preview-file="instructions"]',
      );
      const history = preview.locator('[data-preview-file="history"]');
      await expect(preview.locator('#preview-proposal')).toBeChecked();
      await expect(rows).toHaveCount(7);
      await expect(instructions).toBeVisible();
      await expect(history).toBeHidden();
      await expect(
        instructions.locator('.preview-proposal-only'),
      ).toBeVisible();
      await expect(instructions.locator('.preview-after-only')).toBeHidden();
      await preview.locator('#preview-proposal').focus();
      await page.keyboard.press('ArrowLeft');
      await expect(preview.locator('#preview-before')).toBeChecked();
      await expect(rows).toHaveCount(6);
      await expect(instructions).toBeHidden();
      await expect(history).toBeHidden();
      await expect(
        preview.locator('.repo-status .preview-before-only'),
      ).toBeVisible();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await expect(preview.locator('#preview-after')).toBeChecked();
      await expect(rows).toHaveCount(8);
      await expect(instructions.locator('.preview-after-only')).toBeVisible();
      await expect(instructions.locator('.preview-proposal-only')).toBeHidden();
      await expect(history).toBeVisible();
      await expect(
        preview.locator('.repo-status .preview-after-only'),
      ).toBeVisible();
      await expect(
        preview.locator('.existing-file:visible .tree-name'),
      ).toHaveText([
        'src/',
        'tests/',
        'docs/',
        'data/',
        'package.json',
        'README.md',
      ]);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
    }
  }
  await context.close();
});
