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
      {
        version: '1.5.2',
        publishedAtUtc: '2026-11-07T23:27:53Z',
        sourceCommit: 'f5bc0a416813c54d3ec21e50f3f5ede0b4be2bb8',
        distributionCommit: 'df15ae7e0ae67aee2bd278f7e4f265e03437e672',
        manifest:
          '8f390700ee82bd04ce471826842e959dfdb57607a35d8870e78ebe491fc89666',
        archives: [
          [
            'tibicen-1.5.2.tar.gz',
            'b86c8bcdfe931907f2c1a050a55bbec20554720f0a3cb7dd19ea2034a11f14e8',
          ],
        ],
      },
      {
        version: '1.5.3',
        publishedAtUtc: '2026-11-08T21:38:42Z',
        sourceCommit: 'a86026a5bbc6e4eb0831ac8b76be08faf1891647',
        distributionCommit: 'b6fd86e8927c3640fe66be064da5a34e63ac366d',
        manifest:
          'c58657448cc2b58e161cc49c655b61f398493c998b7e50c2502e924ddcde143d',
        archives: [
          [
            'tibicen-1.5.3.tar.gz',
            '1636a3acf2580137c4deb53e47d6ef481fe1201473ded169e58c0471a56faefb',
          ],
        ],
      },
      {
        version: '1.5.4',
        publishedAtUtc: '2026-11-09T03:46:19Z',
        sourceCommit: '68a355e080b6323014837f8940ba79bcc3782b01',
        distributionCommit: '381c5d53972b53d60e9a134ec7f620bb7c35e6be',
        manifest:
          '0d4f3d3f581c136e47c1060dd436e02e2369132b658069cfc5dbde6f2ab9ea04',
        archives: [
          [
            'tibicen-1.5.4.tar.gz',
            'c74e097f41f0660f6c18afa306e12d0dadbf18778feceaefcff06f306760a8cb',
          ],
        ],
      },
      {
        version: '1.5.5',
        publishedAtUtc: '2026-11-15T05:56:57Z',
        sourceCommit: '963e46102a1b39d6e8a64cb9995a949bc1dcc505',
        distributionCommit: '6d4baea666fc2885c04ba0fa0fc60dbb8b4e6a74',
        manifest:
          '1a8a226193fadc7902853472551c3c691b1ecf38128d83be9930aa49667c23bf',
        archives: [
          [
            'tibicen-1.5.5.tar.gz',
            'b643d7fe9266dd12fd6b4693a4723ea30f2920e341b52778aaed1fbe77bc7559',
          ],
        ],
      },
      {
        version: '1.5.6',
        publishedAtUtc: '2026-11-16T00:15:51Z',
        sourceCommit: '1dc382d2f92a438ec69877134ecc5c821b20928c',
        distributionCommit: '2c7cb6f50a36d5fc3ca29a127e83b194d1e2a169',
        manifest:
          '797471c6f17b488581d5829e00b229c405a3bcb0622c596e75fb5b528ecab478',
        archives: [
          [
            'tibicen-1.5.6.tar.gz',
            '13ffe16fb15bdcf2daa8353b4315c5746c0667833403a86593e8089ff93ba36b',
          ],
        ],
      },
      {
        version: '1.6.0',
        publishedAtUtc: '2026-11-17T03:54:57Z',
        sourceCommit: 'b55123ca41d6c1fc4ef21e9a683b9c4686738e9d',
        distributionCommit: '29ab6308811c50304d61456011d1b7ec17b96c76',
        manifest:
          'f5009dbba05de5a1122c3d44cf06db8a1f64b62af1bc3156e673dc856fe9ca75',
        archives: [
          [
            'tibicen-1.6.0.tar.gz',
            'c5d41cd1bf5cee06824bacd6e2d69e39def5ee1b313c8535ee32fbe329245174',
          ],
        ],
      },
      {
        version: '1.7.0',
        publishedAtUtc: '2026-11-18T15:35:26Z',
        sourceCommit: '6eef592d9638a063cb2b49c33fe4843e601956dd',
        distributionCommit: 'd881334f638ccffa74bcc032a392451f5d5b8f52',
        manifest:
          '089afd976d09b0e83c03a69eb9ea75a4c14a180284fcffd8b2c2e2a0e9b0e91e',
        archives: [
          [
            'tibicen-1.7.0.tar.gz',
            '648bf3d2e06244f735690618f55b6358fa84c5518d3fc43efeb827c17e90577a',
          ],
        ],
      },
      {
        version: '1.7.1',
        publishedAtUtc: '2026-11-19T00:41:12Z',
        sourceCommit: '7896e21c8fc384a08a739bc3e7475f2a68e56406',
        distributionCommit: '9a5e1ef2eb837075bb79e2fb2db01f439343d28d',
        manifest:
          'dd4f09691a190a51432d2c372ed4733ba2973a3307ddb84874b23493d38dca8e',
        archives: [
          [
            'tibicen-1.7.1.tar.gz',
            '47865b8d23466170e02d8e9c649a0d39a170636dce2f0e4f83b11a80189e4e94',
          ],
        ],
      },
      {
        version: '1.8.0',
        publishedAtUtc: '2026-11-20T04:15:05Z',
        sourceCommit: 'ab509eccca659ac7a273540661974c882fb8908c',
        distributionCommit: 'a748ba3932e85f5194a3ea450c003f83bf8dcd9f',
        manifest:
          '86b5876b5c0c5cf5e61d1f598f3552e7447d3993fc45c83be1a6c833d30e7e29',
        archives: [
          [
            'tibicen-1.8.0.tar.gz',
            '2aad29f3a57bc2d93855fdc918eecd4daad478f595bac2673e4ef4705b4c672d',
          ],
        ],
      },
      {
        version: '1.8.1',
        publishedAtUtc: '2026-11-26T03:35:49Z',
        sourceCommit: 'bb5758d688c0cd61115c7f24c9d25006b1766651',
        distributionCommit: '3fab265ce311c8d2de9d8942da1b031f6aba49b3',
        manifest:
          '25cda5d8b181d67f85d058480f62ddf0e4b2e37c1bfb1b3513a28c9becfe5b69',
        archives: [
          [
            'tibicen-1.8.1.tar.gz',
            '90dd9b9634ceca7c8238d6e8ab85c5e73b3d9e603844b083404f0a1e1702c3cc',
          ],
        ],
      },
      {
        version: '1.8.2',
        publishedAtUtc: '2026-11-27T02:12:04Z',
        sourceCommit: '4e2257a5ceff9df62ce2709f0cdf0b86e0105cc2',
        distributionCommit: '2f151b9fb1b9a2a3553e374fbb0ba6ad5b02fbb5',
        manifest:
          '491e3cb133e7b7b197f68317170b3830562c6a1bf900830e3b8e8147c7a83481',
        archives: [
          [
            'tibicen-1.8.2.tar.gz',
            '27158c13d3d899c5c13755765634dff2e6f642a9ded04b1fd806a76bac71a4f2',
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
