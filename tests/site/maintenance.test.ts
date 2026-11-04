import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

type Asset = { url: string; sha256: string };
type Version = {
  version: string;
  publishedAtUtc: string;
  sourceCommit: string;
  distributionCommit: string;
  scope: string;
  payloadManifest: Asset;
  archives: (Asset & { name: string })[];
  releaseNotes: string;
};
type Warning = {
  id: string;
  publishedAtUtc: string;
  affectedVersions: string[];
  message: string;
  supersedingVersion?: string | null;
  supersedesWarning?: string | null;
};
type Index = {
  schema: number;
  channel: string;
  independence: string;
  versions: Version[];
  warnings: Warning[];
};

const source = new URL(
  '../../landing/public/maintenance/index.json',
  import.meta.url,
);
const bytes = await readFile(source);
const index: Index = JSON.parse(bytes.toString());
const repository = 'https://github.com/warbr1ng3r/tibicen';

function validate(value: Index, previous?: Index) {
  const unique = (values: string[]) => {
    assert.equal(new Set(values).size, values.length);
  };
  const digest = (value: string, length: number) => {
    assert.match(value, new RegExp('^[0-9a-f]{' + length + '}$'));
    assert.notEqual(value, '0'.repeat(length));
  };
  const date = (value: string) => {
    assert.match(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    const parsed = Date.parse(value);
    assert.ok(Number.isFinite(parsed) && parsed <= Date.now());
    assert.equal(new Date(parsed).toISOString(), value.replace('Z', '.000Z'));
  };
  assert.doesNotMatch(
    JSON.stringify(value),
    /<[^>]+>|"(?:TODO|TBD|UNPUBLISHED TEMPLATE)"/i,
  );
  assert.deepEqual(Object.keys(value).sort(), [
    'channel',
    'independence',
    'schema',
    'versions',
    'warnings',
  ]);
  assert.equal(value.schema, 1);
  assert.equal(
    value.channel,
    'https://warbr1ng3r.github.io/tibicen/maintenance/index.json',
  );
  assert.match(value.independence, /shared GitHub administration/);
  assert.ok(Array.isArray(value.versions) && value.versions.length > 0);
  assert.ok(Array.isArray(value.warnings));
  unique(value.versions.map((record) => record.version));
  unique(value.warnings.map((record) => record.id));
  for (const record of value.versions) {
    assert.deepEqual(Object.keys(record).sort(), [
      'archives',
      'distributionCommit',
      'payloadManifest',
      'publishedAtUtc',
      'releaseNotes',
      'scope',
      'sourceCommit',
      'version',
    ]);
    assert.match(record.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
    date(record.publishedAtUtc);
    digest(record.sourceCommit, 40);
    digest(record.distributionCommit, 40);
    assert.ok(record.scope.trim());
    const release = repository + '/releases/';
    const download = release + 'download/v' + record.version + '/';
    assert.equal(record.releaseNotes, release + 'tag/v' + record.version);
    assert.equal(
      record.payloadManifest.url,
      download + 'distribution-SHA256SUMS',
    );
    assert.deepEqual(Object.keys(record.payloadManifest).sort(), [
      'sha256',
      'url',
    ]);
    digest(record.payloadManifest.sha256, 64);
    assert.ok(Array.isArray(record.archives) && record.archives.length > 0);
    unique(record.archives.map((asset) => asset.name));
    for (const asset of record.archives) {
      assert.deepEqual(Object.keys(asset).sort(), ['name', 'sha256', 'url']);
      assert.match(asset.name, /^[A-Za-z0-9][A-Za-z0-9._-]*$/);
      assert.equal(asset.url, download + asset.name);
      digest(asset.sha256, 64);
    }
  }
  const versions = new Set(value.versions.map((record) => record.version));
  const earlierWarnings = new Set<string>();
  for (const warning of value.warnings) {
    assert.ok(
      Object.keys(warning).every((key) =>
        [
          'id',
          'publishedAtUtc',
          'affectedVersions',
          'message',
          'supersedingVersion',
          'supersedesWarning',
        ].includes(key),
      ),
    );
    assert.match(warning.id, /^[a-z0-9][a-z0-9-]*$/);
    date(warning.publishedAtUtc);
    assert.ok(warning.message.trim());
    assert.ok(
      Array.isArray(warning.affectedVersions) &&
        warning.affectedVersions.length > 0,
    );
    unique(warning.affectedVersions);
    assert.ok(
      warning.affectedVersions.every((version) => versions.has(version)),
    );
    if (warning.supersedingVersion != null)
      assert.ok(versions.has(warning.supersedingVersion));
    if (warning.supersedesWarning != null)
      assert.ok(earlierWarnings.has(warning.supersedesWarning));
    earlierWarnings.add(warning.id);
  }
  if (previous) {
    assert.deepEqual(
      value.versions.slice(0, previous.versions.length),
      previous.versions,
    );
    assert.deepEqual(
      value.warnings.slice(0, previous.warnings.length),
      previous.warnings,
    );
  }
}

test('maintenance index freezes the original published alpha facts, not the current working payload', () => {
  validate(index);
  assert.deepEqual(
    index.versions.map((record) => ({
      version: record.version,
      publishedAtUtc: record.publishedAtUtc,
      sourceCommit: record.sourceCommit,
      distributionCommit: record.distributionCommit,
      manifest: record.payloadManifest.sha256,
      archives: record.archives.map((asset) => [asset.name, asset.sha256]),
    })),
    [
      {
        version: '0.1.0-alpha.1',
        publishedAtUtc: '2026-10-27T02:23:50Z',
        sourceCommit: 'e0f59a55c7ce7581e402c3e270aa162fa1e0dc52',
        distributionCommit: 'db03ebc988af1e38ea9f62c02027945ba40660fc',
        manifest:
          '35f743a56b47e4f25743da5d6b6a1e606fb719b3382372384124094711e1b2dc',
        archives: [
          [
            'tibicen-0.1.0-alpha.1.tar.gz',
            '95d62ec9b8a2fdf78a47122a9fd8c16d58bbb8a6d2a2af564db4b3006e6bb606',
          ],
        ],
      },
    ],
  );
  assert.match(index.versions[0].scope, /Limited alpha/);
  assert.match(index.versions[0].scope, /Full technical MVP.*remain open/);
  assert.match(index.versions[0].scope, /benefit is unmeasured/);
  assert.deepEqual(index.warnings, []);
});

test('maintenance checks reject incomplete, placeholder, duplicate and future data', () => {
  const mutations: ((copy: Index) => void)[] = [
    (copy) => {
      copy.versions[0].sourceCommit = '<source>';
    },
    (copy) => {
      copy.versions[0].payloadManifest.sha256 = '0'.repeat(64);
    },
    (copy) => {
      copy.versions[0].archives = [];
    },
    (copy) => {
      copy.versions[0].scope = 'TODO';
    },
    (copy) => {
      copy.versions[0].archives[0].url = 'javascript:alert(1)';
    },
    (copy) => {
      copy.versions[0].publishedAtUtc = '2099-01-01T00:00:00Z';
    },
    (copy) => {
      copy.versions.push(structuredClone(copy.versions[0]));
    },
  ];
  for (const mutate of mutations) {
    const copy = structuredClone(index);
    mutate(copy);
    assert.throws(() => validate(copy));
  }
});

test('warnings append without rewriting records and cannot use dangling or forward references', () => {
  const next = structuredClone(index);
  next.warnings.push({
    id: 'synthetic-test-only',
    publishedAtUtc: index.versions[0].publishedAtUtc,
    affectedVersions: [index.versions[0].version],
    message: 'Synthetic test fixture: retain the pinned original hashes.',
  });
  validate(next, index);
  const changed = structuredClone(next);
  changed.versions[0].scope = 'Changed historical record';
  assert.throws(() => validate(changed, index));
  for (const field of ['supersedingVersion', 'supersedesWarning'] as const) {
    const dangling = structuredClone(next);
    dangling.warnings[0][field] = 'not-published';
    assert.throws(() => validate(dangling));
  }
  const duplicate = structuredClone(next);
  duplicate.warnings.push(structuredClone(duplicate.warnings[0]));
  assert.throws(() => validate(duplicate));
  const forward = structuredClone(next);
  forward.warnings.push({ ...forward.warnings[0], id: 'later-test-only' });
  forward.warnings[0].supersedesWarning = 'later-test-only';
  assert.throws(() => validate(forward));
  const rewrite = structuredClone(next);
  rewrite.warnings[0].message = 'Rewritten old warning';
  assert.throws(() => validate(rewrite, next));
});

test('static maintenance bytes and both locale links survive the configured site base', async () => {
  const built = await readFile(
    new URL('../../landing/dist/maintenance/index.json', import.meta.url),
  );
  assert.deepEqual(built, bytes);
  const base = (process.env.TIBICEN_SITE_BASE ?? '/').replace(/\/$/, '');
  for (const name of ['index.html', 'ru/index.html']) {
    const html = await readFile(
      new URL('../../landing/dist/' + name, import.meta.url),
      'utf8',
    );
    assert.ok(html.includes('href="' + base + '/maintenance/index.json"'));
  }
});
