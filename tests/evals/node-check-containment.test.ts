import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { createProcessSupervisor } from '../../scripts/evals/process-supervisor.ts';
import { createNodeCheckContainment } from '../../scripts/evals/node-check-containment.ts';

for (const ending of ['exit', 'timeout', 'cancel'] as const)
  test(
    'contained Node checks leave no late marker after ' + ending,
    async (t) => {
      const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-no-fork-'));
      t.after(() => rm(root, { recursive: true, force: true }));
      const supervisor = createProcessSupervisor();
      t.after(() => supervisor.dispose());
      if (process.platform !== 'darwin') {
        await assert.rejects(createNodeCheckContainment(supervisor), {
          code: 'native-process-containment-unavailable',
        });
        return;
      }
      const containment = await createNodeCheckContainment(supervisor);
      const marker = path.join(root, 'late-effect');
      const script = path.join(root, 'check.cjs');
      const late = `setTimeout(()=>require('node:fs').writeFileSync(${JSON.stringify(marker)},'bad'),300);`;
      await writeFile(
        script,
        `
const assert=require('node:assert/strict'),{spawn}=require('node:child_process');
for(const detached of [false,true]) assert.throws(()=>spawn(process.execPath,['-e',${JSON.stringify(late)}],{detached,stdio:'ignore'}),{code:'ERR_ACCESS_DENIED'});
assert.throws(()=>new(require('node:worker_threads').Worker)(${JSON.stringify(late)},{eval:true}),{code:'ERR_ACCESS_DENIED'});
assert.throws(()=>process.dlopen({exports:{}},process.execPath),{code:'ERR_DLOPEN_DISABLED'});
for(const name of ['execve','execveSync']) if(typeof process[name]==='function') assert.throws(()=>process[name]('/usr/bin/true',['true'],{}),{code:'ERR_ACCESS_DENIED'});
console.log('attempts-denied');
${ending === 'exit' ? '' : late + 'setInterval(()=>{},1000);'}
`,
      );
      let denied = false;
      const result = await containment.run({
        testFiles: [script],
        cwd: root,
        env: {},
        timeoutMs: 2000,
        stdoutLimit: 65536,
        stderrLimit: 65536,
        onStdout(chunk, controls) {
          if (!chunk.includes('attempts-denied')) return;
          denied = true;
          if (ending === 'timeout') controls.deadlineIn(30);
          if (ending === 'cancel') supervisor.dispose();
        },
      });
      assert(denied, result.stderr);
      assert.equal(result.status, ending === 'exit' ? 0 : null);
      assert.equal(result.timedOut, ending === 'timeout');
      await delay(450);
      await assert.rejects(readFile(marker), { code: 'ENOENT' });
      if (ending === 'cancel') {
        const later = await containment.run({
          testFiles: [script],
          cwd: root,
          env: {},
          timeoutMs: 1000,
          stdoutLimit: 1024,
        });
        assert.equal(later.status, null);
        assert.equal(later.stdout, '');
      }
    },
  );

test(
  'contained checks reject runtime injection and relative/implicit test discovery',
  { skip: process.platform !== 'darwin' },
  async (t) => {
    const supervisor = createProcessSupervisor();
    t.after(() => supervisor.dispose());
    const containment = await createNodeCheckContainment(supervisor);
    for (const extra of [
      { testFiles: [] },
      { testFiles: ['check.cjs'] },
      { env: { NODE_OPTIONS: '--allow-child-process' } },
      { env: Object.create({ NODE_OPTIONS: '--allow-worker' }) },
      { env: Object.create({ OPENSSL_CONF: '/untrusted' }) },
      ...[
        'OPENSSL_CONF',
        'OPENSSL_ENGINES',
        'OPENSSL_MODULES',
        'NODE_ICU_DATA',
        'NODE_EXTRA_CA_CERTS',
        'NODE_TEST_CONTEXT',
        'DYLD_INSERT_LIBRARIES',
        'LD_PRELOAD',
      ].map((key) => ({ env: { [key]: '/untrusted' } })),
    ])
      assert.throws(
        () =>
          containment.run({
            testFiles: ['/not-launched.cjs'],
            cwd: os.tmpdir(),
            env: {},
            timeoutMs: 1000,
            stdoutLimit: 1024,
            ...extra,
          }),
        { code: 'invalid-contained-node-check' },
      );
  },
);

