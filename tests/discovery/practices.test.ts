import test from 'node:test';
import assert from 'node:assert/strict';
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
  assert.ok(!JSON.stringify(result).includes('git commit'));
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
    { agents: ['claude-code'] },
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
  assert.equal(result.practices[1].status, 'checked');
  assert.ok(result.gaps.some((gap) => gap.reason === 'source-unavailable'));
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
