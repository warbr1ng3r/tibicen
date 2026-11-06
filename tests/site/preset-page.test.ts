import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const site = new URL('../../landing/dist/', import.meta.url);
const basePath = (process.env.TIBICEN_SITE_BASE ?? '/').replace(/\/$/, '');

for (const locale of ['en', 'ru'] as const) {
  const languagePath = locale === 'ru' ? 'ru/' : '';
  const home = `${basePath}/${languagePath}`;
  const route = `${languagePath}preset/index.html`;

  test(`${locale}: dedicated preset page opens the local form without enabling native submission`, async () => {
    const html = await readFile(new URL(route, site), 'utf8');
    assert.match(html, new RegExp(`<html\\b[^>]*lang="${locale}"`));
    assert.match(html, /<h1\b[^>]*id="preset-title"/);
    assert.match(
      html,
      /<details\b[^>]*class="preset-details"[^>]*\bopen(?:[\s=>])/,
    );
    const form = html.match(
      /<form\b[^>]*id="preset-form"[^>]*>([\s\S]*?)<\/form>/,
    )?.[1];
    assert.ok(form, 'The dedicated page must contain the complete form.');
    assert.match(form, /<fieldset\b[^>]*id="preset-controls"[^>]*\bdisabled/);
    const submit = form.match(/<button\b[^>]*type="submit"[^>]*>/g);
    assert.equal(submit?.length, 1);
    assert.match(submit![0], /\bdisabled(?:[\s=>])/);
    assert.match(html, /<noscript>/);
    assert.match(
      html,
      locale === 'en' ? /No answers are sent/ : /Ответы никуда не отправляются/,
    );
    assert.doesNotMatch(html, /(?:https?:)?\/\/[^"<> ]+\/(?:submit|collect)/);
  });

  test(`${locale}: preset navigation preserves language, route kind and configured base`, async () => {
    const html = await readFile(new URL(route, site), 'utf8');
    for (const fragment of ['start', 'result', 'faq']) {
      assert.ok(html.includes(`href="${home}#${fragment}"`));
    }
    for (const [language, href] of [
      ['en', `${basePath}/preset/`],
      ['ru', `${basePath}/ru/preset/`],
    ]) {
      const link = html.match(
        new RegExp(`<a\\b[^>]*href="${href}"[^>]*hreflang="${language}"[^>]*>`),
      )?.[0];
      assert.ok(link, `Missing ${language} builder language link.`);
      assert.equal(link.includes('aria-current="page"'), language === locale);
    }
    assert.ok(html.includes('releases/tag/v1.4.1'));
    assert.ok(html.includes(`href="${basePath}/maintenance/index.json"`));
    assert.ok(html.includes(`href="${basePath}/licenses/astrowind.txt"`));
    assert.ok(html.includes(`href="${basePath}/licenses/starwind.txt"`));
    assert.equal([...html.matchAll(/\bid="main"/g)].length, 1);
    assert.equal([...html.matchAll(/\bid="copy-status"/g)].length, 1);
    assert.doesNotMatch(html, /\.geometry-preview|class="geometry-preview/);
  });
}
