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

test('maintenance index freezes published release facts, not the current working payload', () => {
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
      {
        version: '1.0.0',
        publishedAtUtc: '2026-11-04T05:36:46Z',
        sourceCommit: '4c1be3ecc4126f1531030e51c4a8a56e9a292190',
        distributionCommit: 'e8532bba0582564c93e50de1f55174daaa9bbd34',
        manifest:
          '0bdcf606c644859120dbae065b04095a8f7bacedb39ec98508f72290cfc0bbb3',
        archives: [
          [
            'tibicen-1.0.0.tar.gz',
            '5bf57bd93f14d5443bfbd6e697e9020ebcd761ef9fc0e78e65a7934d97124eaa',
          ],
        ],
      },
      {
        version: '1.1.0',
        publishedAtUtc: '2026-11-04T21:02:42Z',
        sourceCommit: '3166be50a1a3979e600ea08b65694c9255dcb89a',
        distributionCommit: '7bbd953a020ac4ac4c7dfb99efa59f6e4b195026',
        manifest:
          'bf6d76cfddf7c41f071bb1f9c9f3633ab69070aeac38cd0fc246b583ad33ec0f',
        archives: [
          [
            'tibicen-1.1.0.tar.gz',
            'e285fbac490f586c277e7b037a9f193197e2a8ae1b84aeb196f8a85d465339ee',
          ],
        ],
      },
      {
        version: '1.2.0',
        publishedAtUtc: '2026-11-05T03:46:37Z',
        sourceCommit: 'fb80e78198e7fe12353fbe8f9319f84ac943f792',
        distributionCommit: '0656f12e00ea83d84229180d331f3178bf253407',
        manifest:
          '9c4853a038fec91a37ad430e50184ef3364e9ebb1f7569ff2010ba7a39cb70c5',
        archives: [
          [
            'tibicen-1.2.0.tar.gz',
            'fa33bdfbad280cba71b199671e280d71fcda1fc0b568b66130b0a1036aba47d9',
          ],
        ],
      },
      {
        version: '1.3.0',
        publishedAtUtc: '2026-11-05T19:34:40Z',
        sourceCommit: '797b96e5306da77e8acc54a28c8a6a8e85b3cfd7',
        distributionCommit: 'b61a19583dc91ee9e3e795250d733d2cc99e6569',
        manifest:
          'bf589996433f8eb46b83f87cd229fc6ead81af46f0ce50959e4c7c05525bee4d',
        archives: [
          [
            'tibicen-1.3.0.tar.gz',
            '86862c77462896229fac1dffd1877953f591a5362e4724b95c41a7ad791ba194',
          ],
        ],
      },
      {
        version: '1.4.0',
        publishedAtUtc: '2026-11-06T00:10:57Z',
        sourceCommit: 'dfc85d75698094d614ac66511c0b0c13fa54c0bf',
        distributionCommit: '7b3b08f58276034b1609e44ef393e5f7c0e01a1b',
        manifest:
          'ec1b4c75a0cef2dde8d4d12a29dc75de1ee1f8c01d16d72efec82a4891fb58ef',
        archives: [
          [
            'tibicen-1.4.0.tar.gz',
            '0b1df51d33c2e3b43cc5041ece30b397039d0b1c3f7f20c706014eb9b38e38d8',
          ],
        ],
      },
      {
        version: '1.4.1',
        publishedAtUtc: '2026-11-06T05:37:35Z',
        sourceCommit: '319845f1f1597817807c81579b42250a1f189e7d',
        distributionCommit: '52c0769574e90d7d1a0438996df9da40621b0107',
        manifest:
          '1ddbe0968918ac22469dbe3c0d8cd8f85c8d23910d2f623451957f804a4238fd',
        archives: [
          [
            'tibicen-1.4.1.tar.gz',
            'c3302cf25284120d009ee7b01c9044cdc0193c8c658597e0f24fe7e65233dcb8',
          ],
        ],
      },
      {
        version: '1.5.0',
        publishedAtUtc: '2026-11-06T22:43:22Z',
        sourceCommit: '1d0f8a0e65ee966cb3fbddef1bc0c128ed54d441',
        distributionCommit: '0706d7caf6a93b79a117379c1cd5f8cd95effb04',
        manifest:
          '58632f3a3505257768be7fd3219fd67357fccd1abc9d81efface633ce559587c',
        archives: [
          [
            'tibicen-1.5.0.tar.gz',
            'f6d5aa6f8dda0aef5f51ded9e711f534490d27ebdc289505fed73eef18fc2b46',
          ],
        ],
      },
      {
        version: '1.5.1',
        publishedAtUtc: '2026-11-07T17:33:16Z',
        sourceCommit: '210e786fdac4a7aa90b88cd34e223788f4f097dd',
        distributionCommit: '287ef7b22630482aca7996e5a0faad601cede778',
        manifest:
          '1c36d93471168d439f1540eac07fcde33916d096b860446d154b8973ea050961',
        archives: [
          [
            'tibicen-1.5.1.tar.gz',
            'eb2d256d2e30677e1c34476a5c52ab14ebc69bff0fc01577e3c3e9dc3ba2e9b9',
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

test('static maintenance bytes are preserved in the site build', async () => {
  const built = await readFile(
    new URL('../../landing/dist/maintenance/index.json', import.meta.url),
  );
  assert.deepEqual(built, bytes);
});
