import { test, expect } from '@playwright/test';

for (const locale of ['en', 'ru'] as const) {
  for (const width of [390, 320]) {
    test(`${locale}: first-use path fits ${width}px and mobile decoration is compact`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(locale === 'en' ? './' : 'ru/');
      await expect(page.locator('#install-controls')).toBeEnabled();
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
      await expect(page.locator('.preset-details')).not.toHaveAttribute('open');
      await expect(
        page.locator('#walkthrough-init [data-step="proposal"]'),
      ).toBeVisible();
      await expect(
        page.locator('#walkthrough-adopt [data-step="approval"]'),
      ).toBeVisible();
    });
  }
}
