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
      const complete = page.locator('#complete-examples');
      await expect(complete).not.toHaveAttribute('open');
      await complete.locator(':scope > summary').focus();
      await page.keyboard.press('Enter');
      await expect(complete).toHaveAttribute('open', '');
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
    const complete = page.locator('#complete-examples');
    await expect(complete).not.toHaveAttribute('open');
    await expect(page.locator('#walkthrough-init')).toBeHidden();
    await complete.locator(':scope > summary').focus();
    await page.keyboard.press('Enter');
    await expect(complete).toHaveAttribute('open', '');
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

test('static composition and complete examples work with the keyboard without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  for (const locale of ['en', 'ru']) {
    for (const width of [1440, 390, 320, 280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(locale === 'en' ? './' : 'ru/');
      const preview = page.locator('#example');
      await expect(preview.locator('input, button')).toHaveCount(0);
      await expect(preview.locator('.optional-setup li')).toHaveCount(3);
      await expect(
        preview.locator('[data-preview-file="history"]'),
      ).toBeVisible();
      await expect(page.locator('.setup-dialog')).toBeVisible();
      await expect(page.locator('#setup-scope')).toBeVisible();
      if (width <= 390)
        expect((await preview.boundingBox())!.height).toBeLessThan(360);
      const complete = page.locator('#complete-examples');
      const summary = complete.locator(':scope > summary');
      await expect(complete).not.toHaveAttribute('open');
      expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(complete).toHaveAttribute('open', '');
      await expect(page.locator('#walkthrough-init')).toBeVisible();
      for (const label of await complete
        .locator('.example-switcher > label')
        .all())
        expect((await label.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await page.locator('#example-choice-init').focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#example-choice-adopt')).toBeChecked();
      await expect(page.locator('#walkthrough-adopt')).toBeVisible();
      await expect(page.locator('#walkthrough-init')).toBeHidden();
      await page
        .locator('#walkthrough-adopt [data-step="proposal"] summary')
        .click();
      await expect(
        page.locator('#walkthrough-adopt .proposal-diff'),
      ).toBeVisible();
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#walkthrough-adopt')).toBeHidden();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
    }
  }
  await context.close();
});
