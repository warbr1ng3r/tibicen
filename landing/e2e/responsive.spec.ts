import { test, expect, type Page } from '@playwright/test';

const widths = [
  280, 320, 360, 375, 390, 430, 480, 568, 639, 640, 641, 767, 768, 769, 899,
  900, 901, 1023, 1024, 1025, 1119, 1120, 1121, 1280, 1366, 1440, 1536, 1920,
  2560, 3840, 5120,
];

async function expectPageToFit(page: Page) {
  const layout = await page.evaluate(() => {
    const outside: string[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement!;
      // Tilted illustration text is measured before transforms below; hidden labels are intentional.
      if (
        !node.textContent?.trim() ||
        parent.closest('script, style, .sr-only, .skip-link, .repo-window') ||
        !parent.checkVisibility()
      )
        continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      if (
        [...range.getClientRects()].some(
          (rect) =>
            rect.width && (rect.left < -1 || rect.right > innerWidth + 1),
        )
      ) {
        outside.push(node.textContent.trim());
      }
    }
    return {
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      outside,
      crampedIllustration: [
        ...document.querySelectorAll<HTMLElement>(
          '.tree-name, .preview-project, .repo-status span',
        ),
      ]
        .filter((el) => el.clientWidth && el.scrollWidth > el.clientWidth + 1)
        .map((el) => el.textContent),
    };
  });
  expect(layout.scrollWidth, `Page overflow at ${layout.width}px`).toBe(
    layout.width,
  );
  expect(layout.outside, `Text outside viewport at ${layout.width}px`).toEqual(
    [],
  );
  expect(
    layout.crampedIllustration,
    `Illustration text clipped at ${layout.width}px`,
  ).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#language')).toHaveAttribute(
    'aria-controls',
    /.+/,
  );
});

test('whole page fits 31 widths, including both sides of layout breakpoints', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.locator('.preset-details > summary').click();
  await page.locator('.advanced > summary').click();
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await expectPageToFit(page);
  }
  expect(errors).toEqual([]);
});

for (const [width, height] of [
  [568, 320],
  [844, 390],
  [320, 225],
  [280, 500],
]) {
  test(`all menus remain usable in a ${width}x${height} window`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.locator('.preset-details > summary').click();
    for (const id of [
      'install-agent',
      'install-manager',
      'language',
      'kind',
      'style',
    ]) {
      const trigger = page.locator(`#${id}`);
      await trigger.click();
      const popup = page.getByRole('listbox');
      await expect(popup.locator('[data-highlighted]')).toBeFocused();
      await page.keyboard.press('End');
      const last = popup.getByRole('option').last();
      await expect(last).toBeFocused();
      const box = (await popup.boundingBox())!;
      const item = (await last.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
      expect(item.y).toBeGreaterThanOrEqual(box.y);
      expect(item.y + item.height).toBeLessThanOrEqual(box.y + box.height + 1);
      await page.keyboard.press('Enter');
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    }
  });
}

for (const scale of [2, 4]) {
  test(`page reflows at the CSS viewport equivalent of ${scale * 100}% desktop zoom`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 1280 / scale, height: 900 / scale },
      deviceScaleFactor: scale,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8372/');
    await expect(page.locator('#download-preset')).toBeEnabled();
    await page.locator('.preset-details > summary').click();
    await page.locator('.advanced > summary').click();
    await expectPageToFit(page);
    await page.locator('#download-preset').scrollIntoViewIfNeeded();
    await expect(page.locator('#download-preset')).toBeInViewport();
    await context.close();
  });
}

test('every FAQ answer remains readable on phone, tablet and desktop', async ({
  page,
}) => {
  for (const width of [390, 900, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const questions = page.locator('#faq details');
    expect(await questions.count()).toBeGreaterThan(0);
    for (const question of await questions.all()) {
      if (!(await question.evaluate((el: HTMLDetailsElement) => el.open)))
        await question.locator('summary').click();
      await expect(question.locator('p')).toBeVisible();
      await expect(page.locator('#faq details[open]')).toHaveCount(1);
      await expectPageToFit(page);
    }
  }
});

test('graph animates, resizes and stops for reduced motion', async ({
  page,
}) => {
  await page.evaluate(() => window.scrollTo(0, 0));
  const canvas = page.locator('.graph-background');
  await expect(canvas).toBeVisible();
  const still = await canvas.evaluate((el: HTMLCanvasElement) =>
    el.toDataURL(),
  );
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect
    .poll(async () =>
      canvas.evaluate(
        (el: HTMLCanvasElement, before) => el.toDataURL() !== before,
        still,
      ),
    )
    .toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await canvas.evaluate(async () => {
    for (let i = 0; i < 2; i++) await new Promise(requestAnimationFrame);
  });
  const stopped = await canvas.evaluate((el: HTMLCanvasElement) =>
    el.toDataURL(),
  );
  const afterFrames = await canvas.evaluate(async (el: HTMLCanvasElement) => {
    for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame);
    return el.toDataURL();
  });
  expect(afterFrames === stopped).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      canvas.evaluate(
        (el: HTMLCanvasElement) =>
          el.width / Math.min(2, devicePixelRatio) ===
          el.parentElement!.clientWidth,
      ),
    )
    .toBe(true);
});
