import test from 'node:test';
import assert from 'node:assert/strict';
import { hashContent } from '../../scripts/core/contracts.ts';
import {
  checkPractices,
  OFFICIAL_SOURCES,
} from '../../scripts/discovery/practices.ts';

test('reads only selected agent sources and attaches dated structured evidence', async () => {
  const calls: { url: string; options: RequestInit }[] = [];
  const result = await checkPractices(
    { agents: ['codex'], agentVersions: { codex: '0.157.0' } },
    {
      now: '2026-10-21T00:00:00Z',
      fetch: async (url, options) => {
        calls.push({ url, options });
        return new Response(
          '# Project instructions\n\nKeep relevant instructions short and applicable to the project.\n\n```sh\ngit commit -am arbitrary\n```',
          { headers: { 'content-type': 'text/markdown' } },
        );
      },
    },
  );
  assert.equal(calls.length, 2);
  assert.deepEqual(
    calls.map((item) => item.url),
    OFFICIAL_SOURCES.codex,
  );
  assert.ok(
    calls.every(
      (item) =>
        item.options.redirect === 'error' &&
        !new Headers(item.options.headers).has('Authorization'),
    ),
  );
  assert.equal(result.practices[0].checkedAt, '2026-10-21T00:00:00.000Z');
  assert.equal(result.practices[0].agentVersion, '0.157.0');
  assert.equal(result.practices[0].status, 'checked');
  assert.equal(result.practices[0].evidence!.title, 'Project instructions');
  assert.equal(
    result.practices[0].evidence!.applicability,
    'requires-agent-assessment',
  );
  assert.equal(
    result.practices[0].evidence!.contentHash,
    hashContent(
      '# Project instructions\n\nKeep relevant instructions short and applicable to the project.\n\n```sh\ngit commit -am arbitrary\n```',
    ),
  );
  assert.deepEqual(result.gaps, []);
  assert.ok(!JSON.stringify(result).includes('git commit'));
});

test('partial and omitted version context retain explicit missing-version gaps', async () => {
  for (const agentVersions of [
    { codex: 'preview / 2026.11+local' },
    {},
    undefined,
  ]) {
    let calls = 0;
    const result = await checkPractices(
      { agents: ['codex', 'cursor'], agentVersions },
      {
        fetch: async () => {
          calls++;
          return new Response(
            '# Instructions\n\nUse relevant project guidance.',
          );
        },
      },
    );
    assert.equal(calls, 4);
    assert.deepEqual(
      result.gaps,
      (agentVersions?.codex ? ['cursor'] : ['codex', 'cursor']).map(
        (agent) => ({ agent, reason: 'agent-version-unverified' }),
      ),
    );
    assert.deepEqual(
      result.practices.map((entry) => entry.agentVersion),
      [agentVersions?.codex, agentVersions?.codex, undefined, undefined],
    );
  }
});

test('invalid version maps fail before any source read, including invalid later entries', async () => {
  let calls = 0;
  for (const agentVersions of [
    null,
    [],
    '0.157.0',
    1,
    false,
    { codex: null },
    { codex: 1 },
    { codex: {} },
    { codex: '' },
    { codex: ' \t ' },
    { codex: 'a'.repeat(101) },
    { codex: 'release\nnext' },
    { codex: 'release\u007f' },
    { codex: 'release\u0085' },
    { codex: 'valid', cursor: 'unselected' },
    { codex: 'valid', unknown: 'unsupported' },
    JSON.parse('{"codex":"valid","__proto__":"unsupported"}'),
  ])
    await assert.rejects(
      checkPractices(
        { agents: ['codex'], agentVersions },
        {
          fetch: async () => {
            calls++;
            throw new Error('Unexpected request');
          },
        },
      ),
      { code: 'invalid-agent-versions' },
    );
  assert.equal(calls, 0);
});

