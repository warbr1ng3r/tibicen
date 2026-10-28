import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';

test('native caller reports rejected post-run validation as unverified', async (t) => {
  for (const mode of ['completed', 'tool-failure', 'validation-unavailable']) {
    await t.test(mode, async (t) => {
      const root = await realpath(await mkdtemp('/tmp/tibicen-caller-result-'));
      t.after(() => rm(root, { recursive: true, force: true }));
      const runner = path.join(root, 'scripts/evals/contained-codex.ts');
      const stubs = `
        import assert from 'node:assert/strict';
        const mode = ${JSON.stringify(mode)};
        export { assert };
        export const digest = () => 'a'.repeat(64);
        export const hashContent = digest;
        export const linuxCodeModeHost = 'unused';
        export const linuxCodeModeHash = 'unused';
        export const stageContainerCodeMode = () => { throw Error('Must not stage'); };
        export const readAccessOnlySubscriptionAuth = () => { throw Error('Must not read auth'); };
        export const accessOnlySubscriptionAuth = readAccessOnlySubscriptionAuth;
        export const validateContainerOutputSchema = value => value;
        export const generateContainerCodexHome = async () => ({
          argv: [], env: {}, validate: async () => {},
        });
        export const parseCodex = () => ({ started: true, completed: true });
        export function createProcessSupervisor() {
          const controller = new AbortController();
          return {
            signal: controller.signal, cancel: () => controller.abort(), dispose() {},
            async run() { return { status: 0, stdout: '', stderr: '', timedOut: false, spawnError: false }; },
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
            async stop() { finish(receipt); return receipt; },
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
      });
      assert.equal(result.sourceUnchanged, mode === 'completed' ? true : null);
      assert.equal(result.pass, mode === 'completed');
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
