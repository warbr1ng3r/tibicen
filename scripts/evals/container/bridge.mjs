import { readFile } from 'node:fs/promises';
import { connect } from 'node:net';

// The outer owner retains the CID when Codex kills this launcher's process group.
const bytes = await readFile(process.argv[2]);
if (bytes.length > 8192) throw new Error('invalid-container-bridge-manifest');
const manifest = JSON.parse(bytes.toString());
if (
  typeof manifest.socketPath !== 'string' ||
  !manifest.socketPath.startsWith('/private/tmp/tibicen-io-') ||
  !manifest.socketPath.endsWith('/stdio.sock')
)
  throw new Error('invalid-container-bridge-socket');
const socket = connect(manifest.socketPath);
socket.on('connect', () => {
  process.stdin.pipe(socket);
  socket.pipe(process.stdout);
});
socket.on('error', () => {
  process.exitCode = 2;
  process.stdin.destroy();
});
socket.on('close', () => process.stdin.destroy());
