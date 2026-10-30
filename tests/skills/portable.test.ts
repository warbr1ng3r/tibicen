import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const distribution = process.env.TIBICEN_PORTABLE_DIST;
const hash = (bytes: Uint8Array) =>
  createHash('sha256').update(bytes).digest('hex');

async function snapshot(root: string) {
  const files: Record<string, { hash: string; mode: number; mtime: string }> =
    {};
  async function walk(relative = '') {
    for (const entry of await readdir(path.join(root, relative), {
      withFileTypes: true,
    })) {
      const name = path.join(relative, entry.name);
      if (entry.isDirectory()) await walk(name);
      else {
        assert(entry.isFile(), `Unexpected non-regular fixture file: ${name}`);
        const filename = path.join(root, name);
        const info = await stat(filename, { bigint: true });
        files[name] = {
          hash: hash(await readFile(filename)),
          mode: Number(info.mode & 0o777n),
          mtime: info.mtimeNs.toString(),
        };
      }
    }
  }
  await walk();
  return files;
}

test(
  'unpacked standalone lifecycle on the actual platform and Node runtime',
  {
    skip:
      !distribution &&
      'Set TIBICEN_PORTABLE_DIST for the manual platform check.',
    timeout: 60_000,
  },
  async (t) => {
    assert(distribution);
    const base = await realpath(
      await mkdtemp(path.join(os.tmpdir(), 'tibicen-portable-')),
    );
    t.after(() => rm(base, { recursive: true, force: true }));
    const installed = path.join(base, 'installed');
    await mkdir(installed);
    for (const name of ['tibicen-init', 'tibicen-adopt', 'SHA256SUMS'])
      await cp(path.join(distribution, name), path.join(installed, name), {
        recursive: true,
      });
    const payload = await snapshot(installed);
    const inventory = (
      await readFile(path.join(installed, 'SHA256SUMS'), 'utf8')
    )
      .trim()
      .split('\n');
    assert(inventory.length > 50);
    assert.equal(Object.keys(payload).length, inventory.length + 1);
    for (const line of inventory) {
      const [expected, relative] = line.split('  ');
      assert.match(expected, /^[a-f0-9]{64}$/);
      assert.equal(
        hash(await readFile(path.join(installed, relative))),
        expected,
      );
    }
    t.diagnostic(
      JSON.stringify({
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        inventoryFiles: inventory.length,
        outsideCheckout: base,
        consent: 'Synthetic operator approval of exact owned fixture plans.',
      }),
    );

    for (const skill of ['tibicen-init', 'tibicen-adopt']) {
      await t.test(skill, async () => {
        const project = path.join(base, `${skill}-project`);
        const home = path.join(base, `${skill}-home`);
        const temporary = path.join(base, `${skill}-tmp`);
        const emptyPath = path.join(base, `${skill}-empty-path`);
        for (const directory of [project, home, temporary, emptyPath])
          await mkdir(directory);
        const environment: NodeJS.ProcessEnv = {
          HOME: home,
          USERPROFILE: home,
          TMPDIR: temporary,
          TMP: temporary,
          TEMP: temporary,
          PATH: emptyPath,
        };
        for (const name of ['SystemRoot', 'WINDIR'])
          if (process.env[name]) environment[name] = process.env[name];
        const cli = (args: string[], input?: unknown, expectedExit = 0) => {
          const result = spawnSync(
            process.execPath,
            [path.join(installed, skill, 'scripts/tibicen.ts'), ...args],
            {
              cwd: project,
              env: environment,
              encoding: 'utf8',
              input: input === undefined ? undefined : JSON.stringify(input),
              timeout: 15_000,
            },
          );
          assert.ifError(result.error);
          assert.equal(
            result.status,
            expectedExit,
            result.stderr || result.stdout,
          );
          return JSON.parse(result.stdout);
        };
        const metadata = JSON.parse(
          await readFile(path.join(installed, skill, 'package.json'), 'utf8'),
        );
        assert.deepEqual(cli(['version']), {
          version: metadata.version,
          schema: 1,
        });
        assert.equal(cli(['self-test']).status, 'passed');
        await writeFile(
          path.join(project, 'package.json'),
          '{"private":true,"type":"module"}\n',
        );
        await writeFile(
          path.join(project, 'app.js'),
          'export const add = (a, b) => a + b;\n',
        );
        await writeFile(
          path.join(project, 'app.test.js'),
          'import test from "node:test"; import assert from "node:assert/strict"; import {add} from "./app.js"; test("addition",()=>assert.equal(add(2,3),5));\n',
        );
        const owner = '# Owner decisions\nPreserve application files.\n';
        if (skill === 'tibicen-adopt')
          await writeFile(path.join(project, 'AGENTS.md'), owner);
        const protectedFiles = await snapshot(project);
        const homeBefore = await snapshot(home);
        cli(['scan']);
        const change = {
          path: 'AGENTS.md',
          managedBlock: { content: 'Run node --test app.test.js.\n' },
          reason: 'Minimal instructions for this owned standalone fixture.',
        };
        const proposal = cli(['proposal', '--input', '-'], {
          mode: skill === 'tibicen-init' ? 'init' : 'improve',
          changes: [change],
          commands: [
            {
              id: 'owned-test',
              kind: 'test',
              executable: process.execPath,
              argv: ['--test', 'app.test.js'],
              trusted: true,
            },
          ],
          checks: { profile: 'web', environmentReady: true },
          compat: { enabled: false },
        });
        assert.deepEqual(await snapshot(project), protectedFiles);
        assert.deepEqual(await snapshot(home), homeBefore);
        assert.equal(
          cli(
            ['apply', '--plan', '-', '--approve', '0'.repeat(64)],
            proposal,
            1,
          ).error.code,
          'consent-required',
        );
        assert.equal(
          cli(
            ['proposal', '--input', '-'],
            {
              mode: 'improve',
              changes: [
                {
                  path: 'app.js',
                  content: 'changed\n',
                  reason: 'Refuse an application edit.',
                },
              ],
            },
            1,
          ).error.code,
          'application-protected',
        );
        assert.deepEqual(await snapshot(project), protectedFiles);
        assert.deepEqual(await snapshot(home), homeBefore);
        // The test host approves only the exact plan for its own synthetic fixture.
        const applied = cli(
          ['apply', '--plan', '-', '--approve', proposal.digest],
          proposal,
        );
        assert.equal(applied.status, 'complete');
        assert.equal(applied.checks.infrastructure.status, 'passed');
        assert.equal(applied.manifest.tibicen.version, metadata.version);
        if (process.platform === 'win32') {
          assert.equal(applied.checks.verify.status, 'unverified');
          assert.equal(
            applied.checks.verify.reason,
            'process-tree-unavailable',
          );
        } else {
          assert.equal(applied.checks.verify.status, 'green');
          assert.equal(applied.checks.verify.firstAttempt, true);
        }
        const after = await snapshot(project);
        for (const [name, original] of Object.entries(protectedFiles))
          if (name !== 'AGENTS.md') assert.deepEqual(after[name], original);
        if (skill === 'tibicen-adopt')
          assert(
            (
              await readFile(path.join(project, 'AGENTS.md'), 'utf8')
            ).startsWith(owner),
          );
        const settledHome = await snapshot(home);
        const repeat = cli(['proposal', '--input', '-'], {
          mode: 'improve',
          changes: [change],
        });
        assert.deepEqual(repeat.proposal.changes, []);
        assert.equal(cli(['verify']).status, 'passed');
        assert.equal(cli(['status']).status, 'complete');
        assert.equal(cli(['report']).status, 'complete');
        assert.deepEqual(await snapshot(project), after);
        assert.deepEqual(await snapshot(home), settledHome);
      });
    }
    assert.deepEqual(await snapshot(installed), payload);
  },
);
