import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

for (const route of ['', 'ru/', 'preset/', 'ru/preset/']) {
  test(`legacy /${route}: fixed primary destination, HTML fallback and safe query/fragment forwarding`, async () => {
    const html = await readFile(
      new URL(`../../landing/legacy-pages/${route}index.html`, import.meta.url),
      'utf8',
    );
    const destination = `https://tibicen.pages.dev/${route}`;
    assert.ok(html.includes(`<link rel="canonical" href="${destination}"`));
    assert.ok(html.includes(`content="0; url=${destination}"`));
    assert.ok(html.includes(`<a href="${destination}">`));
    assert.ok(
      html.includes(`<html lang="${route.startsWith('ru/') ? 'ru' : 'en'}"`),
    );
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script);
    let redirected = '';
    runInNewContext(script, {
      URL,
      window: {
        location: {
          search: '?next=https://example.invalid/&preview=geometry',
          hash: '#start',
          replace: (value: string) => {
            redirected = value;
          },
        },
      },
    });
    assert.equal(
      redirected,
      `${destination}?next=https://example.invalid/&preview=geometry#start`,
    );
    assert.equal(new URL(redirected).origin, 'https://tibicen.pages.dev');
    assert.doesNotMatch(html, /<form|<iframe|<script[^>]+src=/);
  });
}
