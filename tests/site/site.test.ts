import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const site = new URL('../../landing/dist/', import.meta.url);
const basePath = (process.env.TIBICEN_SITE_BASE ?? '/').replace(/\/$/, '');
const origin = 'https://tibicen.invalid';
const pages = [
  { filename: 'index.html', route: '/', locale: 'en', other: 'ru' },
  { filename: 'ru/index.html', route: '/ru/', locale: 'ru', other: 'en' },
];

function idsIn(html: string) {
  return [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
}

async function localFile(url: URL) {
  assert.ok(
    url.pathname.startsWith(`${basePath}/`),
    `Static reference leaves the configured base: ${url.href}`,
  );
  const filename = decodeURIComponent(url.pathname.slice(basePath.length + 1));
  let file = new URL(filename || 'index.html', site);
  if ((await stat(file)).isDirectory()) {
    file = new URL(`${file.href.replace(/\/?$/, '/')}index.html`);
  }
  assert.ok(
    (await stat(file)).isFile(),
    `Missing static resource: ${url.href}`,
  );
  return file;
}

for (const { filename, route, locale, other } of pages) {
  test(`${locale}: preset answers cannot be submitted without JavaScript`, async () => {
    const html = await readFile(new URL(filename, site), 'utf8');
    const form = html.match(
      /<form\b[^>]*id="preset-form"[^>]*>([\s\S]*?)<\/form>/,
    )?.[1];
    assert.ok(form, 'Preset form must exist.');
    const submit = form.match(/<button\b[^>]*type="submit"[^>]*>/g);
    assert.equal(submit?.length, 1);
    assert.match(submit![0], /\bdisabled(?:[\s=>])/);
    assert.match(form, /<fieldset\b[^>]*id="preset-controls"[^>]*\bdisabled/);
    assert.match(html, /<details\s+class="preset-details"\s*>/);
  });

  test(`${locale}: static page language, first use and project exits are complete`, async () => {
    const html = await readFile(new URL(filename, site), 'utf8');
    assert.match(html, new RegExp(`<html\\b[^>]*lang="${locale}"`));
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = html.match(
      /<meta\b[^>]*name="description"[^>]*content="([^"]+)"/,
    )?.[1];
    assert.ok(title && description);
    if (locale === 'en') {
      assert.doesNotMatch(`${title} ${description}`, /[А-Яа-яЁё]/);
      assert.match(html, /Illustrative example/);
    } else {
      assert.match(`${title} ${description}`, /[А-Яа-яЁё]/);
      assert.match(html, /Пример результата/);
    }
    assert.match(html, new RegExp(`<a\\b[^>]*hreflang="${other}"`));
    const sections = ['start', 'workflow', 'result', 'faq', 'preset'].map(
      (id) => html.indexOf(`id="${id}"`),
    );
    assert.ok(sections.every((offset) => offset > 0));
    assert.deepEqual(
      sections,
      [...sections].sort((a, b) => a - b),
    );
    const firstUse = html.slice(sections[0], sections[1]);
    for (const id of [
      'install-command',
      'prompt-scenarios-0',
      'prompt-scenarios-1',
    ]) {
      assert.ok(
        firstUse.includes(`id="${id}"`),
        `${id} belongs in Get started.`,
      );
    }
    for (const target of [
      'https://github.com/warbr1ng3r/tibicen',
      'https://github.com/warbr1ng3r/tibicen/releases',
    ])
      assert.ok(
        html.includes(`href="${target}`),
        `Missing project exit: ${target}`,
      );
    assert.match(
      html,
      /href="https:\/\/github\.com\/warbr1ng3r\/tibicen\/(?:blob|tree)\/[^"#]+\/README\.md(?:#[^"]+)?"/,
    );
    assert.doesNotMatch(
      html,
      /href="[^"]+(?:README_ru\.md|\/docs\/[^"#]+_ru\.md)/,
    );
  });

  test(`${locale}: IDs, accessible associations, local resources and destination fragments resolve`, async () => {
    const html = await readFile(new URL(filename, site), 'utf8');
    const ids = idsIn(html);
    assert.equal(
      new Set(ids).size,
      ids.length,
      'Every element ID must be unique.',
    );
    for (const match of html.matchAll(
      /\b(?:for|aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g,
    )) {
      for (const id of match[1].split(/\s+/)) {
        assert.ok(ids.includes(id), `Accessible target is absent: ${id}`);
      }
    }
    const current = new URL(`${basePath}${route}`, origin);
    for (const tag of html.matchAll(/<([a-z][\w-]*)\b[^>]*>/gi)) {
      for (const match of tag[0].matchAll(/\b(src|href)="([^"]+)"/g)) {
        const reference = match[2].replaceAll('&amp;', '&');
        if (reference.startsWith('data:')) continue;
        const url = new URL(reference, current);
        if (url.origin !== origin) {
          assert.equal(
            tag[1],
            'a',
            'Only navigation links may use third-party URLs.',
          );
          assert.equal(match[1], 'href');
          continue;
        }
        const file = await localFile(url);
        if (url.hash && url.hash !== '#') {
          const destination = await readFile(file, 'utf8');
          assert.ok(
            idsIn(destination).includes(decodeURIComponent(url.hash.slice(1))),
            `Missing destination anchor: ${reference} from ${route}`,
          );
        }
      }
    }
  });
}
