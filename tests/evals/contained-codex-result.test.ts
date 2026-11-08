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

const ordinaryCommands = {
  'ordinary-command-recovery': { status: 'failed', exit_code: 1 },
  'ordinary-completed-command-recovery': {
    status: 'completed',
    exit_code: 127,
  },
  'ordinary-failed-zero-recovery': { status: 'failed', exit_code: 0 },
  'ordinary-minimum-i32-recovery': {
    status: 'failed',
    exit_code: -2147483648,
  },
  'ordinary-maximum-i32-recovery': {
    status: 'failed',
    exit_code: 2147483647,
  },
};
const commandItem = {
  id: 'cmd-1',
  type: 'command_execution',
  command: 'node --test',
  aggregated_output: 'synthetic red test',
  exit_code: 1,
  status: 'failed',
};
const terminalItems = {
  'failed-file-change': { type: 'file_change', status: 'failed', changes: [] },
  'declined-command': { ...commandItem, status: 'declined' },
  'cancelled-command': { ...commandItem, status: 'cancelled' },
  'null-command-outcome': { ...commandItem, exit_code: null },
  'missing-command-outcome': { ...commandItem, exit_code: undefined },
  'missing-command-text': { ...commandItem, command: undefined },
  'nonstr-command-text': { ...commandItem, command: 17 },
  'missing-command-output': { ...commandItem, aggregated_output: undefined },
  'nonstr-command-output': { ...commandItem, aggregated_output: {} },
  'nonnumeric-command-exit': { ...commandItem, exit_code: '1' },
  'fractional-command-exit': { ...commandItem, exit_code: 1.5 },
  'command-exit-below-i32': { ...commandItem, exit_code: -2147483649 },
  'command-exit-above-i32': { ...commandItem, exit_code: 2147483648 },
  'missing-command-status': { ...commandItem, status: undefined },
  'unknown-command-status': { ...commandItem, status: 'unknown' },
  'in-progress-completed-item': { ...commandItem, status: 'in_progress' },
};