test('HTML scripts and executable page markup never reach extracted data', async () => {
  const result = await checkPractices(
    { agents: ['cursor'] },
    {
      fetch: async () =>
        new Response(
          '<html><title>Skills</title><script>secret payload; fetch("evil")</script><main><h1>Useful skills</h1><p>Use a focused workflow appropriate to your project and selected tools.</p></main></html>',
          { headers: { 'content-type': 'text/html' } },
        ),
    },
  );
  assert.ok(!JSON.stringify(result).includes('secret payload'));
  assert.ok(!JSON.stringify(result).includes('<script>'));
  assert.deepEqual(result.practices[0].evidence!.headings, ['Useful skills']);
  assert.equal(result.gaps[0].reason, 'agent-version-unverified');
});

test('denies unofficial hosts, source redirects and excess source counts', async () => {
  let calls = 0;
  const denied = await checkPractices(
    { agents: ['codex'] },
    {
      sources: { codex: ['https://evil.example/docs'] },
      fetch: async () => {
        calls++;
        throw new Error('Unexpected request');
      },
    },
  );
  assert.equal(calls, 0);
  assert.equal(denied.practices[0].reason, 'network-denied');
  const redirected = await checkPractices(
    { agents: ['codex'] },
    {
      sources: { codex: [OFFICIAL_SOURCES.codex[0]] },
      fetch: async () => ({
        ok: true,
        redirected: true,
        url: 'https://learn.chatgpt.com/other',
        text: async () => '',
      }),
    },
  );
  assert.equal(redirected.practices[0].reason, 'network-denied');
  await assert.rejects(
    checkPractices(
      { agents: ['codex'] },
      { sources: { codex: Array(3).fill(OFFICIAL_SOURCES.codex[0]) } },
    ),
    { code: 'source-request-limit' },
  );
});

test('partial source failure preserves successful evidence and its coverage gap', async () => {
  let count = 0;
  const result = await checkPractices(
    { agents: ['claude-code'], agentVersions: { 'claude-code': '2.0-local' } },
    {
      fetch: async () =>
        ++count === 1
          ? new Response('unavailable', { status: 503 })
          : new Response(
              '# Skills\n\nKeep only the workflows that have a purpose in the project.',
            ),
    },
  );
  assert.equal(result.practices[0].status, 'unverified');
  assert.equal(result.practices[0].agentVersion, '2.0-local');
  assert.equal(result.practices[0].evidence, undefined);
  assert.equal(result.practices[1].status, 'checked');
  assert.equal(count, 2);
  assert.deepEqual(result.gaps, [
    {
      source: OFFICIAL_SOURCES['claude-code'][0],
      agent: 'claude-code',
      reason: 'source-unavailable',
    },
  ]);
});

test('bounded streaming source reads stop oversized responses without excerpts', async () => {
  const result = await checkPractices(
    { agents: ['codex'] },
    {
      maxBytes: 100,
      fetch: async () => new Response('# Oversized\n' + 'a'.repeat(1000)),
    },
  );
  assert.ok(
    result.practices.every((item) => item.reason === 'source-too-large'),
  );
  assert.ok(result.practices.every((item) => !item.evidence));
});

test('no selected agent performs no reads', async () => {
  const result = await checkPractices(
    {},
    { fetch: () => assert.fail('Unexpected request') },
  );
  assert.deepEqual(result.practices, []);
});

test('selected unknown versions are context only and cause no source read', async () => {
  const result = await checkPractices(
    {
      agents: ['future-agent', 'constructor'],
      agentVersions: { 'future-agent': '1.2.3', constructor: 'local' },
    },
    { fetch: () => assert.fail('Unexpected request') },
  );
  assert.deepEqual(result, {
    schema: 1,
    practices: [],
    gaps: [
      { agent: 'future-agent', reason: 'unsupported-agent' },
      { agent: 'constructor', reason: 'unsupported-agent' },
    ],
  });
});

