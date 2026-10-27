import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const site = new URL('../../landing/dist/', import.meta.url);
const basePath = (process.env.TIBICEN_SITE_BASE ?? '/').replace(/\/$/, '');

test('preset form cannot submit answers to the host when JavaScript is disabled', async () => {
  const html = await readFile(new URL('index.html', site), 'utf8');
  const form = html.match(
    /<form\b[^>]*id="preset-form"[^>]*>([\s\S]*?)<\/form>/,
  )?.[1];
  assert.ok(form, 'Preset form must exist.');
  const submit = form.match(/<button\b[^>]*type="submit"[^>]*>/g);
  assert.equal(submit?.length, 1);
  assert.match(submit![0], /\bdisabled(?:[\s=>])/);
});

test('built Astro page is self-contained and every form label reaches a unique control', async () => {
  const html = await readFile(new URL('index.html', site), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(
    new Set(ids).size,
    ids.length,
    'Every element ID must be unique.',
  );
  for (const match of html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)) {
    assert.ok(ids.includes(match[1]), `Label target is absent: ${match[1]}`);
  }
  for (const tag of html.matchAll(/<([a-z][\w-]*)\b[^>]*>/gi)) {
    for (const match of tag[0].matchAll(/\b(src|href)="([^"]+)"/g)) {
      const reference = match[2];
      if (reference.startsWith('#')) {
        assert.ok(
          reference === '#' || ids.includes(reference.slice(1)),
          `Missing anchor: ${reference}`,
        );
        continue;
      }
      if (reference.startsWith('data:')) continue;
      if (/^[a-z]+:|^\/\//i.test(reference)) {
        assert.equal(
          tag[1],
          'a',
          'Only navigation links may use third-party URLs.',
        );
        assert.equal(match[1], 'href');
        continue;
      }
      const url = new URL(reference, `https://tibicen.invalid${basePath}/`);
      assert.ok(
        url.pathname.startsWith(`${basePath}/`),
        `Static resource leaves the configured base: ${reference}`,
      );
      const filename = url.pathname.slice(basePath.length + 1) || 'index.html';
      assert.ok(
        (await stat(new URL(filename, site))).isFile(),
        `Missing static resource: ${reference}`,
      );
    }
  }
});