test('native caller preserves validation, terminal failure and cleanup results', async (t) => {
  for (const mode of [
    'completed',
    'tool-failure',
    'validation-unavailable',
    'error-first',
    'turn-failed-first',
    'callback-throws',
    'generic-error-recovery',
    'error-only',
    'error-nonzero-exit',
    'error-401',
    'error-403',
    ...Object.keys(ordinaryCommands),
    ...Object.keys(terminalItems),
  ]) {
    await t.test(mode, async (t) => {
      const ordinary = ordinaryCommands[mode as keyof typeof ordinaryCommands];
      const terminalItem = terminalItems[mode as keyof typeof terminalItems];
      const root = await realpath(await mkdtemp('/tmp/tibicen-caller-result-'));
      t.after(() => rm(root, { recursive: true, force: true }));
      const runner = path.join(root, 'scripts/evals/contained-codex.ts');
      const stubs = `
        import assert from 'node:assert/strict';
        const mode = ${JSON.stringify(mode)};
        const errorMode = ['error-first', 'turn-failed-first', 'callback-throws', 'generic-error-recovery', 'error-only', 'error-nonzero-exit', 'error-401', 'error-403'].includes(mode);
        const ordinary = ${JSON.stringify(ordinary ?? null)};
        const terminalItem = ${JSON.stringify(terminalItem ?? null)};
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
        export function validateContainerInput() {}
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
              const error = {
                type: 'error', message: privateMarker,
                ...(mode === 'error-401' ? { status_code: 401 } : {}),
                ...(mode === 'error-403' ? { message: 'HTTP status: 403 ' + privateMarker } : {}),
              };
              const failed = { type: 'turn.failed', error: { message: privateMarker } };
              const records = [
                { type: 'thread.started', thread_id: 'inert-fixture' },
                { type: 'turn.started' },
                ...(ordinary
                  ? [
                      { type: 'item.completed', item: { id: 'cmd-1', type: 'command_execution', command: 'node --test', aggregated_output: 'synthetic red test', ...ordinary } },
                      { type: 'item.completed', item: { id: 'cmd-2', type: 'command_execution', command: 'node --test', aggregated_output: 'synthetic recovered test', exit_code: 0, status: 'completed' } },
                    ]
                  : terminalItem
                  ? [{ type: 'item.completed', item: terminalItem }]
                  : errorMode
                  ? mode === 'turn-failed-first' ? [failed, error]
                    : ['error-first', 'callback-throws'].includes(mode) ? [error, failed]
                    : mode === 'error-only' ? [error]
                    : [error, { type: 'item.completed', item: { type: 'agent_message', text: 'offline completion after notification' } }]
                  : [{ type: 'item.completed', item: { type: 'agent_message', text: 'offline completion' } }]),
                ...(mode === 'error-only' ? [] : [{ type: 'turn.completed', usage: { input_tokens: 0, output_tokens: 0 } }]),
              ];
              const stdout = records.map(record => JSON.stringify(record)).join('\\n') + '\\n';
              command.onStdout(stdout, {
                stop() { fixtureState.stops++; },
                deadlineIn() {},
              });
              return { status: mode === 'error-nonzero-exit' ? 1 : 0, stdout, stderr: '', timedOut: false, spawnError: false };
            },
          };
        }
        export async function inspectContainedCodexProfile(input) {
          let checks = 0;
          if (mode === 'completed') {
            fixtureState.originalModes['seed.txt'] = 0o755;
            fixtureState.capturedMode = input.fileModes['seed.txt'];
          }
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
            'container/session',
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
        'error-401',
        'error-403',
      ].includes(mode);
      const genericError = [
        'generic-error-recovery',
        'error-only',
        'error-nonzero-exit',
      ].includes(mode);
      const observed: { record: Record<string, unknown>; stopped: boolean }[] =
        [];
      const fileModes = { 'seed.txt': 0o600 };
      Object.defineProperty(fileModes, 'seed.txt', { enumerable: false });
      fixtureState.originalModes = fileModes;
      const result = await module.runContainedCodexSession({
        binary: '/never-execute',
        binaryHash: 'a'.repeat(64),
        imageId: 'inert-fixture',
        workspace: path.join(root, 'project'),
        home: path.join(root, 'home'),
        files: { 'seed.txt': Buffer.from('seed') },
        fileModes,
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
      if (mode === 'completed') {
        assert.equal(fileModes['seed.txt'], 0o755);
        assert.equal(fixtureState.capturedMode, 0o600);
      }
      assert.equal(
        result.sourceUnchanged,
        ['tool-failure', 'validation-unavailable'].includes(mode) ? null : true,
      );
      assert.equal(
        result.pass,
        mode === 'completed' ||
          mode === 'generic-error-recovery' ||
          Boolean(ordinary),
      );
      assert.equal(result.parsed.completed, mode !== 'error-only');
      const terminal = observed.filter(({ record }) =>
        ['error', 'turn.failed'].includes(String(record.type)),
      );
      if (terminalFailure) {
        assert.deepEqual(
          terminal.map(({ record, stopped }) => ({
            type: record.type,
            stopped,
          })),
          mode === 'error-first'
            ? [
                { type: 'error', stopped: false },
                { type: 'turn.failed', stopped: true },
              ]
            : [
                {
                  type: mode === 'turn-failed-first' ? 'turn.failed' : 'error',
                  stopped: mode !== 'callback-throws',
                },
              ],
        );
        assert(fixtureState.stops >= 1);
        if (mode === 'error-401' || mode === 'error-403') {
          assert('diagnostics' in result.parsed);
          assert.equal(
            result.parsed.diagnostics.httpStatus?.value,
            mode === 'error-401' ? 401 : 403,
          );
        }
      } else if (genericError) {
        assert.equal(fixtureState.stops, 0);
        assert.deepEqual(
          observed.map(({ record }) => record.type),
          [
            'thread.started',
            'turn.started',
            'error',
            ...(mode === 'error-only'
              ? []
              : ['item.completed', 'turn.completed']),
          ],
        );
        assert.equal(terminal[0].stopped, false);
        assert.deepEqual(
          result.parsed.messages,
          mode === 'error-only'
            ? []
            : ['offline completion after notification'],
        );
        assert.equal(result.exitCode, mode === 'error-nonzero-exit' ? 1 : 0);
      } else if (terminalItem) {
        assert(fixtureState.stops >= 1);
        assert.deepEqual(
          observed.map(({ record }) => record.type),
          ['thread.started', 'turn.started'],
        );
      } else {
        assert.equal(terminal.length, 0);
        assert.equal(fixtureState.stops, 0);
        assert.deepEqual(
          observed.map(({ record }) => record.type),
          [
            'thread.started',
            'turn.started',
            'item.completed',
            ...(ordinary ? ['item.completed'] : []),
            'turn.completed',
          ],
        );
        if (ordinary) {
          assert.deepEqual(result.parsed.commands, [
            {
              toolUseId: 'cmd-1',
              command: 'node --test',
              output: 'synthetic red test',
              exitCode: ordinary.exit_code,
            },
            {
              toolUseId: 'cmd-2',
              command: 'node --test',
              output: 'synthetic recovered test',
              exitCode: 0,
            },
          ]);
          assert.deepEqual(
            observed
              .filter(({ record }) => record.type === 'item.completed')
              .map(({ record }) => record),
            [
              {
                type: 'item.completed',
                item: {
                  id: 'cmd-1',
                  type: 'command_execution',
                  command: 'node --test',
                  aggregated_output: 'synthetic red test',
                  exit_code: ordinary.exit_code,
                  status: ordinary.status,
                },
              },
              {
                type: 'item.completed',
                item: {
                  id: 'cmd-2',
                  type: 'command_execution',
                  command: 'node --test',
                  aggregated_output: 'synthetic recovered test',
                  exit_code: 0,
                  status: 'completed',
                },
              },
            ],
          );
        }
      }
      for (const { record } of terminal) {
        assert.deepEqual(
          record,
          result.parsed.records.find((parsed) => parsed.type === record.type),
        );
        assert.deepEqual(Object.keys(record).sort(), ['detailHash', 'type']);
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