test(
  'a contained check cannot stop its supervisor and write past its deadline',
  { skip: process.platform !== 'darwin', timeout: 10000 },
  async (t) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-no-signal-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    const script = path.join(root, 'check.cjs'),
      go = path.join(root, 'go'),
      attempted = path.join(root, 'attempted'),
      pidFile = path.join(root, 'check-pid'),
      marker = path.join(root, 'late-effect');
    await writeFile(
      script,
      `const assert=require('node:assert/strict'),fs=require('node:fs');
fs.writeFileSync(${JSON.stringify(pidFile)},String(process.pid));
console.log('signal-ready');
const timer=setInterval(()=>{
  if(!fs.existsSync(${JSON.stringify(go)}))return;
  clearInterval(timer);
  fs.writeFileSync(${JSON.stringify(attempted)},'attempted');
  try{
    process.kill(process.ppid,'SIGSTOP');
    setTimeout(()=>{fs.writeFileSync(${JSON.stringify(marker)},'bad');process.exit(0)},300);
  }catch(error){assert.equal(error.code,'EPERM');console.log('signal-denied');}
},5);`,
    );
    // Isolate the supervisor: a regression must never stop the test runner itself.
    const host = spawn(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import {writeFileSync} from 'node:fs';
import {createProcessSupervisor} from ${JSON.stringify(new URL('../../scripts/evals/process-supervisor.ts', import.meta.url).href)};
import {createNodeCheckContainment} from ${JSON.stringify(new URL('../../scripts/evals/node-check-containment.ts', import.meta.url).href)};
const supervisor=createProcessSupervisor();
try{
  const containment=await createNodeCheckContainment(supervisor);
  let output='',armed=false;
  const result=await containment.run({
    testFiles:[${JSON.stringify(script)}],cwd:${JSON.stringify(root)},env:{},
    timeoutMs:2000,stdoutLimit:65536,stderrLimit:65536,
    onStdout(chunk,controls){
      output+=chunk;
      if(!armed&&output.includes('signal-ready')){
        armed=true;
        controls.deadlineIn(100);
        writeFileSync(${JSON.stringify(go)},'go');
      }
    }
  });
  console.log(JSON.stringify(result));
}finally{supervisor.dispose();}`,
      ],
      { env: {}, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let output = '',
      finished = false;
    host.stdout.on('data', (chunk) => (output += chunk));
    host.stderr.on('data', (chunk) => (output += chunk));
    const closed = new Promise<number | null>((resolve, reject) => {
      host.on('close', (code) => {
        finished = true;
        resolve(code);
      });
      host.on('error', reject);
    });
    try {
      let observed = false;
      for (let i = 0; i < 200 && !observed && !finished; i++) {
        observed = await readFile(attempted).then(
          () => true,
          () => false,
        );
        if (!observed) await delay(10);
      }
      if (!observed)
        observed = await readFile(attempted).then(
          () => true,
          () => false,
        );
      assert(observed, output);
      // The old policy lets the check stop its host, then write after 300 ms.
      await delay(450);
      host.kill('SIGCONT');
      const code = await Promise.race([
        closed,
        delay(2000, undefined, { ref: false }).then(() => {
          throw new Error('Isolated containment host did not exit.');
        }),
      ]);
      assert.equal(code, 0, output);
      await assert.rejects(readFile(marker), { code: 'ENOENT' });
      assert.match(output, /signal-denied/);
    } finally {
      host.kill('SIGCONT');
      host.kill('SIGKILL');
      const pid = Number(await readFile(pidFile, 'utf8').catch(() => ''));
      if (Number.isSafeInteger(pid) && pid > 0)
        try {
          process.kill(-pid, 'SIGKILL');
        } catch {
          /* The bounded check already exited. */
        }
      await closed.catch(() => {});
    }
  },
);
