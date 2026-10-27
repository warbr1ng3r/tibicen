import { createInterface } from 'node:readline';

const input = createInterface({ input: process.stdin });
await input[Symbol.asyncIterator]().next();
process.stdout.write(
  JSON.stringify({ kind: 'ready' }) +
    '\n' +
    JSON.stringify({ kind: 'finished', status: 'pass' }) +
    '\n',
);
input.close();
process.stdin.destroy();
