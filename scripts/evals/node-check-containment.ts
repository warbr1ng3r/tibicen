import os from 'node:os';
import path from 'node:path';
import { assert } from '../core/contracts.ts';
import type { SupervisedCommand } from './process-supervisor.ts';
import { createProcessSupervisor } from './process-supervisor.ts';

export const nativeContainmentReason = 'native-process-containment-unavailable';

export function nativeContainmentPreflight() {
  return {
    status: 'blocked' as const,
    startupControlled: false,
    authProtected: false,
    processTreeControlled: false,
    isolation: 'controlled' as const,
    reason: nativeContainmentReason,
  };
}

const sandbox = '/usr/bin/sandbox-exec';
const policy =
  '(version 1)(allow default)(deny process-fork)(deny network*)(deny signal)';
const permissions = ['--permission', '--allow-fs-read=*', '--allow-fs-write=*'];
type Supervisor = ReturnType<typeof createProcessSupervisor>;

// This boundary prevents descendants, workers and addons; filesystem/network policy
// remains the caller's responsibility. It is not a sandbox for arbitrary native tools.
export async function createNodeCheckContainment(supervisor: Supervisor) {
  assert(
    process.platform === 'darwin',
    nativeContainmentReason,
    'Node checks require a verified macOS no-fork boundary.',
  );
  const base = {
    cwd: os.tmpdir(),
    env: { PATH: '/usr/bin:/bin' },
    timeoutMs: 3000,
    stdoutLimit: 4096,
    stderrLimit: 4096,
  };
  const launch = (executable: string, argv: string[]) =>
    supervisor.run({
      ...base,
      executable: sandbox,
      argv: ['-p', policy, executable, ...argv],
    });
  // Perl calls fork(2) directly: checking Node's API alone cannot verify OS denial.
  const fork = await launch('/usr/bin/perl', [
    '-e',
    'my $pid=fork();exit(defined($pid)?7:0)',
  ]);
  assert(
    fork.status === 0 && !fork.timedOut,
    nativeContainmentReason,
    'OS fork denial could not be verified.',
  );
  const node = await launch(process.execPath, [
    ...permissions,
    '--test-isolation=none',
    '-e',
    `const checks=[()=>require('node:child_process').spawn(process.execPath,['-e','']),()=>require('node:child_process').spawn(process.execPath,['-e',''],{detached:true}),()=>new(require('node:worker_threads').Worker)('',{eval:true}),()=>process.dlopen({exports:{}},process.execPath),...['execve','execveSync'].filter(name=>typeof process[name]==='function').map(name=>()=>process[name]('/usr/bin/true',['true'],{}))];for(const check of checks){try{check();process.exit(7)}catch(error){if(!['ERR_ACCESS_DENIED','ERR_DLOPEN_DISABLED'].includes(error.code))process.exit(8)}}console.log('contained');`,
  ]);
  assert(
    node.status === 0 && !node.timedOut && node.stdout.trim() === 'contained',
    nativeContainmentReason,
    'Node child, worker and addon denial could not be verified.',
  );
  const signal = await launch(process.execPath, [
    ...permissions,
    '-e',
    `try{process.kill(process.ppid,0);process.exit(7)}catch(error){if(error.code!=='EPERM')process.exit(8)}console.log('signal-denied');`,
  ]);
  assert(
    signal.status === 0 &&
      !signal.timedOut &&
      signal.stdout.trim() === 'signal-denied',
    nativeContainmentReason,
    'OS signal denial could not be verified.',
  );
  return {
    run(
      command: Omit<SupervisedCommand, 'executable' | 'argv'> & {
        testFiles: string[];
      },
    ) {
      const env: NodeJS.ProcessEnv = Object.create(null);
      // spawn includes inherited enumerable keys; validate the exact copied environment.
      for (const key in command.env) env[key] = command.env[key];
      assert(
        command.testFiles.length > 0 &&
          command.testFiles.every((file) => path.isAbsolute(file)) &&
          Object.keys(env).every(
            (key) => !/^(NODE_|OPENSSL_|DYLD_|LD_)/.test(key),
          ),
        'invalid-contained-node-check',
        'Use explicit absolute test files without runtime injection variables.',
      );
      const { testFiles, ...controls } = command;
      return supervisor.run({
        ...controls,
        env,
        executable: sandbox,
        argv: [
          '-p',
          policy,
          process.execPath,
          ...permissions,
          '--test',
          '--test-isolation=none',
          ...testFiles,
        ],
      });
    },
  };
}
