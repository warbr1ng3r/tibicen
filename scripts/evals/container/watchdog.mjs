import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
if (
  args.length !== 1 ||
  !/^[1-9]\d{0,5}$/.test(args[0]) ||
  Number(args[0]) > 180000
) {
  console.error('tibicen-watchdog: expected one deadline in 1..180000 ms');
  process.exit(64);
}

if (process.pid !== 1 || process.getuid() !== 0 || process.getgid() !== 0) {
  console.error('tibicen-watchdog: requires root PID 1 inside its container');
  process.exit(78);
}
const status = readFileSync('/proc/self/status', 'utf8');
for (const [name, expected] of [
  ['CapInh', 0n],
  ['CapPrm', 192n],
  ['CapEff', 192n],
  ['CapBnd', 192n],
  ['CapAmb', 0n],
]) {
  const value = status.match(new RegExp(`^${name}:\\s+([0-9a-f]+)$`, 'm'))?.[1];
  if (value === undefined || BigInt(`0x${value}`) !== expected) {
    console.error('tibicen-watchdog: requires only SETUID/SETGID capabilities');
    process.exit(78);
  }
}
if (!/^NoNewPrivs:\s+1$/m.test(status)) {
  console.error('tibicen-watchdog: requires no-new-privileges');
  process.exit(78);
}

const finish = (code, reason) => {
  console.error(`tibicen-watchdog: ${reason}`);
  // PID 1 exit lets the kernel kill every descendant, including setsid children.
  process.exit(code);
};
setTimeout(() => finish(124, 'deadline'), Number(args[0]));
process.on('SIGTERM', () => finish(143, 'signal'));
process.on('SIGINT', () => finish(130, 'signal'));
process.stdin.on('end', () => finish(0, 'lease-eof'));
process.stdin.on('error', () => finish(70, 'lease-error'));
process.setgroups([]);
const child = spawn(
  '/usr/local/bin/codex',
  ['exec-server', '--listen', 'stdio://'],
  {
    uid: 1000,
    gid: 1000,
    env: {
      HOME: '/home/runner',
      CODEX_HOME: '/home/runner/.codex',
      TMPDIR: '/tmp',
      PATH: '/usr/local/bin:/usr/bin:/bin',
      LANG: 'C.UTF-8',
    },
    stdio: ['pipe', 'inherit', 'inherit'],
  },
);
child.on('error', () => finish(70, 'executor-error'));
child.on('exit', (code) => finish(code ?? 70, 'executor-exit'));
child.stdin.on('error', () => finish(70, 'executor-stdin-error'));
process.stdin.pipe(child.stdin);
