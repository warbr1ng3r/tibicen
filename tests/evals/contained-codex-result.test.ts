import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  mkdir,
  lstat,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';

test('native caller preserves validation, terminal failure and cleanup results', async (t) => {
  for (const mode of [
    'completed',
    'tool-failure',
    'validation-unavailable',
    'error-first',
    'turn-failed-first',
    'callback-throws',
  ]) {
    await t.test(mode, async (t) => {
      const root = await realpath(await mkdtemp('/tmp/tibicen-caller-result-'));
      t.after(() => rm(root, { recursive: true, force: true }));
      const runner = path.join(root, 'scripts/evals/contained-codex.ts');
      const stubs = `
        import assert from 'node:assert/strict';
        const mode = ${JSON.stringify(mode)};
        const terminalFailure = ['error-first', 'turn-failed-first', 'callback-throws'].includes(mode);
        const privateMarker = 'SYNTHETIC PRIVATE TERMINAL DETAILS';
        export const fixtureState = { stops: 0, stopReasons: [], disposed: false };
        export { assert };
        export const digest = () => 'a'.repeat(64);
        export { hashContent } from ${JSON.stringify(new URL('../../scripts/core/contracts.ts', import.meta.url).href)};
        export const linuxCodeModeHost = 'unused';
        export const linuxCodeModeHash = 'unused';
        export const stageContainerCodeMode = () => { throw Error('Must not stage'); };
        export const readAccessOnlySubscriptionAuth = () => { throw Error('Must not read auth'); };
        export const accessOnlySubscriptionAuth = readAccessOnlySubscriptionAuth;
        export const validateContainerOutputSchema = value => value;
        export const generateContainerCodexHome = async () => ({
          argv: [], env: {}, validate: async () => {},
        });
        export { parseCodex } from ${JSON.stringify(new URL('../../scripts/evals/profiles/codex/profile.ts', import.meta.url).href)};
        export function createProcessSupervisor() {
          const controller = new AbortController();
          return {
            signal: controller.signal, cancel: () => controller.abort(),
            dispose() { fixtureState.disposed = true; },
            async run(command) {
              const error = { type: 'error', message: privateMarker };
              const failed = { type: 'turn.failed', error: { message: privateMarker } };
              const records = [
                { type: 'thread.started', thread_id: 'inert-fixture' },
                { type: 'turn.started' },
                ...(terminalFailure
                  ? mode === 'turn-failed-first' ? [failed, error] : [error, failed]
                  : [{ type: 'item.completed', item: { type: 'agent_message', text: 'offline completion' } }]),
                { type: 'turn.completed', usage: { input_tokens: 0, output_tokens: 0 } },
              ];
              const stdout = records.map(record => JSON.stringify(record)).join('\\n') + '\\n';
              command.onStdout(stdout, {
                stop() { fixtureState.stops++; },
                deadlineIn() {},
              });
              return { status: 0, stdout, stderr: '', timedOut: false, spawnError: false };
            },
          };
        }
        export async function inspectContainedCodexProfile(input) {
          let checks = 0;
          return {
            specification: {}, imageId: input.imageId, imageHash: 'image', binaryHash: input.binaryHash,
            sourceHashes: {}, workspace: input.workspace, filesHash: 'files', resultPaths: input.resultPaths,
            async validate() {
              if (++checks !== 3) return;
              if (mode === 'validation-unavailable') throw Error('PRIVATE VALIDATION MESSAGE');
              assert(!input.signal.aborted, 'contained-codex-cancelled');
            },
          };
        }
        export async function createContainerOwner() {
          let finish;
          const finished = new Promise(resolve => { finish = resolve; });
          const receipt = {
            cid: 'inert-fixture', reason: mode === 'tool-failure' ? mode : 'host-finished',
            stopped: true, removed: true, files: {}, modes: {},
            toolFailure: mode === 'tool-failure' ? { kind: 'rpc-error', code: -32000 } : null,
          };
          return {
            manifestPath: 'inert-fixture', session: { failure: new Promise(() => {}) }, finished,
            async stop(_paths, reason) { fixtureState.stopReasons.push(reason); finish(receipt); return receipt; },
          };
        }
      `;
      const modules = {
        'scripts/evals/contained-codex.ts': await readFile(
          new URL('../../scripts/evals/contained-codex.ts', import.meta.url),
        ),
        'scripts/fixture.ts': stubs,
        'scripts/core/contracts.ts': "export * from '../fixture.ts';",
        ...Object.fromEntries(
          [
            'container/codex-config',
            'container/owner',
            'container/subscription',
            'container/code-mode',
            'profiles/codex/contained',
            'profiles/codex/profile',
            'process-supervisor',
          ].map((name) => [
            `scripts/evals/${name}.ts`,
            `export * from '${name.startsWith('profiles/') ? '../../../' : name.startsWith('container/') ? '../../' : '../'}fixture.ts';`,
          ]),
        ),
      };
      for (const [name, content] of Object.entries(modules)) {
        const filename = path.join(root, name);
        await mkdir(path.dirname(filename), { recursive: true });
        await writeFile(filename, content);
      }
      const module = (await import(
        pathToFileURL(runner).href
      )) as typeof import('../../scripts/evals/contained-codex.ts');
      const { fixtureState } = await import(
        pathToFileURL(path.join(root, 'scripts/fixture.ts')).href
      );
      const terminalFailure = [
        'error-first',
        'turn-failed-first',
        'callback-throws',
      ].includes(mode);
      const observed: { record: Record<string, unknown>; stopped: boolean }[] =
        [];
      const result = await module.runContainedCodexSession({
        binary: '/never-execute',
        binaryHash: 'a'.repeat(64),
        imageId: 'inert-fixture',
        workspace: path.join(root, 'project'),
        home: path.join(root, 'home'),
        files: { 'seed.txt': Buffer.from('seed') },
        resultPaths: ['seed.txt'],
        model: 'gpt-5.5',
        deadlineMs: 10000,
        prompt: 'offline fixture',
        route: { kind: 'synthetic', baseUrl: 'http://127.0.0.1:1/v1' },
        onRecord(record) {
          observed.push({ record, stopped: fixtureState.stops > 0 });
          if (mode === 'callback-throws' && record.type === 'error')
            throw new Error('SYNTHETIC PRIVATE CALLBACK DETAILS');
        },
      });
      assert.equal(
        result.sourceUnchanged,
        ['tool-failure', 'validation-unavailable'].includes(mode) ? null : true,
      );
      assert.equal(result.pass, mode === 'completed');
      assert.equal(result.parsed.completed, true);
      const terminal = observed.filter(({ record }) =>
        ['error', 'turn.failed'].includes(String(record.type)),
      );
      if (terminalFailure) {
        assert.deepEqual(
          terminal.map(({ record, stopped }) => ({
            type: record.type,
            stopped,
          })),
          [
            {
              type: mode === 'turn-failed-first' ? 'turn.failed' : 'error',
              stopped: true,
            },
          ],
        );
        assert.deepEqual(
          terminal[0].record,
          result.parsed.records.find(
            (record) => record.type === terminal[0].record.type,
          ),
        );
        assert.deepEqual(Object.keys(terminal[0].record).sort(), [
          'detailHash',
          'type',
        ]);
        assert(fixtureState.stops >= 1);
      } else {
        assert.equal(terminal.length, 0);
        assert.equal(fixtureState.stops, 0);
        assert.deepEqual(
          observed.map(({ record }) => record.type),
          [
            'thread.started',
            'turn.started',
            'item.completed',
            'turn.completed',
          ],
        );
      }
      assert.deepEqual(fixtureState.stopReasons, [
        'host-finished',
        'caller-finally',
      ]);
      assert.equal(fixtureState.disposed, true);
      await assert.rejects(lstat(path.join(root, 'home')), { code: 'ENOENT' });
      const saved = path.join(root, 'result.json');
      await writeFile(saved, JSON.stringify(result));
      const eventLog = path.join(root, 'events.json');
      await writeFile(eventLog, JSON.stringify(observed));
      for (const marker of [
        'SYNTHETIC PRIVATE TERMINAL DETAILS',
        'SYNTHETIC PRIVATE CALLBACK DETAILS',
      ]) {
        assert.equal(JSON.stringify(result.parsed).includes(marker), false);
        assert.equal(JSON.stringify(result).includes(marker), false);
        assert.equal(JSON.stringify(observed).includes(marker), false);
        assert.equal((await readFile(saved, 'utf8')).includes(marker), false);
        assert.equal(
          (await readFile(eventLog, 'utf8')).includes(marker),
          false,
        );
      }
      assert.deepEqual(
        result.receipt.toolFailure,
        mode === 'tool-failure' ? { kind: 'rpc-error', code: -32000 } : null,
      );
      assert.equal(
        JSON.stringify(result).includes('PRIVATE VALIDATION MESSAGE'),
        false,
      );
    });
  }
});
