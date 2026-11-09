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
  test(`${locale}: the static hero groups optional setup without promising fixed paths`, async () => {
    const html = await readFile(new URL(filename, site), 'utf8');
    const preview = html.match(
      /<figure\b[^>]*id="example"[\s\S]*?<\/figure>/,
    )?.[0];
    assert.ok(preview);
    assert.doesNotMatch(
      preview,
      /<input|<button|preview-(?:before|proposal|after)|MEMORY\.md|\.agents\//,
    );
    for (const name of [
      'next-good-idea',
      'AGENTS.md',
      '.tibicen/',
      'src/ · tests/ · data/',
      'MCP',
    ])
      assert.ok(preview.includes(name), name);
    assert.equal([...preview.matchAll(/class="optional-setup"/g)].length, 1);
    assert.match(preview, /M21 9\.6V7\.8/);
    for (const text of locale === 'en'
      ? [
          'example',
          'Optional',
          'chosen for your project',
          'Memory',
          'Skills',
          'setup history',
          'unchanged',
          'Only the setup your project needs.',
        ]
      : [
          'пример',
          'При необходимости',
          'под ваш проект',
          'Память',
          'Скиллы',
          'история настройки',
          'без изменений',
          'Только то, что нужно вашему проекту.',
        ])
      assert.ok(preview.includes(text), text);
  });

  test(`${locale}: distinct workflow and scope visuals keep full examples in native disclosure`, async () => {
    const html = await readFile(new URL(filename, site), 'utf8');
    const result = html.slice(
      html.indexOf('id="result"'),
      html.indexOf('id="faq"'),
    );
    assert.match(result, /class="setup-dialog"/);
    assert.match(result, /class="proposal-paper"/);
    assert.match(
      result,
      /<details\b[^>]*class="detailed-examples"[^>]*id="complete-examples"[^>]*>/,
    );
    assert.doesNotMatch(
      result,
      /<details\b[^>]*id="complete-examples"[^>]*\bopen|next-good-idea|dialog-options|prototype-switcher|data-move/,
    );
    assert.ok(
      result.indexOf('id="complete-examples"') <
        result.indexOf('id="setup-scope"'),
    );
    assert.equal([...result.matchAll(/class="module-grid"/g)].length, 1);
    for (const text of locale === 'en'
      ? [
          'Ask in your own words.',
          'Set this up for my agent.',
          'One possible proposal',
          'Review the plan. Approve the changes.',
          'after your approval',
          'Optional · add only what helps',
          'Your application files are preserved.',
        ]
      : [
          'Попросите своими словами.',
          'Настрой проект для моего агента.',
          'Один из возможных планов',
          'Посмотрите план. Согласуйте изменения.',
          'после вашего согласия',
          'Необязательно · только если полезно',
          'Файлы приложения сохраняются.',
        ])
      assert.ok(result.includes(text), text);
    for (const kind of ['init', 'adopt'])
      assert.match(
        result,
        new RegExp(`<input\\b[^>]*id="example-choice-${kind}"`),
      );
  });

  test(`${locale}: the home links to a secondary preset without adding form controls`, async () => {
    const html = await readFile(new URL(filename, site), 'utf8');
    assert.doesNotMatch(html, /id="preset-form"|id="install-controls"/);
    assert.ok(html.includes(`href="${basePath}${route}preset/"`));
  });

  test(`${locale}: static page language, first use and project exits are complete`, async () => {
    const html = await readFile(new URL(filename, site), 'utf8');
    assert.match(html, new RegExp(`<html\\b[^>]*lang="${locale}"`));
    assert.match(html, /Tibicen 1\.5\.4/);
    assert.ok(
      html.includes(
        'https://github.com/warbr1ng3r/tibicen/tree/381c5d53972b53d60e9a134ec7f620bb7c35e6be',
      ),
      'The default installation must pin the 1.5.4 distribution commit.',
    );
    assert.match(
      html,
      /skills@1\.7\.4 add [^<]+ -g --agent universal --skill tibicen-init tibicen-adopt --copy/,
    );
    assert.doesNotMatch(html, /id="install-agent/);
    for (const skill of ['tibicen-init', 'tibicen-adopt'])
      assert.ok(html.includes(`~/.agents/skills/${skill}/SKILL.md`));
    assert.match(html, /INSTALLATION\.md#manual-archive-installation/);
    assert.ok(
      html.includes(
        'href="https://github.com/warbr1ng3r/tibicen/releases/tag/v1.5.4"',
      ),
      'Release notes must describe the installed version.',
    );
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
      assert.match(html, /Учебные примеры/);
    }
    assert.match(html, new RegExp(`<a\\b[^>]*hreflang="${other}"`));
    const sections = ['start', 'result', 'setup-scope', 'faq', 'preset'].map(
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

  test(`${locale}: first use shows the route, visible limits and recovery before optional preferences`, async () => {
    const html = await readFile(new URL(filename, site), 'utf8');
    const start = html.slice(
      html.indexOf('id="start"'),
      html.indexOf('id="result"'),
    );
    const route = ['1. Run this in your terminal', '2. Send one request'];
    const translatedRoute = [
      '1. Выполните в терминале',
      '2. Отправьте один запрос',
    ];
    const positions = (locale === 'en' ? route : translatedRoute).map((label) =>
      start.indexOf(label),
    );
    assert.ok(positions.every((offset) => offset >= 0));
    assert.deepEqual(
      positions,
      [...positions].sort((a, b) => a - b),
    );
    const visibleWarning = start.match(
      /<p\s+class="support-note">([\s\S]*?)<\/p>/,
    )?.[1];
    assert.ok(visibleWarning);
    assert.match(visibleWarning, /Windows/);
    assert.match(
      visibleWarning,
      locale === 'en' ? /experimental/ : /экспериментальна/,
    );
    assert.ok(
      start.indexOf(visibleWarning) < start.indexOf('id="install-command"'),
    );
    for (const id of ['compatibility', 'skill-help']) {
      assert.match(start, new RegExp(`<details\\b[^>]*id="${id}"[^>]*>`));
    }
    assert.match(start, /docs\/INSTALLATION\.md/);
    assert.match(
      start,
      locale === 'en' ? /assisted loading/ : /ручная загрузка/,
    );
  });

  test(`${locale}: illustrative init and adopt show context, exact proposal, approval and bounded result`, async () => {
    const html = await readFile(new URL(filename, site), 'utf8');
    const result = html.slice(
      html.indexOf('id="result"'),
      html.indexOf('id="faq"'),
    );
    assert.match(
      result,
      locale === 'en' ? /not recorded runs/ : /не записи прогонов/,
    );
    for (const kind of ['init', 'adopt']) {
      const example = result.match(
        new RegExp(
          `<article\\b[^>]*id="walkthrough-${kind}"[^>]*>([\\s\\S]*?)<\\/article>`,
        ),
      )?.[1];
      assert.ok(example, `Missing ${kind} walkthrough.`);
      assert.deepEqual(
        [...example.matchAll(/data-step="([^"]+)"/g)].map((match) => match[1]),
        ['before', 'request', 'inspect', 'proposal', 'approval', 'result'],
      );
      for (const retained of ['src/', 'tests/', 'package.json', 'AGENTS.md']) {
        assert.ok(
          example.includes(retained),
          `Missing project context: ${retained}`,
        );
      }
      assert.match(example, /class="proposal-diff"/);
      assert.match(
        example,
        locale === 'en' ? /No question needed/ : /Вопрос не нужен/,
      );
      assert.match(
        example,
        locale === 'en' ? /next agent session/ : /следующей сессии агента/,
      );
      assert.match(example, /\.tibicen\/manifest\.yml/);
      if (kind === 'adopt') {
        assert.match(example, /npm run test:old/);
        assert.match(example, /npm test/);
        assert.match(
          example,
          locale === 'en'
            ? /Ask before adding dependencies/
            : /Спрашивай перед добавлением зависимостей/,
        );
      }
    }
    assert.doesNotMatch(result, /project-memory|\.agents\/memory\.md|1\.1\.0/);
  });
}

for (const { filename, route } of [
  ...pages,
  { filename: 'preset/index.html', route: '/preset/' },
  { filename: 'ru/preset/index.html', route: '/ru/preset/' },
]) {
  test(`${route}: IDs, accessible associations, local resources and destination fragments resolve`, async () => {
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