test('six-source budget preserves deterministic order, duplicate handling and withheld records', async () => {
  const agents = [
    'codex',
    'codex',
    'gemini-cli',
    'opencode',
    'copilot-cli',
    'aider',
  ];
  const selected = [...new Set(agents)];
  for (const fail of [false, true]) {
    const calls: string[] = [];
    const result = await checkPractices(
      {
        agents,
        agentVersions: Object.fromEntries(
          selected.map((id) => [id, 'caller-version']),
        ),
      },
      {
        fetch: async (url) => {
          calls.push(url);
          if (fail) throw new Error('Offline source failure');
          return new Response(
            '# Guidance\n\nUse only relevant project instructions.',
          );
        },
      },
    );
    const sources = selected.flatMap((id) => OFFICIAL_SOURCES[id]);
    assert.deepEqual(calls, sources.slice(0, 6));
    assert.equal(result.practices.length, sources.length);
    assert.deepEqual(
      result.practices
        .slice(6)
        .map(({ source, status, reason, agentVersion }) => ({
          source,
          status,
          reason,
          agentVersion,
        })),
      sources.slice(6).map((source) => ({
        source,
        status: 'unverified',
        reason: 'source-budget-exhausted',
        agentVersion: 'caller-version',
      })),
    );
    assert.ok(
      result.practices
        .slice(0, 6)
        .every(({ status, reason }) =>
          fail
            ? status === 'unverified' && reason === 'source-unavailable'
            : status === 'checked',
        ),
    );
    assert.equal(
      result.gaps.filter(({ reason }) => reason === 'source-budget-exhausted')
        .length,
      sources.length - 6,
    );
  }
});

test('all selection and source-count validation finishes before any read', async () => {
  let calls = 0;
  const fetch = async () => {
    calls++;
    return new Response('# Unexpected');
  };
  const sparse = ['codex'];
  sparse.length = 2;
  for (const agents of [
    ['codex', 'Uppercase'],
    ['codex', 'with_underscore'],
    ['codex', '-prefix'],
    ['codex', 'trailing-'],
    ['codex', 'two--hyphens'],
    ['codex', ''],
    ['codex', 'a'.repeat(65)],
    ['codex', null],
    ['codex', 1],
    ['codex', ...Array(16).fill('codex')],
    sparse,
  ])
    await assert.rejects(
      checkPractices({ agents: agents as string[] }, { fetch }),
      { code: 'invalid-agents' },
    );
  await assert.rejects(
    checkPractices(
      { agents: ['codex', 'opencode'] },
      {
        fetch,
        sources: { opencode: Array(3).fill(OFFICIAL_SOURCES.opencode[0]) },
      },
    ),
    { code: 'source-request-limit' },
  );
  assert.equal(calls, 0);
  const result = await checkPractices(
    { agents: Array(16).fill('future-agent') },
    { fetch },
  );
  assert.deepEqual(result.gaps, [
    { agent: 'future-agent', reason: 'unsupported-agent' },
  ]);
});

test('reviewed additional hosts preserve no-credentials and no-redirect request safeguards', async () => {
  for (const id of [
    'opencode',
    'gemini-cli',
    'copilot-cli',
    'aider',
    'zcode',
    'cline',
    'devin-local',
    'continue-ide',
    'roo-code',
    'windsurf',
  ]) {
    const result = await checkPractices(
      { agents: [id] },
      {
        fetch: async (url, options) => {
          assert.ok(OFFICIAL_SOURCES[id].includes(url));
          assert.equal(options.method, 'GET');
          assert.equal(options.redirect, 'error');
          assert.equal(
            new Headers(options.headers).has('Authorization'),
            false,
          );
          return new Response(
            '# Official guidance\n\nKeep relevant instructions explicit.',
          );
        },
      },
    );
    assert.ok(
      result.practices.every(({ status }) => status === 'checked'),
      id,
    );
  }
  for (const source of [
    'https://unreviewed.example/docs',
    'http://geminicli.com/docs/cli/skills/',
    'https://user:secret@geminicli.com/docs/cli/skills/',
    'https://geminicli.com:8443/docs/cli/skills/',
  ]) {
    const result = await checkPractices(
      { agents: ['gemini-cli'] },
      {
        sources: { 'gemini-cli': [source] },
        fetch: () => assert.fail('Unexpected request'),
      },
    );
    assert.equal(result.practices[0].reason, 'network-denied');
  }
});
